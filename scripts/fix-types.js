const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/Asus/OneDrive/Bureau/achref/frontend/app');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match word?.data but avoid matching any?.data (which happens if already casted)
  const newContent = content.replace(/\b(?<!as )([a-zA-Z0-9_]+)\?\.data/g, '($1 as any)?.data');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    count++;
  }
});
console.log('Fixed types in ' + count + ' files');
