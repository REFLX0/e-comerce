const fs = require('fs');
const path = require('path');

const migDir = 'backend/prisma/migrations';
const migDirs = fs.readdirSync(migDir).filter(d => fs.statSync(path.join(migDir, d)).isDirectory());

const dbCols = {};

for (const d of migDirs) {
  const sqlFile = path.join(migDir, d, 'migration.sql');
  if (!fs.existsSync(sqlFile)) continue;
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Match CREATE TABLE "TableName" ( ... )
  const createRegex = /CREATE TABLE "([^"]+)" \(([\s\S]*?)\);/g;
  let m;
  while ((m = createRegex.exec(sql)) !== null) {
    const tbl = m[1];
    if (!dbCols[tbl]) dbCols[tbl] = new Set();
    const colLines = m[2].split('\n');
    for (const cl of colLines) {
      const colMatch = cl.trim().match(/^"([^"]+)"/);
      if (colMatch) dbCols[tbl].add(colMatch[1]);
    }
  }

  // Match ALTER TABLE "TableName" ADD COLUMN ... "colName"
  const alterRegex = /ALTER TABLE "([^"]+)"[\s\S]*?ADD COLUMN (?:IF NOT EXISTS )?"([^"]+)"/g;
  while ((m = alterRegex.exec(sql)) !== null) {
    const tbl = m[1];
    if (!dbCols[tbl]) dbCols[tbl] = new Set();
    dbCols[tbl].add(m[2]);
  }
}

const schemaContent = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');
const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;

const missingTables = [];
const missingFields = [];

let modelMatch;
while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
  const modelName = modelMatch[1];
  if (modelName.startsWith('Tecdoc')) continue;

  const tblCols = dbCols[modelName];
  if (!tblCols) {
    missingTables.push(modelName);
    continue;
  }

  const lines = modelMatch[2].split('\n');
  for (const l of lines) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) continue;
    const parts = trimmed.split(/\s+/);
    const fieldName = parts[0];
    const fieldType = parts[1];

    const baseType = fieldType.replace('?', '').replace('[]', '');
    const standardScalars = ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Role', 'OrderStatus', 'OrderType', 'PaymentStatus', 'InvoiceStatus', 'VehicleType', 'FuelType', 'SupportStatus', 'SupportPriority', 'DeliveryType', 'WeightUnit', 'DiscountType'];

    if (standardScalars.includes(baseType) && !fieldType.endsWith('[]')) {
      if (!tblCols.has(fieldName)) {
        missingFields.push({ model: modelName, field: fieldName, type: fieldType });
      }
    }
  }
}

console.log('=== MISSING TABLES (in schema.prisma but NOT in any migration) ===');
missingTables.forEach(t => console.log('  - ' + t));

console.log('\n=== MISSING COLUMNS (in schema.prisma but NOT in any migration) ===');
missingFields.forEach(f => console.log('  - ' + f.model + '.' + f.field + ' (' + f.type + ')'));
