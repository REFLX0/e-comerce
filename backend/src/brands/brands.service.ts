import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
  }

  async getFeatured() {
    const brands = await this.findAll()
    return brands.slice(0, 4)
  }

  findBySlug(slug: string) {
    return this.prisma.brand.findUnique({ where: { slug }, include: { _count: { select: { products: true } } } })
  }
}
