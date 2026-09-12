/**
 * Corrects catalogue entries for vehicles that are not cars.
 *
 * The add script's carry-over copied database-only models into the catalogue
 * with the category hardcoded to "automobile", which put Suzuki's GSX-S750,
 * Hayabusa, Burgman and V-Strom into the car catalogue. The catalogue outranks
 * every other store, so those entries then beat the researched motorcycle specs
 * and a wet-clutch bike was offered a 5W-30 car oil — the friction modifiers in
 * which make the clutch slip.
 *
 * Takes the category and the spec from the OilFinderVehicle row that actually
 * describes the vehicle, matched on make + model + engine code.
 *
 * Runs read-only unless --apply is passed.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const CATEGORIES = ['moto', 'marine', 'agricole'];

const up = (v) => String(v || '').toUpperCase().trim();
const toCatalogCat = (c) => (c === 'poids-lourd' ? 'poids_lourd' : c);

async function main() {
  const prisma = new PrismaClient();
  const verified = await prisma.oilFinderVehicle.findMany({
    where: { category: { in: CATEGORIES } },
    select: { make: true, model: true, engineCode: true, category: true, oilSpec: true },
  });
  const byKey = new Map();
  for (const v of verified) {
    if (!v.engineCode) continue;
    byKey.set(`${up(v.make)}|${up(v.model)}|${up(v.engineCode)}`, v);
  }
  // Also index by make+model, so a model's category can be fixed even where the
  // catalogue spells the engine code differently.
  const catByModel = new Map();
  for (const v of verified) catByModel.set(`${up(v.make)}|${up(v.model)}`, v.category);

  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const changes = [];

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      const modelCat = catByModel.get(`${up(mk.makeName)}|${up(md.modelName)}`);
      const wantCat = modelCat ? toCatalogCat(modelCat) : null;
      if (wantCat && md.category !== wantCat) {
        changes.push({ what: 'category', make: mk.makeName, model: md.modelName, from: md.category, to: wantCat });
        if (APPLY) md.category = wantCat;
      }

      for (const gen of Object.values(md.generations || {})) {
        for (const eng of gen.engines || []) {
          const hit = byKey.get(`${up(mk.makeName)}|${up(md.modelName)}|${up(eng.engineCode)}`);
          if (!hit) continue;
          const cur = eng.oilSpec || {};
          if (cur.viscosity === hit.oilSpec.viscosity && (cur.jasoStandard || null) === (hit.oilSpec.jasoStandard || null)) continue;
          changes.push({
            what: 'spec', make: mk.makeName, model: md.modelName, engineCode: eng.engineCode,
            from: `${cur.viscosity || '?'} ${cur.oemApproval || ''}`.trim(),
            to: `${hit.oilSpec.viscosity}${hit.oilSpec.jasoStandard ? ' JASO ' + hit.oilSpec.jasoStandard : ''}`,
          });
          if (APPLY) {
            eng.oilSpec = {
              viscosity: hit.oilSpec.viscosity,
              oemApproval: hit.oilSpec.oemApproval ?? null,
              aceaStandard: hit.oilSpec.aceaStandard ?? null,
              apiStandard: hit.oilSpec.apiStandard ?? null,
              jasoStandard: hit.oilSpec.jasoStandard ?? null,
              capacityLiters: hit.oilSpec.capacityLiters ?? null,
              changeIntervalKm: hit.oilSpec.changeIntervalKm ?? null,
            };
          }
        }
      }
    }
  }

  console.log(`${APPLY ? 'corrected' : 'would correct'}: ${changes.length}`);
  changes.slice(0, 20).forEach((c) =>
    console.log(`   ${c.what.padEnd(16)} ${c.make} ${c.model || ''} ${c.engineCode ? '[' + c.engineCode + ']' : ''}  ${c.from} -> ${c.to}`));

  if (!APPLY) { console.log('\nNothing written. Re-run with --apply.'); await prisma.$disconnect(); return; }
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`Catalogue file rewritten: ${CATALOG}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
