const { chromium } = require('playwright');
const BASE = 'http://localhost:8082/en';

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // Monitor console + network
  p.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  p.on('response', resp => {
    if (resp.url().includes('/auth/register') || resp.status() >= 400 && resp.url().includes('localhost'))
      console.log('RESP:', resp.status(), resp.url());
  });

  await p.goto(BASE + '/auth/register', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(3000);

  console.log('URL before fill:', p.url());
  
  await p.fill('#reg-firstName', 'Debug');
  await p.fill('#reg-lastName', 'User');
  await p.fill('#reg-email', 'debug-' + Date.now() + '@test.tn');
  await p.fill('#reg-phone', '50123456');
  await p.fill('#reg-password', 'test123');
  await p.fill('#reg-confirmPassword', 'test123');

  console.log('Clicked submit...');
  await p.click('button:has-text("Créer mon compte")');
  await p.waitForTimeout(5000);
  
  console.log('URL after submit:', p.url());
  const body = await p.locator('body').innerText();
  console.log('Body (first 500):', body.substring(0, 500));

  // Check for any error toasts
  const errors = await p.locator('[class*="toast"], [class*="error"], [class*="alert"]').all();
  console.log('Error toasts count:', errors.length);
  for (const e of errors) console.log('  Error:', await e.innerText());

  await b.close();
})();
