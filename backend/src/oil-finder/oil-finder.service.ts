import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { OilFinderLookupConflict, OilFinderOilSpec } from '@prisma/client'

export type OilSpecRef = Pick<
  OilFinderOilSpec,
  'id' | 'viscosity' | 'apiStandard' | 'aceaStandard' | 'oemApproval' | 'capacityLiters' | 'changeIntervalKm'
>

export interface OilFinderCandidate {
  make: string
  model: string
  generation: string
  yearFrom: number | null
  yearTo: number | null
  engineCode: string
  displacementCc: number | null
  powerKw: number | null
  powerHp: number | null
  fuelType: string
  source: string
  confidence: string
  matchAmbiguity: unknown
  oilSpec: OilSpecRef
}

export type OilFinderResult =
  | {
      status: 'found'
      oilSpec: OilSpecRef
      resolvedBy: 'exact' | 'minor-conflict-auto-resolve'
      confidence: 'high' | 'medium'
      backingRows: number
      candidates: OilFinderCandidate[]
    }
  | {
      status: 'ambiguous'
      message: string
      candidates: OilFinderCandidate[]
    }
  | {
      status: 'not_found'
      message: string
    }

const normFuel = (fuelType: string): string => fuelType.trim().toLowerCase()

function slugify(text: string): string {
  return text
    .toLowerCase()
    // Normalize accented characters (é→e, ë→e, ü→u, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace non-alphanumeric (including parens, slashes, etc.) with dash
    .replace(/[^a-z0-9]+/g, '-')
    // Trim leading/trailing dashes
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class OilFinderService {
  private readonly logger = new Logger(OilFinderService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findByVehicle(make: string, model: string, engineCode?: string | null): Promise<OilFinderResult> {
    const makeNorm = make.trim().toUpperCase();
    const modelNorm = model.trim().toUpperCase();
    const eUpper = (engineCode || '').toUpperCase();

    // 1. Try DB lookup first (exact/insensitive match on the raw name)
    const where = {
      make: { equals: make.trim(), mode: 'insensitive' as const },
      model: { equals: model.trim(), mode: 'insensitive' as const },
      ...(engineCode ? { engineCode: { equals: engineCode.trim(), mode: 'insensitive' as const } } : {}),
    };

    let rows = await this.prisma.oilFinderVehicle.findMany({
      where,
      include: { oilSpec: true },
      orderBy: [{ source: 'asc' }, { id: 'asc' }],
    }).catch(() => []);

    // 1b. If nothing found and the input looks like a slug (all lowercase/dashes),
    //     try to find by slugified make+model (handles citroen → CITROËN, etc.)
    if (rows.length === 0) {
      const makeSlug = slugify(make.trim());
      const modelSlug = slugify(model.trim());
      const allRows = await this.prisma.oilFinderVehicle.findMany({
        select: { make: true, model: true },
        distinct: ['make', 'model'],
      }).catch(() => [] as { make: string; model: string }[]);
      const match = allRows.find(r =>
        slugify(r.make) === makeSlug && slugify(r.model) === modelSlug
      );
      if (match) {
        rows = await this.prisma.oilFinderVehicle.findMany({
          where: {
            make: { equals: match.make, mode: 'insensitive' as const },
            model: { equals: match.model, mode: 'insensitive' as const },
            ...(engineCode ? { engineCode: { equals: engineCode.trim(), mode: 'insensitive' as const } } : {}),
          },
          include: { oilSpec: true },
          orderBy: [{ source: 'asc' }, { id: 'asc' }],
        }).catch(() => []);
      }
    }

    if (rows.length > 0) {
      const distinct = groupBySpec(rows);
      return {
        status: 'found',
        oilSpec: distinct[0].spec,
        resolvedBy: distinct.length === 1 ? 'exact' : 'minor-conflict-auto-resolve',
        confidence: distinct.length === 1 ? 'high' : 'medium',
        backingRows: rows.length,
        candidates: toCandidates(rows),
      };
    }

    // 2. Dynamic TecDoc-based category detection for informative user messaging
    let isTruck = false;
    let isMoto = false;
    let isEngineCategory = false;
    let isPassengerCar = false;

    try {
      const tecdocInfo: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT 
          COALESCE(m.is_commercial_vehicle, mfr.is_commercial_vehicle, false) AS is_truck,
          COALESCE(m.is_motorbike, mfr.is_motorbike, false) AS is_moto,
          COALESCE(m.is_engine, mfr.is_engine, false) AS is_engine,
          COALESCE(m.is_passenger_car, mfr.is_passenger_car, false) AS is_car,
          COALESCE(m.is_transporter, mfr.is_transporter, false) AS is_van
        FROM tecdoc.models m
        JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
        WHERE (
          LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = $1
          OR LOWER(mfr.matchcode) = $1
          OR LOWER(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode)) = $1
          OR LOWER(REGEXP_REPLACE(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = $1
        )
        AND (
          LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) = $2
          OR LOWER(m.description) = $2
          OR $2 ILIKE '%' || LOWER(m.description) || '%'
          OR LOWER(m.description) ILIKE '%' || $2 || '%'
        )
        LIMIT 1
      `, slugify(make), slugify(model));

      if (tecdocInfo.length > 0) {
        const r = tecdocInfo[0];
        isTruck = Boolean(r.is_truck || r.is_van);
        isMoto = Boolean(r.is_moto);
        isEngineCategory = Boolean(r.is_engine);
        isPassengerCar = Boolean(r.is_car);
      } else {
        const mfrRows: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT is_commercial_vehicle, is_motorbike, is_engine, is_passenger_car, is_transporter
          FROM tecdoc.manufacturers
          WHERE LOWER(REGEXP_REPLACE(matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = $1
             OR LOWER(matchcode) = $1
             OR LOWER(COALESCE(NULLIF(description, ''), matchcode)) = $1
             OR LOWER(REGEXP_REPLACE(COALESCE(NULLIF(description, ''), matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = $1
          LIMIT 1
        `, slugify(make));
        if (mfrRows.length > 0) {
          const m = mfrRows[0];
          isTruck = Boolean(m.is_commercial_vehicle || m.is_transporter);
          isMoto = Boolean(m.is_motorbike);
          isEngineCategory = Boolean(m.is_engine);
          isPassengerCar = Boolean(m.is_passenger_car);
        }
      }
    } catch (err) {
      this.logger.error(`Error querying TecDoc classification for ${make} ${model}`, err);
    }

    const isMarine = isEngineCategory && (
      makeNorm.includes('MARINE') || makeNorm.includes('PENTA') || makeNorm.includes('YANMAR') || makeNorm.includes('MERCURY') ||
      modelNorm.includes('BOAT') || modelNorm.includes('BATEAU') || modelNorm.includes('HORS-BORD') || modelNorm.includes('OUTBOARD') ||
      modelNorm.includes('INBOARD') || eUpper.includes('MARINE')
    ) || makeNorm.includes('MARINE') || makeNorm.includes('BATEAU');

    const isAgri = (isEngineCategory || isTruck) && (
      makeNorm.includes('AGRI') || makeNorm.includes('TRACT') || modelNorm.includes('TRACT') ||
      ['DEUTZ', 'FENDT', 'CLAAS', 'KUBOTA', 'VALTRA', 'SAME', 'STEYR', 'LANDINI', 'MCCORMICK', 'AGCO', 'JOHN DEERE', 'MASSEY'].some(m => makeNorm.includes(m))
    ) || makeNorm.includes('TRACTEUR') || makeNorm.includes('TRACTOR');

    if (isMoto) {
      return {
        status: 'not_found',
        message: `Véhicule détecté comme moto / 2-roues (${make} ${model}), aucune spécification d'huile homologuée n'est enregistrée dans la base.`,
      };
    }

    if (isMarine) {
      return {
        status: 'not_found',
        message: `Moteur détecté comme marin (${make} ${model}), aucune spécification d'huile homologuée n'est enregistrée dans la base.`,
      };
    }

    if (isAgri) {
      return {
        status: 'not_found',
        message: `Véhicule détecté comme engin agricole / tracteur (${make} ${model}), aucune spécification d'huile homologuée n'est enregistrée dans la base.`,
      };
    }

    if (isTruck) {
      return {
        status: 'not_found',
        message: `Véhicule détecté comme poids lourd / utilitaire (${make} ${model}), aucune spécification d'huile homologuée n'est enregistrée dans la base.`,
      };
    }

    if (isPassengerCar) {
      return {
        status: 'not_found',
        message: `Véhicule détecté comme automobile (${make} ${model}), aucune spécification d'huile homologuée n'est enregistrée dans la base.`,
      };
    }

    return {
      status: 'not_found',
      message: `Aucune spécification d'huile trouvée pour ${make} ${model}${engineCode ? ` (${engineCode})` : ''} dans la base de données.`,
    };
  }

  async findByCharacteristics(displacementCc: number, powerHp: number, fuelType: string): Promise<OilFinderResult> {
    const fuel = normFuel(fuelType);
    const key = { displacementCc, powerHp, fuelType: fuel };

    const rows = await this.prisma.oilFinderVehicle.findMany({
      where: key,
      include: { oilSpec: true },
      orderBy: [{ source: 'asc' }, { id: 'asc' }],
    }).catch(() => []);

    if (rows.length > 0) {
      const distinct = groupBySpec(rows);
      return {
        status: 'found',
        oilSpec: distinct[0].spec,
        resolvedBy: distinct.length === 1 ? 'exact' : 'minor-conflict-auto-resolve',
        confidence: distinct.length === 1 ? 'high' : 'medium',
        backingRows: rows.length,
        candidates: toCandidates(rows),
      };
    }

    return {
      status: 'not_found',
      message: `Aucune spécification d'huile trouvée pour les caractéristiques: ${displacementCc}cm³, ${powerHp}ch, ${fuel}.`,
    };
  }

  async getMakes(category?: string) {
    const cat = category?.toLowerCase().trim() || 'auto';
    const isMoto = cat.includes('moto') || cat.includes('karting') || cat.includes('2-roues') || cat.includes('scooter');
    const isAgri = cat.includes('agri') || cat.includes('tractor') || cat.includes('tracteur');
    const isCv = !isAgri && (cat.includes('poids') || cat.includes('commercial') || cat.includes('heavy') || cat.includes('truck') || cat.includes('camion'));
    const isMarine = cat.includes('marine') || cat.includes('boat') || cat.includes('bateau');

    let whereClause = 'mfr.can_be_displayed = true';
    if (isMoto) {
      whereClause += ' AND mfr.is_motorbike = true';
    } else if (isCv) {
      whereClause += ' AND (mfr.is_commercial_vehicle = true OR mfr.is_transporter = true)';
    } else if (isAgri) {
      whereClause += ' AND (mfr.is_commercial_vehicle = true OR mfr.is_engine = true)';
    } else if (isMarine) {
      whereClause += ' AND (mfr.is_engine = true OR mfr.is_commercial_vehicle = true)';
    } else {
      whereClause += ' AND mfr.is_passenger_car = true';
    }

    try {
      const tecdocRows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT COALESCE(NULLIF(mfr.description, ''), mfr.matchcode) AS name
        FROM tecdoc.manufacturers mfr
        WHERE ${whereClause}
        ORDER BY name ASC
      `);
      if (tecdocRows.length > 0) {
        return tecdocRows.map((r) => ({ slug: slugify(r.name), name: r.name }));
      }
    } catch (e) {
      this.logger.error('Error fetching makes from TecDoc', e);
    }

    try {
      const rows = await this.prisma.oilFinderVehicle?.findMany?.({
        select: { make: true },
        distinct: ['make'],
        orderBy: { make: 'asc' },
      });
      if (rows && rows.length > 0) {
        return rows.map((r) => ({ slug: slugify(r.make), name: r.make }));
      }
    } catch {
      // ignore
    }

    return [];
  }

  async getModels(makeName: string) {
    try {
      const tecdocRows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT m.description AS name, LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) AS slug
        FROM tecdoc.models m
        JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
        WHERE m.can_be_displayed = true
          AND (
            LOWER(REGEXP_REPLACE(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = $1
            OR LOWER(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode)) = $1
            OR LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = $1
            OR LOWER(mfr.matchcode) = $1
          )
        ORDER BY m.description ASC
      `, makeName.toLowerCase().trim());
      if (tecdocRows.length > 0) {
        return tecdocRows.map((r) => ({ slug: r.slug, name: r.name }));
      }
    } catch (e) {
      this.logger.error(`Error fetching models from TecDoc for make: ${makeName}`, e);
    }

    try {
      const rows = await this.prisma.oilFinderVehicle?.findMany?.({
        where: { make: { equals: makeName.trim(), mode: 'insensitive' as const } },
        select: { model: true },
        distinct: ['model'],
        orderBy: { model: 'asc' },
      });
      if (rows && rows.length > 0) {
        return rows.map((r) => ({ slug: slugify(r.model), name: r.model }));
      }
    } catch {
      // ignore
    }

    return [];
  }

  async getEngines(makeName: string, modelName: string) {
    const makeNorm = makeName.trim().toLowerCase();
    const modelNorm = modelName.trim().toLowerCase();

    // 1. Query tecdoc.passengercars joined with tecdoc.models and tecdoc.manufacturers
    try {
      const tecdocPassCars: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT 
          COALESCE(NULLIF(pc.full_description, ''), pc.description) AS "engineCode",
          CASE 
            WHEN pc.date_from::text ~ '^[12]\\d{3}' THEN SUBSTRING(pc.date_from::text, 1, 4)::int
            WHEN pc.date_from::text ~ '\\d{4}$' THEN SUBSTRING(pc.date_from::text, LENGTH(pc.date_from::text)-3, 4)::int
            ELSE NULL 
          END AS "yearFrom",
          CASE 
            WHEN pc.date_to::text ~ '^[12]\\d{3}' AND SUBSTRING(pc.date_to::text, 1, 4) != '0000' THEN SUBSTRING(pc.date_to::text, 1, 4)::int
            WHEN pc.date_to::text ~ '\\d{4}$' AND SUBSTRING(pc.date_to::text, LENGTH(pc.date_to::text)-3, 4) != '0000' THEN SUBSTRING(pc.date_to::text, LENGTH(pc.date_to::text)-3, 4)::int
            ELSE NULL 
          END AS "yearTo"
        FROM tecdoc.passengercars pc
        JOIN tecdoc.models m ON m.id = pc.model_id
        JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
        WHERE pc.can_be_displayed = true
          AND (
            LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) = $1
            OR LOWER(m.description) = $1
            OR $1 ILIKE '%' || LOWER(m.description) || '%'
            OR LOWER(m.description) ILIKE '%' || $1 || '%'
          )
          AND (
            LOWER(REGEXP_REPLACE(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = $2
            OR LOWER(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode)) = $2
            OR LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = $2
            OR LOWER(mfr.matchcode) = $2
          )
        ORDER BY "engineCode" ASC
      `, modelNorm, makeNorm);

      if (tecdocPassCars.length > 0) {
        return tecdocPassCars;
      }
    } catch (e) {
      this.logger.error(`Error fetching passenger car engines from TecDoc for ${makeName} ${modelName}`, e);
    }

    // 2. Query tecdoc.engines for this manufacturer (covers commercial vehicles, marine, industrial, motorbikes)
    try {
      const tecdocEngines: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT
          COALESCE(NULLIF(e.sales_description, ''), e.description) AS "engineCode",
          CASE 
            WHEN e.date_from::text ~ '^[12]\\d{3}' THEN SUBSTRING(e.date_from::text, 1, 4)::int
            ELSE NULL 
          END AS "yearFrom",
          CASE 
            WHEN e.date_to::text ~ '^[12]\\d{3}' AND SUBSTRING(e.date_to::text, 1, 4) != '0000' THEN SUBSTRING(e.date_to::text, 1, 4)::int
            ELSE NULL 
          END AS "yearTo"
        FROM tecdoc.engines e
        JOIN tecdoc.manufacturers mfr ON mfr.id = e.manufacturer
        WHERE e.can_be_displayed = true
          AND (
            LOWER(REGEXP_REPLACE(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = $1
            OR LOWER(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode)) = $1
            OR LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = $1
            OR LOWER(mfr.matchcode) = $1
          )
        ORDER BY "engineCode" ASC
        LIMIT 50
      `, makeNorm);

      if (tecdocEngines.length > 0) {
        return tecdocEngines;
      }
    } catch (e) {
      this.logger.error(`Error fetching engines from TecDoc for manufacturer ${makeName}`, e);
    }

    // 3. Fallback to oilFinderVehicle table in DB if populated
    const rows = await this.prisma.oilFinderVehicle.findMany({
      where: {
        make: { equals: makeName.trim(), mode: 'insensitive' as const },
        model: { equals: modelName.trim(), mode: 'insensitive' as const },
        engineCode: { not: '' },
      },
      select: { engineCode: true, yearFrom: true, yearTo: true },
      distinct: ['engineCode'],
      orderBy: { engineCode: 'asc' },
    }).catch(() => []);
    if (rows.length > 0) return rows;

    // 4. Return the model from tecdoc.models as the standard engine configuration
    try {
      const modelRow: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT 
          m.description || ' (Moteur d''origine)' AS "engineCode",
          CASE WHEN m.date_from::text ~ '^[12]\\d{3}' THEN SUBSTRING(m.date_from::text, 1, 4)::int ELSE NULL END AS "yearFrom",
          CASE WHEN m.date_to::text ~ '^[12]\\d{3}' AND SUBSTRING(m.date_to::text, 1, 4) != '0000' THEN SUBSTRING(m.date_to::text, 1, 4)::int ELSE NULL END AS "yearTo"
        FROM tecdoc.models m
        WHERE (
          LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) = $1
          OR LOWER(m.description) = $1
          OR $1 ILIKE '%' || LOWER(m.description) || '%'
          OR LOWER(m.description) ILIKE '%' || $1 || '%'
        )
        LIMIT 1
      `, modelNorm);

      if (modelRow.length > 0) {
        return modelRow;
      }
    } catch {
      // ignore
    }

    return [];
  }
}

function groupBySpec(rows: Array<{ oilSpec: OilFinderOilSpec }>): Array<{ spec: OilSpecRef; count: number }> {
  const map = new Map<string, { spec: OilSpecRef; count: number }>()
  for (const row of rows) {
    const entry = map.get(row.oilSpec.id) ?? { spec: row.oilSpec, count: 0 }
    entry.count += 1
    map.set(row.oilSpec.id, entry)
  }
  return [...map.values()].sort((a, b) => {
    // Most-supported spec wins. Tie-break on id for stable, deterministic output.
    if (b.count !== a.count) return b.count - a.count
    return a.spec.id.localeCompare(b.spec.id)
  })
}

function toCandidates(rows: Array<OilFinderCandidate>): OilFinderCandidate[] {
  return rows.map((r) => ({
    make: r.make,
    model: r.model,
    generation: r.generation,
    yearFrom: r.yearFrom,
    yearTo: r.yearTo,
    engineCode: r.engineCode,
    displacementCc: r.displacementCc,
    powerKw: r.powerKw,
    powerHp: r.powerHp,
    fuelType: r.fuelType,
    source: r.source,
    confidence: r.confidence,
    matchAmbiguity: r.matchAmbiguity,
    oilSpec: r.oilSpec,
  }))
}
