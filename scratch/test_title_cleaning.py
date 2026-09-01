import json
import re

items = json.load(open('all_live_products.json', encoding='utf-8'))

def clean_title_and_extract_volume(name):
    original = name.strip()
    clean = original

    # Pattern for trailing volume: e.g. " (5L)", " 5L", " (4L)", " (100ml)", " (375ml)", " 1L", " 4L", etc.
    # Also handles "(150ml)", "(500ml)", "750 ML", "(0.5L)", "(1.5L)"
    vol_match = re.search(r'[\(\[]?\s*(\d+\.?\d*\s*(?:L|Litre|Litres|ml|ML|g|G|kg|KG))\s*[\)\]]?\s*$', clean)
    extracted_vol = None
    if vol_match:
        extracted_vol = vol_match.group(1).replace(' ', '').upper()
        if 'LITRE' in extracted_vol:
            extracted_vol = extracted_vol.replace('LITRES', 'L').replace('LITRE', 'L')
        # Strip from clean name
        clean = clean[:vol_match.start()].strip()

    # Also clean internal redundant volume if at the very end like " 5L-U"
    clean = re.sub(r'\s+[\(\[]?\s*\d+\.?\d*\s*(?:L|ml)\s*[\)\]]?$', '', clean, flags=re.I).strip()
    
    # Capitalization polish: avoid all-lowercase or ugly casing
    return clean, extracted_vol

# Test cleaning on sample products
print("=== SAMPLE TITLE CLEANING ===")
for p in items[:25]:
    c_name, vol = clean_title_and_extract_volume(p['name'])
    if c_name != p['name']:
        print(f"BEFORE: {p['name']}")
        print(f"AFTER : {c_name} (Extracted Volume: {vol})\n")
