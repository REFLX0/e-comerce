const path = require("path");
const fs = require("fs");
const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}
const { Client } = require("pg");
async function main() {
  const client = new Client({
    host: "localhost",
    port: 5432,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  });
  await client.connect();
  const result = await client.query(`SELECT p.id, p.name, p.slug, v.sku FROM "Product" p JOIN "ProductVariant" v ON p.id = v."productId" WHERE v.sku LIKE '%PRICE-TBD%'`);
  console.log(JSON.stringify(result.rows, null, 2));
  await client.end();
}
main().catch(console.error);
