/**
 * Closes the generations whose end year has been researched and sourced.
 *
 * 1 127 generations read "Présent" because they carry no end year, and many of
 * them finished years ago — a Kia Sportage SL shows as current when the QL
 * replaced it in 2015. TecDoc cannot settle this: it holds a date_to for every
 * vehicle, but matching generations to it by chassis code closes only 30 of the
 * 1 127 and biases early, putting the Fiat Doblo 263 at 2010 against a real run
 * to 2022. So the years below are researched per generation, each with its
 * source, and only the ones confirmed to a published date are here.
 *
 * The rule that governs what gets in: an end year that is too early is worse
 * than no end year. "Présent" on a generation that finished in 2016 is untidy;
 * 2012 on a generation that ran to 2016 tells a 2014 owner their car is not
 * covered. So a year is written only where a source names it, and a generation
 * researched and found still in production is recorded as such rather than
 * being left an open question — the Peugeot 301 is deliberately untouched,
 * because it really is still made.
 *
 * A warning for anyone tempted to automate this from the data instead. The
 * catalogue files body styles as separate model rows, so the next row that
 * starts after a generation is often not its successor: "Fiesta VI Van" begins
 * in 2009 and looks like the end of "Fiesta VI (CB1, CCN)", but it is the same
 * generation in a van body, and the hatchback ran to 2017. A rule that closed
 * each generation at the next one's start would have cut that range from nine
 * years to one, and done the same across the file.
 *
 * Two of these are not "replaced by the next generation" but "discontinued":
 * Ford stopped building the Fiesta entirely in July 2023 and the Focus in
 * November 2025, with no successor to either.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/generation-years-snapshot-${Date.now()}.json`;

/** make | model | generation (as the catalogue spells it) | end year | source */
const RESEARCHED = [
  ['DACIA', 'Duster', 'Duster', 2017, 'Dacia Duster HS 2010-2017, replaced by the second generation'],
  ['DACIA', 'Logan', 'Logan (LS_)', 2012, 'Logan I 2004-2012 in Europe; licensed production elsewhere ran longer'],
  ['DACIA', 'Logan Mcv', 'Logan Mcv (KS_)', 2013, 'MCV I launched Paris 2006, replaced by MCV II at Geneva 2013'],
  ['DACIA', 'Logan Pickup', 'Logan Pickup (US_)', 2012, 'Dacia discontinued the Logan Pick-Up July 2012; the Nissan NP200 is a different nameplate'],

  ['RENAULT', 'Clio', 'Clio III (BR0/1, CR0/1)', 2012, 'Clio III 2005-2012, replaced by Clio IV'],
  ['RENAULT', 'Clio', 'Clio IV (BH_)', 2019, 'Clio IV 2012-2019, Clio V unveiled Geneva 2019'],
  ['RENAULT', 'Megane', 'Megane III Coupe (DZ0/1_)', 2016, 'Megane III 2008-2016 including the 2012 facelift'],
  ['RENAULT', 'Megane', 'Megane III Hatchback (BZ0/1_)', 2016, 'Megane III 2008-2016 including the 2012 facelift'],
  ['RENAULT', 'Megane Iii Coupe', 'Megane Iii Coupe (DZ0/1_)', 2016, 'Megane III 2008-2016'],
  ['RENAULT', 'Megane Iii Hatchback', 'Megane Iii Hatchback (BZ0/1_)', 2016, 'Megane III 2008-2016'],

  ['PEUGEOT', '208', '208 (CA_, CC_)', 2019, '208 I 2012-2019'],
  ['PEUGEOT', '308', '308 (4A_, 4C_)', 2013, '308 I 2007-2013'],
  ['PEUGEOT', '308', '308 II', 2021, '308 II 2013-2021'],
  ['PEUGEOT', '308 Cc', '308 Cc (4B_)', 2015, '308 CC discontinued 2015 with the folding-hardtop segment, no successor'],
  ['PEUGEOT', 'Partner', 'Partner Tepee', 2018, 'replaced by the Peugeot Rifter in 2018'],
  ['PEUGEOT', 'Partner Tepee', 'Partner Tepee', 2018, 'replaced by the Peugeot Rifter in 2018'],

  ['CITROËN', 'C3', 'C3 I (FC_, FN_)', 2009, 'C3 I 2002-2009'],
  ['CITROËN', 'C3', 'C3 II (SC_)', 2016, 'C3 II 2009-2016'],
  ['CITROËN', 'Berlingo Box', 'Berlingo Box (B9)', 2018, 'Berlingo II (B9) 2008-2018, replaced by Berlingo III March 2018'],
  ['CITROËN', 'Berlingo Platform/Chassis', 'Berlingo Platform/Chassis (B9)', 2018, 'Berlingo II (B9) 2008-2018'],

  ['FORD', 'Fiesta', 'Fiesta VI (CB1, CCN)', 2017, 'Fiesta VI 2008-2017; the 2009 "Fiesta VI Van" is the same generation, not its successor'],
  ['FORD', 'Fiesta', 'Fiesta VI Van', 2017, 'same Fiesta VI generation in van body'],
  ['FORD', 'Fiesta Vi Van', 'Fiesta Vi Van', 2017, 'same Fiesta VI generation in van body'],
  ['FORD', 'Fiesta', 'Fiesta VII', 2023, 'Ford ended Fiesta production entirely 7 July 2023 at Cologne; no successor'],
  ['FORD', 'Focus', 'Focus III', 2018, 'Focus III 2010-2018 in Europe'],
  ['FORD', 'Focus', 'Focus III Saloon', 2018, 'Focus III 2010-2018 in Europe'],
  ['FORD', 'Focus Iii Saloon', 'Focus Iii Saloon', 2018, 'Focus III 2010-2018 in Europe'],
  ['FORD', 'Focus Iii Turnier', 'Focus Iii Turnier', 2018, 'Focus III 2010-2018 in Europe'],
  ['FORD', 'Focus', 'Focus IV', 2025, 'last Focus built at Saarlouis 14 November 2025; no successor assigned'],
  ['FORD', 'Focus Iv Turnier', 'Focus Iv Turnier', 2025, 'last Focus built at Saarlouis 14 November 2025; no successor assigned'],
  ['FORD', 'Ranger', 'Ranger (TKE)', 2022, 'Ranger T6 2011-2022, T6.2 revealed late 2021 for 2022'],
];

