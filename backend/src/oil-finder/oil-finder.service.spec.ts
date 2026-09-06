import { Test, TestingModule } from '@nestjs/testing';
import {
  OilFinderService,
  resolveBrandSlugs,
  extractEngineVariants,
  extractModelKeywords,
} from './oil-finder.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Fixtures (mirroring staging vehicle & spec rows) ──────────────────────────
const spec5w40 = {
  id: 's1',
  viscosity: '5W-40',
  apiStandard: 'API SN',
  aceaStandard: 'ACEA A3/B4',
  oemApproval: null,
  capacityLiters: 4.5,
  changeIntervalKm: 15000,
};

const spec5w30C3 = {
  id: 's4',
  viscosity: '5W-30',
  apiStandard: 'API C3',
  aceaStandard: 'ACEA C3',
  oemApproval: null,
  capacityLiters: 5,
  changeIntervalKm: 30000,
};

const row = (overrides: Record<string, unknown> = {}) => ({
  id: `r-${Math.random()}`,
  make: 'Renault',
  model: 'Clio IV',
  generation: 'IV',
  yearFrom: 2012,
  yearTo: 2019,
  engineCode: 'K4M',
  displacementCc: 1598,
  powerKw: 81,
  powerHp: 110,
  fuelType: 'essence',
  source: 'oponeo.fr',
  confidence: 'high',
  matchAmbiguity: null,
  oilSpec: spec5w40,
  ...overrides,
});

