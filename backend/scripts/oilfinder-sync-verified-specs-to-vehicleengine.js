/**
 * Points VehicleEngine rows at the researched spec where one exists.
 *
 * getEngines() falls back to VehicleEngine for any model the catalogue does not
 * hold, and most motorcycles and outboards are exactly that — they were seeded
 * straight into the database and never entered the catalogue. The fallback wins,
 * and the matching OilFinderVehicle row is then deduplicated away on engine
 * code, so the researched spec never reaches the customer.
 *
 * That is not cosmetic for these categories. A Honda CB500F was being served
 * 0W-20 "Asian OEM Modern Hybrid / Fuel Economy" — a car oil, carrying the
 * friction modifiers that make a wet clutch slip — while its own row held the
 * correct 10W-30 JASO MA2.
 *
 * Matched on make + model + engine code. Only rows whose spec actually differs
 * are touched, and the researched row always wins, because it is the one with a
 * cited source.
 *
 * Runs read-only unless --apply is passed.
 */
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATEGORIES = ['moto', 'marine', 'agricole'];
// Widening this to poids-lourd is not safe: it would pull a Mercedes OM615 down
// from MB 229.51 to a generic 229.5 and a 1960s DAF from 20W-50 to 5W-40, because
// for trucks the catalogue is often the better source. Vehicles outside the three
// categories are named individually instead.
const ALSO = [{ make: 'PIAGGIO', model: 'M500' }];

const up = (v) => String(v || '').toUpperCase().trim();

async function main() {
  const prisma = new PrismaClient();

  const verified = await prisma.oilFinderVehicle.findMany({
    where: {
      OR: [
        { category: { in: CATEGORIES } },
        ...ALSO.map((a) => ({
          make: { equals: a.make, mode: 'insensitive' },
          model: { equals: a.model, mode: 'insensitive' },
        })),
      ],
    },
    select: { make: true, model: true, engineCode: true, category: true, oilSpecId: true, oilSpec: true },
  });
  const byKey = new Map();
  for (const v of verified) {
    if (!v.engineCode) continue;
    byKey.set(`${up(v.make)}|${up(v.model)}|${up(v.engineCode)}`, v);
  }

  const engines = await prisma.vehicleEngine.findMany({
    select: {
      id: true, engineCode: true, oilSpecId: true, oilSpec: true,
      generation: { select: { model: { select: { name: true, make: { select: { name: true } } } } } },
    },
  });

  const changes = [];
  for (const e of engines) {
    if (!e.engineCode) continue;
    const make = e.generation?.model?.make?.name;
    const model = e.generation?.model?.name;
    const hit = byKey.get(`${up(make)}|${up(model)}|${up(e.engineCode)}`);
    if (!hit || hit.oilSpecId === e.oilSpecId) continue;
    changes.push({
      id: e.id, category: hit.category, make, model, engineCode: e.engineCode,
      from: e.oilSpec ? `${e.oilSpec.viscosity} ${e.oilSpec.oemApproval || ''}`.trim() : '(none)',
      to: `${hit.oilSpec.viscosity} ${hit.oilSpec.jasoStandard ? 'JASO ' + hit.oilSpec.jasoStandard + ' ' : ''}${hit.oilSpec.oemApproval || ''}`.trim(),
      oilSpecId: hit.oilSpecId,
    });
  }

  const byCat = new Map();
  for (const c of changes) byCat.set(c.category, (byCat.get(c.category) || 0) + 1);
  console.log(`VehicleEngine rows ${APPLY ? 'repointed' : 'to repoint'}: ${changes.length}`);
  [...byCat.entries()].sort().forEach(([k, v]) => console.log(`   ${String(v).padStart(4)}  ${k}`));
  console.log('\n--- sample ---');
  changes.slice(0, 12).forEach((c) =>
    console.log(`   ${c.make} ${c.model} [${c.engineCode}]\n        ${c.from}\n     -> ${c.to}`));

  if (!APPLY) { console.log('\nNothing written. Re-run with --apply.'); await prisma.$disconnect(); return; }
  for (const c of changes) {
    await prisma.vehicleEngine.update({ where: { id: c.id }, data: { oilSpecId: c.oilSpecId } });
  }
  console.log(`\nUpdated ${changes.length} row(s).`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
