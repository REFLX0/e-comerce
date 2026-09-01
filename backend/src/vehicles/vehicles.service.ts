import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

export interface CompatibleFilters {
  categorySlug?: string;
  brands?: string;
  viscosity?: string;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  search?: string;
  type?: string;
  api?: string;
  acea?: string;
  volume?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async getMakes(vehicleType?: string) {
    const isCv = vehicleType?.toLowerCase().includes('poids') || vehicleType?.toLowerCase().includes('commercial');
    const rows: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT DISTINCT id, matchcode AS name, LOWER(REGEXP_REPLACE(matchcode, '[^a-zA-Z0-9]+', '-', 'g')) AS slug
      FROM tecdoc.manufacturers
      WHERE can_be_displayed = true ${isCv ? 'AND is_commercial_vehicle = true' : 'AND is_passenger_car = true'}
      ORDER BY matchcode ASC
    `);
    return rows.map((r) => ({ id: String(r.id), name: r.name, slug: r.slug }));
  }

  async getModels(makeSlug: string) {
    const rows: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT DISTINCT m.id, m.description AS name, LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) AS slug
      FROM tecdoc.models m
      JOIN tecdoc.manufacturers mfr ON mfr.id = m.manufacturer_id
      WHERE LOWER(REGEXP_REPLACE(mfr.matchcode, '[^a-zA-Z0-9]+', '-', 'g')) = $1
         OR LOWER(mfr.matchcode) = $1
      ORDER BY m.description ASC
    `, makeSlug.toLowerCase());
    return rows.map((r) => ({ id: String(r.id), makeId: makeSlug, name: r.name, slug: r.slug, vehicleType: 'AUTOMOBILE' as const }));
  }

  async getEngines(modelSlug: string) {
    const rows: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT DISTINCT pc.description AS "engineCode", 
             NULLIF(SPLIT_PART(pc.date_from, '.', 2), '')::int AS "yearFrom",
             NULLIF(SPLIT_PART(pc.date_to, '.', 2), '')::int AS "yearTo"
      FROM tecdoc.passengercars pc
      JOIN tecdoc.models m ON m.id = pc.model_id
      WHERE LOWER(REGEXP_REPLACE(m.description, '[^a-zA-Z0-9]+', '-', 'g')) = $1
         OR LOWER(m.description) = $1
      ORDER BY pc.description ASC
    `, modelSlug.toLowerCase());
    return rows;
  }

  async getCompatibleProducts(
    makeSlug: string,
    modelSlug: string,
    engineCode?: string,
    requiredSpecification?: string,
  ) {
    // If specific oil specification is requested, search oils
    if (requiredSpecification) {
      const specification = this.normalizeSpecification(requiredSpecification);
      if (specification) {
        const products = await this.prisma.product.findMany({
          where: {
            isPublished: true,
            specs: {
              OR: [
                { apiStandard: { contains: specification, mode: 'insensitive' } },
                { aeceaStandard: { contains: specification, mode: 'insensitive' } },
                { OEMApprovals: { contains: specification, mode: 'insensitive' } },
              ],
            },
          },
          include: this.productInclude(),
        });
        if (products.length > 0) return this.rankAndHideSourcing(products);
      }
    }

    // Otherwise return verified spare parts (no liquids / oils)
    const tecdocResult = await this.findTecdocSparePartsForVehicle({
      makeSlug,
      modelSlug,
      engineCode,
      page: 1,
      limit: 30,
      skip: 0,
    });

    return tecdocResult.items;
  }

  /**
   * Paginated, filterable "compatible with vehicle" catalogue.
   * Exclusively returns vehicle spare parts (filtres, freinage, suspension, etc.)
   * and excludes general oils, additives, and liquids unless an oil category is chosen.
   */
  async getCompatiblePage(
    makeSlug: string,
    modelSlug: string,
    engineCode?: string,
    filters: CompatibleFilters = {},
  ) {
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(filters.limit ?? 24, 100);
    const skip = (page - 1) * limit;

    const isOilCategory = filters.categorySlug && (
      filters.categorySlug.includes('huile') ||
      filters.categorySlug.includes('additif') ||
      filters.categorySlug.includes('liquide') ||
      filters.categorySlug.includes('lubrifiant')
    );

    // If looking for spare parts (the default for vehicle search):
    if (!isOilCategory) {
      const tecdocResult = await this.findTecdocSparePartsForVehicle({
        makeSlug,
        modelSlug,
        engineCode,
        categorySlug: filters.categorySlug,
        search: filters.search,
        page,
        limit,
        skip,
      });

      if (tecdocResult.items.length > 0 || tecdocResult.total > 0) {
        return {
          data: tecdocResult.items,
          total: tecdocResult.total,
          page,
          limit,
          totalPages: Math.ceil(tecdocResult.total / limit),
        };
      }
    }

    // Fallback for oil specific category filter
    const make = await this.prisma.vehicleMake.findUnique({
      where: { slug: makeSlug },
    });
    const model = make && await this.prisma.vehicleModel.findFirst({
      where: { slug: modelSlug, makeId: make.id },
    });
    const specification = this.normalizeSpecification(engineCode);

    let compatibilities = model
      ? (engineCode
          ? await this.findCompatibleProducts(model.id, { engineCode })
          : await this.findCompatibleProducts(model.id))
      : [];

    const whereBase: Prisma.ProductWhereInput = { isPublished: true };
    let confirmedIds: string[] = [];
    if (compatibilities.length > 0) {
      confirmedIds = [
        ...new Set(compatibilities.map((item) => item.productId)),
      ];
      whereBase.id = { in: confirmedIds };
    }

    let fallbackWhere: Prisma.ProductWhereInput | null = null;
    if (confirmedIds.length === 0 && specification) {
      fallbackWhere = {
        isPublished: true,
        specs: {
          OR: [
            { apiStandard: { contains: specification, mode: 'insensitive' } },
            { aeceaStandard: { contains: specification, mode: 'insensitive' } },
            { OEMApprovals: { contains: specification, mode: 'insensitive' } },
          ],
        },
      };
    }

    const where = fallbackWhere ?? whereBase;
    this.applyFilters(where, filters);

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: this.productsService.buildInclude(),
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: data.map((product) => ({
        ...this.productsService.serialize(product),
        compatLevel: fallbackWhere ? 'check' : 'confirmed',
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async findTecdocSparePartsForVehicle(params: {
    makeSlug: string;
    modelSlug: string;
    engineCode?: string;
    categorySlug?: string;
    search?: string;
    page: number;
    limit: number;
    skip: number;
  }) {
    try {
      const conditions: string[] = [
        'a.is_valid = true',
        // Strictly exclude liquids, oils, and additives
        "p.description NOT ILIKE '%huile%'",
        "p.description NOT ILIKE '%additif%'",
        "p.description NOT ILIKE '%liquide%'",
        "p.description NOT ILIKE '%lubrifiant%'",
        "p.description NOT ILIKE '%oil%'",
        "p.description NOT ILIKE '%antigel%'",
        "p.description NOT ILIKE '%lave-glace%'"
      ];
      const sqlParams: any[] = [];
      let pIdx = 1;

      // Category matching for spare parts
      if (params.categorySlug) {
        const cat = params.categorySlug.toLowerCase();
        if (cat.includes('filtre')) {
          conditions.push("(p.description ILIKE '%filtre%' OR p.description ILIKE '%filter%')");
        } else if (cat.includes('frein')) {
          conditions.push("(p.description ILIKE '%frein%' OR p.description ILIKE '%brake%' OR p.description ILIKE '%plaquette%' OR p.description ILIKE '%disque%')");
        } else if (cat.includes('suspension') || cat.includes('direction')) {
          conditions.push("(p.description ILIKE '%amortisseur%' OR p.description ILIKE '%suspension%' OR p.description ILIKE '%direction%' OR p.description ILIKE '%rotule%' OR p.description ILIKE '%bras%')");
        } else if (cat.includes('moteur') || cat.includes('distribution')) {
          conditions.push("(p.description ILIKE '%courroie%' OR p.description ILIKE '%distribution%' OR p.description ILIKE '%moteur%' OR p.description ILIKE '%poulie%' OR p.description ILIKE '%tendeur%')");
        } else if (cat.includes('refroidissement') || cat.includes('climatisation')) {
          conditions.push("(p.description ILIKE '%refroidissement%' OR p.description ILIKE '%climatisation%' OR p.description ILIKE '%pompe à eau%' OR p.description ILIKE '%radiateur%' OR p.description ILIKE '%thermostat%')");
        } else if (cat.includes('electricite') || cat.includes('eclairage')) {
          conditions.push("(p.description ILIKE '%bougie%' OR p.description ILIKE '%phare%' OR p.description ILIKE '%alternateur%' OR p.description ILIKE '%démarreur%' OR p.description ILIKE '%ampoule%')");
        } else if (cat.includes('echappement')) {
          conditions.push("(p.description ILIKE '%échappement%' OR p.description ILIKE '%silencieux%' OR p.description ILIKE '%catalyseur%')");
        }
      }

      // Search term
      if (params.search) {
        conditions.push(`(
          p.description ILIKE $${pIdx}
          OR s.matchcode ILIKE $${pIdx}
          OR a.data_supplier_article_number ILIKE $${pIdx}
        )`);
        sqlParams.push(`%${params.search}%`);
        pIdx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
        SELECT DISTINCT a.id, a.data_supplier_article_number, a.supplier, s.matchcode AS brand_name,
               p.description AS product_type, a.description, a.picture_name, a.price, a.stockQty
        FROM tecdoc.articles a
        JOIN tecdoc.suppliers s ON s.id = a.supplier
        JOIN tecdoc.products p ON p.id = a.current_product
        ${whereClause}
        ORDER BY a.id ASC
        LIMIT ${params.limit} OFFSET ${params.skip}
      `;

      const countQuery = `
        SELECT COUNT(DISTINCT a.id) as total
        FROM tecdoc.articles a
        JOIN tecdoc.suppliers s ON s.id = a.supplier
        JOIN tecdoc.products p ON p.id = a.current_product
        ${whereClause}
      `;

      const [rows, countRows] = await Promise.all([
        this.prisma.$queryRawUnsafe(query, ...sqlParams),
        this.prisma.$queryRawUnsafe(countQuery, ...sqlParams),
      ]) as [any[], any[]];

      const items = rows.map((r) => ({
        ...this.productsService.serializeTecdocArticle(r),
        compatLevel: 'confirmed' as const,
      }));
      const total = Number(countRows[0]?.total || 0);

      return { items, total };
    } catch (err) {
      console.warn('[findTecdocSparePartsForVehicle] Error:', (err as Error).message);
      return { items: [], total: 0 };
    }
  }

  /** Apply the same filter clauses used by the products catalogue. */
  private async applyFilters(
    where: Prisma.ProductWhereInput,
    filters: CompatibleFilters,
  ) {
    if (filters.categorySlug) {
      const categoryIds = await this.productsService.resolveCategoryIds(filters.categorySlug);
      if (categoryIds.length === 0) where.categoryId = { in: [] };
      else where.categoryId = { in: categoryIds };
    }
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
      ];
    }
    if (filters.brands?.length) {
      where.brand = { slug: { in: filters.brands.split(',') } };
    }
    if (filters.isFeatured) where.isFeatured = true;
    if (filters.isNew) {
      where.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }
    if (filters.viscosity) {
      where.specs = {
        ...((where.specs as any) || {}),
        viscosity: filters.viscosity.replace(/[\s-]/g, '').toUpperCase().replace(/^(\d+W)(\d+)$/, '$1-$2'),
      };
    }
    const variantSome: Prisma.ProductVariantWhereInput = {};
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      variantSome.price = {
        ...(filters.priceMin !== undefined ? { gte: filters.priceMin } : {}),
        ...(filters.priceMax !== undefined ? { lte: filters.priceMax } : {}),
      };
    }
    if (filters.inStockOnly) variantSome.stockQty = { gt: 0 };
    if (filters.volume) variantSome.volume = filters.volume;
    if (Object.keys(variantSome).length > 0) {
      where.variants = { some: variantSome };
    }
    const specsInput: Prisma.ProductSpecsWhereInput = {};
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
    if (Object.keys(specsInput).length > 0) {
      where.specs = { ...((where.specs as any) || {}), ...specsInput };
    }
  }

  private productInclude() {
    return {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' as const } },
      variants: true,
      specs: true,
      // Read only to rank results.  It is stripped before this public API
      // response is returned, keeping sourcing evidence admin-only.
      sourcing: { select: { confidence: true } },
    };
  }

  private findCompatibleProducts(vehicleModelId: string, where: Record<string, unknown> = {}) {
    return this.prisma.vehicleCompatibility.findMany({
      where: { vehicleModelId, ...where },
      include: { product: { include: this.productInclude() } },
    });
  }

  private rankAndHideSourcing(products: any[]) {
    return products
      .sort((first, second) => {
        const firstRank = first.sourcing?.confidence === 'HIGH' ? 0 : 1;
        const secondRank = second.sourcing?.confidence === 'HIGH' ? 0 : 1;
        return firstRank - secondRank;
      })
      .map(({ sourcing: _sourcing, ...product }) => product);
  }

  private normalizeSpecification(specification?: string) {
    const trimmed = specification?.trim();
    return trimmed && trimmed.toLowerCase() !== 'n/a' ? trimmed : undefined;
  }

  private async logUnmatchedQuery(
    make: string,
    model: string,
    engineCode?: string,
    requiredSpecification?: string,
  ) {
    const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await this.prisma.unmatchedVehicleQuery.findFirst({
      where: {
        make,
        model,
        engineCode: engineCode || null,
        source: 'user_search',
        resolved: false,
        createdAt: { gte: lastDay },
      },
    });
    if (!existing) {
      await this.prisma.unmatchedVehicleQuery.create({
        data: {
          make,
          model,
          engineCode: engineCode || null,
          requiredSpecification: requiredSpecification || null,
          source: 'user_search',
        },
      });
    }
  }
}
