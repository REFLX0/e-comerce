import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { OilRecommendationsDto } from './dto/oil-recommendations.dto';
import { calcSpecificity } from '../specificity';

export interface ProductFilters {
  categorySlug?: string;
  brandSlug?: string;
  brands?: string[];
  viscosity?: string;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  isPromo?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  type?: string;
  api?: string;
  acea?: string;
  volume?: string;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Include every descendant when a catalogue group is selected. */
  async resolveCategoryIds(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!category) return [];

    const categories = await this.prisma.category.findMany({
      select: { id: true, parentId: true },
    });
    const ids = new Set([category.id]);
    const pending = [category.id];
    while (pending.length > 0) {
      const parentId = pending.shift();
      for (const child of categories) {
        if (child.parentId === parentId && !ids.has(child.id)) {
          ids.add(child.id);
          pending.push(child.id);
        }
      }
    }
    return [...ids];
  }

  private normalizeViscosity(value: string) {
    const compact = value.replace(/[\s-]/g, '').toUpperCase();
    const match = compact.match(/^(\d+W)(\d+)$/);
    return match ? `${match[1]}-${match[2]}` : compact;
  }

  buildInclude() {
    return {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' as const } },
      variants: true,
      specs: true,
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    };
  }

  async findAll(filters: ProductFilters) {
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(filters.limit ?? 24, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { isPublished: true };

    if (filters.search) {
      where.OR = [
        { nameFr: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { brand: { name: { contains: filters.search, mode: 'insensitive' } } },
        {
          category: {
            nameFr: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
          specs: {
            viscosity: { contains: filters.search, mode: 'insensitive' },
          },
        },
      ];
    }
    if (filters.categorySlug) {
      const categoryIds = await this.resolveCategoryIds(filters.categorySlug);
      where.categoryId = { in: categoryIds };
    }
    if (filters.brands?.length) {
      where.brand = { slug: { in: filters.brands } };
    } else if (filters.brandSlug) {
      where.brand = { slug: filters.brandSlug };
    }
    if (filters.isFeatured) {
      where.isFeatured = true;
    }
    if (filters.isNew) {
      where.createdAt = {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    }
    if (filters.viscosity) {
      where.specs = { viscosity: this.normalizeViscosity(filters.viscosity) };
    }
    const variantSome: Prisma.ProductVariantWhereInput = {};
    const specsInput: Prisma.ProductSpecsWhereInput = {};
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      variantSome.price = {
        ...(filters.priceMin !== undefined ? { gte: filters.priceMin } : {}),
        ...(filters.priceMax !== undefined ? { lte: filters.priceMax } : {}),
      };
    }
    if (filters.inStockOnly) {
      variantSome.stockQty = { gt: 0 };
    }
    if (filters.volume) {
      variantSome.volume = filters.volume;
    }
    if (filters.type) {
      switch (filters.type) {
        case '100% Synthèse':
          specsInput.isFullySynth = true;
          break;
        case 'Semi-Synthèse':
          specsInput.isSemiSynth = true;
          break;
        case 'Minérale':
          specsInput.isMinerale = true;
          break;
      }
    }
    if (filters.api) {
      specsInput.apiStandard = {
        contains: filters.api.replace(/^API\s+/i, ''),
        mode: 'insensitive',
      };
    }
    if (filters.acea) {
      specsInput.aeceaStandard = {
        contains: filters.acea.replace(/^ACEA\s+/i, ''),
        mode: 'insensitive',
      };
    }
    if (Object.keys(variantSome).length > 0)
      where.variants = { some: variantSome };
    if (Object.keys(specsInput).length > 0) {
      where.specs = { ...((where.specs as any) || {}), ...specsInput };
    }

    const needsManualSort =
      filters.sortBy === 'price_asc' || filters.sortBy === 'price_desc';

    let data: any[];
    let total: number;

    if (needsManualSort) {
      const all = await this.prisma.product.findMany({
        where,
        include: this.buildInclude(),
      });
      total = all.length;
      all.sort((a, b) => {
        const pa = a.variants?.[0]?.price ?? 0;
        const pb = b.variants?.[0]?.price ?? 0;
        return filters.sortBy === 'price_asc' ? pa - pb : pb - pa;
      });
      data = all.slice(skip, skip + limit);
    } else {
      const orderBy = this.buildOrderBy(filters.sortBy);
      [data, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: this.buildInclude(),
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.product.count({ where }),
      ]);
    }

    return {
      data: data.map(this.serialize),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        ...this.buildInclude(),
        compatibilities: {
          include: { vehicleModel: { include: { make: true } } },
        },
      },
    });
    if (!product) return null;
    return this.serialize(product);
  }

  async findBestSellers(limit = 8) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const topProductIds: string[] = [];

    if (limit > 0) {
      const rows = await this.prisma.$queryRaw<Array<{ productid: string }>>`
        SELECT oi."productId" AS productid, SUM(oi.quantity)::int AS totalsold
        FROM "OrderItem" oi
        INNER JOIN "Order" o ON oi."orderId" = o.id
        WHERE o.status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')
          AND o."createdAt" >= ${ninetyDaysAgo}
        GROUP BY oi."productId"
        ORDER BY totalsold DESC, oi."productId" DESC
        LIMIT ${limit}
      `;
      topProductIds.push(
        ...rows
          .map((r) => r.productid)
          .filter((id): id is string => id != null),
      );
    }

    if (topProductIds.length < limit) {
      const fallbackLimit = limit - topProductIds.length;
      const fallback = await this.prisma.product.findMany({
        where: {
          isPublished: true,
          isFeatured: true,
          id: { notIn: topProductIds },
        },
        include: this.buildInclude(),
        take: fallbackLimit,
        orderBy: { createdAt: 'desc' },
      });
      topProductIds.push(...fallback.map((p) => p.id));
    }

    if (topProductIds.length === 0) {
      const newest = await this.prisma.product.findMany({
        where: { isPublished: true },
        include: this.buildInclude(),
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return newest.map(this.serialize);
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: topProductIds }, isPublished: true },
      include: this.buildInclude(),
    });

    const map = new Map(products.map((p) => [p.id, p]));
    const ordered = topProductIds
      .map((id) => map.get(id))
      .filter((p): p is NonNullable<typeof p> => p != null);

    return ordered.map(this.serialize);
  }

  async findNew(limit = 8) {
    const products = await this.prisma.product.findMany({
      where: { isPublished: true },
      include: this.buildInclude(),
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return products.map(this.serialize);
  }

  async findRelated(id: string, limit = 6) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { categoryId: true, brandId: true },
    });
    if (!product) return [];
    const related = await this.prisma.product.findMany({
      where: {
        isPublished: true,
        id: { not: id },
        OR: [{ categoryId: product.categoryId }, { brandId: product.brandId }],
      },
      include: this.buildInclude(),
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return related.map(this.serialize);
  }

  async getFacets(filters: ProductFilters) {
    const where: Prisma.ProductWhereInput = { isPublished: true };
    if (filters.categorySlug) {
      const categoryIds = await this.resolveCategoryIds(filters.categorySlug);
      where.categoryId = { in: categoryIds };
    }
    if (filters.search) {
      where.OR = [
        { nameFr: { contains: filters.search, mode: 'insensitive' } },
        { brand: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    // Brand and viscosity selections are intentionally NOT applied here so the
    // facet lists stay stable while the user multi-selects brands.
    const variantSome: Prisma.ProductVariantWhereInput = {};
    if (filters.inStockOnly) variantSome.stockQty = { gt: 0 };
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      variantSome.price = {
        ...(filters.priceMin !== undefined ? { gte: filters.priceMin } : {}),
        ...(filters.priceMax !== undefined ? { lte: filters.priceMax } : {}),
      };
    }
    if (Object.keys(variantSome).length > 0) {
      where.variants = { some: variantSome };
    }

    const variantGroups = await this.prisma.productVariant.groupBy({
      by: ['volume'],
      where: {
        product: where,
      },
      _count: { volume: true },
    });

    const volumes = variantGroups
      .filter((v) => v.volume)
      .map((v) => ({
        volume: v.volume,
        count: v._count.volume,
      }))
      .sort((a, b) => {
        const numA = parseFloat(a.volume) || 0;
        const numB = parseFloat(b.volume) || 0;
        return numA - numB;
      });

    const viscosityGroups = await this.prisma.productSpecs.groupBy({
      by: ['viscosity'],
      where: { product: where },
      _count: { viscosity: true },
    });

    const viscosities = viscosityGroups
      .filter((v) => v.viscosity)
      .map((v) => ({
        value: v.viscosity as string,
        count: v._count.viscosity,
      }))
      .sort((a, b) => {
        const numA = parseFloat(a.value) || 0;
        const numB = parseFloat(b.value) || 0;
        return numA - numB || a.value.localeCompare(b.value);
      });

    const brandGroups = await this.prisma.product.groupBy({
      by: ['brandId'],
      where,
      _count: { brandId: true },
    });
    const brandCounts = new Map(
      brandGroups.map((group) => [group.brandId, group._count.brandId]),
    );

    const availableBrands = await this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
    const seenBrandNames = new Set<string>();
    const brands = availableBrands
      .filter((brand) => {
        const normalizedName = brand.name.trim().toLocaleLowerCase();
        if (
          /^(supplier|unknown)\b/i.test(brand.name) ||
          seenBrandNames.has(normalizedName)
        ) {
          return false;
        }
        seenBrandNames.add(normalizedName);
        return true;
      })
      .map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        count: brandCounts.get(brand.id) ?? 0,
      }));

    const priceAgg = await this.prisma.productVariant.aggregate({
      _min: { price: true },
      _max: { price: true },
      where: { product: where },
    });

    return {
      volumes,
      brands,
      viscosities,
      priceRange: {
        min: Math.floor(priceAgg._min?.price ?? 0),
        max: Math.ceil(priceAgg._max?.price ?? 0),
      },
    };
  }

  async findOilRecommendations(dto: OilRecommendationsDto) {
    const andConditions: Prisma.ProductSpecsScalarWhereWithAggregatesInput[] =
      [];

    if (dto.cylinders > 0) {
      andConditions.push({
        OR: [{ minCylinders: null }, { minCylinders: { lte: dto.cylinders } }],
      });
      andConditions.push({
        OR: [{ maxCylinders: null }, { maxCylinders: { gte: dto.cylinders } }],
      });
    }

    if (dto.power > 0) {
      andConditions.push({
        OR: [{ minPower: null }, { minPower: { lte: dto.power } }],
      });
      andConditions.push({
        OR: [{ maxPower: null }, { maxPower: { gte: dto.power } }],
      });
    }

    const specsWhere: Prisma.ProductSpecsWhereInput = {
      vehicleTypes: { has: dto.vehicleType },
      fuelTypes: { has: dto.fuelType },
    };

    if (andConditions.length > 0) {
      specsWhere.AND = andConditions;
    }

    const products = await this.prisma.product.findMany({
      where: {
        isPublished: true,
        specs: specsWhere,
      },
      include: this.buildInclude(),
    });

    const scored = products.map((p) => ({
      product: p,
      specificity: calcSpecificity(p.specs),
    }));

    scored.sort((a, b) => b.specificity - a.specificity);

    const data = scored.map((s) => this.serialize(s.product));
    return { data, total: data.length };
  }

  private buildOrderBy(
    sortBy?: string,
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case 'newest':
        return { createdAt: 'desc' };
      case 'price_asc':
        return { variants: { _count: 'asc' } };
      case 'price_desc':
        return { variants: { _count: 'desc' } };
      default:
        return { createdAt: 'desc' };
    }
  }

  serialize(product: any) {
    const primaryImage =
      product.images?.find((img: any) => img.isPrimary) ?? product.images?.[0];
    return {
      id: product.id,
      slug: product.slug,
      name: product.nameFr,
      description: product.description,
      brandId: product.brandId,
      brand: product.brand
        ? {
            id: product.brand.id,
            name: product.brand.name,
            slug: product.brand.slug,
            logo: product.brand.logoUrl,
          }
        : null,
      categoryId: product.categoryId,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.nameFr,
            slug: product.category.slug,
          }
        : null,
      images: product.images?.map((img: any) => img.url) ?? [],
      variants:
        product.variants?.map((v: any) => ({
          id: v.id,
          productId: v.productId,
          volume: v.volume,
          imageUrl: v.imageUrl ?? null,
          priceHT: v.price,
          priceTTC: +(v.price * 1.19).toFixed(2),
          stock: v.stockQty,
          sku: v.skuVariant,
          status:
            v.stockQty === 0
              ? 'out_of_stock'
              : v.stockQty < 5
                ? 'low_stock'
                : 'in_stock',
        })) ?? [],
      specs: product.specs
        ? {
            viscosity: product.specs.viscosity,
            apiSpec: product.specs.apiStandard,
            aceaSpec: product.specs.aeceaStandard,
            jasoSpec: product.specs.jasoStandard,
            oemApprovals: product.specs.OEMApprovals
              ?.split(';')
              .map((approval: string) => approval.trim())
              .filter(Boolean),
            dpfCompatible: product.specs.DPFCompatible,
            turboCompatible: product.specs.TurboCompatible,
            hybridCompatible: product.specs.HybridCompatible,
            vehicleTypes: product.specs.vehicleTypes
              ? product.specs.vehicleTypes.map((t: string) => t.toLowerCase())
              : undefined,
            fuelTypes: product.specs.fuelTypes
              ? product.specs.fuelTypes.map((f: string) => f.toLowerCase())
              : undefined,
            minCylinders: product.specs.minCylinders,
            maxCylinders: product.specs.maxCylinders,
            minPower: product.specs.minPower,
            maxPower: product.specs.maxPower,
            type: product.specs.isFullySynth
              ? 'full_synth'
              : product.specs.isSemiSynth
                ? 'semi_synth'
                : 'mineral',
          }
        : null,
      compatibility:
        product.compatibilities?.map((c: any) => ({
          id: c.id,
          productId: c.productId,
          make: c.vehicleModel?.make?.name,
          model: c.vehicleModel?.name,
          yearFrom: c.yearFrom,
          yearTo: c.yearTo,
          engine: c.engineCode,
        })) ?? [],
      isBestSeller: product.isFeatured,
      isNew:
        Date.now() - new Date(product.createdAt).getTime() <
        30 * 24 * 60 * 60 * 1000,
      isPromo: false,
      rating:
        product.reviews?.length > 0
          ? +(
              product.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
              product.reviews.length
            ).toFixed(1)
          : 0,
      reviewCount: product.reviews?.length ?? 0,
      createdAt: product.createdAt,
      updatedAt: product.createdAt,
      tags: [],
    };
  }
}
