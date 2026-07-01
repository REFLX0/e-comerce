import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      include: { children: true, _count: { select: { products: true } } },
    })
    return categories.map(c => ({
      id: c.id, slug: c.slug, name: c.nameFr, image: c.imageUrl,
      productCount: c._count.products,
      children: c.children.map(ch => ({ id: ch.id, slug: ch.slug, name: ch.nameFr })),
    }))
  }

  async getTree() {
    return this.findAll()
  }

  async getFeatured() {
    const categories = await this.findAll()
    return categories.slice(0, 4)
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: { children: true, _count: { select: { products: true } } },
    })
  }
}
