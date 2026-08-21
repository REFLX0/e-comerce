import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OilFinderService } from './oil-finder.service';
import { ProductsService } from '../products/products.service';

@ApiTags('oil-finder')
@Controller('oil-finder')
export class OilFinderController {
  constructor(
    private readonly oilFinderService: OilFinderService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('vehicle')
  async findByVehicle(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('engineCode') engineCode?: string,
  ) {
    if (!make || !model) return { data: [], total: 0 };
    
    const result = await this.oilFinderService.findByVehicle(make, model, engineCode);
    if (result.status !== 'found') {
      return { data: [], total: 0, status: result.status };
    }

    // Now that we have the exact OilSpecRef, query ProductsService for matching oils
    const productsResult = await this.productsService.findAll({
      viscosity: result.oilSpec.viscosity,
      acea: result.oilSpec.aceaStandard ?? undefined,
      api: result.oilSpec.apiStandard ?? undefined,
      oem: result.oilSpec.oemApproval ?? undefined,
      categorySlug: 'huiles-moteur', // Ensure we only return oils
    });

    return {
      ...productsResult,
      oilFinderStatus: result.status,
      oilSpec: result.oilSpec,
    };
  }

  @Get('specs')
  async findByCharacteristics(
    @Query('displacementCc') displacementCc: string,
    @Query('powerHp') powerHp: string,
    @Query('fuelType') fuelType: string,
  ) {
    if (!displacementCc || !powerHp || !fuelType) return { data: [], total: 0 };

    const result = await this.oilFinderService.findByCharacteristics(
      Number(displacementCc),
      Number(powerHp),
      fuelType,
    );

    if (result.status !== 'found') {
      return { data: [], total: 0, status: result.status };
    }

    const productsResult = await this.productsService.findAll({
      viscosity: result.oilSpec.viscosity,
      acea: result.oilSpec.aceaStandard ?? undefined,
      api: result.oilSpec.apiStandard ?? undefined,
      oem: result.oilSpec.oemApproval ?? undefined,
      categorySlug: 'huiles-moteur',
    });

    return {
      ...productsResult,
      oilFinderStatus: result.status,
      oilSpec: result.oilSpec,
    };
  }
}
