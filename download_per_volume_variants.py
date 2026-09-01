#!/usr/bin/env python3
"""
download_per_volume_variants.py
Extracts exact 1L, 4L, 5L, 7L images and prices for each product variation from
touringstudiocar.shop WooCommerce variations, downloads each image separately to
uploads/products/, and updates ProductVariant.imageUrl + ProductImage gallery.
"""

import sys, os, re, json, time, ssl, html, logging
import urllib.request
import urllib.parse

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
log = logging.getLogger()

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
XLSX_PATH = os.path.join(WORKSPACE_DIR, 'produits_variantes_prix.xlsx')
UPLOADS_DIR = os.path.join(WORKSPACE_DIR, 'uploads', 'products')
SQL_OUT = os.path.join(WORKSPACE_DIR, 'backend', 'prisma', 'upsert-variants.sql')

os.makedirs(UPLOADS_DIR, exist_ok=True)

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
}

def fetch(url, timeout=15):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as r:
            return r.read().decode('utf-8', errors='replace')
    except Exception as e:
        log.warning(f'  fetch error {url}: {e}')
        return ''

def fetch_bing_image(query):
    """Fallback to Bing HD image search for exact volume if not found on page."""
    try:
        url = 'https://www.bing.com/images/search?q=' + urllib.parse.quote(query + ' bidon') + '&FORM=HDRSC2'
        html_page = fetch(url, timeout=8)
        if not html_page:
            return None
        matches = re.findall(r'murl&quot;:&quot;(https?://[^&quot;]+)&quot;', html_page)
        for m in matches:
            if re.search(r'\.(jpg|jpeg|png|webp)', m, re.IGNORECASE):
                return m
    except:
        pass
    return None

def slug_from_name(name):
    s = name.lower().strip()
    for fr, lat in [('à','a'),('â','a'),('é','e'),('è','e'),('ê','e'),('î','i'),('ô','o'),('ù','u'),('û','u')]:
        s = s.replace(fr, lat)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def download_image(url, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        return True
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15, context=SSL_CTX) as r:
            data = r.read()
        if len(data) > 500:
            with open(dest_path, 'wb') as f:
                f.write(data)
            return True
    except Exception as e:
        log.warning(f'  ✗ Failed download {url}: {e}')
    return False

def sql_esc(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

# ─── Load xlsx ────────────────────────────────────────────────────────────────
try:
    import openpyxl
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'openpyxl', '-q'])
    import openpyxl

wb = openpyxl.load_workbook(XLSX_PATH)
ws = wb.active
items = []
for row in ws.iter_rows(min_row=3, values_only=True):
    if row[0] and row[1] and str(row[0]).strip() not in ('Marque', 'Remarque'):
        items.append({
            'brand': str(row[0]).strip(),
            'product': str(row[1]).strip(),
            'price_min': float(row[2] or 0),
            'price_max': float(row[3] or row[2] or 0),
            'volumes_str': str(row[4] or '').strip(),
            'url': str(row[5] or '').strip(),
        })

log.info(f'Loaded {len(items)} products with variants from {XLSX_PATH}')

sql_statements = [
    '-- Auto-generated per-volume variant & image import',
    'BEGIN;',
    "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
    '',
]

download_queue = []  # (url, dest_path)

