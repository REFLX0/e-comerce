import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
// Use the colleague's superior PDF engine (settings-driven, Timbre Fiscal, Taba3 stamp, amount in words)
import { generatePOSInvoicePDF } from '../admin/invoice-pdf';
// Use the colleague's number-to-words (better French grammar, proper Tunisian format)
import { amountToTunisianWords } from '../admin/number-to-words';
// Keep local version as a fallback alias so existing call sites that use numberToWordsDT still compile
import { numberToWordsDT } from '../common/utils/number-to-words';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto) {
    // Calculate totals based on lines
    let subtotalHT = 0;
    let totalTVA = 0;
    let totalTTC = 0;

    const processedLines = dto.lines.map(line => {
      const quantity = line.quantity;
      const unitPriceHT = line.unitPriceHT;
      const vatRate = line.vatRate ?? 0.19;

      const lineHT = quantity * unitPriceHT;
      const vatAmount = lineHT * vatRate;
      const lineTTC = lineHT + vatAmount;

      subtotalHT += lineHT;
      totalTVA += vatAmount;
      totalTTC += lineTTC;

      return {
        description: line.description,
        quantity,
        unitPriceHT,
        vatRate,
        vatAmount,
        totalTTC: lineTTC,
      };
    });

    // Round totals to 3 decimal places for Dinars
    subtotalHT = Math.round(subtotalHT * 1000) / 1000;
    totalTVA = Math.round(totalTVA * 1000) / 1000;
    totalTTC = Math.round(totalTTC * 1000) / 1000;

    const amountInWords = numberToWordsDT(totalTTC);

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: '', // placeholder, will update after getting sequence
          issueDate: new Date(),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          status: dto.status ?? 'DRAFT',
          customerId: dto.customerId,
          orderId: dto.orderId,
          clientName: dto.clientName,
          clientAddress: dto.clientAddress,
          clientEmail: dto.clientEmail,
          clientPhone: dto.clientPhone,
          clientMf: dto.clientMf,
          notes: dto.notes,
          subtotalHT,
          totalTVA,
          totalTTC,
          amountInWords,
          lines: {
            create: processedLines,
          },
        },
        include: { lines: true }
      });

      // Update invoiceNumber based on sequenceNumber
      const invoiceNumber = `FACTURE#${invoice.sequenceNumber}`;
      return tx.invoice.update({
        where: { id: invoice.id },
        data: { invoiceNumber },
        include: { lines: true }
      });
    });
  }

  async findAll(userId?: string) {
    const where = userId ? { customerId: userId } : {};
    return this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true, email: true } } }
    });
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.customerId = userId;

    const invoice = await this.prisma.invoice.findUnique({
      where,
      include: { lines: true }
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT invoices can be updated');
    }

    if (dto.lines) {
      // Re-calculate totals if lines are provided
      let subtotalHT = 0;
      let totalTVA = 0;
      let totalTTC = 0;

      const processedLines = dto.lines.map(line => {
        const quantity = line.quantity;
        const unitPriceHT = line.unitPriceHT;
        const vatRate = line.vatRate ?? 0.19;

        const lineHT = quantity * unitPriceHT;
        const vatAmount = lineHT * vatRate;
        const lineTTC = lineHT + vatAmount;

        subtotalHT += lineHT;
        totalTVA += vatAmount;
        totalTTC += lineTTC;

        return {
          description: line.description,
          quantity,
          unitPriceHT,
          vatRate,
          vatAmount,
          totalTTC: lineTTC,
        };
      });

      subtotalHT = Math.round(subtotalHT * 1000) / 1000;
      totalTVA = Math.round(totalTVA * 1000) / 1000;
      totalTTC = Math.round(totalTTC * 1000) / 1000;

      const amountInWords = numberToWordsDT(totalTTC);

      return this.prisma.invoice.update({
        where: { id },
        data: {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          status: dto.status,
          clientName: dto.clientName,
          clientAddress: dto.clientAddress,
          clientEmail: dto.clientEmail,
          clientPhone: dto.clientPhone,
          clientMf: dto.clientMf,
          notes: dto.notes,
          subtotalHT,
          totalTVA,
          totalTTC,
          amountInWords,
          lines: {
            deleteMany: {},
            create: processedLines,
          }
        },
        include: { lines: true }
      });
    } else {
      return this.prisma.invoice.update({
        where: { id },
        data: {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          status: dto.status,
          clientName: dto.clientName,
          clientAddress: dto.clientAddress,
          clientEmail: dto.clientEmail,
          clientPhone: dto.clientPhone,
          clientMf: dto.clientMf,
          notes: dto.notes,
        },
        include: { lines: true }
      });
    }
  }

  async remove(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    
    // Instead of hard deleting, we might want to cancel it, but let's support delete for drafts
    if (invoice.status === 'DRAFT') {
      return this.prisma.invoice.delete({ where: { id } });
    }
    
    // For non-drafts, just cancel
    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
  }

  async duplicate(id: string) {
    const original = await this.findOne(id);
    
    const lines = original.lines.map(l => ({
      description: l.description,
      quantity: l.quantity,
      unitPriceHT: l.unitPriceHT,
      vatRate: l.vatRate,
    }));

    return this.create({
      customerId: original.customerId || undefined,
      clientName: original.clientName,
      clientAddress: original.clientAddress || undefined,
      clientEmail: original.clientEmail || undefined,
      clientPhone: original.clientPhone || undefined,
      clientMf: original.clientMf || undefined,
      notes: original.notes || undefined,
      status: 'DRAFT',
      lines
    });
  }

  async generatePdf(id: string, userId?: string): Promise<Buffer> {
    const invoice = await this.findOne(id, userId);

    // Map Prisma InvoiceLine[] → POSInvoiceItem[]
    // POSInvoicePDF works with HT prices; InvoiceLine stores unitPriceHT directly ✓
    const items = invoice.lines.map((line: any) => ({
      name: line.description,
      quantity: line.quantity,
      unitPriceHT: Number(line.unitPriceHT),
    }));

    // Use the colleague's PDF engine which is settings-driven, supports
    // Timbre Fiscal, Taba3 stamp, dynamic logo resolution, and amount in words
    const pdfBuffer = generatePOSInvoicePDF({
      invoiceNumber: invoice.invoiceNumber || `FACTURE#${(invoice as any).sequenceNumber}`,
      date: new Date(invoice.issueDate),
      clientName: invoice.clientName || 'Client comptoir',
      items,
    });

    return pdfBuffer;
  }
}
