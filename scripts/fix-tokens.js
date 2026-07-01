const fs = require('fs');
const path = require('path');
const dir = 'd:/E-commerce/frontend/lib/api';

const files = [
  'wishlist.ts', 'tickets.ts', 'coupons.ts', 'client.ts', 'auth.ts', 'admin.ts', 'addresses.ts'
];

for (const f of files) {
  const fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf8');
  
  // Basic replacements that don't rely on regex capture groups
  content = content.split(", { headers: { Authorization: `Bearer ${token}` } }").join("");
  content = content.split(", { headers: { Authorization: `Bearer ${token}` }, params").join(", { params");
  content = content.split(", { status }, { headers: { Authorization: `Bearer ${token}` } }").join(", { status }");
  content = content.split(", data, { headers: { Authorization: `Bearer ${token}` } }").join(", data");
  content = content.split(", {}, { headers: { Authorization: `Bearer ${token}` } }").join(", {}");
  content = content.split(", { role }, { headers: { Authorization: `Bearer ${token}` } }").join(", { role }");
  content = content.split("{ headers: { Authorization: `Bearer ${token}` } }").join("undefined");
  
  // For client.ts
  content = content.split("...(token ? { Authorization: `Bearer ${token}` } : {}),").join("");

  fs.writeFileSync(fp, content);
}
console.log("Fixed via JS");
