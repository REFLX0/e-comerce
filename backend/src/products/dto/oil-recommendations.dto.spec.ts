import 'reflect-metadata'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { OilRecommendationsDto } from './oil-recommendations.dto'

describe('OilRecommendationsDto', () => {
  it('accepts lowercase type and fuelType (as frontend sends) and transforms to uppercase', async () => {
    const dto = plainToInstance(OilRecommendationsDto, {
      type: 'car',
      cylinders: 4,
      power: 90,
      fuelType: 'essence',
    })

    const errors = await validate(dto)

    expect(errors).toHaveLength(0)
    expect(dto.type).toBe('CAR')
    expect(dto.fuelType).toBe('ESSENCE')
  })

  it('rejects garbage type value', async () => {
    const dto = plainToInstance(OilRecommendationsDto, {
      type: 'spaceship',
      cylinders: 4,
      power: 90,
      fuelType: 'essence',
    })

    const errors = await validate(dto)

    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('type')
  })

  it('rejects garbage fuelType value', async () => {
    const dto = plainToInstance(OilRecommendationsDto, {
      type: 'car',
      cylinders: 4,
      power: 90,
      fuelType: 'hydrogen',
    })

    const errors = await validate(dto)

    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('fuelType')
  })

  it('accepts uppercase values directly (internal API call)', async () => {
    const dto = plainToInstance(OilRecommendationsDto, {
      type: 'CAR',
      cylinders: 4,
      power: 90,
      fuelType: 'ESSENCE',
    })

    const errors = await validate(dto)

    expect(errors).toHaveLength(0)
  })
})
