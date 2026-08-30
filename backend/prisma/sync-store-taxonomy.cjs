// backend/prisma/sync-store-taxonomy.cjs
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

async function main() {
  console.log('=== SYNC STORE TAXONOMY MIGRATION ===');
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}\n`);

  const allCategories = await prisma.category.findMany();
  const bySlug = new Map(allCategories.map((c) => [c.slug, c]));

  const productCountBefore = await prisma.product.count();
  const categoryCountBefore = await prisma.category.count();
  console.log(`Total Products Before: ${productCountBefore}`);
  console.log(`Total Categories Before: ${categoryCountBefore}\n`);

  const autoRoot = bySlug.get('automobile');
  const piecesRoot = bySlug.get('auto-pieces-rechange');
  const motoRoot = bySlug.get('moto-karting');
  const marineRoot = bySlug.get('marine');
  const oldKartingRoot = bySlug.get('karting');

  if (!autoRoot) throw new Error('Missing category: automobile');
  if (!piecesRoot) throw new Error('Missing category: auto-pieces-rechange');
  if (!motoRoot) throw new Error('Missing category: moto-karting');
  if (!marineRoot) throw new Error('Missing category: marine');

  const updates = [
    // 1. Root categories
    {
      slug: 'automobile',
      data: { parentId: null, sortOrder: 1, nameFr: 'Automobile' },
      note: 'Root category 1: Automobile',
    },
    {
      slug: 'auto-pieces-rechange',
      data: { parentId: null, sortOrder: 2, nameFr: "Pièces de Rechange / D'origine" },
      note: "Root category 2: Pièces de Rechange / D'origine (promoted to root)",
    },
    {
      slug: 'moto-karting',
      data: { parentId: null, sortOrder: 3, nameFr: 'Moto & Karting' },
      note: 'Root category 3: Moto & Karting',
    },
    {
      slug: 'marine',
      data: { parentId: null, sortOrder: 4, nameFr: 'Marine' },
      note: 'Root category 4: Marine',
    },

    // 2. Automobile children
    {
      slug: 'huiles-moteur',
      data: { parentId: autoRoot.id, sortOrder: 1, nameFr: 'Huile moteur' },
      note: 'Reparent huiles-moteur -> automobile',
    },
    {
      slug: 'liquide-de-frein',
      data: { parentId: autoRoot.id, sortOrder: 2, nameFr: 'Liquide de frein' },
      note: 'Reparent liquide-de-frein -> automobile',
    },
    {
      slug: 'direction-assistee',
      data: { parentId: autoRoot.id, sortOrder: 3, nameFr: 'Liquide de direction' },
      note: 'Reparent direction-assistee -> automobile',
    },
    {
      slug: 'huile-de-boite',
      data: { parentId: autoRoot.id, sortOrder: 4, nameFr: 'Huile de boîte' },
      note: 'Reparent huile-de-boite -> automobile',
    },
    {
      slug: 'additifs',
      data: { parentId: autoRoot.id, sortOrder: 5, nameFr: 'Additifs' },
      note: 'Reparent additifs -> automobile',
    },
    {
      slug: 'entretien-auto',
      data: { parentId: autoRoot.id, sortOrder: 6, nameFr: "Produits d'entretien" },
      note: 'Reparent entretien-auto -> automobile',
    },

    // 3. Pièces de rechange children
    {
      slug: 'auto-filtres',
      data: { parentId: piecesRoot.id, sortOrder: 1, nameFr: 'Filtres' },
      note: 'Child of auto-pieces-rechange',
    },
    {
      slug: 'auto-freinage',
      data: { parentId: piecesRoot.id, sortOrder: 2, nameFr: 'Freinage' },
      note: 'Child of auto-pieces-rechange',
    },
    {
      slug: 'auto-moteur-distribution',
      data: { parentId: piecesRoot.id, sortOrder: 3, nameFr: 'Moteur & Distribution' },
      note: 'Child of auto-pieces-rechange',
    },
    {
      slug: 'transmission',
      data: { parentId: piecesRoot.id, sortOrder: 4, nameFr: 'Boîte de Vitesse' },
      note: 'Child of auto-pieces-rechange',
    },
    {
      slug: 'auto-suspension-direction',
      data: { parentId: piecesRoot.id, sortOrder: 5, nameFr: 'Suspension & Direction' },
      note: 'Child of auto-pieces-rechange',
    },
    {
      slug: 'auto-refroidissement-climatisation',
      data: { parentId: piecesRoot.id, sortOrder: 6, nameFr: 'Refroidissement & Climatisation' },
      note: 'Child of auto-pieces-rechange',
    },
    {
      slug: 'auto-electricite-eclairage',
      data: { parentId: piecesRoot.id, sortOrder: 7, nameFr: 'Électricité & Éclairage' },
      note: 'Child of auto-pieces-rechange',
    },
    {
      slug: 'auto-carrosserie-habitacle',
      data: { parentId: piecesRoot.id, sortOrder: 8, nameFr: 'Carrosserie & Habitacle' },
      note: 'Child of auto-pieces-rechange',
    },
    {
      slug: 'auto-echappement',
      data: { parentId: piecesRoot.id, sortOrder: 9, nameFr: 'Échappement' },
      note: 'Child of auto-pieces-rechange',
    },
    {
      slug: 'auto-autres-pieces',
      data: { parentId: piecesRoot.id, sortOrder: 10, nameFr: 'Autres pièces auto' },
      note: 'Child of auto-pieces-rechange',
    },

    // 4. Moto & Karting children
    {
      slug: 'moto-pieces-consommables',
      data: { parentId: motoRoot.id, sortOrder: 1, nameFr: 'Pièces & Consommables' },
      note: 'Child of moto-karting',
    },
    {
      slug: 'moto-equipements-entretien',
      data: { parentId: motoRoot.id, sortOrder: 2, nameFr: 'Équipements & Entretien' },
      note: 'Child of moto-karting',
    },
    {
      slug: 'karting-pieces-consommables',
      data: { parentId: motoRoot.id, sortOrder: 3, nameFr: 'Karting' },
      note: 'Reparent karting-pieces-consommables -> moto-karting',
    },

    // 5. Marine children
    {
      slug: 'marine-huiles-lubrifiants',
      data: { parentId: marineRoot.id, sortOrder: 1, nameFr: 'Huiles & Lubrifiants Marine' },
      note: 'Child of marine',
    },
    {
      slug: 'marine-entretien-accessoires',
      data: { parentId: marineRoot.id, sortOrder: 2, nameFr: 'Entretien & Accessoires' },
      note: 'Child of marine',
    },
  ];

  for (const u of updates) {
    const existing = bySlug.get(u.slug);
    if (!existing) {
      console.warn(`  ⚠️ Category not found for slug: ${u.slug}`);
    } else {
      console.log(`  ✓ Plan: ${u.slug} -> parent: ${u.data.parentId === null ? 'ROOT' : u.data.parentId || '(keep)'}, sort: ${u.data.sortOrder}, name: ${u.data.nameFr} (${u.note})`);
    }
  }

  if (!APPLY) {
    console.log('\nDry run complete. Re-run with --apply to execute.');
    return;
  }

  // Execute in transaction
  await prisma.$transaction(async (tx) => {
    // 1. Move products away from intermediate wrappers if needed
    const autoHuiles = bySlug.get('auto-huiles-lubrifiants');
    const huilesMoteur = bySlug.get('huiles-moteur');
    if (autoHuiles && huilesMoteur) {
      const movedFromAutoHuiles = await tx.product.updateMany({
        where: { categoryId: autoHuiles.id },
        data: { categoryId: huilesMoteur.id },
      });
      if (movedFromAutoHuiles.count > 0) {
        console.log(`  Moved ${movedFromAutoHuiles.count} products from auto-huiles-lubrifiants -> huiles-moteur`);
      }
    }

    const liquidesAuto = bySlug.get('liquides-auto');
    const liquideDirection = bySlug.get('direction-assistee');
    if (liquidesAuto && liquideDirection) {
      const movedFromLiquides = await tx.product.updateMany({
        where: { categoryId: liquidesAuto.id },
        data: { categoryId: liquideDirection.id },
      });
      if (movedFromLiquides.count > 0) {
        console.log(`  Moved ${movedFromLiquides.count} products from liquides-auto -> direction-assistee`);
      }
    }

    // If old root 'karting' exists and has products, move to 'karting-pieces-consommables'
    const kartingConsommables = bySlug.get('karting-pieces-consommables');
    if (oldKartingRoot && kartingConsommables && oldKartingRoot.id !== kartingConsommables.id) {
      await tx.product.updateMany({
        where: { categoryId: oldKartingRoot.id },
        data: { categoryId: kartingConsommables.id },
      });
      await tx.category.updateMany({
        where: { parentId: oldKartingRoot.id },
        data: { parentId: kartingConsommables.id },
      });
      await tx.category.delete({
        where: { id: oldKartingRoot.id },
      });
      console.log(`  Merged old root 'karting' into 'karting-pieces-consommables'`);
    }

    // Reparent & remove intermediate wrappers
    if (autoHuiles) {
      await tx.category.updateMany({
        where: { parentId: autoHuiles.id },
        data: { parentId: autoRoot.id },
      });
      await tx.category.delete({ where: { id: autoHuiles.id } });
      console.log(`  Deleted intermediate wrapper: auto-huiles-lubrifiants`);
    }

    if (liquidesAuto) {
      await tx.category.updateMany({
        where: { parentId: liquidesAuto.id },
        data: { parentId: autoRoot.id },
      });
      await tx.category.delete({ where: { id: liquidesAuto.id } });
      console.log(`  Deleted intermediate wrapper: liquides-auto`);
    }

    // Apply all category updates
    for (const u of updates) {
      const existing = await tx.category.findUnique({ where: { slug: u.slug } });
      if (existing) {
        await tx.category.update({
          where: { slug: u.slug },
          data: u.data,
        });
      }
    }
  }, { timeout: 60000 });

  // Post-migration verification
  const productCountAfter = await prisma.product.count();
  const rootsAfter = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  });

  console.log('\n=== POST-MIGRATION VERIFICATION ===');
  console.log(`Product count before: ${productCountBefore}, after: ${productCountAfter}`);
  if (productCountBefore !== productCountAfter) {
    throw new Error(`CRITICAL: Product count mismatch! Before: ${productCountBefore}, After: ${productCountAfter}`);
  }
  console.log('✓ Product count preserved (100% matched).\n');

  console.log(`Roots (${rootsAfter.length}):`);
  rootsAfter.forEach((r, idx) => {
    console.log(`  ${idx + 1}. [${r.slug}] ${r.nameFr} (sort: ${r.sortOrder}) -> ${r.children.length} sub-categories`);
    r.children.forEach((c) => {
      console.log(`     - [${c.slug}] ${c.nameFr} (sort: ${c.sortOrder})${c.children.length > 0 ? ` [${c.children.length} sub]` : ''}`);
      c.children.forEach((sub) => {
        console.log(`        * [${sub.slug}] ${sub.nameFr}`);
      });
    });
  });

  console.log('\n✅ MIGRATION SUCCESSFULLY APPLIED!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
