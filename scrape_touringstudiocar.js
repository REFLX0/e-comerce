/**
 * Scraper complet pour touringstudiocar.shop (WooCommerce)
 * Extrait les 462 produits et les exporte en fichiers Excel .xlsx par catégorie
 */

const axios = require('./scraper_temp/node_modules/axios').default;
const cheerio = require('./scraper_temp/node_modules/cheerio');
const XLSX = require('./scraper_temp/node_modules/xlsx');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://touringstudiocar.shop';
const PRODUCT_SITEMAP = 'https://touringstudiocar.shop/product-sitemap.xml';
const OUTPUT_DIR = path.join(__dirname, 'SCRAPE_TOURINGSTUDIOCAR');
const DELAY_MS = 600; // polite delay between requests

const HEADERS_XLSX = [
  'URL_PRODUIT',
  'NOM_PRODUIT',
  'SKU',
  'PRIX_TTC',
  'PRIX_BARRE (ancien prix)',
  'CATEGORIE',
  'MARQUE',
  'DESCRIPTION_COURTE',
  'DESCRIPTION_LONGUE',
  'IMAGE_PRINCIPALE_URL',
  'TOUTES_IMAGES_URL',
  'VARIANTES (Volume/Conditionnement)',
  'STATUT_STOCK',
  'SLUG_URL',
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function sanitizeFilename(name) {
  return String(name || 'Non_Classe')
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 60);
}

async function fetchHtml(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'fr-FR,fr;q=0.9',
        },
        timeout: 15000,
      });
      return res.data;
    } catch (err) {
      if (i < retries - 1) {
        console.warn(`  ⚠️ Retry ${i + 1} for ${url}: ${err.message}`);
        await sleep(2000);
      } else {
        throw err;
      }
    }
  }
}

async function getProductUrls() {
  console.log('📋 Lecture du sitemap produits...');
  const xml = await fetchHtml(PRODUCT_SITEMAP);
  const urls = [];
  const matches = xml.matchAll(/<loc><!\[CDATA\[(.*?)\]\]><\/loc>|<loc>(.*?)<\/loc>/g);
  for (const m of matches) {
    const url = (m[1] || m[2] || '').trim();
    if (url && url.includes('/produit/')) {
      urls.push(url);
    }
  }
  console.log(`✓ ${urls.length} URLs produits trouvées dans le sitemap.`);
  return urls;
}

