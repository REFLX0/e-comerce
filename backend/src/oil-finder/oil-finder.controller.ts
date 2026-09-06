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

  private async resolveProductsForSpec(oilSpec: OilSpecRef, vehicleMake?: string) {
    const oemTokens = oilSpec.oemApproval
      ? extractHomologationTokens(oilSpec.oemApproval).tokens
      : [];

    let productsResult = { data: [] as any[], total: 0 };
    let matchQuality: 'exact_oem' | 'compatible_grade' | 'viscosity_only' = 'exact_oem';

    // 1. Primary pass: match strictly by viscosity + exact OEM homologation tokens under huiles-moteur
    // (e.g. Castrol EDGE, Total Ineo Long Life, Shell Helix Ultra, Liqui Moly Top Tec 4200, Mannol Energy Combi LL)
    if (oemTokens.length > 0 && oilSpec.viscosity) {
      productsResult = await this.productsService.findAll({
        viscosity: oilSpec.viscosity,
        oemTokens,
        categorySlug: 'huiles-moteur',
      });
    }

    // 2. Secondary pass: ONLY if ZERO products found with exact OEM approval in catalog,
    // fallback to viscosity + ACEA standard matching so customer is not left with an empty page
    if (productsResult.total === 0 && oilSpec.viscosity && oilSpec.aceaStandard) {
      const aceaClean = oilSpec.aceaStandard.replace(/^ACEA\s+/i, '').split(/[\s,/]+/)[0];
      if (aceaClean) {
        productsResult = await this.productsService.findAll({
          viscosity: oilSpec.viscosity,
          acea: aceaClean,
          categorySlug: 'huiles-moteur',
        });
        if (productsResult.total > 0) {
          matchQuality = 'compatible_grade';
        }
      }
    }

    // 3. Fallback: match by viscosity under huiles-moteur
    if (productsResult.total === 0 && oilSpec.viscosity) {
      productsResult = await this.productsService.findAll({
        viscosity: oilSpec.viscosity,
        categorySlug: 'huiles-moteur',
      });
      if (productsResult.total > 0) {
        matchQuality = 'viscosity_only';
      }
    }

    // 4. Fallback: match by viscosity across all categories
    if (productsResult.total === 0 && oilSpec.viscosity) {
      productsResult = await this.productsService.findAll({
        viscosity: oilSpec.viscosity,
      });
      if (productsResult.total > 0) {
        matchQuality = 'viscosity_only';
      }
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

    // Intelligent Scoring, Sorting, and Approval Highlighting
    const makeKeywords = (vehicleMake || '').toLowerCase().split(/\s+/).filter((k) => k.length > 2);

    const scoredProducts = (productsResult.data || []).map((prod: any) => {
      let score = 0;
      const rawApprovals = Array.isArray(prod.specs?.oemApprovals)
        ? prod.specs.oemApprovals
        : [];
      const approvalsStr = rawApprovals.join(' ').toLowerCase();
      const titleLower = (prod.nameFr || '').toLowerCase();
      const descLower = (prod.description || '').toLowerCase();

      // Check if product contains any of the target OEM tokens
      const matchingTokens = oemTokens.filter((t) =>
        approvalsStr.includes(t.toLowerCase()) ||
        titleLower.includes(t.toLowerCase()) ||
        descLower.includes(t.toLowerCase())
      );

      if (matchingTokens.length > 0) {
        score += 1000 + matchingTokens.length * 100;
      }

      // Boost if title or description mentions the vehicle manufacturer
      for (const kw of makeKeywords) {
        if (titleLower.includes(kw) || approvalsStr.includes(kw)) {
          score += 150;
        }
      }

      // Fully synthetic boost
      if (prod.specs?.isFullySynth) {
        score += 50;
      }

      // Prioritize OEM approvals matching the vehicle manufacturer or target tokens at index 0
      const prioritizedApprovals = [...rawApprovals].sort((a: string, b: string) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aMatches = oemTokens.some((t) => aLower.includes(t.toLowerCase())) ||
          makeKeywords.some((kw) => aLower.includes(kw));
        const bMatches = oemTokens.some((t) => bLower.includes(t.toLowerCase())) ||
          makeKeywords.some((kw) => bLower.includes(kw));
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });

      return {
        ...prod,
        specs: prod.specs
          ? {
              ...prod.specs,
              oemApprovals: prioritizedApprovals,
            }
          : prod.specs,
        relevanceScore: score,
        isExactOemMatch: matchingTokens.length > 0,
      };
    });

    // Sort descending by relevance score
    scoredProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      data: scoredProducts,
      total: scoredProducts.length,
      matchQuality,
    };
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

    const productsResult = await this.resolveProductsForSpec(result.oilSpec, make);

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
