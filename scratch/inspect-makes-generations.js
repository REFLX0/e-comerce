const fs = require('fs');
const path = require('path');

const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));

const autoDir = 'oil-finder-full-dataset';
const autoFiles = fs.readdirSync(autoDir).filter(f => f.startsWith('automobile-') && f.endsWith('.json') && !f.includes('conflicts'));

console.log('Automobile datasets available:', autoFiles.length);

const summary = [];

for (const file of autoFiles) {
  const makeSlug = file.replace('automobile-', '').replace('.json', '');
  const rawData = JSON.parse(fs.readFileSync(path.join(autoDir, file), 'utf8'));
  
  // Collect all unique models and generations from authentic dataset
  const datasetModels = {};
  for (const item of rawData) {
    const mod = item.model;
    if (!datasetModels[mod]) datasetModels[mod] = new Set();
    if (item.generation) datasetModels[mod].add(item.generation);
  }
  
  const catMake = catalog[makeSlug] || Object.values(catalog).find(m => m.makeSlug === makeSlug);
  const catModels = catMake && catMake.models ? Object.keys(catMake.models) : [];
  
  summary.push({
    makeSlug,
    makeName: catMake?.makeName || makeSlug,
    datasetEntries: rawData.length,
    datasetModels: Object.keys(datasetModels),
    catModelsCount: catModels.length,
    catModels: catModels
  });
}

for (const s of summary) {
  console.log(`\n======================================================`);
  console.log(`Make: ${s.makeName} (${s.makeSlug})`);
  console.log(`Dataset Models (${s.datasetModels.length}):`, s.datasetModels.join(', '));
  console.log(`Catalog Models (${s.catModelsCount}):`, s.catModels.join(', '));
}
