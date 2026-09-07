const fs = require('fs');
const path = require('path');

const autoDir = 'oil-finder-full-dataset';
const files = ['volkswagen', 'peugeot', 'renault', 'citroen', 'fiat', 'ford', 'opel', 'toyota'];

for (const f of files) {
  const p = path.join(autoDir, `automobile-${f}.json`);
  if (!fs.existsSync(p)) continue;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  console.log(`\n======================================================`);
  console.log(`MAKE: ${f.toUpperCase()} (${data.length} authentic entries)`);
  const byModel = {};
  for (const item of data) {
    const m = item.model;
    if (!byModel[m]) byModel[m] = [];
    byModel[m].push(item);
  }
  for (const [mod, items] of Object.entries(byModel)) {
    console.log(`  Model: ${mod} (${items.length} items)`);
    const genMap = {};
    for (const it of items) {
      const g = it.generation || 'NONE';
      if (!genMap[g]) genMap[g] = [];
      genMap[g].push(it);
    }
    for (const [g, gItems] of Object.entries(genMap)) {
      const yF = Math.min(...gItems.map(i => i.yearFrom).filter(Boolean));
      const yT = Math.max(...gItems.map(i => i.yearTo).filter(Boolean));
      const engs = gItems.map(i => `${i.engineCode} (${i.fuelType}, ${i.powerHp}hp)`).join(', ');
      console.log(`    - Gen: "${g}" (${yF} - ${yT}) -> [${engs}]`);
    }
  }
}
