const fs = require('fs');

let code = fs.readFileSync('scratch/canonical-schemas.js', 'utf8');
code = code.replace(/genName:\s*'([^']+?)\s*\(\d{4}\s*-\s*[^)]+\)'/g, (match, p1) => `genName: '${p1}'`);
fs.writeFileSync('scratch/canonical-schemas.js', code, 'utf8');

console.log('Sample replacement check:');
const start = code.indexOf('golf-iv');
console.log(code.slice(start, start + 120));
