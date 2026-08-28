import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KafkaService } from '../kafka/kafka.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto } from './dto/create-order.dto';
import * as crypto from 'crypto';
import { generateDeliveryNotePDF } from '../admin/invoice-pdf';

import { ShippingService } from '../shipping/shipping.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
    private readonly couponsService: CouponsService,
    private readonly shippingService: ShippingService,
  ) {}

  async create(dto: CreateOrderDto, userId?: string) {
    const vehicleVin = dto.vehicleVin?.trim().toUpperCase();
    if (vehicleVin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vehicleVin)) {
      throw new BadRequestException(
        'Le VIN doit contenir 17 caractères alphanumériques (sans I, O ni Q)',
      );
    }

    // Idempotency: prevent duplicate orders on double-submit
    const key = dto.idempotencyKey ?? crypto.randomUUID();
    const existing = await this.prisma.order.findUnique({
      where: { idempotencyKey: key },
    });
    if (existing) return existing;

    // Validate all variants exist and have enough stock
    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== dto.items.length) {
      throw new BadRequestException('One or more variants not found');
    }

    for (const item of dto.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant)
        throw new BadRequestException(`Variant ${item.variantId} not found`);
      if (variant.stockQty < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${variant.product.nameFr} (${variant.volume})`,
        );
      }
    }

    // Compute totals
    const TVA_RATE = 0.19;
    const itemsTotalHT = dto.items.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return sum + variant.price * item.quantity;
    }, 0);

    let promoDiscount = 0;
    let isFreeShippingPromo = false;
    if (dto.promoCode) {
      const coupon = await this.couponsService.validateCode(
        dto.promoCode,
        itemsTotalHT,
      );
      promoDiscount = coupon.discount;
      if (coupon.type === 'SHIPPING') {
        isFreeShippingPromo = true;
      }
    }

    const discountedHT = Math.max(0, itemsTotalHT - promoDiscount);
    const tva = Math.round(discountedHT * TVA_RATE * 100) / 100;
    const itemsTotalTTC = Math.round((discountedHT + tva) * 100) / 100;

    // Securely calculate shipping rate based on Wilaya and DB zones
    const shippingCalc = await this.shippingService.calculateRate(
      dto.shipping.wilaya,
      itemsTotalTTC,
    );

    const shipping = isFreeShippingPromo ? 0 : shippingCalc.price;
    const totalAmount = Math.round((discountedHT + tva + shipping) * 100) / 100;

    // Atomic: create order + decrement stock + create payment + increment coupon
    const order = await this.prisma.$transaction(async (tx) => {
      if (dto.promoCode) {
        await tx.coupon.update({
          where: { code: dto.promoCode },
          data: { currentUses: { increment: 1 } },
        });
      }

      const created = await tx.order.create({
        data: {
          idempotencyKey: key,
          userId: userId ?? null,
          orderType: 'DELIVERY', // only fulfillment path checkout currently supports
          totalAmount,
          shippingCost: shipping,
          promoCode: dto.promoCode ?? null,
          shipFullName: dto.shipping.fullName,
          shipPhone: dto.shipping.phone,
          shipWilaya: dto.shipping.wilaya,
          shipCity: dto.shipping.city,
          vehicleVin: vehicleVin || null,
          notes: dto.notes,
          items: {
            create: dto.items.map((item) => {
              const variant = variants.find((v) => v.id === item.variantId)!;
              return {
                productId: variant.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: variant.price,
              };
            }),
          },
        },
        include: { items: true },
      });

      // Decrement stock
      for (const item of dto.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQty: { decrement: item.quantity } },
        });
      }

      // Create a Payment record linked to this order
      await tx.payment.create({
        data: {
          orderId: created.id,
          method: dto.paymentMethod ?? 'COD',
          amount: totalAmount,
          status: 'PENDING',
        },
      });

      return created;
    });

    // Emit async event via Kafka
    await this.kafka.produce('order.created', order.id, {
      orderId: order.id,
      userId: order.userId,
      totalAmount,
      customerName: dto.shipping.fullName,
    });

    return order;
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, slug: true, nameFr: true, images: { take: 1 } } },
            variant: {
              select: {
                id: true,
                productId: true,
                volume: true,
                price: true,
                stockQty: true,
                skuVariant: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;
    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: { select: { nameFr: true, images: { take: 1 } } },
            variant: { select: { volume: true, price: true } },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancel(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING orders can be cancelled');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async exportOrderPdf(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: { select: { nameFr: true } },
            variant: { select: { volume: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    const settingsRows = await this.prisma.setting.findMany();
    const settings = Object.fromEntries(
      settingsRows.map((r) => {
        try {
          return [r.key, JSON.parse(r.value)];
        } catch {
          return [r.key, r.value];
        }
      }),
    );
    return generateDeliveryNotePDF(order, settings);
  }
}
