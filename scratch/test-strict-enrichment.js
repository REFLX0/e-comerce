const fs = require('fs');
const path = require('path');
const { authenticSpecs } = require('./catalog-normalizer-core');
const { CANONICAL_SCHEMAS } = require('./canonical-schemas');

const catBackendPath = path.resolve('backend/src/oil-finder/clean-catalog-hierarchy.json');
const rawCatalog = JSON.parse(fs.readFileSync(catBackendPath, 'utf8'));

console.log('=== TEST STRICT SPEC ENRICHMENT LOGIC ===\n');

function normalizeGenString(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractFactoryAndMarketing(code) {
  if (!code) return { full: '', marketing: '', factory: '' };
  const full = code.trim();
  const m = full.match(/^(.+?)\s*\((.+?)\)$/);
  if (m) {
    return { full, marketing: m[1].trim(), factory: m[2].trim() };
  }
  return { full, marketing: full, factory: full };
}

function isExactEngineCodeMatch(c1, c2) {
  if (!c1 || !c2) return false;
  const e1 = extractFactoryAndMarketing(c1);
  const e2 = extractFactoryAndMarketing(c2);

  const clean1Full = e1.full.toLowerCase();
  const clean2Full = e2.full.toLowerCase();
  if (clean1Full === clean2Full) return true;

  const f1 = e1.factory.toLowerCase();
  const f2 = e2.factory.toLowerCase();
  if (f1 && f2 && f1 === f2) return true;

  return false;
}

function doesGenerationOrYearOverlap(targetGen, targetEngine, authRecord) {
  const targetFrom = targetEngine.yearFrom || targetGen.yearFrom || null;
  const targetTo = (targetEngine.yearTo && targetEngine.yearTo !== 9999 ? targetEngine.yearTo : targetGen.yearTo && targetGen.yearTo !== 9999 ? targetGen.yearTo : null) || 9999;

  const authFrom = authRecord.yearFrom || null;
  const authTo = (authRecord.yearTo && authRecord.yearTo !== 9999 ? authRecord.yearTo : null) || 9999;

  // 1. If both have years, check year overlap
  if (targetFrom && authFrom) {
    if (targetTo < authFrom || authTo < targetFrom) {
      return { overlap: false, reason: `Year contradiction: Target [${targetFrom}-${targetTo}] vs Auth [${authFrom}-${authTo}]` };
    }
    return { overlap: true, reason: `Year overlap: [${targetFrom}-${targetTo}] & [${authFrom}-${authTo}]` };
  }

  // 2. If one side lacks years, generation identifier MUST match
  const tGenSlug = normalizeGenString(targetGen.genSlug || '');
  const tGenName = normalizeGenString(targetGen.genName || '');
  const aGen = normalizeGenString(authRecord.generation || '');

  if (aGen && (tGenSlug.includes(aGen) || tGenName.includes(aGen) || aGen.includes(tGenSlug) || aGen.includes(tGenName))) {
    return { overlap: true, reason: `Gen name match: "${authRecord.generation}" matches target "${targetGen.genName}"` };
  }

  return { overlap: false, reason: `No year overlap and gen mismatch ("${authRecord.generation}" vs "${targetGen.genName}")` };
}

// Function with strict spec matching
function matchStrictAuthenticSpec(makeSlug, modelSlug, targetGen, engine) {
  return authenticSpecs.find(a => {
    // 1. Make match
    if (a.make.toLowerCase() !== makeSlug.toLowerCase()) return false;

    // 2. Model match
    const cleanMod = modelSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanAMod = a.model.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanMod !== cleanAMod && !cleanMod.includes(cleanAMod) && !cleanAMod.includes(cleanMod)) return false;

    // 3. Fuel type match
    if (engine.fuelType && a.fuelType && engine.fuelType.toLowerCase() !== a.fuelType.toLowerCase()) return false;

    // 4. Exact engine code match (STRICT - NO FUZZY CC/HP FALLBACK!)
    if (!isExactEngineCodeMatch(engine.engineCode, a.engineCode)) {
      return false;
    }

    // 5. Genuine generation or year overlap
    const check = doesGenerationOrYearOverlap(targetGen, engine, a);
    if (!check.overlap) {
      return false;
    }

    return true;
  });
}

// Run audit across Dacia and VAG
const makes = ['dacia', 'volkswagen', 'audi', 'seat', 'skoda', 'cupra'];

console.log('--- EVALUATING STRICT ENRICHMENT ON RAW CATALOG ---');
let totalEnrichedStrict = 0;
const enrichedList = [];

for (const mSlug of makes) {
  const make = rawCatalog[mSlug];
  if (!make) continue;
  for (const [modSlug, model] of Object.entries(make.models || {})) {
    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      for (const eng of gen.engines || []) {
        // If eng has no spec in raw, see if strict matches
        if (!eng.oilSpec || !eng.oilSpec.viscosity) {
          const match = matchStrictAuthenticSpec(mSlug, modSlug, { genSlug: gSlug, genName: gen.genName, yearFrom: gen.yearFrom, yearTo: gen.yearTo }, eng);
          if (match) {
            totalEnrichedStrict++;
            enrichedList.push({
              make: mSlug,
              model: modSlug,
              gen: gen.genName || gSlug,
              engCode: eng.engineCode,
              authCode: match.engineCode,
              authGen: match.generation,
              authYears: `${match.yearFrom}-${match.yearTo}`,
              spec: `${match.oilSpec.viscosity} ${match.oilSpec.oemApproval || ''}`
            });
          }
        }
      }
    }
  }
}

console.log(`Total Clean Enriched under Strict Logic: ${totalEnrichedStrict}`);
enrichedList.forEach((e, idx) => {
  console.log(`${idx + 1}. [${e.make.toUpperCase()}] ${e.model} > ${e.gen} | Code: "${e.engCode}" (Auth: "${e.authCode}", Gen: "${e.authGen}", Years: ${e.authYears}) -> ${e.spec}`);
});
