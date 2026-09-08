/**
 * One-off fix: the initial oil-filter import (import-oil-filters.ts) dumped the entire
 * CSV "Description détaillée" into Product.description as-is, including embedded
 * technical dimensions (Hauteur, Diamètre, Filetage...) and, for 10 rows, raw
 * scraped OEM-reference + vehicle-application tables that never made it into
 * compatibleVehiclesNote/oemReferences at all.
 *
 * This reads product-content-fix.json (produced locally by a Python extraction
 * pass over the source CSV) and, matching by SKU, updates each product's
 * description / technicalCharacteristics / compatibleVehiclesNote / oemReferences.
 *
 * Usage:
 *   npx tsx scripts/fix-oil-filter-content.ts            # dry-run report
 *   npx tsx scripts/fix-oil-filter-content.ts --apply     # write changes
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const JSON_PATH = path.join(path.dirname(__filename), 'product-content-fix.json');

const prisma = new PrismaClient();

interface Entry {
  description: string;
  technicalCharacteristics: string | null;
  compatibleVehiclesNote?: string;
  oemReferences?: { brand: string; reference: string }[];
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write)'}`);
  const data: Record<string, Entry> = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  const skus = Object.keys(data);
  console.log(`Loaded ${skus.length} SKU entries from ${JSON_PATH}`);

  let updated = 0;
  let notFound = 0;

  for (const sku of skus) {
    const entry = data[sku];
    const product = await prisma.product.findUnique({ where: { sku }, select: { id: true } });
    if (!product) {
      notFound++;
      console.warn(`  ⚠️  No product found for SKU: ${sku}`);
      continue;
    }

    console.log(`  ~ ${sku} | descLen=${entry.description.length} | tech=${entry.technicalCharacteristics ? 'yes' : 'no'} | compatOverride=${entry.compatibleVehiclesNote ? 'yes' : 'no'} | oemRefs=${entry.oemReferences?.length ?? 0}`);

    if (APPLY) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          description: entry.description,
          technicalCharacteristics: entry.technicalCharacteristics,
          ...(entry.compatibleVehiclesNote ? { compatibleVehiclesNote: entry.compatibleVehiclesNote } : {}),
        },
      });

      if (entry.oemReferences && entry.oemReferences.length > 0) {
        await prisma.productOemReference.deleteMany({ where: { productId: product.id } });
        await prisma.productOemReference.createMany({
          data: entry.oemReferences.map((r, idx) => ({
            productId: product.id,
            brand: r.brand,
            reference: r.reference,
            sortOrder: idx,
          })),
        });
      }
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
