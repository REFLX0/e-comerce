#!/usr/bin/env python3
"""
import_variants_and_images.py
Reads produits_variantes_prix.xlsx, scrapes per-volume prices + image URLs from
touringstudiocar.shop, matches products in our DB, upserts ProductVariants + images,
and downloads images to uploads/products/.
Run on VM: python3 import_variants_and_images.py
"""

import sys, os, re, json, time, ssl, logging
import urllib.request

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
log = logging.getLogger()

XLSX_PATH = os.path.join(os.path.dirname(__file__), 'produits_variantes_prix.xlsx')
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), 'uploads', 'products')
SQL_OUT = os.path.join(os.path.dirname(__file__), 'backend', 'prisma', 'upsert-variants.sql')

os.makedirs(UPLOADS_DIR, exist_ok=True)

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
}

def fetch(url, timeout=12):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as r:
            return r.read().decode('utf-8', errors='replace')
    except Exception as e:
        log.warning(f'  fetch error {url}: {e}')
        return ''

def scrape_product_page(url):
    html = fetch(url)
    if not html:
        return None
    result = {'variants': [], 'image_url': None}
    img_patterns = [
        r'<img[^>]+class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"',
        r'"(https?://[^"]+/wp-content/uploads/[^"]+\.(?:jpg|jpeg|png|webp))"',
        r'<img[^>]+src="(https?://[^"]+?\.(?:jpg|jpeg|png|webp))"',
    ]
    for pat in img_patterns:
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            img_url = m.group(1).split('?')[0]
            if not any(x in img_url.lower() for x in ['logo', 'icon', 'banner', 'avatar']):
                result['image_url'] = img_url
                break
    var_match = re.search(r'"variations"\s*:\s*(\[.*?\])\s*[,}]', html, re.DOTALL)
    if var_match:
        try:
            variations = json.loads(var_match.group(1))
            for v in variations:
                price_str = v.get('display_price') or v.get('display_regular_price') or ''
                price = float(str(price_str).replace(',', '.')) if price_str else 0
                attrs = v.get('attributes', {})
                volume = ''
                for k, val in attrs.items():
                    if val and re.search(r'\d+\s*(l|ml|g|kg)', str(val), re.IGNORECASE):
                        volume = str(val).strip()
                        break
                if not volume:
                    name = v.get('variation_description', '') or ''
                    m2 = re.search(r'(\d+(?:[.,]\d+)?\s*(?:L|ML|G|KG))', name, re.IGNORECASE)
                    if m2:
                        volume = m2.group(1).strip()
                if price > 0:
                    result['variants'].append({'volume': volume or '?', 'price': price})
        except Exception as e:
            log.debug(f'variation parse error: {e}')
    if not result['variants']:
        prices = re.findall(r'(\d+(?:[.,]\d+)?)\s*(?:DT|TND|dt)', html)
        prices = sorted(set(float(p.replace(',', '.')) for p in prices if float(p.replace(',', '.')) > 5))
        if prices:
            result['variants'] = [{'volume': '?', 'price': prices[0]}]
    return result

def parse_volumes(vol_str):
    parts = re.split(r'[/|;,]', str(vol_str))
    vols = []
    for p in parts:
        p = p.strip()
        m = re.search(r'(\d+(?:[.,]\d+)?\s*(?:L|ML|G|KG))', p, re.IGNORECASE)
        if m:
            vols.append(m.group(1).upper().replace(' ', '').replace(',', '.'))
    return vols if vols else ['1L']

def interpolate_prices(vols, price_min, price_max):
    def vol_num(v):
        m = re.search(r'(\d+(?:\.\d+)?)', v)
        return float(m.group(1)) if m else 1.0
    nums = [vol_num(v) for v in vols]
    min_n, max_n = min(nums), max(nums)
    result = {}
    for v, n in zip(vols, nums):
        if max_n == min_n:
            result[v] = price_min
        else:
            frac = (n - min_n) / (max_n - min_n)
            result[v] = round(price_min + frac * (price_max - price_min), 3)
    return result

def slug_from_name(name):
    s = name.lower().strip()
    for fr, lat in [('à','a'),('â','a'),('é','e'),('è','e'),('ê','e'),('î','i'),('ô','o'),('ù','u'),('û','u')]:
        s = s.replace(fr, lat)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def download_image(url, dest_dir, filename):
    dest = os.path.join(dest_dir, filename)
    if os.path.exists(dest):
        return True
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as r:
            data = r.read()
        with open(dest, 'wb') as f:
            f.write(data)
        log.info(f'  ✓ {filename}')
        return True
    except Exception as e:
        log.warning(f'  ✗ {url}: {e}')
        return False

def sql_esc(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

# ─── Read xlsx ────────────────────────────────────────────────────────────────
try:
    import openpyxl
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'openpyxl', '-q'])
    import openpyxl

wb = openpyxl.load_workbook(XLSX_PATH)
ws = wb.active
rows = []
for row in ws.iter_rows(min_row=3, values_only=True):
    if row[0] and row[1] and str(row[0]).strip() not in ('Marque', 'Remarque'):
        rows.append({
            'brand': str(row[0]).strip(),
            'product': str(row[1]).strip(),
            'price_min': float(row[2] or 0),
            'price_max': float(row[3] or row[2] or 0),
            'volumes_str': str(row[4] or '').strip(),
            'url': str(row[5] or '').strip(),
        })
