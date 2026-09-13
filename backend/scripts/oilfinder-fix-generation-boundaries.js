/**
 * Puts two generation boundaries back where they belong.
 *
 * MERCEDES E-CLASS. The catalogue dates the W212 2009-2011 and the W213 from
 * 2011. The W212 ran to 2016 and the W213 did not exist before 2016, so the
 * boundary sits five years early and every car built 2011-2016 — real W212s —
 * falls under the W213 label when a customer picks by year.
 *
 * Only the years are corrected. The engine lists genuinely overlap here, unlike
 * the Sevel vans: M 276.820, M 276.850, M 278.922, M 274.920 and OM 651.911 all
 * appear in both rows, because the W212 facelift and the early W213 really did
 * share them. Which of the remaining W213-row engines belongs to which
 * generation is not something the data says, so the allocation is left alone.
 * The result is exact on the years and imprecise on a few engine options, which
 * is the right way round: the customer picks an engine code and the oil follows
 * the code, so an extra option costs nothing while a wrong year sends them to
 * the wrong generation entirely.
 *
 * DACIA LOGAN II. Dated from 2009, which is neither generation's start, and
 * holding D4F 732, D4F 734, K7J 710 and K7M 800 — four engines that are also in
 * the Logan (LS_) row above it and belong to the first generation's launch
 * lineup. Those four are dropped here, since the row above already carries them
 * for the years they were sold, and the generation is dated 2012-2020 between
 * the Logan I ending in 2012 and the Logan III starting in 2020.
 *
 * K9K 892 stays in both rows deliberately: the 1.5 dCi really did carry across
 * the generations, and the row above covers it only to 2012.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/generation-boundaries-snapshot-${Date.now()}.json`;

/** make, model slug, generation slug, the years it should carry. */
const REDATE = [
  { make: 'MERCEDES-BENZ', model: 'classe-e', gen: 'e-class-w212', yearFrom: 2009, yearTo: 2016,
    why: 'W212 2009-2016' },
  { make: 'MERCEDES-BENZ', model: 'classe-e', gen: 'e-class-w213', yearFrom: 2016, yearTo: 2023,
    why: 'W213 2016-2023, replaced by the W214' },
  { make: 'DACIA', model: 'logan', gen: 'logan-ii', yearFrom: 2012, yearTo: 2020,
    why: 'Logan II 2012-2020, between the Logan I and the Logan III the catalogue already holds',
    dropEngines: ['D4F 732', 'D4F 734', 'K7J 710', 'K7M 800'] },
];

const norm = (c) => String(c || '').toUpperCase().replace(/\s+/g, ' ').trim();

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { catalog: [], vehicleGenerations: [] };

  for (const r of REDATE) {
    const mk = Object.values(catalog).find((m) => String(m.makeName).toUpperCase() === r.make);
    const gen = mk?.models?.[r.model]?.generations?.[r.gen];
    if (!gen) { console.log(`  absent : ${r.make}/${r.model}/${r.gen}`); continue; }

    const drop = new Set((r.dropEngines || []).map(norm));
    const kept = (gen.engines || []).filter((e) => !drop.has(norm(e.engineCode)));
    const dropped = (gen.engines || []).length - kept.length;

    console.log(`${r.make} / ${mk.models[r.model].modelName} / ${gen.genName}`);
    console.log(`   ${gen.yearFrom}-${gen.yearTo ?? 'vide'}  ->  ${r.yearFrom}-${r.yearTo}   (${r.why})`);
    if (r.dropEngines) console.log(`   ${dropped} moteur(s) retire(s), deja portes par la generation precedente : ${r.dropEngines.join(', ')}`);

    snapshot.catalog.push({
      make: r.make, model: r.model, gen: r.gen,
      was: { yearFrom: gen.yearFrom, yearTo: gen.yearTo ?? null, engines: gen.engines },
    });
    if (APPLY) {
      gen.yearFrom = r.yearFrom;
      gen.yearTo = r.yearTo;
      if (r.dropEngines) gen.engines = kept;
    }
  }

  // the database copies of the same generations
  const dbGens = await prisma.vehicleGeneration.findMany({
    include: { model: { include: { make: true } } },
  });
  const dbTargets = [];
  for (const r of REDATE) {
    const mk = Object.values(catalog).find((m) => String(m.makeName).toUpperCase() === r.make);
    const genName = mk?.models?.[r.model]?.generations?.[r.gen]?.genName;
    if (!genName) continue;
    for (const g of dbGens) {
      if (String(g.model?.make?.name || '').toUpperCase() !== r.make) continue;
      if (norm(g.name) !== norm(genName)) continue;
      if (g.yearFrom === r.yearFrom && g.yearTo === r.yearTo) continue;
      dbTargets.push({ g, r });
    }
  }
  console.log(`\nbase : ${dbTargets.length} VehicleGeneration a redater`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  for (const { g, r } of dbTargets) {
    snapshot.vehicleGenerations.push({ id: g.id, name: g.name, was: { yearFrom: g.yearFrom, yearTo: g.yearTo } });
    await prisma.vehicleGeneration.update({
      where: { id: g.id }, data: { yearFrom: r.yearFrom, yearTo: r.yearTo },
    });
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur : /app n est pas persistant)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
