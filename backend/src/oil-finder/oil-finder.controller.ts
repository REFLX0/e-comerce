import { Controller, Get, Query, Param, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OilFinderService, OilSpecRef } from './oil-finder.service';
import { ProductsService } from '../products/products.service';
import { FindByVehicleDto } from './dto/find-by-vehicle.dto';
import { FindByCharacteristicsDto } from './dto/find-by-characteristics.dto';
import { extractHomologationTokens } from '../common/utils/homologations';

@ApiTags('oil-finder')
@Controller('oil-finder')
export class OilFinderController {
  constructor(
    private readonly oilFinderService: OilFinderService,
    private readonly productsService: ProductsService,
  ) {}

  private async resolveProductsForSpec(oilSpec: OilSpecRef) {
    const oemTokens = oilSpec.oemApproval
      ? extractHomologationTokens(oilSpec.oemApproval).tokens
      : [];

    let productsResult = { data: [] as any[], total: 0 };

    // 1. Primary pass: match by viscosity + OEM homologation tokens under huiles-moteur
    // (e.g. Castrol EDGE, Total Ineo Long Life, Shell Helix Ultra)
    if (oemTokens.length > 0 && oilSpec.viscosity) {
      productsResult = await this.productsService.findAll({
        viscosity: oilSpec.viscosity,
        oemTokens,
        categorySlug: 'huiles-moteur',
      });
    }

    // 2. Secondary pass: if < 4 products found, augment with ACEA standard matching
    if (productsResult.data.length < 4 && oilSpec.viscosity && oilSpec.aceaStandard) {
      const aceaClean = oilSpec.aceaStandard.replace(/^ACEA\s+/i, '').split(/[\s,/]+/)[0];
      if (aceaClean) {
        const aceaResults = await this.productsService.findAll({
          viscosity: oilSpec.viscosity,
          acea: aceaClean,
          categorySlug: 'huiles-moteur',
        });
        if (aceaResults.data && aceaResults.data.length > 0) {
          const existingIds = new Set(productsResult.data.map((p) => p.id));
          const added = aceaResults.data.filter((p: any) => !existingIds.has(p.id));
          productsResult.data.push(...added);
          productsResult.total = productsResult.data.length;
        }
      }
    }

    // 3. Fallback: match by viscosity under huiles-moteur
    if (productsResult.total === 0 && oilSpec.viscosity) {
      productsResult = await this.productsService.findAll({
        viscosity: oilSpec.viscosity,
        categorySlug: 'huiles-moteur',
      });
    }

    // 4. Fallback: match by viscosity across all categories
    if (productsResult.total === 0 && oilSpec.viscosity) {
      productsResult = await this.productsService.findAll({
        viscosity: oilSpec.viscosity,
      });
    }

    // 5. Ultimate fallback: search by viscosity keyword (e.g. "5W-30" or "5W30")
    if (productsResult.total === 0 && oilSpec.viscosity) {
      productsResult = await this.productsService.findAll({
        search: oilSpec.viscosity,
      });
    }

    // 6. Production safety net: ensure top motor oils are presented if specific spec has no exact matches in catalog
    if (productsResult.total === 0) {
      productsResult = await this.productsService.findAll({
        categorySlug: 'huiles-moteur',
      });
      if (productsResult.total === 0) {
        productsResult = await this.productsService.findAll({
          limit: 12,
        });
      }
    }

    return productsResult;
  }

  @Get('vehicle')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findByVehicle(@Query() dto: FindByVehicleDto) {
    const make = dto.make?.trim();
    const model = dto.model?.trim();
    const engineCode = dto.engineCode?.trim() || dto.engine?.trim() || undefined;

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

    const productsResult = await this.resolveProductsForSpec(result.oilSpec);

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

    const productsResult = await this.resolveProductsForSpec(result.oilSpec);

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
