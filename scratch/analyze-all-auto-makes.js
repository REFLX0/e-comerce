const fs = require('fs');

const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));

const report = {};

for (const [mSlug, make] of Object.entries(catalog)) {
  const isAuto = (make.categories || []).includes('automobile') || !make.categories;
  if (!isAuto) continue;

  report[mSlug] = {
    name: make.makeName,
    models: {}
  };

  for (const [modSlug, model] of Object.entries(make.models || {})) {
    if (model.category && model.category !== 'automobile') continue;
    report[mSlug].models[modSlug] = {
      name: model.modelName,
      generations: Object.keys(model.generations || {}).map(gSlug => {
        const g = model.generations[gSlug];
        return {
          slug: gSlug,
          name: g.genName,
          yearFrom: g.yearFrom,
          yearTo: g.yearTo,
          engCount: (g.engines || []).length
        };
      })
    };
  }
}

fs.writeFileSync('scratch/all-auto-makes-report.json', JSON.stringify(report, null, 2), 'utf8');
console.log(`Saved report for ${Object.keys(report).length} automobile makes.`);

// Print summary of makes with fragmented generations (more than 3 gens or having chassis slugs)
for (const [mSlug, m] of Object.entries(report)) {
  const fragModels = [];
  for (const [modSlug, mod] of Object.entries(m.models)) {
    const broken = mod.generations.filter(g => 
      g.slug.includes('_') || g.slug.includes('(') || g.name.startsWith('(') || 
      g.slug.length <= 3 || g.name.includes('/(') || g.name.endsWith('(')
    );
    if (broken.length > 0 || mod.generations.length > 5) {
      fragModels.push(`${modSlug} (${mod.generations.length} gens, ${broken.length} broken)`);
    }
  }
  if (fragModels.length > 0) {
    console.log(`- ${m.name} (${mSlug}): ${fragModels.join('; ')}`);
  }
}
