import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiQuery } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import { OilRecommendationsDto } from './dto/oil-recommendations.dto'

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: Record<string, string>) {
    return this.productsService.findAll({
      categorySlug: query.categorySlug,
      brandSlug: query.brandSlug,
      viscosity: query.viscosity,
      priceMin: query.priceMin ? +query.priceMin : undefined,
      priceMax: query.priceMax ? +query.priceMax : undefined,
      inStockOnly: query.inStockOnly === 'true',
      isPromo: query.isPromo === 'true',
      isFeatured: query.isFeatured === 'true',
      search: query.search || query.q,
      sortBy: query.sortBy,
      page: query.page ? +query.page : 1,
      limit: query.limit ? +query.limit : 24,
      type: query.type,
      api: query.api,
      acea: query.acea,
      volume: query.volume,
    })
  }

  @Get('oil-recommendations')
  oilRecommendations(@Query() dto: OilRecommendationsDto) {
    return this.productsService.findOilRecommendations(dto)
  }

  @Get('best-sellers')
  bestSellers(@Query('limit') limit?: string) {
    return this.productsService.findBestSellers(limit ? +limit : 8)
  }

  @Get('new')
  findNew(@Query('limit') limit?: string) {
    return this.productsService.findNew(limit ? +limit : 8)
  }

  @Get('facets')
  getFacets(@Query() query: Record<string, string>) {
    return this.productsService.getFacets({
      categorySlug: query.categorySlug,
      search: query.search || query.q,
    })
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug)
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  @Get(':id/related')
  findRelated(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.productsService.findRelated(id, limit ? +limit : 6)
  }
}