describe('OilFinderService', () => {
  let service: OilFinderService;
  let prisma: {
    oilFinderVehicle: { findMany: jest.Mock };
    $queryRawUnsafe: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      oilFinderVehicle: { findMany: jest.fn() },
      $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OilFinderService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(OilFinderService);
  });

  describe('findByVehicle — vehicle lookup', () => {
    it('returns exactly one oil spec for a clean make/model/engineCode DB match', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([row()]);

      const result = await service.findByVehicle('Renault', 'Clio IV', 'K4M');

      expect(result.status).toBe('found');
      if (result.status !== 'found') return;
      expect(result.oilSpec.viscosity).toBe('5W-40');
      expect(result.resolvedBy).toBe('exact');
      expect(result.backingRows).toBe(1);
      expect(result.candidates).toHaveLength(1);
    });

    it('filters by engineCode when provided (case-insensitive mode)', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([row()]);

      await service.findByVehicle('Renault', 'Clio IV', 'K4M');

      expect(prisma.oilFinderVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            engineCode: { equals: 'K4M', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('treats missing engineCode as a wildcard', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([row()]);

      await service.findByVehicle('Renault', 'Clio IV');

      const where = prisma.oilFinderVehicle.findMany.mock.calls[0][0].where;
      expect(where.engineCode).toBeUndefined();
    });

    it('returns one spec when multiple sources agree (backingRows > 1, exact)', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([
        row({ source: 'oponeo.fr' }),
        row({ source: 'autodoc.fr' }),
      ]);

      const result = await service.findByVehicle('Renault', 'Clio IV', 'K4M');

      expect(result.status).toBe('found');
      if (result.status !== 'found') return;
      expect(result.backingRows).toBe(2);
      expect(result.resolvedBy).toBe('exact');
    });

    it('auto-resolves conflict when two sources give different specs for the same vehicle', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([
        row({ source: 'oponeo.fr', oilSpec: spec5w40 }),
        row({ source: 'autodoc.fr', oilSpec: spec5w30C3 }),
      ]);

      const result = await service.findByVehicle('Renault', 'Clio IV', 'K4M');

      expect(result.status).toBe('found');
      if (result.status !== 'found') return;
      expect(result.resolvedBy).toBe('minor-conflict-auto-resolve');
      expect(result.candidates).toHaveLength(2);
    });

    it('picks the spec with more supporting rows when sources disagree', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([
        row({ source: 'oponeo.fr', oilSpec: spec5w30C3 }),
        row({ source: 'autodoc.fr', oilSpec: spec5w30C3 }),
        row({ source: 'ovoko.fr', oilSpec: spec5w40 }),
      ]);

      const result = await service.findByVehicle('Renault', 'Clio IV', 'K4M');

      expect(result.status).toBe('found');
      if (result.status !== 'found') return;
      expect(result.oilSpec.id).toBe(spec5w30C3.id); // 2 votes vs 1
      expect(result.resolvedBy).toBe('minor-conflict-auto-resolve');
    });

    it('returns status not_found enriched with TecDoc motorcycle classification when detected as moto', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_moto: true }]);

      const result = await service.findByVehicle('Yamaha', 'YZF-R1');

      expect(result.status).toBe('not_found');
      if (result.status === 'not_found') {
        expect(result.message).toContain('moto');
      }
    });

    it('returns status not_found enriched with TecDoc truck classification when detected as truck', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_truck: true }]);

      const result = await service.findByVehicle('Scania', 'R500');

      expect(result.status).toBe('not_found');
      if (result.status === 'not_found') {
        expect(result.message).toContain('poids lourd');
      }
    });

    it('returns official manufacturer spec for Volkswagen when not found in DB', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_car: true }]);

      const result = await service.findByVehicle('Volkswagen', 'Golf');

      expect(result.status).toBe('found');
      if (result.status === 'found') {
        expect(result.oilSpec.viscosity).toBe('5W-30');
        expect(result.oilSpec.oemApproval).toContain('VW 504 00 / 507 00');
        expect(result.confidence).toBe('medium');
      }
    });

    it('returns official manufacturer spec for BMW when not found in DB', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_car: true }]);

      const result = await service.findByVehicle('BMW', '3 Series');

      expect(result.status).toBe('found');
      if (result.status === 'found') {
        expect(result.oilSpec.viscosity).toBe('5W-30');
        expect(result.oilSpec.oemApproval).toContain('BMW Longlife-04');
        expect(result.confidence).toBe('medium');
      }
    });

    it('returns official manufacturer spec for Renault when not found in DB', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_car: true }]);

      const result = await service.findByVehicle('Renault', 'Megane');

      expect(result.status).toBe('found');
      if (result.status === 'found') {
        expect(result.oilSpec.viscosity).toBe('5W-30');
        expect(result.oilSpec.oemApproval).toContain('Renault RN17');
        expect(result.confidence).toBe('medium');
      }
    });

    it('returns official manufacturer spec for Alfa Romeo when not found in DB', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_car: true }]);

      const result = await service.findByVehicle('Alfa Romeo', 'Giulietta');

      expect(result.status).toBe('found');
      if (result.status === 'found') {
        expect(result.oilSpec.viscosity).toBe('5W-40');
        expect(result.oilSpec.oemApproval).toContain('Fiat 9.55535-S2');
        expect(result.confidence).toBe('medium');
      }
    });

    it('returns official manufacturer spec for Mini when not found in DB', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_car: true }]);

      const result = await service.findByVehicle('Mini', 'Cooper');

      expect(result.status).toBe('found');
      if (result.status === 'found') {
        expect(result.oilSpec.viscosity).toBe('5W-30');
        expect(result.oilSpec.oemApproval).toContain('BMW Longlife-04');
        expect(result.confidence).toBe('medium');
      }
    });

    it('returns official manufacturer spec for Chery when not found in DB', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_car: true }]);

      const result = await service.findByVehicle('Chery', 'Tiggo');

      expect(result.status).toBe('found');
      if (result.status === 'found') {
        expect(result.oilSpec.viscosity).toBe('5W-30');
        expect(result.oilSpec.oemApproval).toContain('API SN');
        expect(result.confidence).toBe('medium');
      }
    });

    it('returns status not_found enriched with automobile classification for unconfigured car make', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_car: true }]);

      const result = await service.findByVehicle('UnknownCarMake', 'ModelZ');

      expect(result.status).toBe('not_found');
      if (result.status === 'not_found') {
        expect(result.message).toContain('automobile');
      }
    });

    it('returns status not_found for unknown makes with no rows in DB', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.findByVehicle('UnknownBrand', 'ModelX', '1.6L');

      expect(result.status).toBe('not_found');
      if (result.status === 'not_found') {
        expect(result.message).toContain('Aucune spécification d\'huile trouvée');
      }
    });
  });

  describe('findByCharacteristics — characteristics lookup', () => {
    it('returns direct match when DB has matching rows', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([row()]);

      const result = await service.findByCharacteristics(1598, 110, 'essence');

      expect(result.status).toBe('found');
      if (result.status !== 'found') return;
      expect(result.oilSpec.viscosity).toBe('5W-40');
      expect(result.resolvedBy).toBe('exact');
      expect(result.confidence).toBe('high');
      expect(result.backingRows).toBe(1);
    });

    it('normalizes fuelType casing when querying DB', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([row()]);

      await service.findByCharacteristics(1598, 110, 'Essence');

      expect(prisma.oilFinderVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { displacementCc: 1598, powerHp: 110, fuelType: 'essence' },
        }),
      );
    });

    it('returns status not_found when no DB rows match characteristics', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);

      const res = await service.findByCharacteristics(1400, 90, 'essence');
      expect(res.status).toBe('not_found');
      if (res.status === 'not_found') {
        expect(res.message).toContain('Aucune spécification d\'huile trouvée pour les caractéristiques');
      }
    });
  });

  describe('getMakes & getEngines — presets and catalogue helper', () => {
    it('returns motorcycle make presets when category is moto', async () => {
      prisma.$queryRawUnsafe.mockResolvedValueOnce([
        { name: 'HONDA' },
        { name: 'KAWASAKI' },
        { name: 'YAMAHA' },
      ]);
      const makes = await service.getMakes('moto');
      const names = makes.map((m) => m.name);
      expect(names).toContain('YAMAHA');
      expect(names).toContain('HONDA');
      expect(names).toContain('KAWASAKI');
    });

    it('returns truck make presets when category is cv / poids lourd', async () => {
      prisma.$queryRawUnsafe.mockResolvedValueOnce([
        { name: 'MERCEDES-BENZ TRUCKS' },
        { name: 'SCANIA' },
        { name: 'VOLVO TRUCKS' },
      ]);
      const makes = await service.getMakes('poids-lourds');
      const names = makes.map((m) => m.name);
      expect(names).toContain('MERCEDES-BENZ TRUCKS');
      expect(names).toContain('VOLVO TRUCKS');
      expect(names).toContain('SCANIA');
    });

    it('returns agricultural make presets when category is agri', async () => {
      prisma.$queryRawUnsafe.mockResolvedValueOnce([
        { name: 'JOHN DEERE' },
        { name: 'MASSEY FERGUSON' },
        { name: 'NEW HOLLAND' },
      ]);
      const makes = await service.getMakes('agricole');
      const names = makes.map((m) => m.name);
      expect(names).toContain('JOHN DEERE');
      expect(names).toContain('MASSEY FERGUSON');
      expect(names).toContain('NEW HOLLAND');
    });
  });

  describe('resolveBrandSlugs — manufacturer alias mapping', () => {
    it('maps Volkswagen to include vw and volkswagen', () => {
      const slugs = resolveBrandSlugs('Volkswagen');
      expect(slugs).toContain('vw');
      expect(slugs).toContain('volkswagen');
    });

    it('maps Mercedes to include mercedes-benz and merce', () => {
      const slugs = resolveBrandSlugs('Mercedes');
      expect(slugs).toContain('mercedes-benz');
      expect(slugs).toContain('merce');
    });

    it('maps Citroen to include citroen, citroën, and citro', () => {
      const slugs = resolveBrandSlugs('Citroen');
      expect(slugs).toContain('citroen');
      expect(slugs).toContain('citro');
    });

    it('maps Yamaha to include yamah, yamaha, and yamaha-motorcycles', () => {
      const slugs = resolveBrandSlugs('Yamaha');
      expect(slugs).toContain('yamah');
      expect(slugs).toContain('yamaha');
      expect(slugs).toContain('yamaha-motorcycles');
      expect(slugs).toContain('yamaha-mot');
    });

    it('maps Harley-Davidson to include harley-dav and harley-davidson-mc', () => {
      const slugs = resolveBrandSlugs('Harley-Davidson');
      expect(slugs).toContain('harley-dav');
      expect(slugs).toContain('harley-davidson-mc');
    });

    it('maps Vespa to include vespa, vespa-motorcycles, and piaggio', () => {
      const slugs = resolveBrandSlugs('Vespa');
      expect(slugs).toContain('vespa');
      expect(slugs).toContain('vespa-motorcycles');
      expect(slugs).toContain('piaggio');
    });
  });

  describe('extractEngineVariants — resilient engine code decomposition', () => {
    it('decomposes Opel engine trim with chassis in parens: 1.4 (L48)', () => {
      const variants = extractEngineVariants('1.4 (L48)');
      expect(variants).toContain('1.4 (L48)');
      expect(variants).toContain('1.4');
      expect(variants).toContain('L48');
      expect(variants).toContain('');
    });

    it('decomposes VAG engine trim with code in parens: 1.4 TSI (CZCA)', () => {
      const variants = extractEngineVariants('1.4 TSI (CZCA)');
      expect(variants).toContain('1.4 TSI (CZCA)');
      expect(variants).toContain('1.4 TSI');
      expect(variants).toContain('CZCA');
      expect(variants).toContain('');
    });

    it('decomposes Renault dCi trim with variant in parens: 1.5 dCi (K9K 628)', () => {
      const variants = extractEngineVariants('1.5 dCi (K9K 628)');
      expect(variants).toContain('1.5 dCi (K9K 628)');
      expect(variants).toContain('1.5 dCi');
      expect(variants).toContain('K9K 628');
      expect(variants).toContain('K9K');
      expect(variants).toContain('');
    });

    it('handles empty or null engineCode', () => {
      expect(extractEngineVariants('')).toEqual(['']);
      expect(extractEngineVariants(null)).toEqual(['']);
      expect(extractEngineVariants(undefined)).toEqual(['']);
    });
  });

  describe('extractModelKeywords — TecDoc compound model decomposition', () => {
    it('extracts base model from Golf VII chassis: GOLF VII (5G1, BQ1, BE1, BE2)', () => {
      const kws = extractModelKeywords('GOLF VII (5G1, BQ1, BE1, BE2)');
      expect(kws).toContain('GOLF VII');
      expect(kws).toContain('GOLF');
    });

    it('extracts Punto from Grande Punto chassis: GRANDE PUNTO (199_)', () => {
      const kws = extractModelKeywords('GRANDE PUNTO (199_)');
      expect(kws).toContain('GRANDE PUNTO');
      expect(kws).toContain('PUNTO');
    });

    it('extracts 206 from Peugeot body type: 206 Hatchback (2A/C)', () => {
      const kws = extractModelKeywords('206 Hatchback (2A/C)');
      expect(kws).toContain('206 Hatchback');
      expect(kws).toContain('206');
      expect(kws).not.toContain('Hatchback'); // stop word filtered
    });

    it('extracts Clio from Clio II chassis: CLIO II (BB_, CB_)', () => {
      const kws = extractModelKeywords('CLIO II (BB_, CB_)');
      expect(kws).toContain('CLIO II');
      expect(kws).toContain('CLIO');
    });

    it('extracts Golf VII from slug: golf-vii-5g1-bq1-be1-be2', () => {
      const kws = extractModelKeywords('golf-vii-5g1-bq1-be1-be2');
      expect(kws).toContain('golf');
      expect(kws).toContain('vii');
      expect(kws).toContain('golf vii');
    });

    it('extracts 3 and series from BMW slug: 3-f30-f80', () => {
      const kws = extractModelKeywords('3-f30-f80');
      expect(kws).toContain('3');
      expect(kws).toContain('f30');
      expect(kws).toContain('3 Series');
    });
  });

  describe('BMW & VW engine variants & manufacturer defaults', () => {
    it('compacts BMW engine space: 320 d (N47 D20 C)', () => {
      const variants = extractEngineVariants('320 d (N47 D20 C)');
      expect(variants).toContain('320d');
      expect(variants).toContain('N47D20C');
      expect(variants).toContain('320 d');
      expect(variants).toContain('');
    });

    it('splits comma-separated engine codes in parens: 2.0 TDI (CRBC, CRLB)', () => {
      const variants = extractEngineVariants('2.0 TDI (CRBC, CRLB)');
      expect(variants).toContain('CRBC');
      expect(variants).toContain('CRLB');
      expect(variants).toContain('2.0 TDI');
      expect(variants).toContain('');
    });

    it('falls back to official BMW Longlife-04 spec for BMW vehicle when no exact DB row exists', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const res = await service.findByVehicle('bmw', '3-f30-f80', '320 d');
      expect(res.status).toBe('found');
      if (res.status === 'found') {
        expect(res.oilSpec.viscosity).toBe('5W-30');
        expect(res.oilSpec.oemApproval).toContain('BMW Longlife-04');
        expect(res.confidence).toBe('medium');
      }
    });

    it('falls back to official VW 504.00/507.00 spec for Volkswagen vehicle when no exact DB row exists', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const res = await service.findByVehicle('vw', 'golf-vii-5g1-bq1-be1-be2', '2.0 TDI');
      expect(res.status).toBe('found');
      if (res.status === 'found') {
        expect(res.oilSpec.viscosity).toBe('5W-30');
        expect(res.oilSpec.oemApproval).toContain('VW 504 00 / 507 00');
        expect(res.confidence).toBe('medium');
      }
    });

    it('resolves authentic Renault RN0720 C4 specification for Clio IV 1.5 dCi', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const res = await service.findByVehicle('renault', 'clio-iv-bh-', '1.5 dCi 90 (BHN1)');
      expect(res.status).toBe('found');
      if (res.status === 'found') {
        expect(res.oilSpec.viscosity).toBe('5W-30');
        expect(res.oilSpec.oemApproval).toContain('RN0720');
        expect(res.oilSpec.aceaStandard).toBe('C4');
      }
    });

    it('resolves authentic 10W-40 PSA B71 2294/2300 specification for Citroën Saxo 1.1', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const res = await service.findByVehicle('citroen', 'saxo-s0-s1-', '1.1 X,SX (1996-2003)');
      expect(res.status).toBe('found');
      if (res.status === 'found') {
        expect(res.oilSpec.viscosity).toBe('10W-40');
        expect(res.oilSpec.oemApproval).toContain('PSA B71');
        expect(res.oilSpec.aceaStandard).toBe('A3/B4');
      }
    });

    it('resolves authentic PSA B71 2312 0W-30 specification for Peugeot 208 PureTech', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const res = await service.findByVehicle('peugeot', '208-i-ca-cc-', '1.2 PureTech 82 (2015)');
      expect(res.status).toBe('found');
      if (res.status === 'found') {
        expect(res.oilSpec.viscosity).toBe('0W-30');
        expect(res.oilSpec.oemApproval).toContain('PSA B71 2312');
        expect(res.oilSpec.aceaStandard).toBe('C2');
      }
    });

    it('resolves official Liqui Moly 5W-40 spec (7.1L) for Toyota Land Cruiser 200 4.7 V8 (2UZ-FE)', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const res = await service.findByVehicle('TOYOTA', 'Land Cruiser 200', '4.7 VVT-i V8, UZJ200 (2008-2010)');
      expect(res.status).toBe('found');
      if (res.status === 'found') {
        expect(res.oilSpec.viscosity).toBe('5W-40');
        expect(res.oilSpec.capacityLiters).toBe(7.1);
        expect(res.oilSpec.aceaStandard).toBe('A3/B4');
      }
    });

    it('resolves official Liqui Moly 0W-20 spec (7.5L) for Toyota Land Cruiser 200 5.7 V8 (3UR-FE)', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const res = await service.findByVehicle('TOYOTA', 'Land Cruiser', '5.7 V8 (3UR-FE)');
      expect(res.status).toBe('found');
      if (res.status === 'found') {
        expect(res.oilSpec.viscosity).toBe('0W-20');
        expect(res.oilSpec.capacityLiters).toBe(7.5);
      }
    });

    it('resolves official 0W-20 spec (4.4L) for TOYOTA RAV 4 2.5 Hybrid 4WD (AVA44_)', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const res = await service.findByVehicle('TOYOTA', 'RAV 4', '2.5 Hybrid 4WD (AVA44_)');
      expect(res.status).toBe('found');
      if (res.status === 'found') {
        expect(res.oilSpec.viscosity).toBe('0W-20');
        expect(res.oilSpec.capacityLiters).toBe(4.4);
        expect(res.oilSpec.fuelType).toBe('hybrid');
        expect(res.oilSpec.oemApproval).toContain('Toyota / Lexus API SP / ILSAC GF-6A');
      }
    });

    it('resolves official 0W-30 ACEA C2 spec (3.6L) for HYUNDAI i20 II 1.0L (G3LC) - 100ch', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const res = await service.findByVehicle('HYUNDAI', 'i20 II', '1.0L (G3LC) - 100ch');
      expect(res.status).toBe('found');
      if (res.status === 'found') {
        expect(res.oilSpec.viscosity).toBe('0W-30');
        expect(res.oilSpec.capacityLiters).toBe(3.6);
        expect(res.oilSpec.aceaStandard).toBe('C2');
        expect(res.oilSpec.oemApproval).toContain('Hyundai / Kia ACEA C2');
      }
    });

    it('resolves official 0W-30 Fiat 9.55535-GS1 spec (5.2L) for ALFA ROMEO GIULIA (952_) 2.0 (952ABA25B)', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const res = await service.findByVehicle('ALFA ROMEO', 'GIULIA (952_)', '2.0 (952ABA25B)');
      expect(res.status).toBe('found');
      if (res.status === 'found') {
        expect(res.oilSpec.viscosity).toBe('0W-30');
        expect(res.oilSpec.capacityLiters).toBe(5.2);
        expect(res.oilSpec.aceaStandard).toBe('C2');
        expect(res.oilSpec.oemApproval).toContain('Fiat 9.55535-GS1');
      }
    });

    it('merges engines from both TecDoc and OilFinderVehicle in getEngines', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([
        { engineCode: '4.5 D-4D (VDJ200)', yearFrom: 2008, yearTo: 2021 },
      ]);
      prisma.oilFinderVehicle.findMany.mockResolvedValue([
        { engineCode: '3UR-FE', yearFrom: 2008, yearTo: 2021, displacementCc: 5663, powerHp: 381, fuelType: 'essence', model: 'Land Cruiser 200' },
        { engineCode: '4.7 VVT-i V8', yearFrom: 2008, yearTo: 2012, displacementCc: 4664, powerHp: 288, fuelType: 'essence', model: 'Land Cruiser 200' },
      ]);

      const engines = await service.getEngines('TOYOTA', 'Land Cruiser');
      expect(engines.length).toBeGreaterThanOrEqual(3);
      const codes = engines.map((e) => e.engineCode);
      expect(codes.some((c) => c.includes('4.5 D-4D'))).toBe(true);
      expect(codes.some((c) => c.includes('3UR-FE') || c.includes('5.7L'))).toBe(true);
      expect(codes.some((c) => c.includes('4.7 VVT-i') || c.includes('4.7'))).toBe(true);
    });
  });
});
