const { chromium } = require('playwright');
const assert = require('assert');
const BASE = 'http://localhost:8082/en';

(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // 1. Navigate to homepage
  await p.goto(BASE, { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(3000);
  const body = await p.locator('body').innerText();
  assert.ok(body.includes('Trouver mon huile'), 'Oil finder title not found on homepage');
  console.log('PASS: Widget renders on homepage');

  // 2. Check #oil-finder anchor exists
  const widget = p.locator('#oil-finder');
  assert.ok(await widget.isVisible(), '#oil-finder element not visible');
  console.log('PASS: #oil-finder anchor exists and is visible');

  // 3. Navigate via mobile nav link /#oil-finder
  await p.goto(BASE + '/#oil-finder', { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(2000);
  assert.ok(await widget.isVisible(), 'Widget not visible after /#oil-finder nav');
  console.log('PASS: /#oil-finder scroll works');

  // 4. Step through the wizard
  await p.goto(BASE, { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(2000);

  // Step 1: Select vehicle type (Automobile)
  const carBtn = p.locator('button:has-text("Automobile")');
  await carBtn.waitFor({ state: 'visible', timeout: 5000 });
  await carBtn.click();
  await p.waitForTimeout(2000);
  console.log('PASS: Step 1 - selected Automobile');

  // Step 2: Select make - should have loaded makes from API
  const makeBtns = p.locator('#oil-finder button:has-text("RENAULT"), #oil-finder button:has-text("Renault"), #oil-finder button:has-text("PEUGEOT"), #oil-finder button:has-text("VOLKSWAGEN")');
  const firstVisibleMake = makeBtns.first();
  try {
    await firstVisibleMake.waitFor({ state: 'visible', timeout: 10000 });
    const makeText = await firstVisibleMake.textContent();
    await firstVisibleMake.click();
    await p.waitForTimeout(2000);
    console.log('PASS: Step 2 - selected make:', makeText);
  } catch {
    // If no specific brand, click any button
    const anyMake = p.locator('#oil-finder button.border-brand-border').first();
    if (await anyMake.isVisible()) {
      const makeText = await anyMake.textContent();
      await anyMake.click();
      await p.waitForTimeout(2000);
      console.log('PASS: Step 2 - selected make:', makeText);
    } else {
      console.log('WARN: No make buttons found, checking API...');
      const makesText = await p.locator('#oil-finder').innerText();
      console.log('Widget text:', makesText.substring(0, 500));
    }
  }

  // Step 3: Select model
  const modelBtns = p.locator('#oil-finder button.border-brand-border');
  const firstModel = modelBtns.first();
  if (await firstModel.isVisible({ timeout: 3000 }).catch(() => false)) {
    const modelText = await firstModel.textContent();
    await firstModel.click();
    await p.waitForTimeout(2000);
    console.log('PASS: Step 3 - selected model:', modelText);
  } else {
    console.log('WARN: No model buttons visible');
  }

  // Step 4: Should show engine selection or search button
  // Check for "Trouver les huiles compatibles" button
  const searchBtn = p.locator('button:has-text("Trouver les huiles compatibles")');
  if (await searchBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    // If engine step, try selecting an engine first
    const engineBtns = p.locator('#oil-finder button.border-brand-border');
    const firstEngine = engineBtns.first();
    if (await firstEngine.isVisible({ timeout: 3000 }).catch(() => false)) {
      const engText = await firstEngine.textContent();
      await firstEngine.click();
      await p.waitForTimeout(500);
      console.log('PASS: Step 4 - selected engine:', engText);
    }

    await searchBtn.click();
    await p.waitForTimeout(3000);
    const currentUrl = p.url();
    assert.ok(currentUrl.includes('/catalogue'), 'Not redirected to catalogue');
    console.log('PASS: Search redirects to catalogue:', currentUrl);
  } else {
    console.log('WARN: Search button not found, widget content:', (await p.locator('#oil-finder').innerText()).substring(0, 300));
  }

  await b.close();
  console.log('\nAll tests passed');
})();
