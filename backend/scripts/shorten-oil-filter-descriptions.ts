/**
 * One-off content cleanup: replaces the long (~3000 char) generic SEO-filler
 * descriptions on the 159 oil-filter products with short, factual, e-commerce
 * appropriate descriptions generated from the product's own structured data
 * (brand, compatible makes, filter type, filetage spec, vehicle count) — now
 * that technicalCharacteristics/compatibleVehiclesNote already carry the
 * detailed data in their own tabs, the long description was pure redundant
 * filler.
 *
 * Usage:
 *   npx tsx scripts/shorten-oil-filter-descriptions.ts            # dry-run
 *   npx tsx scripts/shorten-oil-filter-descriptions.ts --apply     # write
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const JSON_PATH = path.join(path.dirname(__filename), 'generated_descriptions.json');

const prisma = new PrismaClient();

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write)'}`);
  const data: Record<string, string> = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  const skus = Object.keys(data);
  console.log(`Loaded ${skus.length} SKU entries from ${JSON_PATH}`);

  let updated = 0;
  let notFound = 0;

  for (const sku of skus) {
    const newDesc = data[sku];
    const product = await prisma.product.findUnique({
      where: { sku },
      select: { id: true, description: true, shortDescription: true },
    });
    if (!product) {
      notFound++;
      console.warn(`  ⚠️  No product found for SKU: ${sku}`);
      continue;
    }

    const oldLen = product.description?.length ?? 0;
    console.log(`  ~ ${sku} | ${oldLen} -> ${newDesc.length} chars`);

    if (APPLY) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          description: newDesc,
          // shortDescription falls back to a slice of description if unset,
          // so clear it to let the new short description drive both.
          shortDescription: null,
        },
      });
    }
    updated++;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Entries processed: ${updated}`);
  console.log(`  Not found:         ${notFound}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
