const { chromium } = require('playwright');
const BASE = 'http://localhost:8082/en';

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // Login as admin
  await p.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(1000);
  await p.fill('#email', 'admin@kiosquetn.tn');
  await p.fill('#password', 'newpass456');
  await p.click('button:has-text("Se connecter")');
  await p.waitForTimeout(3000);
  console.log('Admin URL:', p.url());

  // Check customers API directly via page context
  const resp = await p.request.get(BASE + '/api/admin/users');
  const text = await resp.text();
  console.log('API status:', resp.status());
  console.log('API response (first 500):', text.substring(0, 500));

  // Navigate to customers page
  await p.goto(BASE + '/admin/customers', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(5000);
  const body = await p.locator('body').innerText();
  console.log('Page body (first 1000):', body.substring(0, 1000));

  // Look for any links with admin/customers
  const links = await p.locator('a[href*="customers"]').all();
  console.log('Links with customers:', links.length);
  for (const l of links) {
    console.log('  Link:', await l.getAttribute('href'), 'Text:', (await l.innerText()).substring(0, 50));
  }

  // Check if there's a search input
  const searchInput = p.locator('input[type="search"]');
  if (await searchInput.isVisible()) {
    console.log('Search input found, searching for test email...');
    await searchInput.fill('final-');
    await p.waitForTimeout(2000);
    const body2 = await p.locator('body').innerText();
    console.log('After search (first 500):', body2.substring(0, 500));
  }

  await b.close();
})();
