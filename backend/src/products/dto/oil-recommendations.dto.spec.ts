import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { OilRecommendationsDto } from './oil-recommendations.dto';

describe('OilRecommendationsDto', () => {
  it('accepts lowercase vehicleType and fuelType (as frontend sends) and transforms to uppercase', async () => {
    const dto = plainToInstance(OilRecommendationsDto, {
      vehicleType: 'automobile',
      cylinders: 4,
      power: 90,
      fuelType: 'essence',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.vehicleType).toBe('AUTOMOBILE');
    expect(dto.fuelType).toBe('ESSENCE');
  });

  it('rejects garbage vehicleType value', async () => {
    const dto = plainToInstance(OilRecommendationsDto, {
      vehicleType: 'spaceship',
      cylinders: 4,
      power: 90,
      fuelType: 'essence',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('vehicleType');
  });

  it('rejects garbage fuelType value', async () => {
    const dto = plainToInstance(OilRecommendationsDto, {
      vehicleType: 'automobile',
      cylinders: 4,
      power: 90,
      fuelType: 'hydrogen',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('fuelType');
  });

  it('accepts uppercase values directly (internal API call)', async () => {
    const dto = plainToInstance(OilRecommendationsDto, {
      vehicleType: 'AUTOMOBILE',
      cylinders: 4,
      power: 90,
      fuelType: 'ESSENCE',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
