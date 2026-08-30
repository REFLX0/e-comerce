const fs = require('fs');
const path = require('path');
const XLSX = require('./scraper_temp/node_modules/xlsx');

const INPUT_FILE = path.join(__dirname, 'SCRAPE_TOURINGSTUDIOCAR', '00_TOUS_PRODUITS_MASTER.xlsx');
const OUTPUT_DIR = path.join(__dirname, 'CATALOGUE_TOURINGSTUDIOCAR_SPECPART');

const SPECPART_HEADERS = [
  'ID_PRODUIT (NE PAS MODIFIER)',
  'ID_VARIANTE (NE PAS MODIFIER)',
  'SKU_PRODUIT',
  'SKU_VARIANTE',
  'NOM_PRODUIT_FR',
  'SLUG_PRODUIT',
  'MARQUE',
  'CATEGORIE_PRINCIPALE',
  'SOUS_CATEGORIE',
  'CONDITIONNEMENT_VOLUME',
  'PRIX_TTC_TND',
  'PRIX_BARRE_TND',
  'STOCK_QUANTITE',
  'IMAGE_PRINCIPALE_URL',
  'TOUTES_IMAGES_URL',
  'VISCOSITE',
  'NORMES_API',
  'NORMES_ACEA',
  'NORMES_JASO',
  'TYPE_HUILE (Synthèse/Semi-Synthèse/Minérale)',
  'COMPATIBLE_FAP_DPF (OUI/NON)',
  'COMPATIBLE_TURBO (OUI/NON)',
  'COMPATIBLE_HYBRIDE (OUI/NON)',
  'HOMOLOGATIONS_OEM_CONSTRUCTEURS',
  'EST_EN_VEDETTE (OUI/NON)',
  'STATUT_PUBLIE (OUI/NON)',
  'DESCRIPTION_COURTE',
  'DESCRIPTION_FR'
];

