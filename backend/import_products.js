const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('pg');

const CSV_DIR = '/app/TecDoc_Export';
const client = new Client({
  host: 'db',
  port: 5432,
  database: 'kiosquetn',
  user: 'kiosquetn',
  password: 'kiosquetn_local_secret',
});

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(cur); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur);
  return result;
}

async function readCSV(filename, onRow) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: fs.createReadStream(path.join(CSV_DIR, filename)), crlfDelay: Infinity });
    let headers = null;
    rl.on('line', (line) => {
      if (!line.trim()) return;
      const cols = parseCSVLine(line);
      if (!headers) { headers = cols.map(h => h.toLowerCase().trim()); return; }
      const row = {};
      headers.forEach((h, i) => { row[h] = (cols[i] || '').trim(); });
      onRow(row);
    });
    rl.on('close', resolve);
    rl.on('error', reject);
  });
}

async function main() {
  console.log('Connecting to database...');
  await client.connect();
  console.log('Connected!');

  // Step 1: Get linked article_ids
  console.log('Step 1: Reading vehicle links...');
  const linkedIds = new Set();
  const compatMap = {};
  await readCSV('clean_vehicle_links_tunisia_fixed.csv', row => {
    const aid = row.article_id;
    if (!aid) return;
    linkedIds.add(aid);
    const attrs = row.linkages_attributes || '';
    const text = attrs ? attrs.replace(/##/g, ' | ').replace(/\$\$/g, ': ') : 'Véhicule compatible';
    if (!compatMap[aid]) compatMap[aid] = [];
    compatMap[aid].push(`<li>${text}</li>`);
  });
  console.log(`  → ${linkedIds.size} linked article IDs`);

  // Step 2: Read specs
  console.log('Step 2: Reading attributes...');
  const specsMap = {};
  await readCSV('clean_attributes_tunisia_fixed.csv', row => {
    const aid = row.article_id;
    if (!linkedIds.has(aid)) return;
    const title = row.displaytitle || '';
    const value = row.displayvalue || '';
    if (!title || !value) return;
    if (!specsMap[aid]) specsMap[aid] = [];
    specsMap[aid].push(`<li><strong>${title}:</strong> ${value}</li>`);
  });
  console.log(`  → specs for ${Object.keys(specsMap).length} articles`);

  // Step 3: Read OE numbers
  console.log('Step 3: Reading OE numbers...');
  const oeMap = {};
  await readCSV('clean_oe_numbers_tunisia_fixed.csv', row => {
    const aid = row.article_id;
    if (!linkedIds.has(aid)) return;
    const oenbr = row.oenbr || '';
    const mfr = row.manufacturer || '';
    if (!oenbr) return;
    if (!oeMap[aid]) oeMap[aid] = [];
    oeMap[aid].push(`<li>${oenbr}${mfr ? ' — ' + mfr : ''}</li>`);
  });
  console.log(`  → OE refs for ${Object.keys(oeMap).length} articles`);

  // Step 4: Delete old products
  console.log('Step 4: Deleting old products...');
  const { rows: ordered } = await client.query('SELECT DISTINCT "productId" FROM "OrderItem"');
  const protectedIds = ordered.map(r => r.productId);
  const protectedList = protectedIds.length > 0 ? protectedIds : ['__none__'];

  await client.query(`DELETE FROM "ProductVariant" WHERE "productId" NOT IN (${protectedList.map((_, i) => `$${i+1}`).join(',')})`, protectedList);
  await client.query(`DELETE FROM "ProductImage" WHERE "productId" NOT IN (${protectedList.map((_, i) => `$${i+1}`).join(',')})`, protectedList);
  await client.query(`DELETE FROM "Review" WHERE "productId" NOT IN (${protectedList.map((_, i) => `$${i+1}`).join(',')})`, protectedList);
  await client.query(`DELETE FROM "WishlistItem" WHERE "productId" NOT IN (${protectedList.map((_, i) => `$${i+1}`).join(',')})`, protectedList);
  await client.query(`DELETE FROM "Product" WHERE id NOT IN (${protectedList.map((_, i) => `$${i+1}`).join(',')})`, protectedList);
  console.log(`  → old products deleted (kept ${protectedIds.length} ordered products)`);

  // Ensure category exists
  await client.query(`INSERT INTO "Category" (id, "nameFr", slug) VALUES ('cat-tecdoc-123','Pièces Auto','pieces-auto') ON CONFLICT (slug) DO NOTHING`);

  // Step 5: Insert products
  console.log('Step 5: Inserting Tunisia-linked products...');
  const brands = new Set();
  let inserted = 0;
  let batch = [];

  const flush = async () => {
    if (!batch.length) return;
    const placeholders = batch.map((_, i) => {
      const base = i * 9;
      return `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9})`;
    }).join(',');
    const values = batch.flat();
    await client.query(`INSERT INTO "Product" (id,sku,"nameFr",slug,description,"isFeatured","isPublished","brandId","categoryId") VALUES ${placeholders} ON CONFLICT (sku) DO NOTHING`, values);
    inserted += batch.length;
    if (inserted % 500 === 0) console.log(`  → ${inserted} products inserted...`);
    batch = [];
  };

  await readCSV('clean_articles_tunisia_fixed.csv', async row => {
    const aid = row.article_id;
    if (!linkedIds.has(aid)) return;
    const sku = row.datasupplierarticlenumber || '';
    const supplier = row.supplier || '';
    const name = row.normalizeddescription || 'Pièce Auto';
    if (!sku || !supplier) return;

    const brandId = `brand-${supplier}`;
    if (!brands.has(brandId)) {
      brands.add(brandId);
    }

    let desc = '<p>Pièce de rechange auto.</p>';
    if (specsMap[aid]) desc += `<h3>Spécifications</h3><ul>${specsMap[aid].join('')}</ul>`;
    if (oeMap[aid]) desc += `<h3>Références d'origine</h3><ul>${oeMap[aid].join('')}</ul>`;
    if (compatMap[aid]) desc += `<h3>Compatibilité Véhicules</h3><ul>${compatMap[aid].join('')}</ul>`;

    const slug = `prod-${aid}-${sku.toLowerCase().replace(/\s+/g, '-')}`;
    batch.push([`prod-${aid}`, sku, name, slug, desc, false, true, brandId, 'cat-tecdoc-123']);
  });

  // Insert all brands first
  for (const brandId of brands) {
    const supplier = brandId.replace('brand-', '');
    await client.query(`INSERT INTO "Brand" (id, name, slug) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING`, [brandId, `Supplier ${supplier}`, `supplier-${supplier}`]);
  }

  // Now flush remaining batch
  await flush();

  const { rows: [{ count }] } = await client.query('SELECT COUNT(*) as count FROM "Product"');
  const { rows: [{ specs_count }] } = await client.query(`SELECT COUNT(*) as specs_count FROM "Product" WHERE description LIKE '%Spécifications%'`);
  const { rows: [{ compat_count }] } = await client.query(`SELECT COUNT(*) as compat_count FROM "Product" WHERE description LIKE '%Compatibilité%'`);

  console.log('\n========================================');
  console.log(`Total products:      ${count}`);
  console.log(`With Spécifications: ${specs_count}`);
  console.log(`With Compatibilité:  ${compat_count}`);
  console.log('========================================');

  await client.end();
  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
