import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import { amountToTunisianWords } from './number-to-words';

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        return resolve(null);
      }
      const data: Buffer[] = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', () => resolve(null));
  });
}

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

async function resolveImage(imageRef?: string | null): Promise<string | Buffer | null> {
  if (!imageRef || typeof imageRef !== 'string' || imageRef.trim() === '') {
    return null;
  }

  const clean = imageRef.trim().replace(/^["']|["']$/g, '');
  if (!clean) return null;

  // 1. Direct remote HTTP/HTTPS URL
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    const buf = await fetchImageBuffer(clean);
    if (buf) return buf;
  }

  // 2. Storage / MinIO URL (e.g. /storage/specpart/... or /storage/...)
  if (clean.startsWith('/storage/')) {
    const minioEndpoints = [
      process.env.MINIO_ENDPOINT,
      'http://minio:9000',
      'http://localhost:9000',
      'http://127.0.0.1:9000',
    ].filter(Boolean) as string[];

    const subPath = clean.replace(/^\/storage\//, '');
    for (const ep of minioEndpoints) {
      try {
        const fullUrl = `${ep.replace(/\/$/, '')}/${subPath}`;
        const buf = await fetchImageBuffer(fullUrl);
        if (buf) return buf;
      } catch {}
    }
  }

  // 3. Check filesystem across known search roots
  const searchRoots = [
    __dirname,
    path.join(__dirname, '..', 'admin'),
    path.join(__dirname, '..', '..', 'src', 'admin'),
    process.cwd(),
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'uploads', 'products'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), '..', 'uploads'),
    path.join(process.cwd(), '..', 'frontend', 'public'),
    path.join(__dirname, '..', '..', 'uploads'),
    path.join(__dirname, '..', '..', 'uploads', 'products'),
    path.join(__dirname, '..', '..', 'public'),
    path.join(__dirname, '..', '..', '..', 'frontend', 'public'),
  ];

  if (fs.existsSync(clean)) return clean;

  const baseName = path.basename(clean);
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
    __dirname,
    path.join(__dirname, '..', 'admin'),
    path.join(__dirname, '..', '..', 'src', 'admin'),
    process.cwd(),
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'uploads', 'products'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), '..', 'uploads'),
    path.join(process.cwd(), '..', 'frontend', 'public'),
    path.join(__dirname, '..', '..', 'uploads'),
    path.join(__dirname, '..', '..', 'public'),
    path.join(__dirname, '..', '..', '..', 'frontend', 'public'),
  ];

  const logoFilenames = [
    'logo.jpg',
    'logo.png',
    'logo.jpeg',
    'facturelogo.jpeg',
    'facturelogo.jpg',
    'facturelogo.png',
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
    __dirname,
    path.join(__dirname, '..', 'admin'),
    path.join(__dirname, '..', '..', 'src', 'admin'),
    process.cwd(),
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), '..', 'uploads'),
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

