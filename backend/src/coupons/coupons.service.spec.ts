import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { PrismaService } from '../prisma/prisma.service';

// ── helpers ──────────────────────────────────────────────────────────────────

function makePrisma() {
  return {
    coupon: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as PrismaService;
}

function makeCoupon(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'coupon-1',
    code: 'SAVE10',
    type: 'PERCENT',
    value: 10,
    minAmount: 50,
    maxUses: 100,
    currentUses: 5,
    expiryDate: null,
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('CouponsService', () => {
  let service: CouponsService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  // ── validateCode ──────────────────────────────────────────────────────────

  describe('validateCode()', () => {
    it('returns coupon with correct PERCENT discount', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(makeCoupon());

      const result = await service.validateCode('SAVE10', 100);

      // 10% of 100 = 10
      expect(result.discount).toBe(10);
    });

    it('returns coupon with correct FIXED discount', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(
        makeCoupon({ type: 'FIXED', value: 15 }),
      );

      const result = await service.validateCode('FIXED15', 100);

      expect(result.discount).toBe(15);
    });

    it('returns zero discount for SHIPPING coupon (handled separately)', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(
        makeCoupon({ type: 'SHIPPING', value: 0 }),
      );

      const result = await service.validateCode('FREESHIP', 100);

      expect(result.discount).toBe(0);
    });

    it('throws NotFoundException for unknown code', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.validateCode('BOGUS', 100)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when coupon is inactive', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(
        makeCoupon({ isActive: false }),
      );

      await expect(service.validateCode('SAVE10', 100)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when coupon has expired', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(
        makeCoupon({ expiryDate: new Date('2000-01-01') }),
      );

      await expect(service.validateCode('SAVE10', 100)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when usage limit is reached', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(
        makeCoupon({ maxUses: 5, currentUses: 5 }),
      );

      await expect(service.validateCode('SAVE10', 100)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when cart total is below minimum', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(
        makeCoupon({ minAmount: 200 }),
      );

      // Cart total 100 < minAmount 200
      await expect(service.validateCode('SAVE10', 100)).rejects.toThrow(BadRequestException);
    });

    it('does not throw when expiryDate is in the future', async () => {
      const future = new Date(Date.now() + 86_400_000);
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(
        makeCoupon({ expiryDate: future }),
      );

      await expect(service.validateCode('SAVE10', 100)).resolves.toBeDefined();
    });
  });

  // ── toggleActive ──────────────────────────────────────────────────────────

  describe('toggleActive()', () => {
    it('flips isActive from true to false', async () => {
      const coupon = makeCoupon({ isActive: true });
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(coupon);
      (prisma.coupon.update as jest.Mock).mockResolvedValueOnce({ ...coupon, isActive: false });

      const result = await service.toggleActive('coupon-1');

      expect(prisma.coupon.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: false } }),
      );
      expect(result.isActive).toBe(false);
    });

    it('throws NotFoundException when coupon does not exist', async () => {
      (prisma.coupon.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.toggleActive('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('throws NotFoundException for a Prisma P2025 (record not found) error', async () => {
      (prisma.coupon.delete as jest.Mock).mockRejectedValueOnce({ code: 'P2025' });

      await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
