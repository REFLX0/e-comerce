import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

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
