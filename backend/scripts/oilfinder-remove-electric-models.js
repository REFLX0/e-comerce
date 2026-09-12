/**
 * Removes battery-electric models from the oil finder.
 *
 * The fabricated OEM-homologation seed gave every BYD model the same four
 * petrol engines, including the Atto 3, Dolphin, Han and Seal, which are
 * battery-electric and have no engine oil at all. Purging the seeded rows left
 * the models themselves behind — the seed had also created the VehicleMake ->
 * VehicleModel -> VehicleGeneration chain, and those empty models were then
 * carried into the catalogue, so the brand still offered cars that cannot take
 * an oil change.
 *
 * Listing them is worse than omitting them: a customer who picks one is told
 * "Moteur standard" and sold oil for a car with no engine.
 *
 * Runs read-only unless --apply is passed. Snapshots what it deletes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/electric-models-snapshot-${Date.now()}.json`;

/** make -> model names that are battery-electric only. */
const ELECTRIC = {
  BYD: ['ATTO', 'ATTO 3', 'DOLPHIN', 'HAN', 'SEAL', 'SEAL U', 'DOLPHIN MINI', 'YUAN', 'E2', 'E3', 'E6'],
  MG: ['MG ZS EV', 'ZS EV', 'MG4', 'MG4 EV', 'MARVEL R', 'MG5 EV'],
  NISSAN: ['Leaf'],
  RENAULT: ['Zoe'],
  // Tesla's L1S and L2S "engines" are drive units; the catalogue had them on a
  // petrol spec.
  // The catalogue holds Tesla's whole range under one model literally named
  // "Model", with L1S/L2S drive units on a petrol spec.
  TESLA: ['Model', 'Model S', 'Model 3', 'Model X', 'Model Y', 'Roadster'],
};

const slug = (t) => String(t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function main() {
  const prisma = new PrismaClient();
  const snapshot = { vehicleModels: [], oilFinderVehicles: [], catalogueModels: [] };
  let dbModels = 0, ofv = 0, catModels = 0;

  for (const [make, models] of Object.entries(ELECTRIC)) {
    for (const name of models) {
      const found = await prisma.vehicleModel.findMany({
        where: {
          name: { equals: name, mode: 'insensitive' },
          make: { name: { equals: make, mode: 'insensitive' } },
        },
        include: { generations: { include: { engines: true } } },
      });
      for (const m of found) {
        snapshot.vehicleModels.push(m);
        dbModels++;
        console.log(`  VehicleModel ${make} / ${m.name} (${m.generations.length} generation(s))`);
        if (APPLY) {
          for (const g of m.generations) {
            await prisma.vehicleEngine.deleteMany({ where: { generationId: g.id } });
          }
          await prisma.vehicleGeneration.deleteMany({ where: { modelId: m.id } });
          await prisma.vehicleModel.delete({ where: { id: m.id } });
        }
      }

      const rows = await prisma.oilFinderVehicle.findMany({
        where: {
          make: { equals: make, mode: 'insensitive' },
          model: { equals: name, mode: 'insensitive' },
        },
      });
      if (rows.length) {
        snapshot.oilFinderVehicles.push(...rows);
        ofv += rows.length;
        console.log(`  OilFinderVehicle ${make} / ${name}: ${rows.length} row(s)`);
        if (APPLY) {
          await prisma.oilFinderVehicle.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
        }
      }
    }
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  for (const [make, models] of Object.entries(ELECTRIC)) {
    const key = Object.keys(catalog).find(
      (k) => String(catalog[k]?.makeName || '').toUpperCase() === make.toUpperCase(),
    );
    if (!key) continue;
    for (const name of models) {
      const mSlug = slug(name);
      const hit = Object.keys(catalog[key].models || {}).find(
        (k) => k === mSlug || slug(catalog[key].models[k]?.modelName) === mSlug,
      );
      if (!hit) continue;
      snapshot.catalogueModels.push({ make, model: catalog[key].models[hit] });
      catModels++;
      console.log(`  catalogue ${make} / ${catalog[key].models[hit].modelName}`);
      if (APPLY) delete catalog[key].models[hit];
    }
  }

  console.log(`\n${APPLY ? 'REMOVED' : 'WOULD REMOVE'}: ${dbModels} VehicleModel, ${ofv} OilFinderVehicle, ${catModels} catalogue model(s)`);

  if (!APPLY) {
    console.log('Nothing written. Re-run with --apply.');
    await prisma.$disconnect();
    return;
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 2));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`Snapshot -> ${SNAPSHOT}`);
  console.log(`Catalogue file rewritten: ${CATALOG}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
