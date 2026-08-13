"""
Full import script: loads only Tunisia-linked products with
Description, Spécifications, Références d'origine, Compatibilité.
"""

import csv
import os
import psycopg2
from psycopg2.extras import execute_values

DB_URL = "host=127.0.0.1 port=5432 dbname=kiosquetn user=kiosquetn"

CSV_DIR = "/app/TecDoc_Export"

def path(name):
    return os.path.join(CSV_DIR, name)

print("Connecting to database...")
conn = psycopg2.connect(DB_URL)
conn.autocommit = False
cur = conn.cursor()

# ── Step 1: Get the list of article_ids linked to Tunisia vehicles ──────────
print("Step 1: Reading vehicle links...")
linked_ids = set()
with open(path('clean_vehicle_links_tunisia_fixed.csv'), encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        aid = row.get('article_id', '').strip()
        if aid:
            linked_ids.add(aid)

print(f"  → {len(linked_ids)} unique article_ids linked to Tunisia vehicles")

# ── Step 2: Read attributes for linked articles ─────────────────────────────
print("Step 2: Reading attributes...")
specs = {}  # article_id -> HTML string
with open(path('clean_attributes_tunisia_fixed.csv'), encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        aid = row.get('article_id', '').strip()
        if aid not in linked_ids:
            continue
        title = (row.get('DisplayTitle') or row.get('displaytitle') or '').strip()
        value = (row.get('DisplayValue') or row.get('displayvalue') or '').strip()
        if title and value:
            specs.setdefault(aid, []).append(f"<li><strong>{title}:</strong> {value}</li>")

print(f"  → specs for {len(specs)} articles")

# ── Step 3: Read OE numbers for linked articles ─────────────────────────────
print("Step 3: Reading OE numbers...")
oe_refs = {}  # article_id -> HTML string
with open(path('clean_oe_numbers_tunisia_fixed.csv'), encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        aid = row.get('article_id', '').strip()
        if aid not in linked_ids:
            continue
        oenbr = (row.get('OENbr') or row.get('oenbr') or '').strip()
        mfr = (row.get('Manufacturer') or row.get('manufacturer') or '').strip()
        if oenbr:
            text = f"<li>{oenbr}"
            if mfr:
                text += f" — {mfr}"
            text += "</li>"
            oe_refs.setdefault(aid, []).append(text)

print(f"  → OE refs for {len(oe_refs)} articles")

# ── Step 4: Read vehicle compatibility ──────────────────────────────────────
print("Step 4: Reading vehicle compatibility...")
compat = {}  # article_id -> HTML string
with open(path('clean_vehicle_links_tunisia_fixed.csv'), encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        aid = row.get('article_id', '').strip()
        if not aid:
            continue
        attrs = (row.get('linkages_attributes') or '').strip()
        if attrs:
            text = attrs.replace('##', ' | ').replace('$$', ': ')
        else:
            text = 'Véhicule compatible'
        compat.setdefault(aid, []).append(f"<li>{text}</li>")

print(f"  → compatibility for {len(compat)} articles")

# ── Step 5: Build full descriptions ─────────────────────────────────────────
def build_description(aid):
    desc = '<p>Pièce de rechange auto.</p>'
    if aid in specs:
        desc += '<h3>Spécifications</h3><ul>' + ''.join(specs[aid]) + '</ul>'
    if aid in oe_refs:
        desc += "<h3>Références d'origine</h3><ul>" + ''.join(oe_refs[aid]) + '</ul>'
    if aid in compat:
        desc += '<h3>Compatibilité Véhicules</h3><ul>' + ''.join(compat[aid]) + '</ul>'
    return desc

# ── Step 6: Delete old products (keep ordered) ──────────────────────────────
print("Step 6: Cleaning old products...")
cur.execute('SELECT DISTINCT "productId" FROM "OrderItem"')
protected = {r[0] for r in cur.fetchall()}
print(f"  → protecting {len(protected)} ordered products")

protected_list = tuple(protected) if protected else ('__none__',)
cur.execute('DELETE FROM "ProductVariant" WHERE "productId" NOT IN %s', (protected_list,))
cur.execute('DELETE FROM "ProductImage" WHERE "productId" NOT IN %s', (protected_list,))
cur.execute('DELETE FROM "Review" WHERE "productId" NOT IN %s', (protected_list,))
cur.execute('DELETE FROM "WishlistItem" WHERE "productId" NOT IN %s', (protected_list,))
cur.execute('DELETE FROM "Product" WHERE id NOT IN %s', (protected_list,))
conn.commit()
print("  → old products deleted")

# ── Step 7: Read articles and insert ────────────────────────────────────────
print("Step 7: Reading articles and inserting products...")

# First ensure brand/category exist
cur.execute("""
    INSERT INTO "Category" (id, "nameFr", slug)
    VALUES ('cat-tecdoc-123', 'Pièces Auto', 'pieces-auto')
    ON CONFLICT (slug) DO NOTHING
""")

batch = []
inserted = 0

with open(path('clean_articles_tunisia_fixed.csv'), encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        aid = row.get('article_id', '').strip()
        if aid not in linked_ids:
            continue

        sku = (row.get('DataSupplierArticleNumber') or row.get('datasupplierarticlenumber') or '').strip()
        supplier = (row.get('Supplier') or row.get('supplier') or '').strip()
        name = (row.get('NormalizedDescription') or row.get('normalizeddescription') or 'Pièce Auto').strip()

        if not sku or not supplier:
            continue

        brand_id = f'brand-{supplier}'
        slug = f'prod-{aid}-{sku.lower().replace(" ", "-")}'
        desc = build_description(aid)

        # Ensure brand exists
        cur.execute("""
            INSERT INTO "Brand" (id, name, slug)
            VALUES (%s, %s, %s) ON CONFLICT (slug) DO NOTHING
        """, (brand_id, f'Supplier {supplier}', f'supplier-{supplier}'))

        batch.append((
            f'prod-{aid}', sku, name, slug, desc, False, True, brand_id, 'cat-tecdoc-123'
        ))

        if len(batch) >= 200:
            execute_values(cur, """
                INSERT INTO "Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId")
                VALUES %s ON CONFLICT (sku) DO NOTHING
            """, batch)
            inserted += len(batch)
            batch = []
            print(f"  → inserted {inserted} products so far...")
            conn.commit()

# Insert remaining
if batch:
    execute_values(cur, """
        INSERT INTO "Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId")
        VALUES %s ON CONFLICT (sku) DO NOTHING
    """, batch)
    inserted += len(batch)

conn.commit()
print(f"  → DONE: {inserted} products inserted")

# ── Final count ─────────────────────────────────────────────────────────────
cur.execute('SELECT COUNT(*) FROM "Product"')
total = cur.fetchone()[0]
cur.execute('SELECT COUNT(*) FROM "Product" WHERE description LIKE %s', ('%Spécifications%',))
with_specs = cur.fetchone()[0]
cur.execute('SELECT COUNT(*) FROM "Product" WHERE description LIKE %s', ('%Compatibilité%',))
with_compat = cur.fetchone()[0]

print()
print("=" * 40)
print(f"Total products:    {total}")
print(f"With Spécifications: {with_specs}")
print(f"With Compatibilité:  {with_compat}")
print("=" * 40)

cur.close()
conn.close()
print("Import complete!")
