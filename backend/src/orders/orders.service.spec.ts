import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { KafkaService } from '../kafka/kafka.service';
import { CouponsService } from '../coupons/coupons.service';
import { ShippingService } from '../shipping/shipping.service';
import { MailService } from '../mail/mail.service';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeVariant(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'variant-1',
    productId: 'product-1',
    volume: '1L',
    price: 25,
    stockQty: 10,
    skuVariant: 'SKU-1',
    imageUrl: null,
    product: { id: 'product-1', nameFr: 'Mannol Energy 5W-30', slug: 'mannol-energy-5w-30', images: [] },
    ...overrides,
  };
}

function makeDto(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    items: [{ variantId: 'variant-1', quantity: 2 }],
    shipping: { fullName: 'Ahmed Ben Ali', phone: '0612345678', wilaya: 'Tunis', city: 'Ariana' },
    paymentMethod: 'COD',
    promoCode: undefined,
    vehicleVin: undefined,
    notes: undefined,
    idempotencyKey: undefined,
    ...overrides,
  } as any;
}

function makeCreatedOrder() {
  return {
    id: '12345678',
    idempotencyKey: 'idem-1',
    userId: null,
    totalAmount: 65.5,
    shippingCost: 7,
    status: 'PENDING',
    createdAt: new Date(),
  };
}

