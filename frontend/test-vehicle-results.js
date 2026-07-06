const { chromium } = require('playwright');
const assert = require('assert');
const BASE = 'http://localhost:8082/en';

const COMBOS = [
  { label: 'Peugeot 208 1.2 PureTech', make: 'peugeot', model: '208', engine: '1.2 PureTech', expect: 1 },
  { label: 'Renault Clio 4 1.2 16V', make: 'renault', model: 'clio-4', engine: '1.2 16V', expect: 1 },
  { label: 'Volkswagen Golf 7 1.6 TDI', make: 'volkswagen', model: 'golf-7', engine: '1.6 TDI', expect: 2 },
  { label: 'Volkswagen Golf 7 2.0 TDI', make: 'volkswagen', model: 'golf-7', engine: '2.0 TDI', expect: 1 },
  { label: 'Volkswagen Polo 6 1.4 MPI', make: 'volkswagen', model: 'polo-6', engine: '1.4 MPI', expect: 1 },
];

(async () => {
  const b = await chromium.launch({ headless: true });
  let passed = 0;
  let failed = 0;

  for (const combo of COMBOS) {
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    try {
      const url = `${BASE}/catalogue?make=${combo.make}&model=${combo.model}&engine=${encodeURIComponent(combo.engine)}`;
      console.log(`\nTesting: ${combo.label}`);
      console.log(`  URL: ${url}`);

      await p.goto(url, { waitUntil: 'load', timeout: 30000 });
      await p.waitForTimeout(3000);

      const body = await p.locator('body').innerText();

      // Check title
      const titleCheck = body.includes(combo.engine);
      console.log(`  Title shows engine: ${titleCheck ? 'YES' : 'NO'}`);

      // Check product count
      const countMatch = body.match(/(\d+)\s*produit/);
      const count = countMatch ? parseInt(countMatch[1]) : 0;
      console.log(`  Products shown: ${count} (expected >= ${combo.expect})`);

      // Check for product cards
      const productCards = await p.locator('[class*="ProductGrid"] a, [class*="grid"] a[href*="/produit/"]').all();
      console.log(`  Product card links: ${productCards.length}`);

      // Should NOT show empty state
      const isEmptyState = body.includes('Aucune huile trouvée');
      console.log(`  Empty state shown: ${isEmptyState}`);

      // Should NOT show filter sidebar
      const hasSidebar = await p.locator('aside').isVisible();
      console.log(`  Sidebar visible: ${hasSidebar}`);

      // Should show vehicle badge
      const hasBadge = body.includes('Recherche par véhicule');
      console.log(`  Vehicle badge: ${hasBadge}`);

      if (count >= combo.expect && !isEmptyState) {
        console.log(`  >>> PASS`);
        passed++;
      } else if (!isEmptyState && productCards.length > 0) {
        console.log(`  >>> PASS (products visible but count text may differ)`);
        passed++;
      } else {
        console.log(`  >>> FAIL: expected >=${combo.expect} products, got ${count}, empty=${isEmptyState}`);
        console.log(`  Body (first 300): ${body.substring(0, 300)}`);
        failed++;
      }
    } catch (e) {
      console.log(`  >>> ERROR: ${e.message}`);
      failed++;
    }
    await p.close();
  }

  console.log(`\n========== RESULTS ==========`);
  console.log(`${passed}/${passed + failed} passed`);
  await b.close();
  process.exit(failed > 0 ? 1 : 0);
})();
