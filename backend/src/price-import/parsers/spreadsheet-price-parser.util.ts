import { Readable } from 'stream';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';
import { ParsedPriceRow } from './supplier-price-parser.interface';
import { ColumnKey, COLUMN_HEADER_PATTERNS } from './column-header-patterns';
import { convertEuropeanDecimal } from './decimal.util';

/**
 * CSV/XLSX escape hatch for the price-list import: a PDF's text layout can
 * vary in ways that break position-based column detection (wrapped header
 * cells, scanned images with no text layer at all), but a spreadsheet's
 * columns are unambiguous by name — no layout guessing required. Same
 * column names as the PDF format (Article number / Description / Content /
 * nouveau prix / VENTE PUB TTC), matched case-insensitively via the same
 * patterns, so the same file can be prepared either way.
 */

type Cell = string | number | boolean | null | undefined;

function isXlsxFilename(filename: string): boolean {
  return /\.xlsx?$/i.test(filename);
}

export function isSpreadsheetFile(filename: string, mimetype: string): boolean {
  return (
    isXlsxFilename(filename) ||
    /\.csv$/i.test(filename) ||
    mimetype === 'text/csv' ||
    mimetype === 'application/vnd.ms-excel' ||
    mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

function cellToString(cell: Cell): string {
  return cell == null ? '' : String(cell);
}

function matchColumn(header: Cell): ColumnKey | null {
  const text = cellToString(header);
  for (const key of Object.keys(COLUMN_HEADER_PATTERNS) as ColumnKey[]) {
    if (COLUMN_HEADER_PATTERNS[key].test(text)) return key;
  }
  return null;
}

function priceFromCell(cell: Cell): number | null {
  if (cell == null) return null;
  if (typeof cell === 'number') return Number.isFinite(cell) ? cell : null;
  return convertEuropeanDecimal(cellToString(cell));
}

function rowsFromTable(table: Cell[][]): ParsedPriceRow[] {
  if (table.length === 0) return [];

  const headerRowIdx = table.findIndex((row) =>
    row.some((cell) => matchColumn(cell) != null),
  );
  if (headerRowIdx === -1) {
    throw new Error(
      'No recognizable header row found (expected columns: Article number, Description, Content, nouveau prix, VENTE PUB TTC).',
    );
  }

  const columnOf: (ColumnKey | null)[] = table[headerRowIdx].map(matchColumn);

  const rows: ParsedPriceRow[] = [];
  for (let r = headerRowIdx + 1; r < table.length; r++) {
    const raw = table[r];
    if (!raw || raw.every((c) => c == null || cellToString(c).trim() === '')) {
      continue; // blank spacer row
    }

    const cells: Record<ColumnKey, Cell> = {
      article: '',
      description: '',
      content: '',
      supplierPrice: '',
      sellingPrice: '',
    };
    columnOf.forEach((key, colIdx) => {
      if (key) cells[key] = raw[colIdx];
    });

    const articleNumber = cellToString(cells.article).trim();
    if (!/^\d{2,8}[A-Za-z]?$/.test(articleNumber)) continue; // section heading / stray row

    rows.push({
      articleNumber,
      description: cellToString(cells.description).trim(),
      content: cellToString(cells.content).trim() || null,
      supplierPrice: priceFromCell(cells.supplierPrice),
      sellingPrice: priceFromCell(cells.sellingPrice),
      page: 1,
      rawLine: raw.map(cellToString).join(' | '),
    });
  }

  return rows;
}

async function readCsvAsTable(buffer: Buffer): Promise<Cell[][]> {
  const rows: Record<string, string>[] = [];
  const separator = buffer.toString('utf8', 0, 500).includes(';') ? ';' : ',';

  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(csvParser({ headers: false, separator }))
      .on('data', (data: Record<string, string>) => rows.push(data))
      .on('end', () => resolve())
      .on('error', reject);
  });

  // headers:false makes csv-parser key each row by its column index ("0",
  // "1", ...) instead of a header name -- we locate the real header row
  // ourselves in rowsFromTable, so sort those numeric keys back into order.
  return rows.map((obj) =>
    Object.keys(obj)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => obj[k]),
  );
}

function readXlsxAsTable(buffer: Buffer): Cell[][] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Cell[]>(sheet, {
    header: 1,
    defval: '',
    raw: true,
  });
}

export async function parseSpreadsheet(
  buffer: Buffer,
  filename: string,
): Promise<ParsedPriceRow[]> {
  const table = isXlsxFilename(filename)
    ? readXlsxAsTable(buffer)
    : await readCsvAsTable(buffer);
  return rowsFromTable(table);
}
