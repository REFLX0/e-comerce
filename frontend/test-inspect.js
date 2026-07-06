const { chromium } = require('playwright');
const BASE = 'http://localhost:8082/en';

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  // Register page
  console.log('=== REGISTER PAGE ===');
  await p.goto(BASE + '/auth/register', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(3000);
  const inputs = await p.locator('input').all();
  for (const inp of inputs) {
    const name = await inp.getAttribute('name');
    const id = await inp.getAttribute('id');
    const ph = await inp.getAttribute('placeholder');
    const type = await inp.getAttribute('type');
    console.log(`  input: name=${name} id=${id} placeholder=${ph} type=${type}`);
  }
  const btns = await p.locator('button').all();
  for (const btn of btns) {
    const text = await btn.innerText();
    const type = await btn.getAttribute('type');
    console.log(`  button: text="${text}" type=${type}`);
  }

  // Admin products page
  console.log('\n=== ADMIN PRODUCTS PAGE ===');
  await p.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(1000);
  await p.fill('input[type="email"]', 'admin@kiosquetn.tn');
  await p.fill('input[type="password"]', 'newpass456');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(3000);
  await p.goto(BASE + '/admin/catalog/products', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(4000);
  const body = await p.locator('body').innerText();
  console.log('Page contains:', body.substring(0, 500));
  
  // Check for Modifier links
  const modLinks = await p.locator('a').all();
  for (const a of modLinks) {
    const text = await a.innerText();
    if (text.includes('Modifier') || text.includes('modifier')) {
      console.log('Found link:', text, 'href:', await a.getAttribute('href'));
    }
  }

  // New product page
  console.log('\n=== NEW PRODUCT PAGE ===');
  await p.goto(BASE + '/admin/catalog/products/new', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(4000);
  const npInputs = await p.locator('input, textarea, select').all();
  for (const inp of npInputs) {
    const name = await inp.getAttribute('name');
    const ph = await inp.getAttribute('placeholder');
    const tag = await inp.evaluate(el => el.tagName);
    console.log(`  ${tag}: name=${name} placeholder=${ph}`);
  }
  const npBtns = await p.locator('button').all();
  for (const btn of npBtns) {
    const text = await btn.innerText();
    const type = await btn.getAttribute('type');
    console.log(`  button: text="${text}" type=${type}`);
  }

  // Admin customers page
  console.log('\n=== ADMIN CUSTOMERS PAGE ===');
  await p.goto(BASE + '/admin/customers', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(4000);
  const cBody = await p.locator('body').innerText();
  console.log('Customers page contains:', cBody.substring(0, 1000));

  await b.close();
})();
