const fs = require('fs');
const path = require('path');

const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));

// Test inspecting Volkswagen, Peugeot, Renault
['volkswagen', 'peugeot', 'renault'].forEach(makeSlug => {
  const make = catalog[makeSlug];
  console.log('================================================================');
  console.log(`MAKE: ${make.makeName} (${makeSlug})`);
  console.log('================================================================');
  for (const [modSlug, mod] of Object.entries(make.models)) {
    console.log(`\nModel: ${mod.modelName} (${modSlug})`);
    for (const [genSlug, gen] of Object.entries(mod.generations)) {
      console.log(`  Gen: "${gen.genName}" (slug: ${genSlug}) [${gen.yearFrom || 'null'}-${gen.yearTo || 'null'}] (${gen.engines.length} engines)`);
      gen.engines.slice(0, 4).forEach(e => {
        const spec = e.oilSpec ? `${e.oilSpec.viscosity} ${e.oilSpec.oemApproval || ''}` : 'null';
        console.log(`    - ${e.engineCode} | ${e.fuelType} | ${e.displacementCc}cc | ${e.powerHp}hp | ${spec}`);
      });
      if (gen.engines.length > 4) {
        console.log(`    ... and ${gen.engines.length - 4} more`);
      }
    }
  }
});
