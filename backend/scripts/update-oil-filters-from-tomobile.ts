/**
 * One-off enrichment: applies authoritative compatibleVehiclesNote /
 * technicalCharacteristics / oemReferences scraped directly from the source
 * site's structured product-detail sections (tml-seo-compat, tml-pdet-specs,
 * tml-pdet-oe) — matched per-product by SKU search rather than by guessing
 * the destination-site slug, which is what the original CSV export used and
 * doesn't correspond to the source site's real URLs.
 *
 * This supersedes the earlier regex-extracted-from-description data for any
 * SKU present in the input JSON; SKUs not present here (the source page
 * couldn't be reliably located) are left untouched.
 *
 * Usage:
 *   npx tsx scripts/update-oil-filters-from-tomobile.ts            # dry-run
 *   npx tsx scripts/update-oil-filters-from-tomobile.ts --apply     # write
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const JSON_PATH = path.join(path.dirname(__filename), 'tomobile-scraped-update.json');

const prisma = new PrismaClient();

interface Entry {
  compatibleVehiclesNote?: string;
  technicalCharacteristics?: string;
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

    console.log(
      `  ~ ${sku} | compat=${entry.compatibleVehiclesNote ? entry.compatibleVehiclesNote.split('\n').length + ' lines' : 'unchanged'} | ` +
      `tech=${entry.technicalCharacteristics ? 'yes' : 'unchanged'} | oemRefs=${entry.oemReferences?.length ?? 'unchanged'}`,
    );

    if (APPLY) {
      const updateData: any = {};
      if (entry.compatibleVehiclesNote) updateData.compatibleVehiclesNote = entry.compatibleVehiclesNote;
      if (entry.technicalCharacteristics) updateData.technicalCharacteristics = entry.technicalCharacteristics;

      if (Object.keys(updateData).length > 0) {
        await prisma.product.update({ where: { id: product.id }, data: updateData });
      }

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
