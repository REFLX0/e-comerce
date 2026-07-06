const { chromium } = require('playwright');
const BASE = 'http://localhost:8082/en';

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  // Login as admin
  await p.goto(BASE + '/auth/login', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(1000);
  await p.fill('#email', 'admin@kiosquetn.tn');
  await p.fill('#password', 'newpass456');
  await p.click('button:has-text("Se connecter")');
  await p.waitForTimeout(3000);
  console.log('Admin URL:', p.url());

  // Go to customers
  await p.goto(BASE + '/admin/customers', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(5000);
  const body = await p.locator('body').innerText();
  
  console.log('Body (first 1000):', body.substring(0, 1000));
  
  // Check for customer rows in the table
  const tableRows = p.locator('table tbody tr');
  const rowCount = await tableRows.count();
  console.log('\nTable rows found:', rowCount);
  
  // Check for text indicating users
  const hasUsers = body.includes('clients enregistrés') && !body.includes('0 clients enregistrés') && !body.includes('Aucun client trouvé');
  console.log('Has users:', hasUsers);
  console.log('Has 0 clients:', body.includes('0 clients enregistrés'));
  console.log('Has Aucun client trouvé:', body.includes('Aucun client trouvé'));

  // Check customer links exist
  const customerLinks = await p.locator('a[href*="/admin/customers/"]').all();
  console.log('Customer links:', customerLinks.length);
  if (customerLinks.length > 0) {
    console.log('First link href:', await customerLinks[0].getAttribute('href'));
  }

  await b.close();
  process.exit(hasUsers ? 0 : 1);
})();