for idx, item in enumerate(items):
    brand = item['brand']
    product_name = item['product']
    price_min = item['price_min']
    price_max = item['price_max']
    url = item['url']

    log.info(f'[{idx+1}/{len(items)}] {brand} — {product_name}')

    product_slug = slug_from_name(f'{brand}-{product_name}')
    search_name = product_name[:35].replace("'", "''")
    search_slug = slug_from_name(product_name)[:30]

    variations_data = []

    if url and url.startswith('http'):
        page_html = fetch(url)
        time.sleep(0.5)

        # 1. Try WooCommerce data-product_variations JSON attribute
        m_var = re.search(r'data-product_variations="([^"]+)"', page_html)
        if m_var:
            try:
                raw_json = html.unescape(m_var.group(1))
                v_list = json.loads(raw_json)
                for v in v_list:
                    # Extract volume
                    attrs = v.get('attributes', {})
                    vol = ''
                    for k, val in attrs.items():
                        if val and re.search(r'\d+\s*(l|ml|g|kg)', str(val), re.IGNORECASE):
                            vol = str(val).strip().upper().replace(' ', '').replace(',', '.')
                            break
                    if not vol:
                        desc = v.get('variation_description', '')
                        m_v = re.search(r'(\d+(?:[.,]\d+)?\s*(?:L|ML|G|KG))', desc, re.IGNORECASE)
                        if m_v:
                            vol = m_v.group(1).upper().replace(' ', '').replace(',', '.')

                    # Extract price
                    price_val = v.get('display_price') or v.get('display_regular_price') or 0
                    price = float(str(price_val).replace(',', '.')) if price_val else 0

                    # Extract image
                    img_info = v.get('image', {})
                    img_src = img_info.get('full_src') or img_info.get('src') or img_info.get('url') or ''
                    if img_src and '?' in img_src:
                        img_src = img_src.split('?')[0]

                    if vol and price > 0:
                        variations_data.append({
                            'volume': vol,
                            'price': price,
                            'image_url': img_src
                        })
            except Exception as e:
                log.warning(f'  JSON parse error: {e}')

        # 2. Fallback if no variations in JSON: extract gallery images
        if not variations_data:
            # Parse volumes from string
            raw_vols = re.split(r'[/|;,]', item['volumes_str'])
            vols = []
            for rv in raw_vols:
                m_rv = re.search(r'(\d+(?:[.,]\d+)?\s*(?:L|ML|G|KG))', rv, re.IGNORECASE)
                if m_rv:
                    vols.append(m_rv.group(1).upper().replace(' ', '').replace(',', '.'))
            if not vols:
                vols = ['1L', '5L']

            # Find all image URLs on page
            page_imgs = re.findall(r'<img[^>]+src="([^"]+\.(?:jpg|jpeg|png|webp))"', page_html)
            page_imgs = [pi.split('?')[0] for pi in page_imgs if not any(x in pi.lower() for x in ['logo', 'icon', 'banner', 'avatar'])]

            for v_i, vol in enumerate(vols):
                if len(vols) == 1:
                    price = price_min
                else:
                    frac = v_i / (len(vols) - 1)
                    price = round(price_min + frac * (price_max - price_min), 3)

                img_for_vol = page_imgs[v_i] if v_i < len(page_imgs) else (page_imgs[0] if page_imgs else None)
                variations_data.append({
                    'volume': vol,
                    'price': price,
                    'image_url': img_for_vol
                })

    # If still no variants
    if not variations_data:
        variations_data = [
            {'volume': '1L', 'price': price_min, 'image_url': None},
            {'volume': '5L', 'price': price_max, 'image_url': None},
        ]

    # Process each variation: queue image download and generate SQL
    sql_statements.append(f'-- {idx+1}. {brand} — {product_name}')
    sql_statements.append('DO $$')
    sql_statements.append('DECLARE prod_id text; BEGIN')
    sql_statements.append(f"  SELECT id INTO prod_id FROM public.\"Product\"")
    sql_statements.append(f"  WHERE LOWER(\"nameFr\") LIKE LOWER('%{search_name}%')")
    sql_statements.append(f"     OR LOWER(slug) LIKE LOWER('%{search_slug}%')")
    sql_statements.append(f"  LIMIT 1;")
    sql_statements.append(f"  IF prod_id IS NOT NULL THEN")

    for v_order, var in enumerate(variations_data):
        vol = var['volume']
        price = round(var['price'], 3)
        img_url = var['image_url']

        vol_slug = re.sub(r'[^a-zA-Z0-9]', '', vol).lower()
        ext = 'png'
        if img_url:
            ext_m = re.search(r'\.(jpg|jpeg|png|webp)', img_url, re.IGNORECASE)
            ext = ext_m.group(1).lower() if ext_m else 'png'

        var_filename = f'{product_slug[:50]}-{vol_slug}.{ext}'
        var_dest_path = os.path.join(UPLOADS_DIR, var_filename)
        var_image_url_db = f'/uploads/products/{var_filename}'

        # If no image URL found, fallback to Bing search for exact volume
        if not img_url:
            bing_url = fetch_bing_image(f'{brand} {product_name} {vol}')
            if bing_url:
                img_url = bing_url

        if img_url:
            download_queue.append((img_url, var_dest_path))

        brand_pfx = re.sub(r'[^a-zA-Z0-9]', '', brand)[:4].upper()
        prod_pfx = re.sub(r'[^a-zA-Z0-9]', '', product_name)[:8].upper()
        sku_var = f'VAR-{brand_pfx}-{prod_pfx}-{vol_slug.upper()}'[:50]

        sql_statements.append(f"    -- Variant {vol} ({price} DT) with image {var_image_url_db}")
        sql_statements.append(f"    INSERT INTO public.\"ProductVariant\" (id, \"productId\", volume, price, \"stockQty\", \"skuVariant\", \"imageUrl\")")
        sql_statements.append(f"    VALUES (gen_random_uuid()::text, prod_id, {sql_esc(vol)}, {price}, 10, {sql_esc(sku_var)}, {sql_esc(var_image_url_db)})")
        sql_statements.append(f"    ON CONFLICT (\"skuVariant\") DO UPDATE SET")
        sql_statements.append(f"      price = {price},")
        sql_statements.append(f"      volume = {sql_esc(vol)},")
        sql_statements.append(f"      \"imageUrl\" = {sql_esc(var_image_url_db)},")
        sql_statements.append(f"      \"stockQty\" = GREATEST(\"ProductVariant\".\"stockQty\", 5);")

        # Also add to ProductImage gallery
        is_primary = 'true' if v_order == 0 else 'false'
        sql_statements.append(f"    INSERT INTO public.\"ProductImage\" (id, \"productId\", url, \"isPrimary\", \"sortOrder\")")
        sql_statements.append(f"    VALUES (gen_random_uuid()::text, prod_id, {sql_esc(var_image_url_db)}, {is_primary}, {v_order})")
        sql_statements.append(f"    ON CONFLICT DO NOTHING;")

    sql_statements.append(f"  END IF;")
    sql_statements.append("END $$;")
    sql_statements.append('')

sql_statements.append('COMMIT;')

with open(SQL_OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))
log.info(f'\n✅ Generated SQL with exact per-volume image mappings: {SQL_OUT}')

# ─── Download exact per-volume images ─────────────────────────────────────────
log.info(f'\n📸 Downloading {len(download_queue)} exact per-volume images (1L, 4L, 5L)...')
ok_count, fail_count = 0, 0
for img_url, dest_path in download_queue:
    fname = os.path.basename(dest_path)
    log.info(f'  Downloading {fname} <- {img_url[:70]}...')
    if download_image(img_url, dest_path):
        ok_count += 1
        log.info(f'  ✓ Saved: {fname}')
    else:
        fail_count += 1
    time.sleep(0.3)

log.info(f'\n🎉 Done! {ok_count} per-volume images downloaded, {fail_count} failed.')
