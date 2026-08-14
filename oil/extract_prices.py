"""
extract_and_update_prices.py
Read all_products_final.json, extract prices from descriptions,
then output a price-update JSON that can be used by the CJS import script.
"""
import json
import re

def extract_price(text):
    """Try to extract a TND price from description text."""
    if not text:
        return None
    # Look for patterns like "129.90 د.ت" or "Gagnez 3.25 points de fidélité 129.90"
    # Prefer prices that appear as primary prices (before "Le prix")
    
    # Pattern: standalone price before currency symbol
    matches = re.findall(r'(\d{1,4}(?:\.\d{2})?)\s*(?:د\.ت|TND)', text)
    if matches:
        prices = [float(m) for m in matches if float(m) > 0]
        if prices:
            return min(prices)  # Return cheapest/first real price
    
    # Pattern: "Gagnez X.XX points de fidélité Y.YY"
    matches = re.findall(r'points de fidélité\s+(\d{1,4}(?:\.\d{2})?)', text)
    if matches:
        prices = [float(m) for m in matches if float(m) > 5]  # > 5 TND = real price
        if prices:
            return min(prices)
    
    return None


# Load products
with open(r'oil\all_products_final.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

if isinstance(data, dict):
    products = []
    for brand_list in data.values():
        products.extend(brand_list)
else:
    products = data

print(f'Loaded {len(products)} products')

priced = []
no_price = []

for p in products:
    title = p.get('title', '')
    sku = p.get('sku', '')
    full_desc = p.get('full_description', '')
    short_desc = p.get('short_description', '')
    price_raw = p.get('price_tnd', '')
    
    # Try to get real price from raw field first
    price = None
    if price_raw and price_raw != '0.00 د.ت':
        m = re.search(r'(\d{1,4}(?:\.\d{2})?)', str(price_raw))
        if m:
            v = float(m.group(1))
            if v > 1:
                price = v
    
    # If not found, extract from description
    if not price:
        price = extract_price(full_desc) or extract_price(short_desc)
    
    if price and price > 0:
        priced.append({'sku': sku, 'title': title, 'price': price})
    else:
        no_price.append({'sku': sku, 'title': title})

print(f'With price: {len(priced)}, Without: {len(no_price)}')
print('\nSample priced products:')
for p in priced[:10]:
    print(f'  [{p["sku"]}] {p["title"][:60]} -> {p["price"]} TND')

# Save price map keyed by SKU
price_map = {}
for p in priced:
    if p['sku']:
        price_map[p['sku']] = p['price']

with open(r'oil\price_map.json', 'w', encoding='utf-8') as f:
    json.dump(price_map, f, ensure_ascii=False, indent=2)

print(f'\nSaved {len(price_map)} SKU->price mappings to oil/price_map.json')
