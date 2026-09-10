import { PdfPage } from './pdf-text-extractor';

/**
 * Contract every supplier-specific price-list parser must implement.
 * A new supplier format is added by writing one new parser class and
 * registering it in parser-registry.ts — nothing else in the import
 * pipeline (service, controller, DB) needs to change.
 */
export interface ParsedPriceRow {
  articleNumber: string;
  description: string;
  content: string | null;
  /** "nouveau prix" — supplier/purchase price, in the PDF's own decimal notation already converted to a number. Null if the cell was empty. */
  supplierPrice: number | null;
  /** "VENTE PUB TTC" — public selling price TTC. Null if the cell was empty. */
  sellingPrice: number | null;
  /** 1-based PDF page this row was extracted from, for diagnostics. */
  page: number;
  /** Raw source line, kept for debugging/audit of ambiguous parses. */
  rawLine: string;
}

export interface SupplierPriceParser {
  /** Unique key identifying this supplier/format, e.g. "SCOREP_LIQUI_MOLY". */
  readonly supplierKey: string;
  /** Human-readable supplier name shown in the UI/history. */
  readonly supplierLabel: string;
  /** Quick check on extracted text to decide whether this parser can handle the document. */
  canParse(fullText: string): boolean;
  /** Parse the positioned text of every page into rows. */
  parse(pages: PdfPage[]): ParsedPriceRow[];
}
