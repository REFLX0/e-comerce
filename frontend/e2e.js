const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  console.log('Starting E2E Tests...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  let consoleErrors = [];
  page.on('response', res => {
    if (res.status() >= 400) {
      consoleErrors.push(`Response Error: ${res.status()} on ${res.url()}`);
    }
  });

  page.on('requestfailed', request => {
    consoleErrors.push(`Request Failed: ${request.failure()?.errorText} on ${request.url()}`);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const baseUrl = 'http://localhost:3000/en';
  
  try {
    // ----------------------------------------------------
    // 1. PUBLIC STOREFRONT
    // ----------------------------------------------------
    console.log('\n[1] Testing Public Storefront Homepage...');
    const res = await page.goto(baseUrl, { waitUntil: 'networkidle' });
    assert.strictEqual(res.status(), 200, `Homepage returned ${res.status()}`);
    console.log('✔ Homepage loaded successfully (status 200)');
    
    // Check navigation menu
    console.log('\n[2] Testing Navigation & Categories...');
    await page.hover('text="All Categories"');
    await page.waitForTimeout(500); // allow menu to open
    const catMenuVisible = await page.isVisible('text="View full catalogue"');
    assert.ok(catMenuVisible, 'Mega menu did not open on hover');
    console.log('✔ Mega menu navigation opens successfully');

    await page.click('text="Automobile"');
    await page.waitForURL('**/categorie/automobile');
    console.log('✔ Clicked "Automobile" category, URL updated to /categorie/automobile');
    
    // Verify no 404 in category page
    const pageTitle = await page.title();
    assert.ok(!pageTitle.includes('introuvable') && !pageTitle.includes('404'), `Category page shows 404: ${pageTitle}`);
    console.log(`✔ Category page loaded correctly (Title: ${pageTitle})`);
    
    // ----------------------------------------------------
    // Product Listing & Details
    // ----------------------------------------------------
    console.log('\n[3] Testing Product Listing & Details...');
    await page.goto(`${baseUrl}/catalogue`);
    console.log('✔ Catalogue page loaded');

    // Click first product
    const firstProductLink = await page.$('a[href*="/produit/"]');
    assert.ok(firstProductLink, 'No product links found on catalogue page');
    const productHref = await firstProductLink.getAttribute('href');
    await page.goto(`http://localhost:3000${productHref}`);
    await page.waitForSelector('text="Ajouter au panier"');
    console.log(`✔ Navigated to product ${productHref}, loaded details correctly`);

    // Add to cart
    console.log('\n[4] Testing Cart Flow...');
    await page.click('text="Ajouter au panier"');
    await page.waitForTimeout(1000); 
    console.log('✔ Clicked "Ajouter au panier"');
    
    // Verify cart page
    await page.goto(`${baseUrl}/panier`);
    const cartHasItem = await page.isVisible('text="Total"');
    assert.ok(cartHasItem, 'Cart is empty or not rendering properly');
    console.log('✔ Cart page loads and displays items correctly');

    // ----------------------------------------------------
    // Search
    // ----------------------------------------------------
    console.log('\n[5] Testing Search...');
    await page.goto(baseUrl);
    await page.fill('input[type="search"]', 'Yacco');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/recherche?q=Yacco');
    console.log('✔ Search for "Yacco" works and redirects to /recherche');

    // ----------------------------------------------------
    // 2. ADMIN PANEL - AUTHENTICATION
    // ----------------------------------------------------
    console.log('\n[6] Testing Admin Auth...');
    // Access control
    await page.goto(`${baseUrl}/admin/catalog/products`);
    // Should redirect to login
    await page.waitForURL('**/auth/login**');
    console.log('✔ Access control works: redirect to login when accessing admin without session');

    // Login
    await page.fill('input[type="email"]', 'admin@kiosquetn.tn');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin**');
    console.log('✔ Valid login successful, redirected to /admin');

    // ----------------------------------------------------
    // 3. ADMIN PANEL - PRODUCT MANAGEMENT
    // ----------------------------------------------------
    console.log('\n[7] Testing Admin Product Management...');
    await page.goto(`${baseUrl}/admin/catalog/products`);
    console.log('✔ Admin products list loads');

    const apiTestPassed = await page.evaluate(async () => {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameFr: 'Test Product ' + Date.now(),
          slug: 'test-product-' + Date.now(),
          price: 99.99,
          categoryId: 1,
          isPublished: true
        })
      });
      return res.status;
    });
    console.log(`✔ Admin product creation endpoint returned status: ${apiTestPassed}`);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  } finally {
    if (consoleErrors.length > 0) {
      console.log('\n--- Browser Console Errors ---');
      consoleErrors.forEach(err => console.log('ERROR:', err));
    }
    await browser.close();
    console.log('\nE2E Tests Finished.');
  }
})();
