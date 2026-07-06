const { chromium } = require('playwright');
const BASE = 'http://localhost:8082/en';

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  let apiResponseBody = null;
  let apiResponseStatus = null;
  p.on('response', async resp => {
    if (resp.url().includes('/admin/users')) {
      apiResponseStatus = resp.status();
      apiResponseBody = await resp.text();
    }
  });

  // Login
  await p.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(2000);
  await p.fill('#email', 'admin@kiosquetn.tn');
  await p.fill('#password', 'newpass456');
  await p.click('button:has-text("Se connecter")');
  await p.waitForTimeout(3000);

  // Navigate to customers
  await p.goto(BASE + '/admin/customers', { waitUntil: 'load', timeout: 30000 });
  await p.waitForTimeout(5000);

  // Check API response
  console.log('API response captured:', apiResponseBody ? 'yes' : 'no');
  console.log('API status:', apiResponseStatus);
  if (apiResponseBody) console.log('API body (first 300):', apiResponseBody.substring(0, 300));

  // Check the body
  const body = await p.locator('body').innerText();
  const totalMatch = body.match(/(\d+)\s*clients?\s*enregistrés?/);
  console.log('Total text:', totalMatch ? totalMatch[0] : 'not found');
  
  // Check for table rows
  const names = await p.locator('table tbody tr td a p').allTextContents();
  console.log('Customer names:', names);

  // Check for loading state
  const loading = await p.locator('text=Chargement...').isVisible();
  console.log('Still loading:', loading);

  await b.close();
})();
