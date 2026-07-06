const { chromium } = require('playwright');

const BASE = 'http://localhost:8082/en';
const TEST_EMAIL = `testcustomer_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPass123!';
const TEST_FIRST = 'Test';
const TEST_LAST = 'Customer';
const TEST_PHONE = '29670428';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Collect console errors for reference
  const errors = [];
  page.on('response', r => { if (r.status() >= 400 && r.url().startsWith('http://localhost:8082')) errors.push(`ERR ${r.status()} ${r.url()}`); });
  page.on('requestfailed', r => { if (r.url().startsWith('http://localhost:8082')) errors.push(`FAIL ${r.failure()?.errorText} ${r.url()}`); });

  let orderId = null;

  try {
    // ---- STEP 0: Navigate to site first, then register via API ----
    console.log('>>> Loading site and registering test customer...');
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1000);

    const regRes = await page.evaluate(async ({ email, pwd, first, last, phone }) => {
      const r = await fetch('http://localhost:8082/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd, firstName: first, lastName: last, phone })
      });
      return { ok: r.ok, status: r.status, body: await r.json().catch(() => null) };
    }, { email: TEST_EMAIL, pwd: TEST_PASSWORD, first: TEST_FIRST, last: TEST_LAST, phone: TEST_PHONE });
    console.log(`  Register: ${regRes.status} ${regRes.ok ? 'OK' : 'FAIL'}`);
    if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);

    // ---- STEP 1: Login as test customer ----
    console.log('>>> Logging in as test customer...');
    await page.goto(`${BASE}/auth/login`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect — should go to account or stay on login
    await page.waitForTimeout(3000);
    const afterLoginUrl = page.url();
    console.log(`  After login: ${afterLoginUrl}`);
    // The app may redirect to /compte or stay — either way we need to confirm auth
    // Check that we're NOT still on login page (unless error)
    const stillOnLogin = afterLoginUrl.includes('/auth/login');
    if (stillOnLogin) {
      // Maybe redirects to /compte? Let's check if there's an error
      const bodyText = await page.locator('body').innerText();
      if (bodyText.includes('Identifiants') || bodyText.includes('invalides') || bodyText.includes('Erreur')) {
        console.log('  LOGIN ERROR: ' + bodyText.substring(0, 200));
        // Try navigating to /compte to see if we're actually logged in
        await page.goto(`${BASE}/compte`, { waitUntil: 'load', timeout: 15000 });
        await page.waitForTimeout(2000);
        console.log(`  After navigating to /compte: ${page.url()}`);
      }
    }

    // ---- STEP 2: Go to catalogue and pick a product ----
    console.log('>>> Navigating to catalogue to pick a product...');
    await page.goto(`${BASE}/catalogue`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Find a product link
    const productLink = page.locator('a[href*="/produit/"]').first();
    await productLink.waitFor({ state: 'visible', timeout: 15000 });
    const href = await productLink.getAttribute('href');
    console.log(`  Product link: ${href}`);

    // ---- STEP 3: Add product to cart ----
    await page.goto(`http://localhost:8082${href}`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(3000);

    const addBtn = page.locator('button:has-text("Ajouter au panier")').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15000 });
    await addBtn.evaluate(el => el.click());
    await page.waitForTimeout(2000);
    console.log('  Product added to cart');

    // ---- STEP 4: Go to checkout ----
    console.log('>>> Going to checkout...');
    await page.goto(`${BASE}/checkout`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Check if cart has items
    const checkoutBody = await page.locator('body').innerText();
    if (checkoutBody.includes('vide') || checkoutBody.includes('empty') || checkoutBody.includes('0 article')) {
      console.log('  Cart is empty on checkout — items were lost. Trying cart-based navigation...');
      // Try via cart page
      await page.goto(`${BASE}/panier`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(3000);
      // Click "Valider la commande" link
      const validateLink = page.locator('a:has-text("Valider la commande")').first();
      await validateLink.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      if (await validateLink.isVisible()) {
        await validateLink.click();
        await page.waitForTimeout(3000);
        console.log(`  After cart redirect: ${page.url()}`);
      } else {
        // Cart is actually empty, re-add
        console.log('  Cart is empty, re-adding...');
        await page.goto(`http://localhost:8082${href}`, { waitUntil: 'load', timeout: 20000 });
        await page.waitForTimeout(3000);
        const addBtn2 = page.locator('button:has-text("Ajouter au panier")').first();
        await addBtn2.waitFor({ state: 'visible', timeout: 15000 });
        await addBtn2.evaluate(el => el.click());
        await page.waitForTimeout(2000);
        await page.goto(`${BASE}/checkout`, { waitUntil: 'load', timeout: 20000 });
        await page.waitForTimeout(3000);
      }
    }

    // ---- STEP 5: Fill checkout form ----
    console.log('>>> Filling checkout form...');
    await page.waitForSelector('#firstName', { timeout: 10000 });
    await page.fill('#firstName', TEST_FIRST);
    await page.fill('#lastName', TEST_LAST);
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#phone', TEST_PHONE);
    await page.fill('#address', '123 Rue de Test');
    await page.selectOption('#wilaya', 'Tunis');
    await page.fill('#city', 'Tunis');
    await page.fill('#postalCode', '1000');
    await page.fill('#notes', 'Test order - please ignore');
    console.log('  Form filled');

    // ---- STEP 6: Accept CGV and submit ----
    console.log('>>> Submitting order...');
    // Check the CGV checkbox
    const cgvCheckbox = page.locator('#cgv');
    await cgvCheckbox.waitFor({ state: 'visible', timeout: 5000 });
    await cgvCheckbox.check();
    await page.waitForTimeout(500);

    // Click "Confirmer la commande"
    const submitBtn = page.locator('button:has-text("Confirmer la commande")').first();
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
    await submitBtn.click();

    // Wait for redirect to success page
    await page.waitForTimeout(5000);
    const finalUrl = page.url();
    console.log(`  After submit URL: ${finalUrl}`);

    // Extract orderId from URL
    const urlObj = new URL(finalUrl);
    orderId = urlObj.searchParams.get('orderId');
    if (!orderId && finalUrl.includes('/checkout/success')) {
      // Try to get orderId from the page content
      const bodyText = await page.locator('body').innerText();
      const match = bodyText.match(/commande[#:\s]*([a-z0-9]{20,})/i);
      if (match) orderId = match[1];
    }
    console.log(`  Order ID: ${orderId || 'NOT FOUND'}`);
    if (!orderId) {
      console.log('  SUCCESS PAGE BODY:');
      console.log(await page.locator('body').innerText().then(t => t.substring(0, 500)));
      throw new Error('Could not extract orderId from success page');
    }

    // ---- STEP 7: Go to /compte/commandes ----
    console.log('>>> Checking order list at /compte/commandes...');
    await page.goto(`${BASE}/compte/commandes`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Check if we're redirected to login (not authenticated)
    if (page.url().includes('/auth/login')) {
      console.log('  Redirected to login — session may have been lost. Trying direct login...');
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      // Navigate again
      await page.goto(`${BASE}/compte/commandes`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(3000);
    }

    const ordersPageUrl = page.url();
    console.log(`  Orders page URL: ${ordersPageUrl}`);

    // Get the page body and search for order ID or relevant text
    const ordersBody = await page.locator('body').innerText();
    console.log('  ORDERS PAGE (first 500 chars):');
    console.log(ordersBody.substring(0, 500));

    // Check if the order is visible — look for orderId in the text
    const orderVisible = ordersBody.includes(orderId.substring(0, 8)) || ordersBody.includes('en attente') || ordersBody.includes('PENDING') || ordersBody.includes(orderId);
    console.log(`  Order visible in list: ${orderVisible ? 'YES' : 'CHECKING...'}`);

    // Try to find and click the order link
    const orderLink = page.locator(`a[href*="${orderId}"]`).first();
    const orderLinkVisible = await orderLink.isVisible().catch(() => false);
    console.log(`  Order detail link visible: ${orderLinkVisible}`);

    if (orderLinkVisible) {
      // ---- STEP 8: Click into order detail ----
      console.log('>>> Opening order detail...');
      await orderLink.click();
      await page.waitForTimeout(3000);

      const detailUrl = page.url();
      console.log(`  Order detail URL: ${detailUrl}`);

      const detailBody = await page.locator('body').innerText();
      console.log('  ORDER DETAIL (first 800 chars):');
      console.log(detailBody.substring(0, 800));

      // Verify ship fields are rendered
      const hasShipName = detailBody.includes(TEST_FIRST) && detailBody.includes(TEST_LAST);
      const hasShipPhone = detailBody.includes(TEST_PHONE);
      const hasShipCity = detailBody.includes('Tunis');
      const hasShipWilaya = detailBody.includes('Tunis');
      console.log(`  shipFullName visible: ${hasShipName}`);
      console.log(`  shipPhone visible: ${hasShipPhone}`);
      console.log(`  shipCity visible: ${hasShipCity}`);
      console.log(`  shipWilaya visible: ${hasShipWilaya}`);

      const allShipFieldsOk = hasShipName && hasShipPhone && hasShipCity && hasShipWilaya;
      console.log(`\n=======================================`);
      console.log(`ORDER VISIBILITY FIX: ${orderVisible ? 'PASS' : 'FAIL'}`);
      console.log(`SHIPPING FIELDS FIX:  ${allShipFieldsOk ? 'PASS' : 'FAIL'}`);
      console.log(`=======================================`);
    } else {
      console.log(`\n=======================================`);
      console.log(`ORDER VISIBILITY FIX: COULD NOT VERIFY (no order link found)`);
      console.log(`=======================================`);
      // Try direct access to order detail
      console.log('>>> Trying direct order detail access...');
      await page.goto(`${BASE}/compte/commandes/${orderId}`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(3000);
      const directBody = await page.locator('body').innerText();
      console.log('  DIRECT ORDER DETAIL (first 800 chars):');
      console.log(directBody.substring(0, 800));
      console.log(`  Ship fields check needed`);
    }

  } catch (err) {
    console.error(`\nTEST FAILED: ${err.message}`);
  }

  // Print summary
  console.log('\n--- Test Customer ---');
  console.log(`Email: ${TEST_EMAIL}`);
  console.log(`Pass:  ${TEST_PASSWORD}`);
  if (orderId) console.log(`Order: ${orderId}`);

  console.log('\n--- Console/Network Errors ---');
  errors.slice(0, 20).forEach(e => console.log(e));
  if (errors.length > 20) console.log(`... and ${errors.length - 20} more`);

  await browser.close();
  process.exit(0);
})();
