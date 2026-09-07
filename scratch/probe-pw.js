const path = require('path');
const { Client } = require(path.join(__dirname, '../backend/node_modules/pg'));

const candidates = [
  'achref', 'achref123', 'achref2024', 'achref2025', 'achref2026',
  'asus', 'Asus', 'Asus123',
  'kiosquetn', 'kiosquetn_local_secret', 'kiosquetn_secret', 'specpart',
  'postgres', 'root', 'admin', '1234', '123456', '12345678', 'password', ''
];

const users = ['postgres', 'kiosquetn'];
const ports = [5433, 5432];

async function probe() {
  for (const port of ports) {
    for (const user of users) {
      for (const pass of candidates) {
        const client = new Client({
          host: '127.0.0.1',
          port,
          user,
          password: pass,
          database: 'postgres',
          connectionTimeoutMillis: 500,
        });
        try {
          await client.connect();
          console.log(`FOUND! Port ${port} User ${user} Pass "${pass}"`);
          const dbs = await client.query('SELECT datname FROM pg_database;');
          console.log('Databases:', dbs.rows.map(r => r.datname));
          await client.end();
          return;
        } catch (e) {
          // ignore
        }
      }
    }
  }
  console.log('No candidate matched.');
}

probe();
