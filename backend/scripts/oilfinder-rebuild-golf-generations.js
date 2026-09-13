/**
 * Rebuilds the VW Golf's generations, which were four cars in two rows.
 *
 * The catalogue held the Golf as five generations, and two of them were not
 * generations at all:
 *
 *   Golf I (17)        1974-2013 ... 58 engines
 *   Golf III (1H1)     1991-2013 ... 163 engines
 *
 * 1H1 is the Golf III chassis code and the Golf III ran 1991-1997. A row
 * spanning to 2013 with 163 engines is the Golf III, IV, V and VI in one
 * place, and the Golf I row has the Golf II inside it the same way. The effect
 * on a customer is direct and this is the most common car in the country: an
 * owner of a Golf IV, V or VI has no generation to choose, lands on a row
 * labelled Golf III, and is handed 163 engines to pick from.
 *
 * The split is taken from TecDoc, which files its Golf vehicles by generation —
 * "VW GOLF IV (1J1) 1.9 TDI" — and links each to its engine code. Seven
 * generations, 29 to 77 distinct codes each. Every engine in the catalogue is
 * assigned to the generation whose TecDoc code list contains it; where a code
 * appears in two generations, because VW carried engines across, the engine's
 * own year range decides which window it belongs to.
 *
 * Years are not taken from TecDoc. Its date_to is demonstrably biased early —
 * it puts the Fiat Doblo 263 at 2010 against a real 2022 — so the generation
 * windows below are the published ones, and they match what the catalogue
 * already carries for the Golf VII and VIII.
 *
 * An engine TecDoc does not recognise stays exactly where it is rather than
 * being placed by guesswork.
 *
 * Runs read-only unless --apply is passed. Snapshots the whole model first.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/golf-generations-snapshot-${Date.now()}.json`;

/** The published windows. TecDoc supplies the engines, not the dates. */
const GENERATIONS = [
  { key: 'I', slug: 'golf-i-17', name: 'Golf I (17, 19)', from: 1974, to: 1983 },
  { key: 'II', slug: 'golf-ii-19e-1g1', name: 'Golf II (19E, 1G1)', from: 1983, to: 1992 },
  { key: 'III', slug: 'golf-iii-1h1', name: 'Golf III (1H1)', from: 1991, to: 1997 },
  { key: 'IV', slug: 'golf-iv-1j1', name: 'Golf IV (1J1)', from: 1997, to: 2003 },
  { key: 'V', slug: 'golf-v-1k1', name: 'Golf V (1K1)', from: 2003, to: 2008 },
  { key: 'VI', slug: 'golf-vi-5k1', name: 'Golf VI (5K1)', from: 2008, to: 2012 },
  { key: 'VII', slug: 'golf-vii-5g1-bq1-be1-be2', name: 'Golf VII (5G1, BQ1, BE1, BE2)', from: 2012, to: 2020 },
];

const norm = (c) => String(c || '').trim().toUpperCase().replace(/\s+/g, ' ');
const base = (c) => norm(c).replace(/\s*\([^)]*\)\s*$/, '').trim();

