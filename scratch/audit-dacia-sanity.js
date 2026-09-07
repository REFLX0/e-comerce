const fs = require('fs');
const { isLowSaps, isSamePhysicalEngine, tagTemplatedPhantoms } = require('./catalog-normalizer-core');

const cat = JSON.parse(fs.readFileSync('backend/src/oil-finder/clean-catalog-hierarchy.json', 'utf8'));
const dacia = cat['dacia'];

if (!dacia) {
  console.error('Dacia not found!');
  process.exit(1);
}

console.log('=== SANITY AUDIT: DACIA ONLY (POST-REVERT c6ac1e85) ===');

let totalEngines = 0;
let modernDiesels = 0;
let lowSapsDiesels = 0;
let highSapsHazards = 0;
let unverifiedDiesels = 0;
let taggedPhantoms = 0;
let physicalDuplicates = 0;

let contaminatedSpecs = 0;

for (const [modSlug, model] of Object.entries(dacia.models || {})) {
  console.log(`\nModel: ${model.modelName} (${modSlug})`);

  for (const [genSlug, gen] of Object.entries(model.generations || {})) {
    console.log(`  Generation: ${gen.genName} (${genSlug}) [${gen.yearFrom || '?'}-${gen.yearTo || '?'}]`);
    const seen = [];

    for (const eng of (gen.engines || [])) {
      totalEngines++;
      if (eng.isTemplatedSeed) {
        taggedPhantoms++;
        console.log(`    - [PHANTOM TAGGED] ${eng.engineCode} (${eng.fuelType}): ${eng.verificationNote}`);
        continue;
      }

      // Check physical duplicate
      const dupe = seen.find(s => isSamePhysicalEngine(s, eng));
      if (dupe) {
        physicalDuplicates++;
        console.log(`    ❌ COLLISION: ${eng.engineCode} vs ${dupe.engineCode}`);
      } else {
        seen.push(eng);
      }

      const isDiesel = (eng.fuelType || '').toLowerCase() === 'diesel';
      const y = eng.yearFrom || gen.yearFrom;
      const specStr = eng.oilSpec ? `${eng.oilSpec.viscosity} ${eng.oilSpec.oemApproval || eng.oilSpec.aceaStandard || ''}` : 'null';

      // Check for spec contamination
      if (eng.oilSpec && eng.oilSpec.viscosity) {
        const targetFrom = eng.yearFrom || gen.yearFrom || null;
        const targetTo = (eng.yearTo && eng.yearTo !== 9999 ? eng.yearTo : gen.yearTo && gen.yearTo !== 9999 ? gen.yearTo : null) || 9999;
        
        // Find authentic source
        const match = require('./catalog-normalizer-core').authenticSpecs.find(a => {
          if (a.make !== 'dacia') return false;
          if (!a.model.includes(modSlug) && !modSlug.includes(a.model)) return false;
          const aCode = (a.engineCode || '').toLowerCase();
          const eCode = (eng.engineCode || '').toLowerCase();
          return aCode === eCode || eCode.includes(aCode) || aCode.includes(eCode);
        });

        if (!match) {
          contaminatedSpecs++;
          console.log(`    ❌ SPEC CONTAMINATION (No authentic source): ${eng.engineCode} -> ${specStr}`);
        } else {
          const authFrom = match.yearFrom || null;
          const authTo = (match.yearTo && match.yearTo !== 9999 ? match.yearTo : null) || 9999;
          if (targetFrom && authFrom && (targetTo < authFrom || authTo < targetFrom)) {
            contaminatedSpecs++;
            console.log(`    ❌ SPEC CONTAMINATION (Cross-era mismatch): ${eng.engineCode} [${targetFrom}-${targetTo}] vs Auth [${authFrom}-${authTo}]`);
          }
        }
      }

      console.log(`    - [ACTIVE] ${eng.engineCode} (${eng.fuelType}, cc: ${eng.displacementCc}, hp: ${eng.powerHp}) -> oil: ${specStr}`);

      if (isDiesel && y && y >= 2011) {
        modernDiesels++;
        if (eng.oilSpec && eng.oilSpec.viscosity) {
          if (isLowSaps(eng.oilSpec)) {
            lowSapsDiesels++;
          } else {
            highSapsHazards++;
            console.log(`      ❌ HIGH-SAPS HAZARD: ${eng.engineCode} (${y}) has ${specStr}`);
          }
        } else {
          unverifiedDiesels++;
        }
      }
    }
  }
}

console.log('\n========================================');
console.log('DACIA AUDIT SUMMARY:');
console.log(`- Total Engines in Dacia: ${totalEngines}`);
console.log(`- Physical Duplicates within Generations: ${physicalDuplicates}`);
console.log(`- Tagged Template Phantoms: ${taggedPhantoms}`);
console.log(`- Spec-Enrichment Contamination Count: ${contaminatedSpecs}`);
console.log(`- Modern Diesels (>= 2011): ${modernDiesels}`);
console.log(`  * Verified Low-SAPS (RN0720 / RN17): ${lowSapsDiesels}`);
console.log(`  * High-SAPS Hazards: ${highSapsHazards}`);
console.log(`  * Unverified (No spec): ${unverifiedDiesels}`);
console.log('========================================');
