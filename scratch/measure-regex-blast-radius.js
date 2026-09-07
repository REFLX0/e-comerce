const fs = require('fs');

const cat = JSON.parse(fs.readFileSync('backend/src/oil-finder/clean-catalog-hierarchy.json', 'utf8'));

// 1. OLD Unanchored Regexes
const OLD_PATTERNS = [
  { make: 'volkswagen', model: 'golf', genPattern: /golf-vii|golf-viii/, engineCode: '1.9 TDI', reason: '1.9 TDI discontinued with Golf V' },
  { make: 'volkswagen', model: 'golf', genPattern: /golf-viii/, engineCode: '1.6 TDI', reason: '1.6 TDI discontinued on Golf VIII' },
  { make: 'volkswagen', model: 'golf', genPattern: /golf-iv|golf-v/, engineCode: '1.2 TSI', reason: '1.2 TSI launched on Golf VI' },
  { make: 'volkswagen', model: 'golf', genPattern: /golf-iv/, engineCode: '1.4 TSI', reason: '1.4 TSI launched on Golf V' },
  { make: 'peugeot', model: '206', genPattern: /206\+/, engineCode: '2.0', reason: '2.0 S16/RC never on 206+' },
  { make: 'peugeot', model: '206', genPattern: /206\+/, engineCode: '1.6 16V', reason: '1.6 16V not on 206+' },
  { make: 'renault', model: 'clio', genPattern: /clio-ii/, engineCode: '0.9 TCe', reason: '0.9 TCe launched on Clio IV' },
  { make: 'renault', model: 'clio', genPattern: /clio-iii/, engineCode: '0.9 TCe', reason: '0.9 TCe launched on Clio IV' },
  { make: 'renault', model: 'megane', genPattern: /megane-ii/, engineCode: '1.2 TCe', reason: '1.2 TCe launched on Megane III' },
  { make: 'citroen', model: 'c3', genPattern: /c3-i/, engineCode: '1.2 PureTech', reason: 'PureTech launched on C3 II' },
  { make: 'ford', model: 'focus', genPattern: /focus-i|focus-ii/, engineCode: '1.0 EcoBoost', reason: '1.0 EcoBoost launched on Focus III' },
  { make: 'ford', model: 'fiesta', genPattern: /fiesta-iv|fiesta-v/, engineCode: '1.0 EcoBoost', reason: '1.0 EcoBoost launched on Fiesta VI facelift' },
  { make: 'dacia', model: 'duster', genPattern: /duster-i/, engineCode: '1.3 TCe', reason: '1.3 TCe launched on Duster II' },
  { make: 'dacia', model: 'duster', genPattern: /duster-i/, engineCode: '1.5 Blue dCi 115', reason: 'Blue dCi on Duster II' },
  { make: 'dacia', model: 'sandero', genPattern: /sandero-i/, engineCode: '0.9 TCe', reason: '0.9 TCe on Sandero II' },
  { make: 'dacia', model: 'sandero', genPattern: /sandero-ii/, engineCode: '1.4 MPI', reason: '1.4 MPI discontinued' },
  { make: 'dacia', model: 'logan', genPattern: /logan-ii/, engineCode: '1.4 (LSA0, LSA5...)', reason: '1.4 MPI discontinued' },
  { make: 'dacia', model: 'logan', genPattern: /logan-ii/, engineCode: '1.6 MPI', reason: '1.6 MPI discontinued' },
  { make: 'dacia', model: 'logan', genPattern: /logan-ii/, engineCode: '1.5 dCi (LS0J, LS0Y)', reason: '68hp dCi discontinued' }
];

