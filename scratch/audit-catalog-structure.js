const fs = require('fs');

const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));

console.log('Total makes in catalog:', Object.keys(catalog).length);

const brokenGens = [];
const brokenModels = [];
const makeStats = [];

for (const [mSlug, make] of Object.entries(catalog)) {
  const isAuto = (make.categories || []).includes('automobile') || !make.categories;
  let modelCount = 0;
  let genCount = 0;
  let engineCount = 0;
  let brokenMakeGens = 0;

  for (const [modSlug, model] of Object.entries(make.models || {})) {
    modelCount++;
    if (modSlug.includes('(') || model.modelName.includes('(') || modSlug.includes('_') || /^[a-z0-9]+-[0-9]+[a-z]?$/i.test(modSlug)) {
      // Check if it looks like a chassis code
    }

    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      genCount++;
      const engs = gen.engines || [];
      engineCount += engs.length;

      // Check for broken regex slices
      // e.g. names starting with "(" or containing unclosed parens or codes like "1J1", "2A/C", "5G1", "5N_"
      const name = gen.genName || '';
      if (name.startsWith('(') || name.includes('(/') || /\([0-9][A-Z]/.test(name) || /^[A-Z0-9_]{2,6}$/.test(name) || gSlug.includes('_') || gSlug.startsWith('(')) {
        brokenGens.push({ make: mSlug, model: modSlug, genSlug: gSlug, genName: name });
        brokenMakeGens++;
      }
    }
  }

  makeStats.push({
    make: mSlug,
    name: make.makeName,
    isAuto,
    models: modelCount,
    gens: genCount,
    engines: engineCount,
    brokenGens: brokenMakeGens
  });
}

console.log(`\nTotal broken generation names flagged: ${brokenGens.length}`);
console.log('\nTop 20 makes with broken generation fragments:');
makeStats.sort((a, b) => b.brokenGens - a.brokenGens).slice(0, 20).forEach(m => {
  if (m.brokenGens > 0) {
    console.log(`  - ${m.name} (${m.make}): ${m.brokenGens} broken gens / ${m.gens} total gens (Models: ${m.models})`);
  }
});

console.log('\nSample broken generations:');
brokenGens.slice(0, 25).forEach(b => {
  console.log(`  [${b.make} -> ${b.model}] slug: "${b.genSlug}" | name: "${b.genName}"`);
});
