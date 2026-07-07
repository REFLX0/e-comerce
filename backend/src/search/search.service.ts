import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class SearchService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm`)
    } catch {
      // pg_trgm not available — search will fall back to contains-only
    }
  }

  private searchTokens(q: string): string[] {
    const tokens = [q]

    const viscMatch = q.match(/(\d+)\s*[wW]\s*-?\s*(\d+)/)
    if (viscMatch) {
      tokens.push(`${viscMatch[1]}W${viscMatch[2]}`)
      tokens.push(`${viscMatch[1]}W-${viscMatch[2]}`)
    }

    const stripped = q.replace(/[\s-]/g, '')
    if (stripped !== q) tokens.push(stripped)

    return [...new Set(tokens)]
  }

  private buildSearchWhere(q: string): Prisma.ProductWhereInput {
    const tokens = this.searchTokens(q)

    return {
      isPublished: true,
      OR: tokens.flatMap(term => [
        { nameFr: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
        { brand: { name: { contains: term, mode: 'insensitive' } } },
        { category: { nameFr: { contains: term, mode: 'insensitive' } } },
        { specs: { viscosity: { contains: term, mode: 'insensitive' } } },
      ]),
    }
  }

  private buildInclude() {
    return {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' as const } },
      variants: true,
      specs: true,
    }
  }

  private serialize(product: any) {
    const primaryImage = product.images?.find((img: any) => img.isPrimary) ?? product.images?.[0]
    return {
      id: product.id,
      slug: product.slug,
      name: product.nameFr,
      description: product.description,
      brandId: product.brandId,
      brand: product.brand
        ? { id: product.brand.id, name: product.brand.name, slug: product.brand.slug, logo: product.brand.logoUrl }
        : null,
      categoryId: product.categoryId,
      category: product.category
        ? { id: product.category.id, name: product.category.nameFr, slug: product.category.slug }
        : null,
      images: product.images?.map((img: any) => img.url) ?? [],
      variants: product.variants?.map((v: any) => ({
        id: v.id,
        productId: v.productId,
        volume: v.volume,
        priceHT: v.price,
        priceTTC: +(v.price * 1.19).toFixed(2),
        stock: v.stockQty,
        sku: v.skuVariant,
        status: v.stockQty === 0 ? 'out_of_stock' : v.stockQty < 5 ? 'low_stock' : 'in_stock',
      })) ?? [],
      specs: product.specs
        ? {
            viscosity: product.specs.viscosity,
            apiSpec: product.specs.apiStandard,
            aceaSpec: product.specs.aeceaStandard,
            type: product.specs.isFullySynth ? 'full_synth' : product.specs.isSemiSynth ? 'semi_synth' : 'mineral',
          }
        : null,
      isBestSeller: product.isFeatured,
      isNew: Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000,
      isPromo: false,
      rating: 0,
      reviewCount: 0,
      createdAt: product.createdAt,
      updatedAt: product.createdAt,
      tags: [],
    }
  }

  async getSuggestions(query: string) {
    if (!query || query.trim().length < 2) return { products: [], categories: [], brands: [] }

    const q = query.trim()
    const where = this.buildSearchWhere(q)

    const [products, categories, brands] = await Promise.all([
      this.prisma.product.findMany({ where, include: { brand: true, images: { take: 1, orderBy: { sortOrder: 'asc' } }, variants: { take: 1 } }, take: 10 }),
      this.prisma.category.findMany({ where: { nameFr: { contains: q, mode: 'insensitive' } }, take: 5 }),
      this.prisma.brand.findMany({ where: { name: { contains: q, mode: 'insensitive' } }, take: 5 }),
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
    const where = this.buildSearchWhere(q)

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: this.buildInclude(),
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ])

    return { products, total }
  }

  async searchProducts(query: string, limit = 5) {
    if (!query || query.trim().length < 2) return []

    const q = query.trim()

    // Try pg_trgm similarity first
    try {
      const ids: { id: string }[] = await this.prisma.$queryRawUnsafe(
        `SELECT id FROM "Product" WHERE is_published = true AND (
          similarity(name_fr, $1) > 0.3 OR similarity(sku, $1) > 0.3
        ) ORDER BY similarity(name_fr, $1) DESC LIMIT $2`,
        q,
        limit,
      )
      if (ids.length > 0) {
        const products = await this.prisma.product.findMany({
          where: { id: { in: ids.map(r => r.id) } },
          include: this.buildInclude(),
          take: limit,
        })
        return products.map(p => this.serialize(p))
      }
    } catch {
      // pg_trgm not available — fall through to contains
    }

    const where = this.buildSearchWhere(q)
    const products = await this.prisma.product.findMany({
      where,
      include: this.buildInclude(),
      take: limit,
    })
    return products.map(p => this.serialize(p))
  }
}
