/**
 * Diagnoses and fixes a duplicate RAV4 Hybrid (XA50, A25A-FXS) row.
 *
 * Root cause: add-missing-hybrid-vehicles.ts checked for an existing row with
 * `findFirst({ where: { make, model, generation, engineCode } })` using
 * make="Toyota". A pre-existing row used make="TOYOTA" (different casing),
 * so the case-sensitive check missed it and a duplicate was created. The
 * duplicate also picked up the wrong oil-spec (capacityLiters 3.6, which
 * actually belongs to the Yaris Hybrid) because its fingerprint
 * (viscosity+api+acea+oem, no capacity) collided with Yaris Hybrid's spec.
 *
 * This script is read-only by default. Pass --apply to write.
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/fix-rav4-hybrid-duplicate.ts             # diagnostic report
 *   npx tsx scripts/fix-rav4-hybrid-duplicate.ts --apply     # write the fix
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write)'}\n`);

  const rows = await prisma.oilFinderVehicle.findMany({
    where: {
      model: { equals: 'Rav 4', mode: 'insensitive' },
      engineCode: { equals: 'A25A-FXS', mode: 'insensitive' },
    },
    include: { oilSpec: true },
  });

  console.log(`Found ${rows.length} RAV4 / A25A-FXS row(s):\n`);
  for (const r of rows) {
    console.log(`  id=${r.id}`);
    console.log(`    make="${r.make}" model="${r.model}" generation="${r.generation}" fuelType=${r.fuelType}`);
    console.log(`    oilSpecId=${r.oilSpecId} viscosity=${r.oilSpec?.viscosity} api=${r.oilSpec?.apiStandard} oem=${r.oilSpec?.oemApproval} capacity=${r.oilSpec?.capacityLiters} fingerprint=${r.oilSpec?.fingerprint}`);
    console.log(`    source="${(r.source || '').slice(0, 90)}..."`);
    console.log('');
  }

  const duplicate = rows.find(
    (r) => r.make === 'Toyota' && r.fuelType === 'hybrid' && r.oilSpec?.fingerprint === '0w-16_generic_std_sp-gf-6b'
  );
  const canonical = rows.find((r) => r.id !== duplicate?.id);

  if (!duplicate || !canonical) {
    console.log('Could not unambiguously identify the duplicate/canonical pair — stopping without changes.');
    console.log('Inspect the rows above manually.');
    return;
  }

  console.log('--- Plan ---');
  console.log(`Canonical row to keep: ${canonical.id} (make="${canonical.make}")`);
  console.log(`Duplicate row to delete: ${duplicate.id} (make="${duplicate.make}")`);

  // How many other vehicles share the canonical row's oil spec? If it's
  // exclusively used by this RAV4 row, it's safe to set its capacity.
  const sharedCount = await prisma.oilFinderVehicle.count({ where: { oilSpecId: canonical.oilSpecId } });
  console.log(`Canonical oilSpec (${canonical.oilSpecId}) is referenced by ${sharedCount} vehicle row(s).`);

  const needsFuelTypeFix = canonical.fuelType !== 'hybrid';
  const needsCapacityFix = sharedCount === 1 && canonical.oilSpec?.capacityLiters == null;

  if (needsFuelTypeFix) console.log(`  -> will set fuelType 'essence' -> 'hybrid' on canonical row`);
  if (needsCapacityFix) console.log(`  -> will set capacityLiters -> 4.2 on canonical oilSpec (sourced: AMSOIL/OilType.net RAV4 A25A-FXS fitment pages, ~4.4 US quarts)`);
  else if (!needsCapacityFix && canonical.oilSpec?.capacityLiters == null) {
    console.log(`  -> NOT setting capacity: oilSpec is shared by ${sharedCount} other rows, would be unsafe to assume 4.2L for all of them. Skipping capacity fix — needs manual review.`);
  }

  // Also check: does the duplicate's shared spec (Yaris Hybrid's) still have
  // other legitimate users after we delete this RAV4 row? (informational only)
  if (duplicate) {
    const dupSpecUsers = await prisma.oilFinderVehicle.count({ where: { oilSpecId: duplicate.oilSpecId } });
    console.log(`Duplicate's oilSpec (${duplicate.oilSpecId}, shared w/ Yaris Hybrid) is used by ${dupSpecUsers} row(s) total — deleting the vehicle row only, not the spec.`);
  }

  if (APPLY) {
    await prisma.oilFinderVehicle.delete({ where: { id: duplicate.id } });
    console.log(`\nDeleted duplicate row ${duplicate.id}.`);

    const data: { fuelType?: string } = {};
    if (needsFuelTypeFix) data.fuelType = 'hybrid';
    if (Object.keys(data).length > 0) {
      await prisma.oilFinderVehicle.update({ where: { id: canonical.id }, data });
      console.log(`Updated canonical row ${canonical.id}: ${JSON.stringify(data)}`);
    }

    if (needsCapacityFix) {
      await prisma.oilFinderOilSpec.update({
        where: { id: canonical.oilSpecId! },
        data: { capacityLiters: 4.2 },
      });
      console.log(`Updated canonical oilSpec ${canonical.oilSpecId}: capacityLiters -> 4.2`);
    }

    console.log('\nAPPLIED.');
  } else {
    console.log('\nRe-run with --apply to write these changes.');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