const key = (s) => String(s || '').toUpperCase().replace(/\s+/g, ' ').trim();
const wanted = new Map(RESEARCHED.map(([mk, md, gen, to, src]) => [
  [key(mk), key(md), key(gen)].join('|'), { to, src },
]));

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { catalog: [], vehicleGenerations: [] };
  const seen = new Set();
  let written = 0; let alreadyClosed = 0;

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        const k = [key(mk.makeName), key(md.modelName), key(gen.genName)].join('|');
        const hit = wanted.get(k);
        if (!hit) continue;
        seen.add(k);
        if (gen.yearTo != null && gen.yearTo !== 9999) {
          alreadyClosed++;
          console.log(`  deja ferme : ${mk.makeName} / ${md.modelName} / ${gen.genName} = ${gen.yearTo}`);
          continue;
        }
        written++;
        console.log(`  ${mk.makeName} / ${md.modelName} / ${gen.genName} : ${gen.yearFrom} - ${hit.to}   (${hit.src})`);
        snapshot.catalog.push({
          make: mk.makeName, model: md.modelName, generation: gen.genName, was: gen.yearTo ?? null,
        });
        if (APPLY) gen.yearTo = hit.to;
      }
    }
  }

  const missing = [...wanted.keys()].filter((k) => !seen.has(k));
  if (missing.length) {
    console.log(`\n${missing.length} entree(s) sans correspondance dans le catalogue :`);
    missing.forEach((m) => console.log('  ' + m.split('|').join(' / ')));
  }

  // the database copy of the same generations
  const dbGens = await prisma.vehicleGeneration.findMany({
    include: { model: { include: { make: true } } },
  });
  const dbRows = dbGens
    .map((g) => ({
      g,
      hit: wanted.get([key(g.model?.make?.name), key(g.model?.name), key(g.name)].join('|')),
    }))
    .filter(({ g, hit }) => hit && (g.yearTo == null || g.yearTo === 9999));

  console.log(`\ncatalogue : ${written} generation(s) fermee(s), ${alreadyClosed} deja fermee(s)`);
  console.log(`base      : ${dbRows.length} VehicleGeneration`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  for (const { g, hit } of dbRows) {
    snapshot.vehicleGenerations.push({ id: g.id, name: g.name, was: g.yearTo ?? null });
    await prisma.vehicleGeneration.update({ where: { id: g.id }, data: { yearTo: hit.to } });
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur : /app n est pas persistant)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
