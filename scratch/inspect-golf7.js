const fs = require('fs');
const execSync = require('child_process').execSync;

const prevRaw = execSync('git show c6ac1e85:backend/src/oil-finder/clean-catalog-hierarchy.json', { maxBuffer: 50*1024*1024 }).toString();
const currRaw = fs.readFileSync('backend/src/oil-finder/clean-catalog-hierarchy.json', 'utf8');
const prevCat = JSON.parse(prevRaw);
const currCat = JSON.parse(currRaw);

console.log('=== BEFORE (c6ac1e85) Golf Generations under Volkswagen ===');
const prevGolf = prevCat.volkswagen?.models?.golf;
if (prevGolf) {
  for (const [slug, g] of Object.entries(prevGolf.generations || {})) {
    if (slug.includes('vii') || slug.includes('5g1') || g.genName.includes('VII')) {
      console.log(`\nGeneration slug: "${slug}", genName: "${g.genName}" (${g.yearFrom} - ${g.yearTo})`);
      console.log(`Total engines: ${g.engines?.length}`);
      g.engines?.forEach((e, idx) => {
        console.log(`  [${idx+1}] code: "${e.engineCode}", fuel: "${e.fuelType}", cc: ${e.displacementCc}, hp: ${e.powerHp}, oil: ${JSON.stringify(e.oilSpec)}, isTemplated: ${e.isTemplatedSeed}`);
      });
    }
  }
}

console.log('\n=== AFTER (788cd7db) Golf VII under Volkswagen ===');
const currGolf = currCat.volkswagen?.models?.golf;
if (currGolf) {
  for (const [slug, g] of Object.entries(currGolf.generations || {})) {
    if (slug === 'golf-vii') {
      console.log(`\nGeneration slug: "${slug}", genName: "${g.genName}" (${g.yearFrom} - ${g.yearTo})`);
      console.log(`Total engines: ${g.engines?.length}`);
      g.engines?.forEach((e, idx) => {
        console.log(`  [${idx+1}] code: "${e.engineCode}", fuel: "${e.fuelType}", cc: ${e.displacementCc}, hp: ${e.powerHp}, oil: ${JSON.stringify(e.oilSpec)}, isTemplated: ${e.isTemplatedSeed}, note: "${e.verificationNote || ''}"`);
      });
    }
  }
}
