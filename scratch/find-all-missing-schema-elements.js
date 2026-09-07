const fs = require('fs');
const path = require('path');

const migDir = 'backend/prisma/migrations';
const migDirs = fs.readdirSync(migDir).filter(d => fs.statSync(path.join(migDir, d)).isDirectory());

const allSql = migDirs.map(d => {
  const p = path.join(migDir, d, 'migration.sql');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}).join('\n');

const schemaContent = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

// List all models in schema.prisma
const models = [];
const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
let m;
while ((m = modelRegex.exec(schemaContent)) !== null) {
  const modelName = m[1];
  if (modelName.startsWith('Tecdoc')) continue;

  const lines = m[2].split('\n');
  const fields = [];
  for (const l of lines) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) continue;
    const parts = trimmed.split(/\s+/);
    const fieldName = parts[0];
    const fieldType = parts[1];

    // Exclude relation models/arrays
    const baseType = fieldType.replace('?', '').replace('[]', '');
    const isScalarOrEnum = ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Role', 'OrderStatus', 'OrderType', 'PaymentStatus', 'InvoiceStatus', 'VehicleType', 'FuelType', 'SupportStatus', 'SupportPriority', 'DeliveryType', 'WeightUnit', 'DiscountType'].includes(baseType);

    if (isScalarOrEnum && !fieldType.endsWith('[]')) {
      fields.push({ name: fieldName, type: fieldType });
    }
  }
  models.push({ modelName, fields });
}

console.log('Auditing', models.length, 'models against all migrations:');

const missingItems = [];

for (const mod of models) {
  // Check if table was created
  const tableCreated = new RegExp(`CREATE TABLE "(?:public\\.)?${mod.modelName}"`, 'i').test(allSql);
  if (!tableCreated) {
    missingItems.push({ type: 'TABLE', model: mod.modelName });
  }

  for (const f of mod.fields) {
    // Check if column exists in CREATE TABLE for this model or ALTER TABLE for this model
    // Simple check: does allSql contain the field name in quotes?
    const fieldFound = allSql.includes(`"${f.name}"`);
    if (!fieldFound) {
      missingItems.push({ type: 'COLUMN', model: mod.modelName, field: f.name, fieldType: f.type });
    }
  }
}

console.log('\n--- MISSING TABLES & COLUMNS ---');
missingItems.forEach(item => {
  if (item.type === 'TABLE') console.log(`TABLE MISSING: ${item.model}`);
  else console.log(`COLUMN MISSING: ${item.model}.${item.field} (${item.fieldType})`);
});
