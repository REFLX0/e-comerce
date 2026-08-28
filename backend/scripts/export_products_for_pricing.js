const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportProducts() {
  console.log('Fetching products and variants from database...');

  const products = await prisma.product.findMany({
    include: {
      brand: true,
      category: {
        include: { parent: true },
      },
      variants: {
        orderBy: { price: 'asc' },
      },
      specs: true,
    },
    orderBy: { nameFr: 'asc' },
  });

  console.log(`Loaded ${products.length} products.`);

  // ─── 1. Generate Full CSV ──────────────────────────────────────────────────
  const csvRows = [
    ['ID', 'SKU', 'Nom Produit', 'Marque', 'Catégorie', 'Conditionnement / Volume', 'Prix Actuel (TND)', 'Stock', 'Viscosite', 'OEM Normes'].map(v => `"${v}"`).join(','),
  ];

  const flatList = [];

  for (const p of products) {
    const brandName = p.brand?.name || '';
    const catName = p.category ? (p.category.parent ? `${p.category.parent.nameFr} > ${p.category.nameFr}` : p.category.nameFr) : '';
    const viscosity = p.specs?.viscosity || '';
    const oem = p.specs?.OEMApprovals || '';

    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        csvRows.push([
          p.id,
          v.skuVariant || p.sku,
          p.nameFr,
          brandName,
          catName,
          v.volume,
          v.price.toFixed(3),
          v.stockQty,
          viscosity,
          oem,
        ].map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','));

        flatList.push({
          sku: v.skuVariant || p.sku,
          name: p.nameFr,
          brand: brandName,
          category: catName,
          volume: v.volume,
          priceTND: v.price,
          viscosity,
        });
      }
    } else {
      csvRows.push([
        p.id,
        p.sku,
        p.nameFr,
        brandName,
        catName,
        '1 Pièce',
        '0.000',
        '0',
        viscosity,
        oem,
      ].map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','));

      flatList.push({
        sku: p.sku,
        name: p.nameFr,
        brand: brandName,
        category: catName,
        volume: '1 Pièce',
        priceTND: 0,
        viscosity,
      });
    }
  }

  const outputCsvPath = path.join(process.cwd(), 'products_price_check.csv');
  fs.writeFileSync(outputCsvPath, '\uFEFF' + csvRows.join('\n'), 'utf8');
  console.log(`Saved full CSV to: ${outputCsvPath} (${csvRows.length - 1} rows)`);

  // ─── 2. Generate Formatted Markdown Extract for Perplexity Copy-Paste ──────
  // Pick representative items across brands & categories (Lubricants, Brakes, Filters, Maintenance)
  const sampleItems = flatList.slice(0, 100);

  let mdContent = `# Échantillon Catalogue Produits pour Vérification des Prix (Marché Tunisien / TND)\n\n`;
  mdContent += `> Copiez-collez ce tableau dans Perplexity avec le prompt ci-dessous pour vérifier si nos prix en Dinars Tunisiens (TND) sont cohérents avec le marché tunisien des pièces automobiles et lubrifiants.\n\n`;
  mdContent += `## 📋 Prompt suggéré pour Perplexity :\n`;
  mdContent += `\`\`\`text\n`;
  mdContent += `Voici une liste de pièces de rechange et huiles moteur vendues sur un site e-commerce automobile en Tunisie avec leurs prix en Dinars Tunisiens (TND).\n`;
  mdContent += `Pour chaque article, analyse si le prix (en TND) est réaliste, compétitif ou s'il semble surévalué / sous-évalué par rapport aux prix du marché tunisien (grossistes, distributeurs officiels, stations et magasins de pièces détachées en Tunisie).\n`;
  mdContent += `Donne tes remarques et le prix moyen estimé constaté en Tunisie.\n`;
  mdContent += `\`\`\`\n\n`;
  mdContent += `## 📦 Tableau des Produits & Prix :\n\n`;
  mdContent += `| Réf SKU | Nom du Produit | Marque | Conditionnement | Prix Catalogue (TND) |\n`;
  mdContent += `| :--- | :--- | :--- | :--- | :--- |\n`;

  for (const item of sampleItems) {
    mdContent += `| \`${item.sku}\` | ${item.name} | ${item.brand} | ${item.volume} | **${item.priceTND.toFixed(3)} TND** |\n`;
  }

  const outputMdPath = path.join(process.cwd(), 'perplexity_price_check_sample.md');
  fs.writeFileSync(outputMdPath, mdContent, 'utf8');
  console.log(`Saved Perplexity Markdown prompt & table to: ${outputMdPath}`);

  // ─── 3. Generate JSON summary by category ──────────────────────────────────
  const categorySummary = {};
  for (const item of flatList) {
    const c = item.category || 'Autres';
    if (!categorySummary[c]) categorySummary[c] = [];
    if (categorySummary[c].length < 15) {
      categorySummary[c].push({
        sku: item.sku,
        name: item.name,
        brand: item.brand,
        volume: item.volume,
        priceTND: item.priceTND,
      });
    }
  }

  const outputJsonPath = path.join(process.cwd(), 'products_by_category_sample.json');
  fs.writeFileSync(outputJsonPath, JSON.stringify(categorySummary, null, 2), 'utf8');
  console.log(`Saved category JSON sample to: ${outputJsonPath}`);

  await prisma.$disconnect();
}

exportProducts().catch(console.error);