log.info(f'Loaded {len(rows)} products from xlsx')

# ─── Build SQL ─────────────────────────────────────────────────────────────────
sql_lines = [
    '-- Auto-generated by import_variants_and_images.py',
    '-- Upsert product variants with prices and images from produits_variantes_prix.xlsx',
    '',
    'BEGIN;',
    "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
    '',
]

image_downloads = []

for i, item in enumerate(rows):
    brand = item['brand']
    product_name = item['product']
    price_min = item['price_min']
    price_max = item['price_max']
    volumes_str = item['volumes_str']
    url = item['url']

    log.info(f'[{i+1}/{len(rows)}] {brand} — {product_name}')

    vols = parse_volumes(volumes_str)
    price_map = interpolate_prices(vols, price_min, price_max)

    # Scrape product page
    scraped = None
    if url and url.startswith('http'):
        log.info(f'  Scraping: {url}')
        scraped = scrape_product_page(url)
        time.sleep(1.0)

    # Use scraped variants if clean
    final_variants = []
    if scraped and scraped['variants']:
        vv = [v for v in scraped['variants'] if v['volume'] != '?']
        if vv:
            final_variants = vv
    if not final_variants:
        for vol in vols:
            final_variants.append({'volume': vol, 'price': price_map[vol]})

    name_slug = slug_from_name(f'{brand}-{product_name}')
    search_name = product_name[:35].replace("'", "''")
    search_slug = slug_from_name(product_name)[:30]

    sql_lines.append(f'-- {i+1}. {brand}: {product_name}')
    sql_lines.append('DO $$')
    sql_lines.append('DECLARE prod_id text; BEGIN')
    sql_lines.append(f"  SELECT id INTO prod_id FROM public.\"Product\"")
    sql_lines.append(f"  WHERE LOWER(\"nameFr\") LIKE LOWER('%{search_name}%')")
    sql_lines.append(f"     OR LOWER(slug) LIKE LOWER('%{search_slug}%')")
    sql_lines.append(f"  LIMIT 1;")
    sql_lines.append(f"  IF prod_id IS NOT NULL THEN")

    for variant in final_variants:
        vol = variant['volume']
        price = round(variant['price'], 3)
        brand_pfx = re.sub(r'[^a-zA-Z0-9]', '', brand)[:4].upper()
        prod_pfx = re.sub(r'[^a-zA-Z0-9]', '', product_name)[:8].upper()
        vol_sfx = re.sub(r'[^a-zA-Z0-9]', '', vol)[:6]
        sku_var = f'VAR-{brand_pfx}-{prod_pfx}-{vol_sfx}'[:50]

        sql_lines.append(f"    INSERT INTO public.\"ProductVariant\" (id, \"productId\", volume, price, \"stockQty\", \"skuVariant\")")
        sql_lines.append(f"    VALUES (gen_random_uuid()::text, prod_id, {sql_esc(vol)}, {price}, 10, {sql_esc(sku_var)})")
        sql_lines.append(f"    ON CONFLICT (\"skuVariant\") DO UPDATE SET price = {price}, volume = {sql_esc(vol)}, \"stockQty\" = GREATEST(\"ProductVariant\".\"stockQty\", 5);")

    img_url = scraped['image_url'] if scraped else None
    if img_url and img_url.startswith('http'):
        ext_m = re.search(r'\.(jpg|jpeg|png|webp)', img_url, re.IGNORECASE)
        ext = ext_m.group(1).lower() if ext_m else 'jpg'
        img_fname = f'{name_slug[:60]}.{ext}'
        image_downloads.append((img_url, img_fname))
        img_path = f'/uploads/products/{img_fname}'
        sql_lines.append(f"    INSERT INTO public.\"ProductImage\" (id, \"productId\", url, \"isPrimary\", \"sortOrder\")")
        sql_lines.append(f"    VALUES (gen_random_uuid()::text, prod_id, {sql_esc(img_path)}, true, 0)")
        sql_lines.append(f"    ON CONFLICT DO NOTHING;")

    sql_lines.append(f"  END IF;")
    sql_lines.append("END $$;")
    sql_lines.append('')

sql_lines.append('COMMIT;')

with open(SQL_OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))
log.info(f'\n✅ SQL written to {SQL_OUT}')

# ─── Download images ──────────────────────────────────────────────────────────
log.info(f'\n📸 Downloading {len(image_downloads)} product images...')
ok, fail = 0, 0
for img_url, fname in image_downloads:
    if download_image(img_url, UPLOADS_DIR, fname):
        ok += 1
    else:
        fail += 1
    time.sleep(0.4)

log.info(f'\n✅ Done! {ok} images downloaded, {fail} failed.')
log.info(f'📄 Run on VM:')
log.info(f'   git pull origin main')
log.info(f'   docker compose exec -T backend node -e \'const {{Client}}=require("pg");const fs=require("fs");const c=new Client({{connectionString:process.env.DATABASE_URL}});let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",async()=>{{await c.connect();await c.query(s);const r=await c.query(`SELECT count(*) FROM public."ProductVariant"`);console.log("Variants:",r.rows[0].count);await c.end();}});\' < backend/prisma/upsert-variants.sql')
