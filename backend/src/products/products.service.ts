import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '../prisma/prisma-read.service';
import { CacheService } from '../cache/cache.service';
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
  // Offset-based pagination (admin, legacy)
  page?: number;
  limit?: number;
  // Cursor-based (keyset) pagination — preferred for storefront
  cursor?: string;
  type?: string;
  api?: string;
  acea?: string;
  volume?: string;
  oem?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaRead: PrismaReadService,
    private readonly cache: CacheService,
  ) {}

  /** Include every descendant when a catalogue group is selected. */
  async resolveCategoryIds(slug: string) {
    const category = await this.prismaRead.db.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!category) return [];

    const categories = await this.prismaRead.db.category.findMany({
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

  /** Stable cache key from filters object — sorted keys prevent key ordering mismatches. */
  private cacheKeyForFilters(filters: ProductFilters): string {
    const relevant = {
      categorySlug: filters.categorySlug,
      brandSlug: filters.brandSlug,
      brands: filters.brands?.sort().join(','),
      viscosity: filters.viscosity,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      inStockOnly: filters.inStockOnly,
      isFeatured: filters.isFeatured,
      search: filters.search,
      sortBy: filters.sortBy,
      page: filters.page ?? 1,
      cursor: filters.cursor,
      limit: filters.limit ?? 24,
      type: filters.type,
      api: filters.api,
      acea: filters.acea,
      volume: filters.volume,
      oem: filters.oem,
    };
    return `products:list:${JSON.stringify(relevant)}`;
  }

  async findAll(filters: ProductFilters) {
    const cacheKey = this.cacheKeyForFilters(filters);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

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
    if (filters.oem) {
      specsInput.OEMApprovals = {
        contains: filters.oem,
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
    let nextCursor: string | null = null;

    // ── Cursor/Keyset pagination (preferred for storefront) ──────────────────
    if (filters.cursor && !needsManualSort) {
      const orderBy = this.buildOrderBy(filters.sortBy);
      data = await this.prismaRead.db.product.findMany({
        where,
        include: this.buildInclude(),
        orderBy,
        take: limit + 1, // fetch one extra to determine if there is a next page
        cursor: { id: filters.cursor },
        skip: 1,         // skip the cursor item itself
      });
      // If we got an extra item, there's a next page
      if (data.length > limit) {
        data.pop();
        nextCursor = data[data.length - 1].id;
      }
      total = -1; // total is not calculated for cursor pagination (expensive)
    }
    // ── Offset pagination (admin panel / backwards compat) ────────────────────
    else if (needsManualSort) {
      const all = await this.prismaRead.db.product.findMany({ where, include: this.buildInclude() });
      total = all.length;
      all.sort((a, b) => {
        const pa = a.variants?.[0]?.price ?? 0;
        const pb = b.variants?.[0]?.price ?? 0;
        return filters.sortBy === 'price_asc' ? pa - pb : pb - pa;
      });
      const skip = (Math.max(filters.page ?? 1, 1) - 1) * limit;
      data = all.slice(skip, skip + limit);
    } else {
      const skip = (page - 1) * limit;
      const orderBy = this.buildOrderBy(filters.sortBy);
      [data, total] = await Promise.all([
        this.prismaRead.db.product.findMany({ where, include: this.buildInclude(), orderBy, skip, take: limit }),
        this.prismaRead.db.product.count({ where }),
      ]);
    }

    const resultPage = filters.cursor ? 1 : Math.max(filters.page ?? 1, 1);

    // If local public.Product returned 0 items, query tecdoc.articles dynamically
    if (data.length === 0) {
      const tecdocWhere: string[] = [];
      const params: any[] = [];
      let pIdx = 1;

      if (filters.search) {
        tecdocWhere.push(`(a.data_supplier_article_number ILIKE $${pIdx} OR s.matchcode ILIKE $${pIdx} OR p.description ILIKE $${pIdx})`);
        params.push(`%${filters.search}%`);
        pIdx++;
      }
      if (filters.brands?.length) {
        tecdocWhere.push(`LOWER(s.matchcode) = ANY($${pIdx})`);
        params.push(filters.brands.map((b) => b.toLowerCase()));
        pIdx++;
      } else if (filters.brandSlug) {
        tecdocWhere.push(`(LOWER(REGEXP_REPLACE(s.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = $${pIdx} OR LOWER(s.matchcode) = $${pIdx})`);
        params.push(filters.brandSlug.toLowerCase());
        pIdx++;
      }
      if (filters.categorySlug) {
        tecdocWhere.push(`(LOWER(REGEXP_REPLACE(p.description, '[^a-zA-Z0-9]+', '-', 'g')) ILIKE $${pIdx} OR LOWER(p.description) ILIKE $${pIdx})`);
        params.push(`%${filters.categorySlug.replace(/-/g, '%')}%`);
        pIdx++;
      }

      const whereClause = tecdocWhere.length > 0 ? `WHERE ${tecdocWhere.join(' AND ')}` : '';

      try {
        const query = `
          SELECT a.id, a.data_supplier_article_number, s.matchcode AS brand_name,
                 p.description AS product_type, a.description
          FROM tecdoc.articles a
          JOIN tecdoc.suppliers s ON s.id = a.supplier
          LEFT JOIN tecdoc.products p ON p.id = a.current_product
          ${whereClause}
          ORDER BY a.id ASC
          LIMIT ${limit} OFFSET ${skip}
        `;
        const tecdocRows: any[] = (await this.prismaRead.db.$queryRawUnsafe(query, ...params)) as any[];

        if (whereClause) {
          const countRows: any[] = (await this.prismaRead.db.$queryRawUnsafe(`
            SELECT COUNT(*)::int AS count
            FROM tecdoc.articles a
            JOIN tecdoc.suppliers s ON s.id = a.supplier
            LEFT JOIN tecdoc.products p ON p.id = a.current_product
            ${whereClause}
          `, ...params)) as any[];
          total = countRows?.[0]?.count ?? 0;
        } else {
          total = 6722202;
        }

        data = tecdocRows.map((r) => this.serializeTecdocArticle(r));
      } catch (err) {
        console.error('Error fetching TecDoc articles in findAll:', err);
        data = [];
        total = 0;
      }
    }

    const result: any = {
      data: data.map((item) => (item.articleNumber ? item : this.serialize(item))),
      total,
      page: resultPage,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : null,
      nextCursor,
    };
    await this.cache.set(cacheKey, result, CacheService.TTL.PRODUCT_LIST);
    return result;
  }

  async findBySlug(slug: string) {
    return this.cache.wrap(
      `products:slug:${slug}`,
      async () => {
        const product = await this.prismaRead.db.product.findUnique({
          where: { slug },
          include: {
            ...this.buildInclude(),
            compatibilities: {
              include: { vehicleModel: { include: { make: true } } },
            },
          },
        });
        if (product) return this.serialize(product);

        // TecDoc fallback
        try {
          const tecdocArticles: any[] = (await this.prismaRead.db.$queryRawUnsafe(`
            SELECT a.id, a.data_supplier_article_number, s.matchcode AS brand_name,
                   p.description AS product_type, a.description
            FROM tecdoc.articles a
            JOIN tecdoc.suppliers s ON s.id = a.supplier
            LEFT JOIN tecdoc.products p ON p.id = a.current_product
            WHERE a.data_supplier_article_number = $1
               OR LOWER(REGEXP_REPLACE(CONCAT(s.matchcode, '-', a.data_supplier_article_number), '[^a-zA-Z0-9]+', '-', 'g')) = $2
            LIMIT 1
          `, slug.toUpperCase(), slug.toLowerCase())) as any[];

          if (tecdocArticles.length > 0) {
            const item = tecdocArticles[0];
            const [oeRows, attrRows, vehRows]: [any[], any[], any[]] = (await Promise.all([
              this.prismaRead.db.$queryRawUnsafe(`
                SELECT m.matchcode as manufacturer, oe.oe_nbr
                FROM tecdoc.article_oe_numbers oe
                LEFT JOIN tecdoc.manufacturers m ON m.id = oe.manufacturer
                WHERE oe.article_id = $1
                LIMIT 50
              `, item.id),
              this.prismaRead.db.$queryRawUnsafe(`
                SELECT display_title as name, display_value as value
                FROM tecdoc.article_attributes
                WHERE article_id = $1
              `, item.id),
              this.prismaRead.db.$queryRawUnsafe(`
                SELECT DISTINCT m.matchcode AS make, mo.description AS model, pc.description AS trim,
                       pc.date_from AS "yearFrom", pc.date_to AS "yearTo"
                FROM tecdoc.tree_node_products tnp
                JOIN tecdoc.passengercars pc ON pc.id = tnp.item_id
                JOIN tecdoc.models mo ON mo.id = pc.model_id
                JOIN tecdoc.manufacturers m ON m.id = mo.manufacturer_id
                WHERE tnp.product_id = (SELECT current_product FROM tecdoc.articles WHERE id = $1)
                LIMIT 30
              `, item.id),
            ])) as [any[], any[], any[]];

            return this.serializeTecdocArticle(item, { oeRows, attrRows, vehRows });
          }
        } catch {
          // Fallback
        }

        return null;
      },
      CacheService.TTL.PRODUCT_SLUG,
    );
  }

  serializeTecdocArticle(r: any, extra?: { oeRows?: any[]; attrRows?: any[]; vehRows?: any[] }) {
    const slug = `${r.brand_name}-${r.data_supplier_article_number}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const name = `${r.brand_name} ${r.data_supplier_article_number} - ${r.product_type || 'Pièce détachée'}`;
    const price = r.price !== null && r.price !== undefined ? Number(r.price) : 0;
    const stockQty = r.stockQty !== null && r.stockQty !== undefined ? Number(r.stockQty) : 0;

    return {
      id: `tecdoc-${r.id}`,
      slug,
      name,
      description: r.description || `Pièce d'origine ${r.brand_name} Référence ${r.data_supplier_article_number}. Qualité équipementier certifiée.`,
      brandId: r.brand_name,
      brand: {
        id: r.brand_name,
        name: r.brand_name,
        slug: r.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logo: null,
      },
      categoryId: r.product_type || 'pieces-rechange',
      category: {
        id: r.product_type || 'pieces-rechange',
        name: r.product_type || 'Pièces de rechange',
        slug: (r.product_type || 'pieces-rechange').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
      isPublished: true,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      images: [],
      variants: [
        {
          id: `var-tecdoc-${r.id}`,
          productId: `tecdoc-${r.id}`,
          volume: '1 Pièce',
          imageUrl: null,
          priceHT: +(price / 1.19).toFixed(3),
          priceTTC: price,
          stock: stockQty,
          sku: r.data_supplier_article_number,
          status: stockQty === 0 ? 'out_of_stock' : stockQty < 5 ? 'low_stock' : 'in_stock',
          supplierName: r.brand_name,
          warehouse: 'Principal',
        },
      ],
      specs: null,
      sourcing: [],
      compatibilities: (extra?.vehRows || []).map((v) => ({
        id: `compat-${v.make}-${v.model}-${v.trim}`,
        vehicleModel: {
          id: v.model,
          name: v.model,
          slug: v.model.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          make: {
            id: v.make,
            name: v.make,
            slug: v.make.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          },
        },
        engineCode: v.trim,
        yearFrom: v.yearFrom,
        yearTo: v.yearTo,
      })),
      articleNumber: r.data_supplier_article_number,
      oeNumbers: extra?.oeRows || [],
      attributes: extra?.attrRows || [],
    };
  }

  /** Call after any admin write to this product to purge stale cache. */
  async invalidateProduct(slug: string) {
    await Promise.all([
      this.cache.del(`products:slug:${slug}`),
      this.cache.delPattern('products:list:*'),
      this.cache.delPattern('products:best-sellers:*'),
      this.cache.delPattern('products:new:*'),
      this.cache.delPattern('products:facets:*'),
    ]);
  }

  async findBestSellers(limit = 8) {
    return this.cache.wrap(
      `products:best-sellers:${limit}`,
      () => this._findBestSellers(limit),
      CacheService.TTL.BEST_SELLERS,
    );
  }

  private async _findBestSellers(limit = 8) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const topProductIds: string[] = [];

    if (limit > 0) {
      const rows = await this.prismaRead.db.$queryRaw<Array<{ productid: string }>>`
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
      const fallback = await this.prismaRead.db.product.findMany({
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
      const newest = await this.prismaRead.db.product.findMany({
        where: { isPublished: true },
        include: this.buildInclude(),
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return newest.map(this.serialize);
    }

    const products = await this.prismaRead.db.product.findMany({
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
    return this.cache.wrap(
      `products:new:${limit}`,
      async () => {
        const products = await this.prismaRead.db.product.findMany({
          where: { isPublished: true },
          include: this.buildInclude(),
          take: limit,
          orderBy: { createdAt: 'desc' },
        });
        return products.map(this.serialize);
      },
      CacheService.TTL.NEW_ARRIVALS,
    );
  }

  async findRelated(id: string, limit = 6) {
    const product = await this.prismaRead.db.product.findUnique({
      where: { id },
      select: { categoryId: true, brandId: true },
    });
    if (!product) return [];
    const related = await this.prismaRead.db.product.findMany({
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
    const cacheKey = `products:facets:${JSON.stringify({ cat: filters.categorySlug, search: filters.search })}`;
    return this.cache.wrap(
      cacheKey,
      () => this._getFacets(filters),
      CacheService.TTL.FACETS,
    );
  }

  private async _getFacets(filters: ProductFilters) {
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

    const [variantGroups, viscosityGroups, brandGroups, categoryGroups, priceAgg, availableBrands] = await Promise.all([
      this.prismaRead.db.productVariant.groupBy({
        by: ['volume'],
        where: { product: where },
        _count: { volume: true },
      }),
      this.prismaRead.db.productSpecs.groupBy({
        by: ['viscosity'],
        where: { product: where },
        _count: { viscosity: true },
      }),
      this.prismaRead.db.product.groupBy({
        by: ['brandId'],
        where,
        _count: { brandId: true },
      }),
      this.prismaRead.db.product.groupBy({
        by: ['categoryId'],
        where,
        _count: { categoryId: true },
      }),
      this.prismaRead.db.productVariant.aggregate({
        _min: { price: true },
        _max: { price: true },
        where: { product: where },
      }),
      this.prismaRead.db.brand.findMany({
        orderBy: { name: 'asc' },
      })
    ]);
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

    const brandCounts = new Map(
      brandGroups.map((group) => [group.brandId, group._count.brandId]),
    );

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

    const categoryCounts = categoryGroups.map(g => ({
      id: g.categoryId,
      count: g._count.categoryId,
    }));

    return {
      volumes,
      brands,
      viscosities,
      categoryCounts,
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

    const products = await this.prismaRead.db.product.findMany({
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
          priceHT: +(v.price / 1.19).toFixed(3),
          priceTTC: v.price,
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
