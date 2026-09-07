const fs = require('fs');
const cat = JSON.parse(fs.readFileSync('backend/src/oil-finder/clean-catalog-hierarchy.json', 'utf8'));
const { CANONICAL_SCHEMAS } = require('./canonical-schemas');

const VAG_MAKES = ['volkswagen', 'audi', 'seat', 'skoda', 'cupra'];

let candidatePairs = [];

for (const mSlug of VAG_MAKES) {
  const make = cat[mSlug];
  if (!make) continue;
  const makeSchema = CANONICAL_SCHEMAS[mSlug] || {};
  for (const [modSlug, model] of Object.entries(make.models || {})) {
    const modelSchema = makeSchema[modSlug];
    if (modelSchema) {
      for (const [genSlug, genDef] of Object.entries(modelSchema.generations)) {
        const rawEngines = [];
        genDef.sourceSlugs.forEach(src => {
          const sg = model.generations && model.generations[src];
          if (sg) (sg.engines || []).forEach(e => rawEngines.push(e));
        });
        checkPairs(mSlug, modSlug, genDef.genName, rawEngines);
      }
    } else {
      for (const [gSlug, gen] of Object.entries(model.generations || {})) {
        checkPairs(mSlug, modSlug, gen.genName || gSlug, gen.engines || []);
      }
    }
  }
}

function checkPairs(make, model, gen, engines) {
  for (let i = 0; i < engines.length; i++) {
    for (let j = i + 1; j < engines.length; j++) {
      const e1 = engines[i];
      const e2 = engines[j];
      const sameCode = e1.engineCode && e2.engineCode && e1.engineCode.trim().toLowerCase() === e2.engineCode.trim().toLowerCase();
      if (!sameCode) {
        if (e1.fuelType && e2.fuelType && e1.fuelType.toLowerCase() === e2.fuelType.toLowerCase()) {
          const ccClose = e1.displacementCc && e2.displacementCc && Math.abs(e1.displacementCc - e2.displacementCc) <= 15;
          const hpClose = e1.powerHp && e2.powerHp && Math.abs(e1.powerHp - e2.powerHp) <= 3;
          if (ccClose && hpClose) {
            candidatePairs.push({
              make, model, gen,
              e1: { code: e1.engineCode, cc: e1.displacementCc, hp: e1.powerHp, years: (e1.yearFrom || '?') + '-' + (e1.yearTo || '?') },
              e2: { code: e2.engineCode, cc: e2.displacementCc, hp: e2.powerHp, years: (e2.yearFrom || '?') + '-' + (e2.yearTo || '?') }
            });
          }
        }
      }
    }
  }
}

console.log('Total non-identical-code candidates with close cc and hp:', candidatePairs.length);
candidatePairs.forEach(p => console.log(JSON.stringify(p, null, 2)));
