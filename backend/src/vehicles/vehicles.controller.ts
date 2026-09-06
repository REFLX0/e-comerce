import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('makes')
  getMakes(@Query('vehicleType') vehicleType?: string) {
    return this.vehiclesService.getMakes(vehicleType);
  }

  @Get('makes/:makeSlug/models')
  getModels(@Param('makeSlug') makeSlug: string) {
    return this.vehiclesService.getModels(makeSlug);
  }

  @Get('models/:modelSlug/engines')
  getEngines(@Param('modelSlug') modelSlug: string) {
    return this.vehiclesService.getEngines(modelSlug);
  }

  @Get('compatible')
  getCompatible(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('engine') engine?: string,
    @Query('specification') specification?: string,
  ) {
    return this.vehiclesService.getCompatibleProducts(make, model, engine, specification);
  }

  @Get('compatible/page')
  getCompatiblePage(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('engine') engine?: string,
    @Query() filters: Record<string, string> = {},
  ) {
    return this.vehiclesService.getCompatiblePage(make, model, engine, {
      generation: filters.generation || undefined,
      categorySlug: filters.categorySlug || undefined,
      brands: filters.brands || undefined,
      viscosity: filters.viscosity || undefined,
      batteryType: filters.batteryType || undefined,
      priceMin: filters.priceMin !== undefined ? Number(filters.priceMin) : undefined,
      priceMax: filters.priceMax !== undefined ? Number(filters.priceMax) : undefined,
      inStockOnly: filters.inStockOnly === 'true' ? true : undefined,
      isNew: filters.isNew === 'true' ? true : undefined,
      isFeatured: filters.isFeatured === 'true' ? true : undefined,
      search: filters.search || undefined,
      type: filters.type || undefined,
      api: filters.api || undefined,
      acea: filters.acea || undefined,
      volume: filters.volume || undefined,
      sortBy: filters.sortBy || undefined,
      page: filters.page !== undefined ? Number(filters.page) : undefined,
      limit: filters.limit !== undefined ? Number(filters.limit) : undefined,
    });
  }
}
