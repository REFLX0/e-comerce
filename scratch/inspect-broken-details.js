const fs = require('fs');

const catPath = 'backend/src/oil-finder/clean-catalog-hierarchy.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));

const testCases = [
  { make: 'volkswagen', model: 'golf' },
  { make: 'volkswagen', model: 'polo' },
  { make: 'peugeot', model: '206' },
  { make: 'peugeot', model: '207' },
  { make: 'peugeot', model: '208' },
  { make: 'peugeot', model: '308' },
  { make: 'renault', model: 'clio' },
  { make: 'renault', model: 'megane' },
  { make: 'citroen', model: 'c3' },
  { make: 'citroen', model: 'c4' },
  { make: 'citroen', model: 'c-elysee' },
  { make: 'fiat', model: 'punto' },
  { make: 'fiat', model: '500' },
  { make: 'opel', model: 'corsa' },
  { make: 'opel', model: 'astra' },
  { make: 'seat', model: 'ibiza' },
  { make: 'seat', model: 'leon' },
  { make: 'skoda', model: 'octavia' },
  { make: 'skoda', model: 'fabia' },
  { make: 'ford', model: 'fiesta' },
  { make: 'ford', model: 'focus' },
  { make: 'audi', model: 'a3' },
  { make: 'audi', model: 'a4' },
  { make: 'toyota', model: 'yaris' },
  { make: 'toyota', model: 'corolla' },
  { make: 'hyundai', model: 'i20' },
  { make: 'kia', model: 'rio' },
  { make: 'nissan', model: 'micra' }
];

for (const tc of testCases) {
  const m = catalog[tc.make];
  if (!m) {
    console.log(`Make NOT FOUND: ${tc.make}`);
    continue;
  }
  const mod = m.models?.[tc.model];
  if (!mod) {
    console.log(`Model NOT FOUND: ${tc.make} -> ${tc.model}`);
    continue;
  }
  console.log(`\n======================================================`);
  console.log(`[${tc.make.toUpperCase()}] ${mod.modelName} (${tc.model})`);
  for (const [gSlug, gen] of Object.entries(mod.generations || {})) {
    const engCount = (gen.engines || []).length;
    const engSample = (gen.engines || []).slice(0, 3).map(e => e.engineCode).join(', ');
    console.log(`  - genSlug: "${gSlug}" | genName: "${gen.genName}" | years: ${gen.yearFrom || '?'}-${gen.yearTo || '?'} | [${engCount} engs: ${engSample}...]`);
  }
}
