import { Test, TestingModule } from '@nestjs/testing'
import { OilFinderService } from './oil-finder.service'
import { PrismaService } from '../prisma/prisma.service'

// ── Fixtures (mirror the imported staging rows) ──────────────────────────
const spec5w40 = {
  id: 's1',
  viscosity: '5W-40',
  apiStandard: 'API SN',
  aceaStandard: 'ACEA A3/B4',
  oemApproval: null,
  capacityLiters: 4.5,
  changeIntervalKm: 15000,
}
const spec5w40ApiPlus = {
  id: 's2',
  viscosity: '5W-40',
  apiStandard: 'API SN PLUS',
  aceaStandard: 'ACEA A3/B4',
  oemApproval: null,
  capacityLiters: 4.5,
  changeIntervalKm: 15000,
}
const spec0w30C3 = {
  id: 's3',
  viscosity: '0W-30',
  apiStandard: 'API C3',
  aceaStandard: 'ACEA C3',
  oemApproval: null,
  capacityLiters: 5,
  changeIntervalKm: 30000,
}
const spec5w30C3 = {
  id: 's4',
  viscosity: '5W-30',
  apiStandard: 'API C3',
  aceaStandard: 'ACEA C3',
  oemApproval: null,
  capacityLiters: 5,
  changeIntervalKm: 30000,
}

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
})

const mkConflict = (overrides: Record<string, unknown> = {}) => ({
  id: `c-${Math.random()}`,
  displacementCc: 1598,
  powerHp: 110,
  fuelType: 'essence',
  highestSeverity: 'MINOR',
  fieldSeverities: { oilSpecAPI: 'minor' },
  candidateCount: 2,
  rawReport: null,
  ...overrides,
})

