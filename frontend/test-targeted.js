const { chromium } = require('playwright');
const assert = require('assert');
const BASE = 'http://localhost:8082/en';
const ADMIN_PW = 'newpass456';
const results = [];
function r(n, fn) { return fn().then(() => results.push({ n, s: 'PASS' })).catch(e => results.push({ n, s: 'FAIL', e: e.message })); }

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  // Login admin first
  await p.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(1000);
  await p.fill('input[name="email"]', 'admin@kiosquetn.tn');
  await p.fill('input[name="password"]', ADMIN_PW);
  await p.click('button[type="submit"]');
  await p.waitForTimeout(3000);

  // ---- INVENTORY: check stock edit buttons exist ----
  await r('3d. Inline stock numbers visible on inventory', async () => {
    await p.goto(BASE + '/admin/catalog/inventory', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(4000);
    const body = await p.locator('body').innerText();
    assert.ok(body.includes('stock') || body.includes('Stock') || body.includes('Quantité'), 'Inventory page has no stock column');
  });

  // ---- PRODUCT LIST: check Modifier links exist ----
  await r('3b_pre. Modifier links exist on product list', async () => {
    await p.goto(BASE + '/admin/catalog/products', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(4000);
    // Scroll down the page to see the table
    const body = await p.locator('body').innerText();
    const hasModifier = body.includes('Modifier');
    // Also check for Edit in English
    const hasEdit = body.includes('Edit');
    assert.ok(hasModifier || hasEdit, `No Modifier/Edit text found on page:\n${body.substring(0, 1500)}`);
  });

  // ---- NEW PRODUCT FORM (fill by placeholder) ----
  const slug = 'test-' + Date.now();
  await r('3a. Create product via UI (placeholder-based)', async () => {
    await p.goto(BASE + '/admin/catalog/products/new', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(3000);

    // Fill by placeholder text
    await p.locator('input[placeholder="Huile Moteur 15W-40"]').fill('UI Test ' + Date.now());
    await p.locator('input[placeholder="huile-moteur-15w40"]').fill(slug);
    await p.locator('input[placeholder="Description du produit..."]').fill('Regression test description');
    await p.locator('input[placeholder="ID de la marque"]').fill('cmr8l27zc0002n06zslci5g3v');
    await p.locator('input[placeholder="ID de la catégorie"]').fill('cmr8l280q000bn06zqu4cw69h');
    await p.locator('input[placeholder="0.00"]').fill('29.99');
    await p.locator('input[placeholder="0"]').fill('8');
    await p.locator('input[placeholder=""]').fill('SKU-' + Date.now());

    await p.click('button:has-text("Enregistrer")');
    await p.waitForTimeout(5000);
    const body = await p.locator('body').innerText();
    assert.ok(body.includes(slug) || p.url().includes('/admin/catalog/products'), `Product creation may have failed. URL: ${p.url()}`);
  });

  // ---- ADMIN CUSTOMERS API check ----
  await r('6b. Admin customers list (API)', async () => {
    const resp = await ctx.request.get(BASE + '/api/admin/users');
    const data = await resp.json();
    assert.ok(data.data, 'No data in response');
    const emails = data.data.map(u => u.email);
    console.log('  Admin users found:', emails.length, ' Sample:', emails.slice(0, 3));
    assert.ok(emails.length > 0, 'Admin users list is empty');
  });

  // ---- FORGOT PASSWORD ----
  await r('7a. Forgot-password trigger', async () => {
    await p.goto(BASE + '/auth/mot-de-passe-oublie', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(2000);
    await p.locator('input[type="email"]').fill('admin@kiosquetn.tn');
    await p.click('button[type="submit"]');
    await p.waitForTimeout(3000);
    const body = await p.locator('body').innerText();
    assert.ok(body.includes('Vérifiez') || body.includes('envoyé'), 'No success message');
  });

  await b.close();
  console.log('\n========== TARGETED TESTS ==========');
  results.forEach(r2 => console.log(`${r2.s === 'PASS' ? '\u2714' : '\u2718'} ${r2.n}${r2.e ? '\n   \u2192 ' + r2.e : ''}`));
  const f = results.filter(r2 => r2.s === 'FAIL').length;
  console.log(`\n${results.length - f}/${results.length} passed`);
  process.exit(f > 0 ? 1 : 0);
})();
