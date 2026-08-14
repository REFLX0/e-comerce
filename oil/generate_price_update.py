"""
update_prices_and_import.py
1. Extracts prices from all_products_final.json descriptions
2. Runs full re-import (new products only) from all JSON files
3. Updates existing DB product prices via slug match
Outputs: update_prices.cjs that can be run in Docker
"""
import json
import re

def slugify(s):
    import unicodedata
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-z0-9]+', '-', s.lower())
    return s.strip('-')[:120]

def extract_price(text):
    if not text:
        return None
    # Look for "X.XX د.ت" in text
    matches = re.findall(r'(\d{1,4}(?:\.\d{2})?)\s*(?:د\.ت)', text)
    if matches:
        prices = [float(m) for m in matches if float(m) > 1]
        if prices:
            return min(prices)
    # Look for "points de fidélité Y.YY"
    matches = re.findall(r'points de fidélité\s+(\d{1,4}(?:\.\d{2})?)', text)
    if matches:
        prices = [float(m) for m in matches if float(m) > 5]
        if prices:
            return min(prices)
    return None

# Load all products
all_data = []
import os
for fname in ['all_products_final.json', 'Mannol_products.json', 'Liqui_Moly_products.json', 'Neolux_products.json', 'Osram_products.json']:
    fpath = os.path.join('oil', fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if isinstance(data, dict):
        for brand_list in data.values():
            all_data.extend(brand_list)
    else:
        all_data.extend(data)

print(f'Total raw records: {len(all_data)}')

# Deduplicate and extract prices
seen_slugs = set()
price_updates = []  # {slug, price}

for p in all_data:
    title = (p.get('title') or '').strip()
    if not title or len(title) < 3:
        continue
    
    slug = slugify(title)
    if slug in seen_slugs:
        continue
    seen_slugs.add(slug)
    
    full_desc = p.get('full_description', '') or ''
    short_desc = p.get('short_description', '') or ''
    price = extract_price(full_desc) or extract_price(short_desc)
    
    if price and price > 0:
        price_updates.append({'slug': slug, 'price': price})

print(f'Products with extractable price: {len(price_updates)}')
for p in price_updates[:5]:
    print(f'  {p["slug"][:50]} -> {p["price"]} TND')

# Build the CJS update script
cjs_lines = [
    "const { PrismaClient } = require('@prisma/client')",
    "const p = new PrismaClient()",
    "",
    "const PRICE_UPDATES = " + json.dumps(price_updates, ensure_ascii=False, indent=2),
    "",
    "async function main() {",
    "  console.log('=== PRICE UPDATE ===')",
    "  let updated = 0, missed = 0",
    "  for (const entry of PRICE_UPDATES) {",
    "    const product = await p.product.findUnique({ where: { slug: entry.slug }, include: { variants: true } })",
    "    if (!product) { missed++; continue }",
    "    // Update all variants to have the correct price",
    "    for (const variant of product.variants) {",
    "      await p.productVariant.update({",
    "        where: { id: variant.id },",
    "        data: { price: entry.price }",
    "      })",
    "    }",
    "    updated++",
    "  }",
    "  console.log(`Updated: ${updated}, Not found: ${missed}`)",
    "  await p.$disconnect()",
    "}",
    "",
    "main().catch(async e => { console.error(e); await p.$disconnect(); process.exit(1) })"
]

with open('oil/update_prices.cjs', 'w', encoding='utf-8') as f:
    f.write('\n'.join(cjs_lines))

print(f'\nSaved update_prices.cjs with {len(price_updates)} entries')
