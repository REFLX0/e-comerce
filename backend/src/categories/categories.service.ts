import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
          include: { 
            _count: { select: { products: true } },
            children: {
              orderBy: { sortOrder: 'asc' },
              include: { _count: { select: { products: true } } }
            }
          },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.nameFr,
      image: c.imageUrl,
      sortOrder: c.sortOrder,
      productCount: c._count.products + c.children.reduce((total, child) => 
        total + child._count.products + child.children.reduce((subTotal, subChild) => subTotal + subChild._count.products, 0)
      , 0),
      children: c.children.map((ch) => ({
        id: ch.id,
        slug: ch.slug,
        name: ch.nameFr,
        sortOrder: ch.sortOrder,
        productCount: ch._count.products + ch.children.reduce((subTotal, subChild) => subTotal + subChild._count.products, 0),
        children: ch.children.map((subCh) => ({
          id: subCh.id,
          slug: subCh.slug,
          name: subCh.nameFr,
          sortOrder: subCh.sortOrder,
          productCount: subCh._count.products,
        }))
      })),
    }));
  }

  async getTree() {
    return this.findAll();
  }

  async getFeatured() {
    const categories = await this.findAll();
    return categories.slice(0, 4);
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: { 
          orderBy: { sortOrder: 'asc' },
          include: {
            children: { orderBy: { sortOrder: 'asc' } },
            _count: { select: { products: true } }
          }
        },
        _count: { select: { products: true } },
      },
    });
  }

  async create(data: CreateCategoryDto) {
    const maxOrder = await this.prisma.category.aggregate({
      _max: { sortOrder: true },
    });
    return this.prisma.category.create({
      data: { ...data, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1 },
    });
  }

  async update(id: string, data: UpdateCategoryDto) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });
    return this.prisma.category.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    const parentCategories = await this.prisma.category.findMany({
      where: { parentId: null },
      select: { id: true },
    });
    const parentIds = new Set(parentCategories.map((category) => category.id));

    if (
      ids.length !== parentIds.size ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => !parentIds.has(id))
    ) {
      throw new BadRequestException('The category order must contain each parent category exactly once');
    }

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.category.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
  }
}
