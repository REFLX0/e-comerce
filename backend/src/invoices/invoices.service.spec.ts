import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';

// ── helpers ──────────────────────────────────────────────────────────────────

function makePrisma() {
  const mockTx = {
    invoice: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return {
    invoice: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // $transaction executes the callback with the tx mock
    $transaction: jest.fn((cb: any) => cb(mockTx)),
    _mockTx: mockTx,
  } as unknown as PrismaService & { _mockTx: any };
}

function makeLine(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    description: 'Mannol Energy 5W-30 1L',
    quantity: 2,
    unitPriceHT: 25.0,
    vatRate: 0.19,
    ...overrides,
  };
}

function makeStoredInvoice(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'inv-1',
    invoiceNumber: 'FACTURE#1',
    sequenceNumber: 1,
    issueDate: new Date(),
    status: 'ISSUED',
    customerId: 'user-1',
    orderId: 'order-1',
    clientName: 'Ahmed Ben Ali',
    clientAddress: 'Tunis, Ariana',
    clientEmail: null,
    clientPhone: '0612345678',
    clientMf: null,
    notes: null,
    subtotalHT: 50,
    totalTVA: 9.5,
    totalTTC: 59.5,
    amountInWords: 'Cinquante neuf dinars et cinq cents',
    lines: [
      {
        id: 'line-1',
        description: 'Mannol Energy 5W-30 1L',
        quantity: 2,
        unitPriceHT: 25.0,
        vatRate: 0.19,
        vatAmount: 9.5,
        totalTTC: 59.5,
      },
    ],
    createdAt: new Date(),
    ...overrides,
  };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('correctly computes subtotalHT, totalTVA, and totalTTC from lines', async () => {
      const stored = makeStoredInvoice();
      const tx = (prisma as any)._mockTx;
      tx.invoice.create.mockResolvedValueOnce(stored);
      tx.invoice.update.mockResolvedValueOnce(stored);

      await service.create({
        clientName: 'Ahmed Ben Ali',
        lines: [makeLine()],
      } as any);

      expect(tx.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotalHT: expect.closeTo(50, 2),    // 2 × 25
            totalTVA: expect.closeTo(9.5, 2),     // 50 × 0.19
            totalTTC: expect.closeTo(59.5, 2),    // 50 + 9.5
          }),
        }),
      );
    });

    it('handles multiple lines and sums them all correctly', async () => {
      const stored = makeStoredInvoice();
      const tx = (prisma as any)._mockTx;
      tx.invoice.create.mockResolvedValueOnce(stored);
      tx.invoice.update.mockResolvedValueOnce(stored);

      await service.create({
        clientName: 'Test',
        lines: [
          makeLine({ quantity: 1, unitPriceHT: 100, vatRate: 0.19 }),
          makeLine({ quantity: 2, unitPriceHT: 50, vatRate: 0.19 }),
        ],
      } as any);

      // subtotalHT = 100 + 100 = 200; tva = 38; ttc = 238
      expect(tx.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotalHT: expect.closeTo(200, 2),
            totalTVA: expect.closeTo(38, 2),
            totalTTC: expect.closeTo(238, 2),
          }),
        }),
      );
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('returns the invoice when found', async () => {
      const stored = makeStoredInvoice();
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValueOnce(stored);

      const result = await service.findOne('inv-1');

      expect(result.id).toBe('inv-1');
    });

    it('throws NotFoundException when invoice does not exist', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });

    it('scopes query by userId when provided (prevents cross-user access)', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne('inv-1', 'other-user')).rejects.toThrow(NotFoundException);

      expect(prisma.invoice.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ customerId: 'other-user' }),
        }),
      );
    });
  });

  // ── generatePdf ───────────────────────────────────────────────────────────

  describe('generatePdf()', () => {
    it('returns a Buffer for a valid invoice', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValueOnce(makeStoredInvoice());

      const result = await service.generatePdf('inv-1');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('throws NotFoundException for a missing invoice', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.generatePdf('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
