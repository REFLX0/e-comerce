import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.shippingZone.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async create(data: CreateShippingZoneDto) {
    const max = await this.prisma.shippingZone.aggregate({
      _max: { sortOrder: true },
    });
    return this.prisma.shippingZone.create({
      data: {
        ...data,
        sortOrder: data.sortOrder ?? (max._max.sortOrder ?? 0) + 1,
      },
    });
  }

  async update(id: string, data: UpdateShippingZoneDto) {
    const zone = await this.prisma.shippingZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Shipping zone not found');
    return this.prisma.shippingZone.update({ where: { id }, data });
  }

  async delete(id: string) {
    const zone = await this.prisma.shippingZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Shipping zone not found');
    return this.prisma.shippingZone.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    return this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.shippingZone.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
  }
}