// 2. NEW Anchored Regexes
// Note: genSlug can be canonical (e.g. 'golf-vii') or raw pre-norm (e.g. 'golf-vii-5g1-2012-2020')
// We use regexes that strictly target generation tokens:
const NEW_PATTERNS = [
  { make: 'volkswagen', model: 'golf', genPattern: /^golf-(?:vii|viii)(?:-|$)/, engineCode: '1.9 TDI', reason: '1.9 TDI discontinued with Golf V' },
  { make: 'volkswagen', model: 'golf', genPattern: /^golf-viii(?:-|$)/, engineCode: '1.6 TDI', reason: '1.6 TDI discontinued on Golf VIII' },
  { make: 'volkswagen', model: 'golf', genPattern: /^golf-viii(?:-|$)/, engineCode: '1.2 TSI', reason: '1.2 TSI discontinued with Golf VII, replaced by 1.0 TSI / 1.5 TSI on Golf VIII' },
  { make: 'volkswagen', model: 'golf', genPattern: /^golf-(?:iv|v)(?:-|$)/, engineCode: '1.2 TSI', reason: '1.2 TSI launched on Golf VI (EA111), never on Golf IV or V' },
  { make: 'volkswagen', model: 'golf', genPattern: /^golf-iv(?:-|$)/, engineCode: '1.4 TSI', reason: '1.4 TSI launched on Golf V, never on Golf IV' },
  { make: 'peugeot', model: '206', genPattern: /^206-plus(?:-|$)/, engineCode: '2.0', reason: '2.0 S16/RC never on 206+' },
  { make: 'peugeot', model: '206', genPattern: /^206-plus(?:-|$)/, engineCode: '1.6 16V', reason: '1.6 16V not on 206+' },
  { make: 'renault', model: 'clio', genPattern: /^clio-ii(?:-|$)/, engineCode: '0.9 TCe', reason: '0.9 TCe launched on Clio IV' },
  { make: 'renault', model: 'clio', genPattern: /^clio-iii(?:-|$)/, engineCode: '0.9 TCe', reason: '0.9 TCe launched on Clio IV' },
  { make: 'renault', model: 'megane', genPattern: /^megane-ii(?:-|$)/, engineCode: '1.2 TCe', reason: '1.2 TCe launched on Megane III' },
  { make: 'citroen', model: 'c3', genPattern: /^c3-i(?:-|$)/, engineCode: '1.2 PureTech', reason: 'PureTech launched on C3 II' },
  { make: 'ford', model: 'focus', genPattern: /^focus-(?:i|ii)(?:-|$)/, engineCode: '1.0 EcoBoost', reason: '1.0 EcoBoost launched on Focus III' },
  { make: 'ford', model: 'fiesta', genPattern: /^fiesta-(?:iv|v)(?:-|$)/, engineCode: '1.0 EcoBoost', reason: '1.0 EcoBoost launched on Fiesta VI facelift' },
  { make: 'dacia', model: 'duster', genPattern: /^duster-i(?:-|$)/, engineCode: '1.3 TCe', reason: '1.3 TCe launched on Duster II' },
  { make: 'dacia', model: 'duster', genPattern: /^duster-i(?:-|$)/, engineCode: '1.5 Blue dCi 115', reason: 'Blue dCi on Duster II' },
  { make: 'dacia', model: 'sandero', genPattern: /^sandero-i(?:-|$)/, engineCode: '0.9 TCe', reason: '0.9 TCe on Sandero II' },
  { make: 'dacia', model: 'sandero', genPattern: /^sandero-ii(?:-|$)/, engineCode: '1.4 MPI', reason: '1.4 MPI discontinued' },
  { make: 'dacia', model: 'logan', genPattern: /^logan-ii(?:-|$)/, engineCode: '1.4 (LSA0, LSA5...)', reason: '1.4 MPI discontinued' },
  { make: 'dacia', model: 'logan', genPattern: /^logan-ii(?:-|$)/, engineCode: '1.6 MPI', reason: '1.6 MPI discontinued' },
  { make: 'dacia', model: 'logan', genPattern: /^logan-ii(?:-|$)/, engineCode: '1.5 dCi (LS0J, LS0Y)', reason: '68hp dCi discontinued' }
];

function isPhantom(patterns, makeSlug, modelSlug, genSlug, engineCode) {
  if (!engineCode || engineCode.trim() === '') return { match: true, reason: 'Empty code' };
  const p = patterns.find(pat => pat.make === makeSlug && pat.model === modelSlug && pat.genPattern.test(genSlug) && engineCode.startsWith(pat.engineCode));
  return p ? { match: true, reason: p.reason } : { match: false };
}

const falselyQuarantined = [];
const correctlyQuarantined = [];

for (const [mSlug, make] of Object.entries(cat)) {
  for (const [modSlug, model] of Object.entries(make.models || {})) {
    for (const [gSlug, gen] of Object.entries(model.generations || {})) {
      for (const eng of (gen.engines || [])) {
        const oldCheck = isPhantom(OLD_PATTERNS, mSlug, modSlug, gSlug, eng.engineCode);
        const newCheck = isPhantom(NEW_PATTERNS, mSlug, modSlug, gSlug, eng.engineCode);

        if (oldCheck.match && !newCheck.match) {
          falselyQuarantined.push({
            make: mSlug,
            model: modSlug,
            generation: gen.genName || gSlug,
            genSlug: gSlug,
            engineCode: eng.engineCode,
            fuel: eng.fuelType,
            hp: eng.powerHp,
            cc: eng.displacementCc,
            leakReason: oldCheck.reason
          });
        } else if (newCheck.match) {
          correctlyQuarantined.push({
            make: mSlug,
            model: modSlug,
            generation: gen.genName || gSlug,
            engineCode: eng.engineCode,
            reason: newCheck.reason
          });
        }
      }
    }
  }
}

console.log('================================================================');
console.log('BLAST RADIUS AUDIT: ENGINES WHOSE QUARANTINE STATUS CHANGES');
console.log('================================================================');
console.log(`Total engines falsely quarantined by old unanchored regex: ${falselyQuarantined.length}`);
console.log(`Total genuine phantoms preserved by new anchored regex   : ${correctlyQuarantined.length}`);

console.log('\nFULL LIST OF FALSELY QUARANTINED ENGINES (REHABILITATED):');
falselyQuarantined.forEach((e, idx) => {
  console.log(`  [${idx+1}] ${e.make.toUpperCase()} ${e.model} -> Generation: "${e.generation}" (${e.genSlug})`);
  console.log(`      Engine: "${e.engineCode}" (${e.fuel}, ${e.cc}cc, ${e.hp}hp)`);
  console.log(`      Cause of false quarantine: Regex matched "${e.genSlug}" via rule "${e.leakReason}"\n`);
});
