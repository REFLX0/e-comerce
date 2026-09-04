import { Test, TestingModule } from '@nestjs/testing';
import { OilFinderService } from './oil-finder.service';
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

    it('falls back to VAG OEM specification when vehicle is not in DB', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);

      const result = await service.findByVehicle('Volkswagen', 'Golf VII', '2.0 TDI');

      expect(result.status).toBe('found');
      if (result.status !== 'found') return;
      expect(result.oilSpec.viscosity).toBe('5W-30');
      expect(result.oilSpec.oemApproval).toContain('VW 504 00 / 507 00');
      expect(result.resolvedBy).toBe('category-default');
      expect(result.confidence).toBe('medium');
      expect(result.backingRows).toBe(0);
    });

    it('falls back to BMW LL-04 OEM specification when vehicle is not in DB', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);

      const result = await service.findByVehicle('BMW', 'Serie 3', '2.0d');

      expect(result.status).toBe('found');
      if (result.status !== 'found') return;
      expect(result.oilSpec.viscosity).toBe('5W-30');
      expect(result.oilSpec.oemApproval).toContain('BMW Longlife-04');
      expect(result.resolvedBy).toBe('category-default');
      expect(result.confidence).toBe('medium');
      expect(result.backingRows).toBe(0);
    });

    it('falls back to universal passenger car OEM recommendation for unknown makes', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);

      const result = await service.findByVehicle('UnknownBrand', 'ModelX', '1.6L');

      expect(result.status).toBe('found');
      if (result.status !== 'found') return;
      expect(result.oilSpec.viscosity).toBe('5W-30');
      expect(result.oilSpec.id).toBe('spec-universal-passenger-car');
      expect(result.resolvedBy).toBe('category-default');
      expect(result.confidence).toBe('low');
      expect(result.backingRows).toBe(0);
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

    it('returns displacement & fuel-aware recommendation when no DB rows match', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);

      // Small essence engine (< 2000cc)
      const resSmall = await service.findByCharacteristics(1400, 90, 'essence');
      expect(resSmall.status).toBe('found');
      if (resSmall.status === 'found') {
        expect(resSmall.oilSpec.viscosity).toBe('5W-30');
        expect(resSmall.resolvedBy).toBe('category-default');
        expect(resSmall.confidence).toBe('medium');
        expect(resSmall.backingRows).toBe(0);
      }

      // Large diesel engine (> 2000cc)
      const resLarge = await service.findByCharacteristics(2500, 190, 'diesel');
      expect(resLarge.status).toBe('found');
      if (resLarge.status === 'found') {
        expect(resLarge.oilSpec.viscosity).toBe('5W-40');
        expect(resLarge.oilSpec.apiStandard).toContain('CK-4');
        expect(resLarge.resolvedBy).toBe('category-default');
        expect(resLarge.confidence).toBe('medium');
        expect(resLarge.backingRows).toBe(0);
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
});
