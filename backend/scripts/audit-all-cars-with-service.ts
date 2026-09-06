import * as fs from 'fs';
import * as path from 'path';
import { resolveAutomotiveOemSpec } from '../src/oil-finder/oil-finder.service';

const datasetDir = path.resolve(__dirname, '..', '..', 'oil-finder-full-dataset');
const files = fs.readdirSync(datasetDir).filter(
  (f) => f.startsWith('automobile-') && f.endsWith('.json') && !f.includes('conflicts')
);

console.log(`Auditing ALL cars across ${files.length} dataset files...\n`);

interface CarEntry {
  make: string;
  model: string;
  generation?: string;
  yearFrom?: number;
  yearTo?: number;
  engineCode?: string;
  displacementCc?: number;
  fuelType?: string;
  powerHp?: number;
  powerKw?: number;
  oilViscosity: string;
  oilSpecAPI?: string;
  oilSpecACEA?: string;
  oilSpecOEM?: string;
  oilCapacityLiters?: number;
}

let totalCars = 0;
const results: {
  file: string;
  car: string;
  datasetVisc: string;
  datasetOem: string | null;
  resolvedVisc: string;
  resolvedOem: string;
  viscMatch: boolean;
  issue?: string;
}[] = [];

for (const file of files) {
  const content: CarEntry[] = JSON.parse(fs.readFileSync(path.join(datasetDir, file), 'utf8'));
  for (const car of content) {
    totalCars++;
    const carDesc = `${car.make} ${car.model} ${car.engineCode || car.generation || ''}`;

    const resolvedWithEngine = resolveAutomotiveOemSpec(
      car.make,
      car.model,
      car.engineCode || car.generation || '',
      car.yearFrom,
      car.yearTo
    );

    const datasetVisc = (car.oilViscosity || '').trim().toUpperCase();
    const resolvedVisc = (resolvedWithEngine.viscosity || '').trim().toUpperCase();
    const viscMatch = datasetVisc === resolvedVisc;

    let issue: string | undefined;

    // Check known critical mismatches
    if (!viscMatch) {
      issue = `Viscosity mismatch: dataset=${datasetVisc} vs resolver=${resolvedVisc}`;
    }

    results.push({
      file,
      car: carDesc,
      datasetVisc,
      datasetOem: car.oilSpecOEM || null,
      resolvedVisc,
      resolvedOem: resolvedWithEngine.oemApproval,
      viscMatch,
      issue,
    });
  }
}

console.log(`Total cars processed: ${totalCars}`);
const mismatches = results.filter((r) => !r.viscMatch);
console.log(`Total viscosity mismatches between dataset and resolver: ${mismatches.length}\n`);

// Write full report to JSON
fs.writeFileSync(
  path.join(__dirname, '..', 'audit-cars-report.json'),
  JSON.stringify(
    {
      totalCars,
      mismatchCount: mismatches.length,
      mismatches,
      allResults: results,
    },
    null,
    2
  )
);
console.log('Written full audit report to audit-cars-report.json');
