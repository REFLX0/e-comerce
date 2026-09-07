const fs = require('fs');

const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));
const dacia = catalog['dacia'];

['dokker', 'sandero', 'logan', 'duster'].forEach(modelSlug => {
  const model = dacia.models[modelSlug];
  console.log('================================================================');
  console.log('MODEL: ' + modelSlug.toUpperCase());
  console.log('================================================================');
  for (const [genSlug, g] of Object.entries(model.generations)) {
    console.log(`\n  GENERATION: "${g.genName}" (slug: ${genSlug}) [Years: ${g.yearFrom || 'null'} - ${g.yearTo || 'null'}] (Engines: ${g.engines.length})`);
    g.engines.forEach(e => {
      const spec = e.oilSpec ? `${e.oilSpec.viscosity} | Approval: ${e.oilSpec.oemApproval || 'none'} | ACEA: ${e.oilSpec.aceaStandard || 'none'} | Cap: ${e.oilSpec.capacityLiters || 'none'}L` : 'null';
      console.log(`    - [${e.engineCode}] ${e.fuelType || 'unknown'} | ${e.displacementCc || 'null'}cc | ${e.powerHp || 'null'}hp (${e.powerKw || 'null'}kW) | oilSpec: ${spec}`);
    });
  }
});
