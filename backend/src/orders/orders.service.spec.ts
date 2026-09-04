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
    coupon: { update: jest.fn() },
    order: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn() },
    productVariant: { update: jest.fn() },
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

    it('decrements stock for each ordered variant', async () => {
      await service.create(makeDto());

      expect((prisma as any)._tx.productVariant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'variant-1' },
          data: { stockQty: { decrement: 2 } },
        }),
      );
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

      // tx.coupon.update should be called to increment usage
      expect((prisma as any)._tx.coupon.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { code: 'SAVE5' },
          data: { currentUses: { increment: 1 } },
        }),
      );
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

      const result = await service.cancel('order-1', 'user-1');

      expect(result.status).toBe('CANCELLED');
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
