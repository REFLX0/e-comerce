const { chromium } = require('playwright');
const assert = require('assert');
const BASE = 'http://localhost:8082/en';
const ADMIN_PASSWORD = 'newpass456';
const results = [];
function r(n, fn) { return fn().then(() => results.push({ n, s: 'PASS' })).catch(e => results.push({ n, s: 'FAIL', e: e.message })); }

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // Register new customer
  const email = 'cust-' + Date.now() + '@test.tn';
  await r('6a. Register new customer', async () => {
    await p.goto(BASE + '/auth/register', { waitUntil: 'load', timeout: 20000 });
    // Try common field names
    const inputs = await p.locator('input').all();
    for (const inp of inputs) {
      const name = await inp.getAttribute('name') || '';
      const ph = await inp.getAttribute('placeholder') || '';
      const type = await inp.getAttribute('type') || '';
      if (name.includes('first') || ph.includes('Prénom')) await inp.fill('Test');
      else if (name.includes('last') || ph.includes('Nom')) await inp.fill('User');
      else if (type === 'email' || ph.includes('@')) await inp.fill(email);
      else if (name.includes('phone') || ph.includes('tél') || ph.includes('phone')) await inp.fill('50123456');
      else if (type === 'password') await inp.fill('testpass123');
    }
    await p.click('button[type="submit"]');
    await p.waitForTimeout(3000);
    assert.ok(!p.url().includes('/auth/register'), 'Still on register page');
  });

  // Customer dashboard (new customer, empty state)
  await r('4a. Customer dashboard loads (new customer)', async () => {
    await p.goto(BASE + '/compte', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(4000);
    const body = await p.locator('body').innerText();
    assert.ok(!body.includes('introuvable'), 'Dashboard shows error');
  });

  // Admin: login, check customers list
  await r('6b. New customer in admin list', async () => {
    await p.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
    await p.waitForSelector('input[type="email"]', { timeout: 5000 });
    await p.fill('input[type="email"]', 'admin@kiosquetn.tn');
    await p.fill('input[type="password"]', ADMIN_PASSWORD);
    await p.click('button[type="submit"]');
    await p.waitForTimeout(3000);
    await p.goto(BASE + '/admin/customers', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(4000);
    const body = await p.locator('body').innerText();
    assert.ok(body.includes(email), 'New customer email not found in admin list');
  });

  // Admin: customer detail page
  await r('6c. Customer detail page loads', async () => {
    const link = p.locator(`a:has-text("${email}")`).first();
    await link.waitFor({ state: 'visible', timeout: 5000 });
    await link.click();
    await p.waitForTimeout(4000);
    const body = await p.locator('body').innerText();
    assert.ok(!body.includes('introuvable'), 'Customer detail shows "not found"');
  });

  // Product: create via UI
  const slug = 'uiprod-' + Date.now();
  await r('3a. Create product via UI', async () => {
    await p.goto(BASE + '/admin/catalog/products/new', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(3000);
    const inputs = await p.locator('input, textarea, select').all();
    for (const inp of inputs) {
      const name = (await inp.getAttribute('name') || '').toLowerCase();
      const placeholder = (await inp.getAttribute('placeholder') || '').toLowerCase();
      const tag = (await inp.evaluate(el => el.tagName)).toLowerCase();
      if (name.includes('namefr') || placeholder.includes('nom')) await inp.fill('UI Test ' + Date.now());
      else if (name === 'slug' || placeholder.includes('slug')) await inp.fill(slug);
      else if (name === 'sku' || placeholder.includes('sku')) await inp.fill('SKU-' + Date.now());
      else if (name.includes('description') || placeholder.includes('description')) await inp.fill('Test description');
      else if (name.includes('price') || placeholder.includes('prix')) await inp.fill('39.99');
      else if (name.includes('stock') || placeholder.includes('stock')) await inp.fill('10');
      else if (tag === 'select') {
        const opts = await inp.locator('option').all();
        if (opts.length > 1) await inp.selectOption({ index: 1 });
      }
    }
    await p.click('button[type="submit"]');
    await p.waitForTimeout(5000);
    const url = p.url();
    assert.ok(url.includes('/admin/catalog/products'), 'Not redirected to product list after create');
    const body = await p.locator('body').innerText();
    assert.ok(body.includes(slug), 'Product slug not in admin list');
  });

  // Product: edit via Modifier
  await r('3b. Edit product via Modifier link', async () => {
    await p.goto(BASE + '/admin/catalog/products', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(3000);
    // Find a "Modifier" link
    const mod = p.locator('a:has-text("Modifier")').first();
    await mod.waitFor({ state: 'visible', timeout: 5000 });
    const editUrl = await mod.getAttribute('href');
    await mod.click();
    await p.waitForTimeout(3000);
    assert.ok(p.url().includes('/edit'), 'Not on edit page');
    const priceInput = p.locator('input[name="price"]');
    await priceInput.waitFor({ state: 'visible', timeout: 5000 });
    await priceInput.fill('');
    await priceInput.fill('129.99');
    await p.click('button[type="submit"]');
    await p.waitForTimeout(3000);
    // Reload edit page and check
    await p.goto(BASE + editUrl, { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(2000);
    const val = await p.locator('input[name="price"]').inputValue();
    assert.strictEqual(val, '129.99', 'Price not persisted');
  });

  // Forgot-password
  await r('7a. Trigger forgot-password', async () => {
    await p.goto(BASE + '/auth/mot-de-passe-oublie', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(2000);
    const emailInput = p.locator('input[type="email"]');
    await emailInput.fill('admin@kiosquetn.tn');
    await p.click('button[type="submit"]');
    await p.waitForTimeout(3000);
    const body = await p.locator('body').innerText();
    assert.ok(body.includes('Vérifiez') || body.includes('envoyé'), 'No success message after forgot-password');
  });

  await b.close();
  console.log('\n========== CUSTOMER + PRODUCT TESTS ==========');
  results.forEach(r2 => console.log(`${r2.s === 'PASS' ? '\u2714' : '\u2718'} ${r2.n}${r2.e ? '\n   \u2192 ' + r2.e : ''}`));
  const f = results.filter(r2 => r2.s === 'FAIL').length;
  console.log(`\n${results.length - f}/${results.length} passed`);
  process.exit(f > 0 ? 1 : 0);
})();
