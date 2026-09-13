/**
 * Splits merged generation rows using TecDoc's own generation filing.
 *
 * Generalised from the VW Golf rebuild, which turned one row labelled "Golf III
 * (1H1) 1991-2013" carrying 163 engines back into the six generations it was.
 * The same shape is on several other high-volume models, and TecDoc files its
 * vehicles by generation — "FORD FIESTA IV ...", "AUDI A4 (8E2, B6) ..." — and
 * links each to an engine code, so it can say which generation an engine
 * belongs to without anyone guessing.
 *
 * Four models here, each confirmed by reading its engine list first rather than
 * by trusting the span:
 *
 *   Ford Fiesta Box (FVD)  1976-2010, 89 engines — six generations in one row
 *   Audi A4 (8D2, B5)      1994-2009, 73 engines — B5 with a block of B7-era
 *                          engines filed behind it
 *   Skoda Octavia I (1U2)  1996-2013, 70 engines — Octavia I and II, with some
 *                          Octavia III engines bleeding into the tail
 *   Seat Toledo I (1L)     1991-2009, 64 engines — the Mk1 ran to 1999
 *
 * Years are never taken from TecDoc: its date_to is biased early, putting the
 * Fiat Doblo 263 at 2010 against a real 2022. The windows below are the
 * published ones, and they are only written on rows this script creates —
 * a generation row that already exists keeps the dates it has, so nothing
 * already correct is overwritten on the strength of a table in a script.
 *
 * An engine TecDoc does not recognise stays in the original row, which is kept
 * for exactly that purpose rather than deleted.
 *
 * Runs read-only unless --apply is passed. Snapshots each model before touching it.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/split-generations-snapshot-${Date.now()}.json`;

const TARGETS = [
  {
    id: 'fiesta',
    make: 'FORD',
    model: /^fiesta$/i,
    merged: ['fiesta-box-fvd'],
    sql: `^FORD FIESTA [IVX]+`,
    key: `regexp_replace(pc.full_description, '^FORD FIESTA ([IVX]+).*$', '\\1')`,
    generations: [
      { key: 'I', slug: 'fiesta-i-gfbt', name: 'Fiesta I (GFBT)', from: 1976, to: 1983 },
      { key: 'II', slug: 'fiesta-ii-fbd', name: 'Fiesta II (FBD)', from: 1983, to: 1989 },
      { key: 'III', slug: 'fiesta-iii-gfj', name: 'Fiesta III (GFJ)', from: 1989, to: 1995 },
      { key: 'IV', slug: 'fiesta-iv-jas-jbs', name: 'Fiesta IV (JAS, JBS)', from: 1995, to: 2002 },
      { key: 'V', slug: 'fiesta-v-jh-jd', name: 'Fiesta V (JH_, JD_)', from: 2002, to: 2008 },
      { key: 'VI', slug: 'fiesta-vi-cb1-ccn', name: 'Fiesta VI (CB1, CCN)', from: 2008, to: 2017 },
      { key: 'VII', slug: 'fiesta-vii', name: 'Fiesta VII', from: 2017, to: 2023 },
    ],
  },
  {
    id: 'a4',
    make: 'AUDI',
    model: /^a4$/i,
    merged: ['a4-8d2-b5'],
    sql: `^AUDI A4 \\([^)]*B[0-9]`,
    key: `regexp_replace(pc.full_description, '^AUDI A4 \\([^)]*(B[0-9])\\).*$', '\\1')`,
    generations: [
      { key: 'B5', slug: 'a4-8d2-b5', name: 'A4 (8D2, B5)', from: 1994, to: 2001 },
      { key: 'B6', slug: 'a4-8e2-b6', name: 'A4 (8E2, B6)', from: 2000, to: 2004 },
      { key: 'B7', slug: 'a4-8ec-b7', name: 'A4 (8EC, B7)', from: 2004, to: 2008 },
      { key: 'B8', slug: 'a4-8k2-b8', name: 'A4 (8K2, B8)', from: 2007, to: 2015 },
      { key: 'B9', slug: 'a4-8w2-b9', name: 'A4 (8W2, B9)', from: 2015, to: null },
    ],
  },
  {
    id: 'octavia',
    make: 'SKODA',
    model: /^octavia$/i,
    merged: ['octavia-i-1u2'],
    sql: `^SKODA OCTAVIA [IVX]+`,
    key: `regexp_replace(pc.full_description, '^SKODA OCTAVIA ([IVX]+).*$', '\\1')`,
    generations: [
      { key: 'I', slug: 'octavia-i-1u2', name: 'Octavia I (1U2)', from: 1996, to: 2010 },
      { key: 'II', slug: 'octavia-ii-1z3', name: 'Octavia II (1Z3)', from: 2004, to: 2013 },
      { key: 'III', slug: 'octavia-iii-5e3-nl3-nr3', name: 'Octavia III (5E3, NL3, NR3)', from: 2012, to: 2020 },
    ],
  },
  {
    id: 'toledo',
    make: 'SEAT',
    model: /^toledo$/i,
    merged: ['toledo-i-1l'],
    sql: `^SEAT TOLEDO [IVX]+`,
    key: `regexp_replace(pc.full_description, '^SEAT TOLEDO ([IVX]+).*$', '\\1')`,
    generations: [
      { key: 'I', slug: 'toledo-i-1l', name: 'Toledo I (1L)', from: 1991, to: 1999 },
      { key: 'II', slug: 'toledo-ii-1m2', name: 'Toledo II (1M2)', from: 1998, to: 2004 },
      { key: 'III', slug: 'toledo-iii-5p2', name: 'Toledo III (5P2)', from: 2004, to: 2009 },
      { key: 'IV', slug: 'toledo-iv-kg3', name: 'Toledo IV (KG3)', from: 2012, to: 2019 },
    ],
  },
];

const norm = (c) => String(c || '').trim().toUpperCase().replace(/\s+/g, ' ');
const base = (c) => norm(c).replace(/\s*\([^)]*\)\s*$/, '').trim();

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = {};

  for (const t of TARGETS) {
    if (ONLY && ONLY !== t.id) continue;
    const mk = Object.values(catalog).find((m) => String(m.makeName).toUpperCase() === t.make);
    const md = mk && Object.values(mk.models || {}).find((m) => t.model.test(String(m.modelName).trim()));
    if (!md) { console.log(`\n${t.make} : modele introuvable`); continue; }

    console.log(`\n======== ${t.make} / ${md.modelName} ========`);
    for (const g of Object.values(md.generations)) {
      console.log(`  avant : ${String(g.genName).padEnd(32)} ${g.yearFrom}-${g.yearTo ?? ''}  ${(g.engines || []).length}`);
    }

    const rows = await prisma.$queryRawUnsafe(`
      SELECT ${t.key} AS gen, trim(e.description) AS code
      FROM tecdoc.passengercars pc
      JOIN tecdoc.passengercars_link_engines l ON l.car_id = pc.id
      JOIN tecdoc.engines e ON e.id = l.engine_id
      WHERE pc.full_description ~ '${t.sql}'
        AND e.description IS NOT NULL AND trim(e.description) <> ''
    `);
    const genOfCode = new Map();
    for (const r of rows) {
      const c = base(r.code);
      if (!genOfCode.has(c)) genOfCode.set(c, new Set());
      genOfCode.get(c).add(r.gen);
    }
    const byKey = new Map(t.generations.map((g) => [g.key, g]));

    const assign = (code, yFrom, yTo) => {
      const keys = [...(genOfCode.get(base(code)) || [])].filter((k) => byKey.has(k));
      if (!keys.length) return undefined;
      if (keys.length === 1) return byKey.get(keys[0]);
      if (yFrom == null) return undefined;
      const y1 = yTo === 9999 ? null : yTo ?? null;
      const scored = keys.map((k) => {
        const g = byKey.get(k);
        const to = g.to ?? 9999;
        return { g, overlap: Math.min(y1 ?? to, to) - Math.max(yFrom, g.from) };
      }).sort((a, b) => b.overlap - a.overlap);
      return scored[0].overlap >= 0 ? scored[0].g : undefined;
    };

    const pool = [];
    for (const slug of t.merged) {
      const g = md.generations[slug];
      if (g) pool.push(...(g.engines || []));
    }
    const buckets = new Map(t.generations.map((g) => [g.key, []]));
    const unplaced = [];
    for (const e of pool) {
      const g = assign(e.engineCode, e.yearFrom, e.yearTo);
      if (!g) unplaced.push(e); else buckets.get(g.key).push(e);
    }

    console.log(`\n  ${pool.length} moteurs a repartir (TecDoc : ${genOfCode.size} codes)`);
    for (const g of t.generations) {
      const n = buckets.get(g.key).length;
      const exists = !!md.generations[g.slug];
      if (n) console.log(`    ${g.name.padEnd(32)} ${g.from}-${g.to ?? ''}  +${n} ${exists ? '(ligne existante)' : '(ligne creee)'}`);
    }
    console.log(`    non reconnus, laisses dans la ligne d origine : ${unplaced.length}`);

    if (!APPLY) continue;

    snapshot[`${t.make}/${md.modelName}`] = JSON.parse(JSON.stringify(md.generations));
    for (const slug of t.merged) delete md.generations[slug];
    for (const g of t.generations) {
      const list = buckets.get(g.key);
      if (!list.length) continue;
      const existing = md.generations[g.slug];
      if (existing) {
        const have = new Set((existing.engines || []).map((e) => base(e.engineCode)));
        existing.engines = [...(existing.engines || []), ...list.filter((e) => !have.has(base(e.engineCode)))];
      } else {
        md.generations[g.slug] = {
          genName: g.name, genSlug: g.slug, yearFrom: g.from, yearTo: g.to, engines: list,
        };
      }
    }
    if (unplaced.length) {
      // The row the leftovers go back into is often also one of the targets —
      // the A4's merged row is a4-8d2-b5 and B5 is a real generation — so this
      // appends rather than assigns. Overwriting would replace a rebuilt row of
      // 44 engines with a row of one.
      const keep = t.merged[0];
      if (md.generations[keep]) {
        md.generations[keep].engines = [...(md.generations[keep].engines || []), ...unplaced];
      } else {
        const orig = snapshot[`${t.make}/${md.modelName}`][keep];
        md.generations[keep] = { ...orig, engines: unplaced };
      }
    }

    console.log('\n  apres :');
    for (const g of Object.values(md.generations)) {
      console.log(`    ${String(g.genName).padEnd(32)} ${g.yearFrom}-${g.yearTo ?? ''}  ${(g.engines || []).length}`);
    }
  }

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }
  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
