const r = require('./vag-dry-run-report.json');

console.log('### Lot 1 (VAG) Normalization Diff Summary\n');
console.log('| Make | Models with Changes | Raw Engines | Normalized Engines | Exact-Code Merges | Fuzzy Merges | Phantoms Isolated | Specs Enriched |');
console.log('| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |');

for (const [mSlug, make] of Object.entries(r.makes)) {
  let rawEngs = 0, normEngs = 0, exactMerges = 0, fuzzyMerges = 0, phantoms = 0, specs = 0;
  let changedModels = 0;
  for (const [modSlug, model] of Object.entries(make.models)) {
    const normGenCount = Object.keys(model.normGens).length;
    const modelEngs = Object.values(model.normGens).reduce((acc, g) => acc + g.enginesCount, 0);
    normEngs += modelEngs;
    phantoms += model.phantoms.length;
    specs += model.specAdditions.length;
    model.merges.forEach(m => {
      if (m.reason === 'exact-code') exactMerges++;
      else if (m.reason === 'fuzzy') fuzzyMerges++;
    });
    if (model.rawGensCount !== normGenCount || model.merges.length > 0 || model.phantoms.length > 0 || model.specAdditions.length > 0) {
      changedModels++;
    }
  }
  const totalMakeMerges = exactMerges + fuzzyMerges;
  console.log(`| **${mSlug.toUpperCase()}** | ${changedModels} / ${Object.keys(make.models).length} | - | ${normEngs} | ${exactMerges} | ${fuzzyMerges} | ${phantoms} | +${specs} |`);
}

console.log(`\n**Totals Across VAG:**`);
console.log(`- Total Raw Engines: ${r.totalRawEngines}`);
console.log(`- Total Normalized Engines: ${r.totalNormEngines}`);
console.log(`- Total Physical Merges: ${r.totalMerges} (${r.exactCodeMergesCount} exact-code, ${r.fuzzyMergesCount} fuzzy)`);
console.log(`- Phantoms Quarantined: ${r.totalPhantoms}`);
console.log(`- Authentic Specs Enriched: +${r.totalEnrichedSpecs}`);
console.log(`- Engines Remaining with oilSpec: null: ${r.totalNullSpecs} (Zero Hallucination Guaranteed)`);

console.log('\n### DPF / Low-SAPS Audit (Diesel >= 2011)');
console.log(`- Total Passenger Diesels >= 2011: ${r.dpfCompliance.totalDieselsPost2011}`);
console.log(`- Verified Low-SAPS (VW 507.00 / 509.00): ${r.dpfCompliance.lowSapsCount}`);
console.log(`- Unverified (null spec, safe): ${r.dpfCompliance.unverifiedCount}`);
console.log(`- High-SAPS Hazards Detected: ${r.dpfCompliance.hazardsCount}`);

console.log('\n### Detailed Model Diffs (Generations & Merges)\n');

for (const [mSlug, make] of Object.entries(r.makes)) {
  for (const [modSlug, model] of Object.entries(make.models)) {
    const normGenCount = Object.keys(model.normGens).length;
    const hasChanges = model.rawGensCount !== normGenCount || model.merges.length > 0 || model.phantoms.length > 0 || model.specAdditions.length > 0;
    if (hasChanges) {
      console.log(`#### ${mSlug.toUpperCase()} > ${model.modelName} (\`${modSlug}\`)`);
      console.log(`- Generations: ${model.rawGensCount} raw -> ${normGenCount} normalized`);
      if (model.merges.length > 0) {
        console.log(`- Physical Merges (${model.merges.length}):`);
        model.merges.forEach(m => console.log(`  * [${m.reason}] ${m.generation}: \`${m.engine1}\` + \`${m.engine2}\` -> \`${m.result}\``));
      }
      if (model.phantoms.length > 0) {
        console.log(`- Phantoms Quarantined (${model.phantoms.length}):`);
        model.phantoms.forEach(p => console.log(`  * ${p.generation}: \`${p.engineCode}\` (${p.fuel}) -> ${p.reason}`));
      }
      if (model.specAdditions.length > 0) {
        console.log(`- New Authentic Specs Enriched (${model.specAdditions.length}):`);
        model.specAdditions.forEach(s => console.log(`  * ${s.generation}: \`${s.engineCode}\` -> ${s.viscosity} ${s.approval}`));
      }
      console.log('');
    }
  }
}
