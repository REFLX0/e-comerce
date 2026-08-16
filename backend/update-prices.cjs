const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');
const CSV = path.join(__dirname, 'prices_import.csv');

const rows = fs.readFileSync(CSV, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .slice(1)
  .map((l) => {
    const [sku, volume, ht, ttc] = l.split(',');
    return { sku: sku.trim(), volume: volume.trim(), ht: parseFloat(ht), ttc: parseFloat(ttc) };
  });

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'kiosquetn',
    password: 'kiosquetn_local_secret',
    database: 'kiosquetn',
  });
  await client.connect();

  const { rows: allVariants } = await client.query(
    `SELECT v.id, v."skuVariant", v.volume, v.price, p.sku, p."nameFr"
       FROM "ProductVariant" v
       JOIN "Product" p ON p.id = v."productId"
      WHERE v.price = 0`
  );

  const results = [];
  for (const r of rows) {
    const candidates = allVariants.filter((v) => {
      const volOk = v.volume.trim().toLowerCase() === r.volume.toLowerCase();
      const skuOk = v.sku === r.sku || v.sku.startsWith(r.sku);
      return volOk && skuOk;
    });
    results.push({ row: r, candidates });
  }

  const matched = results.filter((x) => x.candidates.length === 1);
  const ambiguous = results.filter((x) => x.candidates.length > 1);
  const none = results.filter((x) => x.candidates.length === 0);

  console.log(`Total rows: ${rows.length}`);
  console.log(`Matched (unique): ${matched.length}`);
  console.log(`Ambiguous: ${ambiguous.length}`);
  console.log(`Not found: ${none.length}`);
  for (const a of ambiguous) {
    console.log(`AMBIGUOUS ${a.row.sku} [${a.row.volume}]: ${a.candidates.map((c) => `${c.sku}|${c.volume}`).join(' , ')}`);
  }
  for (const n of none) {
    console.log(`NOT FOUND ${n.row.sku} [${n.row.volume}]`);
  }

  const dbSkus = new Set(allVariants.map((v) => v.sku));
  const matchedSkus = new Set(matched.map((m) => m.candidates[0].sku));
  const missingDb = allVariants.filter((v) => !matchedSkus.has(v.sku));
  console.log(`\nDB variants at price 0 not covered by CSV: ${missingDb.length}`);
  for (const m of missingDb) console.log(`  DB-ONLY ${m.sku} [${m.volume}]`);

  if (APPLY && ambiguous.length === 0 && none.length === 0) {
    await client.query('BEGIN');
    let n = 0;
    for (const m of matched) {
      const v = m.candidates[0];
      await client.query('UPDATE "ProductVariant" SET price = $1 WHERE id = $2', [m.row.ht, v.id]);
      n++;
    }
    await client.query('COMMIT');
    console.log(`\nApplied: ${n} price updates`);
  } else if (APPLY) {
    console.log('\nSkipping apply: resolve ambiguous/not-found rows first');
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});