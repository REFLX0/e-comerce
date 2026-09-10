import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PriceImportItemStatus, PriceImportStatus } from '@prisma/client';
import { PriceImportService } from './price-import.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { ParserRegistry } from './parsers/parser-registry';
import {
  generateScorepFixturePdf,
  generateUnrelatedPdf,
} from '../../test/fixtures/generate-scorep-fixture';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeProduct(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'product-1',
    sku: '1597',
    nameFr: 'Liqui Moly Nettoyant jantes spécial',
    variants: [
      {
        id: 'variant-1',
        productId: 'product-1',
        volume: '1L',
        price: 45,
        costPrice: null,
        skuVariant: '1597-U',
      },
    ],
    ...overrides,
  };
}

function makePrisma() {
  const tx: Record<string, any> = {
    productVariant: { update: jest.fn().mockResolvedValue({}) },
    priceImportItem: {
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({}),
    },
    priceImport: { update: jest.fn() },
  };

  return {
    product: { findMany: jest.fn().mockResolvedValue([]) },
    priceImport: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    $transaction: jest.fn((cb: any) => cb(tx)),
    _tx: tx,
  } as unknown as PrismaService & { _tx: any };
}

function makeFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'scorep.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('placeholder'),
    size: 100,
    ...overrides,
  } as Express.Multer.File;
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('PriceImportService', () => {
  let service: PriceImportService;
  let prisma: ReturnType<typeof makePrisma>;
  let uploadsService: { uploadImage: jest.Mock };

  beforeEach(async () => {
    prisma = makePrisma();
    uploadsService = {
      uploadImage: jest
        .fn()
        .mockResolvedValue('/storage/specpart/price-list.pdf'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceImportService,
        ParserRegistry,
        { provide: PrismaService, useValue: prisma },
        { provide: UploadsService, useValue: uploadsService },
      ],
    }).compile();

    service = module.get<PriceImportService>(PriceImportService);
  });

  // ── createPreview (parse + match) ───────────────────────────────────────

  describe('createPreview()', () => {
    it('rejects a PDF that does not match any known supplier format', async () => {
      const unrelatedPdfBuffer = await generateUnrelatedPdf();
      await expect(
        service.createPreview(
          makeFile({ buffer: unrelatedPdfBuffer }),
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('matches products by article number (sku), not by name, and stores counts', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValueOnce([
        makeProduct({ sku: '1597' }),
        makeProduct({
          id: 'product-2',
          sku: '1554',
          nameFr: 'Liqui Moly Entretien du cuir',
          variants: [
            {
              id: 'variant-2',
              productId: 'product-2',
              volume: '250ml',
              price: 40,
              costPrice: null,
              skuVariant: '1554-U',
            },
          ],
        }),
      ]);
      (prisma.priceImport.create as jest.Mock).mockImplementationOnce(
        ({ data }) => ({
          id: 'import-1',
          ...data,
          items: data.items.create,
        }),
      );

      const buffer = await generateScorepFixturePdf();
      const result: any = await service.createPreview(
        makeFile({ buffer }),
        'admin-1',
      );

      expect(result.matchedCount).toBe(2); // 1597 and 1554 exist in the mocked catalog
      expect(result.detectedCount).toBe(9);
      expect(result.unmatchedCount).toBe(2); // 1121 and 2571 are not in the mocked catalog
      expect(result.duplicateCount).toBe(4); // both 21591 rows + both 1862 rows (article repeated across pages)

      const matched1597 = result.items.find(
        (i: any) => i.articleNumber === '1597',
      );
      expect(matched1597.status).toBe(PriceImportItemStatus.MATCHED);
      expect(matched1597.variant).toEqual({ connect: { id: 'variant-1' } });
      expect(matched1597.oldSellingPrice).toBe(45);
    });

    it('flags a suspicious/huge price jump instead of applying it silently', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValueOnce([
        makeProduct({
          id: 'product-2',
          sku: '1554',
          variants: [
            {
              id: 'variant-2',
              productId: 'product-2',
              volume: '250ml',
              price: 40,
              costPrice: null,
              skuVariant: '1554-U',
            },
          ],
        }),
      ]);
      (prisma.priceImport.create as jest.Mock).mockImplementationOnce(
        ({ data }) => ({
          id: 'import-1',
          ...data,
          items: data.items.create,
        }),
      );

      const buffer = await generateScorepFixturePdf();
      const result: any = await service.createPreview(
        makeFile({ buffer }),
        'admin-1',
      );

      const item = result.items.find((i: any) => i.articleNumber === '1554');
      expect(item.status).toBe(PriceImportItemStatus.MATCHED);
      expect(item.isSuspicious).toBe(true);
      expect(item.warning).toMatch(/decimal|Suspicious/i);
    });

    it('never overwrites a price with an empty extracted value (INVALID_PRICE, not 0)', async () => {
      (prisma.priceImport.create as jest.Mock).mockImplementationOnce(
        ({ data }) => ({
          id: 'import-1',
          ...data,
          items: data.items.create,
        }),
      );

      const buffer = await generateScorepFixturePdf();
      const result: any = await service.createPreview(
        makeFile({ buffer }),
        'admin-1',
      );

      const item = result.items.find((i: any) => i.articleNumber === '2570');
      expect(item.status).toBe(PriceImportItemStatus.INVALID_PRICE);
      expect(item.newSupplierPrice).toBeNull();
      expect(item.newSellingPrice).toBeNull();
    });

    it('marks an unknown article number as NOT_FOUND without creating a product', async () => {
      (prisma.priceImport.create as jest.Mock).mockImplementationOnce(
        ({ data }) => ({
          id: 'import-1',
          ...data,
          items: data.items.create,
        }),
      );

      const buffer = await generateScorepFixturePdf();
      const result: any = await service.createPreview(
        makeFile({ buffer }),
        'admin-1',
      );

      const item = result.items.find((i: any) => i.articleNumber === '1121');
      expect(item.status).toBe(PriceImportItemStatus.NOT_FOUND);
      expect(item.product).toBeUndefined();
    });

    it('marks every occurrence of a duplicated article number as DUPLICATE', async () => {
      (prisma.priceImport.create as jest.Mock).mockImplementationOnce(
        ({ data }) => ({
          id: 'import-1',
          ...data,
          items: data.items.create,
        }),
      );

      const buffer = await generateScorepFixturePdf();
      const result: any = await service.createPreview(
        makeFile({ buffer }),
        'admin-1',
      );

      const dupes = result.items.filter(
        (i: any) => i.articleNumber === '21591',
      );
      expect(dupes).toHaveLength(2);
      expect(
        dupes.every((d: any) => d.status === PriceImportItemStatus.DUPLICATE),
      ).toBe(true);
    });

    it('continues without a fileUrl if storing the original PDF fails', async () => {
      uploadsService.uploadImage.mockRejectedValueOnce(
        new Error('storage down'),
      );
      (prisma.priceImport.create as jest.Mock).mockImplementationOnce(
        ({ data }) => ({ id: 'import-1', ...data }),
      );

      const buffer = await generateScorepFixturePdf();
      await service.createPreview(makeFile({ buffer }), 'admin-1');

      expect(prisma.priceImport.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ fileUrl: null }),
        }),
      );
    });
  });

  // ── applyImport (transactional apply) ───────────────────────────────────

  describe('applyImport()', () => {
    function makePreviewImport(items: any[]) {
      return { id: 'import-1', status: PriceImportStatus.PREVIEW, items };
    }

    it('throws NotFoundException for an unknown import id', async () => {
      (prisma.priceImport.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(
        service.applyImport('missing', ['x'], 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('refuses to re-apply an import that is not in PREVIEW status', async () => {
      (prisma.priceImport.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'import-1',
        status: PriceImportStatus.APPLIED,
        items: [],
      });
      await expect(
        service.applyImport('import-1', ['x'], 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when no selected item is actually MATCHED', async () => {
      (prisma.priceImport.findUnique as jest.Mock).mockResolvedValueOnce(
        makePreviewImport([
          { id: 'item-1', status: PriceImportItemStatus.NOT_FOUND },
        ]),
      );
      await expect(
        service.applyImport('import-1', ['item-1'], 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates only selected matched variants, atomically, and skips the rest', async () => {
      const items = [
        {
          id: 'item-1',
          status: PriceImportItemStatus.MATCHED,
          variantId: 'variant-1',
          newSupplierPrice: 32.5,
          newSellingPrice: 47.5,
        },
        {
          id: 'item-2',
          status: PriceImportItemStatus.MATCHED,
          variantId: 'variant-2',
          newSupplierPrice: 10,
          newSellingPrice: 15,
        },
        { id: 'item-3', status: PriceImportItemStatus.NOT_FOUND },
      ];
      (prisma.priceImport.findUnique as jest.Mock).mockResolvedValueOnce(
        makePreviewImport(items),
      );
      (prisma._tx.priceImport.update as jest.Mock).mockResolvedValueOnce({
        id: 'import-1',
        status: PriceImportStatus.APPLIED,
        updatedCount: 1,
      });

      await service.applyImport('import-1', ['item-1'], 'admin-1');

      expect(prisma._tx.productVariant.update).toHaveBeenCalledTimes(1);
      expect(prisma._tx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-1' },
        data: { costPrice: 32.5, price: 47.5 },
      });
      expect(prisma._tx.priceImportItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'item-1' } }),
      );
      expect(prisma._tx.priceImport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PriceImportStatus.APPLIED,
            updatedCount: 1,
          }),
        }),
      );
    });

    it('never sends a null price field to the DB when only one price was extracted', async () => {
      const items = [
        {
          id: 'item-1',
          status: PriceImportItemStatus.MATCHED,
          variantId: 'variant-1',
          newSupplierPrice: null,
          newSellingPrice: 47.5,
        },
      ];
      (prisma.priceImport.findUnique as jest.Mock).mockResolvedValueOnce(
        makePreviewImport(items),
      );
      (prisma._tx.priceImport.update as jest.Mock).mockResolvedValueOnce({});

      await service.applyImport('import-1', ['item-1'], 'admin-1');

      expect(prisma._tx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-1' },
        data: { price: 47.5 },
      });
    });
  });

  // ── rollbackImport ───────────────────────────────────────────────────────

  describe('rollbackImport()', () => {
    it('throws NotFoundException for an unknown import id', async () => {
      (prisma.priceImport.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(
        service.rollbackImport('missing', 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('refuses to roll back an import that was never applied', async () => {
      (prisma.priceImport.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'import-1',
        status: PriceImportStatus.PREVIEW,
        items: [],
      });
      await expect(
        service.rollbackImport('import-1', 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('restores the exact pre-import snapshot, not a recalculation', async () => {
      const items = [
        {
          id: 'item-1',
          status: PriceImportItemStatus.APPLIED,
          variantId: 'variant-1',
          oldSellingPrice: 45,
          oldSupplierPrice: null,
        },
      ];
      (prisma.priceImport.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'import-1',
        status: PriceImportStatus.APPLIED,
        items,
      });
      (prisma._tx.priceImport.update as jest.Mock).mockResolvedValueOnce({
        id: 'import-1',
        status: PriceImportStatus.ROLLED_BACK,
      });

      await service.rollbackImport('import-1', 'admin-1');

      expect(prisma._tx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-1' },
        data: { price: 45, costPrice: null },
      });
      expect(prisma._tx.priceImportItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { status: PriceImportItemStatus.ROLLED_BACK },
      });
    });
  });
});
