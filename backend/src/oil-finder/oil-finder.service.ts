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

// ── Preset vehicle databases for Moto, Poids Lourd, Agricole, and Marine ───

const MOTO_MAKES = [
  'YAMAHA', 'HONDA', 'KAWASAKI', 'SUZUKI', 'BMW MOTORRAD', 'DUCATI', 'KTM',
  'PIAGGIO', 'VESPA', 'SYM', 'APRILIA', 'KYMCO', 'PEUGEOT MOTOCYCLES', 'TRIUMPH',
  'HARLEY-DAVIDSON', 'BENELLI', 'ROYAL ENFIELD', 'MV AGUSTA', 'HUSQVARNA', 'BETA', 'CFMOTO', 'POLARIS', 'CAN-AM'
];

const MOTO_MODELS: Record<string, string[]> = {
  'YAMAHA': ['T-MAX 560', 'T-MAX 530', 'X-MAX 125', 'X-MAX 300', 'X-MAX 400', 'MT-07', 'MT-09', 'MT-03', 'MT-10', 'YZF-R1', 'YZF-R6', 'YZF-R7', 'Tracer 7', 'Tracer 9', 'Tenere 700', 'NMAX 125', 'Aerox 50', 'Bw\'s 50'],
  'HONDA': ['PCX 125', 'SH 125i', 'SH 150i', 'SH 300i', 'SH 350i', 'Forza 125', 'Forza 350', 'Forza 750', 'X-ADV 750', 'CBR 1000RR', 'CBR 650R', 'CBR 600RR', 'CB 650R', 'CB 500F', 'Africa Twin 1100', 'Hornet 750', 'Transalp 750'],
  'KAWASAKI': ['Z900', 'Z650', 'Z1000', 'Z750', 'Z400', 'Ninja 400', 'Ninja 650', 'Ninja 1000 SX', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Versys 650', 'Versys 1000'],
  'SUZUKI': ['GSX-R 1000', 'GSX-R 750', 'GSX-R 600', 'GSX-S 750', 'GSX-S 1000', 'V-Strom 650', 'V-Strom 1050', 'Burgman 125', 'Burgman 400', 'Burgman 650', 'Address 125'],
  'BMW MOTORRAD': ['R 1250 GS', 'R 1200 GS', 'S 1000 RR', 'S 1000 XR', 'S 1000 R', 'F 900 R', 'F 900 XR', 'F 850 GS', 'F 750 GS', 'C 400 GT', 'C 400 X', 'C 650 GT'],
  'DUCATI': ['Monster 821', 'Monster 937', 'Monster 1200', 'Panigale V2', 'Panigale V4', 'Multistrada 950', 'Multistrada V4', 'Hypermotard 950', 'Scrambler 800', 'Diavel 1260'],
  'KTM': ['125 Duke', '390 Duke', '790 Duke', '890 Duke', '1290 Super Duke R', 'RC 390', '390 Adventure', '890 Adventure', '1290 Super Adventure', 'EXC 300 (2T)', 'EXC 450 (4T)'],
  'PIAGGIO': ['Beverly 300', 'Beverly 350', 'Beverly 400', 'Medley 125', 'Medley 150', 'Liberty 50', 'Liberty 125', 'Zip 50 4T', 'Typhoon 50 2T', 'MP3 300', 'MP3 500'],
  'VESPA': ['Primavera 50', 'Primavera 125', 'Sprint 50', 'Sprint 125', 'GTS 125 Super', 'GTS 300 Super', 'GTS 300 HPE'],
  'SYM': ['Symphony 125', 'Symphony ST 200', 'Orbit II 50', 'Orbit III 125', 'Fiddle III 125', 'Fiddle IV 125', 'Jet 14 125', 'Cruisym 300', 'Maxsym TL 508', 'Joyride 300'],
  'APRILIA': ['RS 660', 'Tuono 660', 'RSV4 1100', 'Tuono V4 1100', 'SR GT 125', 'SR GT 200', 'SX 125', 'RX 125', 'SR 50'],
  'KYMCO': ['Agility 50', 'Agility 125', 'Like 125', 'X-Town 125', 'X-Town 300', 'Downtown 350', 'AK 550'],
  'PEUGEOT MOTOCYCLES': ['Kisbee 50', 'Tweet 125', 'Django 125', 'Pulsion 125', 'Metropolis 400', 'Speedfight 50'],
};

const TRUCK_MAKES = [
  'MERCEDES-BENZ TRUCKS', 'VOLVO TRUCKS', 'SCANIA', 'MAN', 'RENAULT TRUCKS',
  'DAF', 'IVECO', 'ISUZU TRUCKS', 'MACK', 'HYUNDAI TRUCKS', 'MITSUBISHI FUSO'
];

const TRUCK_MODELS: Record<string, string[]> = {
  'MERCEDES-BENZ TRUCKS': ['Actros', 'Arocs', 'Antos', 'Atego', 'Econic'],
  'VOLVO TRUCKS': ['FH16', 'FH', 'FM', 'FMX', 'FE', 'FL'],
  'SCANIA': ['R-Series', 'S-Series', 'G-Series', 'P-Series', 'L-Series'],
  'MAN': ['TGX', 'TGS', 'TGM', 'TGL', 'TGE'],
  'RENAULT TRUCKS': ['Range T', 'Range C', 'Range K', 'Range D', 'Premium', 'Magnum'],
  'DAF': ['XF', 'XG', 'XG+', 'CF', 'LF'],
  'IVECO': ['S-Way', 'T-Way', 'Stralis', 'Trakker', 'Eurocargo', 'Daily'],
};

const AGRI_MAKES = [
  'JOHN DEERE', 'MASSEY FERGUSON', 'NEW HOLLAND', 'CLAAS', 'CASE IH',
  'DEUTZ-FAHR', 'FENDT', 'KUBOTA', 'VALTRA', 'SAME', 'STEYR', 'LANDINI', 'MCCORMICK'
];

const AGRI_MODELS: Record<string, string[]> = {
  'JOHN DEERE': ['Série 6R (6120M - 6250R)', 'Série 7R (7R 290 - 7R 350)', 'Série 8R / 8RT', 'Série 5M / 5R', 'Série 6M'],
  'MASSEY FERGUSON': ['MF 5S', 'MF 6S', 'MF 7S', 'MF 8S', 'MF 9S', 'MF 4700 M', 'MF 5700 M'],
  'NEW HOLLAND': ['T5 AutoCommand / ElectroCommand', 'T6 Dynamic Command', 'T7 Heavy Duty', 'T8 Genesis', 'T4 F/N/V'],
  'CLAAS': ['Arion 400', 'Arion 500 / 600', 'Axion 800 / 900', 'Xerion 4000 / 5000', 'Nexos 200'],
  'CASE IH': ['Puma (150 - 240 CV)', 'Maxxum Multicontroller', 'Optum CVXDrive', 'Magnum AFS Connect', 'Farmall C / A'],
  'FENDT': ['300 Vario', '500 Vario', '700 Vario Gen6/Gen7', '900 Vario', '1000 Vario'],
  'DEUTZ-FAHR': ['Série 5D / 5G', 'Série 6 / 6 TTV', 'Série 7 TTV', 'Série 8 TTV', 'Série 9 TTV'],
  'KUBOTA': ['M4003', 'M5002', 'M6002', 'M7003', 'M7173'],
  'VALTRA': ['Série A', 'Série G', 'Série N', 'Série T', 'Série S'],
};

const MARINE_MAKES = [
  'YAMAHA MARINE', 'MERCURY', 'HONDA MARINE', 'SUZUKI MARINE', 'VOLVO PENTA', 'YANMAR', 'TOHATSU', 'EVINRUDE', 'CATERPILLAR MARINE', 'MAN MARINE', 'NANNI DIESEL', 'SELVA'
];

const MARINE_MODELS: Record<string, string[]> = {
  'YAMAHA MARINE': ['F25 / F40 FourStroke', 'F70 / F90 / F115', 'F150 / F200 FourStroke', 'F250 / F300 V6', 'XTO Offshore 425 / 450 V8'],
  'MERCURY': ['FourStroke 40 - 115 HP', 'FourStroke 150 HP', 'Verado V8 250 - 300 HP', 'Verado V12 600 HP', 'Pro XS 115 - 300 HP'],
  'HONDA MARINE': ['BF 40 / BF 50', 'BF 80 / BF 100', 'BF 115 / BF 150', 'BF 200 / BF 225 / BF 250 V6'],
  'SUZUKI MARINE': ['DF 40A / DF 60A', 'DF 90A / DF 115A / DF 140A', 'DF 150A / DF 175A / DF 200A', 'DF 250 / DF 300 V6', 'DF 350A Dual Prop'],
  'VOLVO PENTA': ['D3 Inboard Diesel (110 - 220 HP)', 'D4 Common Rail (150 - 320 HP)', 'D6 Common Rail (300 - 480 HP)', 'D8 / D11 / D13 Heavy Duty', 'V6 / V8 Essence EVC'],
  'YANMAR': ['3YM / 3JH Voilier (20 - 40 CV)', '4JH Common Rail (45 - 110 CV)', '4LV Inboard (150 - 250 CV)', '6LY / 8LV Haute Performance'],
  'TOHATSU': ['MFS 20 / 30 FourStroke', 'MFS 40 / 50 FourStroke', 'MFS 75 / 90 / 115 HP'],
  'EVINRUDE': ['E-TEC G2 150 - 300 HP', 'E-TEC 25 - 90 HP'],
};

const AUTO_POPULAR_MAKES = [
  'PEUGEOT', 'RENAULT', 'VOLKSWAGEN', 'CITROEN', 'BMW', 'MERCEDES-BENZ',
  'AUDI', 'FIAT', 'FORD', 'TOYOTA', 'HYUNDAI', 'KIA', 'NISSAN', 'SEAT',
  'SKODA', 'DACIA', 'OPEL', 'CHEVROLET', 'HONDA', 'MITSUBISHI', 'SUZUKI',
  'ALFA ROMEO', 'JEEP', 'LAND ROVER', 'VOLVO', 'PORSCHE'
];

@Injectable()
export class OilFinderService {
  private readonly logger = new Logger(OilFinderService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findByVehicle(make: string, model: string, engineCode?: string | null): Promise<OilFinderResult> {
    const makeNorm = make.trim().toUpperCase();
    const modelNorm = model.trim().toUpperCase();
    const isMoto = MOTO_MAKES.some(m => makeNorm === m.toUpperCase()) || makeNorm === 'PEUGEOT MOTOCYCLES';
    const isTruck = TRUCK_MAKES.some(m => makeNorm === m.toUpperCase()) || makeNorm === 'SCANIA' || makeNorm === 'IVECO' || makeNorm === 'MAN' || makeNorm === 'DAF' || makeNorm.includes('TRUCK') || makeNorm.includes('CAMION');
    const isMarine = MARINE_MAKES.some(m => makeNorm === m.toUpperCase()) || makeNorm.includes('MARINE') || makeNorm === 'YANMAR' || makeNorm.includes('PENTA') || makeNorm.includes('BATEAU');
    const isAgri = AGRI_MAKES.some(m => makeNorm === m.toUpperCase()) || makeNorm.includes('TRACTOR') || makeNorm.includes('TRACTEUR') || makeNorm.includes('AGRI');

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
        backingRows: rows.length,
        candidates: toCandidates(rows),
      };
    }

    const eUpper = (engineCode || '').toUpperCase();

    // 2. Specialized Category Recommendations
    if (isMoto) {
      const is2T = modelNorm.includes('50') && (modelNorm.includes('ZIP') || modelNorm.includes('AEROX') || modelNorm.includes('BW') || modelNorm.includes('TYPHOON') || modelNorm.includes('EXC 300')) || eUpper.includes('2T') || eUpper.includes('2-TEMPS');
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
          resolvedBy: 'minor-conflict-auto-resolve',
          backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
        candidates: [],
      };
    }

    if (isTruck) {
      const isVintageTruck = eUpper.includes('15W') || eUpper.includes('EURO 3') || eUpper.includes('EURO 2') || modelNorm.includes('PREMIUM') || modelNorm.includes('MAGNUM');
      return {
        status: 'found',
        oilSpec: {
          id: isVintageTruck ? 'spec-truck-heavy-15w40' : 'spec-truck-heavy-10w40',
          viscosity: isVintageTruck ? '15W-40' : '10W-40',
          apiStandard: 'API CK-4 / CJ-4',
          aceaStandard: isVintageTruck ? 'ACEA E7' : 'ACEA E6 / E9 / E7',
          oemApproval: isVintageTruck ? 'MB 228.3, Volvo VDS-3, MAN M 3275' : 'MB 228.51, MAN M 3477, Volvo VDS-4.5, Scania Low Ash',
          capacityLiters: 32.0,
          changeIntervalKm: 40000,
        },
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
          resolvedBy: 'minor-conflict-auto-resolve',
          backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
          resolvedBy: 'minor-conflict-auto-resolve',
          backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
    let isVintage = VINTAGE_REGEXES.some(re => re.test(modelClean)) || (endYear !== null && endYear <= 2006);

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
          const tecdocEndYear = new Date(tecdocDateRows[0].date_to).getFullYear();
          if (tecdocEndYear <= 2006) {
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
        backingRows: 1,
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
      resolvedBy: 'minor-conflict-auto-resolve',
      backingRows: 1,
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
        resolvedBy: 'minor-conflict-auto-resolve',
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
      resolvedBy: 'minor-conflict-auto-resolve',
      backingRows: 1,
      candidates: [],
    };
  }

  async getMakes(category?: string) {
    const cat = category?.toLowerCase().trim() || 'auto';
    const isMoto = cat.includes('moto') || cat.includes('karting') || cat.includes('2-roues') || cat.includes('scooter');
    const isAgri = cat.includes('agri') || cat.includes('tractor') || cat.includes('tracteur');
    const isCv = !isAgri && (cat.includes('poids') || cat.includes('commercial') || cat.includes('heavy') || cat.includes('truck') || cat.includes('camion'));
    const isMarine = cat.includes('marine') || cat.includes('boat') || cat.includes('bateau');

    if (isMoto) {
      try {
        const tecdocMotos: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT DISTINCT COALESCE(NULLIF(description, ''), matchcode) AS name
          FROM tecdoc.manufacturers
          WHERE can_be_displayed = true AND is_motorbike = true
          ORDER BY name ASC
        `);
        const tecdocNames = new Set(tecdocMotos.map(r => r.name.toUpperCase()));
        const presets = MOTO_MAKES.filter(name => !tecdocNames.has(name.toUpperCase())).map(name => ({ slug: slugify(name), name }));
        return [...tecdocMotos.map(r => ({ slug: slugify(r.name), name: r.name })), ...presets];
      } catch {
        return MOTO_MAKES.map(name => ({ slug: slugify(name), name }));
      }
    }

    if (isAgri) {
      return AGRI_MAKES.map(name => ({ slug: slugify(name), name }));
    }

    if (isCv) {
      try {
        const tecdocCv: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT DISTINCT COALESCE(NULLIF(description, ''), matchcode) AS name
          FROM tecdoc.manufacturers
          WHERE can_be_displayed = true AND (is_commercial_vehicle = true OR is_transporter = true)
          ORDER BY name ASC
        `);
        const tecdocNames = new Set(tecdocCv.map(r => r.name.toUpperCase()));
        const presets = TRUCK_MAKES.filter(name => !tecdocNames.has(name.toUpperCase())).map(name => ({ slug: slugify(name), name }));
        return [...tecdocCv.map(r => ({ slug: slugify(r.name), name: r.name })), ...presets];
      } catch {
        return TRUCK_MAKES.map(name => ({ slug: slugify(name), name }));
      }
    }

    if (isMarine) {
      return MARINE_MAKES.map(name => ({ slug: slugify(name), name }));
    }

    // Passenger Car (Automobile) - Query TecDoc
    try {
      const tecdocRows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT COALESCE(NULLIF(description, ''), matchcode) AS name
        FROM tecdoc.manufacturers
        WHERE can_be_displayed = true AND is_passenger_car = true
        ORDER BY name ASC
      `);
      if (tecdocRows.length > 0) {
        // Use slugify() here (not SQL) so accents and parens are handled correctly
        return tecdocRows.map((r) => ({ slug: slugify(r.name), name: r.name }));
      }
    } catch (e) {
      this.logger.error('Error fetching auto makes from TecDoc', e);
    }

    const rows = await this.prisma.oilFinderVehicle.findMany({
      select: { make: true },
      distinct: ['make'],
      orderBy: { make: 'asc' },
    }).catch(() => []);
    if (rows.length > 0) {
      return rows.map((r) => ({ slug: slugify(r.make), name: r.make }));
    }

    return AUTO_POPULAR_MAKES.map(name => ({ slug: slugify(name), name }));
  }

  async getModels(makeName: string) {
    const makeUpper = makeName.trim().toUpperCase();

    // Check Marine models — exact match only
    for (const [mfr, models] of Object.entries(MARINE_MODELS)) {
      if (makeUpper === mfr || makeUpper === mfr.toUpperCase()) {
        return models.map(name => ({ slug: slugify(name), name }));
      }
    }

    // Check Agricultural models — exact match only
    for (const [mfr, models] of Object.entries(AGRI_MODELS)) {
      if (makeUpper === mfr || makeUpper === mfr.toUpperCase()) {
        return models.map(name => ({ slug: slugify(name), name }));
      }
    }

    // Check motorcycle models — exact match only
    for (const [mfr, models] of Object.entries(MOTO_MODELS)) {
      if (makeUpper === mfr || makeUpper === mfr.toUpperCase()) {
        return models.map(name => ({ slug: slugify(name), name }));
      }
    }

    // Check truck models — exact match only
    for (const [mfr, models] of Object.entries(TRUCK_MODELS)) {
      if (makeUpper === mfr || makeUpper === mfr.toUpperCase()) {
        return models.map(name => ({ slug: slugify(name), name }));
      }
    }

    // Passenger car models from TecDoc
    try {
      const tecdocRows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT m.description AS name, LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) AS slug
        FROM tecdoc.models m
        JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
        WHERE LOWER(REGEXP_REPLACE(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode), '[^a-zA-Z0-9]+', '-', 'g')) = $1
           OR LOWER(COALESCE(NULLIF(mfr.description, ''), mfr.matchcode)) = $1
           OR LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = $1
           OR LOWER(mfr.matchcode) = $1
        ORDER BY m.description ASC
      `, makeName.toLowerCase());
      if (tecdocRows.length > 0) {
        return tecdocRows.map((r) => ({ slug: r.slug, name: r.name }));
      }
    } catch (e) {
      this.logger.error(`Error fetching models from TecDoc for make: ${makeName}`, e);
    }

    const rows = await this.prisma.oilFinderVehicle.findMany({
      where: { make: { equals: makeName.trim(), mode: 'insensitive' as const } },
      select: { model: true },
      distinct: ['model'],
      orderBy: { model: 'asc' },
    }).catch(() => []);
    
    if (rows.length > 0) {
      return rows.map((r) => ({ slug: slugify(r.model), name: r.model }));
    }

    return [
      { slug: 'clio-iv', name: 'Clio IV' },
      { slug: 'clio-v', name: 'Clio V' },
      { slug: 'megane-iv', name: 'Megane IV' },
      { slug: '208', name: '208' },
      { slug: '308', name: '308' },
      { slug: 'golf-7', name: 'Golf VII' },
      { slug: 'golf-8', name: 'Golf VIII' },
      { slug: 'polo', name: 'Polo VI' },
      { slug: 'serie-3', name: 'Série 3 (G20/F30)' },
      { slug: 'classe-c', name: 'Classe C (W205/W206)' },
      { slug: 'a3', name: 'A3 Sportback' },
      { slug: 'a4', name: 'A4' },
      { slug: 'yaris', name: 'Yaris' },
      { slug: 'tucson', name: 'Tucson' },
      { slug: 'sportage', name: 'Sportage' },
      { slug: 'duster', name: 'Duster' },
      { slug: 'sandero', name: 'Sandero' },
    ];
  }

  async getEngines(makeName: string, modelName: string) {
    const makeUpper = makeName.trim().toUpperCase();
    const modelUpper = modelName.trim().toUpperCase();

    // Marine engines — exact match only
    const isMarine = MARINE_MAKES.some(m => makeUpper === m.toUpperCase()) || makeUpper.includes('MARINE') || makeUpper.includes('PENTA') || makeUpper === 'YANMAR';
    if (isMarine) {
      return [
        { engineCode: 'Moteur Hors-Bord 4-Temps (NMMA FC-W)', yearFrom: 2012, yearTo: 2024 },
        { engineCode: 'Moteur Hors-Bord 2-Temps (NMMA TC-W3)', yearFrom: 2005, yearTo: 2024 },
        { engineCode: 'Moteur Inboard Diesel Common Rail (Heavy Duty)', yearFrom: 2010, yearTo: 2024 },
        { engineCode: 'Moteur Inboard Essence V6 / V8 (Catalysé)', yearFrom: 2012, yearTo: 2024 },
      ];
    }

    // Agricultural engines — exact match only
    const isAgri = AGRI_MAKES.some(m => makeUpper === m.toUpperCase());
    if (isAgri) {
      return [
        { engineCode: 'Moteur Diesel Stage V / Tier 4 Final Low-SAPS', yearFrom: 2018, yearTo: 2024 },
        { engineCode: 'Moteur Diesel Stage IV / Tier 4 Interim', yearFrom: 2012, yearTo: 2018 },
        { engineCode: 'Transmission & Hydraulique Multifonction (UTTO / STOU)', yearFrom: 2010, yearTo: 2024 },
      ];
    }

    // Motorcycle engines — exact match only
    const isMoto = MOTO_MAKES.some(m => makeUpper === m.toUpperCase()) || makeUpper === 'PEUGEOT MOTOCYCLES' || makeUpper.includes('PIAGGIO') || makeUpper.includes('SYM') || makeUpper.includes('VESPA') || makeUpper.includes('DUCATI') || makeUpper.includes('KTM');
    if (isMoto) {
      if (modelUpper.includes('50') || modelUpper.includes('ZIP') || modelUpper.includes('TYPHOON')) {
        return [
          { engineCode: '50cc 2-Temps (Graissage Séparé / Mélange - JASO FD)', yearFrom: 2010, yearTo: 2024 },
          { engineCode: '50cc 4-Temps i-Get / Euro 5 (JASO MA2)', yearFrom: 2018, yearTo: 2024 },
        ];
      }
      if (modelUpper.includes('125') || modelUpper.includes('150') || modelUpper.includes('PCX') || modelUpper.includes('SH') || modelUpper.includes('MEDLEY') || modelUpper.includes('SYMPHONY') || modelUpper.includes('FIDDLE')) {
        return [
          { engineCode: '125cc 4-Temps Injection eSP / Euro 5 (JASO MB/MA2)', yearFrom: 2016, yearTo: 2024 },
          { engineCode: '125cc 4-Temps Carburateur / Euro 4 (10W-40 MA2)', yearFrom: 2010, yearTo: 2018 },
          { engineCode: '150cc / 200cc 4-Temps i-Get (10W-40 MA2)', yearFrom: 2016, yearTo: 2024 },
        ];
      }
      if (modelUpper.includes('T-MAX') || modelUpper.includes('530') || modelUpper.includes('560') || modelUpper.includes('300') || modelUpper.includes('350') || modelUpper.includes('400')) {
        return [
          { engineCode: '560cc Bicylindre 4-Temps DACT (10W-40 MA2)', yearFrom: 2020, yearTo: 2024 },
          { engineCode: '530cc Bicylindre 4-Temps DACT (10W-40 MA2)', yearFrom: 2012, yearTo: 2019 },
          { engineCode: '300cc / 350cc / 400cc Monocylindre 4V (10W-40 MA2)', yearFrom: 2016, yearTo: 2024 },
        ];
      }
      return [
        { engineCode: 'Moteur 4-Temps 4V Injection DACT (JASO MA2)', yearFrom: 2014, yearTo: 2024 },
        { engineCode: 'Moteur 4-Temps Haute Performance 10W-50 (JASO MA2)', yearFrom: 2018, yearTo: 2024 },
      ];
    }

    // Truck engines
    const isTruck = TRUCK_MAKES.some(m => makeUpper === m.toUpperCase()) || makeUpper === 'SCANIA' || makeUpper === 'IVECO' || makeUpper === 'MAN' || makeUpper === 'DAF';
    if (isTruck) {
      return [
        { engineCode: '12.8L OM471 / D13K / DC13 Euro 6 Low-SAPS (450 - 530 ch)', yearFrom: 2014, yearTo: 2024 },
        { engineCode: '10.8L OM470 / D11K / Cursor 11 Euro 6 (380 - 450 ch)', yearFrom: 2014, yearTo: 2024 },
        { engineCode: '7.7L OM936 / D8K / TGL Euro 6 (240 - 350 ch)', yearFrom: 2014, yearTo: 2024 },
      ];
    }

    // Passenger car engines - Query TecDoc
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
    } catch (e) {
      this.logger.error(`Error fetching engines from TecDoc for model: ${modelName}`, e);
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
    }).catch(() => []);
    if (rows.length > 0) return rows;

    return [
      { engineCode: '1.2 PureTech / TCe / TSI (Essence)', yearFrom: 2012, yearTo: 2024 },
      { engineCode: '1.4 HDi / TDCi / MPI', yearFrom: 2008, yearTo: 2020 },
      { engineCode: '1.5 dCi / Blue dCi (Diesel)', yearFrom: 2010, yearTo: 2024 },
      { engineCode: '1.6 BlueHDi / TDI (Diesel)', yearFrom: 2012, yearTo: 2024 },
      { engineCode: '2.0 TDI / BlueHDi / CDI (Diesel)', yearFrom: 2010, yearTo: 2024 },
      { engineCode: '2.0 TFSI / EcoBoost / Turbo (Essence)', yearFrom: 2012, yearTo: 2024 },
    ];
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
