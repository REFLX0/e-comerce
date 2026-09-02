import PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';
import { Invoice, InvoiceLine } from '@prisma/client';

const LOGO_PATH = path.join(__dirname, '..', 'admin', 'logo.jpg');

const COLORS = {
  primary: '#0B1D3A',
  accent: '#E10600',
  gray: '#64748b',
  lightGray: '#f1f5f9',
  border: '#e2e8f0',
  white: '#ffffff',
};

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  mf: string;
}

function drawLogo(doc: typeof PDFDocument, x: number, y: number, companyName: string, maxWidth = 140, maxHeight = 60) {
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, x, y, {
      fit: [maxWidth, maxHeight],
      align: 'left',
      valign: 'top',
    });
  } else {
    doc
      .fontSize(20)
      .fillColor(COLORS.primary)
      .font('Helvetica-Bold')
      .text(companyName, x, y);
  }
}

export async function generateInvoicePDF(
  invoice: Invoice & { lines: InvoiceLine[] },
  companyInfo: CompanyInfo
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = 595.28;
    const L = 40;
    const R = 40;
    const contentWidth = pageWidth - L - R;

    // ── HEADER ──
    drawLogo(doc, L, 35, companyInfo.name, 140, 60);

    doc
      .fontSize(8)
      .fillColor(COLORS.gray)
      .font('Helvetica')
      .text(companyInfo.address, pageWidth / 2, 35, {
        align: 'right',
        width: pageWidth / 2 - R,
      })
      .text(companyInfo.phone, pageWidth / 2, 49, {
        align: 'right',
        width: pageWidth / 2 - R,
      })
      .text(companyInfo.email, pageWidth / 2, 63, {
        align: 'right',
        width: pageWidth / 2 - R,
      });

    // Red accent divider
    doc
      .moveTo(L, 108)
      .lineTo(pageWidth - R, 108)
      .lineWidth(2)
      .strokeColor(COLORS.accent)
      .stroke();
    doc.lineWidth(1);

    // ── TITLE + META BOX ──
    doc
      .fontSize(22)
      .fillColor(COLORS.primary)
      .font('Helvetica-Bold')
      .text('FACTURE', L, 118);

    const metaX = pageWidth - R - 210;
    doc.rect(metaX, 112, 210, 75).fill(COLORS.lightGray);
    doc.fontSize(8).fillColor(COLORS.gray).font('Helvetica');
    
    doc
      .text('N° Facture', metaX + 8, 118)
      .text('Date d\'émission', metaX + 8, 134)
      .text('Client', metaX + 8, 150)
      .text('Matricule Fiscal', metaX + 8, 166);

    doc.fontSize(8).fillColor(COLORS.primary).font('Helvetica-Bold');
    
    doc
      .text(invoice.invoiceNumber || '-', metaX + 70, 118, { width: 130, align: 'right' })
      .text(invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('fr-TN') : '-', metaX + 70, 134, {
        width: 130,
        align: 'right',
      })
      .text(invoice.clientName || 'Client', metaX + 70, 150, {
        width: 130,
        align: 'right',
      })
      .text(invoice.clientMf || '-', metaX + 70, 166, {
        width: 130,
        align: 'right',
      });

    // ── TABLE HEADER ──
    const tableY = 205;
    doc.rect(L, tableY, contentWidth, 22).fill(COLORS.primary);
    doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(8.5);
    doc.text('DÉSIGNATION', L + 8, tableY + 6, { width: 235 });
    doc.text('QTÉ', L + 245, tableY + 6, { width: 40, align: 'center' });
    doc.text('PRIX HT', L + 285, tableY + 6, { width: 70, align: 'right' });
    doc.text('TVA', L + 365, tableY + 6, { width: 50, align: 'center' });
    doc.text('TOTAL TTC', L + 425, tableY + 6, { width: 80, align: 'right' });

    // ── TABLE ROWS ──
    let y = tableY + 22;
    doc.font('Helvetica').fontSize(8.5);

    invoice.lines.forEach((item, idx) => {
      if (y > doc.page.height - 180) {
        doc.addPage();
        y = 40;
      }
      const rowColor = idx % 2 === 0 ? COLORS.white : COLORS.lightGray;
      doc.rect(L, y, contentWidth, 20).fill(rowColor);
      doc.fillColor(COLORS.primary);
      
      doc.text(item.description, L + 8, y + 5, { width: 235 });
      doc.text(String(item.quantity), L + 245, y + 5, { width: 40, align: 'center' });
      doc.text(`${item.unitPriceHT.toFixed(3)} DT`, L + 285, y + 5, { width: 70, align: 'right' });
      doc.text(`${(item.vatRate * 100).toFixed(0)}%`, L + 365, y + 5, { width: 50, align: 'center' });
      doc.text(`${item.totalTTC.toFixed(3)} DT`, L + 425, y + 5, { width: 80, align: 'right' });
      
      y += 20;
    });

    doc
      .moveTo(L, y)
      .lineTo(pageWidth - R, y)
      .strokeColor(COLORS.border)
      .stroke();

    // ── TOTALS BLOCK ──
    const totalsX = L + contentWidth - 200;
    y += 16;

    const line = (label: string, value: string) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(COLORS.gray)
        .text(label, totalsX, y, { width: 110 });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(COLORS.primary)
        .text(value, totalsX + 112, y, { width: 90, align: 'right' });
      y += 16;
    };

    line('Total HT', `${invoice.subtotalHT.toFixed(3)} DT`);
    line('Total TVA', `${invoice.totalTVA.toFixed(3)} DT`);

    // TTC accent block
    doc.rect(totalsX - 8, y - 4, 210, 28).fill(COLORS.primary);
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(COLORS.white)
      .text('TOTAL TTC', totalsX, y + 3, { width: 110 })
      .text(`${invoice.totalTTC.toFixed(3)} DT`, totalsX + 112, y + 3, {
        width: 90,
        align: 'right',
      });

    // ── AMOUNT IN WORDS & NOTES ──
    y += 35;
    
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 40;
    }
    
    doc
      .fontSize(9)
      .fillColor(COLORS.primary)
      .font('Helvetica')
      .text('Arrêté la présente facture à la somme de :', L, y);
      
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(invoice.amountInWords || '-', L, y + 14);

    if (invoice.notes) {
      y += 40;
      doc
        .fontSize(8.5)
        .fillColor(COLORS.gray)
        .font('Helvetica-Oblique')
        .text('Notes / Conditions :', L, y)
        .text(invoice.notes, L, y + 12, { width: contentWidth });
    }

    // ── FOOTER (added to all pages) ──
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      
      const footerY = doc.page.height - 62;
      doc
        .moveTo(L, footerY)
        .lineTo(pageWidth - R, footerY)
        .strokeColor(COLORS.border)
        .stroke();
      doc
        .fontSize(7.5)
        .fillColor(COLORS.gray)
        .font('Helvetica')
        .text(
          `${companyInfo.name}`,
          L,
          footerY + 8,
          { align: 'center', width: contentWidth },
        )
        .text(
          `${companyInfo.address} | Tél: ${companyInfo.phone} | ${companyInfo.email}`,
          L,
          footerY + 21,
          { align: 'center', width: contentWidth },
        );
      doc
        .fontSize(7.5)
        .fillColor(COLORS.primary)
        .font('Helvetica-Bold')
        .text(
          `Matricule Fiscal: ${companyInfo.mf}`,
          L,
          footerY + 34,
          { align: 'center', width: contentWidth },
        );
    }

    doc.end();
  });
}
