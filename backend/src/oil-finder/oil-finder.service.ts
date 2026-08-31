import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { OilFinderLookupConflict, OilFinderOilSpec } from '@prisma/client'

/**
 * Oil Finder — the two lookup paths over the imported staging dataset.
 *
 * Guarantees:
 *  - Never guesses. A MAJOR conflict (oilViscosity or oilSpecACEA differs)
 *    always returns the disambiguation response, never a picked spec.
 *  - A MINOR conflict (only oilSpecAPI naming / oilSpecOEM differs) is
 *    auto-resolved and flagged with `resolvedBy: 'minor-conflict-auto-resolve'`.
 *  - `source` and `confidence` ride along on every candidate so support can
 *    audit which dataset row a recommendation came from.
 */

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
      /** 'exact' = zero conflicts; 'minor-conflict-auto-resolve' = severity-gated auto-resolve. */
      resolvedBy: 'exact' | 'minor-conflict-auto-resolve'
      /** How many dataset rows back this spec (multi-source vehicles count N). */
      backingRows: number
      /** Candidate rows that produced this spec (transparency/audit). */
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
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


@Injectable()
export class OilFinderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * (a) Exact vehicle lookup — make/model[/engineCode].
   * Unambiguous by construction: rows are grouped by oil spec; if the dataset
   * disagrees with itself (e.g. two sources give different specs for the same
   * vehicle), that is a data bug and is FLAGGED as ambiguous — never picked.
   */
  async findByVehicle(make: string, model: string, engineCode?: string | null): Promise<OilFinderResult> {
    const where = {
      make: { equals: make.trim(), mode: 'insensitive' as const },
      model: { equals: model.trim(), mode: 'insensitive' as const },
      // null/undefined/'' = wildcard (engine code was optional in the dataset)
      ...(engineCode ? { engineCode: { equals: engineCode.trim(), mode: 'insensitive' as const } } : {}),
    }

    const rows = await this.prisma.oilFinderVehicle.findMany({
      where,
      include: { oilSpec: true },
      orderBy: [{ source: 'asc' }, { id: 'asc' }],
    })

    if (rows.length === 0) {
      return {
        status: 'not_found',
        message: `no oil spec found for ${where.make} ${where.model}${engineCode ? ` / ${engineCode.trim()}` : ''}`,
      }
    }

    const distinct = groupBySpec(rows)
    if (distinct.length === 1) {
      return {
        status: 'found',
        oilSpec: distinct[0].spec,
        resolvedBy: 'exact',
        backingRows: rows.length,
        candidates: toCandidates(rows),
      }
    }

    return {
      status: 'ambiguous',
      message: `ambiguous — ${distinct.length} distinct oil specs found for ${where.make} ${where.model}${engineCode ? ` / ${engineCode.trim()}` : ''}; dataset disagrees with itself`,
      candidates: toCandidates(rows),
    }
  }

  /**
   * (b) Characteristics lookup — (displacementCc, powerHp, fuelType), severity-gated.
   *
   *  - No conflict record → safe direct match.
   *  - MINOR conflict (API naming / OEM code only) → auto-resolve, flagged.
   *  - MAJOR conflict (viscosity or ACEA differs) → disambiguation response,
   *    NEVER a guessed spec.
   */
  async findByCharacteristics(displacementCc: number, powerHp: number, fuelType: string): Promise<OilFinderResult> {
    const fuel = normFuel(fuelType)
    const key = { displacementCc, powerHp, fuelType: fuel }

    const conflict = await this.prisma.oilFinderLookupConflict.findUnique({ where: { displacementCc_powerHp_fuelType: key } })
    const rows = await this.prisma.oilFinderVehicle.findMany({
      where: key,
      include: { oilSpec: true },
      orderBy: [{ source: 'asc' }, { id: 'asc' }],
    })

    if (!conflict) {
      if (rows.length === 0) {
        return {
          status: 'not_found',
          message: `no match found for ${displacementCc}cc / ${powerHp}hp / ${fuel}`,
        }
      }
      const distinct = groupBySpec(rows)
      if (distinct.length === 1) {
        return {
          status: 'found',
          oilSpec: distinct[0].spec,
          resolvedBy: 'exact',
          backingRows: rows.length,
          candidates: toCandidates(rows),
        }
      }
      // Should not happen: vehicles disagree but no conflict record exists.
      return {
        status: 'ambiguous',
        message: `data inconsistency — ${distinct.length} distinct oil specs for ${displacementCc}cc / ${powerHp}hp / ${fuel} but no lookup_conflicts record`,
        candidates: toCandidates(rows),
      }
    }

    if (conflict.highestSeverity === 'MINOR') {
      if (rows.length === 0) {
        return {
          status: 'not_found',
          message: `conflict record exists for ${displacementCc}cc / ${powerHp}hp / ${fuel} but no candidate vehicles — data inconsistency`,
        }
      }
      const distinct = groupBySpec(rows)
      return {
        status: 'found',
        oilSpec: distinct[0].spec,
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: rows.length,
        candidates: toCandidates(rows),
      }
    }

    // MAJOR (oilViscosity or oilSpecACEA differs) — never auto-resolve.
    return {
      status: 'ambiguous',
      message: 'ambiguous — needs make/model (major conflict: viscosity or ACEA differs across candidates)',
      candidates: toCandidates(rows),
    }
  }

  async getMakes(category?: string) {
    const isCv = category?.toLowerCase().includes('poids') || category?.toLowerCase().includes('commercial');
    try {
      const tecdocRows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT matchcode AS name, LOWER(REGEXP_REPLACE(matchcode, '[^a-zA-Z0-9]+', '-', 'g')) AS slug
        FROM tecdoc.manufacturers
        WHERE can_be_displayed = true ${isCv ? 'AND is_commercial_vehicle = true' : 'AND is_passenger_car = true'}
        ORDER BY matchcode ASC
      `);
      if (tecdocRows.length > 0) {
        return tecdocRows.map((r) => ({ slug: r.slug, name: r.name }));
      }
    } catch {
      // Fallback
    }

    const rows = await this.prisma.oilFinderVehicle.findMany({
      select: { make: true },
      distinct: ['make'],
      orderBy: { make: 'asc' },
    });
    return rows.map((r) => ({ slug: slugify(r.make), name: r.make }));
  }

  async getModels(makeName: string) {
    try {
      const tecdocRows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT m.description AS name, LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) AS slug
        FROM tecdoc.models m
        JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
        WHERE LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = $1
           OR LOWER(mfr.matchcode) = $1
        ORDER BY m.description ASC
      `, makeName.toLowerCase());
      if (tecdocRows.length > 0) {
        return tecdocRows.map((r) => ({ slug: r.slug, name: r.name }));
      }
    } catch {
      // Fallback
    }

    const rows = await this.prisma.oilFinderVehicle.findMany({
      where: { make: { equals: makeName.trim(), mode: 'insensitive' as const } },
      select: { model: true },
      distinct: ['model'],
      orderBy: { model: 'asc' },
    });
    return rows.map((r) => ({ slug: slugify(r.model), name: r.model }));
  }

  async getEngines(makeName: string, modelName: string) {
    try {
      const tecdocRows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT pc.description AS "engineCode", 
               NULLIF(SPLIT_PART(pc.date_from, '.', 2), '')::int AS "yearFrom",
               NULLIF(SPLIT_PART(pc.date_to, '.', 2), '')::int AS "yearTo"
        FROM tecdoc.passengercars pc
        JOIN tecdoc.models m ON m.id = pc.model_id
        WHERE LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) = $1
           OR LOWER(m.description) = $1
        ORDER BY pc.description ASC
      `, modelName.toLowerCase());
      if (tecdocRows.length > 0) {
        return tecdocRows;
      }
    } catch {
      // Fallback
    }

    const rows = await this.prisma.oilFinderVehicle.findMany({
      where: {
        make: { equals: makeName.trim(), mode: 'insensitive' as const },
        model: { equals: modelName.trim(), mode: 'insensitive' as const },
        engineCode: { not: '' },
      },
      select: { engineCode: true, yearFrom: true, yearTo: true },
      distinct: ['engineCode'],
      orderBy: { engineCode: 'asc' },
    });
    return rows;
  }
}

function groupBySpec(rows: Array<{ oilSpec: OilFinderOilSpec }>): Array<{ spec: OilSpecRef; count: number }> {
  const map = new Map<string, { spec: OilSpecRef; count: number }>()
  for (const row of rows) {
    const entry = map.get(row.oilSpec.id) ?? { spec: row.oilSpec, count: 0 }
    entry.count += 1
    map.set(row.oilSpec.id, entry)
  }
  return [...map.values()].sort((a, b) => a.spec.id.localeCompare(b.spec.id))
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
