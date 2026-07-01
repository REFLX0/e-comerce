import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(query: string) {
    if (!query || query.trim().length < 2) return { products: [], categories: [], brands: [] }

    const q = query.trim()

    const [products, categories, brands] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          isPublished: true,
          OR: [
            { nameFr: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { brand: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        include: {
          brand: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          variants: { take: 1 },
        },
        take: 10,
      }),
      this.prisma.category.findMany({
        where: { nameFr: { contains: q, mode: 'insensitive' } },
        take: 5,
      }),
      this.prisma.brand.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: 5,
      }),
    ])

    return {
      products: products.map(p => ({
        id: p.id,
        name: p.nameFr,
        slug: p.slug,
        image: p.images[0]?.url,
        price: p.variants[0]?.price,
        brandName: p.brand?.name,
      })),
      categories: categories.map(c => ({ id: c.id, name: c.nameFr, slug: c.slug })),
      brands: brands.map(b => ({ id: b.id, name: b.name, slug: b.slug, logo: b.logoUrl })),
    }
  }

  async fullSearch(query: string, page = 1, limit = 20) {
    if (!query || query.trim().length < 2) return { products: [], total: 0 }
    
    const q = query.trim()
    const where = {
      isPublished: true,
      OR: [
        { nameFr: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
        { brand: { name: { contains: q, mode: 'insensitive' as const } } },
      ],
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ])

    return { products, total }
  }
}
