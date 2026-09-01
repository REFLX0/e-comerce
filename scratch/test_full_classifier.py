import json
import re

items = json.load(open('all_live_products.json', encoding='utf-8'))

def classify_product(p):
    name = p.get('name', '').strip()
    sku = p.get('sku', '')
    brand = (p.get('brand') or {}).get('name', '')
    desc = p.get('description', '') or ''
    full_text = f"{name} {desc}".lower()
    name_lower = name.lower()

    # ─────────────────────────────────────────────────────────────
    # 1. PIÈCES DE RECHANGE (Filters, Electrical, Batteries, Wipers)
    # ─────────────────────────────────────────────────────────────
    if re.search(r'\b(filtre à air|filtre a air|air filter)\b', name_lower) or 'filtre à air' in name_lower:
        return 'auto-filtres-air', 'auto-filtres', 'Filtres à air'

    if re.search(r'\b(filtre à huile|filtre a huile|oil filter)\b', name_lower) or 'filtre à huile' in name_lower or 'f 026 407' in name_lower:
        return 'auto-filtres-huile', 'auto-filtres', 'Filtres à huile'

    if re.search(r'\b(filtre carburant|filtre à carburant|filtre à gasoil|filtre gasoil|fuel filter)\b', name_lower):
        return 'auto-filtres-carburant', 'auto-filtres', 'Filtres carburant'

    if re.search(r'\b(filtre habitacle|filtre d\'habitacle|cabin filter|filtre pollen)\b', name_lower):
        return 'auto-filtres-habitacle', 'auto-filtres', 'Filtres habitacle'

    # Any other filters (e.g. general filter)
    if re.search(r'\bfiltre\b', name_lower) and not re.search(r'\b(clé|cle)\b', name_lower):
        return 'auto-filtres', 'auto-filtres', 'Filtres'

    # Batteries (Varta, Assad, etc.)
    if re.search(r'\b(batterie|battery|varta|assad)\b', name_lower) and not re.search(r'\b(chargeur|booster)\b', name_lower):
        return 'batteries', 'auto-electricite-eclairage', 'Batteries'

    # Wipers / Essuie-glaces (Valeo, Bosch, etc.)
    if re.search(r'\b(balai|essuie-glace|essuie glace|wiper)\b', name_lower):
        return 'essuie-glaces', 'auto-electricite-eclairage', 'Essuie-glaces'

    # Light Bulbs / Lighting (Osram, Neolux, H1, H4, H7, H11...)
    if re.search(r'\b(h1|h4|h7|h11|px26d|osram|neolux|ampoule|lampe|cool blue|power light)\b', name_lower):
        return 'auto-electricite-eclairage', 'auto-electricite-eclairage', 'Électricité & Éclairage (Ampoules)'

    # Spark plugs / Bougies / Courroies / Distribution
    if re.search(r'\b(bougie|courroie|distribution|pompe à eau|pompe a eau)\b', name_lower):
        return 'auto-moteur-distribution', 'auto-pieces-rechange', 'Moteur & Distribution'

    # Workshop accessories & drain pans
    if re.search(r'\b(bidon de vidange|entonnoir|clé à filtre|cle a filtre|bac de vidange)\b', name_lower):
        return 'auto-autres-pieces', 'auto-pieces-rechange', 'Autres pièces & Accessoires vidange'

    # ─────────────────────────────────────────────────────────────
    # 2. MOTO & KARTING
    # ─────────────────────────────────────────────────────────────
    is_moto_brand_or_tag = bool(re.search(r'\b(motorbike|moto|scooter|2-temps|4-temps|kart|karting|two stroke|four stroke|powerbike)\b', name_lower))

    # Fork Oil
    if re.search(r'\b(fourche|fork oil)\b', name_lower):
        return 'moto-huile-fourche', 'moto-karting', 'Huile de fourche Moto'

    # Chain maintenance
    if re.search(r'\b(chaîne|chaine|chain lube|chain clean|graisse chaîne|graisse chaine|nettoyant pour chaîne)\b', name_lower):
        return 'moto-lubrifiants-chaine', 'moto-karting', 'Lubrifiants chaîne Moto'

    # Moto Gearbox Oils (e.g. Motorbike Gear Oil 80W-90, 75W-90, 75W-140, 10W-30)
    if is_moto_brand_or_tag and re.search(r'\b(gear oil|transoil|boîte|boite|transmission)\b', name_lower):
        return 'moto-huile-boite', 'moto-karting', 'Huile de boîte Moto'

    # Moto Additives & Sprays specific to bikes
    if is_moto_brand_or_tag and re.search(r'\b(bike-additive|shooter|pack entretien moto|pro cool)\b', name_lower):
        return 'moto-lubrifiants-chaine', 'moto-karting', 'Additifs & Entretien Moto'

    # Moto & Karting Engine Oils (2T, 4T, Street Race, Powerbike, Scooter MB, 2-Temps Plus, Karting)
    if is_moto_brand_or_tag or re.search(r'\b(2t|4t|jaso ma|jaso mb|jaso fd)\b', name_lower):
        return 'moto-huiles', 'moto-karting', 'Huiles Moteur Moto & Karting (2T/4T)'

    # ─────────────────────────────────────────────────────────────
    # 3. MARINE
    # ─────────────────────────────────────────────────────────────
    if re.search(r'\b(marine|outboard|inboard|fc-w|tc-w3|nautic|bateau)\b', name_lower):
        if re.search(r'\bgraisse\b', name_lower):
            return 'marine-graisses', 'marine', 'Graisses Marine'
        return 'marine-moteurs', 'marine', 'Huiles Moteurs Marins'

    # ─────────────────────────────────────────────────────────────
    # 4. CAR GEARBOX & TRANSMISSION (AUTOMOBILE)
    # ─────────────────────────────────────────────────────────────
    if re.search(r'\b(atf|dsg|dct|cvt|mtf|75w-80|75w-90|75w-85|80w-90|85w-140|hypoid|huile de boîte|huile de boite|transmission fluid|gear oil)\b', name_lower):
        return 'huile-de-boite', 'automobile', 'Huile de Boîte Automobile'

    # ─────────────────────────────────────────────────────────────
    # 5. CAR BRAKE & STEERING FLUIDS (AUTOMOBILE)
    # ─────────────────────────────────────────────────────────────
    if re.search(r'\b(dot 3|dot 4|dot 5|liquide de frein|brake fluid)\b', name_lower):
        return 'liquide-de-frein', 'automobile', 'Liquide de Frein'

    if re.search(r'\b(direction assistée|power steering|chf 11s|lhm|huile hydraulique|zh-m|zh m synt|antifuite pour direction)\b', name_lower):
        return 'direction-assistee', 'automobile', 'Liquide de Direction Assistée'

    # ─────────────────────────────────────────────────────────────
    # 6. CAR COOLANT & ADBLUE (AUTOMOBILE)
    # ─────────────────────────────────────────────────────────────
    if re.search(r'\b(adblue)\b', name_lower):
        return 'adblue', 'automobile', 'AdBlue'

    if re.search(r'\b(antigel|refroidissement|coolant|kfs 11|kfs 12|kfs 13)\b', name_lower):
        return 'antigel-refroidissement', 'automobile', 'Liquide de Refroidissement & Antigel'

    # ─────────────────────────────────────────────────────────────
    # 7. ADDITIVES (AUTOMOBILE)
    # ─────────────────────────────────────────────────────────────
    if re.search(r'\b(diesel|cétane|dpf|fap|anti-fumée|anti fumée)\b', name_lower) and re.search(r'\b(additif|nettoyant|booster|cleaner|traitement|protect)\b', name_lower):
        return 'additif-diesel', 'additifs', 'Additif Diesel'

    if re.search(r'\b(essence|octane|benzin|carburateur|injection essence|soupapes)\b', name_lower) and re.search(r'\b(additif|nettoyant|booster|cleaner|traitement)\b', name_lower):
        return 'additif-essence', 'additifs', 'Additif Essence'

    if re.search(r'\b(oil booster|engine flush|rinçage moteur|stop fuite|oil treatment|mos2|ceratec|visco-stabil|motor doctor|anti-fuite d’huile|poussoirs hydrau|nettoyant prévidange|nettoyeur moteur)\b', name_lower):
        return 'additif-huile', 'additifs', 'Additif Huile & Moteur'

    if re.search(r'\b(additif)\b', name_lower):
        return 'additifs', 'additifs', 'Additifs Auto'

    # ─────────────────────────────────────────────────────────────
    # 8. DETAILING & CLEANING (ENTRETIEN & ACCESSOIRES)
    # ─────────────────────────────────────────────────────────────
    if re.search(r'\b(shampoing|shampoo|polish|cuir|goudron|degraissant|dégraissant|nettoyant moteur spray|lavage|carrosserie|jantes|vitres|start fix|chrome)\b', name_lower):
        return 'lavage-carrosserie', 'entretien-accessoires', 'Entretien & Nettoyage'

    # ─────────────────────────────────────────────────────────────
    # 9. CAR ENGINE OILS (AUTOMOBILE HUILES MOTEUR)
    # ─────────────────────────────────────────────────────────────
    if re.search(r'\b(0w-16|0w-20|0w-30|0w-40|5w-20|5w-30|5w-40|5w-50|10w-30|10w-40|10w-60|15w-40|15w-50|20w-50)\b', name_lower) or re.search(r'\b(huile moteur|engine oil|top tec|edge|helix|quartz|hightec|officialtech|vitaltech|energy combi|classic 10w|diesel extra)\b', name_lower):
        return 'huiles-moteur', 'automobile', 'Huile Moteur Automobile'

    return 'auto-autres-pieces', 'auto-pieces-rechange', 'Autres pièces auto'

# Run test on all products
classified = {}
for p in items:
    cat_slug, root_slug, label = classify_product(p)
    classified.setdefault(cat_slug, []).append((p['name'], root_slug, label))

print("=== DETAILED LIST OF auto-autres-pieces ===")
for p in items:
    cat_slug, _, _ = classify_product(p)
    if cat_slug == 'auto-autres-pieces':
        bname = (p.get('brand') or {}).get('name', '')
        print(f"  • {p['name']} [Brand: {bname}]")
