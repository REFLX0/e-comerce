import { extractPdfPages } from './pdf-text-extractor';
import { ScorepLiquiMolyParser } from './scorep-liqui-moly.parser';
import { convertEuropeanDecimal } from './decimal.util';
import {
  generateScorepFixturePdf,
  PAGE_1_ROWS,
  PAGE_2_ROWS,
} from '../../../test/fixtures/generate-scorep-fixture';
import { ParsedPriceRow } from './supplier-price-parser.interface';

describe('ScorepLiquiMolyParser', () => {
  let rows: ParsedPriceRow[];
  const parser = new ScorepLiquiMolyParser();

  beforeAll(async () => {
    const buffer = await generateScorepFixturePdf();
    const pages = await extractPdfPages(buffer);
    rows = parser.parse(pages);
  });

  it('detects the SCOREP/LIQUI MOLY format from the extracted text', async () => {
    const buffer = await generateScorepFixturePdf();
    const pages = await extractPdfPages(buffer);
    const fullText = pages
      .map((p) => p.items.map((i) => i.str).join(' '))
      .join('\n');
    expect(parser.canParse(fullText)).toBe(true);
  });

  it('does not claim an unrelated PDF', () => {
    expect(
      parser.canParse('Some random invoice text with no price columns.'),
    ).toBe(false);
  });

  it('extracts rows from every page (multi-page handling)', () => {
    const pageNumbers = new Set(rows.map((r) => r.page));
    expect(pageNumbers.has(1)).toBe(true);
    expect(pageNumbers.has(2)).toBe(true);
  });

  it('skips section headings (no leading article number)', () => {
    const heading = rows.find((r) => r.articleNumber.includes('15W-40 ET'));
    expect(heading).toBeUndefined();
    // 9 product rows expected: 6 page-1 base rows + 1 duplicate + 2 page-2 rows
    expect(rows.length).toBe(PAGE_1_ROWS.length + 1 + PAGE_2_ROWS.length);
  });

  it('parses the spec-provided worked example correctly, incl. European decimals', () => {
    const row = rows.find((r) => r.articleNumber === '1121');
    expect(row).toBeDefined();
    expect(row!.description).toBe('Touring High Tech Super SHPD 15W-40');
    expect(row!.content).toBe('20 l');
    expect(row!.supplierPrice).toBeCloseTo(373.7812, 4);
    expect(row!.sellingPrice).toBeCloseTo(491.504, 3);
  });

  it('leaves an empty "nouveau prix" cell as null, never 0', () => {
    const row = rows.find((r) => r.articleNumber === '1862' && r.page === 1);
    expect(row).toBeDefined();
    expect(row!.supplierPrice).toBeNull();
    expect(row!.sellingPrice).toBeCloseTo(25.9, 3);
  });

  it('leaves a row with both prices empty as fully null (no price found)', () => {
    const row = rows.find((r) => r.articleNumber === '2570');
    expect(row).toBeDefined();
    expect(row!.supplierPrice).toBeNull();
    expect(row!.sellingPrice).toBeNull();
  });

  it('returns every occurrence of a duplicated article number, does not silently pick one', () => {
    const dupes = rows.filter((r) => r.articleNumber === '21591');
    expect(dupes.length).toBe(2);
    expect(dupes.map((d) => d.sellingPrice).sort()).toEqual([18.9, 19.9]);
  });

  it('throws a descriptive error when no table header can be found', () => {
    expect(() =>
      parser.parse([
        {
          pageNumber: 1,
          items: [
            { str: 'Nothing to see here', x: 0, y: 0, width: 10, height: 10 },
          ],
        },
      ]),
    ).toThrow(/header/i);
  });
});

describe('convertEuropeanDecimal', () => {
  it('converts a plain comma-decimal price', () => {
    expect(convertEuropeanDecimal('373,7812')).toBeCloseTo(373.7812, 4);
  });

  it('converts a thousands-dot + comma-decimal price', () => {
    expect(convertEuropeanDecimal('1.234,56')).toBeCloseTo(1234.56, 2);
  });

  it('accepts an already dot-decimal or integer value', () => {
    expect(convertEuropeanDecimal('45.5')).toBeCloseTo(45.5, 1);
    expect(convertEuropeanDecimal('45')).toBe(45);
  });

  it('returns null for an empty or missing cell', () => {
    expect(convertEuropeanDecimal('')).toBeNull();
    expect(convertEuropeanDecimal('   ')).toBeNull();
    expect(convertEuropeanDecimal(null)).toBeNull();
    expect(convertEuropeanDecimal(undefined)).toBeNull();
  });

  it('returns null for unparsable text', () => {
    expect(convertEuropeanDecimal('n/a')).toBeNull();
  });
});
