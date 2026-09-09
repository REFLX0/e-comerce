/**
 * One-off fix: many oil-filter products carry the primary manufacturer's own
 * code as their SKU/description but ALSO mention a MISFAT-equivalent code in
 * their product name (e.g. "MANN HU7008Z MISFAT L120") — a genuine OEM
 * cross-reference that the initial CSV import never captured into
 * ProductOemReference, leaving the "Références Constructeur" tab empty for
 * these products while others (already dump-style-parsed) had it populated.
 * This closes that gap for the remaining SKU->MISFAT-code pairs, matched by
 * SKU against oem-crossref-fix.json (produced locally from the source CSV).
 *
 * Usage:
 *   npx tsx scripts/add-misfat-crossrefs.ts            # dry-run report
 *   npx tsx scripts/add-misfat-crossrefs.ts --apply     # write changes
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const JSON_PATH = path.join(path.dirname(__filename), 'oem-crossref-fix.json');

const prisma = new PrismaClient();

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write)'}`);
  const data: Record<string, { brand: string; reference: string }[]> = JSON.parse(
    fs.readFileSync(JSON_PATH, 'utf-8'),
  );
  const skus = Object.keys(data);
  console.log(`Loaded ${skus.length} SKU entries from ${JSON_PATH}`);

  let updated = 0;
  let notFound = 0;
  let alreadyHadRefs = 0;

  for (const sku of skus) {
    const refs = data[sku];
    const product = await prisma.product.findUnique({
      where: { sku },
      select: { id: true, oemReferences: { select: { id: true } } },
    });
    if (!product) {
      notFound++;
      console.warn(`  ⚠️  No product found for SKU: ${sku}`);
      continue;
    }
    if (product.oemReferences.length > 0) {
      alreadyHadRefs++;
      console.log(`  ⚡ ${sku} already has ${product.oemReferences.length} oemReferences, skipping`);
      continue;
    }

    console.log(`  + ${sku} -> ${refs.map((r) => `${r.brand} ${r.reference}`).join(', ')}`);

    if (APPLY) {
      await prisma.productOemReference.createMany({
        data: refs.map((r, idx) => ({
          productId: product.id,
          brand: r.brand,
          reference: r.reference,
          sortOrder: idx,
        })),
      });
    }
    updated++;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Entries processed: ${updated}`);
  console.log(`  Already had refs:  ${alreadyHadRefs}`);
  console.log(`  Not found:         ${notFound}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
