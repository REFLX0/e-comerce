const fs = require('fs');
const path = require('path');
const { isLowSaps } = require('./catalog-normalizer-core');

const catPath = path.resolve('backend/src/oil-finder/clean-catalog-hierarchy.json');
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));

console.log('================================================================');
console.log('AUDIT: FULL PRODUCTION CATALOG SPEC & HIERARCHY VERIFICATION');
console.log('================================================================');

let totalMakes = 0;
let totalModels = 0;
let totalGenerations = 0;
let totalEngines = 0;
let enginesWithSpecs = 0;
let templatedPhantomsCount = 0;

const brokenGens = [];
const badViscosity = [];
const dpfMismatches = [];
const engineCollisions = [];

for (const [mSlug, make] of Object.entries(catalog)) {
  totalMakes++;
  const isAutoMake = (make.categories || []).includes('automobile') || !make.categories;

  for (const [modSlug, model] of Object.entries(make.models || {})) {
    totalModels++;

    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      totalGenerations++;
      const gName = gen.genName || '';

      // Check for broken syntax in generation name
      if (isAutoMake) {
        const openCount = (gName.match(/\(/g) || []).length;
        const closeCount = (gName.match(/\)/g) || []).length;
        if (openCount !== closeCount || gName.startsWith('(') || gName.endsWith('(') || gName.includes('/(') || /^[A-Z0-9_]{2,6}$/.test(gName)) {
          brokenGens.push(`[${mSlug} -> ${modSlug}] slug: "${gSlug}" | name: "${gName}"`);
        }
      }

      // Check for duplicate physical engines in this generation
      const seenEngines = [];

      for (const eng of (gen.engines || [])) {
        totalEngines++;
        if (eng.isTemplatedSeed) {
          templatedPhantomsCount++;
          continue;
        }

        // Check duplicates within generation
        const dupe = seenEngines.find(s => 
          s.fuelType === eng.fuelType &&
          s.displacementCc && eng.displacementCc && Math.abs(s.displacementCc - eng.displacementCc) <= 15 &&
          s.powerHp && eng.powerHp && Math.abs(s.powerHp - eng.powerHp) <= 3
        );
        if (dupe) {
          engineCollisions.push(`[${mSlug} -> ${modSlug} -> ${gSlug}] duplicate physical engine: "${eng.engineCode}" vs "${dupe.engineCode}"`);
        } else {
          seenEngines.push(eng);
        }

        if (eng.oilSpec && eng.oilSpec.viscosity) {
          enginesWithSpecs++;
          const v = eng.oilSpec.viscosity;

          // Check 1: Viscosity sanity
          if (!/^(\d{1,2})W-?(\d{2})$/i.test(v)) {
            badViscosity.push(`[${mSlug} -> ${modSlug} -> ${gSlug}] ${eng.engineCode} -> viscosity="${v}"`);
          }

          // Check 2: DPF compliance on passenger cars >= 2011
          const isCommercial = ['xcient', 'actros', 'arocs', 'atego', 'axor', 'nqr', 'nkr', 'npr', 'ftr', 'fvr', 'nlr', 'hd78', 'hd170'].includes(modSlug);
          const isDiesel = (eng.fuelType || '').toLowerCase() === 'diesel';
          const y = gen.yearFrom || eng.yearFrom;
          if (isAutoMake && !isCommercial && isDiesel && y && y >= 2011) {
            const hasLow = isLowSaps(eng.oilSpec);
            if (!hasLow) {
              dpfMismatches.push(`[${mSlug} -> ${modSlug} -> ${gSlug}] ${eng.engineCode} (${y}) -> approvals="${eng.oilSpec.oemApproval || ''} ${eng.oilSpec.aceaStandard || ''}"`);
            }
          }
        }
      }
    }
  }
}

console.log(`\nCatalog Statistics:`);
console.log(`- Makes: ${totalMakes}`);
console.log(`- Models: ${totalModels}`);
console.log(`- Generations: ${totalGenerations}`);
console.log(`- Total Engines: ${totalEngines}`);
console.log(`- Engines with authentic specs: ${enginesWithSpecs}`);
console.log(`- Templated phantoms tagged & excluded: ${templatedPhantomsCount}`);

console.log(`\n1. Hierarchy & Generation Name Sanity:`);
if (brokenGens.length === 0) {
  console.log('   ✅ PASS: 0 broken or unclosed generation names. All follow clean human-readable naming.');
} else {
  console.log(`   ❌ FAIL: ${brokenGens.length} broken generations:`);
  brokenGens.forEach(b => console.log('      ' + b));
}

console.log(`\n2. Viscosity Sanity:`);
if (badViscosity.length === 0) {
  console.log('   ✅ PASS: 0 invalid viscosities. All conform strictly to SAE J300 format.');
} else {
  console.log(`   ❌ FAIL: ${badViscosity.length} bad viscosities:`, badViscosity);
}

console.log(`\n3. DPF / Low-SAPS Parity (Passenger Diesels >= 2011):`);
if (dpfMismatches.length === 0) {
  console.log('   ✅ PASS: 0 DPF mismatches. Modern passenger car diesels carry verified low-SAPS approvals.');
} else {
  console.log(`   ❌ FAIL: ${dpfMismatches.length} DPF mismatches:`, dpfMismatches);
}

console.log(`\n4. Physical Engine Deduplication:`);
if (engineCollisions.length === 0) {
  console.log('   ✅ PASS: 0 redundant duplicate physical engine listings within any generation.');
} else {
  console.log(`   ⚠️ Found ${engineCollisions.length} physical engine collision(s):`, engineCollisions.slice(0, 10));
}

// 5. Inspect key models
console.log(`\n5. Inspection of Key Reference Models:`);
const keysToCheck = [
  { make: 'volkswagen', model: 'golf' },
  { make: 'peugeot', model: '206' },
  { make: 'renault', model: 'clio' },
  { make: 'citroen', model: 'c3' },
  { make: 'dacia', model: 'dokker' },
  { make: 'dacia', model: 'duster' },
  { make: 'ford', model: 'fiesta' },
  { make: 'toyota', model: 'yaris' }
];

keysToCheck.forEach(k => {
  const m = catalog[k.make]?.models?.[k.model];
  if (m) {
    console.log(`\n  [${k.make.toUpperCase()}] ${m.modelName}:`);
    for (const [gSlug, g] of Object.entries(m.generations || {})) {
      const engSummary = (g.engines || []).map(e => {
        const spec = e.oilSpec ? e.oilSpec.viscosity : 'null';
        const flag = e.isTemplatedSeed ? ' [PHANTOM]' : '';
        return `${e.engineCode} (${e.fuelType || '?'}, ${spec})${flag}`;
      }).join(', ');
      console.log(`    - ${g.genName} (${g.yearFrom || '?'}-${g.yearTo || '?'}) [${g.engines.length} engs]: ${engSummary}`);
    }
  }
});
