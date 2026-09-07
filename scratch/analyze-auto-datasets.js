const fs = require('fs');
const path = require('path');

const autoDir = 'oil-finder-full-dataset';
const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));

const files = fs.readdirSync(autoDir).filter(f => f.startsWith('automobile-') && f.endsWith('.json') && !f.includes('lookup-conflicts'));

console.log('Found automobile dataset files:', files.length);

for (const file of files) {
  const fullPath = path.join(autoDir, file);
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const makeSlugFromFile = file.replace('automobile-', '').replace('.json', '');
  
  // Sample structure
  const firstKey = Object.keys(data)[0];
  const sample = data[firstKey];
  
  // Check if make exists in clean-catalog-hierarchy.json
  const catMake = catalog[makeSlugFromFile] || Object.values(catalog).find(m => m.makeSlug === makeSlugFromFile);
  const catModelCount = catMake && catMake.models ? Object.keys(catMake.models).length : 0;
  
  console.log(`\n------------------------------------------------------------`);
  console.log(`File: ${file} -> make: ${makeSlugFromFile} (In Catalog: ${!!catMake}, models: ${catModelCount})`);
  console.log(`Sample item key: ${firstKey}`);
  console.log(`Sample fields:`, Object.keys(sample || {}));
  if (sample) {
    console.log(`  make: "${sample.make}", model: "${sample.model}", generation: "${sample.generation}"`);
    console.log(`  engineCode: "${sample.engineCode}", fuel: "${sample.fuelType}", cc: ${sample.displacementCc}, hp: ${sample.powerHp}`);
    console.log(`  oilSpec:`, sample.oilSpec ? `${sample.oilSpec.viscosity} | ${sample.oilSpec.oemApproval}` : 'null');
  }
}
