/**
 * import_autopart_node.mjs
 * Runs inside the backend Docker container (achref-backend-2) where the DB
 * is reachable at db:5432 via the internal Docker network.
 *
 * Usage (inside container):
 *   node /tmp/import_autopart_node.mjs
 */
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { createRequire } from 'module';
import { randomUUID } from 'crypto';

// Load pg from the app's node_modules since this script runs from /tmp
const require = createRequire('/app/package.json');
const { Pool } = require('pg');

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const DB_URL = process.env.DATABASE_URL ||
  'postgresql://kiosquetn:kiosquetn_local_secret@db:5432/kiosquetn';

// CSV files are copied to /tmp/autopart_db/ inside the container
const BASE = '/tmp/autopart_db';
const PRODUCTS_CSV  = `${BASE}/products.csv`;
const IMAGES_CSV    = `${BASE}/image_urls.csv`;
const SPECS_CSV     = `${BASE}/technical_specs.csv`;
const VEHICLES_CSV  = `${BASE}/compatible_vehicles.csv`;

const PROD_BATCH = 200;
const COMPAT_BATCH = 500;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function progress(msg) {
  const t = new Date().toLocaleTimeString('en-GB');
  console.log(`[${t}] ${msg}`);
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'product';
}

function ensureUniqueSlug(base, used) {
  let slug = base || 'product';
  let n = 1;
  while (used.has(slug)) {
    slug = `${base}-${n++}`;
  }
  used.add(slug);
  return slug;
}

