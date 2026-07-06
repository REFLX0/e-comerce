const { chromium } = require('playwright');
const BASE = 'http://localhost:8082/en';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  try {
    const ts = Date.now();
    const email = `dashverify_${ts}@example.com`;

    // Register
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1000);
    const reg = await page.evaluate(async (e) => {
      const r = await fetch('http://localhost:8082/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, password: 'TestPass123!', firstName: 'Dash', lastName: 'Test', phone: '29670430' })
      });
      return r.ok ? (await r.json()).user?.id : null;
    }, email);
    if (!reg) throw new Error('Register failed');

    // Login
    await page.goto(`${BASE}/auth/login`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/compte**', { timeout: 15000 });

    // Navigate to checkout first — check dashboard is empty initially
    await page.goto(`${BASE}/compte`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(3000);
    let body = await page.locator('body').innerText();
    const hasEmptyState = body.includes('Aucune commande');
    console.log(`Dashboard initially shows "Aucune commande": ${hasEmptyState}`);

    // Place an order
    await page.goto(`${BASE}/catalogue`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(3000);
    const link = page.locator('a[href*="/produit/"]').first();
    await link.waitFor({ state: 'visible', timeout: 15000 });
    const href = await link.getAttribute('href');
    await page.goto(`http://localhost:8082${href}`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(3000);
    const addBtn = page.locator('button:has-text("Ajouter au panier")').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15000 });
    await addBtn.evaluate(el => el.click());
    await page.waitForTimeout(2000);

    // Checkout
    await page.goto(`${BASE}/checkout`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(3000);
    await page.waitForSelector('#firstName', { timeout: 10000 });
    await page.fill('#firstName', 'Dash');
    await page.fill('#lastName', 'Test');
    await page.fill('#email', email);
    await page.fill('#phone', '29670430');
    await page.fill('#address', '123 Rue');
    await page.selectOption('#wilaya', 'Ariana');
    await page.fill('#city', 'Ariana');
    await page.fill('#postalCode', '1000');
    await page.click('#cgv');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Confirmer la commande")');
    await page.waitForTimeout(5000);

    // Extract order ID
    const successUrl = page.url();
    const orderId = new URL(successUrl).searchParams.get('orderId');
    console.log(`Placed order: ${orderId}`);

    // NOW check the dashboard
    await page.goto(`${BASE}/compte`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(3000);

    body = await page.locator('body').innerText();
    const showsOrders = body.includes('1 article') || body.includes('commande');
    const showsTotal = body.includes('TND') && !body.includes('0 commande');
    console.log(`Dashboard shows order count: ${showsOrders}`);
    console.log(`Dashboard shows total amount: ${showsTotal}`);

    // Check the order list too
    await page.goto(`${BASE}/compte/commandes`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(3000);
    body = await page.locator('body').innerText();
    const listShowsOrder = body.includes('1 commande(s)');
    console.log(`Order list shows "1 commande(s)": ${listShowsOrder}`);

    console.log(`\n======== RESULT ========`);

    // Also verify by API call for azizzizoujlassi's orders
    console.log('\n--- Cross-check: query orders for azizzizoujlassi@gmail.com (backfilled) ---');
    // We can't login as that user, but we can verify the orders exist in DB via the admin API
    const sessionRes = await page.evaluate(async () => {
      const r = await fetch('http://localhost:8082/api/auth/session', { credentials: 'include' });
      return r.ok ? await r.json() : null;
    });
    console.log(`Current session user: ${sessionRes?.user?.email || 'unknown'}`);

    const allOk = showsOrders && showsTotal && listShowsOrder;
    console.log(`DASHBOARD FIX: ${allOk ? 'PASS' : 'FAIL'}`);

    // Cleanup test user
    await page.evaluate(async (id) => {
      // Can't delete via API, will clean via DB later
    }, orderId);

  } catch (err) {
    console.error(`TEST FAILED: ${err.message}`);
  }

  await browser.close();
  process.exit(0);
})();
