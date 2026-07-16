import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateOrderDto, userId?: string) {
    // Idempotency: prevent duplicate orders on double-submit
    const key = dto.idempotencyKey ?? uuidv4();
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

    const totalAmount = dto.items.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return sum + variant.price * item.quantity;
    }, 0);

    // Atomic: create order + decrement stock + create payment in one transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          idempotencyKey: key,
          userId: userId ?? null,
          totalAmount,
          shippingCost: dto.shippingCost ?? 0,
          shipFullName: dto.shipping.fullName,
          shipPhone: dto.shipping.phone,
          shipWilaya: dto.shipping.wilaya,
          shipCity: dto.shipping.city,
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

    // Notify admins about new order
    await this.notifications
      .create({
        type: 'new_order',
        title: `Nouvelle commande #${order.id.slice(0, 8)}`,
        message: `${totalAmount.toFixed(2)} TND — ${dto.shipping.fullName}`,
        link: `/admin/orders`,
      })
      .catch(() => {});

    return order;
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { nameFr: true, images: { take: 1 } } },
            variant: { select: { volume: true } },
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
}
