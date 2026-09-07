const fs = require('fs');
const path = require('path');
const { 
  isSamePhysicalEngine, 
  mergeEngineRecords, 
  tagTemplatedPhantoms, 
  enrichWithAuthenticSpec, 
  isLowSaps, 
  authenticSpecs 
} = require('./catalog-normalizer-core');
const { CANONICAL_SCHEMAS } = require('./canonical-schemas');
const { cleanDacia } = require('./apply-clean-dacia');

const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const rawCatalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));

// Clone catalog
const newCatalog = JSON.parse(JSON.stringify(rawCatalog));

// 1. Dacia is already canonicalized
newCatalog['dacia'] = cleanDacia;
newCatalog['dacia'].categories = ['automobile'];

const STANDALONE_GEN_NAMES = {
  'isuzu_kb_tfr': 'KB - TFR (2002 - 2012)',
  'mercedes-benz_gla_gla': 'GLA (X156 / H247) (2013 - Présent)',
  'mercedes-benz_glc_glc': 'GLC (X253 / X254) (2015 - Présent)',
  'subaru_xv_xv': 'XV (GP / GT) (2012 - Présent)',
  'jaguar_xe_xe': 'XE (X760) (2015 - Présent)',
  'porsche_911_911': '911 (996 / 997 / 991) (1997 - 2019)',
  'mg_zs_zs': 'ZS (2017 - Présent)',
  'mg_hs_hs': 'HS (2018 - Présent)',
};

