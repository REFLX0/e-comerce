const { chromium } = require('playwright');
const BASE = 'http://localhost:8082/en';

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  let usersBody = null;
  p.on('response', async resp => {
    if (resp.url().includes('/api/admin/users')) {
      usersBody = await resp.text();
    }
  });

  await p.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(1000);
  await p.fill('#email', 'admin@kiosquetn.tn');
  await p.fill('#password', 'newpass456');
  await p.click('button:has-text("Se connecter")');
  await p.waitForTimeout(3000);

  await p.goto(BASE + '/admin/customers', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(5000);

  if (usersBody) {
    console.log('API response body (first 2000 chars):');
    console.log(usersBody.substring(0, 2000));
    try {
      const parsed = JSON.parse(usersBody);
      console.log('\nParsed as JSON:');
      if (Array.isArray(parsed)) {
        console.log('Array length:', parsed.length);
        console.log('First item keys:', parsed.length > 0 ? Object.keys(parsed[0]) : 'empty array');
      } else if (parsed.data) {
        console.log('data length:', parsed.data.length);
      } else {
        console.log('Object keys:', Object.keys(parsed));
      }
    } catch(e) {
      console.log('Not JSON:', e.message);
    }
  } else {
    console.log('No API response captured');
  }

  await b.close();
})();
