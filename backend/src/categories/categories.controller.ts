import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get() findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree') getTree() {
    return this.categoriesService.getTree();
  }

  @Get('featured') getFeatured() {
    return this.categoriesService.getFeatured();
  }

  @Get(':slug') findOne(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post() create(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body);
  }

  @Patch('reorder') reorder(@Body() body: { ids: string[] }) {
    return this.categoriesService.reorder(body.ids);
  }

  @Patch(':id') update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, body);
  }

  @Delete(':id') delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
