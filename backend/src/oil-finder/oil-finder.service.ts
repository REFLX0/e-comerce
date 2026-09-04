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
      resolvedBy: 'exact' | 'minor-conflict-auto-resolve' | 'category-default'
      confidence: 'high' | 'medium' | 'low'
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

    // 2. Fetch category and production years dynamically from TecDoc
    let isTruck = false;
    let isMoto = false;
    let isEngineCategory = false;
    let isPassengerCar = false;
    let tecdocEndYear: number | null = null;

    try {
      const tecdocInfo: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT 
          COALESCE(m.is_commercial_vehicle, mfr.is_commercial_vehicle, false) AS is_truck,
          COALESCE(m.is_motorbike, mfr.is_motorbike, false) AS is_moto,
          COALESCE(m.is_engine, mfr.is_engine, false) AS is_engine,
          COALESCE(m.is_passenger_car, mfr.is_passenger_car, false) AS is_car,
          COALESCE(m.is_transporter, mfr.is_transporter, false) AS is_van,
          m.date_from,
          m.date_to
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

        if (r.date_to && typeof r.date_to === 'string' && r.date_to !== '0000-00-00') {
          const matchYear = r.date_to.match(/^([12]\d{3})/);
          if (matchYear) {
            tecdocEndYear = parseInt(matchYear[1], 10);
          }
        }
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

    // Additional contextual checks for Marine or Agriculture
    const isMarine = isEngineCategory && (
      makeNorm.includes('MARINE') || makeNorm.includes('PENTA') || makeNorm.includes('YANMAR') || makeNorm.includes('MERCURY') ||
      modelNorm.includes('BOAT') || modelNorm.includes('BATEAU') || modelNorm.includes('HORS-BORD') || modelNorm.includes('OUTBOARD') ||
      modelNorm.includes('INBOARD') || eUpper.includes('MARINE')
    ) || makeNorm.includes('MARINE') || makeNorm.includes('BATEAU');

    const isAgri = (isEngineCategory || isTruck) && (
      makeNorm.includes('AGRI') || makeNorm.includes('TRACT') || modelNorm.includes('TRACT') ||
      ['DEUTZ', 'FENDT', 'CLAAS', 'KUBOTA', 'VALTRA', 'SAME', 'STEYR', 'LANDINI', 'MCCORMICK', 'AGCO', 'JOHN DEERE', 'MASSEY'].some(m => makeNorm.includes(m))
    ) || makeNorm.includes('TRACTEUR') || makeNorm.includes('TRACTOR');

    // 2. Specialized Category Recommendations
    if (isMoto) {
      const is2T = (modelNorm.includes('50') && (modelNorm.includes('ZIP') || modelNorm.includes('AEROX') || modelNorm.includes('BW') || modelNorm.includes('TYPHOON') || modelNorm.includes('EXC 300'))) || eUpper.includes('2T') || eUpper.includes('2-TEMPS');
      if (is2T) {
        return {
          status: 'found',
          oilSpec: {
            id: 'spec-moto-2t-synthetic',
            viscosity: '2T',
            apiStandard: 'API TC',
            aceaStandard: 'JASO FD / ISO-L-EGD',
            oemApproval: '2-Stroke High Performance Synthetic Injection & Pre-mix',
            capacityLiters: 1.0,
            changeIntervalKm: 3000,
          },
          resolvedBy: 'category-default',
          confidence: 'medium',
          backingRows: 0,
          candidates: [],
        };
      }

      const isHighPerf = makeNorm.includes('DUCATI') || makeNorm.includes('KTM') || modelNorm.includes('R1') || modelNorm.includes('CBR 1000') || modelNorm.includes('ZX-10R') || modelNorm.includes('S 1000') || modelNorm.includes('PANIGALE');
      const viscosity = isHighPerf ? '10W-50' : '10W-40';

      return {
        status: 'found',
        oilSpec: {
          id: `spec-moto-4t-${viscosity.toLowerCase()}`,
          viscosity,
          apiStandard: 'API SN / SM / SL',
          aceaStandard: 'JASO MA2',
          oemApproval: 'JASO T 903:2016 MA2 (Embrayage à bain d\'huile)',
          capacityLiters: modelNorm.includes('T-MAX') || modelNorm.includes('500') || modelNorm.includes('600') ? 2.9 : 1.2,
          changeIntervalKm: 5000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    if (isTruck) {
      const isVintageTruck = (tecdocEndYear !== null && tecdocEndYear <= 2006) || eUpper.includes('15W') || eUpper.includes('EURO 3') || eUpper.includes('EURO 2') || modelNorm.includes('PREMIUM') || modelNorm.includes('MAGNUM');
      return {
        status: 'found',
        oilSpec: {
          id: isVintageTruck ? 'spec-truck-heavy-15w40' : 'spec-truck-heavy-10w40',
          viscosity: isVintageTruck ? '15W-40' : '10W-40',
          apiStandard: 'API CK-4 / CJ-4',
          aceaStandard: isVintageTruck ? 'ACEA E7' : 'ACEA E6 / E9 / E7',
          oemApproval: isVintageTruck ? 'MB 228.3, Volvo VDS-3, MAN M 3275, Scania LDF-2' : 'Scania Low Ash (LDF-4 / LA), MB 228.51, MAN M 3477, Volvo VDS-4.5',
          capacityLiters: 32.0,
          changeIntervalKm: 40000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    if (isMarine) {
      const is2TMarine = eUpper.includes('2-TEMPS') || eUpper.includes('2T') || eUpper.includes('TC-W3') || modelNorm.includes('2T');
      if (is2TMarine) {
        return {
          status: 'found',
          oilSpec: {
            id: 'spec-marine-tc-w3-2t',
            viscosity: '2T',
            apiStandard: 'NMMA TC-W3',
            aceaStandard: 'NMMA TC-W3 Certified (Outboard)',
            oemApproval: 'Yamaha / Mercury / Evinrude 2-Stroke Outboard Approved',
            capacityLiters: 2.0,
            changeIntervalKm: 5000,
          },
          resolvedBy: 'category-default',
          confidence: 'medium',
          backingRows: 0,
          candidates: [],
        };
      }

      return {
        status: 'found',
        oilSpec: {
          id: 'spec-marine-fc-w-10w40',
          viscosity: '10W-40',
          apiStandard: 'API SL / SJ',
          aceaStandard: 'NMMA FC-W Catalyst Compatible',
          oemApproval: 'Marine Outboard & Inboard Certified (Mercury, Yamaha, Volvo Penta)',
          capacityLiters: 5.5,
          changeIntervalKm: 10000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    if (isAgri) {
      const isUtto = eUpper.includes('TRANSMISSION') || eUpper.includes('HYDRAULIQUE') || eUpper.includes('UTTO') || eUpper.includes('PONT');
      if (isUtto) {
        return {
          status: 'found',
          oilSpec: {
            id: 'spec-agri-utto-10w30',
            viscosity: '10W-30',
            apiStandard: 'API GL-4',
            aceaStandard: 'UTTO Multifonction (Freins immergés)',
            oemApproval: 'John Deere J20C, Massey Ferguson CMS M1145, Ford M2C134-D, Case MS 1207/1209',
            capacityLiters: 45.0,
            changeIntervalKm: 15000,
          },
          resolvedBy: 'category-default',
          confidence: 'medium',
          backingRows: 0,
          candidates: [],
        };
      }

      return {
        status: 'found',
        oilSpec: {
          id: 'spec-agri-heavy-15w40',
          viscosity: '15W-40',
          apiStandard: 'API CK-4 / CJ-4 / CI-4',
          aceaStandard: 'ACEA E9 / E7',
          oemApproval: 'John Deere Plus-50 II, Deutz DQC III-10 LA, CNH MAT 3521, Case MS 1121',
          capacityLiters: 22.0,
          changeIntervalKm: 20000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    // 3. Intelligent Constructor OEM Matching for Passenger Cars (Year-Aware & Fuel-Aware)
    const isDiesel = eUpper.includes('TDI') || eUpper.includes('DCI') || eUpper.includes('HDI') || eUpper.includes('CDI') || eUpper.includes('CRDI') || eUpper.includes('D-4D') || eUpper.includes('MULTIJET') || eUpper.includes('TD') || eUpper.includes('DIESEL') || eUpper.includes('JTD');
    
    // Detect older vehicles (pre-2007 without DPF/FAP) vs modern vehicles (2008+ with DPF/Euro 5/Euro 6)
    const modelClean = modelNorm.replace(/[-_]+/g, ' ');
    const yearMatches = `${modelClean} ${engineCode || ''}`.match(/(\d{4})/g);
    const endYear = yearMatches && yearMatches.length > 1 ? parseInt(yearMatches[1], 10) : (yearMatches ? parseInt(yearMatches[0], 10) : null);
    
    const VINTAGE_REGEXES = [
      /\b(SAXO|106|205|206|306|309|405|406|605|806|XSARA|XANTIA|ZX|AX|C15)\b/i,
      /\b(CLIO\s*(I\b|1\b|II\b|2\b)|MEGANE\s*(I\b|1\b)|LAGUNA\s*(I\b|1\b)|TWINGO\s*(I\b|1\b)|SUPER\s*5|EXPRESS|R19|R21)\b/i,
      /\b(GOLF\s*(I\b|1\b|II\b|2\b|III\b|3\b|IV\b|4\b)|VENTO|BORA|PASSAT\s*(B3|B4|B5)|POLO\s*(6N|3|III))\b/i,
      /\b(PUNTO\s*(I\b|1\b|II\b|2\b)|UNO|PALIO|SIENA|SEICENTO|CINQUECENTO)\b/i,
      /\b(CORSA\s*(A|B|C)\b|ASTRA\s*(F|G)\b|VECTRA\s*(A|B)\b)/i,
      /\b(FIESTA\s*(III|3|IV|4|V|5)\b|ESCORT|SIERRA|MONDEO\s*(I|1|II|2)\b)/i,
    ];
    let isVintage = (tecdocEndYear !== null && tecdocEndYear <= 2006) || VINTAGE_REGEXES.some(re => re.test(modelClean)) || (endYear !== null && endYear <= 2006);

    if (!isVintage) {
      try {
        const tecdocDateRows: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT pc.date_to
          FROM tecdoc.passengercars pc
          JOIN tecdoc.models m ON m.id = pc.model_id
          WHERE (
            LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) = $1 
            OR LOWER(m.description) = $1 
            OR $1 ILIKE '%' || LOWER(m.description) || '%'
            OR LOWER(m.description) ILIKE '%' || $1 || '%'
          )
          ${engineCode ? `AND (LOWER(pc.description) = $2 OR LOWER(pc.description) ILIKE '%' || $2 || '%')` : ''}
          ORDER BY pc.date_to DESC NULLS LAST
          LIMIT 1
        `, model.toLowerCase(), ...(engineCode ? [engineCode.toLowerCase()] : []));
        
        if (tecdocDateRows.length > 0 && tecdocDateRows[0].date_to) {
          const dt = new Date(tecdocDateRows[0].date_to);
          if (!isNaN(dt.getTime()) && dt.getFullYear() <= 2006) {
            isVintage = true;
          }
        }
      } catch (err) {
        // non-blocking fallback
      }
    }

    // VAG (Volkswagen, Audi, Seat, Skoda)
    if (makeNorm.includes('VOLKSWAGEN') || makeNorm.includes('VW') || makeNorm.includes('AUDI') || makeNorm.includes('SEAT') || makeNorm.includes('SKODA')) {
      return {
        status: 'found',
        oilSpec: {
          id: isVintage ? 'spec-vag-502-505' : 'spec-vag-504-507',
          viscosity: isVintage ? '10W-40' : '5W-30',
          apiStandard: isVintage ? 'API SN / CF' : 'API SP / SN Plus',
          aceaStandard: isVintage ? 'ACEA A3/B4' : 'ACEA C3',
          oemApproval: isVintage ? 'VW 502 00 / 505 00' : 'VW 504 00 / 507 00 (LongLife III)',
          capacityLiters: null,
          changeIntervalKm: isVintage ? 10000 : 15000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    // BMW & MINI
    if (makeNorm.includes('BMW') || makeNorm.includes('MINI')) {
      return {
        status: 'found',
        oilSpec: {
          id: isVintage ? 'spec-bmw-ll01' : 'spec-bmw-ll04',
          viscosity: isVintage ? '5W-40' : '5W-30',
          apiStandard: 'API SN / SP',
          aceaStandard: isVintage ? 'ACEA A3/B4' : 'ACEA C3',
          oemApproval: isVintage ? 'BMW Longlife-01 (LL-01)' : 'BMW Longlife-04 (LL-04)',
          capacityLiters: null,
          changeIntervalKm: 15000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    // Mercedes-Benz
    if (makeNorm.includes('MERCEDES')) {
      return {
        status: 'found',
        oilSpec: {
          id: isVintage ? 'spec-mb-229-3' : 'spec-mb-229-51',
          viscosity: isVintage ? '10W-40' : '5W-30',
          apiStandard: 'API SP / SN',
          aceaStandard: isVintage ? 'ACEA A3/B4' : 'ACEA C3',
          oemApproval: isVintage ? 'MB 229.3 / 229.5' : 'MB 229.51 / 229.52',
          capacityLiters: null,
          changeIntervalKm: 15000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    // Renault & Dacia
    if (makeNorm.includes('RENAULT') || makeNorm.includes('DACIA')) {
      const isDpf = !isVintage && (isDiesel || eUpper.includes('DCI'));
      return {
        status: 'found',
        oilSpec: {
          id: isDpf ? 'spec-rn-0720' : (isVintage ? 'spec-rn-vintage-10w40' : 'spec-rn-0710'),
          viscosity: isDpf ? '5W-30' : (isVintage ? '10W-40' : '5W-40'),
          apiStandard: 'API SN / CF',
          aceaStandard: isDpf ? 'ACEA C4' : 'ACEA A3/B4',
          oemApproval: isDpf ? 'Renault RN0720 / RN17' : 'Renault RN0700 / RN0710',
          capacityLiters: null,
          changeIntervalKm: isVintage ? 10000 : 15000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    // PSA Stellantis (Peugeot, Citroën, DS, Opel)
    if (makeNorm.includes('PEUGEOT') || makeNorm.includes('CITROEN') || makeNorm === 'DS' || makeNorm === 'DS AUTOMOBILES' || makeNorm.includes('OPEL')) {
      return {
        status: 'found',
        oilSpec: {
          id: isVintage ? 'spec-psa-b71-2300' : 'spec-psa-b71-2290',
          viscosity: isVintage ? '10W-40' : '5W-30',
          apiStandard: 'API SN / SP',
          aceaStandard: isVintage ? 'ACEA A3/B4' : 'ACEA C2 / C3',
          oemApproval: isVintage ? 'PSA B71 2300 / B71 2296' : 'PSA B71 2290 / B71 2297',
          capacityLiters: null,
          changeIntervalKm: isVintage ? 10000 : 15000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    // Fiat & Alfa Romeo & Lancia & Jeep
    if (makeNorm.includes('FIAT') || makeNorm.includes('ALFA') || makeNorm.includes('LANCIA') || makeNorm.includes('JEEP')) {
      return {
        status: 'found',
        oilSpec: {
          id: isVintage ? 'spec-fiat-vintage' : 'spec-fiat-955535',
          viscosity: isVintage ? '10W-40' : '5W-30',
          apiStandard: 'API SP / SN',
          aceaStandard: isVintage ? 'ACEA A3/B4' : 'ACEA C2 / C3',
          oemApproval: isVintage ? 'Fiat 9.55535-D2 / G2' : 'Fiat 9.55535-S1 / 9.55535-S2',
          capacityLiters: null,
          changeIntervalKm: isVintage ? 10000 : 15000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    // Ford
    if (makeNorm.includes('FORD')) {
      return {
        status: 'found',
        oilSpec: {
          id: isVintage ? 'spec-ford-vintage' : 'spec-ford-wss',
          viscosity: isVintage ? '10W-40' : '5W-30',
          apiStandard: 'API SP / SN',
          aceaStandard: isVintage ? 'ACEA A3/B4' : 'ACEA A5/B5 / C2',
          oemApproval: isVintage ? 'Ford WSS-M2C913-B' : 'Ford WSS-M2C913-D / WSS-M2C950-A',
          capacityLiters: null,
          changeIntervalKm: 15000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    // Asian Manufacturers (Toyota, Hyundai, Kia, Nissan, Honda, Mazda, Mitsubishi, Suzuki)
    if (makeNorm.includes('TOYOTA') || makeNorm.includes('HYUNDAI') || makeNorm.includes('KIA') || makeNorm.includes('NISSAN') || makeNorm.includes('HONDA') || makeNorm.includes('MAZDA') || makeNorm.includes('MITSUBISHI') || makeNorm.includes('SUZUKI')) {
      return {
        status: 'found',
        oilSpec: {
          id: isVintage ? 'spec-asian-vintage' : 'spec-asian-api-sp',
          viscosity: isVintage ? '10W-40' : '5W-30',
          apiStandard: isVintage ? 'API SN / CF' : 'API SP / RC, ILSAC GF-6A',
          aceaStandard: isVintage ? 'ACEA A3/B4' : 'ACEA C2 / C3 / A5',
          oemApproval: 'Toyota / Hyundai / Kia / Nissan Factory Approved',
          capacityLiters: null,
          changeIntervalKm: 10000,
        },
        resolvedBy: 'category-default',
        confidence: 'medium',
        backingRows: 0,
        candidates: [],
      };
    }

    // 4. Universal high-performance OEM passenger car engine oil spec fallback
    return {
      status: 'found',
      oilSpec: {
        id: 'spec-universal-passenger-car',
        viscosity: '5W-30',
        apiStandard: 'API SP / SN Plus',
        aceaStandard: 'ACEA C3 / C2',
        oemApproval: 'VW 504.00/507.00, MB 229.51/229.52, BMW LL-04, PSA B71 2290',
        capacityLiters: null,
        changeIntervalKm: 15000,
      },
      resolvedBy: 'category-default',
      confidence: 'low',
      backingRows: 0,
      candidates: [],
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

    // Default recommendation by displacement & fuel
    const viscosity = displacementCc > 2000 ? '5W-40' : '5W-30';
    return {
      status: 'found',
      oilSpec: {
        id: `spec-characteristics-${displacementCc}-${powerHp}`,
        viscosity,
        apiStandard: fuel.includes('diesel') ? 'API CK-4 / CJ-4' : 'API SP / SN Plus',
        aceaStandard: fuel.includes('diesel') ? 'ACEA C3 / C2' : 'ACEA A3/B4',
        oemApproval: null,
        capacityLiters: +(displacementCc / 450).toFixed(1),
        changeIntervalKm: 15000,
      },
      resolvedBy: 'category-default',
      confidence: 'medium',
      backingRows: 0,
      candidates: [],
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
