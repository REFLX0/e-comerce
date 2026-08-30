const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

function sanitizeFilename(name) {
  return String(name || 'Non_Classe')
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

const HEADERS = [
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
  'STOCK_QUANTITE',
  'IMAGE_PRINCIPALE_URL',
  'TOUTES_IMAGES_URL',
  'IMAGE_VARIANTE_SPECIFIQUE_URL',
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
  'DATE_CREATION',
  'DESCRIPTION_FR'
];

function createXlsxWorkbook(dataRows, sheetName = 'Produits') {
  const wsData = [HEADERS, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-calculate column widths
  const colWidths = HEADERS.map((h, i) => {
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
  console.log('=== EXPORT TOTAL DU CATALOGUE 100% EXCEL (.XLSX) ===');
  const exportDir = path.join(process.cwd(), 'EXPORT_CATALOGUE_SPECPART');

  if (fs.existsSync(exportDir)) {
    fs.rmSync(exportDir, { recursive: true, force: true });
  }
  fs.mkdirSync(exportDir, { recursive: true });

  console.log('Lecture de tous les produits, variantes, images et spécifications depuis PostgreSQL...');
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      category: {
        include: { parent: true },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
      variants: {
        orderBy: { price: 'asc' },
      },
      specs: true,
    },
    orderBy: [
      { category: { parent: { nameFr: 'asc' } } },
      { category: { nameFr: 'asc' } },
      { nameFr: 'asc' },
    ],
  });

  console.log(`✓ Total produits en base: ${products.length}`);

  // Structure hiérarchique: ParentCat -> SubCat -> Rows
  const hierarchy = new Map();
  const allRawRows = [];
  const summaryRows = [
    ['Catégorie Principale', 'Sous-Catégorie', 'Nombre de Produits', 'Fichier Excel (.xlsx)']
  ];

  let totalVariants = 0;

  for (const p of products) {
    const mainCat = p.category?.parent ? p.category.parent.nameFr : (p.category?.nameFr || 'Autres Produits');
    const subCat = p.category?.parent ? p.category.nameFr : (p.category?.nameFr || 'Catalogue Général');

    if (!hierarchy.has(mainCat)) {
      hierarchy.set(mainCat, new Map());
    }
    const subMap = hierarchy.get(mainCat);
    if (!subMap.has(subCat)) {
      subMap.set(subCat, []);
    }

    const brandName = p.brand?.name || '';
    const primaryImg = p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url || '';
    const allImgs = (p.images?.map(i => i.url) || []).join(' | ');

    // Spécifications d'huile et techniques
    const viscosity = p.specs?.viscosity || '';
    const apiSpec = p.specs?.apiStandard || '';
    const aceaSpec = p.specs?.aeceaStandard || '';
    const jasoSpec = p.specs?.jasoStandard || '';
    const oilType = p.specs?.isFullySynth ? '100% Synthèse' : p.specs?.isSemiSynth ? 'Semi-Synthèse' : p.specs?.isMinerale ? 'Minérale' : '';
    const dpf = p.specs?.DPFCompatible === true ? 'OUI' : p.specs?.DPFCompatible === false ? 'NON' : '';
    const turbo = p.specs?.TurboCompatible === true ? 'OUI' : p.specs?.TurboCompatible === false ? 'NON' : '';
    const hybrid = p.specs?.HybridCompatible === true ? 'OUI' : p.specs?.HybridCompatible === false ? 'NON' : '';
    const oemSpec = p.specs?.OEMApprovals || '';

    const isFeatured = p.isFeatured ? 'OUI' : 'NON';
    const isPub = p.isPublished ? 'OUI' : 'NON';
    const createdAt = p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '';
    const desc = p.description || '';

    const variants = p.variants && p.variants.length > 0 ? p.variants : [{
      id: '',
      skuVariant: p.sku,
      volume: '1 Pièce',
      price: 0,
      stockQty: 0,
      imageUrl: null,
    }];

    for (const v of variants) {
      totalVariants++;
      const rawRow = [
        p.id,
        v.id || '',
        p.sku || '',
        v.skuVariant || p.sku || '',
        p.nameFr || '',
        p.slug || '',
        brandName,
        mainCat,
        subCat,
        v.volume || '1 Pièce',
        Number(v.price || 0),
        v.stockQty ?? 0,
        primaryImg,
        allImgs,
        v.imageUrl || '',
        viscosity,
        apiSpec,
        aceaSpec,
        jasoSpec,
        oilType,
        dpf,
        turbo,
        hybrid,
        oemSpec,
        isFeatured,
        isPub,
        createdAt,
        desc,
      ];

      allRawRows.push(rawRow);
      subMap.get(subCat).push(rawRow);
    }
  }

  // 1. Fichier Master .xlsx global
  console.log(`Génération du fichier MASTER .xlsx (${allRawRows.length} lignes)...`);
  const masterWb = createXlsxWorkbook(allRawRows, 'Tous les Produits');
  XLSX.writeFile(masterWb, path.join(exportDir, '00_TOUS_LES_PRODUITS_MASTER.xlsx'));
  console.log(`✓ 00_TOUS_LES_PRODUITS_MASTER.xlsx généré.`);

  // 2. Dossiers de catégories et fichiers sous-catégories .xlsx
  let totalFiles = 0;
  for (const [mainCat, subMap] of hierarchy.entries()) {
    const safeMainFolder = sanitizeFilename(mainCat);
    const mainDirPath = path.join(exportDir, safeMainFolder);
    fs.mkdirSync(mainDirPath, { recursive: true });

    const allMainCatRawRows = [];

    for (const [subCat, rows] of subMap.entries()) {
      const safeSubFile = sanitizeFilename(subCat);
      
      const subWb = createXlsxWorkbook(rows, safeSubFile);
      XLSX.writeFile(subWb, path.join(mainDirPath, `${safeSubFile}.xlsx`));
      totalFiles++;

      allMainCatRawRows.push(...rows);

      summaryRows.push([
        mainCat,
        subCat,
        rows.length,
        `${safeMainFolder}/${safeSubFile}.xlsx`
      ]);
    }

    // Fichier global de la famille
    const mainCatWb = createXlsxWorkbook(allMainCatRawRows, safeMainFolder);
    XLSX.writeFile(mainCatWb, path.join(mainDirPath, `00_TOUS_${safeMainFolder}.xlsx`));
    totalFiles++;
  }

  // 3. Récapitulatif
  const summaryWb = XLSX.utils.aoa_to_sheet(summaryRows);
  const summaryBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(summaryBook, summaryWb, 'Récapitulatif');
  XLSX.writeFile(summaryBook, path.join(exportDir, '00_RECAPITULATIF_CATEGORIES.xlsx'));

  // 4. Instructions
  const guideContent = `================================================================================
CATALOGUE PRODUITS SPECPART - FORMAT MICROSOFT EXCEL (.XLSX)
================================================================================

Bonjour,

Voici l'intégralité de la base de données produits exportée en fichiers Microsoft Excel (.xlsx) natifs.

📁 ORGANISATION DES DOSSIERS :
--------------------------------------------------------------------------------
1. "00_TOUS_LES_PRODUITS_MASTER.xlsx" :
   - Fichier global regroupant les ${products.length} produits du site avec toutes leurs variantes.
2. "00_RECAPITULATIF_CATEGORIES.xlsx" :
   - Tableau récapitulant toutes les familles et sous-catégories avec le nombre d'articles.
3. Dossiers par Famille de Produits (ex: "Pièces de Rechange", "Huiles & Lubrifiants Moteur", etc.) :
   - Chaque dossier contient un fichier Excel individuel pour chaque sous-catégorie (ex: "Filtres.xlsx", "Freinage.xlsx", "Moteur & Distribution.xlsx", "Suspension & Direction.xlsx", etc.).
   - Vous pouvez ouvrir n'importe quel fichier instantanément sans aucun blocage.

📝 CONSIGNES DE MODIFICATION :
--------------------------------------------------------------------------------
- "ID_PRODUIT" & "ID_VARIANTE" : ⚠️ NE PAS MODIFIER ces 2 colonnes (identifiants uniques de la base).
- "SKU_PRODUIT" & "SKU_VARIANTE" : Modifiable (références et codes articles).
- "NOM_PRODUIT_FR" : Modifiable (titre officiel du produit).
- "MARQUE" : Modifiable (nom de la marque).
- "PRIX_TTC_TND" : Modifiable (prix de vente exact affiché aux clients en Dinars Tunisiens).
- "STOCK_QUANTITE" : Modifiable (quantité en stock).
- "IMAGE_PRINCIPALE_URL" & "TOUTES_IMAGES_URL" : Modifiable (URLs des photos ou noms des fichiers images).
- "CONDITIONNEMENT_VOLUME" : Modifiable (ex: 1L, 4L, 5L, 208L, 1 Pièce).
- "VISCOSITE", "NORMES_API", "NORMES_ACEA", "OEM" : Modifiable (caractéristiques techniques).
- "STATUT_PUBLIE" : "OUI" pour afficher sur le site, "NON" pour masquer le produit.

💾 ENREGISTREMENT :
--------------------------------------------------------------------------------
- Faites simplement vos modifications dans Excel et sauvegardez (Ctrl+S).
- Renvoyez-nous les fichiers Excel et nous mettrons à jour votre catalogue automatiquement !

================================================================================
Total Produits : ${products.length}
Total Variantes : ${totalVariants}
Total Fichiers Excel créés : ${totalFiles + 2}
Date d'export : ${new Date().toLocaleString('fr-FR')}
================================================================================
`;

  fs.writeFileSync(path.join(exportDir, 'INSTRUCTIONS_MODIFICATION.txt'), guideContent, 'utf8');

  console.log(`\n========================================`);
  console.log(`✓ Export 100% Excel (.xlsx) terminé avec succès !`);
  console.log(`✓ Total dossiers de familles : ${hierarchy.size}`);
  console.log(`✓ Total fichiers Excel .xlsx créés : ${totalFiles + 2}`);
  console.log(`========================================\n`);
}

run()
  .catch((e) => {
    console.error('Erreur export:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
