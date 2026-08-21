import fs from 'fs';
import path from 'path';

const DATA_DIR = '/oil-finder-full-dataset';
const files = fs.readdirSync(DATA_DIR).filter(f => /^(automobile|moto|poids-lourd|agricole|marine)-.+\\.json$/i.test(f) && !f.includes('conflicts'));

for (const file of files) {
  const filePath = path.join(DATA_DIR, file);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [i, entry] of raw.entries()) {
    const e = entry;
    // Check if missing required fields (handling agricole's engineOilViscosity vs oilViscosity)
    const viscosity = e.oilViscosity || e.engineOilViscosity;
    if (!e.make || !e.model || !e.fuelType || !viscosity || !e.source || !e.confidence) {
      console.log(`[MALFORMED] ${file}[${i}]: ${e.make} ${e.model} - missing fields`);
      continue;
    }
    // Check fractional HP
    if (e.powerHp != null && !Number.isInteger(e.powerHp)) {
      console.log(`[FRACTIONAL] ${file}[${i}]: ${e.make} ${e.model} - powerHp=${e.powerHp}`);
    }
  }
}
