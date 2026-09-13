/**
 * Stops offering engine oil to cars that have no engine.
 *
 * The purge of the fabricated seed removed the battery-electric models it had
 * invented — the BYDs, the Teslas — and later passes caught the Citroen
 * Berlingo Electric, the Renault Master Z.E. and the Mitsubishi i-MiEV. These
 * ten were missed because they arrived by a different route: most carry the
 * "Moteur Standard" placeholder, which is what the harvest writes when it finds
 * no engine code, and a placeholder then received a generated viscosity like
 * any other row.
 *
 * The result is a Jaguar I-Pace offered 0W-20 and a Hyundai Nexo — a hydrogen
 * fuel-cell car — offered 5W-30, each as the only choice on the page. Nothing
 * about that is recoverable by choosing a better oil: these cars have no sump.
 *
 * One row that looks like the same thing is deliberately kept. The BMW i3 has
 * two entries, IB1P25B and W20K06A, and the second is the 647 cc range-extender
 * generator of the i3 REx. It is a real petrol engine with a real oil change,
 * so it stays exactly as it is.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/electric-no-engine-snapshot-${Date.now()}.json`;

/** make -> model patterns with no combustion engine at all. */
const NO_ENGINE = [
  { make: 'CITROËN', model: /^e-?mehari$/i },
  { make: 'JAGUAR', model: /^i-?pace$/i },
  { make: 'OPEL', model: /^ampera-?e$/i },
  { make: 'HYUNDAI', model: /^nexo$/i },
  { make: 'RENAULT', model: /^twizy$/i },
  { make: 'STREETSCOOTER', model: /^compact$/i },
  { make: 'GERMAN E-CARS', model: /^(cetos|plantos|stromos)/i },
];

/**
 * The i3's range extender. A 647 cc petrol generator with its own oil change,
 * so the i3 is not listed above and this code is never touched.
 */
const KEEP = /^W20K06A$/i;

const matches = (make, model) => NO_ENGINE.some(
  (n) => String(make).toUpperCase() === n.make && n.model.test(String(model).trim()),
);

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { catalog: [], oilFinderVehicles: [], vehicleEngines: [] };
  const touched = [];

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      if (!matches(mk.makeName, md.modelName)) continue;
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          if (KEEP.test(String(e.engineCode || '').trim())) continue;
          if (e.fuelType === 'electrique' && !e.oilSpec) continue;
          touched.push(`${mk.makeName} / ${md.modelName} / ${e.engineCode} : ${e.fuelType} ${e.oilSpec?.viscosity ?? '-'}`);
          snapshot.catalog.push({
            make: mk.makeName, model: md.modelName, generation: gen.genName,
            engineCode: e.engineCode, was: { fuelType: e.fuelType, oilSpec: e.oilSpec },
          });
          if (APPLY) {
            e.fuelType = 'electrique';
            delete e.oilSpec;
          }
        }
      }
    }
  }

  touched.forEach((t) => console.log('  ' + t));
  console.log(`\ncatalogue : ${snapshot.catalog.length} motorisation(s)`);

  const ofv = (await prisma.oilFinderVehicle.findMany())
    .filter((r) => matches(r.make, r.model) && !KEEP.test(String(r.engineCode || '').trim())
      && r.fuelType !== 'electrique');
  const ve = (await prisma.vehicleEngine.findMany({
    include: { generation: { include: { model: { include: { make: true } } } } },
  })).filter((r) => matches(r.generation?.model?.make?.name, r.generation?.model?.name)
    && !KEEP.test(String(r.engineCode || '').trim()) && r.fuelType !== 'electrique');
  console.log(`base      : ${ofv.length} OilFinderVehicle, ${ve.length} VehicleEngine`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  for (const r of ofv) {
    snapshot.oilFinderVehicles.push({ id: r.id, make: r.make, model: r.model, was: r.fuelType });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { fuelType: 'electrique' } });
  }
  for (const r of ve) {
    snapshot.vehicleEngines.push({ id: r.id, engineCode: r.engineCode, was: r.fuelType, wasSpec: r.oilSpecId });
    // VehicleEngine allows a null spec, so the oil can be removed outright here.
    await prisma.vehicleEngine.update({
      where: { id: r.id }, data: { fuelType: 'electrique', oilSpecId: null },
    });
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur : /app n est pas persistant)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