function scrapeProductPage(html, url) {
  const $ = cheerio.load(html);

  // Nom
  const name = $('h1.product_title').text().trim() ||
    $('h1.entry-title').text().trim() ||
    '';

  // Prix
  const priceText = $('.summary .price .woocommerce-Price-amount').first().text().trim() ||
    $('.summary .price .amount').first().text().trim() || '';
  const priceCrossed = $('.summary .price del .amount').first().text().trim() || '';

  // SKU
  const sku = $('.product_meta .sku').text().trim() ||
    $('.sku_wrapper .sku').text().trim() || '';

  // Catégories
  const categories = [];
  $('.product_meta .posted_in a, .product_meta .tagged_as a').each((_, el) => {
    categories.push($(el).text().trim());
  });
  const categoryStr = categories.join(' > ');

  // Marque (parfois dans les tags ou une métadonnée)
  const brand = $('.product_meta .tagged_as a').first().text().trim() || '';

  // Description courte
  const shortDesc = $('.woocommerce-product-details__short-description').text().trim() ||
    $('.woocommerce-product-details__short-description *').text().trim() || '';

  // Description longue (onglet)
  const longDesc = $('#tab-description').text().trim() ||
    $('.woocommerce-Tabs-panel--description').text().trim() || '';

  // Images
  const images = [];
  $('.woocommerce-product-gallery__image img').each((_, el) => {
    const src = $(el).attr('data-large_image') ||
      $(el).attr('data-src') ||
      $(el).attr('src') || '';
    if (src && !images.includes(src)) images.push(src);
  });
  // Fallback: og:image
  if (images.length === 0) {
    const og = $('meta[property="og:image"]').attr('content') || '';
    if (og) images.push(og);
  }
  const primaryImage = images[0] || '';
  const allImages = images.join(' | ');

  // Variantes (dropdown select)
  const variants = [];
  $('.variations select, .variations_form select').each((_, el) => {
    const label = $(el).attr('id') || $(el).attr('name') || '';
    const options = [];
    $(el).find('option').each((_, opt) => {
      const v = $(opt).val() || '';
      if (v && v !== '') options.push(v);
    });
    if (options.length) {
      variants.push(`${label}: ${options.join(', ')}`);
    }
  });
  const variantsStr = variants.join(' | ');

  // Stock
  const stockStatus = $('.stock.in-stock').text().trim() ||
    ($('.stock.out-of-stock').length ? 'Rupture de stock' : '') ||
    ($('.add_to_cart_button').length ? 'En stock' : 'N/A');

  // Slug
  const slug = url.replace(/.*\/produit\//, '').replace(/\/$/, '');

  return {
    url,
    name,
    sku,
    price: priceText,
    priceCrossed,
    category: categoryStr,
    brand,
    shortDesc,
    longDesc: longDesc.substring(0, 1000),
    primaryImage,
    allImages,
    variants: variantsStr,
    stockStatus,
    slug,
  };
}

function createXlsxFile(rows, sheetName, filePath) {
  const data = [HEADERS_XLSX, ...rows.map(p => [
    p.url,
    p.name,
    p.sku,
    p.price,
    p.priceCrossed,
    p.category,
    p.brand,
    p.shortDesc,
    p.longDesc,
    p.primaryImage,
    p.allImages,
    p.variants,
    p.stockStatus,
    p.slug,
  ])];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Column widths
  ws['!cols'] = [
    { wch: 55 }, // URL
    { wch: 45 }, // Nom
    { wch: 20 }, // SKU
    { wch: 15 }, // Prix
    { wch: 15 }, // Prix barré
    { wch: 30 }, // Catégorie
    { wch: 20 }, // Marque
    { wch: 40 }, // Desc courte
    { wch: 50 }, // Desc longue
    { wch: 55 }, // Image principale
    { wch: 60 }, // Toutes images
    { wch: 35 }, // Variantes
    { wch: 18 }, // Stock
    { wch: 40 }, // Slug
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  XLSX.writeFile(wb, filePath);
}

async function run() {
  console.log('\n=== SCRAPER TOURINGSTUDIOCAR.SHOP ===\n');

  // Clean output dir
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Step 1: Get all product URLs from sitemap
  const urls = await getProductUrls();

  // Step 2: Scrape each product page
  const allProducts = [];
  const errors = [];
  let done = 0;

  console.log(`\n🔄 Scraping de ${urls.length} produits (1 par seconde)...\n`);

  for (const url of urls) {
    try {
      const html = await fetchHtml(url);
      const product = scrapeProductPage(html, url);
      allProducts.push(product);
      done++;
      if (done % 10 === 0 || done === urls.length) {
        console.log(`  [${done}/${urls.length}] ✓ ${product.name || url}`);
      }
    } catch (err) {
      errors.push({ url, error: err.message });
      console.warn(`  [${done}/${urls.length}] ✗ ERREUR: ${url} → ${err.message}`);
      done++;
    }
    await sleep(DELAY_MS);
  }

  console.log(`\n✓ Scraping terminé: ${allProducts.length} produits récupérés, ${errors.length} erreurs.\n`);

  // Step 3: Group by category
  const categoryGroups = new Map();

  for (const product of allProducts) {
    const mainCat = product.category
      ? product.category.split('>')[0].trim()
      : 'Sans catégorie';
    if (!categoryGroups.has(mainCat)) {
      categoryGroups.set(mainCat, []);
    }
    categoryGroups.get(mainCat).push(product);
  }

  // Step 4: Write one Excel file per category
  for (const [cat, products] of categoryGroups.entries()) {
    const safeFolder = sanitizeFilename(cat);
    const catDir = path.join(OUTPUT_DIR, safeFolder);
    fs.mkdirSync(catDir, { recursive: true });

    const xlsxPath = path.join(catDir, `${safeFolder}.xlsx`);
    createXlsxFile(products, safeFolder, xlsxPath);
    console.log(`📁 ${safeFolder}/ → ${products.length} produits`);
  }

  // Step 5: Write master file
  const masterPath = path.join(OUTPUT_DIR, '00_TOUS_PRODUITS_MASTER.xlsx');
  createXlsxFile(allProducts, 'Tous les Produits', masterPath);

  // Step 6: Errors log
  if (errors.length > 0) {
    const errPath = path.join(OUTPUT_DIR, 'ERREURS_SCRAPING.txt');
    const errContent = errors.map(e => `${e.url}\nErreur: ${e.error}\n`).join('\n---\n');
    fs.writeFileSync(errPath, errContent, 'utf8');
    console.log(`\n⚠️ ${errors.length} erreurs sauvegardées dans ERREURS_SCRAPING.txt`);
  }

  // Step 7: Summary
  const summaryRows = [['Catégorie', 'Nombre de Produits']];
  for (const [cat, products] of categoryGroups.entries()) {
    summaryRows.push([cat, products.length]);
  }
  const sumWb = XLSX.utils.aoa_to_sheet(summaryRows);
  const sumBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(sumBook, sumWb, 'Résumé');
  XLSX.writeFile(sumBook, path.join(OUTPUT_DIR, '00_RECAPITULATIF.xlsx'));

  console.log(`\n=======================================`);
  console.log(`✅ Export terminé !`);
  console.log(`📁 Dossier: ${OUTPUT_DIR}`);
  console.log(`📊 Total produits scrapés: ${allProducts.length}`);
  console.log(`📂 Catégories créées: ${categoryGroups.size}`);
  console.log(`=======================================\n`);
}

run().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
