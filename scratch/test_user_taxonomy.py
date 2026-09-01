import json
import re

items = json.load(open('all_live_products.json', encoding='utf-8'))

def clean_title(name):
    clean = name.strip()
    vol_match = re.search(r'[\(\[]?\s*(\d+\.?\d*\s*(?:L|Litre|Litres|ml|ML|g|G|kg|KG))\s*[\)\]]?\s*$', clean)
    extracted_vol = None
    if vol_match:
        extracted_vol = vol_match.group(1).replace(' ', '').upper()
        if 'LITRE' in extracted_vol:
            extracted_vol = extracted_vol.replace('LITRES', 'L').replace('LITRE', 'L')
        clean = clean[:vol_match.start()].strip()
    clean = re.sub(r'\s+[\(\[]?\s*\d+\.?\d*\s*(?:L|ml)\s*[\)\]]?$', '', clean, flags=re.I).strip()
    return clean, extracted_vol

def classify_user_exact(p):
    name = p['name'].strip()
    name_lower = name.lower()

    # ─────────────────────────────────────────────────────────────
    # 1. PIÈCES DE RECHANGE
    # ─────────────────────────────────────────────────────────────
    # Filters
    if re.search(r'\b(filtre|cartouche filtrante|f 026 407|cu \d+)\b', name_lower) and not re.search(r'\b(clé|cle)\b', name_lower):
        return 'auto-filtres'

    # Braking
    if re.search(r'\b(plaquette|disque de frein|mâchoire|machoire|nettoyant pour freins|nettoyant freins)\b', name_lower):
        return 'auto-freinage'

    # Suspension & Direction parts
    if re.search(r'\b(bielle de suspension|amortisseur|rotule|bras de suspension|triangle)\b', name_lower):
        return 'auto-suspension-direction'

    # Transmission mechanical parts
    if re.search(r'\b(embrayage|volant moteur|cardan|butée d\'embrayage|kit d\'embrayage)\b', name_lower):
        return 'transmission'

    # Engine & Distribution mechanical parts
    if re.search(r'\b(distribution|pompe à eau|pompe a eau|courroie|actuateur|arbre excentrique|tendeur|bougie)\b', name_lower):
        return 'auto-moteur-distribution'

    # Cooling & Air Conditioning
    if re.search(r'\b(climatisation|condenseur|compresseur de clim|radiateur moteur|pulseur|klima refresh)\b', name_lower):
        return 'auto-refroidissement-climatisation'

    # Electrical, Lighting, Batteries & Wipers
    if re.search(r'\b(batterie|battery|varta|assad|nour smart|balai|essuie-glace|essuie glace|wiper|h1|h4|h7|h11|px26d|osram|neolux|ampoule|lampe|cool blue|power light|led intérieur|led interieur)\b', name_lower):
        return 'auto-electricite-eclairage'

    # Body & Cabin
    if re.search(r'\b(lève-vitre|leve-vitre|pare-boue|tableau de bord|rétroviseur|retroviseur|poignée)\b', name_lower):
        return 'auto-carrosserie-habitacle'

    # Exhaust
    if re.search(r'\b(échappement|echappement|silencieux|pot d\'échappement|catalyseur échappement)\b', name_lower):
        return 'auto-echappement'

    # ─────────────────────────────────────────────────────────────
    # 2. MOTO & KARTING
    # ─────────────────────────────────────────────────────────────
    is_moto = bool(re.search(r'\b(motorbike|moto|scooter|2-temps|4-temps|kart|karting|two stroke|four stroke|powerbike|cross)\b', name_lower))

    if re.search(r'\b(fourche|fork oil)\b', name_lower):
        return 'moto-huile-fourche'

    if is_moto and re.search(r'\b(gear oil|transoil|boîte|boite|transmission)\b', name_lower):
        return 'moto-huile-boite'

    if re.search(r'\b(chaîne|chaine|chain lube|chain clean|graisse chaîne|graisse chaine|nettoyant pour chaîne)\b', name_lower):
        return 'moto-lubrifiants-chaine'
    if is_moto and re.search(r'\b(bike-additive|shooter|pack entretien moto)\b', name_lower):
        return 'moto-lubrifiants-chaine'

    if is_moto or re.search(r'\b(2t|4t|jaso ma|jaso mb|jaso fd)\b', name_lower):
        if not re.search(r'\b(officialtech|vitaltech|diesel|essence)\b', name_lower):
            return 'moto-huiles'

    # ─────────────────────────────────────────────────────────────
    # 3. MARINE
    # ─────────────────────────────────────────────────────────────
    if re.search(r'\b(marine|outboard|inboard|fc-w|tc-w3|nautic|bateau)\b', name_lower):
        if re.search(r'\b(hydraulique|hydraulic)\b', name_lower):
            return 'marine-hydraulique'
        if re.search(r'\b(graisse|additif)\b', name_lower):
            return 'marine-graisses'
        return 'marine-moteurs'

    # ─────────────────────────────────────────────────────────────
    # 4. AUTOMOBILE
    # ─────────────────────────────────────────────────────────────
    # Brake fluid
    if re.search(r'\b(dot 3|dot 4|dot 5|dot-3|dot-4|dot-5|liquide de frein|brake fluid)\b', name_lower):
        return 'liquide-de-frein'

    # Steering & Hydraulic fluid
    if re.search(r'\b(direction assistée|direction assistee|power steering|chf 11s|lhm|huile hydraulique|zh-m|zh m synt|antifuite pour direction|boîtier de direction|boitier de direction|hydro iso)\b', name_lower):
        return 'direction-assistee'

    # Gearbox & Transmission oil
    if re.search(r'\b(atf|dsg|dct|cvt|mtf|75w-80|75w-90|75w-85|80w-90|85w-140|hypoid|huile de boîte|huile de boite|transmission fluid|lifeguardfluid|maxpower 75w|dexron|ag55|ag52|sae 90|anti-fuite boite|nettoyant boîte|nettoyeur de boîtes)\b', name_lower):
        return 'huile-de-boite'

    # Additives
    if re.search(r'\b(diesel|cétane|cetane|dpf|fap|anti-fumée|anti fumée)\b', name_lower) and re.search(r'\b(additif|nettoyant|booster|cleaner|traitement|protect|super clean|applicator|décrassant|decrassant|rinçage|rincage)\b', name_lower):
        return 'additif-diesel'
    if re.search(r'\b(cétane|cetane|rinçage diesel|diesel stop smoke|système diesel)\b', name_lower):
        return 'additif-diesel'

    if re.search(r'\b(essence|octane|benzin|carburateur|injection essence|soupapes|soupape)\b', name_lower) and re.search(r'\b(additif|nettoyant|booster|cleaner|traitement|décrassant|protect)\b', name_lower):
        return 'additif-essence'
    if re.search(r'\b(octane plus|burning booster|fuel protect|systèmes d‘ injection|systèmes d\' injection|système essence)\b', name_lower):
        return 'additif-essence'

    if re.search(r'\b(oil booster|engine flush|rinçage moteur|stop fuite huile|oil treatment|mos2|mos 2|ceratec|ceramo|visco-stabil|motor doctor|anti-fuite d’huile|poussoirs hydrau|nettoyant prévidange|nettoyeur moteur|oil stop smoke|stop fumée d’huile|rinçage boue|étanchéité moteur|etancheite moteur|oil leak stop)\b', name_lower):
        return 'additif-huile'

    if re.search(r'\b(additif|radiateur anti fuite|radiateur flush|nettoyant radiateur|anti-fuites pour radiateurs|catalytic|catalyseur)\b', name_lower):
        return 'additifs'

    # Fluids & Maintenance (Antigel, AdBlue, Lave-glace, Detailing, Nettoyants, Graisses, Sprays)
    if re.search(r'\b(adblue|antigel|refroidissement|coolant|kfs 11|kfs 12|kfs 13|antifreeze|pro cool|ready mix raf|g11 prêt|eau déminéralisée|eau demineralisee|shampoing|shampoo|polish|cuir|goudron|degraissant|dégraissant|nettoyant moteur spray|lavage|carrosserie|jantes|vitres|start fix|chrome|diamant plast|tissus|insectes|pneus|pulimax|phares|stop rayures|chamois|lave glace|lave-glace|graisse|silicone|dégrippant|degrippant|m-40|lm 40|multi-spray|nettoyant pour montage|nettoyant pour contacts|joint maker|anticor|anti rongeurs|débitmètre|debitmetre|electronic spray|patin velcro|bidon de vidange|entonnoir|clé à filtre|cle a filtre)\b', name_lower):
        return 'liquides-auto'

    # Automobile Engine oils
    if re.search(r'\b(0w-16|0w-20|0w-30|0w-40|5w-20|5w-30|5w-40|5w-50|10w-30|10w-40|10w-60|15w-40|15w-50|20w-50)\b', name_lower) or re.search(r'\b(huile moteur|engine oil|top tec|edge|helix|quartz|hightec|officialtech|vitaltech|energy combi|classic 10w|diesel extra|guardtech|rs longlife)\b', name_lower):
        return 'huiles-moteur'

    return 'liquides-auto'

# Verify counts for all 467 products
counts = {}
for p in items:
    cat = classify_user_exact(p)
    counts[cat] = counts.get(cat, 0) + 1

print("=== USER TAXONOMY DISTRIBUTION FOR ALL 467 PRODUCTS ===")
for cat, cnt in sorted(counts.items(), key=lambda x: -x[1]):
    print(f"{cat}: {cnt}")
