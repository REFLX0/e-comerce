/**
 * One-off (but safe to re-run) maintenance script: merges OilFinderOilSpec rows
 * that carry identical (viscosity, oemApproval, aceaStandard, apiStandard) but
 * ended up as separate DB rows -- this happens whenever different fingerprint
 * formulas/versions (tecdoc-catalog-harvester.ts vs import-oilfinder.ts vs any
 * one-off patch script) compute a different `fingerprint` for what's really the
 * same spec. Keeps whichever duplicate has the most existing references as
 * canonical, repoints every VehicleEngine/OilFinderVehicle row pointing at a
 * duplicate, then deletes the now-unreferenced duplicates.
 *
 * Usage:
 *   npx tsx scripts/consolidate-duplicate-oilspecs.ts            # dry-run report
 *   npx tsx scripts/consolidate-duplicate-oilspecs.ts --apply    # write changes
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write)'}`);

  const allSpecs = await prisma.oilFinderOilSpec.findMany({
    include: {
      _count: { select: { vehicleEngines: true, vehicles: true } },
    },
  });

  const groups = new Map<string, typeof allSpecs>();
  for (const s of allSpecs) {
    const key = [
      s.viscosity || '',
      s.oemApproval || '',
      s.aceaStandard || '',
      s.apiStandard || '',
    ].join('|||');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  let groupsToMerge = 0;
  let rowsMerged = 0;
  let enginesRepointed = 0;
  let vehiclesRepointed = 0;
  let specsDeleted = 0;

  for (const [key, rows] of groups) {
    if (rows.length <= 1) continue;
    groupsToMerge++;

    // Canonical = the row with the most existing references (least repointing, least disruption).
    const canonical = rows.reduce((best, r) => {
      const bestRefs = (best as any)._count.vehicleEngines + (best as any)._count.vehicles;
      const rRefs = (r as any)._count.vehicleEngines + (r as any)._count.vehicles;
      return rRefs > bestRefs ? r : best;
    }, rows[0]);

    const duplicates = rows.filter((r) => r.id !== canonical.id);
    const totalDupRefs = duplicates.reduce(
      (sum, r) => sum + (r as any)._count.vehicleEngines + (r as any)._count.vehicles,
      0
    );
    rowsMerged += duplicates.length;

    console.log(
      `${key.replace(/\|\|\|/g, ' / ')} -- ${rows.length} rows, keeping ${canonical.id} (${(canonical as any)._count.vehicleEngines + (canonical as any)._count.vehicles} refs), merging ${duplicates.length} dupes (${totalDupRefs} refs)`
    );

    if (APPLY) {
      for (const dup of duplicates) {
        const engUpdate = await prisma.vehicleEngine.updateMany({
          where: { oilSpecId: dup.id },
          data: { oilSpecId: canonical.id },
        });
        const vehUpdate = await prisma.oilFinderVehicle.updateMany({
          where: { oilSpecId: dup.id },
          data: { oilSpecId: canonical.id },
        });
        enginesRepointed += engUpdate.count;
        vehiclesRepointed += vehUpdate.count;
        await prisma.oilFinderOilSpec.delete({ where: { id: dup.id } });
        specsDeleted++;
      }
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Duplicate groups found:     ${groupsToMerge}`);
  console.log(`  Duplicate spec rows:        ${rowsMerged}`);
  if (APPLY) {
    console.log(`  VehicleEngine rows repointed:   ${enginesRepointed}`);
    console.log(`  OilFinderVehicle rows repointed: ${vehiclesRepointed}`);
    console.log(`  Spec rows deleted:          ${specsDeleted}`);
  } else {
    console.log('\nRe-run with --apply to write these changes.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
