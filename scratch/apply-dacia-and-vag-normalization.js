const fs = require('fs');
const path = require('path');
const {
  isSamePhysicalEngine,
  getEngineMatchReason,
  mergeEngineRecords,
  tagTemplatedPhantoms,
  enrichWithAuthenticSpec
} = require('./catalog-normalizer-core');
const { CANONICAL_SCHEMAS } = require('./canonical-schemas');

const catBackendPath = path.resolve('backend/src/oil-finder/clean-catalog-hierarchy.json');
const catDatasetPath = path.resolve('oil-finder-full-dataset/clean-catalog-hierarchy.json');

const catalog = JSON.parse(fs.readFileSync(catBackendPath, 'utf8'));

const VAG_MAKES = ['volkswagen', 'audi', 'seat', 'skoda', 'cupra'];

function cleanRawGenName(name, modelName, genCount, yearFrom, yearTo, key) {
  if (!name) return modelName || 'Standard';
  let cleaned = name
    .replace(/^[\s/(]+/, '')
    .replace(/_$/, '')
    .replace(/,\s*_$/, '')
    .trim();

  const openCount = (cleaned.match(/\(/g) || []).length;
  const closeCount = (cleaned.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    cleaned += ')'.repeat(openCount - closeCount);
  }

  if (/^[A-Z0-9_-]{2,8}$/.test(cleaned)) {
    if (cleaned.toLowerCase() === modelName.toLowerCase()) {
      cleaned = `${modelName} (Standard)`;
    } else if (genCount === 1) {
      cleaned = `${modelName} (${cleaned})`;
    } else {
      cleaned = `${modelName} - ${cleaned}`;
    }
  }

  cleaned = cleaned.replace(/\s*\(\d{4}\s*[-\u2013\u2014]\s*[^)]+\)$/, '').trim();
  return cleaned;
}

console.log('=== APPLYING DACIA + VAG NORMALIZATION TO CATALOG FILES ===\n');

// 1. Confirm Dacia is present and clean
if (!catalog['dacia']) {
  throw new Error('Dacia not found in catalog!');
}
console.log('Dacia verified present in catalog.');

// 2. Normalize VAG makes
for (const mSlug of VAG_MAKES) {
  const make = catalog[mSlug];
  if (!make) {
    console.log(`[WARN] Make ${mSlug} not found in catalog!`);
    continue;
  }

  console.log(`Normalizing make: ${mSlug.toUpperCase()}`);
  const makeSchema = CANONICAL_SCHEMAS[mSlug] || {};
  const newModels = {};

  for (const [modSlug, model] of Object.entries(make.models || {})) {
    const modelSchema = makeSchema[modSlug];
    const newGenerations = {};

    if (modelSchema) {
      // ── Process with Canonical Schema ──
      for (const [genSlug, genDef] of Object.entries(modelSchema.generations)) {
        const rawEngines = [];
        if (model.generations) {
          genDef.sourceSlugs.forEach(srcSlug => {
            const srcGen = model.generations[srcSlug];
            if (srcGen) {
              (srcGen.engines || []).forEach(e => {
                rawEngines.push({ ...e });
              });
            }
          });
        }

        const merged = [];
        for (const eng of rawEngines) {
          const enriched = enrichWithAuthenticSpec(mSlug, modSlug, genDef.genName, eng, genDef.yearFrom, genDef.yearTo);
          const matchIdx = merged.findIndex(m => isSamePhysicalEngine(m, enriched));
          if (matchIdx !== -1) {
            merged[matchIdx] = mergeEngineRecords(merged[matchIdx], enriched);
          } else {
            merged.push({ ...enriched });
          }
        }

        const taggedEngines = tagTemplatedPhantoms(mSlug, modSlug, genSlug, merged);
        newGenerations[genSlug] = {
          genName: genDef.genName,
          genSlug: genSlug,
          yearFrom: genDef.yearFrom || null,
          yearTo: genDef.yearTo || null,
          engines: taggedEngines
        };
      }
    } else {
      // ── Process with Fallback Normalizer ──
      for (const [gSlug, gen] of Object.entries(model.generations || {})) {
        const rawEngines = (gen.engines || []).map(e => ({ ...e }));
        const genCount = Object.keys(model.generations || {}).length;
        const key = `${mSlug}_${modSlug}_${gSlug}`;
        const cleanName = cleanRawGenName(gen.genName || gSlug, model.modelName, genCount, gen.yearFrom, gen.yearTo, key);

        const merged = [];
        for (const eng of rawEngines) {
          const enriched = enrichWithAuthenticSpec(mSlug, modSlug, cleanName, eng, gen.yearFrom, gen.yearTo);
          const matchIdx = merged.findIndex(m => isSamePhysicalEngine(m, enriched));
          if (matchIdx !== -1) {
            merged[matchIdx] = mergeEngineRecords(merged[matchIdx], enriched);
          } else {
            merged.push({ ...enriched });
          }
        }

        const taggedEngines = tagTemplatedPhantoms(mSlug, modSlug, gSlug, merged);
        newGenerations[gSlug] = {
          genName: cleanName,
          genSlug: gSlug,
          yearFrom: gen.yearFrom || null,
          yearTo: gen.yearTo || null,
          engines: taggedEngines
        };
      }
    }

    newModels[modSlug] = {
      modelName: model.modelName,
      modelSlug: model.modelSlug || modSlug,
      generations: newGenerations
    };
  }

  catalog[mSlug] = {
    makeName: make.makeName,
    makeSlug: make.makeSlug || mSlug,
    models: newModels
  };
}

console.log('\nWriting to backend/src/oil-finder/clean-catalog-hierarchy.json...');
fs.writeFileSync(catBackendPath, JSON.stringify(catalog, null, 2), 'utf8');

console.log('Writing to oil-finder-full-dataset/clean-catalog-hierarchy.json...');
fs.writeFileSync(catDatasetPath, JSON.stringify(catalog, null, 2), 'utf8');

console.log('\nSUCCESS: Both catalog hierarchy files updated for Dacia + VAG.');