describe('OilFinderService', () => {
  let service: OilFinderService
  let prisma: {
    oilFinderVehicle: { findMany: jest.Mock }
    oilFinderLookupConflict: { findUnique: jest.Mock }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OilFinderService,
        {
          provide: PrismaService,
          useValue: {
            oilFinderVehicle: { findMany: jest.fn() },
            oilFinderLookupConflict: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile()

    service = module.get(OilFinderService)
    prisma = module.get(PrismaService)
  })

  describe('findByVehicle — exact vehicle lookup', () => {
    it('returns exactly one oil spec for a clean make/model/engineCode lookup', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([row()])

      const result = await service.findByVehicle('Renault', 'Clio IV', 'K4M')

      expect(result.status).toBe('found')
      if (result.status !== 'found') return
      expect(result.oilSpec.viscosity).toBe('5W-40')
      expect(result.resolvedBy).toBe('exact')
      expect(result.backingRows).toBe(1)
      // exactly one result, not a list of guesses
      expect(result.candidates).toHaveLength(1)
    })

    it('filters by engineCode when provided', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([row()])

      await service.findByVehicle('Renault', 'Clio IV', 'K4M')

      expect(prisma.oilFinderVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { make: 'Renault', model: 'Clio IV', engineCode: 'K4M' } }),
      )
    })

    it('treats missing engineCode as a wildcard', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([row()])

      await service.findByVehicle('Renault', 'Clio IV')

      const where = prisma.oilFinderVehicle.findMany.mock.calls[0][0].where
      expect(where.engineCode).toBeUndefined()
    })

    it('returns a graceful not_found for an unknown make/model/engineCode (no crash)', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([])

      const result = await service.findByVehicle('Bentley', 'Continental GT', 'W12')

      expect(result.status).toBe('not_found')
      if (result.status === 'not_found') {
        expect(result.message).toContain('no oil spec found')
      }
    })

    it('returns one spec when multiple SOURCES agree (backingRows > 1, still exact)', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([
        row({ source: 'oponeo.fr' }),
        row({ source: 'autodoc.fr' }),
      ])

      const result = await service.findByVehicle('Renault', 'Clio IV', 'K4M')

      expect(result.status).toBe('found')
      if (result.status !== 'found') return
      expect(result.backingRows).toBe(2)
      expect(result.resolvedBy).toBe('exact')
    })

    it('FLAGS a data bug when two sources give different specs for the same vehicle', async () => {
      prisma.oilFinderVehicle.findMany.mockResolvedValue([
        row({ source: 'oponeo.fr', oilSpec: spec5w40 }),
        row({ source: 'autodoc.fr', oilSpec: spec5w30C3 }),
      ])

      const result = await service.findByVehicle('Renault', 'Clio IV', 'K4M')

      expect(result.status).toBe('ambiguous')
      if (result.status !== 'ambiguous') return
      expect(result.candidates).toHaveLength(2)
      // never a guessed spec
      expect(result).not.toHaveProperty('oilSpec')
    })
  })

  describe('findByCharacteristics — severity-gated characteristics lookup', () => {
    it('hits zero conflicts → safe direct match (exact)', async () => {
      prisma.oilFinderLookupConflict.findUnique.mockResolvedValue(null)
      prisma.oilFinderVehicle.findMany.mockResolvedValue([row()])

      const result = await service.findByCharacteristics(1598, 110, 'essence')

      expect(result.status).toBe('found')
      if (result.status !== 'found') return
      expect(result.resolvedBy).toBe('exact')
      expect(result.oilSpec.viscosity).toBe('5W-40')
    })

    it('hits a MINOR conflict (API naming only) → still auto-resolves, flagged', async () => {
      prisma.oilFinderLookupConflict.findUnique.mockResolvedValue(
        mkConflict({ highestSeverity: 'MINOR', fieldSeverities: { oilSpecAPI: 'minor' } }),
      )
      prisma.oilFinderVehicle.findMany.mockResolvedValue([
        row({ make: 'Volkswagen', model: 'Golf VII', engineCode: 'CHPA', oilSpec: spec5w40 }),
        row({ make: 'Seat', model: 'Leon III', engineCode: 'CHPA', oilSpec: spec5w40ApiPlus }),
      ])

      const result = await service.findByCharacteristics(1598, 110, 'essence')

      expect(result.status).toBe('found')
      if (result.status !== 'found') return
      expect(result.resolvedBy).toBe('minor-conflict-auto-resolve')
      expect(result.oilSpec.viscosity).toBe('5W-40')
      expect(result.candidates).toHaveLength(2)
    })

    it('hits a MAJOR conflict (viscosity differs) → disambiguation response, NEVER a guessed spec', async () => {
      prisma.oilFinderLookupConflict.findUnique.mockResolvedValue(
        mkConflict({
          displacementCc: 1997,
          powerHp: 140,
          fuelType: 'diesel',
          highestSeverity: 'MAJOR',
          fieldSeverities: { oilViscosity: 'major' },
        }),
      )
      prisma.oilFinderVehicle.findMany.mockResolvedValue([
        row({ make: 'Toyota', model: 'Auris', engineCode: '1WW', displacementCc: 1997, powerHp: 140, fuelType: 'diesel', oilSpec: spec0w30C3 }),
        row({ make: 'Volkswagen', model: 'Passat B8', engineCode: 'DFGA', displacementCc: 1997, powerHp: 140, fuelType: 'diesel', oilSpec: spec5w30C3 }),
      ])

      const result = await service.findByCharacteristics(1997, 140, 'diesel')

      expect(result.status).toBe('ambiguous')
      if (result.status !== 'ambiguous') return
      expect(result.message).toContain('needs make/model')
      expect(result.candidates).toHaveLength(2)
      expect(result.candidates.map((c) => c.oilSpec.viscosity).sort()).toEqual(['0W-30', '5W-30'])
      // the whole point: no oil spec is silently picked
      expect(result).not.toHaveProperty('oilSpec')
    })

    it('no matching displacement/power/fuel at all → graceful not_found, no crash', async () => {
      prisma.oilFinderLookupConflict.findUnique.mockResolvedValue(null)
      prisma.oilFinderVehicle.findMany.mockResolvedValue([])

      const result = await service.findByCharacteristics(9999, 1, 'essence')

      expect(result.status).toBe('not_found')
      if (result.status === 'not_found') {
        expect(result.message).toContain('no match found')
      }
    })

    it('normalizes fuelType casing before querying', async () => {
      prisma.oilFinderLookupConflict.findUnique.mockResolvedValue(null)
      prisma.oilFinderVehicle.findMany.mockResolvedValue([row()])

      await service.findByCharacteristics(1598, 110, 'Essence')

      expect(prisma.oilFinderLookupConflict.findUnique).toHaveBeenCalledWith({
        where: { displacementCc_powerHp_fuelType: { displacementCc: 1598, powerHp: 110, fuelType: 'essence' } },
      })
      expect(prisma.oilFinderVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { displacementCc: 1598, powerHp: 110, fuelType: 'essence' } }),
      )
    })

    it('MAJOR conflict with no candidate rows → still ambiguous (data inconsistency), not a guess', async () => {
      prisma.oilFinderLookupConflict.findUnique.mockResolvedValue(
        mkConflict({ highestSeverity: 'MAJOR', fieldSeverities: { oilSpecACEA: 'major' } }),
      )
      prisma.oilFinderVehicle.findMany.mockResolvedValue([])

      const result = await service.findByCharacteristics(1598, 110, 'essence')

      expect(result.status).toBe('ambiguous')
      expect(result.candidates).toHaveLength(0)
    })
  })
})
