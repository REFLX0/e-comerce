const fs = require('fs');
const path = require('path');
const { cleanDacia } = require('./apply-clean-dacia');

const filesToUpdate = [
  'backend/src/oil-finder/clean-catalog-hierarchy.json',
  'oil-finder-full-dataset/clean-catalog-hierarchy.json'
];

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Writing clean Dacia to ${filePath}...`);
    const catalog = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    catalog['dacia'] = cleanDacia;
    fs.writeFileSync(filePath, JSON.stringify(catalog, null, 2), 'utf8');
    console.log(`Successfully updated ${filePath}`);
  }
});
