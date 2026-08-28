const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function generateTopCategoriesExport() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          products: {
            take: 12,
            include: {
              brand: true,
              variants: { orderBy: { price: 'asc' } },
            },
          },
        },
      },
      products: {
        take: 12,
        include: {
          brand: true,
          variants: { orderBy: { price: 'asc' } },
        },
      },
    },
  });

  let content = `# 🚗 Benchmark Prix Pièces & Huiles Automobile (Tunisie / TND)\n\n`;
  content += `> Ce document contient un échantillon représentatif de nos produits classés par catégorie avec leurs prix en **Dinars Tunisiens (TND)**.\n\n`;
  content += `### 💡 Prompt recommandé pour Perplexity AI :\n`;
  content += `\`\`\`text\n`;
  content += `Voici une liste de pièces de rechange et huiles moteur vendues sur un site e-commerce en Tunisie avec leurs prix en Dinars Tunisiens (TND).\n`;
  content += `Peux-tu analyser ces prix par rapport au marché tunisien actuel (grossistes, boutiques de pièces auto à Tunis/Sfax/Sousse, concessionnaires, stations-services) et me dire :\n`;
  content += `1. Si les prix sont réalistes et cohérents.\n`;
  content += `2. Quels articles sont très compétitifs ou au contraire surévalués/sous-évalués.\n`;
  content += `3. La fourchette de prix moyenne constatée en Tunisie pour ces références.\n`;
  content += `\`\`\`\n\n---\n\n`;

  for (const cat of categories) {
    const allProds = [
      ...cat.products,
      ...cat.children.flatMap(c => c.products),
    ].slice(0, 15);

    if (allProds.length === 0) continue;

    content += `## 📂 Catégorie : ${cat.nameFr}\n\n`;
    content += `| Référence SKU | Désignation du Produit | Marque | Format / Qté | Prix Catalogue (TND) |\n`;
    content += `| :--- | :--- | :--- | :--- | :--- |\n`;

    for (const p of allProds) {
      const v = p.variants[0] || { volume: '1 Pièce', price: 0, skuVariant: p.sku };
      content += `| \`${v.skuVariant || p.sku}\` | ${p.nameFr} | ${p.brand?.name || 'Standard'} | ${v.volume} | **${v.price.toFixed(3)} TND** |\n`;
    }
    content += `\n`;
  }

  const outPath = path.join(process.cwd(), 'products_by_category_perplexity.md');
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Saved top categories markdown to: ${outPath}`);

  await prisma.$disconnect();
}

generateTopCategoriesExport().catch(console.error);
