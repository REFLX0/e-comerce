import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  PriceImportItemStatus,
  PriceImportStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { ParserRegistry } from './parsers/parser-registry';
import { extractPdfPages } from './parsers/pdf-text-extractor';
import { ParsedPriceRow } from './parsers/supplier-price-parser.interface';
import { analyzePriceChange } from './price-change-analysis.util';

const APPLY_TRANSACTION_TIMEOUT_MS = 60_000;

@Injectable()
export class PriceImportService {
  private readonly logger = new Logger(PriceImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
    private readonly parserRegistry: ParserRegistry,
  ) {}

  // ─── Upload + parse + match + preview ────────────────────────────────────

  async createPreview(file: Express.Multer.File, uploadedById: string) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No PDF file received.');
    }

    const pages = await extractPdfPages(file.buffer);
    const fullText = pages
      .map((p) => p.items.map((i) => i.str).join(' '))
      .join('\n');

    const parser = this.parserRegistry.findParser(fullText);
    if (!parser) {
      throw new BadRequestException(
        'Unrecognized price list format. No parser matches this PDF (expected columns: Article number, Description, Content, nouveau prix, VENTE PUB TTC).',
      );
    }

    let rows: ParsedPriceRow[];
    try {
      rows = parser.parse(pages);
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Failed to parse PDF.');
    }

    if (rows.length === 0) {
      throw new BadRequestException(
        'No product rows were detected in this PDF.',
      );
    }

    const preparedItems = await this.prepareItems(rows);

    let fileUrl: string | null = null;
    try {
      fileUrl = await this.uploadsService.uploadImage(
        { ...file, mimetype: 'application/pdf' },
        false,
      );
    } catch (err: any) {
      this.logger.warn(
        `Failed to store original PDF (${err?.message}); continuing without fileUrl.`,
      );
    }

    const matchedCount = preparedItems.filter(
      (i) => i.status === PriceImportItemStatus.MATCHED,
    ).length;
    const unmatchedCount = preparedItems.filter(
      (i) => i.status === PriceImportItemStatus.NOT_FOUND,
    ).length;
    const duplicateCount = preparedItems.filter(
      (i) => i.status === PriceImportItemStatus.DUPLICATE,
    ).length;

    const priceImport = await this.prisma.priceImport.create({
      data: {
        filename: file.originalname,
        fileUrl,
        supplier: parser.supplierLabel,
        parserKey: parser.supplierKey,
        status: PriceImportStatus.PREVIEW,
        uploadedById,
        detectedCount: rows.length,
        matchedCount,
        unmatchedCount,
        duplicateCount,
        updatedCount: 0,
        items: { create: preparedItems },
      },
      include: { items: { orderBy: { rowIndex: 'asc' } } },
    });

    return priceImport;
  }

  private async prepareItems(
    rows: ParsedPriceRow[],
  ): Promise<Prisma.PriceImportItemCreateWithoutImportInput[]> {
    // Duplicate article numbers must never be silently resolved — flag every
    // occurrence so the admin has to look at the PDF, not guess which one is right.
    const countByArticle = new Map<string, number>();
    for (const row of rows) {
      countByArticle.set(
        row.articleNumber,
        (countByArticle.get(row.articleNumber) || 0) + 1,
      );
    }

    const articleNumbers = [...countByArticle.keys()];
    const products = await this.prisma.product.findMany({
      where: { sku: { in: articleNumbers } },
      include: { variants: true },
    });
    const productBySku = new Map(products.map((p) => [p.sku, p]));

    const items: Prisma.PriceImportItemCreateWithoutImportInput[] = [];

    rows.forEach((row, rowIndex) => {
      const isDuplicate = (countByArticle.get(row.articleNumber) || 0) > 1;

      if (isDuplicate) {
        items.push({
          rowIndex,
          articleNumber: row.articleNumber,
          description: row.description || null,
          content: row.content,
          newSupplierPrice: row.supplierPrice,
          newSellingPrice: row.sellingPrice,
          status: PriceImportItemStatus.DUPLICATE,
          warning: `Duplicate article ${row.articleNumber} detected in the PDF — resolve in the source file before importing.`,
          isSuspicious: true,
        });
        return;
      }

      if (row.supplierPrice == null && row.sellingPrice == null) {
        items.push({
          rowIndex,
          articleNumber: row.articleNumber,
          description: row.description || null,
          content: row.content,
          newSupplierPrice: null,
          newSellingPrice: null,
          status: PriceImportItemStatus.INVALID_PRICE,
          warning: 'No price value could be read for this article.',
          isSuspicious: true,
        });
        return;
      }

      const product = productBySku.get(row.articleNumber);
      if (!product) {
        items.push({
          rowIndex,
          articleNumber: row.articleNumber,
          description: row.description || null,
          content: row.content,
          newSupplierPrice: row.supplierPrice,
          newSellingPrice: row.sellingPrice,
          status: PriceImportItemStatus.NOT_FOUND,
          warning: null,
        });
        return;
      }

      if (product.variants.length !== 1) {
        items.push({
          rowIndex,
          articleNumber: row.articleNumber,
          description: row.description || null,
          content: row.content,
          newSupplierPrice: row.supplierPrice,
          newSellingPrice: row.sellingPrice,
          product: { connect: { id: product.id } },
          status: PriceImportItemStatus.AMBIGUOUS,
          warning:
            product.variants.length === 0
              ? 'Matched product has no variant to price.'
              : `Matched product has ${product.variants.length} variants (sizes) — cannot determine which one this price list row applies to.`,
          isSuspicious: true,
        });
        return;
      }

      const variant = product.variants[0];
      const sellingAnalysis = analyzePriceChange(
        variant.price,
        row.sellingPrice,
      );
      const supplierAnalysis = analyzePriceChange(
        variant.costPrice,
        row.supplierPrice,
      );
      const isSuspicious =
        sellingAnalysis.isSuspicious || supplierAnalysis.isSuspicious;
      const warning =
        [sellingAnalysis.warning, supplierAnalysis.warning]
          .filter(Boolean)
          .join(' ') || null;

      items.push({
        rowIndex,
        articleNumber: row.articleNumber,
        description: row.description || null,
        content: row.content,
        newSupplierPrice: row.supplierPrice,
        newSellingPrice: row.sellingPrice,
        product: { connect: { id: product.id } },
        variant: { connect: { id: variant.id } },
        oldSellingPrice: variant.price,
        oldSupplierPrice: variant.costPrice,
        changePercent:
          sellingAnalysis.changePercent ?? supplierAnalysis.changePercent,
        status: PriceImportItemStatus.MATCHED,
        isSuspicious,
        warning,
      });
    });

    return items;
  }

  // ─── Apply ────────────────────────────────────────────────────────────────

  async applyImport(importId: string, itemIds: string[], appliedById: string) {
    const priceImport = await this.prisma.priceImport.findUnique({
      where: { id: importId },
      include: { items: true },
    });
    if (!priceImport) throw new NotFoundException('Price import not found.');
    if (priceImport.status !== PriceImportStatus.PREVIEW) {
      throw new BadRequestException(
        `This import has already been ${priceImport.status.toLowerCase()}.`,
      );
    }

    const selectedIds = new Set(itemIds);
    const toApply = priceImport.items.filter(
      (i) =>
        selectedIds.has(i.id) && i.status === PriceImportItemStatus.MATCHED,
    );
    if (toApply.length === 0) {
      throw new BadRequestException(
        'No valid matched items were selected to apply.',
      );
    }
    const toSkip = priceImport.items.filter(
      (i) => !toApply.some((a) => a.id === i.id),
    );

    const updated = await this.prisma.$transaction(
      async (tx) => {
        for (const item of toApply) {
          if (!item.variantId) continue; // guarded by MATCHED status, but keep TS/runtime safe

          const data: Prisma.ProductVariantUpdateInput = {};
          if (item.newSupplierPrice != null)
            data.costPrice = item.newSupplierPrice;
          if (item.newSellingPrice != null) data.price = item.newSellingPrice;

          if (Object.keys(data).length > 0) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data,
            });
          }

          await tx.priceImportItem.update({
            where: { id: item.id },
            data: {
              status: PriceImportItemStatus.APPLIED,
              selected: true,
              appliedAt: new Date(),
            },
          });
        }

        if (toSkip.length > 0) {
          await tx.priceImportItem.updateMany({
            where: { id: { in: toSkip.map((i) => i.id) } },
            data: { selected: false },
          });
        }

        return tx.priceImport.update({
          where: { id: importId },
          data: {
            status: PriceImportStatus.APPLIED,
            appliedById,
            appliedAt: new Date(),
            updatedCount: toApply.length,
          },
          include: { items: { orderBy: { rowIndex: 'asc' } } },
        });
      },
      { timeout: APPLY_TRANSACTION_TIMEOUT_MS },
    );

    return updated;
  }

  // ─── Rollback ─────────────────────────────────────────────────────────────

  async rollbackImport(importId: string, rolledBackById: string) {
    const priceImport = await this.prisma.priceImport.findUnique({
      where: { id: importId },
      include: { items: true },
    });
    if (!priceImport) throw new NotFoundException('Price import not found.');
    if (priceImport.status !== PriceImportStatus.APPLIED) {
      throw new BadRequestException(
        'Only an applied import can be rolled back.',
      );
    }

    const appliedItems = priceImport.items.filter(
      (i) => i.status === PriceImportItemStatus.APPLIED,
    );

    const updated = await this.prisma.$transaction(
      async (tx) => {
        for (const item of appliedItems) {
          if (!item.variantId) continue;

          // Exact restore of the pre-import snapshot, never a recalculation.
          // oldSellingPrice is always set for an APPLIED item (it's a snapshot of
          // ProductVariant.price, a required field, taken at match time).
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              price: item.oldSellingPrice as number,
              costPrice: item.oldSupplierPrice,
            },
          });

          await tx.priceImportItem.update({
            where: { id: item.id },
            data: { status: PriceImportItemStatus.ROLLED_BACK },
          });
        }

        return tx.priceImport.update({
          where: { id: importId },
          data: {
            status: PriceImportStatus.ROLLED_BACK,
            rolledBackById,
            rolledBackAt: new Date(),
          },
          include: { items: { orderBy: { rowIndex: 'asc' } } },
        });
      },
      { timeout: APPLY_TRANSACTION_TIMEOUT_MS },
    );

    return updated;
  }

  // ─── History / detail ───────────────────────────────────────────────────

  async findHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.priceImport.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, name: true, email: true } },
          appliedBy: { select: { id: true, name: true, email: true } },
          rolledBackBy: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.priceImport.count(),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const priceImport = await this.prisma.priceImport.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { rowIndex: 'asc' },
          include: {
            product: { select: { id: true, nameFr: true, sku: true } },
          },
        },
        uploadedBy: { select: { id: true, name: true, email: true } },
        appliedBy: { select: { id: true, name: true, email: true } },
        rolledBackBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!priceImport) throw new NotFoundException('Price import not found.');
    return priceImport;
  }
}
