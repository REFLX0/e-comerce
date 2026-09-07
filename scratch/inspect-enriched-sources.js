const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');

const prevRaw = execSync('git show c6ac1e85:backend/src/oil-finder/clean-catalog-hierarchy.json', { maxBuffer: 50*1024*1024 }).toString();
const currRaw = fs.readFileSync('backend/src/oil-finder/clean-catalog-hierarchy.json', 'utf8');
const prevCat = JSON.parse(prevRaw);
const currCat = JSON.parse(currRaw);

// Map of prev specs: key = `${make}|${model}|${engineCode}`
const prevSpecKeys = new Set();
for (const [mSlug, make] of Object.entries(prevCat)) {
  for (const [modSlug, model] of Object.entries(make.models || {})) {
    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      for (const e of (gen.engines || [])) {
        if (e.oilSpec && e.oilSpec.viscosity) {
          prevSpecKeys.add(`${mSlug}|${modSlug}|${(e.engineCode||'').toLowerCase().trim()}`);
        }
      }
    }
  }
}

const newlyEnriched = [];

for (const [mSlug, make] of Object.entries(currCat)) {
  for (const [modSlug, model] of Object.entries(make.models || {})) {
    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      for (const e of (gen.engines || [])) {
        if (e.oilSpec && e.oilSpec.viscosity) {
          const k = `${mSlug}|${modSlug}|${(e.engineCode||'').toLowerCase().trim()}`;
          if (!prevSpecKeys.has(k)) {
            // Find in automobile-[brand].json
            const autoFile = `oil-finder-full-dataset/automobile-${mSlug}.json`;
            let srcInfo = 'Unknown source';
            if (fs.existsSync(autoFile)) {
              const fileContent = fs.readFileSync(autoFile, 'utf8');
              const lines = fileContent.split('\n');
              const arr = JSON.parse(fileContent);
              const idx = arr.findIndex(item => 
                (item.oilViscosity === e.oilSpec.viscosity) &&
                (e.engineCode.toLowerCase().includes((item.engineCode||'').toLowerCase()) || (item.engineCode||'').toLowerCase().includes(e.engineCode.toLowerCase()))
              );
              if (idx !== -1) {
                // Find line in file
                const targetStr = arr[idx].engineCode || arr[idx].oilViscosity;
                const lineNum = lines.findIndex(l => l.includes(targetStr)) + 1;
                srcInfo = `${autoFile}:${lineNum} (entry index ${idx})`;
              } else {
                srcInfo = `${autoFile} (matched on displacement/power)`;
              }
            }
            newlyEnriched.push({
              make: mSlug,
              model: modSlug,
              generation: gen.genName,
              engine: e.engineCode,
              viscosity: e.oilSpec.viscosity,
              approval: e.oilSpec.oemApproval || e.oilSpec.aceaStandard || 'N/A',
              source: srcInfo
            });
          }
        }
      }
    }
  }
}

console.log(`Total newly enriched engines with specs: ${newlyEnriched.length}`);
const byBrand = {};
newlyEnriched.forEach(n => {
  byBrand[n.make] = (byBrand[n.make] || []);
  byBrand[n.make].push(n);
});

for (const [b, list] of Object.entries(byBrand)) {
  console.log(`\n=== Brand: ${b.toUpperCase()} (${list.length} newly enriched) ===`);
  list.forEach(item => {
    console.log(`  - [${item.model}] ${item.engine} -> ${item.viscosity} (${item.approval}) | Source: ${item.source}`);
  });
}
