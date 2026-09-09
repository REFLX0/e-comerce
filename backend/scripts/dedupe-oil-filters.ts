/**
 * One-off cleanup: the 161-product oil-filter CSV import created duplicate
 * listings for a handful of filters that already existed in the catalog
 * pre-import (same physical filter, differently-formatted SKU, e.g. old
 * "HU 7008 z" vs new "HU7008Z"). This removes the duplication:
 *
 *  - SIMPLE_DUPLICATE_OLD_IDS: old listings with zero orders/reviews/wishlist
 *    references are just deleted outright (the new import's listing, which
 *    has better images/description/specs/compat data, is kept as-is).
 *
 *  - MERGE_PAIRS: old listings that DO have order history can't be deleted
 *    (OrderItem.productId has no cascade). For these the old product record
 *    is kept (preserving its id/order history) but updated in place with the
 *    new listing's better sku/slug/name/description/technicalCharacteristics/
 *    compatibleVehiclesNote/brandId/images/oemReferences, then the newly
 *    imported duplicate row is deleted.
 *
 * Usage:
 *   npx tsx scripts/dedupe-oil-filters.ts            # dry-run report
 *   npx tsx scripts/dedupe-oil-filters.ts --apply     # write changes
 */
import { PrismaClient } from '@prisma/client';

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient();

const SIMPLE_DUPLICATE_OLD_IDS = [
  'b7ce17f5-0c33-4afa-ad3d-d502bdcde845', // HU 7008 z
  'c30dd6ad-3666-4ed6-bade-81ec686b11d7', // MANN-FILTER - (HU 815/2 x) Filtre à huile
  '45b31746-a729-4af1-a348-5fdb42f50308', // MANN-FILTER - HU 7008z
  '45e588f6-8b84-4b9f-a353-f73d12e23a8c', // MANN-FILTER - HU 710 x
  'a7b89ff9-5988-48d0-9f4d-b9b911b40c31', // MANN-FILTER W 712/94 (WV)
  'b5c96f1e-afa7-4ad2-89eb-16cf8940335d', // MISFAT - Z646 Filtre à huile vw
  '74d08a0e-dac1-4ee1-b0f1-51c6149a02f2', // MISFAT Filtre à huile - L064A
  'b197487b-0625-4589-adbc-40feb9cbfe6f', // MISFAT- Z413 FILTRE A HUILE FORD ECOBOOST
  '0d051d49-6514-4d86-8af2-b1aef617cab1', // w 712/95
];

const MERGE_PAIRS = [
  { oldId: '272b8394-6fe4-438d-b4a5-92b49ae754b0', newId: 'cmttawbrc008crmf98v5isi1f' }, // Z692
  { oldId: '71c94547-c372-4d9f-893e-cebd0dbc5d99', newId: 'cmttawb7h001rrmf9i2rks3fy' }, // Z438
];

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write)'}`);

  console.log(`\n=== Simple duplicates to delete (${SIMPLE_DUPLICATE_OLD_IDS.length}) ===`);
  for (const id of SIMPLE_DUPLICATE_OLD_IDS) {
    const p = await prisma.product.findUnique({ where: { id }, select: { sku: true, nameFr: true } });
    if (!p) { console.warn(`  ⚠️  not found: ${id}`); continue; }
    const orderCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderCount > 0) {
      console.warn(`  ⚠️  SAFETY ABORT: ${p.sku} has ${orderCount} orders, skipping delete`);
      continue;
    }
    console.log(`  - DELETE ${p.sku} (${p.nameFr})`);
    if (APPLY) {
      await prisma.product.delete({ where: { id } });
    }
  }

  console.log(`\n=== Merge pairs (${MERGE_PAIRS.length}) ===`);
  for (const { oldId, newId } of MERGE_PAIRS) {
    const oldP = await prisma.product.findUnique({ where: { id: oldId } });
    const newP = await prisma.product.findUnique({
      where: { id: newId },
      include: { images: { orderBy: { sortOrder: 'asc' } }, oemReferences: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!oldP || !newP) { console.warn(`  ⚠️  pair not found: ${oldId} / ${newId}`); continue; }

    const newOrderCount = await prisma.orderItem.count({ where: { productId: newId } });
    if (newOrderCount > 0) {
      console.warn(`  ⚠️  SAFETY ABORT: new duplicate ${newP.sku} unexpectedly has ${newOrderCount} orders, skipping merge`);
      continue;
    }

    console.log(`  ~ MERGE ${newP.sku} data into kept product ${oldP.sku} (id=${oldId}, has order history)`);
    console.log(`      sku: ${oldP.sku} -> ${newP.sku}`);
    console.log(`      slug: ${oldP.slug} -> ${newP.slug}`);
    console.log(`      images: ${newP.images.length}, oemReferences: ${newP.oemReferences.length}`);

    if (APPLY) {
      await prisma.$transaction(async (tx) => {
        // Delete the new duplicate row first to free up its unique sku/slug.
        await tx.product.delete({ where: { id: newId } });

        await tx.product.update({
          where: { id: oldId },
          data: {
            sku: newP.sku,
            slug: newP.slug,
            nameFr: newP.nameFr,
            description: newP.description,
            shortDescription: newP.shortDescription,
            technicalCharacteristics: newP.technicalCharacteristics,
            compatibleVehiclesNote: newP.compatibleVehiclesNote,
            brandId: newP.brandId,
          },
        });

        await tx.productImage.deleteMany({ where: { productId: oldId } });
        if (newP.images.length > 0) {
          await tx.productImage.createMany({
            data: newP.images.map((img, idx) => ({
              productId: oldId,
              url: img.url,
              isPrimary: idx === 0,
              sortOrder: idx,
            })),
          });
        }

        await tx.productOemReference.deleteMany({ where: { productId: oldId } });
        if (newP.oemReferences.length > 0) {
          await tx.productOemReference.createMany({
            data: newP.oemReferences.map((r, idx) => ({
              productId: oldId,
              brand: r.brand,
              reference: r.reference,
              sortOrder: idx,
            })),
          });
        }
      });
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'} — re-run with --apply to write these changes.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
