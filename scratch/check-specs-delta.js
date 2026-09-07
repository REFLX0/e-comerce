const fs = require('fs');
const execSync = require('child_process').execSync;

const prevRaw = execSync('git show c6ac1e85:backend/src/oil-finder/clean-catalog-hierarchy.json', { maxBuffer: 50*1024*1024 }).toString();
const currRaw = fs.readFileSync('backend/src/oil-finder/clean-catalog-hierarchy.json', 'utf8');
const prevCat = JSON.parse(prevRaw);
const currCat = JSON.parse(currRaw);

let prevSpecs = 0;
let currSpecs = 0;
const brandDeltas = {};

for (const [mSlug, make] of Object.entries(prevCat)) {
  for (const [modSlug, model] of Object.entries(make.models || {})) {
    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      for (const e of (gen.engines || [])) {
        if (e.oilSpec && e.oilSpec.viscosity) {
          prevSpecs++;
          brandDeltas[mSlug] = (brandDeltas[mSlug] || { prev: 0, curr: 0, newEngines: [] });
          brandDeltas[mSlug].prev++;
        }
      }
    }
  }
}

for (const [mSlug, make] of Object.entries(currCat)) {
  for (const [modSlug, model] of Object.entries(make.models || {})) {
    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      for (const e of (gen.engines || [])) {
        if (e.oilSpec && e.oilSpec.viscosity) {
          currSpecs++;
          brandDeltas[mSlug] = (brandDeltas[mSlug] || { prev: 0, curr: 0, newEngines: [] });
          brandDeltas[mSlug].curr++;
        }
      }
    }
  }
}

console.log('Total prev specs (c6ac1e85):', prevSpecs);
console.log('Total curr specs (788cd7db):', currSpecs);
console.log('Difference:', currSpecs - prevSpecs);

for (const [b, d] of Object.entries(brandDeltas)) {
  if (d.curr !== d.prev) {
    console.log(`- ${b}: prev=${d.prev}, curr=${d.curr} (delta: ${d.curr - d.prev})`);
  }
}
