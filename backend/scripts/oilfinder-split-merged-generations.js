/**
 * Splits generation rows that hold two generations' engines under one label.
 *
 * The Sevel vans — Peugeot Boxer, Citroen Jumper — each carry a row starting in
 * 2002 that holds both the 244 generation's engines and the 250 generation's.
 * The tell is the engine list: the 244 ran on RFL, RHV, 4HY and the Sofim
 * 8140s, while AHM, AHN and AHP are the DW10 with a particulate filter, the
 * 4HG/4HH/4HJ/4HU/4HV are the DW12 of the 250, and the F1CE units are Iveco's
 * 3.0 litre. None of the second group existed in 2002.
 *
 * These rows do not give wrong oil — the customer picks an engine code and the
 * oil follows the engine — but they make the year range meaningless, and in
 * every model they sit alongside a correctly-dated sibling covering part of the
 * same span, so the selector offers two overlapping entries for the same years.
 *
 * Each merged row is partitioned by engine code and its halves are folded into
 * the rows that should have held them, creating the missing row where the model
 * has no home for one half. Nothing is invented: every engine keeps its own
 * spec, only its generation changes, and the year ranges afterwards describe
 * what the rows actually contain.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/merged-generations-snapshot-${Date.now()}.json`;

/** The 250-generation engines. Everything else in these rows is 244 or older. */
const LATE_250 = [
  'AHM', 'AHN', 'AHP', 'F1CE0481D', 'F1CE3481E', 'F1CE3481N',
  '4HG', '4HH', '4HJ', '4HU', '4HV',
];

const baseCode = (c) => String(c || '').trim().toUpperCase().replace(/\s*\([^)]*\)\s*$/, '').trim();
const isLate = (code) => LATE_250.includes(baseCode(code));

/**
 * model slug -> the merged generation slug, and where each half belongs.
 * A target that does not exist yet is created with the name and years given.
 */
const SPLITS = [
  // Peugeot Boxer
  { make: 'PEUGEOT', model: 'boxer', gen: 'boxer-box',
    early: { slug: 'boxer-box-244', name: 'Boxer Box (244)', yearFrom: 2002, yearTo: 2006 },
    late: { slug: 'boxer-box-250', name: 'Boxer Box (250)', yearFrom: 2006, yearTo: null } },
  { make: 'PEUGEOT', model: 'boxer-box', gen: 'boxer-box',
    early: { slug: 'boxer-box-244', name: 'Boxer Box (244)', yearFrom: 2002, yearTo: 2006 },
    late: { slug: 'boxer-box-250', name: 'Boxer Box (250)', yearFrom: 2006, yearTo: null } },
  { make: 'PEUGEOT', model: 'boxer-bus', gen: 'boxer-bus',
    early: { slug: 'boxer-bus-244-z', name: 'Boxer Bus (244, Z_)', yearFrom: 2002, yearTo: 2006 },
    late: { slug: 'boxer-bus-250', name: 'Boxer Bus (250)', yearFrom: 2006, yearTo: null } },
  { make: 'PEUGEOT', model: 'boxer-platform-chassis', gen: 'boxer-platform-chassis',
    early: { slug: 'boxer-platform-chassis-244', name: 'Boxer Platform/Chassis (244)', yearFrom: 2002, yearTo: 2006 },
    late: { slug: 'boxer-platform-chassis-250', name: 'Boxer Platform/Chassis (250)', yearFrom: 2006, yearTo: null } },

  // Citroen Jumper
  { make: 'CITROËN', model: 'jumper', gen: 'jumper-box',
    early: { slug: 'jumper-box-244', name: 'Jumper Box (244)', yearFrom: 2002, yearTo: 2006 },
    late: { slug: 'jumper-box-250', name: 'Jumper Box (250)', yearFrom: 2006, yearTo: null } },
  { make: 'CITROËN', model: 'jumper-box', gen: 'jumper-box',
    early: { slug: 'jumper-box-244', name: 'Jumper Box (244)', yearFrom: 2002, yearTo: 2006 },
    late: { slug: 'jumper-box-250', name: 'Jumper Box (250)', yearFrom: 2006, yearTo: null } },
  { make: 'CITROËN', model: 'jumper-bus', gen: 'jumper-bus',
    early: { slug: 'jumper-bus-244-z', name: 'Jumper Bus (244, Z_)', yearFrom: 2002, yearTo: 2006 },
    late: { slug: 'jumper-bus-250', name: 'Jumper Bus (250)', yearFrom: 2006, yearTo: null } },
];

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { splits: [] };
  let moved = 0; let created = 0; let removed = 0;

  for (const sp of SPLITS) {
    const mk = Object.values(catalog).find((m) => String(m.makeName).toUpperCase() === sp.make);
    if (!mk) { console.log(`  marque absente : ${sp.make}`); continue; }
    const md = mk.models?.[sp.model];
    if (!md) { console.log(`  modele absent : ${sp.make}/${sp.model}`); continue; }
    const gen = md.generations?.[sp.gen];
    if (!gen) { console.log(`  generation absente : ${sp.make}/${sp.model}/${sp.gen}`); continue; }

    const engines = gen.engines || [];
    const lateEngines = engines.filter((e) => isLate(e.engineCode));
    const earlyEngines = engines.filter((e) => !isLate(e.engineCode));
    if (!lateEngines.length || !earlyEngines.length) {
      console.log(`  ${sp.make}/${sp.model}/${sp.gen} : rien a separer (${earlyEngines.length} tot, ${lateEngines.length} tard)`);
      continue;
    }

    snapshot.splits.push({
      make: sp.make, model: sp.model, gen: sp.gen, was: JSON.parse(JSON.stringify(gen)),
    });

    console.log(`${sp.make} / ${md.modelName} / ${gen.genName}  (${engines.length} moteurs)`);
    console.log(`   -> ${sp.early.name}  ${sp.early.yearFrom}-${sp.early.yearTo}  : ${earlyEngines.length} moteurs`);
    console.log(`   -> ${sp.late.name}  ${sp.late.yearFrom}-present : ${lateEngines.length} moteurs`);

    for (const [half, list] of [[sp.early, earlyEngines], [sp.late, lateEngines]]) {
      const existing = md.generations[half.slug];
      if (existing) {
        const have = new Set((existing.engines || []).map((e) => baseCode(e.engineCode)));
        const add = list.filter((e) => !have.has(baseCode(e.engineCode)));
        moved += add.length;
        console.log(`        ${half.slug} existe (${(existing.engines || []).length} moteurs), ${add.length} ajoute(s)`);
        if (APPLY) existing.engines = [...(existing.engines || []), ...add];
      } else {
        created++;
        console.log(`        ${half.slug} cree avec ${list.length} moteurs`);
        if (APPLY) {
          md.generations[half.slug] = {
            genName: half.name, genSlug: half.slug,
            yearFrom: half.yearFrom, yearTo: half.yearTo,
            engines: list,
          };
        }
        moved += list.length;
      }
    }
    removed++;
    if (APPLY) delete md.generations[sp.gen];
  }

  console.log(`\n${removed} ligne(s) fusionnee(s) separee(s), ${created} ligne(s) creee(s), ${moved} moteur(s) replace(s)`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur : /app n est pas persistant)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
