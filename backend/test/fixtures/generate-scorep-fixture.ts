import PDFDocument from 'pdfkit';

/**
 * Builds a synthetic SCOREP / LIQUI MOLY price-list PDF in memory, matching
 * the real format described in the feature spec:
 *   Article number | Description | Content | nouveau prix | VENTE PUB TTC
 *
 * No real supplier PDF was available, so this fixture is generated with the
 * one PDF library already in this codebase (pdfkit, used for invoices) and
 * exercised through the exact same extraction path as a real upload
 * (pdf-parse -> parser), rather than hand-crafting parser input.
 *
 * Deliberately includes every edge case called out in the spec: a
 * multi-word section heading with no article number, an unmatched article
 * (not in the DB), empty price cells, a duplicate article number, and a
 * suspicious/huge price jump — plus a second page to prove multi-page
 * extraction works.
 */

const COLS = {
  article: 50,
  description: 105,
  content: 300,
  supplierPrice: 385,
  sellingPrice: 465,
};

export interface FixtureRow {
  article: string;
  description: string;
  content: string;
  supplierPrice: string; // European-decimal text, or '' for empty cell
  sellingPrice: string;
}

function drawHeader(doc: typeof PDFDocument, y: number) {
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text('Article number', COLS.article, y, { lineBreak: false });
  doc.text('Description', COLS.description, y, { lineBreak: false });
  doc.text('Content', COLS.content, y, { lineBreak: false });
  doc.text('nouveau prix', COLS.supplierPrice, y, { lineBreak: false });
  doc.text('VENTE PUB TTC', COLS.sellingPrice, y, { lineBreak: false });
  doc.font('Helvetica').fontSize(9);
}

function drawRow(doc: typeof PDFDocument, y: number, row: FixtureRow) {
  doc.text(row.article, COLS.article, y, { lineBreak: false });
  doc.text(row.description, COLS.description, y, {
    lineBreak: false,
    width: 190,
  });
  doc.text(row.content, COLS.content, y, { lineBreak: false });
  doc.text(row.supplierPrice, COLS.supplierPrice, y, { lineBreak: false });
  doc.text(row.sellingPrice, COLS.sellingPrice, y, { lineBreak: false });
}

function drawSectionHeading(doc: typeof PDFDocument, y: number, text: string) {
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(text, COLS.article, y, { lineBreak: false });
  doc.font('Helvetica').fontSize(9);
}

/** Page-1 rows: exercises the happy path plus every documented edge case. */
export const PAGE_1_ROWS: FixtureRow[] = [
  // Matches the spec's own worked example verbatim. Not present in the DB
  // seed data used by the service tests, so it exercises NOT_FOUND.
  {
    article: '1121',
    description: 'Touring High Tech Super SHPD 15W-40',
    content: '20 l',
    supplierPrice: '373,7812',
    sellingPrice: '491,504',
  },
  // Exists in the seed DB (sku "1597", current price 45) -> MATCHED, modest increase.
  {
    article: '1597',
    description: 'Nettoyant jantes spécial',
    content: '1 l',
    supplierPrice: '32,50',
    sellingPrice: '47,500',
  },
  // Exists in the seed DB (sku "1554", current price 40) -> MATCHED, but the
  // new selling price is a 100x jump: exercises the decimal-shift/suspicious flag.
  {
    article: '1554',
    description: 'Entretien du cuir',
    content: '250 ml',
    supplierPrice: '28,90',
    sellingPrice: '4000,00',
  },
  // Empty "nouveau prix" cell: must never be coerced to 0, and the row must
  // still be processed since VENTE PUB TTC is present. Not in the seed DB -> NOT_FOUND.
  {
    article: '1862',
    description: 'Nettoyant frein',
    content: '500 ml',
    supplierPrice: '',
    sellingPrice: '25,900',
  },
  // Both prices empty -> INVALID_PRICE, must never overwrite anything.
  {
    article: '2570',
    description: 'Additif carburant',
    content: '300 ml',
    supplierPrice: '',
    sellingPrice: '',
  },
  // Duplicate article number (appears twice below with different prices) -> DUPLICATE.
  {
    article: '21591',
    description: 'Graisse universelle',
    content: '1 kg',
    supplierPrice: '12,00',
    sellingPrice: '18,900',
  },
];

export const DUPLICATE_ROW: FixtureRow = {
  article: '21591',
  description: 'Graisse universelle (variante)',
  content: '1 kg',
  supplierPrice: '12,50',
  sellingPrice: '19,900',
};

export const PAGE_2_ROWS: FixtureRow[] = [
  {
    article: '1862',
    description: 'Nettoyant frein (page 2 dup check)',
    content: '500 ml',
    supplierPrice: '9,50',
    sellingPrice: '25,900',
  },
  {
    article: '2571',
    description: 'Liquide de refroidissement',
    content: '5 l',
    supplierPrice: '15,4321',
    sellingPrice: '22,900',
  },
];

export async function generateScorepFixturePdf(): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) =>
    doc.on('end', () => resolve(Buffer.concat(chunks))),
  );

  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('SCOREP — Tarif LIQUI MOLY', 40, 40);
  doc.fontSize(9);

  let y = 80;
  drawHeader(doc, y);
  y += 20;
  drawSectionHeading(doc, y, '15W-40 ET 20W-50');
  y += 18;
  for (const row of PAGE_1_ROWS) {
    drawRow(doc, y, row);
    y += 16;
    if (row.article === '21591') {
      drawRow(doc, y, DUPLICATE_ROW);
      y += 16;
    }
  }

  doc.addPage();
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('SCOREP — Tarif LIQUI MOLY (suite)', 40, 40);
  doc.fontSize(9);
  y = 80;
  drawHeader(doc, y);
  y += 20;
  drawSectionHeading(doc, y, 'ENTRETIEN & ADDITIFS');
  y += 18;
  for (const row of PAGE_2_ROWS) {
    drawRow(doc, y, row);
    y += 16;
  }

  doc.end();
  return done;
}

/** A structurally-similar PDF with no price-list table — used to test format rejection. */
export async function generateUnrelatedPdf(): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) =>
    doc.on('end', () => resolve(Buffer.concat(chunks))),
  );

  doc.font('Helvetica-Bold').fontSize(14).text('Terms & Conditions', 40, 40);
  doc.font('Helvetica').fontSize(10);
  let y = 80;
  for (let i = 0; i < 10; i++) {
    doc.text(
      `Clause ${i + 1}: this document has nothing to do with any price list.`,
      40,
      y,
      { lineBreak: false },
    );
    y += 16;
  }

  doc.end();
  return done;
}
