/**
 * Moves diesels off a petrol-only OEM approval and onto its diesel counterpart.
 *
 * The fuel-type corrections left a tail: 260 engines that are now correctly
 * marked diesel still carry an approval that only exists for a petrol engine,
 * because the approval was assigned while the row said petrol. Two approvals
 * account for all of them, and each has an exact diesel counterpart published
 * by the same manufacturer at the same viscosity and the same ACEA class, so
 * this is a substitution rather than a judgement:
 *
 *   Fiat 9.55535-S2  (5W-40, ACEA C3, petrol)  ->  9.55535-S3  (5W-40, ACEA C3, diesel)
 *   GM dexos1        (petrol)                  ->  dexos2      (diesel, low-SAPS)
 *
 * Note what is deliberately NOT touched. "VW 501.01/505.00" and
 * "VW 502.00/505.01" look like petrol specs from the first number, but 505.00
 * and 505.01 are VW's diesel and Pumpe-Duse diesel specifications — an oil
 * carrying both is exactly what an older VW diesel wants, and 449 rows would
 * have been broken by a rule that matched on "VW 50x" alone.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/petrol-approval-swap-snapshot-${Date.now()}.json`;

const SWAPS = [
  { from: /9\.55535[\s-]?S2/i, to: 'Fiat 9.55535-S3' },
  { from: /dexos\s*1(\s*Gen\s*\d)?/i, to: 'GM dexos2' },
];

const swapFor = (approval) => {
  if (!approval) return undefined;
  const hit = SWAPS.find((s) => s.from.test(approval));
  return hit ? hit.to : undefined;
};

const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`]
    .map(slugify).join('_');

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { catalog: [], oilFinderVehicles: [], vehicleEngines: [] };
  const counts = new Map();

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          if (e.fuelType !== 'diesel') continue;
          const to = swapFor(e.oilSpec?.oemApproval);
          if (!to) continue;
          const k = `${e.oilSpec.oemApproval} -> ${to}`;
          counts.set(k, (counts.get(k) || 0) + 1);
          snapshot.catalog.push({
            make: mk.makeName, model: md.modelName, generation: gen.genName,
            engineCode: e.engineCode, was: e.oilSpec.oemApproval,
          });
          if (APPLY) e.oilSpec = { ...e.oilSpec, oemApproval: to };
        }
      }
    }
  }

  const ofvRows = (await prisma.oilFinderVehicle.findMany({ include: { oilSpec: true } }))
    .map((r) => ({ r, to: r.fuelType === 'diesel' ? swapFor(r.oilSpec?.oemApproval) : undefined }))
    .filter(({ to }) => to);
  const veRows = (await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  })).map((r) => ({ r, to: r.fuelType === 'diesel' ? swapFor(r.oilSpec?.oemApproval) : undefined }))
    .filter(({ to }) => to);

  for (const [k, n] of [...counts].sort((a, b) => b[1] - a[1])) {
    console.log(`${String(n).padStart(5)}  ${k}`);
  }
  console.log(`\ncatalogue: ${snapshot.catalog.length} moteurs`);
  console.log(`base: ${ofvRows.length} OilFinderVehicle, ${veRows.length} VehicleEngine`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  const specIdByFingerprint = new Map();
  const resolveSpecId = async (spec, make) => {
    const fp = fingerprint(spec, make);
    let id = specIdByFingerprint.get(fp);
    if (!id) {
      const existing = await prisma.oilFinderOilSpec.findFirst({ where: { fingerprint: fp } });
      const row = existing ?? (await prisma.oilFinderOilSpec.create({
        data: {
          viscosity: spec.viscosity, apiStandard: spec.apiStandard, aceaStandard: spec.aceaStandard,
          oemApproval: spec.oemApproval, jasoStandard: spec.jasoStandard,
          capacityLiters: spec.capacityLiters, changeIntervalKm: spec.changeIntervalKm,
          fingerprint: fp,
        },
      }));
      id = row.id;
      specIdByFingerprint.set(fp, id);
    }
    return id;
  };

  for (const { r, to } of ofvRows) {
    snapshot.oilFinderVehicles.push({ id: r.id, make: r.make, engineCode: r.engineCode, was: r.oilSpec.oemApproval });
    const specId = await resolveSpecId({ ...r.oilSpec, oemApproval: to }, r.make.toUpperCase());
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { oilSpecId: specId } });
  }
  for (const { r, to } of veRows) {
    const make = (r.generation?.model?.make?.name || '').toUpperCase();
    snapshot.vehicleEngines.push({ id: r.id, engineCode: r.engineCode, was: r.oilSpec.oemApproval });
    const specId = await resolveSpecId({ ...r.oilSpec, oemApproval: to }, make);
    await prisma.vehicleEngine.update({ where: { id: r.id }, data: { oilSpecId: specId } });
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
