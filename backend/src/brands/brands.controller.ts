import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { BrandsService } from './brands.service';

@Throttle({ default: { limit: 1200, ttl: 60000 } })
@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}
  @Get() findAll() {
    return this.brandsService.findAll();
  }

  @Get('featured') getFeatured() {
    return this.brandsService.getFeatured();
  }

  @Get(':slug') findOne(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }
}
