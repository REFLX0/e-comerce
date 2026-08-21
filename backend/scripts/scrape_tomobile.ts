import puppeteer from 'puppeteer';
import * as fs from 'fs';

const BRANDS = [
  { name: 'Mannol', search: 'mannol', id: 'brand-mannol' },
  { name: 'Liqui Moly', search: 'liqui moly', id: 'cmrs0sfrs0008rt4ptgjcrgk2' }, // existing ID in DB
  { name: 'Osram', search: 'osram', id: 'brand-osram' },
  { name: 'Neolux', search: 'neolux', id: 'brand-neolux' },
];

const BASE_URL = 'https://tomobile.store';

async function main() {
  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true, // Use standard headless
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  // Set a real user agent to bypass basic checks
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

  const scrapedProducts: any[] = [];

  for (const brand of BRANDS) {
    console.log(`\n--- Scraping brand: ${brand.name} ---`);
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const searchUrl = `${BASE_URL}/page/${currentPage}/?s=${encodeURIComponent(brand.search)}&post_type=product`;
      console.log(`Visiting: ${searchUrl}`);
      
      try {
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait a bit to let any bot protection pass
        await new Promise(r => setTimeout(r, 2000));

        // Check if there are products
        const productsOnPage = await page.evaluate(() => {
          const productElements = document.querySelectorAll('.product-small');
          const products: any[] = [];
          
          productElements.forEach((el) => {
            const titleEl = el.querySelector('.woocommerce-loop-product__title');
            const linkEl = el.querySelector('a.woocommerce-LoopProduct-link');
            const priceEl = el.querySelector('.price .woocommerce-Price-amount bdi');
            const imgEl = el.querySelector('img');

            if (titleEl && linkEl) {
              products.push({
                name: titleEl.textContent?.trim() || '',
                url: (linkEl as HTMLAnchorElement).href,
                price: priceEl ? priceEl.textContent?.trim() : '',
                image: imgEl ? imgEl.src : '',
              });
            }
          });
          return products;
        });

        if (productsOnPage.length === 0) {
          console.log('No products found on this page. Moving to next brand.');
          hasNextPage = false;
          break;
        }

        console.log(`Found ${productsOnPage.length} products on page ${currentPage}`);
        
        for (const p of productsOnPage) {
          scrapedProducts.push({
            ...p,
            brandId: brand.id,
            brandName: brand.name,
          });
        }

        // Check if there's a next page
        const hasNext = await page.evaluate(() => {
          const nextButton = document.querySelector('.next.page-number');
          return !!nextButton;
        });

        if (hasNext) {
          currentPage++;
        } else {
          hasNextPage = false;
        }

      } catch (err) {
        console.error(`Error navigating to ${searchUrl}:`, err);
        hasNextPage = false; // abort pagination on error
      }
    }
  }

  console.log(`\nTotal products found across all pages: ${scrapedProducts.length}`);

  let newCount = 0;

  console.log('\n--- Details Extraction ---');
  for (let i = 0; i < scrapedProducts.length; i++) {
    const product = scrapedProducts[i];
    console.log(`[${i+1}/${scrapedProducts.length}] Processing: ${product.name}`);
    
    try {
      await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1000));

      const details = await page.evaluate(() => {
        const skuEl = document.querySelector('.sku');
        const descEl = document.querySelector('.woocommerce-product-details__short-description');
        
        return {
          sku: skuEl ? skuEl.textContent?.trim() : '',
          description: descEl ? descEl.textContent?.trim() : '',
        };
      });

      product.sku = details.sku || `SKU-auto-${Math.random().toString(36).substr(2, 9)}`;
      product.description = details.description || '';

      // Clean price string (e.g. "9.90 د.ت" -> 9.90)
      let priceVal = 0;
      if (product.price) {
        const match = product.price.match(/[\d.,]+/);
        if (match) priceVal = parseFloat(match[0].replace(',', '.'));
      }
      product.priceVal = priceVal;

      newCount++;

    } catch (err) {
      console.log(`  -> Error fetching details for ${product.name}:`, err);
    }
  }

  console.log(`\nFinished scraping! Saving to scraped_products.json...`);
  fs.writeFileSync('scraped_products.json', JSON.stringify(scrapedProducts, null, 2));

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
