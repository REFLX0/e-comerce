import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post() create(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('reorder') reorder(@Body() body: { ids: string[] }) {
    return this.categoriesService.reorder(body.ids);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id') update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id') delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
