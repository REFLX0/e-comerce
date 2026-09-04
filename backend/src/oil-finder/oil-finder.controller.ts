import { Controller, Get, Query, Param } from '@nestjs/common';
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
      return { data: [], total: 0, status: result.status, message: result.message };
    }

    // 1. Try matching with full specifications (viscosity + OEM/ACEA/API)
    let productsResult = await this.productsService.findAll({
      viscosity: result.oilSpec.viscosity,
      acea: result.oilSpec.aceaStandard ?? undefined,
      api: result.oilSpec.apiStandard ?? undefined,
      categorySlug: 'huiles-moteur',
    });

    // 2. Fallback: match by viscosity under huiles-moteur
    if (productsResult.total === 0) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
        categorySlug: 'huiles-moteur',
      });
    }

    // 3. Fallback: match by viscosity across all categories (in case oil is in 'automobile' or uncategorized)
    if (productsResult.total === 0) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
      });
    }

    // 4. Ultimate fallback: search by viscosity keyword (e.g. "5W-30" or "5W30")
    if (productsResult.total === 0 && result.oilSpec.viscosity) {
      productsResult = await this.productsService.findAll({
        search: result.oilSpec.viscosity,
      });
    }

    return {
      ...productsResult,
      oilFinderStatus: result.status,
      oilSpec: result.oilSpec,
      resolvedBy: result.resolvedBy,
      confidence: result.confidence,
      backingRows: result.backingRows,
      candidates: result.candidates,
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
      return { data: [], total: 0, status: result.status, message: result.message };
    }

    let productsResult = await this.productsService.findAll({
      viscosity: result.oilSpec.viscosity,
      acea: result.oilSpec.aceaStandard ?? undefined,
      api: result.oilSpec.apiStandard ?? undefined,
      oem: result.oilSpec.oemApproval ?? undefined,
      categorySlug: 'huiles-moteur',
    });

    if (productsResult.total === 0 && result.oilSpec.oemApproval) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
        acea: result.oilSpec.aceaStandard ?? undefined,
        api: result.oilSpec.apiStandard ?? undefined,
        categorySlug: 'huiles-moteur',
      });
    }

    if (productsResult.total === 0 && result.oilSpec.apiStandard && result.oilSpec.aceaStandard) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
        acea: result.oilSpec.aceaStandard ?? undefined,
        categorySlug: 'huiles-moteur',
      });
    }

    if (productsResult.total === 0) {
      productsResult = await this.productsService.findAll({
        viscosity: result.oilSpec.viscosity,
        categorySlug: 'huiles-moteur',
      });
    }

    return {
      ...productsResult,
      oilFinderStatus: result.status,
      oilSpec: result.oilSpec,
      resolvedBy: result.resolvedBy,
      confidence: result.confidence,
      backingRows: result.backingRows,
      candidates: result.candidates,
    };
  }

  @Get('makes')
  async getMakes(@Query('category') category?: string) {
    return this.oilFinderService.getMakes(category);
  }

  @Get('makes/:make/models')
  async getModels(@Param('make') make: string) {
    return this.oilFinderService.getModels(make);
  }

  @Get('models/:make/:model/engines')
  async getEngines(
    @Param('make') make: string,
    @Param('model') model: string,
  ) {
    return this.oilFinderService.getEngines(make, model);
  }
}
