const { chromium } = require('playwright');
const BASE = 'http://localhost:8082/en';

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  // Register fresh customer
  const email = 'verify-' + Date.now() + '@test.tn';
  await p.goto(BASE + '/auth/register', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(2000);
  await p.fill('#reg-firstName', 'Verify');
  await p.fill('#reg-lastName', 'Test');
  await p.fill('#reg-email', email);
  await p.fill('#reg-phone', '50123456');
  await p.fill('#reg-password', 'Test1234');
  await p.fill('#reg-confirmPassword', 'Test1234');
  await p.click('button:has-text("Créer mon compte")');
  await p.waitForTimeout(3000);
  console.log('Register URL:', p.url());

  // Dashboard
  await p.goto(BASE + '/compte', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(4000);
  const dashBody = await p.locator('body').innerText();
  console.log('Dashboard OK:', !dashBody.includes('introuvable'), 'body length:', dashBody.length);

  // Commandes
  await p.goto(BASE + '/compte/commandes', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(4000);
  const cmdBody = await p.locator('body').innerText();
  console.log('Commandes OK:', !cmdBody.includes('introuvable'), 'body length:', cmdBody.length);

  await b.close();
  const allOk = !dashBody.includes('introuvable') && !cmdBody.includes('introuvable');
  process.exit(allOk ? 0 : 1);
})();
