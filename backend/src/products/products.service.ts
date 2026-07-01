import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'

export interface ProductFilters {
  categorySlug?: string
  brandSlug?: string
  viscosity?: string
  priceMin?: number
  priceMax?: number
  inStockOnly?: boolean
  isPromo?: boolean
  isFeatured?: boolean
  search?: string
  sortBy?: string
  page?: number
  limit?: number
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildInclude() {
    return {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' as const } },
      variants: true,
      specs: true,
    }
  }

  async findAll(filters: ProductFilters) {
    const page = Math.max(filters.page ?? 1, 1)
    const limit = Math.min(filters.limit ?? 24, 100)
    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = { isPublished: true }

    if (filters.search) {
      where.nameFr = { contains: filters.search, mode: 'insensitive' }
    }
    if (filters.categorySlug) {
      where.category = { slug: filters.categorySlug }
    }
    if (filters.brandSlug) {
      where.brand = { slug: filters.brandSlug }
    }
    if (filters.isFeatured) {
      where.isFeatured = true
    }
    if (filters.viscosity) {
      where.specs = { viscosity: filters.viscosity }
    }
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.variants = {
        some: {
          price: {
            ...(filters.priceMin !== undefined ? { gte: filters.priceMin } : {}),
            ...(filters.priceMax !== undefined ? { lte: filters.priceMax } : {}),
          },
        },
      }
    }

    const orderBy = this.buildOrderBy(filters.sortBy)

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: this.buildInclude(),
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ])

    return { data: data.map(this.serialize), total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        ...this.buildInclude(),
        compatibilities: { include: { vehicleModel: { include: { make: true } } } },
      },
    })
    if (!product) return null
    return this.serialize(product)
  }

  async findBestSellers(limit = 8) {
    const products = await this.prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      include: this.buildInclude(),
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return products.map(this.serialize)
  }

  async findNew(limit = 8) {
    const products = await this.prisma.product.findMany({
      where: { isPublished: true },
      include: this.buildInclude(),
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return products.map(this.serialize)
  }

  async findRelated(productId: string, limit = 6) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) return []
    const related = await this.prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: productId }, isPublished: true },
      include: this.buildInclude(),
      take: limit,
    })
    return related.map(this.serialize)
  }

  private buildOrderBy(sortBy?: string): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case 'newest': return { createdAt: 'desc' }
      case 'price_asc': return { variants: { _count: 'asc' } }
      case 'price_desc': return { variants: { _count: 'desc' } }
      default: return { createdAt: 'desc' }
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
      brand: product.brand ? { id: product.brand.id, name: product.brand.name, slug: product.brand.slug, logo: product.brand.logoUrl } : null,
      categoryId: product.categoryId,
      category: product.category ? { id: product.category.id, name: product.category.nameFr, slug: product.category.slug } : null,
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
      specs: product.specs ? {
        viscosity: product.specs.viscosity,
        apiSpec: product.specs.apiStandard,
        aceaSpec: product.specs.aeceaStandard,
        type: product.specs.isFullySynth ? 'full_synth' : product.specs.isSemiSynth ? 'semi_synth' : 'mineral',
      } : null,
      isBestSeller: product.isFeatured,
      isNew: (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000,
      isPromo: false,
      rating: 0,
      reviewCount: 0,
      createdAt: product.createdAt,
      updatedAt: product.createdAt,
      tags: [],
    }
  }
}
