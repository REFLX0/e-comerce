const fs = require('fs');
const path = require('path');
const { authenticSpecs } = require('./catalog-normalizer-core');

const catBackendPath = path.resolve('backend/src/oil-finder/clean-catalog-hierarchy.json');
const rawCatalog = JSON.parse(fs.readFileSync(catBackendPath, 'utf8'));

console.log('=== STEP 1: AUDIT SPEC-ENRICHMENT CONTAMINATION BUG ===\n');

// Inspect all authentic specs for Dacia and VAG
const relevantMakes = ['dacia', 'volkswagen', 'audi', 'seat', 'skoda', 'cupra'];
const relevantAuthentics = authenticSpecs.filter(a => relevantMakes.includes(a.make));

console.log(`Found ${relevantAuthentics.length} authentic specs for Dacia + VAG.`);

// Let's print each authentic spec to see its generation and years
console.log('\n--- AUTHENTIC SPECS AVAILABLE (DACIA + VAG) ---');
relevantAuthentics.forEach((a, i) => {
  console.log(`${i + 1}. [${a.make.toUpperCase()}] ${a.model} | Gen: "${a.generation}" | Code: "${a.engineCode}" | Fuel: ${a.fuelType} | Years: ${a.yearFrom || '?'}-${a.yearTo || '?'} | Spec: ${a.oilSpec.viscosity} ${a.oilSpec.oemApproval || ''}`);
});