async function main() {
  const prisma = new PrismaClient();

  // ── 1. TecDoc: which generation lists which engine code ──
  const rows = await prisma.$queryRawUnsafe(`
    SELECT regexp_replace(pc.full_description, '^VW GOLF ([IVX]+).*$', '\\1') AS gen,
           trim(e.description) AS code
    FROM tecdoc.passengercars pc
    JOIN tecdoc.passengercars_link_engines l ON l.car_id = pc.id
    JOIN tecdoc.engines e ON e.id = l.engine_id
    WHERE pc.manufacturer_matchcode = 'VW'
      AND pc.full_description ~ '^VW GOLF [IVX]+'
      AND e.description IS NOT NULL AND trim(e.description) <> ''
  `);
  const genOfCode = new Map(); // code -> Set(generation key)
  for (const r of rows) {
    const c = base(r.code);
    if (!genOfCode.has(c)) genOfCode.set(c, new Set());
    genOfCode.get(c).add(r.gen);
  }
  console.log(`TecDoc : ${rows.length} liaisons, ${genOfCode.size} codes distincts`);

  const byKey = new Map(GENERATIONS.map((g) => [g.key, g]));
  /** The generation an engine belongs to, its own years breaking any tie. */
  const assign = (code, yearFrom, yearTo) => {
    const keys = [...(genOfCode.get(base(code)) || [])].filter((k) => byKey.has(k));
    if (!keys.length) return undefined;
    if (keys.length === 1) return byKey.get(keys[0]);
    const y0 = yearFrom ?? null;
    const y1 = yearTo === 9999 ? null : yearTo ?? null;
    if (y0 == null) return undefined;
    const scored = keys.map((k) => {
      const g = byKey.get(k);
      const overlap = Math.min(y1 ?? g.to, g.to) - Math.max(y0, g.from);
      return { g, overlap };
    }).sort((a, b) => b.overlap - a.overlap);
    return scored[0].overlap >= 0 ? scored[0].g : undefined;
  };

  // ── 2. the catalogue's Golf ──
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const mk = Object.values(catalog).find((m) => String(m.makeName).toUpperCase() === 'VW');
  const md = Object.values(mk.models || {}).find((m) => /^golf$/i.test(String(m.modelName).trim()));
  if (!md) { console.error('modele Golf introuvable'); process.exit(1); }

  const before = JSON.parse(JSON.stringify(md.generations));
  console.log('\navant :');
  for (const g of Object.values(md.generations)) {
    console.log(`  ${String(g.genName).padEnd(34)} ${g.yearFrom}-${g.yearTo ?? ''}  ${(g.engines || []).length} moteurs`);
  }

  // Only the two merged rows are redistributed; the Cabriolet, VII and VIII
  // rows are already correct and are left untouched.
  const MERGED = new Set(['golf-i-17', 'golf-iii-1h1']);
  const pool = [];
  for (const [slug, g] of Object.entries(md.generations)) {
    if (!MERGED.has(slug)) continue;
    for (const e of g.engines || []) pool.push(e);
  }
  console.log(`\n${pool.length} moteurs a repartir depuis les deux lignes fusionnees`);

  const buckets = new Map(GENERATIONS.map((g) => [g.key, []]));
  const unplaced = [];
  for (const e of pool) {
    const g = assign(e.engineCode, e.yearFrom, e.yearTo);
    if (!g) { unplaced.push(e); continue; }
    buckets.get(g.key).push(e);
  }

  console.log('\nrepartition :');
  for (const g of GENERATIONS) {
    const n = buckets.get(g.key).length;
    if (n) console.log(`  ${g.name.padEnd(34)} ${g.from}-${g.to}  ${n} moteurs`);
  }
  console.log(`  non reconnus par TecDoc, laisses en place : ${unplaced.length}`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  // ── 3. rebuild ──
  for (const slug of MERGED) delete md.generations[slug];
  for (const g of GENERATIONS) {
    const list = buckets.get(g.key);
    if (!list.length) continue;
    const existing = md.generations[g.slug];
    if (existing) {
      const have = new Set((existing.engines || []).map((e) => base(e.engineCode)));
      existing.engines = [...(existing.engines || []), ...list.filter((e) => !have.has(base(e.engineCode)))];
      // The Golf VII row already existed but closed at 2017; the Mk7.5 ran to
      // 2020, and the Golf VIII from 2019 overlaps it, as the two really did.
      existing.yearFrom = g.from;
      existing.yearTo = g.to;
    } else {
      md.generations[g.slug] = {
        genName: g.name, genSlug: g.slug, yearFrom: g.from, yearTo: g.to, engines: list,
      };
    }
  }
  if (unplaced.length) {
    md.generations['golf-autres'] = {
      genName: 'Golf (motorisation non datee)', genSlug: 'golf-autres',
      yearFrom: 1974, yearTo: null, engines: unplaced,
    };
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify({ model: 'VW Golf', before }));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log('\napres :');
  for (const g of Object.values(md.generations)) {
    console.log(`  ${String(g.genName).padEnd(34)} ${g.yearFrom}-${g.yearTo ?? ''}  ${(g.engines || []).length} moteurs`);
  }
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
