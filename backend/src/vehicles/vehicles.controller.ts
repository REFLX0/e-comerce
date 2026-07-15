import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('makes')
  getMakes() {
    return this.vehiclesService.getMakes();
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
  ) {
    return this.vehiclesService.getCompatibleProducts(make, model, engine);
  }
}
