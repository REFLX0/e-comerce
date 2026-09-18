import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KafkaService } from '../kafka/kafka.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto } from './dto/create-order.dto';
import * as crypto from 'crypto';
import { generateDeliveryNotePDF } from '../admin/invoice-pdf';
import { ShippingService } from '../shipping/shipping.service';
import { MailService } from '../mail/mail.service';
import { numberToWordsDT } from '../common/utils/number-to-words';
import { Prisma } from '@prisma/client';

/** Prisma's unique-constraint violation. */
const UNIQUE_VIOLATION = 'P2002';

/**
 * Round to the Tunisian dinar's smallest unit, the millime (3 decimals).
 * Totals used to be rounded to 2, which made the sum of the invoice lines
 * disagree with the invoice total on legally numbered FACTURE# documents.
 */
function roundDT(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
    private readonly couponsService: CouponsService,
    private readonly shippingService: ShippingService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateOrderDto, userId?: string) {
    const vehicleVin = dto.vehicleVin?.trim().toUpperCase();
    if (vehicleVin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vehicleVin)) {
      throw new BadRequestException(
        'Le VIN doit contenir 17 caractères alphanumériques (sans I, O ni Q)',
      );
    }

    // Idempotency: prevent duplicate orders on double-submit.
    // Only a caller-supplied key can actually do that - generating one here
    // per request (the previous behaviour) made every retry a brand new order.
    const key = dto.idempotencyKey?.trim() || null;
    if (key) {
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey: key },
      });
      if (existing) return existing;
    }

    // Same variant can legitimately appear twice in a cart; collapse the lines
    // so the count check below compares like with like and the stock guard
    // sees the true total per variant.
    const items = this.mergeItems(dto.items);

    // Validate all variants exist. Stock is re-checked inside the transaction:
    // checking it here only would let two concurrent orders for the last unit
    // both pass and drive stockQty negative.
    const variantIds = items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== variantIds.length) {
      const found = new Set(variants.map((v) => v.id));
      const missing = variantIds.filter((id) => !found.has(id));
      throw new BadRequestException(
        `Variant(s) not found: ${missing.join(', ')}`,
      );
    }

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId)!;
      if (variant.stockQty < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${variant.product.nameFr} (${variant.volume})`,
        );
      }
    }

    // Compute totals
    const TVA_RATE = 0.19;
    const itemsTotalHT = items.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return sum + variant.price * item.quantity;
    }, 0);

    let promoDiscount = 0;
    let isFreeShippingPromo = false;
    let couponMaxUses: number | null = null;
    if (dto.promoCode) {
      const coupon = await this.couponsService.validateCode(
        dto.promoCode,
        itemsTotalHT,
      );
      promoDiscount = coupon.discount;
      couponMaxUses = coupon.maxUses ?? null;
      if (coupon.type === 'SHIPPING') {
        isFreeShippingPromo = true;
      }
    }

    const discountedHT = roundDT(Math.max(0, itemsTotalHT - promoDiscount));
    const tva = roundDT(discountedHT * TVA_RATE);
    const itemsTotalTTC = roundDT(discountedHT + tva);

    // Securely calculate shipping rate based on Wilaya and DB zones
    const shippingCalc = await this.shippingService.calculateRate(
      dto.shipping.wilaya,
      itemsTotalTTC,
    );

    const shipping = isFreeShippingPromo ? 0 : shippingCalc.price;
    const totalAmount = roundDT(discountedHT + tva + shipping);

    // Atomic: create order + decrement stock + create payment + increment coupon
    const runOrderTransaction = () =>
      this.prisma.$transaction(
        async (tx) => {
          if (dto.promoCode) {
            // Claim the use conditionally. validateCode checked maxUses outside the
            // transaction, so without the `currentUses < maxUses` predicate here
            // concurrent checkouts could push a coupon past its limit.
            const claimed = await tx.coupon.updateMany({
              where: {
                code: dto.promoCode,
                isActive: true,
                ...(couponMaxUses != null
                  ? { currentUses: { lt: couponMaxUses } }
                  : {}),
              },
              data: { currentUses: { increment: 1 } },
            });
            if (claimed.count !== 1) {
              throw new BadRequestException('Coupon usage limit reached');
            }
          }

          const newOrderId = await this.generateOrderId(tx);

          const created = await tx.order.create({
            data: {
              id: newOrderId,
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
              shipEmail: dto.shipping.email?.trim() || null,
              vehicleVin: vehicleVin || null,
              notes: dto.notes,
              items: {
                create: items.map((item) => {
                  const variant = variants.find(
                    (v) => v.id === item.variantId,
                  )!;
                  return {
                    productId: variant.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    unitPrice: variant.price,
                  };
                }),
              },
            },
          });

          // Also create an Invoice automatically
          const invoiceSubtotalHT = discountedHT;
          const invoiceTVA = tva;
          const invoiceTTC = totalAmount;
          const amountInWords = numberToWordsDT(invoiceTTC);

          const invoiceLines = items.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId)!;
            const lineHT = roundDT(item.quantity * variant.price);
            const vatAmount = roundDT(lineHT * TVA_RATE);
            const lineTTC = roundDT(lineHT + vatAmount);
            return {
              description: `${variant.product.nameFr} - ${variant.volume}`,
              quantity: item.quantity,
              unitPriceHT: variant.price,
              vatRate: TVA_RATE,
              vatAmount,
              totalTTC: lineTTC,
            };
          });

          // Decrement stock, guarded. The `stockQty >= quantity` predicate is
          // evaluated under the row lock, so two concurrent orders for the last
          // unit can no longer both succeed and drive the count negative.
          for (const item of items) {
            const claimed = await tx.productVariant.updateMany({
              where: { id: item.variantId, stockQty: { gte: item.quantity } },
              data: { stockQty: { decrement: item.quantity } },
            });
            if (claimed.count !== 1) {
              const variant = variants.find((v) => v.id === item.variantId)!;
              throw new BadRequestException(
                `Insufficient stock for ${variant.product.nameFr} (${variant.volume})`,
              );
            }
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

          const invoice = await tx.invoice.create({
            data: {
              invoiceNumber: '', // placeholder
              issueDate: new Date(),
              status: 'ISSUED',
              customerId: userId ?? null,
              orderId: created.id,
              clientName: dto.shipping.fullName,
              clientAddress: `${dto.shipping.city}, ${dto.shipping.wilaya}`,
              clientPhone: dto.shipping.phone,
              subtotalHT: invoiceSubtotalHT,
              totalTVA: invoiceTVA,
              totalTTC: invoiceTTC,
              amountInWords,
              lines: {
                create: invoiceLines,
              },
            },
          });

          await tx.invoice.update({
            where: { id: invoice.id },
            data: { invoiceNumber: `FACTURE#${invoice.sequenceNumber}` },
          });

          return created;
        },
        {
          // This writes the order, its lines, the stock decrements, the payment and
          // the invoice; Prisma's 5s default is tight enough to abort a large cart
          // under load.
          timeout: 20_000,
          maxWait: 10_000,
        },
      );

    let order: Awaited<ReturnType<typeof runOrderTransaction>>;
    try {
      order = await runOrderTransaction();
    } catch (err) {
      // A genuine double-submit can get past the pre-check above, because that
      // read is outside the transaction. The unique index is the real guard -
      // treat the collision as "already placed" instead of 500ing.
      if (
        key &&
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === UNIQUE_VIOLATION
      ) {
        const existing = await this.prisma.order.findUnique({
          where: { idempotencyKey: key },
        });
        if (existing) return existing;
      }
      throw err;
    }

    // Emit async event via Kafka
    await this.kafka.produce('order.created', order.id, {
      orderId: order.id,
      userId: order.userId,
      totalAmount,
      customerName: dto.shipping.fullName,
    });

    // Send dual order emails (Customer invoice + Admin sale notification)
    let customerEmail: string | undefined = order.shipEmail ?? undefined;
    if (!customerEmail && userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      customerEmail = user?.email;
    }

    this.mailService
      .sendOrderEmails({
        id: order.id,
        totalAmount,
        shippingCost: shipping,
        customerName: dto.shipping.fullName,
        customerEmail,
        phone: dto.shipping.phone,
        wilaya: dto.shipping.wilaya,
        city: dto.shipping.city,
        paymentMethod: dto.paymentMethod ?? 'COD',
        items: items.map((item) => {
          const variant = variants.find((v) => v.id === item.variantId)!;
          return {
            name: variant.product.nameFr,
            quantity: item.quantity,
            unitPrice: variant.price,
            volume: variant.volume,
          };
        }),
      })
      .catch((err: any) => {
        this.logger.error(
          `Failed to dispatch order emails for #${order.id}: ${err.message}`,
          err.stack,
        );
      });

    return order;
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                nameFr: true,
                images: {
                  select: { id: true, url: true, isPrimary: true },
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1,
                },
              },
            },
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
            product: {
              select: {
                id: true,
                slug: true,
                nameFr: true,
                images: {
                  select: { id: true, url: true, isPrimary: true },
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                volume: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /** Collapse repeated lines for the same variant into a single quantity. */
  private mergeItems(items: { variantId: string; quantity: number }[]) {
    const merged = new Map<string, number>();
    for (const item of items) {
      merged.set(
        item.variantId,
        (merged.get(item.variantId) ?? 0) + item.quantity,
      );
    }
    return [...merged].map(([variantId, quantity]) => ({
      variantId,
      quantity,
    }));
  }

  /**
   * Human-friendly 8-digit order number. The uniqueness check races with
   * concurrent transactions, so the caller still has to tolerate a P2002 on
   * the id; this only keeps collisions rare.
   */
  private async generateOrderId(tx: Prisma.TransactionClient): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = String(crypto.randomInt(10_000_000, 100_000_000));
      const clash = await tx.order.findUnique({
        where: { id: candidate },
        select: { id: true },
      });
      if (!clash) return candidate;
    }
    throw new Error('Could not allocate a unique order id');
  }

  /**
   * Put the reserved stock back and release the coupon use.
   *
   * Cancelling used to only flip the status, so every cancelled or returned
   * order permanently removed its units from stock - inventory drifted down
   * until products showed as out of stock and stopped selling.
   */
  async releaseOrderReservations(orderId: string) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order || order.stockReleasedAt) return;

      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQty: { increment: item.quantity } },
        });
      }

      if (order.promoCode) {
        await tx.coupon.updateMany({
          where: { code: order.promoCode, currentUses: { gt: 0 } },
          data: { currentUses: { decrement: 1 } },
        });
      }

      // Stamped inside the same transaction so a double cancel, or a
      // CANCELLED -> RETURNED transition, cannot credit the stock twice.
      await tx.order.update({
        where: { id: orderId },
        data: { stockReleasedAt: new Date() },
      });
    });
  }

  async cancel(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING orders can be cancelled');
    }
    const cancelled = await this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    await this.releaseOrderReservations(id);
    return cancelled;
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
