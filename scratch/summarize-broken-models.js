const fs = require('fs');

const report = JSON.parse(fs.readFileSync('scratch/all-auto-makes-report.json', 'utf8'));

let totalModels = 0;
let singleGenModels = 0;
let multiGenModels = 0;
let brokenModels = 0;

const brokenList = [];

for (const [mSlug, m] of Object.entries(report)) {
  for (const [modSlug, mod] of Object.entries(m.models)) {
    totalModels++;
    const gens = mod.generations;
    if (gens.length <= 1) {
      singleGenModels++;
    } else {
      multiGenModels++;
    }
    const hasBroken = gens.some(g => 
      g.slug.includes('_') || g.slug.includes('(') || g.name.startsWith('(') || 
      g.name.includes('/(') || g.name.endsWith('(') || /^[A-Z0-9_]{2,6}$/.test(g.name) ||
      /\([0-9][A-Z]/.test(g.name)
    );
    if (hasBroken) {
      brokenModels++;
      brokenList.push({
        make: mSlug,
        model: modSlug,
        modelName: mod.name,
        genCount: gens.length,
        gens: gens.map(g => `${g.slug} ("${g.name}")`)
      });
    }
  }
}

console.log(`Total automobile models: ${totalModels}`);
console.log(`Single-gen models: ${singleGenModels}`);
console.log(`Multi-gen models: ${multiGenModels}`);
console.log(`Models with broken / raw chassis slugs: ${brokenModels}`);

fs.writeFileSync('scratch/broken-models-list.json', JSON.stringify(brokenList, null, 2), 'utf8');
console.log('Saved broken models list to scratch/broken-models-list.json');
