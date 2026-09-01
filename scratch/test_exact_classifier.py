import json
import re

items = json.load(open('all_live_products.json', encoding='utf-8'))

def classify_exact(p):
    name = p.get('name', '').strip()
    name_lower = name.lower()
    brand = (p.get('brand') or {}).get('name', '').lower()

    # 1. Batteries
    if re.search(r'\b(batterie|battery|varta|assad|nour smart)\b', name_lower):
        return 'batteries'

    # 2. Wipers (Essuie-glaces)
    if re.search(r'\b(balai|essuie-glace|essuie glace|wiper)\b', name_lower) or re.search(r'\ba\s*\d{3}\s*s\b', name_lower):
        return 'essuie-glaces'

    # 3. Light Bulbs / Eclairage
    if re.search(r'\b(h1|h4|h7|h11|px26d|osram|neolux|ampoule|lampe|cool blue|power light|led intérieur|led interieur)\b', name_lower):
        return 'auto-electricite-eclairage'

    # 4. Filters
    if re.search(r'\b(filtre à air|filtre a air|air filter)\b', name_lower):
        return 'filtres-air'
    if re.search(r'\b(filtre à huile|filtre a huile|oil filter|f 026 407)\b', name_lower):
        return 'filtres-huile'
    if re.search(r'\b(filtre carburant|filtre à carburant|filtre à gasoil|filtre gasoil|fuel filter)\b', name_lower):
        return 'filtres-carburant'
    if re.search(r'\b(filtre habitacle|filtre d\'habitacle|cabin filter|filtre pollen|cu \d+)\b', name_lower):
        return 'filtres-habitacle'

    # 5. Moto & Karting
    is_moto = bool(re.search(r'\b(motorbike|moto|scooter|2-temps|4-temps|kart|karting|two stroke|four stroke|powerbike|cross)\b', name_lower))

    # Fork oil
    if re.search(r'\b(fourche|fork oil)\b', name_lower):
        return 'moto-huile-fourche'

    # Moto Gearbox oil
    if is_moto and re.search(r'\b(gear oil|transoil|boîte|boite|transmission)\b', name_lower):
        return 'moto-huile-boite'

    # Moto Chain & bike-specific maintenance
    if re.search(r'\b(graisse chaîne|graisse chaine|nettoyant pour chaîne|pack entretien moto|chain lube|chain clean)\b', name_lower):
        return 'moto-lubrifiants-chaine'
    if is_moto and re.search(r'\b(bike-additive|shooter|lubrifiant pour chaîne)\b', name_lower):
        return 'moto-lubrifiants-chaine'

    # Moto & Karting Engine Oils
    if is_moto or re.search(r'\b(2t|4t|jaso ma|jaso mb|jaso fd)\b', name_lower):
        # Exclude additives or car oils mistakenly tagged
        if not re.search(r'\b(officialtech|vitaltech|additif|diesel|essence)\b', name_lower):
            return 'moto-huiles'

    # 6. Marine
    if re.search(r'\b(marine|outboard|inboard|fc-w|tc-w3|nautic|bateau)\b', name_lower):
        if re.search(r'\bgraisse\b', name_lower):
            return 'marine-graisses'
        return 'marine-moteurs'

    # 7. Direction Assistée & Hydraulique
    if re.search(r'\b(direction assistée|direction assistee|power steering|chf 11s|lhm|huile hydraulique|zh-m|zh m synt|antifuite pour direction|boîtier de direction|boitier de direction|hydro iso)\b', name_lower):
        return 'direction-assistee'

    # 8. Huile de Boîte & Transmission (Automobile)
    if re.search(r'\b(atf|dsg|dct|cvt|mtf|75w-80|75w-90|75w-85|80w-90|85w-140|hypoid|huile de boîte|huile de boite|transmission fluid|lifeguardfluid|maxpower 75w|dexron|ag55|ag52|sae 90|anti-fuite boite|nettoyant boîte|nettoyeur de boîtes)\b', name_lower):
        return 'huile-de-boite'

    # 9. Liquide de Frein (Automobile)
    if re.search(r'\b(dot 3|dot 4|dot 5|dot-3|dot-4|dot-5|liquide de frein|brake fluid)\b', name_lower):
        return 'liquide-de-frein'

    # 10. Liquide de Refroidissement, Antigel & AdBlue
    if re.search(r'\b(adblue)\b', name_lower):
        return 'adblue'
    if re.search(r'\b(antigel|refroidissement|coolant|kfs 11|kfs 12|kfs 13|antifreeze|pro cool|ready mix raf|g11 prêt|eau déminéralisée|eau demineralisee)\b', name_lower):
        return 'antigel-refroidissement'

    # 11. Additifs (Diesel / Essence / Huile / Radiateur)
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

    if re.search(r'\b(radiateur anti fuite|radiateur flush|nettoyant radiateur|anti-fuites pour radiateurs)\b', name_lower):
        return 'additifs'

    if re.search(r'\b(catalytic|catalyseur)\b', name_lower):
        return 'additifs'

    # 12. Car Engine Oils (Huile Moteur Automobile)
    if re.search(r'\b(0w-16|0w-20|0w-30|0w-40|5w-20|5w-30|5w-40|5w-50|10w-30|10w-40|10w-60|15w-40|15w-50|20w-50)\b', name_lower) or re.search(r'\b(huile moteur|engine oil|top tec|edge|helix|quartz|hightec|officialtech|vitaltech|energy combi|classic 10w|diesel extra|guardtech|rs longlife)\b', name_lower):
        return 'huiles-moteur'

    # 13. Auto Spare Parts (Mechanical / Suspension / Brakes)
    if re.search(r'\b(bielle de suspension|amortisseur|rotule|bras de suspension)\b', name_lower):
        return 'auto-suspension-direction'
    if re.search(r'\b(plaquette|disque de frein|mâchoire|nettoyant pour freins)\b', name_lower):
        return 'auto-freinage'
    if re.search(r'\b(distribution|pompe à eau|courroie|actuateur|arbre excentrique|tendeur)\b', name_lower):
        return 'auto-moteur-distribution'
    if re.search(r'\b(lève-vitre|leve-vitre|pare-boue|tableau de bord|poignée|rétroviseur)\b', name_lower):
        return 'auto-carrosserie-habitacle'

    # 14. Detailing, Cleaning & Workshop
    if re.search(r'\b(shampoing|shampoo|polish|cuir|goudron|degraissant|dégraissant|nettoyant moteur spray|lavage|carrosserie|jantes|vitres|start fix|chrome|diamant plast|tissus|insectes|pneus|pulimax|phares|stop rayures|chamois|lave glace|lave-glace|climatisation|klima)\b', name_lower):
        return 'lavage-carrosserie'

    if re.search(r'\b(graisse|silicone|dégrippant|degrippant|m-40|lm 40|multi-spray|nettoyant pour montage|nettoyant pour contacts|joint maker|anticor|anti rongeurs|débitmètre|debitmetre|electronic spray|patin velcro)\b', name_lower):
        return 'produits-divers'

    if re.search(r'\b(bidon de vidange|entonnoir|clé à filtre|cle a filtre)\b', name_lower):
        return 'auto-autres-pieces'

    return 'auto-autres-pieces'

# Test classification count
counts = {}
for p in items:
    cat = classify_exact(p)
    counts[cat] = counts.get(cat, 0) + 1

print("=== EXACT CLASSIFICATION COUNTS ===")
for cat, cnt in sorted(counts.items(), key=lambda x: -x[1]):
    print(f"{cat}: {cnt}")
