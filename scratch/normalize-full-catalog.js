const fs = require('fs');
const path = require('path');
const { 
  isSamePhysicalEngine, 
  mergeEngineRecords, 
  tagTemplatedPhantoms, 
  enrichWithAuthenticSpec, 
  isLowSaps 
} = require('./catalog-normalizer-core');
const { CANONICAL_SCHEMAS } = require('./canonical-schemas');
const { cleanDacia } = require('./apply-clean-dacia');

const catBackendPath = path.resolve('backend/src/oil-finder/clean-catalog-hierarchy.json');
const catDatasetPath = path.resolve('oil-finder-full-dataset/clean-catalog-hierarchy.json');

console.log('Loading catalog from:', catBackendPath);
const rawCatalog = JSON.parse(fs.readFileSync(catBackendPath, 'utf8'));

// 1. Create backups
fs.writeFileSync(`${catBackendPath}.bak`, JSON.stringify(rawCatalog, null, 2), 'utf8');
fs.writeFileSync(`${catDatasetPath}.bak`, JSON.stringify(rawCatalog, null, 2), 'utf8');
console.log('✅ Created backups at .bak locations.');

// Clone catalog
const newCatalog = JSON.parse(JSON.stringify(rawCatalog));

// 2. Dacia is already canonicalized
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

  // Decouple year range from genName: strip any baked-in (YYYY - YYYY) or (YYYY - Présent) suffix (supporting hyphen, en-dash, em-dash)
  cleaned = cleaned.replace(/\s*\(\d{4}\s*[-\u2013\u2014]\s*[^)]+\)$/, '').trim();
  return cleaned;
}

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

        if (model.generations) {
          genDef.sourceSlugs.forEach(srcSlug => {
            const srcGen = model.generations[srcSlug];
            if (srcGen && srcGen.engines) {
              rawEngines.push(...srcGen.engines);
            }
          });
        }

        const merged = [];
        for (const eng of rawEngines) {
          const enriched = enrichWithAuthenticSpec(mSlug, modSlug, genDef.genName, eng);
          const matchIdx = merged.findIndex(m => isSamePhysicalEngine(m, enriched));
          if (matchIdx !== -1) {
            merged[matchIdx] = mergeEngineRecords(merged[matchIdx], enriched);
            totalEnginesDeduped++;
          } else {
            merged.push({ ...enriched });
          }
        }

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

console.log('=== NORMALIZATION COMPLETE ===');
console.log(`Models processed: ${totalModelsCleaned}`);
console.log(`Generations collapsed into canonical nodes: ${totalGenerationsMerged}`);
console.log(`Duplicate physical engines merged: ${totalEnginesDeduped}`);
console.log(`Templated phantom engines tagged: ${totalPhantomsTagged}`);

// 3. Write output to both paths
fs.writeFileSync(catBackendPath, JSON.stringify(newCatalog, null, 2), 'utf8');
fs.writeFileSync(catDatasetPath, JSON.stringify(newCatalog, null, 2), 'utf8');
console.log('✅ Successfully wrote clean catalog hierarchy to:');
console.log('   -', catBackendPath);
console.log('   -', catDatasetPath);
