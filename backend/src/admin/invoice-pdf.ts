import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { amountToTunisianWords } from './number-to-words';

export interface InvoiceOrder {
  id: string;
  createdAt: Date;
  status: string;
  totalAmount: number;
  shippingCost: number;
  shipFullName: string;
  shipPhone: string;
  shipWilaya: string;
  shipCity: string;
  notes?: string | null;
  items: Array<{
    quantity: number;
    unitPrice: number;
    product: { nameFr: string };
    variant?: { volume?: string | null } | null;
  }>;
  user?: { name?: string | null; email?: string } | null;
}

export interface InvoiceSettings {
  SITE_NAME?: string;
  CONTACT_EMAIL?: string;
  CONTACT_PHONE?: string;
  FACTURE_LOGO?: string;
  FACTURE_TABA3?: string;
  FACTURE_CODE_IMG?: string;
  FACTURE_MATRICULE_FISCALE?: string;
  FACTURE_REGISTRE_COMMERCE?: string;
  FACTURE_ADDRESS?: string;
  FACTURE_PHONE?: string;
  FACTURE_EMAIL?: string;
  FACTURE_TVA_RATE?: string;
  FACTURE_TIMBRE_FISCAL?: string;
}

function formatDt(amount: number): string {
  const rounded = Math.round(amount * 1000) / 1000;
  const parts = rounded.toFixed(3).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${intPart},${parts[1]} DT`;
}

function formatFrenchDate(date: Date): string {
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

function resolveImagePath(imageRef?: string | null): string | null {
  if (!imageRef || typeof imageRef !== 'string' || imageRef.trim() === '') {
    return null;
  }

  const clean = imageRef.trim().replace(/^["']|["']$/g, '');
  if (!clean) return null;

  const searchRoots = [
    process.cwd(),
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), '..', 'frontend', 'public'),
    path.join(__dirname, '..', '..', 'uploads'),
    path.join(__dirname, '..', '..', 'public'),
    path.join(__dirname, '..', '..', '..', 'frontend', 'public'),
  ];

  const baseName = path.basename(clean);

  // Direct check
  if (fs.existsSync(clean)) return clean;

  // Search each root
  for (const root of searchRoots) {
    const p1 = path.join(root, clean.replace(/^\//, ''));
    if (fs.existsSync(p1)) return p1;

    const p2 = path.join(root, baseName);
    if (fs.existsSync(p2)) return p2;
  }

  return null;
}

function findDefaultLogo(): string | null {
  const searchRoots = [
    process.cwd(),
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), '..', 'frontend', 'public'),
    path.join(__dirname, '..', '..', 'uploads'),
    path.join(__dirname, '..', '..', 'public'),
    path.join(__dirname, '..', '..', '..', 'frontend', 'public'),
  ];

  const logoFilenames = [
    'facturelogo.jpeg',
    'facturelogo.jpg',
    'facturelogo.png',
    'logo.jpg',
    'logo.png',
    'logo.jpeg',
  ];

  for (const root of searchRoots) {
    for (const file of logoFilenames) {
      const candidate = path.join(root, file);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function findDefaultStamp(): string | null {
  const searchRoots = [
    process.cwd(),
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), '..', 'frontend', 'public'),
    path.join(__dirname, '..', '..', 'uploads'),
    path.join(__dirname, '..', '..', 'public'),
    path.join(__dirname, '..', '..', '..', 'frontend', 'public'),
  ];

  const stampFilenames = [
    'taba3.png',
    'taba3.jpg',
    'taba3.jpeg',
    'cachet.png',
    'cachet.jpg',
  ];

  for (const root of searchRoots) {
    for (const file of stampFilenames) {
      const candidate = path.join(root, file);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

export function generateDeliveryNotePDF(
  order: InvoiceOrder,
  settings: InvoiceSettings = {},
) {
  const doc = new PDFDocument({ size: 'A4', margin: 35, autoFirstPage: true });
  const pageWidth = 595.28;
  const leftMargin = 35;
  const rightMargin = 35;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 525.28

  // Colors
  const primaryColor = '#1e293b'; // dark slate
  const secondaryColor = '#475569'; // muted text
  const tableHeaderBg = '#f1f5f9'; // soft header background
  const tableBorderColor = '#334155'; // crisp accounting grid

  const companyName = settings.SITE_NAME || 'SPECPART';
  const companyAddress =
    settings.FACTURE_ADDRESS || 'Jardins De Carthage 1090, Tunis';
  const companyEmail =
    settings.FACTURE_EMAIL ||
    settings.CONTACT_EMAIL ||
    'specpart@hotmail.com';
  const companyPhone =
    settings.FACTURE_PHONE || settings.CONTACT_PHONE || '29294195';
  const companyMf =
    settings.FACTURE_MATRICULE_FISCALE || '1823940/A/P/000';
  const companyRc = settings.FACTURE_REGISTRE_COMMERCE || '';

  // Resolve Logo image
  let logoPath: string | null = null;
  if (settings.FACTURE_LOGO) {
    logoPath = resolveImagePath(settings.FACTURE_LOGO);
  }
  if (!logoPath) {
    logoPath = findDefaultLogo();
  }

  // Resolve Taba3 (Blue Stamp) image
  let taba3Path: string | null = null;
  if (settings.FACTURE_TABA3) {
    taba3Path = resolveImagePath(settings.FACTURE_TABA3);
  }
  if (!taba3Path) {
    taba3Path = findDefaultStamp();
  }

  // Resolve Code Image (QR code / barcode)
  let codeImgPath: string | null = null;
  if (settings.FACTURE_CODE_IMG) {
    codeImgPath = resolveImagePath(settings.FACTURE_CODE_IMG);
  }

  // ── HEADER: LOGO & COMPANY INFO (LEFT) ──
  let headerLeftTextX = leftMargin;
  const startY = 35;

  if (logoPath) {
    try {
      doc.image(logoPath, leftMargin, startY, { fit: [110, 58] });
      headerLeftTextX = leftMargin + 120;
    } catch (e) {
      headerLeftTextX = leftMargin;
    }
  }

  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(companyName.toUpperCase(), headerLeftTextX, startY + 2);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text(companyAddress, headerLeftTextX, startY + 16);
  doc.text(companyEmail, headerLeftTextX, startY + 28);
  doc.text(companyPhone, headerLeftTextX, startY + 40);
  if (companyMf) {
    doc
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text(`MF: ${companyMf}`, headerLeftTextX, startY + 52);
  }

  // ── HEADER: FACTURE TITLE & DATES (RIGHT) ──
  const orderNumber = (order.id || '').slice(-8).toUpperCase() || '1';
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStr = formatFrenchDate(orderDate);

  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .fillColor('#334155')
    .text(`FACTURE#${orderNumber}`, leftMargin, startY, {
      align: 'right',
      width: contentWidth,
    });

  doc
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(`Date: `, leftMargin, startY + 30, {
      align: 'right',
      width: contentWidth - 85,
    });
  doc
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text(dateStr, leftMargin, startY + 30, {
      align: 'right',
      width: contentWidth,
    });

  doc
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(`Date d'échéance : `, leftMargin, startY + 44, {
      align: 'right',
      width: contentWidth - 85,
    });
  doc
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text(dateStr, leftMargin, startY + 44, {
      align: 'right',
      width: contentWidth,
    });

  // If Code image exists (QR / Barcode), render beside dates
  if (codeImgPath) {
    try {
      doc.image(codeImgPath, pageWidth - rightMargin - 50, startY + 60, {
        fit: [50, 50],
      });
    } catch {
      // Ignore
    }
  }

  // ── FACTURÉ À (CLIENT INFO) ──
  const clientStartY = startY + 80;
  doc
    .fontSize(10.5)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('Facturé À:', leftMargin, clientStartY);

  const clientName =
    order.shipFullName || order.user?.name || 'Client Particulier';
  const clientLocation = [order.shipCity, order.shipWilaya]
    .filter(Boolean)
    .join(', ');

  doc
    .fontSize(9.5)
    .font('Helvetica')
    .fillColor(primaryColor)
    .text(clientName, leftMargin, clientStartY + 15);

  if (clientLocation) {
    doc
      .fontSize(9)
      .fillColor(secondaryColor)
      .text(clientLocation, leftMargin, clientStartY + 28);
  }

  if (order.shipPhone) {
    doc
      .fontSize(8.5)
      .fillColor(secondaryColor)
      .text(
        `Tél: ${order.shipPhone}`,
        leftMargin,
        clientStartY + (clientLocation ? 40 : 28),
      );
  }

  // ── ARTICLES TABLE ──
  const tableY = clientStartY + 60;
  const colW = {
    num: 28,
    name: 245,
    qty: 55,
    puHt: 65,
    tva: 60,
    total: 72.28,
  };

  const colX = {
    num: leftMargin,
    name: leftMargin + colW.num,
    qty: leftMargin + colW.num + colW.name,
    puHt: leftMargin + colW.num + colW.name + colW.qty,
    tva: leftMargin + colW.num + colW.name + colW.qty + colW.puHt,
    total: leftMargin + colW.num + colW.name + colW.qty + colW.puHt + colW.tva,
  };

  const headerHeight = 22;

  // Header background
  doc
    .rect(leftMargin, tableY, contentWidth, headerHeight)
    .fillAndStroke(tableHeaderBg, tableBorderColor);

  // Vertical column borders for header
  Object.values(colX).forEach((x) => {
    if (x > leftMargin) {
      doc
        .moveTo(x, tableY)
        .lineTo(x, tableY + headerHeight)
        .strokeColor(tableBorderColor)
        .stroke();
    }
  });

  // Header text
  doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor);
  doc.text('#', colX.num, tableY + 6, { width: colW.num, align: 'center' });
  doc.text('Article(s)', colX.name + 6, tableY + 6, {
    width: colW.name - 12,
    align: 'left',
  });
  doc.text('Quantité', colX.qty, tableY + 6, {
    width: colW.qty,
    align: 'center',
  });
  doc.text('PU HT', colX.puHt, tableY + 6, {
    width: colW.puHt - 6,
    align: 'right',
  });
  doc.text('TVA', colX.tva, tableY + 6, {
    width: colW.tva - 6,
    align: 'right',
  });
  doc.text('Total', colX.total, tableY + 6, {
    width: colW.total - 6,
    align: 'right',
  });

  let currentY = tableY + headerHeight;
  let subtotalHt = 0;
  let totalTva = 0;
  const tvaRate = parseFloat(settings.FACTURE_TVA_RATE || '19') / 100;

  order.items.forEach((item, index) => {
    const rowHeight = 22;

    // Check page break
    if (currentY + rowHeight > doc.page.height - 130) {
      doc.addPage();
      currentY = 40;
    }

    const puTtc = item.unitPrice;
    const puHt = puTtc / (1 + tvaRate);
    const itemTva = (puTtc - puHt) * item.quantity;
    const itemTotalTtc = puTtc * item.quantity;

    subtotalHt += puHt * item.quantity;
    totalTva += itemTva;

    // Row rectangle
    doc
      .rect(leftMargin, currentY, contentWidth, rowHeight)
      .fillAndStroke('#ffffff', tableBorderColor);

    // Vertical column borders
    Object.values(colX).forEach((x) => {
      if (x > leftMargin) {
        doc
          .moveTo(x, currentY)
          .lineTo(x, currentY + rowHeight)
          .strokeColor(tableBorderColor)
          .stroke();
      }
    });

    const itemName = item.product?.nameFr || 'Article';
    const volume = item.variant?.volume ? ` (${item.variant.volume})` : '';

    doc.fontSize(8.5).font('Helvetica').fillColor(primaryColor);
    doc.text(String(index + 1), colX.num, currentY + 6, {
      width: colW.num,
      align: 'center',
    });
    doc.text(`${itemName}${volume}`, colX.name + 6, currentY + 6, {
      width: colW.name - 12,
      align: 'left',
      ellipsis: true,
    });
    doc.text(String(item.quantity), colX.qty, currentY + 6, {
      width: colW.qty,
      align: 'center',
    });
    doc.text(formatDt(puHt), colX.puHt, currentY + 6, {
      width: colW.puHt - 6,
      align: 'right',
    });
    doc.text(formatDt(itemTva), colX.tva, currentY + 6, {
      width: colW.tva - 6,
      align: 'right',
    });
    doc.text(formatDt(itemTotalTtc), colX.total, currentY + 6, {
      width: colW.total - 6,
      align: 'right',
    });

    currentY += rowHeight;
  });

  // ── TOTALS SUMMARY (RIGHT) ──
  const summaryWidth = 200;
  const summaryX = pageWidth - rightMargin - summaryWidth;
  let summaryY = currentY + 12;

  // Sous-Total
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('Sous-Total', summaryX, summaryY, { width: 90, align: 'right' });
  doc
    .font('Helvetica')
    .fillColor(primaryColor)
    .text(formatDt(subtotalHt), summaryX + 95, summaryY, {
      width: summaryWidth - 95,
      align: 'right',
    });

  // TVA
  summaryY += 16;
  doc
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('TVA', summaryX, summaryY, { width: 90, align: 'right' });
  doc
    .font('Helvetica')
    .fillColor(primaryColor)
    .text(formatDt(totalTva), summaryX + 95, summaryY, {
      width: summaryWidth - 95,
      align: 'right',
    });

  // Shipping if any
  if (order.shippingCost > 0) {
    summaryY += 16;
    doc
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Livraison', summaryX, summaryY, { width: 90, align: 'right' });
    doc
      .font('Helvetica')
      .fillColor(primaryColor)
      .text(formatDt(order.shippingCost), summaryX + 95, summaryY, {
        width: summaryWidth - 95,
        align: 'right',
      });
  }

  // Timbre Fiscal
  const timbreFiscal = parseFloat(settings.FACTURE_TIMBRE_FISCAL || '1.000');
  if (timbreFiscal > 0) {
    summaryY += 16;
    doc
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Timbre Fiscal', summaryX, summaryY, { width: 90, align: 'right' });
    doc
      .font('Helvetica')
      .fillColor(primaryColor)
      .text(formatDt(timbreFiscal), summaryX + 95, summaryY, {
        width: summaryWidth - 95,
        align: 'right',
      });
  }

  const finalTotalTtc = order.totalAmount + (timbreFiscal > 0 ? timbreFiscal : 0);

  // TOTAL TTC (Bold Shaded Box)
  summaryY += 18;
  const totalBoxHeight = 22;
  doc
    .rect(summaryX + 20, summaryY - 3, summaryWidth - 20, totalBoxHeight)
    .fill('#94a3b8');

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text('TOTAL TTC', summaryX + 25, summaryY + 2, {
      width: 75,
      align: 'left',
    });

  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(formatDt(finalTotalTtc), summaryX + 100, summaryY + 1, {
      width: summaryWidth - 105,
      align: 'right',
    });

  // ── MONTANT EN LETTRES (LEFT) ──
  const lettersY = currentY + 30;
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#475569')
    .text('Montant en lettres', leftMargin, lettersY);

  const amountInWords = amountToTunisianWords(finalTotalTtc);
  doc
    .fontSize(9.5)
    .font('Helvetica')
    .fillColor('#1e293b')
    .text(amountInWords, leftMargin, lettersY + 16, {
      width: contentWidth - summaryWidth - 20,
      lineGap: 3,
    });

  // ── THE BLUE THING (TABA3 / CACHET & SIGNATURE) ──
  const stampBoxY = Math.max(summaryY + 40, lettersY + 60);
  const stampBoxWidth = 140;
  const stampBoxHeight = 85;
  const stampBoxX = pageWidth - rightMargin - stampBoxWidth;

  // Stamp header label
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('Cachet & Signature :', stampBoxX, stampBoxY);

  if (taba3Path) {
    try {
      doc.image(taba3Path, stampBoxX + 10, stampBoxY + 12, {
        fit: [110, 65],
      });
    } catch {
      doc
        .rect(stampBoxX, stampBoxY + 12, stampBoxWidth, stampBoxHeight - 12)
        .strokeColor('#94a3b8')
        .dash(3, { space: 3 })
        .stroke();
      doc.undash();
    }
  } else {
    doc
      .rect(stampBoxX, stampBoxY + 12, stampBoxWidth, stampBoxHeight - 12)
      .strokeColor('#cbd5e1')
      .dash(2, { space: 2 })
      .stroke();
    doc.undash();
    doc
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text('Emplacement Taba3 / Cachet', stampBoxX, stampBoxY + 38, {
        width: stampBoxWidth,
        align: 'center',
      });
  }

  // ── FOOTER / LEGAL MENTIONS ──
  const footerY = doc.page.height - 35;
  doc
    .moveTo(leftMargin, footerY - 8)
    .lineTo(pageWidth - rightMargin, footerY - 8)
    .strokeColor('#e2e8f0')
    .stroke();

  doc
    .fontSize(7.5)
    .font('Helvetica')
    .fillColor('#64748b')
    .text(
      `${companyName} — ${companyAddress} — Tél: ${companyPhone} — Email: ${companyEmail}${
        companyMf ? ' — MF: ' + companyMf : ''
      }${companyRc ? ' — RC: ' + companyRc : ''}`,
      leftMargin,
      footerY,
      { align: 'center', width: contentWidth },
    );

  return doc;
}
