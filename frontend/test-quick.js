const { chromium } = require('playwright');
const assert = require('assert');
const BASE = 'http://localhost:8082/en';
const results = [];
function r(n, fn) { return fn().then(() => results.push({ n, s: 'PASS' })).catch(e => results.push({ n, s: 'FAIL', e: e.message })); }

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  // ---- 1. Register new customer ----
  const email = 'final-' + Date.now() + '@test.tn';
  await r('Register customer', async () => {
    await p.goto(BASE + '/auth/register', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(2000);
    await p.fill('#reg-firstName', 'Final');
    await p.fill('#reg-lastName', 'Test');
    await p.fill('#reg-email', email);
    await p.fill('#reg-phone', '50123456');
    await p.fill('#reg-password', 'Test1234');
    await p.fill('#reg-confirmPassword', 'Test1234');
    await p.click('button:has-text("Créer mon compte")');
    await p.waitForTimeout(3000);
    assert.ok(!p.url().includes('/register'), 'Still on register');
  });

  // ---- 2. Dashboard ----
  await r('Customer dashboard', async () => {
    await p.goto(BASE + '/compte', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(4000);
    const body = await p.locator('body').innerText();
    assert.ok(!body.includes('introuvable'), 'Error on dashboard');
  });

  // ---- 3. Commandes page ----
  await r('Customer commandes page', async () => {
    await p.goto(BASE + '/compte/commandes', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(4000);
    const body = await p.locator('body').innerText();
    assert.ok(!body.includes('introuvable'), 'Error on commandes');
  });

  // ---- 4. Admin login + check customer list ----
  await r('Admin login + customer in list', async () => {
    await p.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(1000);
    await p.fill('#email', 'admin@kiosquetn.tn');
    await p.fill('#password', 'newpass456');
    await p.click('button:has-text("Se connecter")');
    await p.waitForTimeout(3000);
    assert.ok(p.url().includes('/admin'), 'Not on admin after login');

    await p.goto(BASE + '/admin/customers', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(4000);
    const body = await p.locator('body').innerText();
    assert.ok(body.includes(email), 'New customer email not in admin list');
  });

  // ---- 5. Customer detail page ----
  await r('Customer detail page', async () => {
    const link = p.locator(`a[href*="/admin/customers/"]`).first();
    await link.waitFor({ state: 'visible', timeout: 5000 });
    await link.click();
    await p.waitForTimeout(4000);
    const body = await p.locator('body').innerText();
    assert.ok(body.includes(email), 'Customer email not on detail page');
    assert.ok(!body.includes('introuvable'), 'Detail shows not found');
  });

  // ---- 6. Admin orders page ----
  await r('Admin orders page loads', async () => {
    await p.goto(BASE + '/admin/orders', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(4000);
    const body = await p.locator('body').innerText();
    assert.ok(!body.includes('introuvable'), 'Orders error');
  });

  // ---- 7. Forgot password ----
  await r('Forgot-password flow', async () => {
    await p.goto(BASE + '/auth/mot-de-passe-oublie', { waitUntil: 'load', timeout: 20000 });
    await p.waitForTimeout(2000);
    await p.fill('input[type="email"]', 'admin@kiosquetn.tn');
    await p.click('button[type="submit"]');
    await p.waitForTimeout(3000);
    const body = await p.locator('body').innerText();
    assert.ok(body.includes('Vérifiez') || body.includes('envoyé'), 'No success');
  });

  await b.close();
  console.log('\n========== QUICK TESTS ==========');
  results.forEach(r2 => console.log(`${r2.s === 'PASS' ? '\u2714' : '\u2718'} ${r2.n}${r2.e ? '\n   \u2192 ' + r2.e : ''}`));
  const f = results.filter(r2 => r2.s === 'FAIL').length;
  console.log(`\n${results.length - f}/${results.length} passed`);
  process.exit(f > 0 ? 1 : 0);
})();