// 2. Clean generation name helper
function cleanRawGenName(name, modelName, genCount, yearFrom, yearTo, key) {
  if (key && STANDALONE_GEN_NAMES[key]) {
    return STANDALONE_GEN_NAMES[key];
  }
  if (!name) return modelName || 'Standard';
  let cleaned = name
    .replace(/^[\s/(]+/, '')       // strip leading /, (, spaces
    .replace(/_$/, '')             // strip trailing _
    .replace(/,\s*_$/, '')
    .trim();

  // Fix unclosed parenthesis: if '(' count > ')' count, add ')'
  const openCount = (cleaned.match(/\(/g) || []).length;
  const closeCount = (cleaned.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    cleaned += ')'.repeat(openCount - closeCount);
  }

  // If the generation name is all-caps matching model name or short all-caps word:
  if (/^[A-Z0-9_-]{2,8}$/.test(cleaned)) {
    if (cleaned.toLowerCase() === modelName.toLowerCase()) {
      cleaned = `${modelName} (Standard)`;
    } else if (genCount === 1) {
      cleaned = `${modelName} (${cleaned})`;
    } else {
      cleaned = `${modelName} - ${cleaned}`;
    }
  }

  if (yearFrom && !cleaned.includes(String(yearFrom))) {
    const toStr = yearTo && yearTo !== 9999 ? String(yearTo) : 'Présent';
    cleaned = `${cleaned} (${yearFrom} - ${toStr})`;
  }
  return cleaned;
}

// 3. Process each make in catalog
let totalModelsCleaned = 0;
let totalGenerationsMerged = 0;
let totalEnginesDeduped = 0;
let totalPhantomsTagged = 0;

for (const [mSlug, make] of Object.entries(newCatalog)) {
  if (mSlug === 'dacia') continue; // Dacia already done

  const isAuto = (make.categories || []).includes('automobile') || !make.categories;
  if (!isAuto) {
    // Non-automobile make (moto, marine, agricole, poids-lourds): leave intact!
    continue;
  }

  // Ensure make has categories
  if (!make.categories || make.categories.length === 0) {
    make.categories = ['automobile'];
  }

  const makeSchema = CANONICAL_SCHEMAS[mSlug] || {};

  for (const [modSlug, model] of Object.entries(make.models || {})) {
    totalModelsCleaned++;
    const modelSchema = makeSchema[modSlug];

    if (modelSchema) {
      // ── Process with CANONICAL SCHEMA ──
      const cleanGenerations = {};

      for (const [genSlug, genDef] of Object.entries(modelSchema.generations)) {
        const rawEngines = [];

        // Collect all engines from sourceSlugs
        if (model.generations) {
          genDef.sourceSlugs.forEach(srcSlug => {
            const srcGen = model.generations[srcSlug];
            if (srcGen && srcGen.engines) {
              rawEngines.push(...srcGen.engines);
            }
          });
        }

        // Deduplicate physical engines within this generation
        const merged = [];
        for (const eng of rawEngines) {
          // Enrich with authentic dataset if available
          const enriched = enrichWithAuthenticSpec(mSlug, modSlug, genDef.genName, eng);
          const matchIdx = merged.findIndex(m => isSamePhysicalEngine(m, enriched));
          if (matchIdx !== -1) {
            merged[matchIdx] = mergeEngineRecords(merged[matchIdx], enriched);
            totalEnginesDeduped++;
          } else {
            merged.push({ ...enriched });
          }
        }

        // Tag cross-generational template phantoms
        const taggedEngines = tagTemplatedPhantoms(mSlug, modSlug, genSlug, merged);
        taggedEngines.forEach(e => { if (e.isTemplatedSeed) totalPhantomsTagged++; });

        cleanGenerations[genSlug] = {
          genName: genDef.genName,
          genSlug: genSlug,
          yearFrom: genDef.yearFrom,
          yearTo: genDef.yearTo,
          engines: taggedEngines
        };
      }

      totalGenerationsMerged += (Object.keys(model.generations || {}).length - Object.keys(cleanGenerations).length);
      model.generations = cleanGenerations;

    } else {
      // ── Process with GENERAL RULE-BASED NORMALIZER ──
      const newGens = {};

      for (const [gSlug, gen] of Object.entries(model.generations || {})) {
        const rawEngines = gen.engines || [];
        const genCount = Object.keys(model.generations || {}).length;
        const key = `${mSlug}_${modSlug}_${gSlug}`;
        const cleanName = cleanRawGenName(gen.genName || gSlug, model.modelName, genCount, gen.yearFrom, gen.yearTo, key);

        // Deduplicate engines within this generation
        const merged = [];
        for (const eng of rawEngines) {
          const enriched = enrichWithAuthenticSpec(mSlug, modSlug, cleanName, eng);
          const matchIdx = merged.findIndex(m => isSamePhysicalEngine(m, enriched));
          if (matchIdx !== -1) {
            merged[matchIdx] = mergeEngineRecords(merged[matchIdx], enriched);
            totalEnginesDeduped++;
          } else {
            merged.push({ ...enriched });
          }
        }

        const taggedEngines = tagTemplatedPhantoms(mSlug, modSlug, gSlug, merged);
        taggedEngines.forEach(e => { if (e.isTemplatedSeed) totalPhantomsTagged++; });

        newGens[gSlug] = {
          genName: cleanName,
          genSlug: gSlug,
          yearFrom: gen.yearFrom || null,
          yearTo: gen.yearTo || null,
          engines: taggedEngines
        };
      }

      model.generations = newGens;
    }
  }
}

console.log('=== NORMALIZATION DRY-RUN COMPLETE ===');
console.log(`Models processed: ${totalModelsCleaned}`);
console.log(`Generations collapsed/merged into canonical nodes: ${totalGenerationsMerged}`);
console.log(`Duplicate physical engines merged: ${totalEnginesDeduped}`);
console.log(`Templated phantom engines tagged: ${totalPhantomsTagged}`);

// ── AUDIT CHECKS ON NORMALIZED CATALOG ──
console.log('\n=== AUDITING NORMALIZED CATALOG ===');

const brokenGens = [];
const badViscosity = [];
const dpfMismatches = [];
let totalGensChecked = 0;
let totalEngsChecked = 0;

for (const [mSlug, make] of Object.entries(newCatalog)) {
  const isAutoMake = (make.categories || []).includes('automobile') || !make.categories;

  for (const [modSlug, model] of Object.entries(make.models || {})) {
    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      totalGensChecked++;
      const gName = gen.genName || '';

      // Check for broken generation name syntax (in automobile line)
      if (isAutoMake) {
        const openCount = (gName.match(/\(/g) || []).length;
        const closeCount = (gName.match(/\)/g) || []).length;
        if (openCount !== closeCount || gName.startsWith('(') || gName.endsWith('(') || gName.includes('/(') || /^[A-Z0-9_]{2,6}$/.test(gName)) {
          brokenGens.push(`[${mSlug} -> ${modSlug}] slug: "${gSlug}" | name: "${gName}"`);
        }
      }

      for (const eng of (gen.engines || [])) {
        totalEngsChecked++;
        if (eng.isTemplatedSeed) continue;

        if (eng.oilSpec && eng.oilSpec.viscosity) {
          const v = eng.oilSpec.viscosity;
          if (!/^(\d{1,2})W-?(\d{2})$/i.test(v)) {
            badViscosity.push(`[${mSlug} -> ${modSlug} -> ${gSlug}] ${eng.engineCode} -> viscosity="${v}"`);
          }

          // DPF check: passenger car diesels >= 2011 (exclude commercial truck models)
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

console.log(`Total generations checked: ${totalGensChecked}`);
console.log(`Total engines checked: ${totalEngsChecked}`);
console.log(`Broken generation names: ${brokenGens.length}`);
if (brokenGens.length > 0) {
  console.log('All remaining broken generation names:');
  brokenGens.forEach(b => console.log('  ' + b));
}
console.log(`Bad viscosities: ${badViscosity.length}`);
if (badViscosity.length > 0) {
  console.log('Bad viscosities:', badViscosity);
}
console.log(`DPF mismatches (Passenger Cars >= 2011): ${dpfMismatches.length}`);
if (dpfMismatches.length > 0) {
  console.log('DPF mismatches:');
  dpfMismatches.forEach(d => console.log('  ' + d));
}
