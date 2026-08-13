#!/usr/bin/env python3
"""
import_autopart.py — Import autopart_db CSVs into the site PostgreSQL DB.

Imports:
  - products.csv   → Brand, Category, Product, ProductVariant, ProductImage
  - technical_specs.csv → appended to product descriptions as specs block
  - compatible_vehicles.csv → VehicleMake, VehicleModel, VehicleCompatibility (ALL rows)

Excluded (per user request):
  - source URL (url column)
  - EAN / gtin13
  - shipping cost / livraison
  - autopart.tn links from descriptions

DB: postgresql://kiosquetn:kiosquetn_local_secret@localhost:5433/kiosquetn
"""

import csv
import os
import re
import sys
import time
import unicodedata
import psycopg2
import psycopg2.extras

# ─── CONFIG ──────────────────────────────────────────────────────────────────
DB_DSN = {
    "host":     "127.0.0.1",
    "port":     5433,
    "dbname":   "kiosquetn",
    "user":     "kiosquetn",
    "password": "kiosquetn_local_secret",
}
BASE   = r"C:\Users\Asus\OneDrive\Bureau\achref\autopart_db"

PRODUCTS_CSV  = os.path.join(BASE, "products.csv")
IMAGES_CSV    = os.path.join(BASE, "image_urls.csv")
SPECS_CSV     = os.path.join(BASE, "technical_specs.csv")
VEHICLES_CSV  = os.path.join(BASE, "compatible_vehicles.csv")

BATCH      = 500   # rows per commit for vehicle compat
PROD_BATCH = 200   # rows per commit for products

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    text = text.strip().lower()
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text or "unknown"

def ensure_unique_slug(slug: str, existing: set) -> str:
    candidate = slug
    counter = 1
    while candidate in existing:
        candidate = f"{slug}-{counter}"
        counter += 1
    existing.add(candidate)
    return candidate

