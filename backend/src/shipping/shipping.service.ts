import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';

const GRAND_TUNIS = ['Tunis', 'Ariana', 'Ben Arous', 'Manouba'];
const SAHEL_CENTRE_NORD = [
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Le Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
];
const SUD_INTERIEUR = [
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Medenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kébili',
];

const FREE_SHIPPING_THRESHOLD = 150; // 150 TND TTC

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    let zones = await this.prisma.shippingZone.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    // If no zones exist yet, initialize standard Tunisian delivery zones
    if (zones.length === 0) {
      await this.prisma.shippingZone.createMany({
        data: [
          { name: 'Grand Tunis (Tunis, Ariana, Ben Arous, Manouba)', price: 7.0, eta: '24-48h', sortOrder: 0, isActive: true },
          { name: 'Nord, Sahel & Sfax (Bizerte, Nabeul, Sousse, Sfax...)', price: 8.0, eta: '48-72h', sortOrder: 1, isActive: true },
          { name: 'Sud & Intérieur (Gabès, Médenine, Gafsa, Tataouine...)', price: 10.0, eta: '72h', sortOrder: 2, isActive: true },
        ],
      });
      zones = await this.prisma.shippingZone.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    }
    return zones;
  }

  async calculateRate(wilaya?: string, subtotalTTC?: number) {
    const zones = await this.findAll();
    const cleanWilaya = (wilaya || '').trim();

    let matchedZone = zones.find(
      (z) =>
        z.isActive &&
        cleanWilaya &&
        z.name.toLowerCase().includes(cleanWilaya.toLowerCase()),
    );

    if (!matchedZone) {
      if (GRAND_TUNIS.some((w) => w.toLowerCase() === cleanWilaya.toLowerCase())) {
        matchedZone =
          zones.find((z) => z.isActive && /tunis/i.test(z.name)) ?? zones[0];
      } else if (
        SAHEL_CENTRE_NORD.some((w) => w.toLowerCase() === cleanWilaya.toLowerCase())
      ) {
        matchedZone =
          zones.find((z) => z.isActive && /sahel|nord|sfax|centre/i.test(z.name)) ??
          zones[1] ??
          zones[0];
      } else if (
        SUD_INTERIEUR.some((w) => w.toLowerCase() === cleanWilaya.toLowerCase())
      ) {
        matchedZone =
          zones.find((z) => z.isActive && /sud|interieur|gabs|medenine/i.test(z.name)) ??
          zones[2] ??
          zones[zones.length - 1];
      } else {
        matchedZone = zones[0];
      }
    }

    const basePrice = matchedZone ? matchedZone.price : 7.0;
    const eta = matchedZone ? matchedZone.eta : '24-48h';
    const zoneName = matchedZone ? matchedZone.name : 'Livraison Standard';

    const isFree =
      typeof subtotalTTC === 'number' &&
      subtotalTTC >= FREE_SHIPPING_THRESHOLD;

    return {
      zoneName,
      basePrice,
      price: isFree ? 0 : basePrice,
      eta,
      isFree,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    };
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
