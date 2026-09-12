/**
 * Folds a body-style variant's generations into the model customers actually
 * search for.
 *
 * The TecDoc import split some cars across several "models" by body style, and
 * the newest generation often landed on the variant rather than the plain name.
 * Peugeot's "3008" holds only the 2009-2016 MPV while "3008 Suv" holds the
 * 2016-onward car, so an owner who picks 3008 sees a range ending in 2016 and
 * concludes their car is missing.
 *
 * The generations are copied into the canonical model, not moved: the variant
 * stays listed, so anyone who searches by that name still finds it. A
 * generation already present under the target — matched on slug — is left
 * alone, so this is safe to run twice.
 *
 * Runs read-only unless --apply is passed.
 */
const fs = require('fs');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/merge-split-models-snapshot-${Date.now()}.json`;

/** make -> [{ into: canonical model, from: [variant models] }] */
const MERGES = {
  PEUGEOT: [
    { into: '3008', from: ['3008 Suv'] },
    { into: 'Partner', from: ['Partner Tepee'] },
  ],
  RENAULT: [
    { into: 'Kangoo', from: ['Kangoo / Grand Kangoo'] },
  ],
};

const slug = (t) => String(t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const done = [];

  for (const [makeName, merges] of Object.entries(MERGES)) {
    const mk = Object.values(catalog).find(
      (m) => String(m.makeName || '').toUpperCase() === makeName.toUpperCase(),
    );
    if (!mk) { console.log(`  ! ${makeName} not in catalogue`); continue; }

    for (const { into, from } of merges) {
      const target = Object.values(mk.models || {}).find((m) => slug(m.modelName) === slug(into));
      if (!target) { console.log(`  ! ${makeName} ${into} not found`); continue; }
      target.generations = target.generations || {};

      for (const sourceName of from) {
        const source = Object.values(mk.models || {}).find((m) => slug(m.modelName) === slug(sourceName));
        if (!source) { console.log(`  ! ${makeName} ${sourceName} not found`); continue; }

        for (const [genSlug, gen] of Object.entries(source.generations || {})) {
          if (target.generations[genSlug]) continue;
          const engines = (gen.engines || []).length;
          done.push({ make: makeName, into, from: sourceName, generation: gen.genName, engines });
          console.log(`  ${makeName} ${into} <- ${sourceName}: ${gen.genName} (${engines} engine(s))`);
          if (APPLY) {
            target.generations[genSlug] = JSON.parse(JSON.stringify(gen));
          }
        }
      }
    }
  }

  console.log(`\n${APPLY ? 'merged' : 'would merge'} ${done.length} generation(s)`);
  if (!APPLY) { console.log('Nothing written. Re-run with --apply.'); return; }
  fs.writeFileSync(SNAPSHOT, JSON.stringify(done, null, 2));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`Snapshot -> ${SNAPSHOT}`);
  console.log(`Catalogue file rewritten: ${CATALOG}`);
}

main();
