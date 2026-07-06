const { chromium } = require('playwright');
const BASE = 'http://localhost:8082/en';

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(3000);
  const inputs = await p.locator('input').all();
  for (const inp of inputs) {
    const name = await inp.getAttribute('name');
    const id = await inp.getAttribute('id');
    const ph = await inp.getAttribute('placeholder');
    const type = await inp.getAttribute('type');
    console.log(`input: name=${name} id=${id} placeholder=${ph} type=${type}`);
  }
  const btns = await p.locator('button').all();
  for (const btn of btns) {
    console.log(`button: text="${await btn.innerText()}"`);
  }
  console.log('\nURL:', p.url());
  await b.close();
})();
