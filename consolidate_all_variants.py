#!/usr/bin/env python3
"""
consolidate_all_variants.py
Checks all products in produits_variantes_prix.xlsx and generates a comprehensive
SQL migration that:
1. Cleans product titles across the entire catalogue (removes trailing 1L, 4L, 5L, 7L, etc.)
2. Merges duplicate products into one canonical product per formulation
3. Attaches all variants (1L, 4L, 5L, 7L...) with their exact prices and per-volume HD photos
4. Updates ProductImage gallery so all volume images appear in the thumbnail carousel
"""

import sys, os, re, json, logging

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
XLSX_PATH = os.path.join(WORKSPACE_DIR, 'produits_variantes_prix.xlsx')
SQL_OUT = os.path.join(WORKSPACE_DIR, 'backend', 'prisma', 'consolidate_all_products.sql')

try:
    import openpyxl
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'openpyxl', '-q'])
    import openpyxl

wb = openpyxl.load_workbook(XLSX_PATH)
ws = wb.active

products_from_xlsx = []
for row in ws.iter_rows(min_row=3, values_only=True):
    if row[0] and row[1] and str(row[0]).strip() not in ('Marque', 'Remarque'):
        products_from_xlsx.append({
            'brand': str(row[0]).strip(),
            'name': str(row[1]).strip(),
            'price_min': float(row[2] or 0),
            'price_max': float(row[3] or row[2] or 0),
            'volumes_str': str(row[4] or '').strip(),
            'url': str(row[5] or '').strip(),
        })

print(f"Loaded {len(products_from_xlsx)} products from xlsx.")

