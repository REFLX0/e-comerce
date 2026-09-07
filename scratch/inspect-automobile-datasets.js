const fs = require('fs');

const files = fs.readdirSync('oil-finder-full-dataset').filter(f => f.startsWith('automobile-') && f.endsWith('.json') && !f.includes('conflicts'));

console.log('Automobile files found:', files.length);
files.forEach(f => {
  const data = JSON.parse(fs.readFileSync('oil-finder-full-dataset/' + f, 'utf8'));
  const models = new Set(data.map(d => d.model));
  const gens = new Set(data.map(d => `${d.model} -> ${d.generation} (${d.yearFrom}-${d.yearTo})`));
  console.log(`${f.padEnd(30)}: ${String(data.length).padStart(4)} entries | ${String(models.size).padStart(2)} models | ${String(gens.size).padStart(3)} generations`);
});