function makePrisma() {
  const tx: Record<string, any> = {
    coupon: {
      update: jest.fn(),
      // Claiming a coupon use is conditional now, so the guard can reject it.
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    order: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    productVariant: {
      update: jest.fn(),
      // Stock is decremented conditionally (stockQty >= quantity).
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    payment: { create: jest.fn() },
    invoice: {
      create: jest.fn().mockResolvedValue({ id: 'inv-1', sequenceNumber: 1 }),
      update: jest.fn().mockResolvedValue({}),
    },
  };

  return {
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    productVariant: {
      findMany: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    setting: { findMany: jest.fn().mockResolvedValue([]) },
    $transaction: jest.fn((cb: any) => cb(tx)),
    _tx: tx,
  } as unknown as PrismaService & { _tx: any };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: ReturnType<typeof makePrisma>;
  let couponsService: { validateCode: jest.Mock };
  let shippingService: { calculateRate: jest.Mock };
  let kafkaService: { produce: jest.Mock };
  let mailService: { sendOrderEmails: jest.Mock };

  beforeEach(async () => {
    prisma = makePrisma();
    couponsService = { validateCode: jest.fn() };
    shippingService = { calculateRate: jest.fn().mockResolvedValue({ price: 7 }) };
    kafkaService = { produce: jest.fn().mockResolvedValue(undefined) };
    mailService = { sendOrderEmails: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: KafkaService, useValue: kafkaService },
        { provide: CouponsService, useValue: couponsService },
        { provide: ShippingService, useValue: shippingService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // ── create — happy path ───────────────────────────────────────────────────

  describe('create()', () => {
    beforeEach(() => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null); // no existing idempotency match
      (prisma.productVariant.findMany as jest.Mock).mockResolvedValue([makeVariant()]);
      (prisma as any)._tx.order.create.mockResolvedValue(makeCreatedOrder());
    });

    it('creates an order and returns it', async () => {
      const result = await service.create(makeDto());

      expect(result).toMatchObject({ id: '12345678' });
      expect((prisma as any)._tx.order.create).toHaveBeenCalledTimes(1);
    });

    it('decrements stock for each ordered variant, guarded on availability', async () => {
      await service.create(makeDto());

      expect((prisma as any)._tx.productVariant.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'variant-1', stockQty: { gte: 2 } },
          data: { stockQty: { decrement: 2 } },
        }),
      );
    });

    it('rejects the order when the guarded decrement matches no row', async () => {
      // Another checkout took the last units between the pre-check and the
      // transaction, so the conditional update matches nothing.
      (prisma as any)._tx.productVariant.updateMany.mockResolvedValueOnce({
        count: 0,
      });

      await expect(service.create(makeDto())).rejects.toThrow(
        BadRequestException,
      );
    });

    it('collapses repeated lines for the same variant', async () => {
      await service.create(
        makeDto({
          items: [
            { variantId: 'variant-1', quantity: 2 },
            { variantId: 'variant-1', quantity: 3 },
          ],
        }),
      );

      expect(
        (prisma as any)._tx.productVariant.updateMany,
      ).toHaveBeenCalledTimes(1);
      expect((prisma as any)._tx.productVariant.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'variant-1', stockQty: { gte: 5 } },
          data: { stockQty: { decrement: 5 } },
        }),
      );
    });

    it('does not consult the idempotency index when no key is supplied', async () => {
      await service.create(makeDto({ idempotencyKey: undefined }));

      expect(prisma.order.findUnique).not.toHaveBeenCalled();
      expect((prisma as any)._tx.order.create).toHaveBeenCalledTimes(1);
    });

    it('prevents duplicate orders via idempotency key', async () => {
      const existingOrder = makeCreatedOrder();
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce(existingOrder);

      const result = await service.create(makeDto({ idempotencyKey: 'idem-1' }));

      // Returns the existing order without creating a new one
      expect(result).toEqual(existingOrder);
      expect((prisma as any)._tx.order.create).not.toHaveBeenCalled();
    });

    it('applies coupon discount to the order total', async () => {
      couponsService.validateCode.mockResolvedValueOnce({
        discount: 5,
        type: 'FIXED',
        id: 'coupon-1',
        code: 'SAVE5',
      });

      await service.create(makeDto({ promoCode: 'SAVE5' }));

      // The use is claimed conditionally so concurrent checkouts cannot push a
      // coupon past maxUses.
      expect((prisma as any)._tx.coupon.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ code: 'SAVE5', isActive: true }),
          data: { currentUses: { increment: 1 } },
        }),
      );
    });

    it('guards the coupon claim on maxUses when the coupon has a limit', async () => {
      couponsService.validateCode.mockResolvedValueOnce({
        discount: 5,
        type: 'FIXED',
        id: 'coupon-1',
        code: 'SAVE5',
        maxUses: 100,
      });

      await service.create(makeDto({ promoCode: 'SAVE5' }));

      expect((prisma as any)._tx.coupon.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ currentUses: { lt: 100 } }),
        }),
      );
    });

    it('rejects the order when the coupon limit was taken concurrently', async () => {
      couponsService.validateCode.mockResolvedValueOnce({
        discount: 5,
        type: 'FIXED',
        id: 'coupon-1',
        code: 'SAVE5',
        maxUses: 100,
      });
      (prisma as any)._tx.coupon.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(
        service.create(makeDto({ promoCode: 'SAVE5' })),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── create — validation failures ──────────────────────────────────────────

  describe('create() — validation', () => {
    it('throws BadRequestException for invalid VIN', async () => {
      await expect(
        service.create(makeDto({ vehicleVin: 'BADVIN' })),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when variant is not found', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);
      // Return fewer variants than items — simulates missing variant
      (prisma.productVariant.findMany as jest.Mock).mockResolvedValue([]);

      await expect(service.create(makeDto())).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when stock is insufficient', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);
      // stockQty=1 but quantity requested=2
      (prisma.productVariant.findMany as jest.Mock).mockResolvedValue([
        makeVariant({ stockQty: 1 }),
      ]);

      await expect(service.create(makeDto())).rejects.toThrow(BadRequestException);
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('cancels a PENDING order', async () => {
      (prisma.order.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'order-1',
        status: 'PENDING',
        userId: 'user-1',
      });
      (prisma.order.update as jest.Mock).mockResolvedValueOnce({ status: 'CANCELLED' });

      (prisma as any)._tx.order.findUnique.mockResolvedValueOnce({
        id: 'order-1',
        promoCode: null,
        stockReleasedAt: null,
        items: [{ variantId: 'variant-1', quantity: 2 }],
      });

      const result = await service.cancel('order-1', 'user-1');

      expect(result.status).toBe('CANCELLED');
    });

    it('puts the reserved stock back when cancelling', async () => {
      (prisma.order.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'order-1',
        status: 'PENDING',
        userId: 'user-1',
      });
      (prisma.order.update as jest.Mock).mockResolvedValueOnce({
        status: 'CANCELLED',
      });
      (prisma as any)._tx.order.findUnique.mockResolvedValueOnce({
        id: 'order-1',
        promoCode: 'SAVE5',
        stockReleasedAt: null,
        items: [{ variantId: 'variant-1', quantity: 2 }],
      });

      await service.cancel('order-1', 'user-1');

      expect((prisma as any)._tx.productVariant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'variant-1' },
          data: { stockQty: { increment: 2 } },
        }),
      );
      // ...and the coupon use is released too.
      expect((prisma as any)._tx.coupon.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { code: 'SAVE5', currentUses: { gt: 0 } },
          data: { currentUses: { decrement: 1 } },
        }),
      );
    });

    it('does not restock an order whose stock was already released', async () => {
      (prisma.order.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'order-1',
        status: 'PENDING',
        userId: 'user-1',
      });
      (prisma.order.update as jest.Mock).mockResolvedValueOnce({
        status: 'CANCELLED',
      });
      (prisma as any)._tx.order.findUnique.mockResolvedValueOnce({
        id: 'order-1',
        promoCode: null,
        stockReleasedAt: new Date(),
        items: [{ variantId: 'variant-1', quantity: 2 }],
      });

      await service.cancel('order-1', 'user-1');

      expect((prisma as any)._tx.productVariant.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when order is not found', async () => {
      (prisma.order.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.cancel('missing', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when order is not PENDING', async () => {
      (prisma.order.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'order-1',
        status: 'SHIPPED',
        userId: 'user-1',
      });

      await expect(service.cancel('order-1', 'user-1')).rejects.toThrow(BadRequestException);
    });
  });
});
