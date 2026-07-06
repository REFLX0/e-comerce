const { chromium } = require('playwright');
const BASE = 'http://localhost:8082/en';

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  // Capture API responses
  const apiResponses = [];
  p.on('response', resp => {
    if (resp.url().includes('/api/')) {
      apiResponses.push({ url: resp.url(), status: resp.status(), headers: resp.headers() });
    }
  });

  await p.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(1000);
  await p.fill('#email', 'admin@kiosquetn.tn');
  await p.fill('#password', 'newpass456');
  await p.click('button:has-text("Se connecter")');
  await p.waitForTimeout(3000);

  const cookie = await ctx.cookies();
  const tokenCookie = cookie.find(c => c.name === 'access_token');
  console.log('Has access_token cookie:', !!tokenCookie);

  // Navigate to customers
  apiResponses.length = 0;
  await p.goto(BASE + '/admin/customers', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(5000);

  console.log('\nAPI requests made to /admin/users:');
  apiResponses.filter(r => r.url.includes('/admin/users')).forEach(r => console.log(JSON.stringify(r)));

  console.log('\nAll API responses:');
  apiResponses.forEach(r => console.log(`${r.status} ${r.url}`));

  await b.close();
})();
