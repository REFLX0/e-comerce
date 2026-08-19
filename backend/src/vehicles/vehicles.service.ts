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
    const where: any = {};
    if (vehicleType && vehicleType !== 'undefined') {
      where.models = { some: { vehicleType: vehicleType.toUpperCase() } };
    }
    return this.prisma.vehicleMake.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getModels(makeSlug: string) {
    const make = await this.prisma.vehicleMake.findUnique({
      where: { slug: makeSlug },
    });
    if (!make) return [];
    return this.prisma.vehicleModel.findMany({
      where: { makeId: make.id },
      orderBy: { name: 'asc' },
    });
  }

  async getEngines(modelSlug: string) {
    const model = await this.prisma.vehicleModel.findUnique({
      where: { slug: modelSlug },
    });
    if (!model) return [];
    const compatibilities = await this.prisma.vehicleCompatibility.findMany({
      where: { vehicleModelId: model.id, engineCode: { not: null } },
      select: { engineCode: true, yearFrom: true, yearTo: true },
      distinct: ['engineCode'],
    });
    return compatibilities;
  }

  async getCompatibleProducts(
    makeSlug: string,
    modelSlug: string,
    engineCode?: string,
    requiredSpecification?: string,
  ) {
    const make = await this.prisma.vehicleMake.findUnique({
      where: { slug: makeSlug },
    });
    const model = make && await this.prisma.vehicleModel.findFirst({
      where: { slug: modelSlug, makeId: make.id },
    });
    const specification = this.normalizeSpecification(requiredSpecification);
    if (!make || !model) {
      await this.logUnmatchedQuery(make?.name ?? makeSlug, modelSlug, engineCode, specification);
      return [];
    }

    let compatibilities = engineCode
      ? await this.findCompatibleProducts(model.id, { engineCode })
      : await this.findCompatibleProducts(model.id);

    // A typed free-text engine fragment (for example "K9K") is useful when
    // a customer does not know the complete engine label in the database.
    if (compatibilities.length === 0 && engineCode) {
      compatibilities = await this.findCompatibleProducts(model.id, {
        engineCode: { contains: engineCode, mode: 'insensitive' },
      });
    }

    if (compatibilities.length > 0) return this.rankAndHideSourcing(compatibilities.map((item) => item.product));

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

    await this.logUnmatchedQuery(make.name, model.name, engineCode, specification);
    return [];
  }

  /**
   * Paginated, filterable "compatible with vehicle" catalogue.
   *
   * Products matched via structured VehicleCompatibility rows are flagged
   * `compatLevel: 'confirmed'`; products found through the specification
   * fallback are flagged `compatLevel: 'check'` so the UI can show a
   * "compatibility to verify" badge.
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

    const make = await this.prisma.vehicleMake.findUnique({
      where: { slug: makeSlug },
    });
    const model = make && await this.prisma.vehicleModel.findFirst({
      where: { slug: modelSlug, makeId: make.id },
    });
    const specification = this.normalizeSpecification(engineCode);
    if (!make || !model) {
      await this.logUnmatchedQuery(make?.name ?? makeSlug, modelSlug, engineCode, specification);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    // 1) Structured compatibility rows → "confirmed" matches.
    let compatibilities = engineCode
      ? await this.findCompatibleProducts(model.id, { engineCode })
      : await this.findCompatibleProducts(model.id);
    if (compatibilities.length === 0 && engineCode) {
      compatibilities = await this.findCompatibleProducts(model.id, {
        engineCode: { contains: engineCode, mode: 'insensitive' },
      });
    }

    const whereBase: Prisma.ProductWhereInput = { isPublished: true };
    let confirmedIds: string[] = [];
    if (compatibilities.length > 0) {
      confirmedIds = [
        ...new Set(compatibilities.map((item) => item.productId)),
      ];
      whereBase.id = { in: confirmedIds };
    }

    // 2) Specification fallback (no structured rows) → "check" matches.
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

    const needsManualSort =
      filters.sortBy === 'price_asc' || filters.sortBy === 'price_desc';

    let data: any[];
    let total: number;

    if (needsManualSort) {
      const all = await this.prisma.product.findMany({
        where,
        include: this.productsService.buildInclude(),
      });
      total = all.length;
      all.sort((a, b) => {
        const pa = a.variants?.[0]?.price ?? 0;
        const pb = b.variants?.[0]?.price ?? 0;
        return filters.sortBy === 'price_asc' ? pa - pb : pb - pa;
      });
      data = all.slice(skip, skip + limit);
    } else {
      const orderBy =
        filters.sortBy === 'newest' ? { createdAt: 'desc' as const } : undefined;
      [data, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: this.productsService.buildInclude(),
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.product.count({ where }),
      ]);
    }

    if (fallbackWhere) {
      await this.logUnmatchedQuery(make.name, model.name, engineCode, specification);
    }

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
