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
  ) {
    const make = await this.prisma.vehicleMake.findUnique({
      where: { slug: makeSlug },
    });
    const model = await this.prisma.vehicleModel.findUnique({
      where: { slug: modelSlug },
    });
    if (!make || !model) return [];

    const where: any = { vehicleModelId: model.id };
    if (engineCode) where.engineCode = engineCode;

    const compatibilities = await this.prisma.vehicleCompatibility.findMany({
      where,
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            images: { orderBy: { sortOrder: 'asc' } },
            variants: true,
            specs: true,
          },
        },
      },
    });
    return compatibilities.map((c) => c.product).filter(Boolean);
  }
}