def clean_description(raw: str) -> str:
    if not raw:
        return ""
    raw = re.sub(r"\s*—\s*\.?\s*Pièce de qualité livrée partout en Tunisie\.?", "", raw)
    raw = re.sub(r"https?://autopart\.tn[^\s]*", "", raw)
    raw = re.sub(r"autopart\.tn", "", raw)
    raw = re.sub(r"Livraison[^.]*\.", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"frais de port[^.]*\.", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s{2,}", " ", raw)
    raw = re.sub(r"^\s*[-–—]+\s*", "", raw)
    return raw.strip()

def parse_year_range(detail: str):
    m = re.search(r"de\s+\d+/(\d{4})\s+à\s+\d+/(\d{4})", detail)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.search(r"du\s+\d+/(\d{4})", detail)
    if m:
        return int(m.group(1)), None
    return None, None

def progress(msg: str):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    progress("Connecting to database …")
    conn = psycopg2.connect(**DB_DSN)
    conn.autocommit = False
    cur = conn.cursor()

    # ── 1. CATEGORIES ──────────────────────────────────────────────────────
    progress("=== Phase 1: Categories …")

    cat_map = {}   # parent_name → id
    sub_map = {}   # subcategory_slug → id
    used_slugs = set()

    parent_names = set()
    sub_data = {}  # slug → parent_name

    with open(PRODUCTS_CSV, encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            pname = row["category_name"].strip()
            sslug = row["subcategory_slug"].strip()
            if pname:
                parent_names.add(pname)
            if sslug and pname:
                sub_data[sslug] = pname

    # Load existing category slugs
    cur.execute('SELECT slug, id FROM "Category"')
    for slug, cid in cur.fetchall():
        used_slugs.add(slug)

    for pname in sorted(parent_names):
        slug_base = slugify(pname)[:120]
        slug = ensure_unique_slug(slug_base, used_slugs)
        cur.execute(
            """INSERT INTO "Category" (id, "nameFr", slug)
               VALUES (gen_random_uuid()::text, %s, %s)
               ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr"
               RETURNING id""",
            (pname, slug),
        )
        cat_map[pname] = cur.fetchone()[0]

    conn.commit()
    progress(f"  {len(cat_map)} parent categories.")

    for sslug, pname in sorted(sub_data.items()):
        parent_id = cat_map.get(pname)
        sub_name = sslug.replace("-", " ").title()
        final_slug = ensure_unique_slug(sslug, used_slugs)
        cur.execute(
            """INSERT INTO "Category" (id, "nameFr", slug, "parentId")
               VALUES (gen_random_uuid()::text, %s, %s, %s)
               ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr", "parentId" = EXCLUDED."parentId"
               RETURNING id""",
            (sub_name, final_slug, parent_id),
        )
        sub_map[sslug] = cur.fetchone()[0]

    conn.commit()
    progress(f"  {len(sub_map)} subcategories.")

    # ── 2. BRANDS ──────────────────────────────────────────────────────────
    progress("=== Phase 2: Brands …")

    brand_names = set()
    with open(PRODUCTS_CSV, encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            b = row["brand"].strip()
            if b:
                brand_names.add(b)

    brand_map = {}
    brand_slugs = set()
    cur.execute('SELECT slug, id FROM "Brand"')
    for slug, bid in cur.fetchall():
        brand_slugs.add(slug)

    for bname in sorted(brand_names):
        slug = ensure_unique_slug(slugify(bname), brand_slugs)
        cur.execute(
            """INSERT INTO "Brand" (id, name, slug)
               VALUES (gen_random_uuid()::text, %s, %s)
               ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
               RETURNING id""",
            (bname, slug),
        )
        brand_map[bname] = cur.fetchone()[0]

    conn.commit()
    progress(f"  {len(brand_map)} brands.")

    # ── 3. PRODUCTS ────────────────────────────────────────────────────────
    progress("=== Phase 3: Products, variants & images …")

    progress("  Loading image map …")
    img_map = {}
    with open(IMAGES_CSV, encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            pid = row["product_id"].strip()
            url = row["image_url"].strip()
            if pid and url:
                img_map.setdefault(pid, []).append(url)

    progress("  Loading specs map …")
    specs_map = {}
    with open(SPECS_CSV, encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            pid = row["product_id"].strip()
            label_raw = (row["spec_label"] or "").strip()
            if "|" in label_raw:
                parts = label_raw.split("|", 1)
                label, value = parts[0].strip(), parts[1].strip()
            else:
                label = label_raw
                value = (row.get("spec_value") or "").strip()
            if pid and label:
                specs_map.setdefault(pid, []).append(f"{label}: {value}")

    # Load existing SKUs/slugs
    prod_map = {}
    used_skus = set()
    used_prod_slugs = set()

    cur.execute('SELECT sku, id FROM "Product"')
    for sku, pid in cur.fetchall():
        used_skus.add(sku)
        prod_map[sku] = pid

    cur.execute('SELECT slug FROM "Product"')
    for (s,) in cur.fetchall():
        used_prod_slugs.add(s)

    total_prods = 0
    skipped_prods = 0
    batch_products = []

    with open(PRODUCTS_CSV, encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            ext_id     = row["product_id"].strip()
            name       = row["name"].strip()
            brand_name = row["brand"].strip()
            sku_raw    = row["sku"].strip() or ext_id
            price_raw  = row["price"].strip()
            avail      = row["availability"].strip()
            cat_name   = row["category_name"].strip()
            sub_slug   = row["subcategory_slug"].strip()
            desc_raw   = row["description"].strip()

            if not name or not brand_name or not price_raw:
                skipped_prods += 1
                continue

            brand_id    = brand_map.get(brand_name)
            category_id = sub_map.get(sub_slug) or cat_map.get(cat_name)

            if not brand_id or not category_id:
                skipped_prods += 1
                continue

            try:
                price = float(price_raw.replace(",", "."))
            except ValueError:
                skipped_prods += 1
                continue

            # Deduplicate SKU
            sku = sku_raw
            counter = 1
            while sku in used_skus:
                sku = f"{sku_raw}-{counter}"
                counter += 1
            used_skus.add(sku)

            # Slug
            slug_base = slugify(name)[:90]
            slug = ensure_unique_slug(slug_base, used_prod_slugs)

            # Clean description — no source URL, no EAN, no livraison
            desc = clean_description(desc_raw)
            specs_lines = specs_map.get(ext_id, [])
            if specs_lines:
                specs_block = "\n\nSpécifications techniques:\n" + "\n".join(f"• {s}" for s in specs_lines[:20])
                desc = (desc + specs_block).strip()
            if not desc:
                desc = name

            in_stock  = "stock" in avail.lower() and "rupture" not in avail.lower()
            stock_qty = 10 if in_stock else 0

            batch_products.append((ext_id, sku, name, slug, desc, brand_id, category_id, price, stock_qty))

            if len(batch_products) >= PROD_BATCH:
                _insert_product_batch(cur, conn, batch_products, img_map, prod_map)
                total_prods += len(batch_products)
                batch_products = []
                if total_prods % 2000 == 0:
                    progress(f"  {total_prods:,} products …")

    if batch_products:
        _insert_product_batch(cur, conn, batch_products, img_map, prod_map)
        total_prods += len(batch_products)

    progress(f"  Products done: {total_prods:,} imported, {skipped_prods:,} skipped.")

    # ── 4. VEHICLE COMPATIBILITY ────────────────────────────────────────────
    progress("=== Phase 4: Vehicle compatibility (ALL 3.2M rows) …")
    progress("  This phase may take 30–90 minutes. Do not interrupt.")

    make_map   = {}
    model_map  = {}
    model_slugs = set()

    cur.execute('SELECT name, id FROM "VehicleMake"')
    for name, mid in cur.fetchall():
        make_map[name] = mid

    cur.execute('SELECT "makeId", name, id FROM "VehicleModel"')
    for make_id, name, mid in cur.fetchall():
        model_map[(make_id, name)] = mid

    cur.execute('SELECT slug FROM "VehicleModel"')
    for (s,) in cur.fetchall():
        model_slugs.add(s)

    def get_or_create_make(name):
        if name in make_map:
            return make_map[name]
        slug = slugify(name)[:100]
        cur.execute(
            """INSERT INTO "VehicleMake" (id, name, slug)
               VALUES (gen_random_uuid()::text, %s, %s)
               ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
               RETURNING id""",
            (name, slug),
        )
        mid = cur.fetchone()[0]
        make_map[name] = mid
        return mid

    def get_or_create_model(make_id, model_name):
        key = (make_id, model_name)
        if key in model_map:
            return model_map[key]
        slug_base = slugify(model_name)[:100]
        slug = ensure_unique_slug(slug_base, model_slugs)
        cur.execute(
            """INSERT INTO "VehicleModel" (id, "makeId", name, slug)
               VALUES (gen_random_uuid()::text, %s, %s, %s)
               ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
               RETURNING id""",
            (make_id, model_name, slug),
        )
        mid = cur.fetchone()[0]
        model_map[key] = mid
        return mid

    compat_batch = []
    compat_total = 0
    compat_skip  = 0

    with open(VEHICLES_CSV, encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            ext_pid = row["product_id"].strip()
            packed  = (row.get("brand") or "").strip()

            product_id = prod_map.get(ext_pid)
            if not product_id or not packed:
                compat_skip += 1
                continue

            parts = [p.strip() for p in packed.split("|")]
            if len(parts) < 2:
                compat_skip += 1
                continue

            make_name  = parts[0][:100]
            model_name = parts[1][:200]
            engine_raw = (parts[2] if len(parts) > 2 else "")[:300]

            if not make_name or not model_name:
                compat_skip += 1
                continue

            year_from, year_to = parse_year_range(engine_raw)
            engine_code = re.sub(r"\s*(?:de|du)\s+\d+/\d{4}(?:\s+à\s+\d+/\d{4})?\s*", " ", engine_raw)
            engine_code = re.sub(r"\s+", " ", engine_code).strip()[:200] or None

            compat_batch.append((make_name, model_name, engine_code, year_from, year_to, product_id))

            if len(compat_batch) >= BATCH:
                _insert_compat_batch(cur, conn, compat_batch, get_or_create_make, get_or_create_model)
                compat_total += len(compat_batch)
                compat_batch = []
                if compat_total % 50000 == 0:
                    progress(f"  {compat_total:,} compat rows …")

    if compat_batch:
        _insert_compat_batch(cur, conn, compat_batch, get_or_create_make, get_or_create_model)
        compat_total += len(compat_batch)

    progress(f"  Vehicle compat done: {compat_total:,} rows, {compat_skip:,} skipped.")

    conn.commit()
    cur.close()
    conn.close()
    progress("=== ALL DONE! ===")
    progress(f"Summary: {total_prods:,} products | {compat_total:,} vehicle compat rows")


# ─── BATCH HELPERS ───────────────────────────────────────────────────────────

def _insert_product_batch(cur, conn, batch, img_map, prod_map):
    for (ext_id, sku, name, slug, desc, brand_id, category_id, price, stock_qty) in batch:
        cur.execute(
            """INSERT INTO "Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
               VALUES (gen_random_uuid()::text, %s, %s, %s, %s, false, true, %s, %s, NOW())
               ON CONFLICT (sku) DO UPDATE
                 SET "nameFr" = EXCLUDED."nameFr",
                     description = EXCLUDED.description,
                     "isPublished" = true
               RETURNING id""",
            (sku, name, slug, desc, brand_id, category_id),
        )
        prod_db_id = cur.fetchone()[0]
        prod_map[ext_id] = prod_db_id

        variant_sku = f"{sku}-U"
        cur.execute(
            "INSERT INTO \"ProductVariant\" (id, \"productId\", volume, price, \"stockQty\", \"skuVariant\")"
            " VALUES (gen_random_uuid()::text, %s, '1', %s, %s, %s)"
            " ON CONFLICT (\"skuVariant\") DO UPDATE"
            " SET price = EXCLUDED.price, \"stockQty\" = EXCLUDED.\"stockQty\"",
            (prod_db_id, price, stock_qty, variant_sku),
        )

        images = img_map.get(ext_id, [])
        for i, img_url in enumerate(images[:5]):
            cur.execute(
                """INSERT INTO "ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
                   VALUES (gen_random_uuid()::text, %s, %s, %s, %s)
                   ON CONFLICT DO NOTHING""",
                (prod_db_id, img_url, i == 0, i),
            )

    conn.commit()


def _insert_compat_batch(cur, conn, batch, get_or_create_make, get_or_create_model):
    for (make_name, model_name, engine_code, year_from, year_to, product_id) in batch:
        try:
            make_id  = get_or_create_make(make_name)
            model_id = get_or_create_model(make_id, model_name)
            cur.execute(
                """INSERT INTO "VehicleCompatibility" (id, "productId", "vehicleModelId", "engineCode", "yearFrom", "yearTo")
                   VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s)
                   ON CONFLICT ("productId", "vehicleModelId", "engineCode") DO NOTHING""",
                (product_id, model_id, engine_code, year_from, year_to),
            )
        except Exception:
            pass
    conn.commit()


if __name__ == "__main__":
    start = time.time()
    main()
    elapsed = time.time() - start
    print(f"\nTotal time: {elapsed/60:.1f} minutes")
