const fs = require('fs');
const path = require('path');
const { authenticSpecs } = require('./catalog-normalizer-core');

const catBackendPath = path.resolve('backend/src/oil-finder/clean-catalog-hierarchy.json');
const catalog = JSON.parse(fs.readFileSync(catBackendPath, 'utf8'));

console.log('================================================================');
console.log('EXHAUSTIVE SPEC ENRICHMENT & CONTAMINATION AUDIT (DACIA + VAG)');
console.log('================================================================\n');

// 1. Audit Dacia committed specs
const dacia = catalog['dacia'];
console.log('--- PART 1: RETROACTIVE AUDIT OF DACIA COMMITTED SPECS (c6ac1e85) ---');

const daciaAuditResults = [];
let daciaClean = 0;
let daciaContaminated = 0;

for (const [modSlug, model] of Object.entries(dacia.models || {})) {
  for (const [genSlug, gen] of Object.entries(model.generations || {})) {
    for (const eng of (gen.engines || [])) {
      if (eng.oilSpec && eng.oilSpec.viscosity) {
        // Find authentic source
        const sourceMatches = authenticSpecs.filter(a => 
          a.make === 'dacia' && 
          (a.model.includes(modSlug) || modSlug.includes(a.model))
        );

        // Check if there is an exact engine code match in the source dataset
        const codeMatch = sourceMatches.find(a => {
          if (!a.engineCode || !eng.engineCode) return false;
          const aCode = a.engineCode.trim().toLowerCase();
          const eCode = eng.engineCode.trim().toLowerCase();
          return aCode === eCode || eCode.includes(aCode) || aCode.includes(eCode);
        });

        if (!codeMatch) {
          daciaContaminated++;
          daciaAuditResults.push({
            status: 'CONTAMINATED_NO_CODE_MATCH',
            model: modSlug,
            gen: gen.genName || genSlug,
            targetGenYears: `${gen.yearFrom || '?'}-${gen.yearTo || '?'}`,
            engineCode: eng.engineCode,
            spec: `${eng.oilSpec.viscosity} ${eng.oilSpec.oemApproval || ''}`,
            reason: 'No authentic source record has this engine code'
          });
          continue;
        }

        // Check year / generation overlap
        const targetFrom = eng.yearFrom || gen.yearFrom || null;
        const targetTo = (eng.yearTo && eng.yearTo !== 9999 ? eng.yearTo : gen.yearTo && gen.yearTo !== 9999 ? gen.yearTo : null) || 9999;
        const authFrom = codeMatch.yearFrom || null;
        const authTo = (codeMatch.yearTo && codeMatch.yearTo !== 9999 ? codeMatch.yearTo : null) || 9999;

        let overlaps = true;
        let overlapReason = '';

        if (targetFrom && authFrom) {
          if (targetTo < authFrom || authTo < targetFrom) {
            overlaps = false;
            overlapReason = `Target production [${targetFrom}-${targetTo}] does not overlap source [${authFrom}-${authTo}]`;
          } else {
            overlapReason = `Target [${targetFrom}-${targetTo}] overlaps source [${authFrom}-${authTo}]`;
          }
        } else {
          // Check gen string
          const tName = (gen.genName || genSlug).toLowerCase();
          const aGen = (codeMatch.generation || '').toLowerCase();
          if (aGen && !tName.includes(aGen) && !aGen.includes(tName)) {
            overlaps = false;
            overlapReason = `No year data and gen mismatch: target "${tName}" vs source "${aGen}"`;
          } else {
            overlapReason = `Gen name matched: "${aGen}"`;
          }
        }

        if (!overlaps) {
          daciaContaminated++;
          daciaAuditResults.push({
            status: 'CONTAMINATED_CROSS_GEN',
            model: modSlug,
            gen: gen.genName || genSlug,
            targetGenYears: `${gen.yearFrom || '?'}-${gen.yearTo || '?'}`,
            engineCode: eng.engineCode,
            spec: `${eng.oilSpec.viscosity} ${eng.oilSpec.oemApproval || ''}`,
            sourceGen: codeMatch.generation,
            sourceYears: `${codeMatch.yearFrom || '?'}-${codeMatch.yearTo || '?'}`,
            reason: overlapReason
          });
        } else {
          daciaClean++;
          daciaAuditResults.push({
            status: 'CONFIRMED_CLEAN',
            model: modSlug,
            gen: gen.genName || genSlug,
            targetGenYears: `${gen.yearFrom || '?'}-${gen.yearTo || '?'}`,
            engineCode: eng.engineCode,
            spec: `${eng.oilSpec.viscosity} ${eng.oilSpec.oemApproval || ''}`,
            sourceGen: codeMatch.generation,
            sourceYears: `${codeMatch.yearFrom || '?'}-${codeMatch.yearTo || '?'}`,
            reason: overlapReason
          });
        }
      }
    }
  }
}

console.log(`Dacia Committed Specs Checked: ${daciaAuditResults.length}`);
console.log(`- Confirmed Clean : ${daciaClean}`);
console.log(`- Contaminated    : ${daciaContaminated}\n`);

daciaAuditResults.forEach((r, i) => {
  const icon = r.status === 'CONFIRMED_CLEAN' ? '✅' : '❌';
  console.log(`${icon} ${i + 1}. [DACIA] ${r.model} > ${r.gen} (${r.targetGenYears}) | "${r.engineCode}" -> ${r.spec}`);
  console.log(`     Source: Gen "${r.sourceGen || 'none'}" [${r.sourceYears || '?'}] | Note: ${r.reason}`);
});

