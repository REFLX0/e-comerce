import * as XLSX from 'xlsx';
import {
  isSpreadsheetFile,
  parseSpreadsheet,
} from './spreadsheet-price-parser.util';

const HEADER = [
  'Article number',
  'Description',
  'Content',
  'nouveau prix',
  'VENTE PUB TTC',
];

// A cell containing the delimiter itself (a European "373,7812" decimal in a
// comma-delimited file) must be quoted, exactly as Excel/LibreOffice would
// when actually saving such a value -- an unquoted comma inside a comma-CSV
// cell is not valid CSV in the first place, real or synthetic.
function csvField(v: string): string {
  return v.includes(',') ? `"${v}"` : v;
}

function buildCsv(rows: string[][]): Buffer {
  const lines = [HEADER, ...rows].map((r) => r.map(csvField).join(','));
  return Buffer.from(lines.join('\n'), 'utf8');
}

function buildXlsx(rows: (string | number)[][]): Buffer {
  const sheet = XLSX.utils.aoa_to_sheet([HEADER, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Prices');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

describe('isSpreadsheetFile', () => {
  it('recognizes csv/xlsx by extension', () => {
    expect(isSpreadsheetFile('tarif.csv', 'application/octet-stream')).toBe(
      true,
    );
    expect(isSpreadsheetFile('tarif.xlsx', 'application/octet-stream')).toBe(
      true,
    );
  });

  it('recognizes csv/xlsx by mimetype even without a matching extension', () => {
    expect(isSpreadsheetFile('upload', 'text/csv')).toBe(true);
    expect(
      isSpreadsheetFile(
        'upload',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ),
    ).toBe(true);
  });

  it('does not claim a PDF', () => {
    expect(isSpreadsheetFile('tarif.pdf', 'application/pdf')).toBe(false);
  });
});

describe('parseSpreadsheet (CSV)', () => {
  it('parses the exact worked example row', async () => {
    const buffer = buildCsv([
      [
        '1121',
        'Touring High Tech Super SHPD 15W-40',
        '20 l',
        '373,7812',
        '491,504',
      ],
    ]);
    const rows = await parseSpreadsheet(buffer, 'tarif.csv');
    expect(rows.length).toBe(1);
    expect(rows[0]).toMatchObject({
      articleNumber: '1121',
      description: 'Touring High Tech Super SHPD 15W-40',
      content: '20 l',
      supplierPrice: 373.7812,
      sellingPrice: 491.504,
    });
  });

  it('skips section headings and blank rows, keeps every valid row', async () => {
    const buffer = buildCsv([
      ['15W-40 ET 20W-50', '', '', '', ''],
      ['1597', 'Nettoyant jantes spécial', '1 l', '32,50', '47,500'],
      ['', '', '', '', ''],
      ['1554', 'Entretien du cuir', '250 ml', '28,90', '4000,00'],
    ]);
    const rows = await parseSpreadsheet(buffer, 'tarif.csv');
    expect(rows.map((r) => r.articleNumber)).toEqual(['1597', '1554']);
  });

  it('leaves an empty price cell as null, not 0', async () => {
    const buffer = buildCsv([
      ['1862', 'Nettoyant frein', '500 ml', '', '25,900'],
    ]);
    const rows = await parseSpreadsheet(buffer, 'tarif.csv');
    expect(rows[0].supplierPrice).toBeNull();
    expect(rows[0].sellingPrice).toBeCloseTo(25.9, 3);
  });

  it('works with a semicolon-delimited export', async () => {
    const lines = [HEADER.join(';'), '1121;Touring;20 l;373,7812;491,504'];
    const buffer = Buffer.from(lines.join('\n'), 'utf8');
    const rows = await parseSpreadsheet(buffer, 'tarif.csv');
    expect(rows.length).toBe(1);
    expect(rows[0].articleNumber).toBe('1121');
  });

  it('throws a descriptive error when no header row is found', async () => {
    const buffer = Buffer.from('a,b,c\n1,2,3', 'utf8');
    await expect(parseSpreadsheet(buffer, 'tarif.csv')).rejects.toThrow(
      /header/i,
    );
  });
});

describe('parseSpreadsheet (XLSX)', () => {
  it('parses numeric price cells directly, no comma conversion needed', async () => {
    const buffer = buildXlsx([
      [
        '1121',
        'Touring High Tech Super SHPD 15W-40',
        '20 l',
        373.7812,
        491.504,
      ],
    ]);
    const rows = await parseSpreadsheet(buffer, 'tarif.xlsx');
    expect(rows.length).toBe(1);
    expect(rows[0].supplierPrice).toBeCloseTo(373.7812, 4);
    expect(rows[0].sellingPrice).toBeCloseTo(491.504, 3);
  });

  it('also accepts text-formatted European-decimal cells', async () => {
    const buffer = buildXlsx([
      ['1597', 'Nettoyant jantes', '1 l', '32,50', '47,500'],
    ]);
    const rows = await parseSpreadsheet(buffer, 'tarif.xlsx');
    expect(rows[0].supplierPrice).toBeCloseTo(32.5, 2);
  });
});
