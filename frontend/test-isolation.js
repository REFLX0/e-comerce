const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const BASE = 'http://localhost:8082/en';

  async function login(email, password) {
    await page.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
    await page.waitForSelector('#email', { timeout: 5000 });
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  // Test 1: Admin redirected away from /compte
  await login('admin@kiosquetn.tn', 'newpass456');
  await page.goto(BASE + '/compte', { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(3000);
  const url1 = page.url();
  console.log('Admin /compte ->', url1, 'PASS:', url1.includes('/admin'));

  // Test 2: Register proper customer with both password fields
  const testEmail = 'custiso-' + Date.now() + '@test.tn';
  await page.goto(BASE + '/auth/register', { waitUntil: 'load', timeout: 15000 });
  await page.waitForSelector('#reg-firstName', { timeout: 5000 });

  // Fill ALL fields properly
  await page.fill('#reg-firstName', 'Cust');
  await page.fill('#reg-lastName', 'Test');
  await page.fill('#reg-email', testEmail);
  await page.fill('#reg-phone', '50123456');
  await page.fill('#reg-password', 'Testpass123');
  await page.fill('#reg-confirmPassword', 'Testpass123');

  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);

  const afterReg = page.url();
  console.log('After register URL:', afterReg);

  const cookies = await context.cookies();
  const hasToken = cookies.some(c => c.name === 'access_token' && c.value.length > 10);
  console.log('Has access_token cookie:', hasToken);

  // Should now be redirected to /compte as customer
  if (afterReg.includes('/compte')) {
    console.log('Registration redirected to /compte - customer is logged in');

    // Navigate to /admin - should be blocked
    await page.goto(BASE + '/admin', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(4000);
    const url2 = page.url();
    console.log('Customer /admin ->', url2, 'PASS:', !url2.includes('/admin'));
  } else {
    console.log('Registration did not redirect - cannot test customer block');
  }

  await browser.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
