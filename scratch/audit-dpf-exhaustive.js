const fs = require('fs');
const path = require('path');
const { isLowSaps } = require('./catalog-normalizer-core');

const cat = JSON.parse(fs.readFileSync('backend/src/oil-finder/clean-catalog-hierarchy.json', 'utf8'));

let totalDieselModern = 0;
const verifiedLowSaps = [];
const highSapsHazard = [];
const unverifiedNoSpec = [];

const commercialSlugs = new Set(['xcient', 'actros', 'arocs', 'atego', 'axor', 'nqr', 'nkr', 'npr', 'ftr', 'fvr', 'nlr', 'hd78', 'hd170']);

for (const [mSlug, make] of Object.entries(cat)) {
  const isAuto = (make.categories || []).includes('automobile') || !make.categories;
  if (!isAuto) continue;

  for (const [modSlug, model] of Object.entries(make.models || {})) {
    if (commercialSlugs.has(modSlug)) continue;

    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      for (const eng of (gen.engines || [])) {
        if (eng.isTemplatedSeed) continue;

        const isDiesel = (eng.fuelType || '').toLowerCase() === 'diesel';
        const y = eng.yearFrom || gen.yearFrom;

        if (isDiesel && y && y >= 2011) {
          totalDieselModern++;
          const entry = `[${mSlug} -> ${modSlug} -> ${gSlug}] ${eng.engineCode} (${y})`;

          if (!eng.oilSpec || !eng.oilSpec.viscosity) {
            unverifiedNoSpec.push(entry);
          } else {
            const hasLow = isLowSaps(eng.oilSpec);
            if (hasLow) {
              verifiedLowSaps.push(`${entry} -> ${eng.oilSpec.viscosity} (${eng.oilSpec.oemApproval || eng.oilSpec.aceaStandard || ''})`);
            } else {
              highSapsHazard.push(`${entry} -> ${eng.oilSpec.viscosity} (${eng.oilSpec.oemApproval || eng.oilSpec.aceaStandard || ''})`);
            }
          }
        }
      }
    }
  }
}

console.log('=== EXHAUSTIVE DPF AUDIT FOR ALL PASSENGER DIESELS >= 2011 ===');
console.log(`Total modern passenger diesels (>= 2011): ${totalDieselModern}`);
console.log(`1. Verified Low-SAPS: ${verifiedLowSaps.length}`);
console.log(`2. High-SAPS Hazards (Violations): ${highSapsHazard.length}`);
console.log(`3. Unverified (No Spec on file): ${unverifiedNoSpec.length}`);

if (highSapsHazard.length > 0) {
  console.log('\n❌ HIGH-SAPS HAZARDS:');
  highSapsHazard.forEach(h => console.log('  ' + h));
} else {
  console.log('\n✅ ZERO High-SAPS violations among specified engines.');
}

console.log('\nSample Unverified modern diesels (first 10):');
unverifiedNoSpec.slice(0, 10).forEach(u => console.log('  ' + u));
