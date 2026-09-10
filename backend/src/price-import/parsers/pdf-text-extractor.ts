import pdfParse from 'pdf-parse';

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfPage {
  pageNumber: number;
  items: PdfTextItem[];
}

/**
 * Extracts every text fragment of every page with its x/y position.
 *
 * We deliberately keep the raw positioned fragments (instead of collapsing
 * them into one text blob) so the parser can bucket cells into columns by
 * detecting the table header's own x-positions on each page and reusing
 * them — dynamic, per-document column detection rather than coordinates
 * hardcoded in source code, so a supplier reflowing their layout slightly
 * (wider description column, etc.) doesn't break extraction.
 */
export async function extractPdfPages(buffer: Buffer): Promise<PdfPage[]> {
  const pages: PdfPage[] = [];

  await pdfParse(buffer, {
    pagerender: async (pageData: any) => {
      const textContent = await pageData.getTextContent();
      const items: PdfTextItem[] = [];
      for (const item of textContent.items) {
        if (!item.str || item.str.trim().length === 0) continue;
        items.push({
          str: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width || item.str.length * (item.height || 10) * 0.5,
          height: item.height || 10,
        });
      }
      pages.push({ pageNumber: pages.length + 1, items });
      return items.map((i) => i.str).join(' ');
    },
  });

  return pages;
}

/** Groups a page's positioned fragments into visual lines by y-coordinate clustering. */
export function groupIntoLines(items: PdfTextItem[]): PdfTextItem[][] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: PdfTextItem[][] = [];
  for (const item of sorted) {
    const line = lines.find(
      (l) => Math.abs(l[0].y - item.y) <= (item.height || 10) * 0.5,
    );
    if (line) line.push(item);
    else lines.push([item]);
  }
  for (const line of lines) line.sort((a, b) => a.x - b.x);
  return lines;
}
