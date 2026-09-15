/**
 * Fixes 16 products from the "Car Accessories" import (scripts/import-accessoires-auto.ts,
 * commit 528f0a8e) that were sorted under "Nettoyage & Entretien Intérieur"
 * (nettoyage-interieur) even though they're covers, not cleaning products:
 * seat covers (housse de siège), steering-wheel covers (couvre-volant), an
 * armrest cover, and a seat-cover + sun-shade combo pack.
 *
 * They belong under "Confort & Équipements Auto" (confort-equipements-auto)
 * instead, next to the wheel-bolt covers (couvre-boulons) already there.
 *
 * scripts/accessoires-auto-data.json has already been corrected for any
 * future run of import-accessoires-auto.ts. This script additionally fixes
 * rows that were already imported into a live database before the data file
 * was corrected — it is a no-op for any SKU not present yet.
 *
 * Usage (inside the backend container, same as the other catalog scripts):
 *   npx tsx scripts/fix-accessoires-housses-miscategorized.ts            # dry-run report
 *   npx tsx scripts/fix-accessoires-housses-miscategorized.ts --apply    # write
 */
import { PrismaClient } from '@prisma/client';

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient();

const SOURCE_SLUG = 'nettoyage-interieur';
const TARGET_SLUG = 'confort-equipements-auto';

const AFFECTED_SKUS = [
  'Housse-accoudoir',
  'Bamboo',
  '32915',
  'lmp32953',
  'INS7226',
  'Housse-Bois',
  'lmp33115',
  'lmp33066',
  'Summerpack2',
  '53255',
  'lmp33127',
  'lmp33068',
  'lmp32968',
  'lmp32966',
  'lmp32926',
  'bossdelux-similicuir-gris',
];

async function main() {
  console.log('============================================================================');
  console.log(' FIX: housses/couvre-volant mal classées sous "Nettoyage & Entretien Intérieur"');
  console.log(` Mode : ${APPLY ? 'APPLICATION REELLE' : 'SIMULATION (DRY-RUN)'}`);
  console.log('============================================================================\n');

  const target = await prisma.category.findUnique({ where: { slug: TARGET_SLUG } });
  if (!target) throw new Error(`Catégorie cible "${TARGET_SLUG}" introuvable. Rien à faire.`);

  const source = await prisma.category.findUnique({ where: { slug: SOURCE_SLUG } });
  if (!source) throw new Error(`Catégorie source "${SOURCE_SLUG}" introuvable. Rien à faire.`);

  const products = await prisma.product.findMany({
    where: { sku: { in: AFFECTED_SKUS } },
    select: { id: true, sku: true, nameFr: true, categoryId: true },
  });

  if (products.length === 0) {
    console.log('Aucun des SKUs concernés n\'existe encore en base — import pas encore appliqué. Rien à faire.');
    return;
  }

  const toMove = products.filter((p) => p.categoryId === source.id);
  const alreadyOk = products.filter((p) => p.categoryId === target.id);
  const elsewhere = products.filter((p) => p.categoryId !== source.id && p.categoryId !== target.id);

  console.log(`Trouvés : ${products.length}/${AFFECTED_SKUS.length} SKU(s) en base.`);
  console.log(`  - à déplacer (actuellement dans "${SOURCE_SLUG}") : ${toMove.length}`);
  toMove.forEach((p) => console.log(`      - ${p.sku} | ${p.nameFr}`));
  if (alreadyOk.length) console.log(`  - déjà dans "${TARGET_SLUG}" : ${alreadyOk.length}`);
  if (elsewhere.length) {
    console.log(`  - dans une autre catégorie (ignorés, à vérifier manuellement) : ${elsewhere.length}`);
    elsewhere.forEach((p) => console.log(`      - ${p.sku} | ${p.nameFr} | categoryId=${p.categoryId}`));
  }

  if (toMove.length === 0) {
    console.log('\nRien à déplacer.');
    return;
  }

  if (!APPLY) {
    console.log(`\nPlan : déplacer ${toMove.length} produit(s) vers "${TARGET_SLUG}".`);
    console.log('Simulation terminée. Aucun changement écrit. Relancez avec --apply pour exécuter.');
    return;
  }

  const result = await prisma.product.updateMany({
    where: { id: { in: toMove.map((p) => p.id) } },
    data: { categoryId: target.id },
  });
  console.log(`\n${result.count} produit(s) déplacé(s) vers "${TARGET_SLUG}".`);
  console.log('MIGRATION APPLIQUÉE AVEC SUCCÈS.');
}

main()
  .catch((e) => {
    console.error('FATAL:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