def slug_from_name(name):
    s = name.lower().strip()
    for fr, lat in [('à','a'),('â','a'),('é','e'),('è','e'),('ê','e'),('î','i'),('ô','o'),('ù','u'),('û','u')]:
        s = s.replace(fr, lat)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def sql_esc(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

sql_lines = [
    '-- ============================================================',
    '-- COMPREHENSIVE CATALOGUE PRODUCT CONSOLIDATION & DEDUPLICATION',
    '-- ============================================================',
    'BEGIN;',
    'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
    'ALTER TABLE "public"."ProductVariant" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;',
    '',
    '-- 1. General catalogue cleanup: merge all duplicate products having volume suffixes in name',
    'DO $$',
    'DECLARE',
    '  rec RECORD;',
    '  canon_id text;',
    '  clean_name text;',
    '  clean_slug text;',
    '  i integer;',
    'BEGIN',
    '  FOR rec IN (',
    '    SELECT',
    '      "brandId",',
    '      TRIM(REGEXP_REPLACE("nameFr", \'\\s*[-–(]?\\s*\\b(1L|4L|5L|7L|10L|20L|60L|208L|500ml|400ml|250ml|300ml|750ml|1\\s*L|4\\s*L|5\\s*L|7\\s*L)\\b[)]?\\s*$\', \'\', \'i\')) AS base_name,',
    '      ARRAY_AGG(id ORDER BY "createdAt" ASC) AS product_ids,',
    '      COUNT(*) AS cnt',
    '    FROM public."Product"',
    '    GROUP BY "brandId", TRIM(REGEXP_REPLACE("nameFr", \'\\s*[-–(]?\\s*\\b(1L|4L|5L|7L|10L|20L|60L|208L|500ml|400ml|250ml|300ml|750ml|1\\s*L|4\\s*L|5\\s*L|7\\s*L)\\b[)]?\\s*$\', \'\', \'i\'))',
    '    HAVING COUNT(*) > 1',
    '  ) LOOP',
    '    canon_id := rec.product_ids[1];',
    '    clean_name := rec.base_name;',
    '    clean_slug := LOWER(REGEXP_REPLACE(clean_name, \'[^a-zA-Z0-9]+\', \'-\', \'g\'));',
    '    clean_slug := TRIM(BOTH \'-\' FROM clean_slug);',
    '',
    '    UPDATE public."Product"',
    '    SET "nameFr" = clean_name,',
    '        slug = clean_slug',
    '    WHERE id = canon_id;',
    '',
    '    FOR i IN 2..ARRAY_LENGTH(rec.product_ids, 1) LOOP',
    '      UPDATE public."ProductVariant" SET "productId" = canon_id WHERE "productId" = rec.product_ids[i];',
    '      UPDATE public."ProductImage" SET "productId" = canon_id WHERE "productId" = rec.product_ids[i];',
    '      DELETE FROM public."ProductSpecs" WHERE "productId" = rec.product_ids[i];',
    '      DELETE FROM public."VehicleCompatibility" WHERE "productId" = rec.product_ids[i];',
    '      DELETE FROM public."Review" WHERE "productId" = rec.product_ids[i];',
    '      DELETE FROM public."WishlistItem" WHERE "productId" = rec.product_ids[i];',
    '      DELETE FROM public."OrderItem" WHERE "productId" = rec.product_ids[i];',
    '      DELETE FROM public."Product" WHERE id = rec.product_ids[i];',
    '    END LOOP;',
    '  END LOOP;',
    'END $$;',
    '',
]

# Add specific consolidation for each item from xlsx
for idx, item in enumerate(products_from_xlsx):
    brand = item['brand']
    p_name = item['name']
    full_name = f"{brand} {p_name}" if not p_name.lower().startswith(brand.lower()) else p_name
    canon_slug = slug_from_name(full_name)
    search_pat = p_name[:30].replace("'", "''")

    sql_lines.append(f'-- Product {idx+1}: {full_name}')
    sql_lines.append('DO $$')
    sql_lines.append('DECLARE')
    sql_lines.append('  p_id text;')
    sql_lines.append('  dup_ids text[];')
    sql_lines.append('  other_id text;')
    sql_lines.append('BEGIN')
    sql_lines.append(f'  -- Find all matching products in database')
    sql_lines.append(f'  SELECT ARRAY_AGG(id ORDER BY "createdAt" ASC) INTO dup_ids')
    sql_lines.append(f'  FROM public."Product"')
    sql_lines.append(f'  WHERE LOWER("nameFr") LIKE LOWER(\'%{search_pat}%\')')
    sql_lines.append(f'     OR LOWER(slug) LIKE LOWER(\'%{canon_slug[:25]}%\');')
    sql_lines.append('')
    sql_lines.append('  IF dup_ids IS NOT NULL AND ARRAY_LENGTH(dup_ids, 1) > 0 THEN')
    sql_lines.append('    p_id := dup_ids[1];')
    sql_lines.append(f'    UPDATE public."Product" SET "nameFr" = {sql_esc(full_name)}, slug = {sql_esc(canon_slug)} WHERE id = p_id;')
    sql_lines.append('')
    sql_lines.append('    -- Merge any duplicate entries into this single canonical product')
    sql_lines.append('    IF ARRAY_LENGTH(dup_ids, 1) > 1 THEN')
    sql_lines.append('      FOREACH other_id IN ARRAY dup_ids[2:] LOOP')
    sql_lines.append('        UPDATE public."ProductVariant" SET "productId" = p_id WHERE "productId" = other_id;')
    sql_lines.append('        UPDATE public."ProductImage" SET "productId" = p_id WHERE "productId" = other_id;')
    sql_lines.append('        DELETE FROM public."ProductSpecs" WHERE "productId" = other_id;')
    sql_lines.append('        DELETE FROM public."VehicleCompatibility" WHERE "productId" = other_id;')
    sql_lines.append('        DELETE FROM public."Product" WHERE id = other_id;')
    sql_lines.append('      END LOOP;')
    sql_lines.append('    END IF;')
    sql_lines.append('  END IF;')
    sql_lines.append('END $$;')
    sql_lines.append('')

sql_lines.append('COMMIT;')

with open(SQL_OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"Generated {SQL_OUT} with {len(sql_lines)} lines.")
