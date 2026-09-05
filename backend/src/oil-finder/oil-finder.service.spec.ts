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

    it('returns status not_found enriched with automobile classification for Volkswagen', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_car: true }]);

      const result = await service.findByVehicle('Volkswagen', 'Golf');

      expect(result.status).toBe('not_found');
      if (result.status === 'not_found') {
        expect(result.message).toContain('automobile');
      }
    });

    it('returns status not_found enriched with automobile classification for BMW', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_car: true }]);

      const result = await service.findByVehicle('BMW', '3 Series');

      expect(result.status).toBe('not_found');
      if (result.status === 'not_found') {
        expect(result.message).toContain('automobile');
      }
    });

    it('returns status not_found enriched with automobile classification for Renault', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([]);
      prisma.$queryRawUnsafe.mockResolvedValueOnce([{ is_car: true }]);

      const result = await service.findByVehicle('Renault', 'Megane');

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
});
