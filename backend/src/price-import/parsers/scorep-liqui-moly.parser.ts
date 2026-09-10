import {
  ParsedPriceRow,
  SupplierPriceParser,
} from './supplier-price-parser.interface';
import { PdfPage, PdfTextItem, groupIntoLines } from './pdf-text-extractor';
import { convertEuropeanDecimal } from './decimal.util';

type ColumnKey =
  'article' | 'description' | 'content' | 'supplierPrice' | 'sellingPrice';

// Not anchored to string-start: these are matched against the whole merged
// header line, so a pattern must be findable wherever its column happens to
// sit (order between suppliers can vary — only "prix"/"ttc" naming is fixed
// by the spec).
const COLUMN_HEADER_PATTERNS: Record<ColumnKey, RegExp> = {
  article: /article|référence|réf\.?\s*(n°|num)|ref\.?\s*(n°|num)/i,
  description: /désignation|description|libell/i,
  content: /content|contenance|conditionnement/i,
  supplierPrice: /nouveau\s*prix/i,
  sellingPrice: /vente\s*pub|prix\s*public|ttc/i,
};

interface ColumnBounds {
  key: ColumnKey;
  start: number;
  left: number;
  right: number;
}

/**
 * Parser for the SCOREP / LIQUI MOLY price list format:
 *   Article number | Description | Content | nouveau prix | VENTE PUB TTC
 *
 * Columns are located dynamically from each page's own header row (by
 * x-position of the header labels) rather than hardcoded coordinates, so a
 * minor layout shift between price-list revisions doesn't break parsing.
 * Section headings (e.g. "15W-40 ET 20W-50") have no leading article number
 * and are skipped rather than imported as products.
 */
export class ScorepLiquiMolyParser implements SupplierPriceParser {
  readonly supplierKey = 'SCOREP_LIQUI_MOLY';
  readonly supplierLabel = 'SCOREP / LIQUI MOLY';

  canParse(fullText: string): boolean {
    const t = fullText.toLowerCase();
    return (
      (t.includes('liqui moly') || t.includes('scorep')) &&
      /nouveau\s*prix/i.test(fullText) &&
      /vente\s*pub/i.test(fullText)
    );
  }

  parse(pages: PdfPage[]): ParsedPriceRow[] {
    const rows: ParsedPriceRow[] = [];
    let currentBounds: ColumnBounds[] | null = null;

    for (const page of pages) {
      const lines = groupIntoLines(page.items);
      let bodyLines = lines;

      const headerIdx = lines.findIndex((line) => this.isHeaderLine(line));
      if (headerIdx !== -1) {
        currentBounds = this.detectColumnBounds(lines[headerIdx]);
        bodyLines = lines.slice(headerIdx + 1);
      }

      if (!currentBounds) continue; // haven't seen a header yet on any page — skip until we do

      for (const line of bodyLines) {
        const row = this.parseLine(line, currentBounds, page.pageNumber);
        if (row) rows.push(row);
      }
    }

    if (!currentBounds && pages.length > 0) {
      throw new Error(
        'Unable to locate the price table header (Article / Description / Content / nouveau prix / VENTE PUB TTC) in this PDF.',
      );
    }

    return rows;
  }

  private isHeaderLine(line: PdfTextItem[]): boolean {
    const text = line.map((i) => i.str).join(' ');
    return (
      COLUMN_HEADER_PATTERNS.supplierPrice.test(text) &&
      COLUMN_HEADER_PATTERNS.sellingPrice.test(text)
    );
  }

  private detectColumnBounds(headerLine: PdfTextItem[]): ColumnBounds[] {
    const starts: { key: ColumnKey; start: number }[] = [];

    // "nouveau prix" / "VENTE PUB TTC" span multiple text fragments — match
    // against the joined line text first to get each keyword's character
    // offset, then map that back to the fragment whose x-position it starts at.
    const merged = this.mergeWithOffsets(headerLine);

    for (const key of Object.keys(COLUMN_HEADER_PATTERNS) as ColumnKey[]) {
      const match = COLUMN_HEADER_PATTERNS[key].exec(merged.text);
      if (!match) continue;
      const offset = match.index;
      const fragment =
        merged.offsets.find((o) => offset >= o.start && offset < o.end) ??
        merged.offsets[0];
      starts.push({ key, start: fragment.x });
    }

    starts.sort((a, b) => a.start - b.start);

    const bounds: ColumnBounds[] = starts.map((s, idx) => {
      const prevMid =
        idx === 0 ? -Infinity : (starts[idx - 1].start + s.start) / 2;
      const nextMid =
        idx === starts.length - 1
          ? Infinity
          : (s.start + starts[idx + 1].start) / 2;
      return { key: s.key, start: s.start, left: prevMid, right: nextMid };
    });

    return bounds;
  }

  private mergeWithOffsets(line: PdfTextItem[]) {
    let text = '';
    const offsets: { start: number; end: number; x: number }[] = [];
    for (const item of line) {
      const start = text.length;
      text += (text.length > 0 ? ' ' : '') + item.str;
      offsets.push({ start, end: text.length, x: item.x });
    }
    return { text, offsets };
  }

  private parseLine(
    line: PdfTextItem[],
    bounds: ColumnBounds[],
    pageNumber: number,
  ): ParsedPriceRow | null {
    if (line.length === 0) return null;

    const cells: Record<ColumnKey, string> = {
      article: '',
      description: '',
      content: '',
      supplierPrice: '',
      sellingPrice: '',
    };

    for (const item of line) {
      const col = bounds.find((b) => item.x >= b.left && item.x < b.right);
      if (!col) continue;
      cells[col.key] = (cells[col.key] ? cells[col.key] + ' ' : '') + item.str;
    }

    const articleNumber = cells.article.trim();
    // Section headings and stray lines have no leading article number — skip, don't import.
    if (!/^\d{2,8}[A-Za-z]?$/.test(articleNumber)) return null;

    const rawLine = line.map((i) => i.str).join(' ');

    return {
      articleNumber,
      description: cells.description.trim(),
      content: cells.content.trim() || null,
      supplierPrice: convertEuropeanDecimal(cells.supplierPrice),
      sellingPrice: convertEuropeanDecimal(cells.sellingPrice),
      page: pageNumber,
      rawLine,
    };
  }
}
