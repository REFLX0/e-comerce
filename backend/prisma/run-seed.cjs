const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to PostgreSQL. Running seed-catalogue.sql...');

  const sqlPath = path.join(__dirname, 'seed-catalogue.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  await client.query(sql);

  const countRes = await client.query('SELECT count(*) FROM public."Product"');
  console.log('SUCCESS! Total products in database:', countRes.rows[0].count);

  await client.end();
}

main().catch((err) => {
  console.error('Seed execution error:', err);
  process.exit(1);
});
