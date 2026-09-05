import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FindByVehicleDto } from './find-by-vehicle.dto';
import { FindByCharacteristicsDto } from './find-by-characteristics.dto';

describe('OilFinder DTOs', () => {
  describe('FindByVehicleDto', () => {
    it('accepts valid make, model, and engineCode', async () => {
      const dto = plainToInstance(FindByVehicleDto, {
        make: 'Volkswagen',
        model: 'Golf',
        engineCode: 'CJAA',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.make).toBe('Volkswagen');
      expect(dto.model).toBe('Golf');
      expect(dto.engineCode).toBe('CJAA');
    });

    it('trims whitespace on inputs', async () => {
      const dto = plainToInstance(FindByVehicleDto, {
        make: '  BMW  ',
        model: '  3 Series  ',
        engineCode: '  N47  ',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.make).toBe('BMW');
      expect(dto.model).toBe('3 Series');
      expect(dto.engineCode).toBe('N47');
    });

    it('treats empty engineCode as undefined when trimmed', async () => {
      const dto = plainToInstance(FindByVehicleDto, {
        make: 'BMW',
        model: '3 Series',
        engineCode: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.engineCode).toBeUndefined();
    });

    it('rejects make exceeding 100 characters', async () => {
      const dto = plainToInstance(FindByVehicleDto, {
        make: 'A'.repeat(101),
        model: 'Golf',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('make');
    });

    it('rejects model exceeding 100 characters', async () => {
      const dto = plainToInstance(FindByVehicleDto, {
        make: 'VW',
        model: 'B'.repeat(101),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('model');
    });

    it('rejects engineCode exceeding 100 characters', async () => {
      const dto = plainToInstance(FindByVehicleDto, {
        make: 'VW',
        model: 'Golf',
        engineCode: 'C'.repeat(101),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('engineCode');
    });

    it('rejects missing or empty make/model', async () => {
      const dto = plainToInstance(FindByVehicleDto, {
        make: '   ',
        model: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const props = errors.map((e) => e.property);
      expect(props).toContain('make');
      expect(props).toContain('model');
    });
  });

  describe('FindByCharacteristicsDto', () => {
    it('accepts valid numeric displacementCc and powerHp strings from query params', async () => {
      const dto = plainToInstance(FindByCharacteristicsDto, {
        displacementCc: '1995',
        powerHp: '150',
        fuelType: 'diesel',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.displacementCc).toBe(1995);
      expect(dto.powerHp).toBe(150);
      expect(dto.fuelType).toBe('diesel');
    });

    it('rejects non-numeric displacementCc (e.g. abc)', async () => {
      const dto = plainToInstance(FindByCharacteristicsDto, {
        displacementCc: 'abc',
        powerHp: '150',
        fuelType: 'diesel',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('displacementCc');
    });

    it('rejects non-numeric powerHp (e.g. xyz)', async () => {
      const dto = plainToInstance(FindByCharacteristicsDto, {
        displacementCc: '1995',
        powerHp: 'xyz',
        fuelType: 'diesel',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('powerHp');
    });

    it('rejects negative or zero numbers', async () => {
      const dto = plainToInstance(FindByCharacteristicsDto, {
        displacementCc: '-500',
        powerHp: '0',
        fuelType: 'diesel',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const props = errors.map((e) => e.property);
      expect(props).toContain('displacementCc');
      expect(props).toContain('powerHp');
    });

    it('rejects missing fuelType', async () => {
      const dto = plainToInstance(FindByCharacteristicsDto, {
        displacementCc: '1995',
        powerHp: '150',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('fuelType');
    });
  });
});
