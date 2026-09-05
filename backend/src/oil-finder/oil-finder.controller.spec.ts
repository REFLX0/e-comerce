import { BadRequestException } from '@nestjs/common';
import { OilFinderController } from './oil-finder.controller';
import { OilFinderService } from './oil-finder.service';
import { ProductsService } from '../products/products.service';

describe('OilFinderController', () => {
  let controller: OilFinderController;
  let mockOilFinderService: Partial<OilFinderService>;
  let mockProductsService: Partial<ProductsService>;

  beforeEach(() => {
    mockOilFinderService = {
      findByVehicle: jest.fn().mockResolvedValue({
        status: 'found',
        oilSpec: { viscosity: '5W-30', aceaStandard: 'C3', apiStandard: 'SN' },
        resolvedBy: 'exact',
        confidence: 'high',
        backingRows: 1,
      }),
      findByCharacteristics: jest.fn().mockResolvedValue({
        status: 'found',
        oilSpec: { viscosity: '5W-30', aceaStandard: 'C3', apiStandard: 'SN', oemApproval: 'BMW LL-04' },
        resolvedBy: 'exact',
        confidence: 'high',
        backingRows: 1,
      }),
    };

    mockProductsService = {
      findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    };

    controller = new OilFinderController(
      mockOilFinderService as OilFinderService,
      mockProductsService as ProductsService,
    );
  });

  describe('findByVehicle', () => {
    it('passes valid trimmed query parameters to the service', async () => {
      await controller.findByVehicle({
        make: '  Volkswagen  ',
        model: '  Golf  ',
        engineCode: '  CJAA  ',
      });

      expect(mockOilFinderService.findByVehicle).toHaveBeenCalledWith(
        'Volkswagen',
        'Golf',
        'CJAA',
      );
    });

    it('rejects missing make with BadRequestException (HTTP 400)', async () => {
      await expect(
        controller.findByVehicle({
          make: '',
          model: 'Golf',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects make exceeding 100 characters with BadRequestException (HTTP 400)', async () => {
      await expect(
        controller.findByVehicle({
          make: 'A'.repeat(101),
          model: 'Golf',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects model exceeding 100 characters with BadRequestException (HTTP 400)', async () => {
      await expect(
        controller.findByVehicle({
          make: 'Volkswagen',
          model: 'B'.repeat(101),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects engineCode exceeding 100 characters with BadRequestException (HTTP 400)', async () => {
      await expect(
        controller.findByVehicle({
          make: 'Volkswagen',
          model: 'Golf',
          engineCode: 'C'.repeat(101),
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByCharacteristics', () => {
    it('passes valid positive numeric values to the service', async () => {
      await controller.findByCharacteristics({
        displacementCc: 1995,
        powerHp: 150,
        fuelType: 'diesel',
      });

      expect(mockOilFinderService.findByCharacteristics).toHaveBeenCalledWith(
        1995,
        150,
        'diesel',
      );
    });

    it('rejects NaN or non-finite displacementCc with BadRequestException (HTTP 400)', async () => {
      await expect(
        controller.findByCharacteristics({
          displacementCc: NaN,
          powerHp: 150,
          fuelType: 'diesel',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects negative displacementCc with BadRequestException (HTTP 400)', async () => {
      await expect(
        controller.findByCharacteristics({
          displacementCc: -100,
          powerHp: 150,
          fuelType: 'diesel',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects zero or negative powerHp with BadRequestException (HTTP 400)', async () => {
      await expect(
        controller.findByCharacteristics({
          displacementCc: 1995,
          powerHp: 0,
          fuelType: 'diesel',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects empty fuelType with BadRequestException (HTTP 400)', async () => {
      await expect(
        controller.findByCharacteristics({
          displacementCc: 1995,
          powerHp: 150,
          fuelType: '   ',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
