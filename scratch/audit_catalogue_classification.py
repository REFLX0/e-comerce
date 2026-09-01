import json
import re

items = json.load(open('all_live_products.json', encoding='utf-8'))

print(f"Total products analyzed: {len(items)}\n")

print("=== 1. MOTO PRODUCTS FOUND IN AUTOMOBILE CATEGORIES ===")
for p in items:
    cat = p.get('category') or {}
    cslug = cat.get('slug', '')
    name = p.get('name', '')
    desc = p.get('description', '')
    full_text = f"{name} {desc}"
    if cslug in ['huile-de-boite', 'huiles-boite-transmission', 'huiles-moteur', 'automobile']:
        if re.search(r'\b(moto|scooter|motorbike|transoil|2t|4t|fork|fourche)\b', full_text, re.I):
            print(f"  - [{cslug}] {name}")

print("\n=== 2. MARINE PRODUCTS IN DATABASE ===")
marine_found = False
for p in items:
    cat = p.get('category') or {}
    cslug = cat.get('slug', '')
    name = p.get('name', '')
    desc = p.get('description', '')
    full_text = f"{name} {desc}"
    if re.search(r'\b(marine|outboard|inboard|nautic|bateau|fc-w|tc-w3)\b', full_text, re.I):
        print(f"  - [{cslug}] {name}")
        marine_found = True
if not marine_found:
    print("  None found!")

print("\n=== 3. KARTING & 2-STROKE RACING PRODUCTS IN DATABASE ===")
kart_found = False
for p in items:
    cat = p.get('category') or {}
    cslug = cat.get('slug', '')
    name = p.get('name', '')
    desc = p.get('description', '')
    full_text = f"{name} {desc}"
    if re.search(r'\b(kart|karting|racing 2t|2-stroke|2 temps|300v 2t|power 1 2t)\b', full_text, re.I):
        print(f"  - [{cslug}] {name}")
        kart_found = True
if not kart_found:
    print("  None found!")

print("\n=== 4. LIGHTING & ELECTRICAL FOUND IN OILS ===")
for p in items:
    cat = p.get('category') or {}
    cslug = cat.get('slug', '')
    name = p.get('name', '')
    if re.search(r'\b(osram|cool blue|h1|h4|h7|h11|ampoule|lampe)\b', name, re.I):
        print(f"  - [{cslug}] {name}")

print("\n=== 5. HYDRAULIC & STEERING FLUIDS FOUND IN HUILE MOTEUR ===")
for p in items:
    cat = p.get('category') or {}
    cslug = cat.get('slug', '')
    name = p.get('name', '')
    if re.search(r'\b(hydraulique|zh m|chf 11s|lhm|direction assistée)\b', name, re.I):
        print(f"  - [{cslug}] {name}")
