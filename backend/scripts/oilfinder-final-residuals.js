/**
 * Three residuals a full invariant sweep turned up after everything else.
 *
 * 1. The heavy-goods category is spelled two ways. 43 models carry
 *    "poids_lourd" and 5 carry "poids-lourd" — the DFSK K01, the Renault
 *    Express and the three Great Wall pickups. normalizeCategory() in the
 *    service reads both, which is why filtering works and why this went
 *    unnoticed, but the data should say one thing. The underscore spelling
 *    wins on weight of numbers; no model changes category, only its spelling.
 *
 * 2. Four electric cars still carry an oil. They were relabelled electrique by
 *    an earlier pass that set the fuel type and left the spec behind — the
 *    Citroen C-Zero and Mitsubishi i (both the i-MiEV) and the Renault Master
 *    Z.E. under two model rows. A car with fuelType electrique showing 5W-30
 *    PSA B71 2290 is the same defect as before, just quieter.
 *
 * 3. The Mahindra 275 DI ECO, 475 DI and 575 DI are tractors filed as cars.
 *    They sit under category "automobile" alongside the Bolero and the Scorpio,
 *    and the sourced agricole-mahindra.json identifies all three as
 *    agricultural. Category corrected; their missing viscosity is left alone,
 *    because no viscosity was ever sourced for any tractor in this dataset —
 *    Kubota, John Deere and New Holland are the same, carrying an OEM oil name
 *    and no grade. That is a gap in the agricultural data as a whole and not
 *    something to paper over on three rows.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/final-residuals-snapshot-${Date.now()}.json`;

/** Electric cars whose spec was left behind when the fuel type was corrected. */
const ELECTRIC = [
  { make: 'CITROËN', model: /^c-?zero$/i },
  { make: 'MITSUBISHI', model: /^i$/i },
  { make: 'RENAULT', model: /^master( iii box)?$/i, code: /^5AQ/i },
];
/** Mahindra's tractor line, filed as cars. */
const TRACTORS = { make: 'MAHINDRA', model: /^(275|475|575)$/ };

const norm = (c) => String(c || '').toUpperCase().replace(/\s+/g, ' ').trim();

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { categories: [], electric: [], tractors: [] };

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      // 1. category spelling
      if (md.category === 'poids-lourd') {
        snapshot.categories.push({ make: mk.makeName, model: md.modelName, was: md.category });
        console.log(`  categorie  ${mk.makeName} / ${md.modelName} : poids-lourd -> poids_lourd`);
        if (APPLY) md.category = 'poids_lourd';
      }
      // 3. tractors
      if (String(mk.makeName).toUpperCase() === TRACTORS.make && TRACTORS.model.test(String(md.modelName).trim())) {
        snapshot.tractors.push({ make: mk.makeName, model: md.modelName, was: md.category });
        console.log(`  categorie  ${mk.makeName} / ${md.modelName} : ${md.category} -> agricole  (tracteur)`);
        if (APPLY) md.category = 'agricole';
      }
      // 2. electric with an oil
      const hit = ELECTRIC.find((x) => String(mk.makeName).toUpperCase() === x.make
        && x.model.test(String(md.modelName).trim()));
      if (!hit) continue;
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          if (hit.code && !hit.code.test(String(e.engineCode || '').trim())) continue;
          if (!e.oilSpec) continue;
          snapshot.electric.push({
            make: mk.makeName, model: md.modelName, engineCode: e.engineCode,
            was: { fuelType: e.fuelType, oilSpec: e.oilSpec },
          });
          console.log(`  electrique ${mk.makeName} / ${md.modelName} / ${e.engineCode} : ${e.oilSpec.viscosity} retiree`);
          if (APPLY) { e.fuelType = 'electrique'; delete e.oilSpec; }
        }
      }
    }
  }

  console.log(`\n${snapshot.categories.length} categorie(s) reorthographiee(s), ${snapshot.tractors.length} tracteur(s) reclasses, ${snapshot.electric.length} huile(s) retiree(s) d un electrique`);

  const evDb = (await prisma.oilFinderVehicle.findMany())
    .filter((r) => ELECTRIC.some((x) => norm(r.make) === x.make && x.model.test(String(r.model).trim())
      && (!x.code || x.code.test(String(r.engineCode || '').trim()))) && r.fuelType !== 'electrique');
  const trDb = (await prisma.oilFinderVehicle.findMany())
    .filter((r) => norm(r.make) === TRACTORS.make && TRACTORS.model.test(String(r.model).trim())
      && r.category !== 'agricole');
  const catDb = await prisma.oilFinderVehicle.findMany({ where: { category: 'poids-lourd' } });
  console.log(`base : ${evDb.length} electrique(s), ${trDb.length} tracteur(s), ${catDb.length} ligne(s) categorie poids-lourd`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  for (const r of evDb) await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { fuelType: 'electrique' } });
  for (const r of trDb) await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { category: 'agricole' } });
  if (catDb.length) {
    await prisma.oilFinderVehicle.updateMany({ where: { category: 'poids-lourd' }, data: { category: 'poids_lourd' } });
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
