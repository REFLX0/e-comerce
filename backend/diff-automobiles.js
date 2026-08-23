const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env from backend
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const DATASET_DIR = path.join(__dirname, '../oil-finder-full-dataset');

// Collect all source automobile vehicles
const sourceVehicles = [];
const files = fs.readdirSync(DATASET_DIR).filter(f => f.startsWith('automobile-') && f.endsWith('.json') && !f.includes('conflict'));

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, file), 'utf8'));
  const vehicles = Array.isArray(data) ? data : data.vehicles || [];
  for (const v of vehicles) {
    sourceVehicles.push({
      make: (v.make || '').toLowerCase().trim(),
      model: (v.model || '').trim(),
      generation: (v.generation || '').trim(),
      engineCode: (v.engineCode || '').trim(),
      _file: file,
      _raw: v,
    });
  }
}

console.log(`Source: ${sourceVehicles.length} automobile entries across ${files.length} files`);

async function main() {
  const dbUrl = process.env.DATABASE_URL || `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@localhost:5432/${env.POSTGRES_DB}`;
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const result = await client.query(`
    SELECT make, model, generation, "engineCode"
    FROM "OilFinderVehicle"
    WHERE category = 'automobile'
    ORDER BY make, model, generation, "engineCode"
  `);

  await client.end();

  const dbVehicles = result.rows;
  console.log(`DB:     ${dbVehicles.length} automobile rows\n`);

  // Build DB lookup key set
  const dbKeys = new Set(dbVehicles.map(v => `${(v.make || '').toLowerCase().trim()}|${v.model}|${v.generation}|${v.engineCode}`));

  // Find source entries not in DB
  const missing = sourceVehicles.filter(v => {
    const key = `${v.make}|${v.model}|${v.generation}|${v.engineCode}`;
    return !dbKeys.has(key);
  });

  if (missing.length === 0) {
    console.log('✅ No missing vehicles — all source entries are in the DB.');
    // Check for duplicates in source
    const sourceCounts = {};
    for (const v of sourceVehicles) {
      const key = `${v.make}|${v.model}|${v.generation}|${v.engineCode}`;
      sourceCounts[key] = (sourceCounts[key] || 0) + 1;
    }
    const dups = Object.entries(sourceCounts).filter(([, c]) => c > 1);
    if (dups.length > 0) {
      console.log(`\n⚠️  Source has ${dups.length} duplicate key(s) — explains the 393→392 count:`);
      for (const [key, count] of dups) {
        const [make, model, generation, engineCode] = key.split('|');
        console.log(`   ${count}x  make="${make}" model="${model}" gen="${generation}" engine="${engineCode}"`);
        // Show raw data for the dups
        const rawDups = sourceVehicles.filter(v => `${v.make}|${v.model}|${v.generation}|${v.engineCode}` === key);
        rawDups.forEach((v, i) => console.log(`      dup[${i}] file=${v._file}`, JSON.stringify(v._raw)));
      }
    }
  } else {
    console.log(`❌ ${missing.length} source vehicle(s) NOT in DB:\n`);
    for (const v of missing) {
      console.log(`   File: ${v._file}`);
      console.log(`   make="${v.make}" model="${v.model}" gen="${v.generation}" engine="${v.engineCode}"`);
      console.log(`   Raw:`, JSON.stringify(v._raw, null, 2));
      console.log();
    }
  }

  // Also check reverse: DB entries NOT in source
  const sourceKeys = new Set(sourceVehicles.map(v => `${v.make}|${v.model}|${v.generation}|${v.engineCode}`));
  const extra = dbVehicles.filter(v => !sourceKeys.has(`${(v.make || '').toLowerCase().trim()}|${v.model}|${v.generation}|${v.engineCode}`));
  if (extra.length > 0) {
    console.log(`\n⚠️  ${extra.length} DB row(s) NOT in source (phantom inserts):`);
    for (const v of extra) {
      console.log(`   make="${v.make}" model="${v.model}" gen="${v.generation}" engine="${v.engineCode}"`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
