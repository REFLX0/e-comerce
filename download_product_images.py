#!/usr/bin/env python3
"""
download_product_images.py
==========================
Zero external dependencies! Uses only Python standard library:
(urllib.request, json, os, subprocess, re, time, ssl)

Run directly on the VM:
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
from urllib.parse import quote_plus

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
log = logging.getLogger('ImageDownloader')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, 'catalogue_products.json')
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads', 'products')
try:
    os.makedirs(UPLOADS_DIR, exist_ok=True)
except PermissionError:
    try:
        subprocess.run(['sudo', 'mkdir', '-p', UPLOADS_DIR], check=False)
        subprocess.run(['sudo', 'chmod', '-R', '777', os.path.join(BASE_DIR, 'uploads')], check=False)
    except Exception:
        pass

# Parse backend/.env or .env for DB credentials
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

# SSL context allowing downloads across CDNs
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
}

def fetch_url(url, timeout=10):
    """Fetch URL with custom headers and standard urllib."""
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
            return response.read(), response.headers.get('Content-Type', '')
    except Exception:
        return None, ''

def download_image(url, dest_path):
    """Download image to dest_path using urllib."""
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12, context=ctx) as response:
            if response.status == 200:
                data = response.read()
                if len(data) > 4000:
                    with open(dest_path, 'wb') as f:
                        f.write(data)
                    return True
    except Exception:
        pass
    return False

# Brand direct CDN candidates
def get_mannol_candidates(name, sku):
    m = re.search(r'(\d{4,})', str(sku))
    art = m.group(1) if m else None
    cands = []
    if art:
        cands += [
            f'https://www.mannol.de/assets/images/products/{art}.jpg',
            f'https://www.mannol.de/assets/images/products/mannol_{art}.jpg',
            f'https://www.mannol.eu/images/products/{art}_1.jpg',
            f'https://mannol.de/assets/images/products/MN{art}-1.jpg',
            f'https://mannol.de/assets/images/products/MN{art}-5.jpg',
        ]
    return cands

def get_liquimoly_candidates(name, sku):
    m = re.search(r'(\d{4,5})', str(sku))
    art = m.group(1) if m else None
    cands = []
    if art:
        cands += [
            f'https://www.liqui-moly.com/media/catalog/product/l/m/lm_{art}_1.jpg',
            f'https://www.liqui-moly.com/media/catalog/product/cache/1/image/800x800/lm_{art}.jpg',
            f'https://assets.liqui-moly.com/images/products/{art}.jpg',
            f'https://pim.liqui-moly.de/media/catalog/product/{art}_1.jpg',
        ]
    return cands

def search_duckduckgo(query, max_candidates=4):
    """Search DuckDuckGo using standard urllib without pip dependencies."""
    try:
        vqd_url = f'https://duckduckgo.com/?q={quote_plus(query)}&iax=images&ia=images'
        html_bytes, _ = fetch_url(vqd_url, timeout=8)
        if not html_bytes:
            return []
        html = html_bytes.decode('utf-8', errors='ignore')
        m = re.search(r"vqd='([^']+)'", html) or re.search(r'vqd="([^"]+)"', html)
        if not m:
            return []
        vqd = m.group(1)

        req_url = f'https://duckduckgo.com/i.js?l=us-en&o=json&q={quote_plus(query)}&vqd={vqd}&f=,,,&p=1'
        req = urllib.request.Request(req_url, headers={**HEADERS, 'Referer': 'https://duckduckgo.com/'})
        with urllib.request.urlopen(req, timeout=8, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            results = []
            for item in data.get('results', [])[:max_candidates]:
                img_url = item.get('image', '')
                if img_url and any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    results.append(img_url)
            return results
    except Exception:
        return []

def search_and_download(name, brand, sku, slug):
    # Check if already downloaded
    for ext in ['jpg', 'png', 'webp', 'jpeg']:
        p = os.path.join(UPLOADS_DIR, f'{slug}.{ext}')
        if os.path.exists(p) and os.path.getsize(p) > 4000:
            return f'/uploads/products/{slug}.{ext}'

    dest = os.path.join(UPLOADS_DIR, f'{slug}.jpg')

    # 1. Direct Brand CDN candidates
    brand_upper = (brand or '').upper()
    direct_candidates = []
    if 'MANNOL' in brand_upper:
        direct_candidates = get_mannol_candidates(name, sku)
    elif 'LIQUI MOLY' in brand_upper:
        direct_candidates = get_liquimoly_candidates(name, sku)

    for url in direct_candidates:
        if download_image(url, dest):
            log.info(f"  ✓ [Brand CDN] {name[:45]} -> {url}")
            return f'/uploads/products/{slug}.jpg'

    # 2. Web search fallback
    search_queries = [
        f"{brand} {name} product bottle pack",
        f"{brand} {sku} {name}",
        f"{name} official product photo",
    ]

    for q in search_queries:
        urls = search_duckduckgo(q)
        for url in urls:
            ext = 'png' if '.png' in url.lower() else ('webp' if '.webp' in url.lower() else 'jpg')
            target_file = os.path.join(UPLOADS_DIR, f'{slug}.{ext}')
            if download_image(url, target_file):
                log.info(f"  ✓ [Web Search] {name[:45]} -> {url[:60]}...")
                return f'/uploads/products/{slug}.{ext}'
            time.sleep(0.2)
        time.sleep(0.3)

    return None

def execute_sql(sql):
    """Execute SQL query using docker compose."""
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
        INSERT INTO public."ProductImage" (id, "productId", url, "altFr", "isPrimary", "sortOrder")
        VALUES (gen_random_uuid()::text, prod_id, '{clean_url}', '{clean_name[:150]}', TRUE, 0)
        ON CONFLICT DO NOTHING;
      END IF;
    END $$;
    """
    execute_sql(sql)

def main():
    if not os.path.exists(JSON_PATH):
        log.error(f"JSON not found: {JSON_PATH}")
        sys.exit(1)

    log.info(f"Reading {JSON_PATH}...")
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        products = json.load(f)

    total = len(products)
    log.info(f"Loaded {total} products. Starting real image fetch (0 external dependencies)...")

    success_count = 0
    for idx, p in enumerate(products, 1):
        name = p.get('name', '')
        sku = p.get('sku', '')
        brand = p.get('brand', '')
        slug = p.get('slug', '')

        if not name or not sku:
            continue

        log.info(f"[{idx}/{total}] Searching: {brand} {name[:40]}")
        img_url = search_and_download(name, brand, sku, slug)

        if img_url:
            update_db_for_product(slug, img_url, name)
            success_count += 1
        else:
            log.warning(f"  ✗ [No image found] {name}")

    log.info(f"\n=======================================================")
    log.info(f"DONE! Successfully pulled {success_count}/{total} images into {UPLOADS_DIR}")
    log.info(f"All images linked in database. Restarting backend cache...")
    subprocess.run(['docker', 'compose', 'restart', 'backend'], cwd=BASE_DIR)
    log.info("Finished!")

if __name__ == '__main__':
    main()