// 2. Audit VAG Enriched Specs from previous dry run
console.log('\n================================================================');
console.log('--- PART 2: AUDIT OF VAG ENRICHED SPECS (FROM PREVIOUS DRY RUN) ---');
console.log('================================================================');

const vagReport = JSON.parse(fs.readFileSync('scratch/vag-dry-run-report.json', 'utf8'));
const vagAuditResults = [];
let vagClean = 0;
let vagContaminated = 0;

for (const [mSlug, make] of Object.entries(vagReport.makes)) {
  for (const [modSlug, model] of Object.entries(make.models)) {
    for (const s of model.specAdditions) {
      // Find authentic record that was used
      const auth = authenticSpecs.find(a => 
        a.make === mSlug && 
        (a.model.includes(modSlug) || modSlug.includes(a.model)) &&
        a.oilSpec.viscosity === s.viscosity &&
        (a.oilSpec.oemApproval === s.approval || (!a.oilSpec.oemApproval && !s.approval))
      );

      if (!auth) {
        vagContaminated++;
        vagAuditResults.push({
          status: 'NO_SOURCE_FOUND',
          make: mSlug,
          model: modSlug,
          gen: s.generation,
          engineCode: s.engineCode,
          spec: `${s.viscosity} ${s.approval || ''}`,
          reason: 'Source record could not be identified'
        });
        continue;
      }

      // Check exact engine code match
      const fullCode = s.engineCode.trim().toLowerCase();
      const authCode = auth.engineCode.trim().toLowerCase();
      const codeMatches = fullCode === authCode || fullCode.includes(authCode) || authCode.includes(fullCode);

      // Check year / generation overlap
      let overlaps = false;
      let overlapReason = '';

      // Find generation in raw catalog or canonical schema
      const targetGenName = s.generation.toLowerCase();
      const authGen = (auth.generation || '').toLowerCase();

      // Check year match
      const authFrom = auth.yearFrom || null;
      const authTo = (auth.yearTo && auth.yearTo !== 9999 ? auth.yearTo : null) || 9999;

      // Extract years from gen title if present e.g. "Golf VII (2012 - 2020)" or "Polo III"
      const yrMatch = s.generation.match(/\((\d{4})\s*-\s*(\d{4}|présent)\)/i);
      let targetFrom = yrMatch ? parseInt(yrMatch[1], 10) : null;
      let targetTo = yrMatch ? (yrMatch[2].toLowerCase() === 'présent' ? 9999 : parseInt(yrMatch[2], 10)) : null;

      if (targetFrom && authFrom) {
        if (targetTo < authFrom || authTo < targetFrom) {
          overlaps = false;
          overlapReason = `Target years [${targetFrom}-${targetTo}] strictly outside source [${authFrom}-${authTo}]`;
        } else {
          overlaps = true;
          overlapReason = `Target years [${targetFrom}-${targetTo}] overlap source [${authFrom}-${authTo}]`;
        }
      } else {
        // Gen string matching
        const cleanT = targetGenName.replace(/[^a-z0-9]/g, '');
        const cleanA = authGen.replace(/[^a-z0-9]/g, '');
        if (cleanT.includes(cleanA) || cleanA.includes(cleanT)) {
          overlaps = true;
          overlapReason = `Gen identifier matched: "${auth.generation}" in "${s.generation}"`;
        } else {
          overlaps = false;
          overlapReason = `Gen mismatch: target "${s.generation}" vs source "${auth.generation}" [${authFrom}-${authTo}]`;
        }
      }

      if (!codeMatches || !overlaps) {
        vagContaminated++;
        vagAuditResults.push({
          status: 'CONTAMINATED',
          make: mSlug,
          model: modSlug,
          gen: s.generation,
          engineCode: s.engineCode,
          spec: `${s.viscosity} ${s.approval || ''}`,
          authCode: auth.engineCode,
          authGen: auth.generation,
          authYears: `${auth.yearFrom || '?'}-${auth.yearTo || '?'}`,
          reason: !codeMatches ? `Code mismatch: target "${s.engineCode}" vs auth "${auth.engineCode}"` : overlapReason
        });
      } else {
        vagClean++;
        vagAuditResults.push({
          status: 'CONFIRMED_CLEAN',
          make: mSlug,
          model: modSlug,
          gen: s.generation,
          engineCode: s.engineCode,
          spec: `${s.viscosity} ${s.approval || ''}`,
          authCode: auth.engineCode,
          authGen: auth.generation,
          authYears: `${auth.yearFrom || '?'}-${auth.yearTo || '?'}`,
          reason: overlapReason
        });
      }
    }
  }
}

console.log(`VAG Specs Checked: ${vagAuditResults.length}`);
console.log(`- Confirmed Clean : ${vagClean}`);
console.log(`- Contaminated    : ${vagContaminated}\n`);

vagAuditResults.forEach((r, i) => {
  const icon = r.status === 'CONFIRMED_CLEAN' ? '✅' : '❌';
  console.log(`${icon} ${i + 1}. [${r.make.toUpperCase()}] ${r.model} > ${r.gen} | "${r.engineCode}" -> ${r.spec}`);
  console.log(`     Source: "${r.authCode || '?'}" in Gen "${r.authGen || '?'}" [${r.authYears || '?'}] | Note: ${r.reason}`);
});