export async function generateDeliveryNotePDF(
  order: InvoiceOrder,
  settings: InvoiceSettings = {},
  docType: 'invoice' | 'delivery_slip' = 'invoice'
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 35, bottom: 10, left: 35, right: 35 },
    autoFirstPage: true,
    bufferPages: true,
  });
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
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
  let companyAddress =
    settings.FACTURE_ADDRESS || '03, rue Mohamed Bayram 5, Sidi Daoud la Marsa, 2046';
  if (!companyAddress || companyAddress.includes('Carthage') || companyAddress.includes('Chaker')) {
    companyAddress = '03, rue Mohamed Bayram 5, Sidi Daoud la Marsa, 2046';
  }
  const companyEmail =
    settings.FACTURE_EMAIL ||
    settings.CONTACT_EMAIL ||
    'specpart@hotmail.com';
  const companyPhone =
    settings.FACTURE_PHONE || settings.CONTACT_PHONE || '29294195';
  const companyMf =
    settings.FACTURE_MATRICULE_FISCALE || '100000/A/P/000';
  const companyRc = settings.FACTURE_REGISTRE_COMMERCE || 'B0123452026';

  // Resolve Logo image
  let logoData: string | Buffer | null = await resolveImage(settings.FACTURE_LOGO);
  if (!logoData) {
    logoData = findDefaultLogo();
  }

  // Resolve Taba3 (Blue Stamp) image
  let taba3Data: string | Buffer | null = await resolveImage(settings.FACTURE_TABA3);
  if (!taba3Data) {
    taba3Data = findDefaultStamp();
  }

  // Resolve Code Image (QR code / barcode)
  let codeImgData: string | Buffer | null = await resolveImage(settings.FACTURE_CODE_IMG);

  // ── HEADER: LOGO & COMPANY INFO (LEFT) ──
  let headerLeftTextX = leftMargin;
  const startY = 35;

  if (logoData) {
    try {
      doc.image(logoData, leftMargin, startY, { fit: [110, 58] });
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
    .fontSize(8.5)
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text(companyAddress, headerLeftTextX, startY + 16, { width: 190 });

  const nextY = Math.max(startY + 30, doc.y + 2);
  doc.text(companyEmail, headerLeftTextX, nextY);
  doc.text(companyPhone, headerLeftTextX, nextY + 11);
  if (companyMf) {
    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text(`MF: ${companyMf}`, headerLeftTextX, nextY + 22);
  }

  // ── HEADER: FACTURE TITLE & DATES (RIGHT) ──
  let hash = 0;
  const idStr = order.id || '';
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) % 90000;
  }
  const orderNumber = idStr ? String(10000 + Math.abs(hash)) : String(Math.floor(10000 + Math.random() * 90000));
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStr = formatFrenchDate(orderDate);

  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .fillColor('#334155')
    .text(docType === 'delivery_slip' ? `BON DE LIVRAISON#${orderNumber}` : `FACTURE#${orderNumber}`, leftMargin, startY, {
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
  if (codeImgData) {
    try {
      doc.image(codeImgData, pageWidth - rightMargin - 50, startY + 60, {
        fit: [50, 50],
      });
    } catch {
      // Ignore
    }
  }

  // ── FACTUR├ë à (CLIENT INFO) ──
  const clientStartY = startY + 80;
  doc
    .fontSize(10.5)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(docType === 'delivery_slip' ? 'Livré à:' : 'Facturé à:', leftMargin, clientStartY);

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
  const colXValues = Object.values(colX) as number[];
  colXValues.forEach((x) => {
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
  doc.text('#', colX.num, tableY + 6, { width: colW.num, align: 'center', lineBreak: false });
  doc.text('Article(s)', colX.name + 6, tableY + 6, { width: colW.name - 12, align: 'left', lineBreak: false });
  doc.text('Quantité', colX.qty, tableY + 6, { width: colW.qty, align: 'center', lineBreak: false });
  doc.text('PU HT', colX.puHt, tableY + 6, { width: colW.puHt - 6, align: 'right', lineBreak: false });
  doc.text('TVA', colX.tva, tableY + 6, { width: colW.tva - 6, align: 'right', lineBreak: false });
  doc.text('Total', colX.total, tableY + 6, { width: colW.total - 6, align: 'right', lineBreak: false });

  let currentY = tableY + headerHeight;
  let subtotalHt = 0;
  let totalTva = 0;
  const tvaRate = parseFloat(settings.FACTURE_TVA_RATE || '19') / 100;

  order.items.forEach((item, index) => {
    // Dynamic row height based on product name length
    const itemName = item.product?.nameFr || 'Article';
    const volume = item.variant?.volume ? ` (${item.variant.volume})` : '';
    const fullName = `${itemName}${volume}`;

    doc.fontSize(8.5).font('Helvetica');
    const nameHeight = doc.heightOfString(fullName, { width: colW.name - 12 });
    const rowHeight = Math.max(22, nameHeight + 12);

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
    colXValues.forEach((x) => {
      if (x > leftMargin) {
        doc
          .moveTo(x, currentY)
          .lineTo(x, currentY + rowHeight)
          .strokeColor(tableBorderColor)
          .stroke();
      }
    });

    const midV = (rowHeight - 10) / 2;

    doc.fontSize(8.5).font('Helvetica').fillColor(primaryColor);
    doc.text(String(index + 1), colX.num, currentY + midV, { width: colW.num, align: 'center', lineBreak: false });
    doc.text(fullName, colX.name + 6, currentY + 6, { width: colW.name - 12, align: 'left' });
    doc.text(String(item.quantity), colX.qty, currentY + midV, { width: colW.qty, align: 'center', lineBreak: false });
    doc.text(formatDt(puHt), colX.puHt, currentY + midV, { width: colW.puHt - 6, align: 'right', lineBreak: false });
    doc.text(formatDt(itemTva), colX.tva, currentY + midV, { width: colW.tva - 6, align: 'right', lineBreak: false });
    doc.text(formatDt(itemTotalTtc), colX.total, currentY + midV, { width: colW.total - 6, align: 'right', lineBreak: false });

    currentY += rowHeight;
  });

  // ── TOTALS SUMMARY (RIGHT) ──
  // Estimate space needed: summaryRows * 16 + totalBox 22 + letters 40 + stamp 100 + footer 50 = ~240px
  const BOTTOM_RESERVE = 250;
  if (currentY + BOTTOM_RESERVE > doc.page.height) {
    doc.addPage();
    currentY = 40;
  }

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
    .text('TVA (19%)', summaryX, summaryY, { width: 90, align: 'right' });
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

  // Calculate if there's a discount
  const rawTotalTtc = subtotalHt + totalTva + (order.shippingCost || 0);
  const discountTtc = rawTotalTtc - order.totalAmount;
  if (discountTtc > 0.05) { // Account for small floating point errors
    summaryY += 16;
    doc
      .font('Helvetica-Bold')
      .fillColor('#e63946')
      .text('Remise Promo', summaryX, summaryY, { width: 90, align: 'right' });
    doc
      .font('Helvetica')
      .fillColor('#e63946')
      .text(`- ${formatDt(discountTtc)}`, summaryX + 95, summaryY, {
        width: summaryWidth - 95,
        align: 'right',
      });
  }

  // Timbre Fiscal
  let timbreFiscal = 0;
  if (docType === 'invoice') {
    timbreFiscal = parseFloat(settings.FACTURE_TIMBRE_FISCAL || '1.000');
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
  const stampBoxY = Math.min(Math.max(summaryY + 20, lettersY + 40), doc.page.height - 120);
  const stampBoxWidth = 130;
  const stampBoxHeight = 70;
  const stampBoxX = pageWidth - rightMargin - stampBoxWidth;

  // Stamp header label
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('Cachet & Signature :', stampBoxX, stampBoxY);

  if (taba3Data) {
    try {
      doc.image(taba3Data, stampBoxX + 10, stampBoxY + 20, {
        fit: [95, 52],
      });
    } catch {
      doc
        .rect(stampBoxX, stampBoxY + 20, stampBoxWidth, stampBoxHeight - 20)
        .strokeColor('#94a3b8')
        .dash(3, { space: 3 })
        .stroke();
      doc.undash();
    }
  } else {
    doc
      .rect(stampBoxX, stampBoxY + 20, stampBoxWidth, stampBoxHeight - 20)
      .strokeColor('#cbd5e1')
      .dash(2, { space: 2 })
      .stroke();
    doc.undash();
    doc
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text('Emplacement Taba3 / Cachet', stampBoxX, stampBoxY + 30, {
        width: stampBoxWidth,
        align: 'center',
      });
  }

  // ── FOOTER / LEGAL MENTIONS — rendered on every page via bufferedPageRange ──
  const range = doc.bufferedPageRange();
  for (let pi = range.start; pi < range.start + range.count; pi++) {
    doc.switchToPage(pi);
    const lineY1 = doc.page.height - 32;
    const lineY2 = doc.page.height - 21;
    doc
      .moveTo(leftMargin, lineY1 - 6)
      .lineTo(pageWidth - rightMargin, lineY1 - 6)
      .strokeColor('#e2e8f0')
      .stroke();

    doc
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(
        `${companyName} — ${companyAddress}`,
        leftMargin,
        lineY1,
        { align: 'center', width: contentWidth, lineBreak: false },
      );

    doc
      .text(
        `Tél: ${companyPhone} — Email: ${companyEmail}${
          companyMf ? ' — MF: ' + companyMf : ''
        }${companyRc ? ' — RC: ' + companyRc : ''}`,
        leftMargin,
        lineY2,
        { align: 'center', width: contentWidth, lineBreak: false },
      );
  }

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', reject);
    doc.end();
  });
}

// ─── POS Invoice ───────────────────────────────────────────────────────────
// Used by:  admin.service.ts → generatePOSInvoice()
//           invoices.service.ts → generatePdf()   (maps DB Invoice lines → this)
// Accepts flat line-item data (no DB order required) — ideal for walk-in counter sales.

export interface POSInvoiceItem {
  name: string;
  volume?: string;
  quantity: number;
  unitPriceHT: number;
}

export interface POSInvoiceData {
  invoiceNumber: string;
  date: Date;
  clientName: string;
  items: POSInvoiceItem[];
  settings?: InvoiceSettings;
}

export async function generatePOSInvoicePDF(data: POSInvoiceData): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 35, bottom: 10, left: 40, right: 40 },
    bufferPages: true,
  });
  doc.on('data', (chunk) => chunks.push(chunk));

  const settings = data.settings ?? {};
  const pageWidth = 595.28;
  const L = 40;
  const R = 40;
  const contentWidth = pageWidth - L - R;

  // ── Company info from settings (same source as delivery note) ──
  const companyName    = settings.SITE_NAME || 'SPECPART';
  let companyAddress = settings.FACTURE_ADDRESS || '03, rue Mohamed Bayram 5, Sidi Daoud la Marsa, 2046';
  if (!companyAddress || companyAddress.includes('Carthage') || companyAddress.includes('Chaker')) {
    companyAddress = '03, rue Mohamed Bayram 5, Sidi Daoud la Marsa, 2046';
  }
  const companyPhone   = settings.FACTURE_PHONE   || settings.CONTACT_PHONE  || '29294195';
  const companyEmail   = settings.FACTURE_EMAIL   || settings.CONTACT_EMAIL  || 'specpart@hotmail.com';
  const companyMf      = settings.FACTURE_MATRICULE_FISCALE || '100000/A/P/000';
  const companyRc      = settings.FACTURE_REGISTRE_COMMERCE || 'B0123452026';

  // ── Colors (matching delivery note palette) ──
  const PRIMARY   = '#0B1D3A';
  const ACCENT    = '#E10600';
  const GRAY      = '#64748b';
  const LIGHT_BG  = '#f1f5f9';
  const BORDER    = '#e2e8f0';
  const WHITE     = '#ffffff';

  // ── Logo ──
  let logoData: string | Buffer | null = await resolveImage(settings.FACTURE_LOGO);
  if (!logoData) {
    logoData = findDefaultLogo();
  }

  // ── Totals ──
  const TVA_RATE = parseFloat(settings.FACTURE_TVA_RATE || '19') / 100;
  const totalHT  = data.items.reduce((s, i) => s + i.unitPriceHT * i.quantity, 0);
  const tvaAmt   = totalHT * TVA_RATE;
  const totalTTC = totalHT + tvaAmt;

  // ── HEADER ──
  if (logoData) {
    try { doc.image(logoData, L, 35, { fit: [140, 60], align: 'left', valign: 'top' }); }
    catch { doc.fontSize(20).fillColor(PRIMARY).font('Helvetica-Bold').text(companyName, L, 35); }
  } else {
    doc.fontSize(20).fillColor(PRIMARY).font('Helvetica-Bold').text(companyName, L, 35);
  }

  doc.fontSize(8).fillColor(GRAY).font('Helvetica')
    .text(companyAddress, pageWidth / 2, 35, { align: 'right', width: pageWidth / 2 - R })
    .text(companyPhone,   pageWidth / 2, 49, { align: 'right', width: pageWidth / 2 - R })
    .text(companyEmail,   pageWidth / 2, 63, { align: 'right', width: pageWidth / 2 - R });

  // Red accent divider
  doc.moveTo(L, 108).lineTo(pageWidth - R, 108).lineWidth(2).strokeColor(ACCENT).stroke();
  doc.lineWidth(1);

  // ── TITLE + META BOX ──
  doc.fontSize(22).fillColor(PRIMARY).font('Helvetica-Bold').text('FACTURE', L, 118);

  const metaX = pageWidth - R - 180;
  doc.rect(metaX, 112, 182, 70).fill(LIGHT_BG);
  doc.fontSize(8).fillColor(GRAY).font('Helvetica')
    .text('N° Facture', metaX + 8, 118)
    .text('Date',       metaX + 8, 134)
    .text('Client',     metaX + 8, 150)
    .text('MF',         metaX + 8, 166);
  doc.fontSize(8).fillColor(PRIMARY).font('Helvetica-Bold')
    .text(data.invoiceNumber,                                  metaX + 65, 118, { width: 110, align: 'right' })
    .text(data.date.toLocaleDateString('fr-TN'),               metaX + 65, 134, { width: 110, align: 'right' })
    .text(data.clientName || 'Client comptoir',                metaX + 65, 150, { width: 110, align: 'right' })
    .text(companyMf,                                           metaX + 65, 166, { width: 110, align: 'right' });

  // ── TABLE HEADER ──
  const tableY = 200;
  doc.rect(L, tableY, contentWidth, 22).fill(PRIMARY);
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5);
  doc.text('DÉSIGNATION', L + 8,    tableY + 6, { width: 225 });
  doc.text('VOLUME',      L + 235,  tableY + 6, { width: 65,  align: 'center' });
  doc.text('QTÉ',         L + 300,  tableY + 6, { width: 40,  align: 'center' });
  doc.text('PRIX HT',     L + 340,  tableY + 6, { width: 70,  align: 'right' });
  doc.text('TOTAL HT',    L + 410,  tableY + 6, { width: 75,  align: 'right' });

  // ── TABLE ROWS ──
  let y = tableY + 22;
  doc.font('Helvetica').fontSize(8.5);

  data.items.forEach((item, idx) => {
    if (y > doc.page.height - 160) { doc.addPage(); y = 40; }
    const rowColor = idx % 2 === 0 ? WHITE : LIGHT_BG;
    doc.rect(L, y, contentWidth, 20).fill(rowColor);
    doc.fillColor(PRIMARY);
    doc.text(item.name,                                L + 8,   y + 5, { width: 225 });
    doc.text(item.volume || '—',                       L + 235, y + 5, { width: 65,  align: 'center' });
    doc.text(String(item.quantity),                    L + 300, y + 5, { width: 40,  align: 'center' });
    doc.text(`${item.unitPriceHT.toFixed(3)} DT`,     L + 340, y + 5, { width: 70,  align: 'right' });
    doc.text(`${(item.unitPriceHT * item.quantity).toFixed(3)} DT`, L + 410, y + 5, { width: 75, align: 'right' });
    y += 20;
  });

  doc.moveTo(L, y).lineTo(pageWidth - R, y).strokeColor(BORDER).stroke();

  // ── TOTALS ──
  const totalsX = L + contentWidth - 200;
  y += 16;

  const totLine = (label: string, value: string) => {
    doc.font('Helvetica').fontSize(8.5).fillColor(GRAY).text(label, totalsX, y, { width: 110 });
    doc.font('Helvetica').fontSize(8.5).fillColor(PRIMARY).text(value, totalsX + 112, y, { width: 90, align: 'right' });
    y += 16;
  };

  totLine('Total HT', `${totalHT.toFixed(3)} DT`);
  totLine(`TVA (${(TVA_RATE * 100).toFixed(0)}%)`, `${tvaAmt.toFixed(3)} DT`);

  // ── TOTAL TTC accent block ──
  doc.rect(totalsX - 8, y - 4, 210, 28).fill(PRIMARY);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE)
    .text('TOTAL TTC', totalsX, y + 3, { width: 110 })
    .text(`${totalTTC.toFixed(3)} DT`, totalsX + 112, y + 3, { width: 90, align: 'right' });

  // ── Amount in words ──
  y += 40;
  doc.fontSize(8.5).fillColor(GRAY).font('Helvetica').text('Arrêté la présente facture à la somme de :', L, y);
  doc.fontSize(8.5).fillColor(PRIMARY).font('Helvetica-Bold')
    .text(amountToTunisianWords(totalTTC), L, y + 13, { width: contentWidth - 210 });

  // ── FOOTER (applied to all pages via bufferedPageRange) ──
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const lineY1 = doc.page.height - 32;
    const lineY2 = doc.page.height - 21;
    doc.moveTo(L, lineY1 - 6).lineTo(pageWidth - R, lineY1 - 6).strokeColor(BORDER).stroke();
    doc
      .fontSize(7.5)
      .fillColor(GRAY)
      .font('Helvetica')
      .text(
        `${companyName} — ${companyAddress}`,
        L,
        lineY1,
        { align: 'center', width: contentWidth, lineBreak: false },
      );
    doc
      .text(
        `Tél: ${companyPhone} — Email: ${companyEmail}${
          companyMf ? ' — MF: ' + companyMf : ''
        }${companyRc ? ' — RC: ' + companyRc : ''}`,
        L,
        lineY2,
        { align: 'center', width: contentWidth, lineBreak: false },
      );
  }

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', reject);
    doc.end();
  });
}

