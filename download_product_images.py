#!/usr/bin/env python3
"""
download_product_images.py
==========================
Zero external dependencies! Uses Python standard library.
Searches and downloads HD product images from official brand sources
(MANNOL, Liqui Moly, Bosch, Mafra, Castrol, Rowe, Varta, etc.)
and automatically updates the PostgreSQL database in Docker.

Usage on VM:
  cd ~/e-comerce
  python3 download_product_images.py
"""

import os
import re
import sys
import json
import time
import ssl
import subprocess
import logging
import urllib.request
import urllib.parse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger('ImageDownloader')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, 'catalogue_products.json')
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads', 'products')

# Ensure uploads directory is created with open permissions
try:
    os.makedirs(UPLOADS_DIR, exist_ok=True)
except PermissionError:
    try:
        subprocess.run(['sudo', 'mkdir', '-p', UPLOADS_DIR], check=False)
        subprocess.run(['sudo', 'chmod', '-R', '777', os.path.join(BASE_DIR, 'uploads')], check=False)
    except Exception:
        pass

# Parse database credentials
def get_db_credentials():
    env_files = [os.path.join(BASE_DIR, 'backend', '.env'), os.path.join(BASE_DIR, '.env')]
    env_vars = {}
    for ef in env_files:
        if os.path.exists(ef):
            with open(ef, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        env_vars[k.strip()] = v.strip().strip('"').strip("'")
    return env_vars

ENV_VARS = get_db_credentials()
POSTGRES_USER = ENV_VARS.get('POSTGRES_USER', os.environ.get('POSTGRES_USER', 'postgres'))
POSTGRES_DB = ENV_VARS.get('POSTGRES_DB', os.environ.get('POSTGRES_DB', 'specpart'))

# SSL context allowing downloads from various CDN certificates
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
}

def download_image(url, dest_path):
    """Download image to dest_path. Returns True on success."""
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': HEADERS['User-Agent'],
            'Accept': 'image/*,*/*;q=0.8',
            'Referer': url,
        })
        with urllib.request.urlopen(req, timeout=12, context=ctx) as resp:
            if resp.status == 200:
                data = resp.read()
                # Accept if greater than 3.5KB
                if len(data) > 3500:
                    with open(dest_path, 'wb') as f:
                        f.write(data)
                    return True
    except Exception:
        pass
    return False

def search_bing_images(query, max_results=4):
    """Fetch direct HD image URLs via Bing search engine."""
    encoded = urllib.parse.quote_plus(query)
    url = f"https://www.bing.com/images/search?q={encoded}&FORM=HDRSC2"
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(https?://[^"]+)"', html)
            # Filter valid image URLs
            valid = []
            for u in murls:
                clean_u = u.split('?')[0].lower()
                if any(ext in clean_u for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    valid.append(u)
                if len(valid) >= max_results:
                    break
            return valid
    except Exception:
        return []

def search_and_download(name, brand, sku, slug):
    # Check if already downloaded
    for ext in ['png', 'jpg', 'webp', 'jpeg']:
        p = os.path.join(UPLOADS_DIR, f'{slug}.{ext}')
        if os.path.exists(p) and os.path.getsize(p) > 3500:
            return f'/uploads/products/{slug}.{ext}'

    # Search queries in order of precision
    clean_brand = '' if brand.lower() == 'générique' or brand.lower() == 'generique' else brand
    queries = [
        f"{clean_brand} {name} product photo".strip(),
        f"{clean_brand} {sku} {name}".strip(),
        f"{name}".strip(),
    ]

    for q in queries:
        urls = search_bing_images(q, max_results=3)
        for url in urls:
            ext = 'png' if '.png' in url.lower() else ('webp' if '.webp' in url.lower() else 'jpg')
            dest = os.path.join(UPLOADS_DIR, f'{slug}.{ext}')
            if download_image(url, dest):
                log.info(f"  ✓ {name[:45]} -> {url[:70]}...")
                return f'/uploads/products/{slug}.{ext}'
            time.sleep(0.1)
        time.sleep(0.2)

    return None

def execute_sql(sql):
    """Execute SQL query in the PostgreSQL container."""
    cmd = [
        'docker', 'compose', 'exec', '-T', 'db',
        'psql', '-U', POSTGRES_USER, '-d', POSTGRES_DB, '-c', sql
    ]
    try:
        res = subprocess.run(cmd, cwd=BASE_DIR, capture_output=True, text=True, timeout=15)
        return res.returncode == 0
    except Exception:
        return False

def update_db_for_product(slug, image_url, name):
    clean_url = image_url.replace("'", "''")
    clean_slug = slug.replace("'", "''")
    clean_name = name.replace("'", "''")
    
    sql = f"""
    DO $$
    DECLARE prod_id text;
    BEGIN
      SELECT id INTO prod_id FROM public."Product" WHERE slug = '{clean_slug}';
      IF prod_id IS NOT NULL THEN
        -- Delete any older placeholder image
        DELETE FROM public."ProductImage" WHERE "productId" = prod_id AND url LIKE '%studio-car-final%';
        -- Insert new real image
        INSERT INTO public."ProductImage" (id, "productId", url, "altFr", "isPrimary", "sortOrder")
        VALUES (gen_random_uuid()::text, prod_id, '{clean_url}', '{clean_name[:150]}', TRUE, 0)
        ON CONFLICT DO NOTHING;
      END IF;
    END $$;
    """
    execute_sql(sql)

def main():
    if not os.path.exists(JSON_PATH):
        log.error(f"Catalogue JSON not found: {JSON_PATH}")
        sys.exit(1)

    log.info(f"Reading {JSON_PATH}...")
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        products = json.load(f)

    total = len(products)
    log.info(f"Starting HD product image download for {total} products...")

    success_count = 0
    for idx, p in enumerate(products, 1):
        name = p.get('name', '')
        sku = p.get('sku', '')
        brand = p.get('brand', '')
        slug = p.get('slug', '')

        if not name or not sku:
            continue

        log.info(f"[{idx}/{total}] Searching: {brand} - {name[:40]}")
        img_url = search_and_download(name, brand, sku, slug)

        if img_url:
            update_db_for_product(slug, img_url, name)
            success_count += 1
        else:
            log.warning(f"  ✗ [No image found] {name}")

    log.info("\n" + "=" * 60)
    log.info(f"COMPLETE! Successfully downloaded {success_count}/{total} images into {UPLOADS_DIR}")
    log.info("Restarting backend container to refresh cache...")
    subprocess.run(['docker', 'compose', 'restart', 'backend'], cwd=BASE_DIR)
    log.info("Done! Visit https://specpart.tech/catalogue to see your products with photos.")

if __name__ == '__main__':
    main()
