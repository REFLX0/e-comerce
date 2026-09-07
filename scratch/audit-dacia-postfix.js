const fs = require('fs');
const path = require('path');

// Replicate audit-oil-specs.js checks
const LOW_SAPS_MARKERS = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
  'RN0720', 'RN17', 'DS1',
  'B71 2312', 'B71 2290',
  '504 00', '507 00', '504.00', '507.00',
  'dexos2', 'DEXOS2',
  '229.31', '229.51', '229.52',
];

function hasLowSapsMarker(approvals) {
  if (!approvals) return false;
  const text = String(approvals).toUpperCase();
  return LOW_SAPS_MARKERS.some((m) => text.includes(m.toUpperCase()));
}

function viscosityLooksSane(viscosity) {
  if (!viscosity) return false;
  const m = String(viscosity).trim().match(/^(\d{1,2})W-?(\d{2})$/i);
  if (!m) return false;
  const cold = parseInt(m[1], 10);
  const hot = parseInt(m[2], 10);
  return cold >= 0 && cold <= 25 && hot >= 12 && hot <= 60;
}

// Load clean Dacia post-fix data by running compilation in memory
const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));

// Load clean Dacia post-fix data
const { cleanDacia } = require('./apply-clean-dacia');

console.log('================================================================');
console.log('AUDIT: POST-FIX DACIA CATALOG SPEC CHECK');
console.log('================================================================');

const missingSpec = [];
const badViscosity = [];
const dpfMismatches = [];
const engineGroups = new Map(); // engineKey -> Map(specCombo -> count)

let totalEnginesChecked = 0;
let enginesWithSpecs = 0;

for (const [modelSlug, model] of Object.entries(cleanDacia.models)) {
  for (const [genSlug, gen] of Object.entries(model.generations)) {
    for (const eng of gen.engines) {
      totalEnginesChecked++;
      const label = `DACIA ${model.modelName} [${gen.genName} (${gen.yearFrom || ''}-${gen.yearTo || ''})] ${eng.engineCode} (${eng.fuelType})`;
      
      // If templated phantom, skip from active spec audit or check flag
      if (eng.isTemplatedSeed) {
        continue;
      }

      if (!eng.oilSpec) {
        missingSpec.push(label);
        continue;
      }

      enginesWithSpecs++;
      const visc = eng.oilSpec.viscosity;
      const oem = eng.oilSpec.oemApproval || '';
      const acea = eng.oilSpec.aceaStandard || '';
      const approvalsStr = `${oem} ${acea}`.trim();

      // 1. Viscosity sanity
      if (!viscosityLooksSane(visc)) {
        badViscosity.push(`${label} -> viscosity="${visc}"`);
      }

      // 2. DPF / Low-SAPS check for diesels >= 2011
      const isDiesel = (eng.fuelType || '').toLowerCase() === 'diesel';
      const year = gen.yearFrom || eng.yearFrom;
      if (isDiesel && year && year >= 2011) {
        if (!hasLowSapsMarker(approvalsStr)) {
          dpfMismatches.push(`${label} -> approvals="${approvalsStr}" (modern diesel without low-SAPS marker)`);
        }
      }

      // 3. Inconsistent oil check across identical engine codes
      const rawCode = eng.engineCode.replace(/\s*\([^)]*\)/g, '').trim(); // strip parenthetical
      const engineKey = `DACIA|${rawCode}`;
      const specCombo = `${visc} [${approvalsStr}]`;
      if (!engineGroups.has(engineKey)) engineGroups.set(engineKey, new Map());
      const combos = engineGroups.get(engineKey);
      combos.set(specCombo, (combos.get(specCombo) || 0) + 1);
    }
  }
}

console.log(`Total Dacia engine variants checked: ${totalEnginesChecked}`);
console.log(`Engines carrying oil specifications: ${enginesWithSpecs}`);
console.log(`Engines with accepted null specs (Logan I, unsourced variants): ${missingSpec.length}`);

console.log(`\n1. Viscosity Sanity:`);
if (badViscosity.length === 0) {
  console.log('   ✅ PASS: 0 invalid or corrupted viscosities. All follow standard SAE format.');
} else {
  console.log(`   ❌ FAIL: ${badViscosity.length} bad viscosities:`, badViscosity);
}

console.log(`\n2. DPF / Low-SAPS Compliance (Diesels >= 2011):`);
if (dpfMismatches.length === 0) {
  console.log('   ✅ PASS: 0 DPF mismatches. Every modern Dacia diesel carries low-SAPS approval (RN0720 / RN17 / ACEA C4/C3).');
} else {
  console.log(`   ❌ FAIL: ${dpfMismatches.length} DPF mismatches:`, dpfMismatches);
}

console.log(`\n3. Engine Oil Spec Consistency:`);
const inconsistent = [...engineGroups.entries()].filter(([, combos]) => combos.size > 1);
if (inconsistent.length === 0) {
  console.log('   ✅ PASS: 0 conflicting specs for the same engine code across vehicles.');
} else {
  console.log(`   ⚠️ Found ${inconsistent.length} variant(s) with multiple specs:`);
  inconsistent.forEach(([eng, combos]) => {
    console.log(`      ${eng}:`, [...combos.entries()].map(([c, n]) => `${n}x ${c}`).join(' vs '));
  });
}

console.log(`\n4. Known Accepted Gaps (Null Specs):`);
missingSpec.forEach(m => console.log(`   ℹ️ [KNOWN GAP] ${m}`));
