const fs = require('fs');
const path = require('path');

// Import resolveAutomotiveOemSpec from compiled or ts-node, or replicate its exact logic
// Let's check how many total cars are in the datasets
const datasetDir = path.resolve(__dirname, '..', 'oil-finder-full-dataset');
const files = fs.readdirSync(datasetDir).filter(f => f.startsWith('automobile-') && f.endsWith('.json') && !f.includes('conflicts'));

console.log(`Found ${files.length} automobile dataset files.`);

let totalCars = 0;
const allCars = [];

files.forEach(file => {
  const content = JSON.parse(fs.readFileSync(path.join(datasetDir, file), 'utf8'));
  console.log(`${file}: ${content.length} cars`);
  totalCars += content.length;
  content.forEach((car, index) => {
    allCars.push({
      file,
      index,
      ...car,
    });
  });
});

console.log(`\nTotal cars across all datasets: ${totalCars}`);

// Let's audit all cars for dataset-internal inconsistencies:
// 1. Viscosity vs OEM contradictions:
// - WSS-M2C950-A MUST be 0W-30
// - WSS-M2C948-B MUST be 5W-20
// - WSS-M2C913-D / C MUST be 5W-30
// - PSA B71 2312 MUST be 0W-30
// - PSA B71 2290 MUST be 5W-30
// - PSA B71 2010 MUST be 0W-20
// - VW 508.00 / 509.00 MUST be 0W-20
// - VW 504.00 / 507.00 MUST be 5W-30 (or 0W-30)
// - VW 502.00 / 505.00 MUST be 5W-40 (or 5W-30)
// - Fiat 9.55535-GS1 MUST be 0W-30
// - Fiat 9.55535-DS1 MUST be 0W-20 or 0W-30
// - Fiat 9.55535-S1 MUST be 5W-30
// - Fiat 9.55535-S2 MUST be 5W-40
// - BMW LL-17 FE+ MUST be 0W-20
// - BMW LL-04 MUST be 5W-30 (or 0W-30)
// - BMW LL-01 MUST be 5W-30 or 5W-40
// - MB 229.71 / 229.72 MUST be 0W-20
// - MB 229.51 / 229.52 MUST be 5W-30
// - Renault RN17 FE MUST be 0W-20
// - Renault RN17 MUST be 5W-30
// - Renault RN0720 MUST be 5W-30
// - Volvo VCC RBS0-2AE MUST be 0W-20
// - Volvo VCC 95200377 MUST be 0W-30
// - JLR STJLR.03.5007 MUST be 0W-30
// - JLR STJLR.51.5122 MUST be 0W-20

const contradictions = [];
const missingOem = [];

allCars.forEach(car => {
  const oem = (car.oilSpecOEM || '').toUpperCase();
  const visc = (car.oilViscosity || '').toUpperCase().trim();

  if (!car.oilSpecOEM) {
    missingOem.push({
      file: car.file,
      car: `${car.make} ${car.model} ${car.engineCode || car.generation || ''}`,
      visc: car.oilViscosity,
    });
  }

  // Check Ford WSS-M2C950-A
  if (oem.includes('950-A') && visc !== '0W-30') {
    contradictions.push({
      file: car.file,
      car: `${car.make} ${car.model} ${car.engineCode || ''}`,
      issue: `WSS-M2C950-A requires 0W-30, but dataset has ${visc}`,
      carObj: car,
    });
  }
  // Check Ford WSS-M2C948-B
  if (oem.includes('948-B') && visc !== '5W-20') {
    contradictions.push({
      file: car.file,
      car: `${car.make} ${car.model} ${car.engineCode || ''}`,
      issue: `WSS-M2C948-B requires 5W-20, but dataset has ${visc}`,
      carObj: car,
    });
  }
  // Check PSA B71 2312
  if (oem.includes('B71 2312') && visc !== '0W-30') {
    contradictions.push({
      file: car.file,
      car: `${car.make} ${car.model} ${car.engineCode || ''}`,
      issue: `PSA B71 2312 requires 0W-30, but dataset has ${visc}`,
      carObj: car,
    });
  }
  // Check PSA B71 2290
  if (oem.includes('B71 2290') && visc !== '5W-30') {
    contradictions.push({
      file: car.file,
      car: `${car.make} ${car.model} ${car.engineCode || ''}`,
      issue: `PSA B71 2290 requires 5W-30, but dataset has ${visc}`,
      carObj: car,
    });
  }
  // Check VW 508.00 / 509.00
  if ((oem.includes('508.00') || oem.includes('508 00')) && visc !== '0W-20') {
    contradictions.push({
      file: car.file,
      car: `${car.make} ${car.model} ${car.engineCode || ''}`,
      issue: `VW 508.00 requires 0W-20, but dataset has ${visc}`,
      carObj: car,
    });
  }
  // Check Fiat 9.55535-GS1
  if (oem.includes('GS1') && visc !== '0W-30' && visc !== '0W-20') {
    contradictions.push({
      file: car.file,
      car: `${car.make} ${car.model} ${car.engineCode || ''}`,
      issue: `Fiat 9.55535-GS1 requires 0W-30, but dataset has ${visc}`,
      carObj: car,
    });
  }
  // Check Fiat 9.55535-S2
  if (oem.includes('9.55535-S2') && visc !== '5W-40') {
    contradictions.push({
      file: car.file,
      car: `${car.make} ${car.model} ${car.engineCode || ''}`,
      issue: `Fiat 9.55535-S2 requires 5W-40, but dataset has ${visc}`,
      carObj: car,
    });
  }
  // Check Fiat 9.55535-S1
  if (oem.includes('9.55535-S1') && visc !== '5W-30') {
    contradictions.push({
      file: car.file,
      car: `${car.make} ${car.model} ${car.engineCode || ''}`,
      issue: `Fiat 9.55535-S1 requires 5W-30, but dataset has ${visc}`,
      carObj: car,
    });
  }
});

console.log('\n--- DATASET CONTRADICTIONS ---');
console.log(`Found ${contradictions.length} contradictions:`);
contradictions.forEach(c => console.log(`  [${c.file}] ${c.car}: ${c.issue}`));

console.log('\n--- MISSING OEM SPECS ---');
console.log(`Found ${missingOem.length} vehicles with missing OEM spec:`);
missingOem.forEach(m => console.log(`  [${m.file}] ${m.car} (${m.visc})`));
