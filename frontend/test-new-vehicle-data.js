const { chromium } = require('playwright');
const assert = require('assert');
const BASE = 'http://localhost:8082/en';

const COMBOS = [
  { label: 'Dacia Sandero 1.0 SCe', make: 'dacia', model: 'sandero', engine: '1.0 SCe', expect: 1 },
  { label: 'Dacia Duster 1.6 16V', make: 'dacia', model: 'duster', engine: '1.6 16V', expect: 1 },
  { label: 'Hyundai i10 1.2 MPI', make: 'hyundai', model: 'i10', engine: '1.2 MPI', expect: 1 },
  { label: 'Fiat Doblo 1.3 Multijet', make: 'fiat', model: 'doblo', engine: '1.3 Multijet', expect: 1 },
];

(async () => {
  const b = await chromium.launch({ headless: true });
  let passed = 0;

  for (const combo of COMBOS) {
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    try {
      const url = `${BASE}/catalogue?make=${combo.make}&model=${combo.model}&engine=${encodeURIComponent(combo.engine)}`;
      await p.goto(url, { waitUntil: 'load', timeout: 30000 });
      await p.waitForTimeout(3000);
      const body = await p.locator('body').innerText();
      const countMatch = body.match(/(\d+)\s*produit/);
      const count = countMatch ? parseInt(countMatch[1]) : 0;
      const isEmpty = body.includes('Aucune huile trouvée');
      const hasBadge = body.includes('Recherche par véhicule');
      console.log(`${combo.label}: ${count} products, empty=${isEmpty}, badge=${hasBadge} → ${count >= combo.expect && !isEmpty ? 'PASS' : 'FAIL'}`);
      if (count >= combo.expect && !isEmpty) passed++;
    } catch (e) {
      console.log(`${combo.label}: ERROR ${e.message} → FAIL`);
    }
    await p.close();
  }

  console.log(`\n${passed}/${COMBOS.length} passed (new vehicle data)`);
  await b.close();
  process.exit(passed < COMBOS.length ? 1 : 0);
})();