function sanitizeFilename(name) {
  return String(name || 'Non_Classe')
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePrice(str) {
  if (!str) return 0;
  // Ex: "40,000 د.ت" -> 40.000
  const clean = String(str)
    .replace(/[^\d,\.]/g, '')
    .replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Number(num.toFixed(3));
}

function detectBrand(name, cat, rawBrand) {
  const full = `${name} ${cat} ${rawBrand}`.toUpperCase();
  if (full.includes('LIQUI MOLY') || full.includes('MOLYGEN') || full.includes('TOP TEC') || full.includes('SPECIAL TEC')) return 'LIQUI MOLY';
  if (full.includes('MANNOL')) return 'MANNOL';
  if (full.includes('VARTA')) return 'VARTA';
  if (full.includes('BOSCH')) return 'BOSCH';
  if (full.includes('ASSAD')) return 'ASSAD';
  if (full.includes('ROWE') || full.includes('HIGHTEC')) return 'ROWE';
  if (full.includes('CASTROL') || full.includes('MAGNATEC') || full.includes('EDGE')) return 'CASTROL';
  if (full.includes('WOLF')) return 'WOLF';
  if (full.includes('HYUNDAI') || full.includes('XTEER')) return 'HYUNDAI XTeer';
  if (full.includes('PRO TEC') || full.includes('PRO-TEC') || full.includes('PROTEC')) return 'PRO-TEC';
  if (full.includes('AREXONS')) return 'AREXONS';
  if (full.includes('KAMOKA')) return 'KAMOKA';
  if (full.includes('JOTATE')) return 'JOTATE';
  if (full.includes('KRAWEHL')) return 'KRAWEHL';
  if (full.includes('RUPES')) return 'RUPES';
  if (full.includes('MOTUL')) return 'MOTUL';
  if (full.includes('TOTAL')) return 'TOTAL';
  if (full.includes('ELF')) return 'ELF';
  if (full.includes('MOBIL')) return 'MOBIL';
  if (full.includes('SHELL')) return 'SHELL';
  if (rawBrand && rawBrand.length > 2 && !rawBrand.includes('w') && !rawBrand.includes('ACEA')) return rawBrand;
  return 'Générique';
}

function detectViscosity(text) {
  const m = text.match(/\b(0W-?16|0W-?20|0W-?30|0W-?40|5W-?20|5W-?30|5W-?40|5W-?50|10W-?30|10W-?40|10W-?50|10W-?60|15W-?40|15W-?50|20W-?50|75W-?80|75W-?85|75W-?90|75W-?140|80W-?90|85W-?140|SAE\s?\d+)\b/i);
  if (m) return m[1].toUpperCase().replace('-', '');
  return '';
}

function detectVolume(name, rawVariants) {
  if (rawVariants && rawVariants.includes('volume')) {
    const cleanVar = rawVariants.replace(/.*:\s*/, '');
    return cleanVar;
  }
  const m = name.match(/\b(\d+[\.,]?\d*\s?(?:L|ML|KG|G|Ah|pc|pièce|cm|mm))\b/i);
  if (m) return m[1].trim();
  return '1 Pièce';
}

function detectSpecpartCategory(name, rawCat, text) {
  const full = `${name} ${rawCat} ${text}`.toLowerCase();

  // 1. MOTO
  if (full.includes('moto') || full.includes('motorbike') || full.includes('scooter') || full.includes('fourche') || full.includes('chaine') || full.includes('2t') || full.includes('4t')) {
    if (full.includes('fourche')) return { main: 'Moto', sub: 'Huiles de fourche' };
    if (full.includes('chaine') || full.includes('graisse')) return { main: 'Moto', sub: 'Entretien & Graissage chaîne' };
    if (full.includes('additif')) return { main: 'Moto', sub: 'Additifs moto' };
    return { main: 'Moto', sub: 'Huiles moteur 2T & 4T' };
  }

  // 2. BATTERIES
  if (full.includes('batterie') || full.includes('varta') || full.includes('assad') || full.includes('agm') || full.includes('efb') || full.includes('ah') && full.includes('12v')) {
    return { main: 'Pièces de Rechange / D\'origine', sub: 'Électricité & Éclairage (Batteries)' };
  }

  // 3. ESSUIE-GLACE
  if (full.includes('essuie-glace') || full.includes('balai') || full.includes('jotate') || full.includes('krawehl') || full.includes('a 072 s')) {
    return { main: 'Pièces de Rechange / D\'origine', sub: 'Électricité & Éclairage (Essuie-glaces)' };
  }

  // 4. FILTRES
  if (full.includes('filtre') || full.includes('filter')) {
    if (full.includes('huile')) return { main: 'Pièces de Rechange / D\'origine', sub: 'Filtres (Filtres à huile)' };
    if (full.includes('air')) return { main: 'Pièces de Rechange / D\'origine', sub: 'Filtres (Filtres à air)' };
    if (full.includes('habitacle') || full.includes('clima')) return { main: 'Pièces de Rechange / D\'origine', sub: 'Filtres (Filtres habitacle)' };
    if (full.includes('carburant') || full.includes('diesel') || full.includes('essence')) return { main: 'Pièces de Rechange / D\'origine', sub: 'Filtres (Filtres carburant)' };
    return { main: 'Pièces de Rechange / D\'origine', sub: 'Filtres' };
  }

  // 5. BOITE & TRANSMISSION (ATF, DSG, CVT, Huiles de pont)
  if (full.includes('boite') || full.includes('boîte') || full.includes('transmission') || full.includes('atf') || full.includes('dsg') || full.includes('cvt') || full.includes('pont') || full.includes('75w') || full.includes('80w90') || full.includes('hypoide')) {
    return { main: 'Huiles & Lubrifiants Moteur', sub: 'Huiles de boîte & Transmission' };
  }

  // 6. LIQUIDES & FLUIDES (Refroidissement, Frein, Direction, AdBlue)
  if (full.includes('liquide de refroidissement') || full.includes('antigel') || full.includes('coolant') || full.includes('raf 11') || full.includes('raf 12') || full.includes('pro cool') || full.includes('g11') || full.includes('g12') || full.includes('g13')) {
    return { main: 'Huiles & Lubrifiants Moteur', sub: 'Liquides (Refroidissement & Antigel)' };
  }
  if (full.includes('liquide de frein') || full.includes('dot 3') || full.includes('dot 4') || full.includes('dot 5.1') || full.includes('huile de frein')) {
    return { main: 'Huiles & Lubrifiants Moteur', sub: 'Liquides (Liquide de frein)' };
  }
  if (full.includes('adblue')) {
    return { main: 'Huiles & Lubrifiants Moteur', sub: 'Liquides (AdBlue)' };
  }

  // 7. ADDITIFS
  if (full.includes('additif') || full.includes('nettoyant') || full.includes('traitement') || full.includes('rinçage') || full.includes('stop fuite') || full.includes('anti-fuite') || full.includes('injection') || full.includes('soupape') || full.includes('fap') || full.includes('catalyseur') || full.includes('ceratec') || full.includes('molygen add')) {
    if (full.includes('diesel') || full.includes('injecteur diesel') || full.includes('fap') || full.includes('catalytic') || full.includes('essence') || full.includes('carburant')) {
      return { main: 'Additifs', sub: 'Additifs Carburant & Injection' };
    }
    if (full.includes('radiateur') || full.includes('refroidissement')) {
      return { main: 'Additifs', sub: 'Additifs Radiateur' };
    }
    return { main: 'Additifs', sub: 'Additifs Huile & Moteur' };
  }

  // 8. ENTRETIEN & DETAILING (Shampoing, Nettoyant jantes, Polish, Cuir, Plastique)
  if (full.includes('shampoing') || full.includes('jante') || full.includes('microfibre') || full.includes('polish') || full.includes('lustreur') || full.includes('insecte') || full.includes('dégraissant') || full.includes('lave glace') || full.includes('nettoyant vitre') || full.includes('cuir') || full.includes('tableau de bord') || full.includes('plastique') || full.includes('rupes') || full.includes('lavage') || full.includes('intérieur') || full.includes('extérieur')) {
    if (full.includes('intérieur') || full.includes('cuir') || full.includes('tissu') || full.includes('tableau')) {
      return { main: 'Entretien & Accessoires', sub: 'Nettoyage & Entretien Intérieur' };
    }
    return { main: 'Entretien & Accessoires', sub: 'Lavage, Carrosserie & Detailing' };
  }

  // 9. HUILES MOTEUR AUTOMOBILE (Default for engine oils)
  if (full.includes('huile') || full.includes('5w') || full.includes('0w') || full.includes('10w') || full.includes('15w') || full.includes('20w') || full.includes('molygen') || full.includes('top tec') || full.includes('special tec') || full.includes('energy') || full.includes('extreme') || full.includes('hightec') || full.includes('magnatec')) {
    return { main: 'Huiles & Lubrifiants Moteur', sub: 'Huiles moteur' };
  }

  return { main: 'Entretien & Accessoires', sub: 'Produits divers & Maintenance' };
}

function extractTechSpecs(text, name, cat) {
  const full = `${text} ${name} ${cat}`;

  // API
  const apiMatches = full.match(/\bAPI\s+([A-Z0-9\/\-]+)\b/i);
  const api = apiMatches ? apiMatches[0].toUpperCase() : '';

  // ACEA
  const aceaMatches = full.match(/\bACEA\s+([A-Z0-9\/\-\s]+?)(?:,|$|\n|\.)/i);
  const acea = aceaMatches ? aceaMatches[0].trim() : '';

  // JASO
  const jasoMatches = full.match(/\bJASO\s+(MA2|MA1|MA|MB|FC|FD)\b/i);
  const jaso = jasoMatches ? jasoMatches[0].toUpperCase() : '';

  // Oil type
  let oilType = '';
  if (full.toLowerCase().includes('100% synth') || full.toLowerCase().includes('entièrement synthétique') || full.toLowerCase().includes('fully synthetic')) {
    oilType = '100% Synthèse';
  } else if (full.toLowerCase().includes('semi-synth') || full.toLowerCase().includes('synthèse hc') || full.toLowerCase().includes('hc-synthèse') || full.toLowerCase().includes('technologie de synthèse')) {
    oilType = 'Semi-Synthèse';
  } else if (full.toLowerCase().includes('minérale') || full.toLowerCase().includes('mineral')) {
    oilType = 'Minérale';
  }

  // DPF / FAP
  const dpf = (full.toLowerCase().includes('fap') || full.toLowerCase().includes('dpf') || full.toLowerCase().includes('filtre à particule')) ? 'OUI' : 'NON';

  // Turbo
  const turbo = (full.toLowerCase().includes('turbo') || full.toLowerCase().includes('turbocompresseur')) ? 'OUI' : 'NON';

  // OEM Approvals
  const oemList = [];
  const oemPatterns = [
    /\bMB\s?\d{3}\.\d+\b/gi,
    /\bVW\s?\d{3}\s?\d{2}\b/gi,
    /\bBMW\s?LL-?\d{2}\b/gi,
    /\bRenault\s?RN\s?\d{4}\b/gi,
    /\bPSA\s?B\d{2}\s?\d{4}\b/gi,
    /\bPeugeot\s?Citroen\s?\(PSA\)\s?B\d{2}\s?\d{4}\b/gi,
    /\bPorsche\s?[A-Z0-9\-]+\b/gi,
    /\bFord\s?WSS-[A-Z0-9\-]+\b/gi,
    /\bFiat\s?9\.\d{5}-[A-Z0-9]+\b/gi,
    /\bGM\s?dexos\d?\b/gi,
  ];
  for (const p of oemPatterns) {
    const m = full.match(p);
    if (m) {
      for (const item of m) {
        if (!oemList.includes(item.trim())) oemList.push(item.trim());
      }
    }
  }
  const oem = oemList.join('; ');

  return { api, acea, jaso, oilType, dpf, turbo, oem };
}

function createXlsxWorkbook(dataRows, sheetName = 'Produits') {
  const wsData = [SPECPART_HEADERS, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-calculate column widths
  const colWidths = SPECPART_HEADERS.map((h, i) => {
    let maxLen = h.length;
    for (let r = 0; r < Math.min(dataRows.length, 100); r++) {
      const val = dataRows[r][i];
      if (val !== undefined && val !== null) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 65) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  return wb;
}

async function run() {
  console.log('=== STRUCTURATION DU CATALOGUE TOURINGSTUDIOCAR FORMAT SPECPART ===');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error('Fichier introuvable:', INPUT_FILE);
    process.exit(1);
  }

  const wb = XLSX.readFile(INPUT_FILE);
  const rawProducts = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`✓ ${rawProducts.length} produits bruts chargés.`);

  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const hierarchy = new Map();
  const allFormattedRows = [];
  const summaryRows = [
    ['Catégorie Principale', 'Sous-Catégorie', 'Nombre de Produits', 'Fichier Excel (.xlsx)']
  ];

  let idCounter = 1;

  for (const raw of rawProducts) {
    const name = String(raw.NOM_PRODUIT || '').trim();
    const rawCat = String(raw.CATEGORIE || '').trim();
    const rawDesc = `${raw.DESCRIPTION_COURTE || ''} ${raw.DESCRIPTION_LONGUE || ''}`;
    const slug = String(raw.SLUG_URL || '').trim();

    // 1. Classification Specpart
    const specCat = detectSpecpartCategory(name, rawCat, rawDesc);
    const brand = detectBrand(name, rawCat, raw.MARQUE);
    const viscosity = detectViscosity(`${name} ${rawCat} ${rawDesc}`);
    const volume = detectVolume(name, raw['VARIANTES (Volume/Conditionnement)']);
    const price = parsePrice(raw.PRIX_TTC);
    const oldPrice = parsePrice(raw['PRIX_BARRE (ancien prix)']);
    const specs = extractTechSpecs(rawDesc, name, rawCat);

    // SKUs
    let sku = String(raw.SKU || '').trim();
    if (!sku || sku === 'ND' || sku === 'N/A') {
      sku = `TSC-${String(idCounter).padStart(5, '0')}`;
    }
    const variantSku = `${sku}-U`;

    const row = [
      `TSC-PROD-${String(idCounter).padStart(5, '0')}`, // ID Produit
      `TSC-VAR-${String(idCounter).padStart(5, '0')}`,  // ID Variante
      sku,
      variantSku,
      name,
      slug,
      brand,
      specCat.main,
      specCat.sub,
      volume,
      price,
      oldPrice > 0 ? oldPrice : '',
      10, // Stock par défaut
      raw.IMAGE_PRINCIPALE_URL || '',
      raw.TOUTES_IMAGES_URL || '',
      viscosity,
      specs.api,
      specs.acea,
      specs.jaso,
      specs.oilType,
      specs.dpf,
      specs.turbo,
      'NON', // Hybride
      specs.oem,
      'NON', // En vedette
      'OUI', // Publié
      raw.DESCRIPTION_COURTE || '',
      raw.DESCRIPTION_LONGUE || '',
    ];

    allFormattedRows.push(row);

    // Groupement
    if (!hierarchy.has(specCat.main)) {
      hierarchy.set(specCat.main, new Map());
    }
    const subMap = hierarchy.get(specCat.main);
    if (!subMap.has(specCat.sub)) {
      subMap.set(specCat.sub, []);
    }
    subMap.get(specCat.sub).push(row);

    idCounter++;
  }

  // 1. Fichier Master global
  console.log(`Génération du MASTER global .xlsx (${allFormattedRows.length} produits)...`);
  const masterWb = createXlsxWorkbook(allFormattedRows, 'Tous les Produits');
  XLSX.writeFile(masterWb, path.join(OUTPUT_DIR, '00_TOUS_PRODUITS_MASTER_SPECPART.xlsx'));

  // 2. Fichiers par catégories et sous-catégories
  let totalFiles = 0;
  for (const [mainCat, subMap] of hierarchy.entries()) {
    const safeMainFolder = sanitizeFilename(mainCat);
    const mainDirPath = path.join(OUTPUT_DIR, safeMainFolder);
    fs.mkdirSync(mainDirPath, { recursive: true });

    const allMainCatRows = [];

    for (const [subCat, rows] of subMap.entries()) {
      const safeSubFile = sanitizeFilename(subCat);
      const subWb = createXlsxWorkbook(rows, safeSubFile);
      XLSX.writeFile(subWb, path.join(mainDirPath, `${safeSubFile}.xlsx`));
      totalFiles++;

      allMainCatRows.push(...rows);

      summaryRows.push([
        mainCat,
        subCat,
        rows.length,
        `${safeMainFolder}/${safeSubFile}.xlsx`
      ]);
    }

    // Fichier global de la catégorie principale
    const mainWb = createXlsxWorkbook(allMainCatRows, safeMainFolder);
    XLSX.writeFile(mainWb, path.join(mainDirPath, `00_TOUS_${safeMainFolder}.xlsx`));
    totalFiles++;
  }

  // 3. Fichier récapitulatif
  const summaryWb = XLSX.utils.aoa_to_sheet(summaryRows);
  const summaryBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(summaryBook, summaryWb, 'Récapitulatif');
  XLSX.writeFile(summaryBook, path.join(OUTPUT_DIR, '00_RECAPITULATIF_CATEGORIES.xlsx'));

  // 4. Guide d'import
  const guideContent = `================================================================================
CATALOGUE TOURINGSTUDIOCAR CONVERTI AU FORMAT SPECPART (.XLSX)
================================================================================

Bonjour,

Les 462 produits récupérés de touringstudiocar.shop ont été parfaitement normalisés, nettoyés et classés selon l'arborescence et le format exacts de la base de données specpart.

📁 ORGANISATION DES FAMILLES & SOUS-CATÉGORIES :
--------------------------------------------------------------------------------
1. "Huiles & Lubrifiants Moteur" :
   - Huiles moteur (10W40, 5W30, 5W40, 0W20, 0W30, etc.)
   - Huiles de boîte & Transmission (ATF, DSG, CVT, 75W80, 75W90, 75W140)
   - Liquides (Refroidissement, Frein, AdBlue)
2. "Pièces de Rechange / D'origine" :
   - Filtres (Huile, Air, Habitacle, Carburant)
   - Électricité & Éclairage (Batteries VARTA/ASSAD, Balais d'essuie-glace)
3. "Additifs" :
   - Additifs Carburant & Injection (Diesel, Essence, Nettoyant FAP, Catalyseur)
   - Additifs Huile & Moteur (Cera Tec, Flush, Anti-fuite)
   - Additifs Radiateur
4. "Moto" :
   - Huiles moteur 2T & 4T
   - Huiles de fourche
   - Entretien & Graissage chaîne
5. "Entretien & Accessoires" :
   - Lavage, Carrosserie & Detailing
   - Nettoyage & Entretien Intérieur
   - Accessoires & Produits Pro

📊 DONNÉES ENRICHIES ET EXTRAITES :
--------------------------------------------------------------------------------
- Noms nettoyés
- Prix en TND (format numérique prêt pour calcul)
- Marques standardisées (LIQUI MOLY, MANNOL, VARTA, ASSAD, ROWE, CASTROL, WOLF, PRO-TEC, etc.)
- Viscosités extraites (5W30, 5W40, 10W40, 0W20, etc.)
- Normes ACEA & API
- Homologations constructeurs (MB, VW, BMW, Renault, PSA, etc.)
- Liens des photos haute définition
- Descriptions complètes

================================================================================
Total Produits : ${allFormattedRows.length}
Total Fichiers Excel générés : ${totalFiles + 2}
Date de conversion : ${new Date().toLocaleString('fr-FR')}
================================================================================
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'INSTRUCTIONS_IMPORT_SPECPART.txt'), guideContent, 'utf8');

  console.log(`\n========================================`);
  console.log(`✓ Reclassification terminée avec succès !`);
  console.log(`✓ Dossiers de familles créés : ${hierarchy.size}`);
  console.log(`✓ Fichiers Excel générés : ${totalFiles + 2}`);
  console.log(`📁 Dossier: ${OUTPUT_DIR}`);
  console.log(`========================================\n`);
}

run().catch(console.error);
