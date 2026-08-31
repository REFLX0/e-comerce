import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export type TreeNode = {
  id: string;
  slug: string;
  name: string;
  image?: string | null;
  sortOrder: number;
  parentId?: string | null;
  productCount: number;
  children: TreeNode[];
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TreeNode[]> {
    const all = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });

    const map = new Map<string, TreeNode>();
    for (const c of all) {
      map.set(c.id, {
        id: c.id,
        slug: c.slug,
        name: c.nameFr,
        image: c.imageUrl,
        sortOrder: c.sortOrder,
        parentId: c.parentId,
        productCount: c._count.products,
        children: [],
      });
    }

    const roots: TreeNode[] = [];
    for (const item of map.values()) {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children.push(item);
      } else {
        roots.push(item);
      }
    }

    function rollupProductCount(node: TreeNode): number {
      let sum = node.productCount;
      for (const child of node.children) {
        sum += rollupProductCount(child);
      }
      node.productCount = sum;
      return sum;
    }

    for (const root of roots) {
      rollupProductCount(root);
    }

    return roots;
  }

  async getTree() {
    return this.findAll();
  }

  async getFeatured() {
    const categories = await this.findAll();
    return categories.slice(0, 4);
  }

  async findBySlug(slug: string) {
    const cat = await this.prisma.category.findUnique({
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

    if (cat) return cat;

    // Fallback virtual category object for automotive taxonomy and TecDoc navigation
    const formattedName = slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      id: slug,
      slug,
      nameFr: formattedName,
      nameAr: formattedName,
      nameEn: formattedName,
      description: `Catalogue de pièces et composants pour ${formattedName}`,
      imageUrl: null,
      sortOrder: 0,
      parentId: null,
      children: [],
      _count: { products: 5000 },
    };
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
