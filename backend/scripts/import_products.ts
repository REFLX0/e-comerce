import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('Reading scraped_products.json...');
  const data = fs.readFileSync('scraped_products.json', 'utf8');
  const products = JSON.parse(data);

  console.log(`Loaded ${products.length} products. Inserting into database...`);

  let defaultCategory = await prisma.category.findFirst({ where: { slug: 'automobile' } });
  if (!defaultCategory) {
    defaultCategory = await prisma.category.findFirst();
  }

  let newCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`[${i+1}/${products.length}] Checking: ${product.name}`);
    
    const existingByName = await prisma.product.findFirst({ where: { nameFr: product.name } });
    if (existingByName) {
      console.log(`  -> Skipping: Product name already exists.`);
      continue;
    }

    const existingBySku = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (existingBySku) {
      console.log(`  -> Skipping: SKU ${product.sku} already exists.`);
      continue;
    }

    const baseSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    try {
      const createdProduct = await prisma.product.create({
        data: {
          nameFr: product.name,
          slug: finalSlug,
          sku: product.sku,
          description: product.description || '',
          brandId: product.brandId,
          categoryId: defaultCategory!.id,
          isPublished: true,
          images: {
            create: product.image ? [
              {
                url: product.image,
                isPrimary: true,
              }
            ] : []
          },
          variants: {
            create: [
              {
                skuVariant: `${product.sku}-V1`,
                price: product.priceVal || 0,
                volume: '1L',
                stockQty: 10,
                imageUrl: product.image || null
              }
            ]
          }
        }
      });
      console.log(`  -> Created product: ${createdProduct.nameFr}`);
      newCount++;
    } catch (err) {
      console.error(`  -> Error creating product ${product.name}:`, err);
    }
  }

  console.log(`\nFinished! Successfully inserted ${newCount} new products into the database.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
