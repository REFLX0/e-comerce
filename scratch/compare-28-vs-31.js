const fs = require('fs');
const { execSync } = require('child_process');

// 1. Get the catalog as it was in commit 788cd7db
const cat788 = JSON.parse(execSync('git show 788cd7db:backend/src/oil-finder/clean-catalog-hierarchy.json', { maxBuffer: 50 * 1024 * 1024 }));

const taggedIn788 = [];
for (const [mSlug, make] of Object.entries(cat788)) {
  for (const [modSlug, model] of Object.entries(make.models || {})) {
    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      for (const eng of (gen.engines || [])) {
        if (eng.isTemplatedSeed) {
          taggedIn788.push({ mSlug, modSlug, gSlug, eng: eng.engineCode, note: eng.verificationNote });
        }
      }
    }
  }
}

console.log('Total tagged phantoms in commit 788cd7db: ' + taggedIn788.length);

// 2. Load the 31 matches from measure-regex-blast-radius.js
const catRaw = JSON.parse(fs.readFileSync('backend/src/oil-finder/clean-catalog-hierarchy.json', 'utf8'));
const OLD_PATTERNS = [
  { make: 'volkswagen', model: 'golf', genPattern: /golf-vii|golf-viii/, engineCode: '1.9 TDI' },
  { make: 'volkswagen', model: 'golf', genPattern: /golf-viii/, engineCode: '1.6 TDI' },
  { make: 'volkswagen', model: 'golf', genPattern: /golf-iv|golf-v/, engineCode: '1.2 TSI' },
  { make: 'volkswagen', model: 'golf', genPattern: /golf-iv/, engineCode: '1.4 TSI' },
  { make: 'peugeot', model: '206', genPattern: /206\+/, engineCode: '2.0' },
  { make: 'peugeot', model: '206', genPattern: /206\+/, engineCode: '1.6 16V' },
  { make: 'renault', model: 'clio', genPattern: /clio-ii/, engineCode: '0.9 TCe' },
  { make: 'renault', model: 'clio', genPattern: /clio-iii/, engineCode: '0.9 TCe' },
  { make: 'renault', model: 'megane', genPattern: /megane-ii/, engineCode: '1.2 TCe' },
  { make: 'citroen', model: 'c3', genPattern: /c3-i/, engineCode: '1.2 PureTech' },
  { make: 'ford', model: 'focus', genPattern: /focus-i|focus-ii/, engineCode: '1.0 EcoBoost' },
  { make: 'ford', model: 'fiesta', genPattern: /fiesta-iv|fiesta-v/, engineCode: '1.0 EcoBoost' },
  { make: 'dacia', model: 'duster', genPattern: /duster-i/, engineCode: '1.3 TCe' },
  { make: 'dacia', model: 'duster', genPattern: /duster-i/, engineCode: '1.5 Blue dCi 115' },
  { make: 'dacia', model: 'sandero', genPattern: /sandero-i/, engineCode: '0.9 TCe' },
  { make: 'dacia', model: 'sandero', genPattern: /sandero-ii/, engineCode: '1.4 MPI' },
  { make: 'dacia', model: 'logan', genPattern: /logan-ii/, engineCode: '1.4 (LSA0, LSA5...)' },
  { make: 'dacia', model: 'logan', genPattern: /logan-ii/, engineCode: '1.6 MPI' },
  { make: 'dacia', model: 'logan', genPattern: /logan-ii/, engineCode: '1.5 dCi (LS0J, LS0Y)' }
];

const matches31 = [];
for (const [mSlug, make] of Object.entries(catRaw)) {
  for (const [modSlug, model] of Object.entries(make.models || {})) {
    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      for (const eng of (gen.engines || [])) {
        if (OLD_PATTERNS.some(p => p.make === mSlug && p.model === modSlug && p.genPattern.test(gSlug) && eng.engineCode && eng.engineCode.startsWith(p.engineCode))) {
          matches31.push({ mSlug, modSlug, gSlug, eng: eng.engineCode });
        }
      }
    }
  }
}

console.log('Total matches in unanchored 31 audit: ' + matches31.length);

console.log('\nTagged in 788cd7db (' + taggedIn788.length + '):');
taggedIn788.forEach((t, i) => console.log('  ' + (i+1) + '. [' + t.mSlug + '] ' + t.modSlug + ' -> ' + t.gSlug + ': ' + t.eng));

console.log('\nMatches in 31 audit (' + matches31.length + '):');
matches31.forEach((t, i) => console.log('  ' + (i+1) + '. [' + t.mSlug + '] ' + t.modSlug + ' -> ' + t.gSlug + ': ' + t.eng));

// Find difference: which ones are in 31 that were NOT in 788cd7db?
console.log('\n--- In 31 but NOT in 788cd7db ---');
matches31.forEach(m => {
  const found = taggedIn788.find(t => t.mSlug === m.mSlug && t.modSlug === m.modSlug && t.eng === m.eng);
  if (!found) {
    console.log('  + [' + m.mSlug + '] ' + m.modSlug + ' -> ' + m.gSlug + ': ' + m.eng);
  }
});

// Find difference: which ones are in 788cd7db that were NOT in 31?
console.log('\n--- In 788cd7db but NOT in 31 ---');
taggedIn788.forEach(t => {
  const found = matches31.find(m => m.mSlug === t.mSlug && m.modSlug === t.modSlug && m.eng === t.eng);
  if (!found) {
    console.log('  - [' + t.mSlug + '] ' + t.modSlug + ' -> ' + t.gSlug + ': ' + t.eng);
  }
});
