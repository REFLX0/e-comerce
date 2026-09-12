export type ColumnKey =
  'article' | 'description' | 'content' | 'supplierPrice' | 'sellingPrice';

/**
 * Shared across every supplier-format parser (PDF, CSV, XLSX) so a column
 * name is recognized the same way no matter which file type it came in on.
 * Not anchored to string-start: matched against a whole header line/cell, so
 * word order and surrounding text don't matter.
 */
export const COLUMN_HEADER_PATTERNS: Record<ColumnKey, RegExp> = {
  article: /article|référence|réf\.?\s*(n°|num)|ref\.?\s*(n°|num)/i,
  description: /désignation|description|libell/i,
  content: /content|contenance|conditionnement/i,
  supplierPrice: /nouveau\s*prix/i,
  sellingPrice: /vente\s*pub|prix\s*public|ttc/i,
};
