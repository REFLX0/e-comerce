/**
 * Corrects diesel engines recorded as petrol.
 *
 * The oil spec attached to each engine was generated from its fuelType, so a
 * diesel tagged "essence" carries a petrol spec as well as a petrol label — a
 * Hilux 2GD-FTV owner was being sent to petrol oil. Manufacturer nomenclature
 * identifies these unambiguously (Toyota -FTV/-TV, PSA/Ford TDCi JTDA/JTDB,
 * VW TDI, and so on), so the fuelType is recoverable from the engine code.
 *
 * Fixes the label only. Re-deriving the spec is the separate per-engine-code
 * work; this at least stops the wrong fuel being displayed.
 *
 * Runs read-only unless --apply is passed.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/fuel-type-fix-snapshot-${Date.now()}.json`;

/**
 * Engine-code patterns that only ever denote a diesel. Deliberately narrow:
 * a false positive here would send a petrol car to diesel oil.
 */
const DIESEL_CODE = [
  /-FTV$/i,        // Toyota D-4D family: 1CD-FTV, 1KD-FTV, 2AD-FTV, 2GD-FTV...
  /-TV$/i,         // Toyota 1ND-TV, 3WZ-TV
  /\bD-?4D\b/i,    // Toyota marketing name
  /\bTDCI?\b/i,    // Ford
  /^JTD[A-Z]$/i,   // Ford 1.6 TDCi build codes (PSA DV6)
  /\bCDTI\b/i,     // Opel
  /\bTDI\b/i,      // VW group
  /\bHDI\b/i,      // PSA
  /\bBLUEHDI\b/i,
  /\bDCI\b/i,      // Renault
  /\bCRDI\b/i,     // Hyundai/Kia
  /\bJTD\b/i,      // Fiat
  /\bM-?JET\b/i,
  /\bMULTIJET\b/i,
  /\bDDIS\b/i,     // Suzuki
  /\bDTI\b/i,      // Isuzu/Opel
];

const isDiesel = (code) => !!code && DIESEL_CODE.some((r) => r.test(code.trim()));

async function main() {
  const prisma = new PrismaClient();
  const changes = { catalog: [], db: [] };

  // --- catalogue file ---
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  for (const makeNode of Object.values(catalog)) {
    for (const modelNode of Object.values(makeNode.models || {})) {
      for (const genNode of Object.values(modelNode.generations || {})) {
        for (const eng of genNode.engines || []) {
          if (isDiesel(eng.engineCode) && eng.fuelType !== 'diesel') {
            changes.catalog.push({
              make: makeNode.makeName, model: modelNode.modelName,
              generation: genNode.genName, engineCode: eng.engineCode,
              from: eng.fuelType, to: 'diesel',
            });
            if (APPLY) eng.fuelType = 'diesel';
          }
        }
      }
    }
  }

  // --- database ---
  const rows = await prisma.oilFinderVehicle.findMany({
    select: { id: true, make: true, model: true, engineCode: true, fuelType: true },
  });
  for (const r of rows) {
    if (isDiesel(r.engineCode) && r.fuelType !== 'diesel') {
      changes.db.push({ ...r, from: r.fuelType, to: 'diesel' });
    }
  }

  console.log(`=== ${APPLY ? 'APPLYING' : 'DRY RUN'} ===\n`);
  console.log(`Catalogue engines to relabel: ${changes.catalog.length}`);
  for (const c of changes.catalog) {
    console.log(`  ${c.make} ${c.model} / ${c.engineCode} (${c.from} -> diesel)`);
  }
  console.log(`\nOilFinderVehicle rows to relabel: ${changes.db.length}`);
  for (const c of changes.db) {
    console.log(`  ${c.make} ${c.model} / ${c.engineCode} (${c.from} -> diesel)`);
  }

  if (!APPLY) {
    console.log('\nNothing written. Re-run with --apply.');
    await prisma.$disconnect();
    return;
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(changes, null, 2));
  console.log(`\nSnapshot written to ${SNAPSHOT}`);

  if (changes.db.length > 0) {
    const ids = changes.db.map((c) => c.id);
    let updated = 0;
    for (let i = 0; i < ids.length; i += 500) {
      const res = await prisma.oilFinderVehicle.updateMany({
        where: { id: { in: ids.slice(i, i + 500) } },
        data: { fuelType: 'diesel' },
      });
      updated += res.count;
    }
    console.log(`Database rows updated: ${updated}`);
  }

  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`Catalogue file rewritten: ${CATALOG}`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
