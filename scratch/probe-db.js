const path = require('path');
const { Client } = require(path.join(__dirname, '../backend/node_modules/pg'));

const ports = [5433, 5432];
const users = ['kiosquetn', 'postgres'];
const passwords = ['kiosquetn_local_secret', 'postgres', 'admin', 'root', '123456', 'kiosquetn', ''];
const dbs = ['kiosquetn', 'postgres'];

async function testAll() {
  for (const port of ports) {
    for (const user of users) {
      for (const password of passwords) {
        for (const database of dbs) {
          const client = new Client({
            host: 'localhost',
            port,
            user,
            password,
            database,
            connectionTimeoutMillis: 1000,
          });
          try {
            await client.connect();
            console.log(`✅ SUCCESS! Port: ${port}, User: ${user}, Pass: "${password}", DB: ${database}`);
            const res = await client.query('SELECT current_database(), current_user;');
            console.log('Query result:', res.rows[0]);
            
            // Check tables
            const tables = await client.query(`
              SELECT table_name FROM information_schema.tables 
              WHERE table_schema = 'public' 
              LIMIT 10;
            `);
            console.log('Tables:', tables.rows.map(r => r.table_name));
            await client.end();
            return;
          } catch (e) {
            // failed, continue
          }
        }
      }
    }
  }
  console.log('❌ None of the tested combinations succeeded.');
}

testAll();
