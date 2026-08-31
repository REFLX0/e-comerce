/**
 * Import script: CATALOGUE_TOURINGSTUDIOCAR_SPECPART
 * Run from backend/: npx ts-node -r tsconfig-paths/register prisma/import-catalogue.ts
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const CAT_SUBSLUG: Record<string, string> = {
  'Filtres (Filtres à huile)': 'filtres-huile',
  'Filtres (Filtres à air)': 'filtres-air',
  'Filtres (Filtres carburant)': 'filtres-carburant',
  'Filtres (Filtres habitacle)': 'filtres-habitacle',
  'Filtres': 'filtres',
  'Électricité & Éclairage (Batteries)': 'batteries',
  'Électricité & Éclairage (Essuie-glaces)': 'essuie-glaces',
  'Additifs Carburant & Injection': 'additifs-carburant',
  'Additifs Huile & Moteur': 'additifs-huile',
  'Lavage, Carrosserie & Detailing': 'lavage-carrosserie',
  'Nettoyage & Entretien Intérieur': 'nettoyage-interieur',
  'Produits divers & Maintenance': 'produits-divers',
  'Huiles de boîte & Transmission': 'huiles-boite-transmission',
  'Huiles moteur': 'huiles-moteur-auto',
  'Liquides (AdBlue)': 'adblue',
  'Liquides (Liquide de frein)': 'liquide-frein',
  'Liquides (Refroidissement & Antigel)': 'antigel-refroidissement',
  'Huiles moteur 2T & 4T': 'huiles-moto-2t-4t',
  'Entretien & Graissage chaîne': 'entretien-chaine',
  'Additifs moto': 'additifs-moto',
  'Huiles de fourche': 'huiles-fourche',
};

const VM_UPLOADS_DIR = '/srv/uploads/products';

function isPlaceholder(url: string): boolean {
  return !url || url.includes('studio-car-final');
}

function readMaster(xlsxPath: string): any[] {
  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws);
}

async function upsertCategory(nameFr: string, slug: string, parentId: string | null, sort: number) {
  return prisma.category.upsert({
    where: { slug },
    create: { nameFr, slug, parentId, sortOrder: sort },
    update: { nameFr, parentId, sortOrder: sort },
  });
}

async function upsertBrand(name: string) {
  const slug = slugify(name);
  return prisma.brand.upsert({
    where: { slug },
    create: { name, slug },
    update: { name },
  });
}

async function main() {
  const masterPath = path.resolve(
    __dirname,
    '../../catalogue_extracted/CATALOGUE_TOURINGSTUDIOCAR_SPECPART/00_TOUS_PRODUITS_MASTER_SPECPART.xlsx',
  );

  if (!fs.existsSync(masterPath)) {
    console.error('Master file not found:', masterPath);
    process.exit(1);
  }

  console.log('Reading master xlsx...');
  const raw = readMaster(masterPath);
  console.log(`Found ${raw.length} rows`);

  // 1. Upsert parent categories
  console.log('\nUpserting parent categories...');
  const parentCatMap: Record<string, string> = {};
  const parentEntries = [
    { name: "Pièces de Rechange / D'origine", slug: 'pieces-rechange', sort: 1 },
    { name: 'Huiles & Lubrifiants Moteur', slug: 'huiles-moteur', sort: 2 },
    { name: 'Additifs', slug: 'additifs', sort: 3 },
    { name: 'Moto', slug: 'moto', sort: 4 },
    { name: 'Entretien & Accessoires', slug: 'entretien-accessoires', sort: 5 },
  ];
  for (const p of parentEntries) {
    const cat = await upsertCategory(p.name, p.slug, null, p.sort);
    parentCatMap[p.name] = cat.id;
    console.log(`  [OK] ${p.name}`);
  }

  // 2. Collect unique subs from data
  const uniqueSubs = [...new Set(raw.map((r: any) => `${r['CATEGORIE_PRINCIPALE']}|${r['SOUS_CATEGORIE']}`))];
  console.log('\nUpserting sub-categories...');
  const subCatMap: Record<string, string> = {};
  let sort = 0;
  for (const key of uniqueSubs) {
    const [parent, sub] = key.split('|');
    const parentId = parentCatMap[parent];
    if (!parentId) continue;
    const slug = CAT_SUBSLUG[sub] || slugify(sub);
    const cat = await upsertCategory(sub, slug, parentId, ++sort);
    subCatMap[key] = cat.id;
    console.log(`  [OK] ${sub}`);
  }

  // 3. Upsert brands
  console.log('\nUpserting brands...');
  const brandMap: Record<string, string> = {};
  const uniqueBrands = [...new Set(raw.map((r: any) => String(r['MARQUE'] || '').trim()).filter(Boolean))];
  for (const b of uniqueBrands) {
    const brand = await upsertBrand(b);
    brandMap[b] = brand.id;
  }
  console.log(`  ${uniqueBrands.length} brands upserted`);

  // 4. Import products
  console.log('\nImporting products...');
  const imageCommands: string[] = [];
  let inserted = 0, updated = 0, skipped = 0;

  for (const r of raw) {
    const name = String(r['NOM_PRODUIT_FR'] || '').trim();
    const sku = String(r['SKU_PRODUIT'] || r['ID_PRODUIT (NE PAS MODIFIER)'] || '').trim();
    if (!name || !sku) { skipped++; continue; }

    const subKey = `${r['CATEGORIE_PRINCIPALE']}|${r['SOUS_CATEGORIE']}`;
    const categoryId = subCatMap[subKey] || null;
    const brandId = brandMap[String(r['MARQUE'] || '').trim()] || null;
    const skuVar = String(r['SKU_VARIANTE'] || r['ID_VARIANTE (NE PAS MODIFIER)'] || `${sku}-U`).trim();

    const slugBase = String(r['SLUG_PRODUIT'] || '').trim() || slugify(name + '-' + sku.slice(-5));

    // Image
    const rawImg = String(r['IMAGE_PRINCIPALE_URL'] || '').trim();
    let imageUrl: string | null = null;
    if (!isPlaceholder(rawImg)) {
      const ext = (rawImg.split('.').pop() || 'jpg').split('?')[0];
      const filename = `${slugBase}.${ext}`;
      imageUrl = `/uploads/products/${filename}`;
      imageCommands.push(`wget -q -O "${VM_UPLOADS_DIR}/${filename}" "${rawImg}" || true`);
    }

    // Specs
    const typeHuile = String(r['TYPE_HUILE (Synthèse/Semi-Synthèse/Minérale)'] || '').toLowerCase();
    const isFullySynth = typeHuile.includes('synth') && !typeHuile.includes('semi');
    const isSemiSynth = typeHuile.includes('semi');
    const isMinerale = typeHuile.includes('min');

    const volumes = String(r['CONDITIONNEMENT_VOLUME'] || '1 Pièce').split(',').map((v: string) => v.trim()).filter(Boolean);
    const description = String(r['DESCRIPTION_FR'] || r['DESCRIPTION_COURTE'] || name).trim();
    const price = parseFloat(r['PRIX_TTC_TND']) || 0;
    const stock = parseInt(r['STOCK_QUANTITE']) || 0;
    const isFeatured = String(r['EST_EN_VEDETTE (OUI/NON)'] || '') === 'OUI';
    const isPublished = String(r['STATUT_PUBLIE (OUI/NON)'] || 'OUI') !== 'NON';

    try {
      const existing = await prisma.product.findFirst({ where: { OR: [{ sku }, { slug: slugBase }] } });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: { nameFr: name, description, isFeatured, isPublished, brandId, categoryId },
        });
        updated++;
        continue;
      }

      const product = await prisma.product.create({
        data: {
          sku,
          nameFr: name,
          slug: slugBase,
          description,
          isFeatured,
          isPublished,
          brandId,
          categoryId,
        },
      });

      // Variants
      for (let i = 0; i < volumes.length; i++) {
        const vol = volumes[i];
        const sv = volumes.length === 1 ? skuVar : `${skuVar}-${i + 1}`;
        const existingVar = await prisma.productVariant.findUnique({ where: { skuVariant: sv } }).catch(() => null);
        if (!existingVar) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              volume: vol,
              price,
              stockQty: Math.max(1, Math.floor(stock / volumes.length)),
              skuVariant: sv,
            },
          });
        }
      }

      // Image
      if (imageUrl) {
        await prisma.productImage.create({
          data: { productId: product.id, url: imageUrl, altFr: name, isPrimary: true, sortOrder: 0 },
        });
      }

      // Specs
      const viscosite = r['VISCOSITE'] ? String(r['VISCOSITE']).trim() : null;
      const api = r['NORMES_API'] ? String(r['NORMES_API']).trim() : null;
      const acea = r['NORMES_ACEA'] ? String(r['NORMES_ACEA']).trim() : null;
      const jaso = r['NORMES_JASO'] ? String(r['NORMES_JASO']).trim() : null;
      const oem = r['HOMOLOGATIONS_OEM_CONSTRUCTEURS'] ? String(r['HOMOLOGATIONS_OEM_CONSTRUCTEURS']).trim() : null;
      const dpf = r['COMPATIBLE_FAP_DPF (OUI/NON)'] ? String(r['COMPATIBLE_FAP_DPF (OUI/NON)']) === 'OUI' : null;
      const turbo = r['COMPATIBLE_TURBO (OUI/NON)'] ? String(r['COMPATIBLE_TURBO (OUI/NON)']) === 'OUI' : null;
      const hybrid = r['COMPATIBLE_HYBRIDE (OUI/NON)'] ? String(r['COMPATIBLE_HYBRIDE (OUI/NON)']) === 'OUI' : null;

      if (viscosite || api || acea || oem || typeHuile) {
        await prisma.productSpecs.create({
          data: {
            productId: product.id,
            viscosity: viscosite,
            apiStandard: api,
            aeceaStandard: acea,
            jasoStandard: jaso,
            isFullySynth,
            isSemiSynth,
            isMinerale,
            DPFCompatible: dpf,
            TurboCompatible: turbo,
            HybridCompatible: hybrid,
            OEMApprovals: oem,
          },
        });
      }

      inserted++;
    } catch (err: any) {
      console.error(`  ERROR [${sku}]: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nDone: inserted=${inserted}, updated=${updated}, skipped=${skipped}`);

  // 5. Write image download script
  const scriptPath = path.resolve(__dirname, '../../download-product-images.sh');
  if (imageCommands.length > 0) {
    const content = `#!/bin/bash\nmkdir -p ${VM_UPLOADS_DIR}\necho "Downloading ${imageCommands.length} images..."\n${imageCommands.join('\n')}\necho "Done!"\n`;
    fs.writeFileSync(scriptPath, content, 'utf-8');
    console.log(`\nImage download script written to: download-product-images.sh`);
  } else {
    fs.writeFileSync(scriptPath, `#!/bin/bash\necho "All images are placeholders. Update IMAGE_PRINCIPALE_URL in the xlsx and re-import."\n`, 'utf-8');
    console.log('\nAll images are placeholders. No real URLs to download.');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
