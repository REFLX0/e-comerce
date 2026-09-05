import { Controller, Get, Query, Param, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OilFinderService } from './oil-finder.service';
import { ProductsService } from '../products/products.service';
import { FindByVehicleDto } from './dto/find-by-vehicle.dto';
import { FindByCharacteristicsDto } from './dto/find-by-characteristics.dto';

@ApiTags('oil-finder')
@Controller('oil-finder')
export class OilFinderController {
  constructor(
    private readonly oilFinderService: OilFinderService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('vehicle')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findByVehicle(@Query() dto: FindByVehicleDto) {
    const make = dto.make?.trim();
    const model = dto.model?.trim();
    const engineCode = dto.engineCode?.trim() || undefined;

    if (!make || !model) {
      throw new BadRequestException('make and model are required query parameters');
    }
    if (make.length > 100 || model.length > 100 || (engineCode && engineCode.length > 100)) {
      throw new BadRequestException('make, model, and engineCode must not exceed 100 characters');
    }
    
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findByCharacteristics(@Query() dto: FindByCharacteristicsDto) {
    const displacement = Number(dto.displacementCc);
    const power = Number(dto.powerHp);

    if (!Number.isFinite(displacement) || displacement <= 0 || !Number.isFinite(power) || power <= 0) {
      throw new BadRequestException('displacementCc and powerHp must be positive finite numbers');
    }

    const fuelType = dto.fuelType?.trim();
    if (!fuelType) {
      throw new BadRequestException('fuelType is required');
    }

    const result = await this.oilFinderService.findByCharacteristics(
      displacement,
      power,
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