function parsePrice(raw) {
  if (!raw) return 0;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function parseYearRange(raw) {
  if (!raw) return [null, null];
  const m4 = raw.match(/(\d{4})/g);
  if (!m4 || m4.length === 0) return [null, null];
  const years = m4.map(Number).filter(y => y >= 1950 && y <= 2030);
  if (years.length === 0) return [null, null];
  return [Math.min(...years), Math.max(...years)];
}

function cleanDescription(raw) {
  if (!raw) return '';
  // Remove price source lines, EAN lines, livraison lines, autopart.tn links
  return raw
    .replace(/\s*—\s*\.?\s*Pièce de qualité livrée partout en Tunisie\.?/gi, '')
    .replace(/https?:\/\/[^\s]*/g, '')
    .replace(/Source\s*:.*$/gim, '')
    .replace(/Prix\s*source\s*:.*$/gim, '')
    .replace(/EAN\s*:.*$/gim, '')
    .replace(/GTIN.*$/gim, '')
    .replace(/Livraison.*$/gim, '')
    .replace(/autopart\.tn[^\s]*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Parse CSV line respecting quoted fields
function* parseCsvLine(line) {
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      yield field; field = '';
    } else {
      field += ch;
    }
  }
  yield field;
}

async function readCsv(filepath) {
  const rl = createInterface({ input: createReadStream(filepath, { encoding: 'utf8' }), crlfDelay: Infinity });
  const rows = [];
  let headers = null;
  for await (const line of rl) {
    const fields = [...parseCsvLine(line)];
    if (!headers) { headers = fields; continue; }
    const obj = {};
    headers.forEach((h, i) => { obj[h] = fields[i] ?? ''; });
    if (fields.length > headers.length) obj._overflow = fields.slice(headers.length);
    rows.push(obj);
  }
  return rows;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  progress('Connecting to database …');
  const pool = new Pool({ connectionString: DB_URL });
  const client = await pool.connect();

  try {
    // ── 1. BUILD LOOKUP MAPS ────────────────────────────────────────────────
    progress('=== Phase 1: Loading images & specs …');
    const imgMap = new Map(); // ext_product_id -> [url, ...]
    const specMap = new Map(); // ext_product_id -> [spec_string, ...]

    progress('  Reading image_urls.csv …');
    const imageRows = await readCsv(IMAGES_CSV);
    for (const row of imageRows) {
      const pid = (row.product_id || '').trim();
      const url = (row.image_url || '').trim();
      if (!pid || !url) continue;
      if (!imgMap.has(pid)) imgMap.set(pid, []);
      if (imgMap.get(pid).length < 5) imgMap.get(pid).push(url);
    }
    progress(`  Images loaded: ${imgMap.size} products with images`);

    progress('  Reading technical_specs.csv …');
    const specRows = await readCsv(SPECS_CSV);
    for (const row of specRows) {
      const pid = (row.product_id || '').trim();
      // The scraper writes product_id,spec_label,spec_value. Most files pack
      // the label and value into spec_label with a `|` separator.
      const packed = (row.spec_label || '').trim();
      const separator = packed.indexOf('|');
      const trailingValue = [row.spec_value, ...(row._overflow || [])]
        .filter(value => value !== undefined && value !== '')
        .join(',')
        .trim();
      const key = (separator === -1 ? packed : packed.slice(0, separator)).trim();
      const val = (separator === -1
        ? trailingValue
        : `${packed.slice(separator + 1)}${trailingValue ? `,${trailingValue}` : ''}`
      ).trim();
      if (!pid || !key) continue;
      if (!specMap.has(pid)) specMap.set(pid, []);
      specMap.get(pid).push(`${key}: ${val}`);
    }
    progress(`  Specs loaded: ${specMap.size} products with specs`);

    // ── 2. BRANDS & CATEGORIES ──────────────────────────────────────────────
    progress('=== Phase 2: Brands & Categories …');

    // Load existing brands/categories
    const brandMap = new Map(); // name -> id
    const catMap = new Map();   // name -> id
    const usedBrandSlugs = new Set();
    const usedCatSlugs = new Set();

    const { rows: existBrands } = await client.query('SELECT id, name, slug FROM "Brand"');
    for (const b of existBrands) { brandMap.set(b.name, b.id); usedBrandSlugs.add(b.slug); }

    const { rows: existCats } = await client.query('SELECT id, "nameFr", slug FROM "Category"');
    for (const c of existCats) { catMap.set(c.nameFr, c.id); usedCatSlugs.add(c.slug); }

    async function getOrCreateBrand(name) {
      if (!name) name = 'Générique';
      if (brandMap.has(name)) return brandMap.get(name);
      const slug = ensureUniqueSlug(slugify(name).slice(0, 100), usedBrandSlugs);
      const id = randomUUID();
      await client.query(
        'INSERT INTO "Brand" (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [id, name, slug]
      );
      const res = await client.query('SELECT id FROM "Brand" WHERE slug = $1', [slug]);
      const bid = res.rows[0].id;
      brandMap.set(name, bid);
      return bid;
    }

    async function getOrCreateCategory(name) {
      if (!name) name = 'Pièces Auto';
      if (catMap.has(name)) return catMap.get(name);
      const slug = ensureUniqueSlug(slugify(name).slice(0, 100), usedCatSlugs);
      const id = randomUUID();
      await client.query(
        'INSERT INTO "Category" (id, "nameFr", slug) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET "nameFr" = EXCLUDED."nameFr" RETURNING id',
        [id, name, slug]
      );
      const res = await client.query('SELECT id FROM "Category" WHERE slug = $1', [slug]);
      const cid = res.rows[0].id;
      catMap.set(name, cid);
      return cid;
    }

    // ── 3. PRODUCTS ─────────────────────────────────────────────────────────
    progress('=== Phase 3: Products …');

    // Load existing SKUs and slugs
    const { rows: existProds } = await client.query('SELECT sku, id FROM "Product"');
    const existingSkus = new Set(existProds.map(p => p.sku));
    const usedProdSlugs = new Set();
    const { rows: existSlugs } = await client.query('SELECT slug FROM "Product"');
    for (const r of existSlugs) usedProdSlugs.add(r.slug);
    const prodMap = new Map(); // ext_id -> db_id

    // Pre-fill prodMap from existing products (by sku pattern)
    for (const p of existProds) prodMap.set(p.sku.replace(/-U$/, ''), p.id);

    progress('  Reading products.csv …');
    const productRows = await readCsv(PRODUCTS_CSV);
    progress(`  Total product rows: ${productRows.length.toLocaleString()}`);

    let totalProds = 0;
    let skippedProds = 0;
    const usedSkus = new Set(existingSkus);

    let batch = [];
    for (const row of productRows) {
      const extId   = (row.product_id || '').trim();
      const name    = (row.name || '').trim();
      const brand   = (row.brand || row.manufacturer || '').trim();
      const cat     = (row.category_name || row.category || row.product_type || row.subcategory_slug || '').trim();
      const priceRaw = row.price || row.selling_price || '0';
      const descRaw  = row.description || row.long_description || '';
      const avail    = (row.availability || row.stock_status || 'in_stock').toLowerCase();

      if (!extId || !name) { skippedProds++; continue; }

      const price = parsePrice(priceRaw);
      const sku = extId.slice(0, 100);
      // Keep the SKU stable so a later import refreshes existing products,
      // including their descriptions and technical specifications.
      const isExistingProduct = usedSkus.has(sku);
      usedSkus.add(sku);

      const slugBase = slugify(name).slice(0, 90);
      const slug = ensureUniqueSlug(slugBase, usedProdSlugs);

      let desc = cleanDescription(descRaw);
      if (!desc || desc === name) {
        desc = `${name} est une pièce de rechange automobile de marque ${brand || 'd’origine contrôlée'}.`;
      }
      const catalogueSpecs = [
        brand && `Marque: ${brand}`,
        (row.mpn || row.sku || extId) && `Référence fabricant: ${row.mpn || row.sku || extId}`,
        cat && `Catégorie: ${cat.replace(/-/g, ' ')}`,
      ].filter(Boolean);
      const specs = [...catalogueSpecs, ...(specMap.get(extId) || [])];
      desc = `${desc.trim()}\n\nSpécifications techniques:\n${specs.slice(0, 20).map(s => `• ${s}`).join('\n')}`;

      const inStock = avail.includes('stock') && !avail.includes('rupture');
      const stockQty = inStock ? 10 : 0;

      batch.push({ extId, sku, name, slug, desc, brand, cat, price, stockQty, isExistingProduct });

      if (batch.length >= PROD_BATCH) {
        await insertProductBatch(client, batch, imgMap, prodMap, getOrCreateBrand, getOrCreateCategory);
        totalProds += batch.length;
        batch = [];
        if (totalProds % 2000 === 0) progress(`  ${totalProds.toLocaleString()} products …`);
      }
    }
    if (batch.length > 0) {
      await insertProductBatch(client, batch, imgMap, prodMap, getOrCreateBrand, getOrCreateCategory);
      totalProds += batch.length;
    }
    progress(`  Products done: ${totalProds.toLocaleString()} imported, ${skippedProds.toLocaleString()} skipped`);

    // ── 4. VEHICLE COMPATIBILITY ────────────────────────────────────────────
    progress('=== Phase 4: Vehicle compatibility (ALL rows) …');
    progress('  This phase may take 30-90 minutes. Do not interrupt.');

    const makeMap = new Map();
    const modelMap = new Map();
    const usedModelSlugs = new Set();

    const { rows: existMakes } = await client.query('SELECT name, id FROM "VehicleMake"');
    for (const m of existMakes) makeMap.set(m.name, m.id);

    const { rows: existModels } = await client.query('SELECT "makeId", name, id FROM "VehicleModel"');
    for (const m of existModels) { modelMap.set(`${m.makeId}|${m.name}`, m.id); }

    const { rows: existModelSlugs } = await client.query('SELECT slug FROM "VehicleModel"');
    for (const r of existModelSlugs) usedModelSlugs.add(r.slug);

    async function getOrCreateMake(name) {
      if (makeMap.has(name)) return makeMap.get(name);
      const slug = ensureUniqueSlug(slugify(name).slice(0, 100), new Set([...makeMap.values()]));
      const id = randomUUID();
      await client.query(
        'INSERT INTO "VehicleMake" (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [id, name, slugify(name).slice(0, 100)]
      );
      const res = await client.query('SELECT id FROM "VehicleMake" WHERE name = $1', [name]);
      const mid = res.rows[0]?.id || id;
      makeMap.set(name, mid);
      return mid;
    }

    async function getOrCreateModel(makeId, modelName) {
      const key = `${makeId}|${modelName}`;
      if (modelMap.has(key)) return modelMap.get(key);
      const slug = ensureUniqueSlug(slugify(modelName).slice(0, 100), usedModelSlugs);
      const id = randomUUID();
      await client.query(
        'INSERT INTO "VehicleModel" (id, "makeId", name, slug) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [id, makeId, modelName, slug]
      );
      const res = await client.query('SELECT id FROM "VehicleModel" WHERE "makeId" = $1 AND name = $2', [makeId, modelName]);
      const mid = res.rows[0]?.id || id;
      modelMap.set(key, mid);
      return mid;
    }

    let compatTotal = 0;
    let compatSkip = 0;
    let compatBatch = [];

    const rl = createInterface({
      input: createReadStream(VEHICLES_CSV, { encoding: 'utf8' }),
      crlfDelay: Infinity
    });

    let isFirstLine = true;
    let vehicleHeaders = [];

    for await (const line of rl) {
      if (isFirstLine) {
        vehicleHeaders = [...parseCsvLine(line)];
        isFirstLine = false;
        continue;
      }

      const fields = [...parseCsvLine(line)];
      const row = {};
      vehicleHeaders.forEach((h, i) => { row[h] = fields[i] ?? ''; });

      const extPid = (row.product_id || '').trim();
      const packed = (row.brand || '').trim();

      const productId = prodMap.get(extPid);
      if (!productId || !packed) { compatSkip++; continue; }

      const parts = packed.split('|').map(p => p.trim());
      if (parts.length < 2) { compatSkip++; continue; }

      const makeName  = parts[0].slice(0, 100);
      const modelName = parts[1].slice(0, 200);
      const engineRaw = (parts[2] || '').slice(0, 300);

      if (!makeName || !modelName) { compatSkip++; continue; }

      const [yearFrom, yearTo] = parseYearRange(engineRaw);
      const engineCode = engineRaw
        .replace(/\s*(?:de|du)\s+\d+\/\d{4}(?:\s+à\s+\d+\/\d{4})?\s*/gi, ' ')
        .replace(/\s+/g, ' ').trim().slice(0, 200) || null;

      compatBatch.push({ makeName, modelName, engineCode, yearFrom, yearTo, productId });

      if (compatBatch.length >= COMPAT_BATCH) {
        await insertCompatBatch(client, compatBatch, getOrCreateMake, getOrCreateModel);
        compatTotal += compatBatch.length;
        compatBatch = [];
        if (compatTotal % 50000 === 0) progress(`  ${compatTotal.toLocaleString()} compat rows …`);
      }
    }

    if (compatBatch.length > 0) {
      await insertCompatBatch(client, compatBatch, getOrCreateMake, getOrCreateModel);
      compatTotal += compatBatch.length;
    }

    progress(`  Vehicle compat done: ${compatTotal.toLocaleString()} rows, ${compatSkip.toLocaleString()} skipped`);
    progress('=== ALL DONE! ===');
    progress(`Summary: ${totalProds.toLocaleString()} products | ${compatTotal.toLocaleString()} vehicle compat rows`);

  } finally {
    client.release();
    await pool.end();
  }
}

// ─── BATCH HELPERS ────────────────────────────────────────────────────────────
async function insertProductBatch(client, batch, imgMap, prodMap, getOrCreateBrand, getOrCreateCategory) {
  for (const { extId, sku, name, slug, desc, brand, cat, price, stockQty, isExistingProduct } of batch) {
    try {
      const brandId = await getOrCreateBrand(brand);
      const catId   = await getOrCreateCategory(cat);

      const res = await client.query(
        `INSERT INTO "Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
         VALUES ($1, $2, $3, $4, $5, false, true, $6, $7, NOW())
         ON CONFLICT (sku) DO UPDATE
           SET "nameFr" = EXCLUDED."nameFr",
               description = EXCLUDED.description,
               "isPublished" = true,
               "brandId" = EXCLUDED."brandId",
               "categoryId" = EXCLUDED."categoryId"
         RETURNING id`,
        [randomUUID(), sku, name, slug, desc, brandId, catId]
      );
      const prodDbId = res.rows[0].id;
      prodMap.set(extId, prodDbId);

      const variantSku = `${sku}-U`;
      await client.query(
        `INSERT INTO "ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant")
         VALUES ($1, $2, '1', $3, $4, $5)
         ON CONFLICT ("skuVariant") DO UPDATE
           SET price = EXCLUDED.price, "stockQty" = EXCLUDED."stockQty"`,
        [randomUUID(), prodDbId, price, stockQty, variantSku]
      );

      // Existing products already have their images. Avoid duplicating image
      // rows when this script is used to refresh descriptions/specifications.
      const images = isExistingProduct ? [] : (imgMap.get(extId) || []);
      for (let i = 0; i < Math.min(images.length, 5); i++) {
        await client.query(
          `INSERT INTO "ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [randomUUID(), prodDbId, images[i], i === 0, i]
        );
      }
    } catch (err) {
      // skip individual product errors
    }
  }
}

async function insertCompatBatch(client, batch, getOrCreateMake, getOrCreateModel) {
  for (const { makeName, modelName, engineCode, yearFrom, yearTo, productId } of batch) {
    try {
      const makeId  = await getOrCreateMake(makeName);
      const modelId = await getOrCreateModel(makeId, modelName);
      await client.query(
        `INSERT INTO "VehicleCompatibility" (id, "productId", "vehicleModelId", "engineCode", "yearFrom", "yearTo")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT ("productId", "vehicleModelId", "engineCode") DO NOTHING`,
        [randomUUID(), productId, modelId, engineCode, yearFrom, yearTo]
      );
    } catch (err) {
      // skip
    }
  }
}

// Run
const start = Date.now();
main().then(() => {
  const mins = ((Date.now() - start) / 60000).toFixed(1);
  console.log(`\nTotal time: ${mins} minutes`);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
