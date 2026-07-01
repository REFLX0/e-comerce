import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CategoriesService } from './categories.service'

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get() findAll() { return this.categoriesService.findAll() }
  
  @Get('tree') getTree() { return this.categoriesService.getTree() }
  
  @Get('featured') getFeatured() { return this.categoriesService.getFeatured() }
  
  @Get(':slug') findOne(@Param('slug') slug: string) { return this.categoriesService.findBySlug(slug) }
}
