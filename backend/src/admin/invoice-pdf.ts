import PDFDocument from 'pdfkit';

interface InvoiceOrder {
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
    variant?: { volume: string } | null;
  }>;
  user?: { name?: string | null; email?: string } | null;
}

export function generateDeliveryNotePDF(order: InvoiceOrder) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const pageWidth = 595.28;
  const leftMargin = 40;
  const rightMargin = 40;

  // Colors
  const primaryColor = '#1a1a2e';
  const accentColor = '#e94560';
  const grayColor = '#666666';
  const lightGray = '#f5f5f5';

  // Helper
  function addHeaderFooter() {
    // Footer
    const bottomY = doc.page.height - 40;
    doc
      .fontSize(8)
      .fillColor(grayColor)
      .text('specpart.tn — Tunis', leftMargin, bottomY, {
        align: 'center',
        width: pageWidth - 80,
      });
  }

  // ── HEADER ──
  doc
    .fontSize(24)
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .text('SPECPART', leftMargin, 40);
  doc
    .fontSize(10)
    .fillColor(grayColor)
    .font('Helvetica')
    .text('Pièces automobiles & lubrifiants', leftMargin, 68);
  doc.text('Tél: +216 29 294 195', leftMargin, 84);
  doc.text('Email: specpart@hotmail.com', leftMargin, 99);

  // Title
  doc
    .fontSize(18)
    .fillColor(accentColor)
    .font('Helvetica-Bold')
    .text('BON DE LIVRAISON', leftMargin, 130);
  doc
    .moveTo(leftMargin, 155)
    .lineTo(pageWidth - rightMargin, 155)
    .strokeColor('#e0e0e0')
    .stroke();

  // ── ORDER INFO ──
  const orderY = 170;
  doc
    .fontSize(10)
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .text(`N° commande:`, leftMargin, orderY);
  doc
    .font('Helvetica')
    .fillColor(grayColor)
    .text(`#${order.id.slice(-8).toUpperCase()}`, leftMargin + 90, orderY);

  doc
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(`Date:`, leftMargin, orderY + 18);
  doc
    .font('Helvetica')
    .fillColor(grayColor)
    .text(
      new Date(order.createdAt).toLocaleDateString('fr-TN'),
      leftMargin + 90,
      orderY + 18,
    );

  doc
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text(`Statut:`, leftMargin, orderY + 36);
  doc
    .font('Helvetica')
    .fillColor(grayColor)
    .text(
      order.status === 'DELIVERED'
        ? 'Livrée'
        : order.status === 'SHIPPED'
          ? 'Expédiée'
          : order.status === 'CONFIRMED'
            ? 'Confirmée'
            : order.status === 'CANCELLED'
              ? 'Annulée'
              : order.status === 'RETURNED'
                ? 'Retournée'
                : 'En attente',
      leftMargin + 90,
      orderY + 36,
    );

  // ── CLIENT INFO ──
  const clientX = pageWidth / 2;
  doc
    .fontSize(10)
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .text('Client:', clientX, orderY);
  doc
    .font('Helvetica')
    .fillColor(grayColor)
    .text(order.shipFullName || order.user?.name || '-', clientX + 50, orderY);
  doc.text(`Tél: ${order.shipPhone || '-'}`, clientX + 50, orderY + 18);
  doc.text(
    `${order.shipCity || '-'}, ${order.shipWilaya || '-'}`,
    clientX + 50,
    orderY + 36,
  );

  // ── SEPARATOR ──
  const tableY = 240;
  doc
    .moveTo(leftMargin, tableY - 5)
    .lineTo(pageWidth - rightMargin, tableY - 5)
    .strokeColor('#e0e0e0')
    .stroke();

  // ── TABLE HEADER ──
  doc.rect(leftMargin, tableY, pageWidth - 80, 20).fill(lightGray);
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9);
  doc.text('Produit', leftMargin + 8, tableY + 5, { width: 220 });
  doc.text('Volume', leftMargin + 230, tableY + 5, { width: 60 });
  doc.text('Qté', leftMargin + 290, tableY + 5, { width: 40 });
  doc.text('Prix unit.', leftMargin + 330, tableY + 5, { width: 60 });
  doc.text('Total', leftMargin + 410, tableY + 5, { width: 80 });

  // ── TABLE ROWS ──
  let currentY = tableY + 25;
  doc.font('Helvetica').fontSize(9).fillColor(primaryColor);

  order.items.forEach((item, idx) => {
    if (currentY > doc.page.height - 80) {
      doc.addPage();
      addHeaderFooter();
      currentY = 40;
    }

    const bgColor = idx % 2 === 0 ? '#ffffff' : '#fafafa';
    doc.rect(leftMargin, currentY - 4, pageWidth - 80, 18).fill(bgColor);

    doc.fillColor(primaryColor);
    doc.text(item.product.nameFr, leftMargin + 8, currentY, { width: 220 });
    doc.text(item.variant?.volume || '-', leftMargin + 230, currentY, {
      width: 60,
    });
    doc.text(String(item.quantity), leftMargin + 290, currentY, { width: 40 });
    doc.text(`${item.unitPrice.toFixed(2)} TND`, leftMargin + 330, currentY, {
      width: 60,
    });
    doc.text(
      `${(item.unitPrice * item.quantity).toFixed(2)} TND`,
      leftMargin + 410,
      currentY,
      { width: 80 },
    );

    currentY += 22;
  });

  // ── TOTAL ──
  currentY += 10;
  doc
    .moveTo(leftMargin + 250, currentY)
    .lineTo(pageWidth - rightMargin, currentY)
    .strokeColor('#e0e0e0')
    .stroke();
  currentY += 12;

  const itemsSubtotal = order.items.reduce(
    (sum: number, item: any) => sum + item.unitPrice * item.quantity,
    0,
  );

  doc.font('Helvetica').fontSize(9).fillColor(grayColor);
  doc.text('Sous-total articles:', leftMargin + 280, currentY);
  doc.text(`${itemsSubtotal.toFixed(2)} TND`, leftMargin + 410, currentY);

  currentY += 16;
  doc.font('Helvetica').fontSize(9).fillColor(grayColor);
  doc.text('Frais de livraison:', leftMargin + 280, currentY);
  if (order.shippingCost > 0) {
    doc.text(`${order.shippingCost.toFixed(2)} TND`, leftMargin + 410, currentY);
  } else {
    doc.fillColor('#16a34a').font('Helvetica-Bold').text('Gratuit (0.00 TND)', leftMargin + 410, currentY);
  }

  currentY += 18;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(primaryColor);
  doc.text('Total TTC:', leftMargin + 280, currentY);
  doc
    .fillColor(accentColor)
    .text(`${order.totalAmount.toFixed(2)} TND`, leftMargin + 410, currentY);

  if (order.notes) {
    currentY += 30;
    doc.fontSize(9).fillColor(grayColor).font('Helvetica-Oblique');
    doc.text(`Note: ${order.notes}`, leftMargin, currentY, {
      width: pageWidth - 80,
    });
  }

  addHeaderFooter();
  // NOTE: Do NOT call doc.end() here — the caller (controller) is responsible for
  // piping the stream and ending it. Calling end() here AND in the controller
  // causes a double-end which corrupts the PDF output.
  return doc;
}
