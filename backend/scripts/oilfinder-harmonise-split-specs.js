/**
 * Makes one engine give one answer.
 *
 * The per-engine correction passes reached some rows of an engine and not
 * others, because the same engine is filed under several models and body
 * styles: a Transit 2.2 TDCi appears under Transit, Transit Box, Transit Bus,
 * Transit Custom and Transit Tourneo. The result is that the same engine code
 * at the same displacement can show two different oils depending on which
 * version of the car the customer picks — a Citroen RHZ reads 10W-40 PSA B71
 * 2294 through one model and 5W-30 PSA B71 2290 through another.
 *
 * Where the two candidates disagree, one of them is a leftover of the
 * generated era-based defaults and the other is the hand-verified value. The
 * tell is the OEM approval: the generated pass left most rows without one.
 *
 * Three cases are resolved, in order of how much is actually known:
 *
 *   1. Exactly one candidate carries a real approval. It wins outright — the
 *      others are the generated default it was meant to replace.
 *   2. Several carry an approval but all name the same viscosity. They differ
 *      only in the detail recorded alongside it, so the most complete entry
 *      wins and the grade the customer buys is unchanged either way.
 *   3. None carries an approval. Nothing distinguishes them but frequency, and
 *      every candidate is a generated value, so the most complete and then the
 *      most common wins. This is consistency rather than correction.
 *
 * The fourth case is deliberately left alone: several approvals naming
 * different viscosities. Those are not all mistakes. A BMW M47 D20 reads 5W-40
 * BMW Longlife-98 on its 1998-2003 generations and 5W-30 Longlife-04 on its
 * 2004-2005 ones, and both are correct for their years — the customer picks a
 * generation, so each row is answering about a different car. Forcing a single
 * value there would break whichever one it overwrote. They are reported instead.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--list');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/split-specs-snapshot-${Date.now()}.json`;

const GENERIC_APPROVAL = /Asian OEM|Universal |MB Sheet 229\.1 or/i;
const hasRealApproval = (s) => !!(s && s.oemApproval && !GENERIC_APPROVAL.test(s.oemApproval));

const SPEC_FIELDS = ['viscosity', 'apiStandard', 'aceaStandard', 'oemApproval',
  'jasoStandard', 'capacityLiters', 'changeIntervalKm'];
const pickSpec = (s) => {
  const out = {};
  for (const k of SPEC_FIELDS) out[k] = s?.[k] ?? null;
  return out;
};
const specKey = (s) => SPEC_FIELDS.map((k) => s?.[k] ?? '-').join('|');
const completeness = (s) => SPEC_FIELDS.filter((k) => s?.[k] != null && s[k] !== '').length;

const base = (c) => String(c || '').trim().toUpperCase().replace(/\s*\([^)]*\)\s*$/, '').trim();
const groupKey = (make, code, cc) =>
  `${String(make || '').toUpperCase()}|${base(code)}|${cc ?? '?'}`;

const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`]
    .map(slugify).join('_');

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

  // ── 1. every spec each engine is currently shown with, across all stores ──
  const groups = new Map(); // key -> Map(specKey -> { n, spec })
  const note = (make, code, cc, spec) => {
    if (!spec || !spec.viscosity) return;
    const k = groupKey(make, code, cc);
    if (!groups.has(k)) groups.set(k, new Map());
    const m = groups.get(k);
    const sk = specKey(spec);
    if (!m.has(sk)) m.set(sk, { n: 0, spec: pickSpec(spec) });
    m.get(sk).n++;
  };

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) note(mk.makeName, e.engineCode, e.displacementCc, e.oilSpec);
      }
    }
  }
  // Only the catalogue votes. It is what the dropdowns read, it is where the
  // per-engine corrections were applied, and the database still holds rows from
  // the two seeded sources whose specs were fabricated — letting those vote
  // would let fabricated data outweigh verified data. The database is brought
  // into line with the catalogue's answer rather than helping choose it.
  const ofvAll = await prisma.oilFinderVehicle.findMany({ include: { oilSpec: true } });
  const veAll = await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  });

  // ── 2. decide a winner per engine ──
  const winners = new Map();
  const stats = { one: 0, sameVisc: 0, none: 0, skipped: 0 };
  const skipped = [];

  for (const [k, m] of groups) {
    if (m.size < 2) continue;
    const all = [...m.values()];
    const approved = all.filter((v) => hasRealApproval(v.spec));
    const best = (pool) => pool.slice().sort((a, b) =>
      completeness(b.spec) - completeness(a.spec) || b.n - a.n)[0].spec;

    if (approved.length === 1) { winners.set(k, approved[0].spec); stats.one++; continue; }
    if (approved.length === 0) { winners.set(k, best(all)); stats.none++; continue; }
    if (new Set(approved.map((v) => v.spec.viscosity)).size === 1) {
      winners.set(k, best(approved)); stats.sameVisc++; continue;
    }
    stats.skipped++;
    skipped.push(`${k}  ${approved.map((v) => `${v.spec.viscosity} ${v.spec.oemApproval}`).join('  VS  ')}`);
  }

  // ── 3. plan ──
  const snapshot = { catalog: [], oilFinderVehicles: [], vehicleEngines: [] };
  let catN = 0;

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          const win = winners.get(groupKey(mk.makeName, e.engineCode, e.displacementCc));
          if (!win || specKey(win) === specKey(e.oilSpec)) continue;
          catN++;
          snapshot.catalog.push({
            make: mk.makeName, model: md.modelName, generation: gen.genName,
            engineCode: e.engineCode, was: e.oilSpec,
          });
          if (APPLY) e.oilSpec = { ...e.oilSpec, ...win };
        }
      }
    }
  }

  const ofvRows = ofvAll
    .map((r) => ({ r, win: winners.get(groupKey(r.make, r.engineCode, r.displacementCc)) }))
    .filter(({ r, win }) => win && specKey(win) !== specKey(r.oilSpec));
  const veRows = veAll
    .map((r) => ({ r, make: r.generation?.model?.make?.name || '' }))
    .map((x) => ({ ...x, win: winners.get(groupKey(x.make, x.r.engineCode, x.r.displacementCc)) }))
    .filter(({ r, win }) => win && specKey(win) !== specKey(r.oilSpec));

  console.log(`moteurs a plusieurs specs : ${stats.one + stats.sameVisc + stats.none + stats.skipped}`);
  console.log(`  une seule homologation reelle      : ${stats.one}`);
  console.log(`  plusieurs, meme viscosite          : ${stats.sameVisc}`);
  console.log(`  aucune homologation                : ${stats.none}`);
  console.log(`  viscosites divergentes, NON TOUCHE : ${stats.skipped}`);
  console.log(`\nlignes a harmoniser : ${catN} catalogue, ${ofvRows.length} OilFinderVehicle, ${veRows.length} VehicleEngine`);
  if (VERBOSE && skipped.length) {
    console.log('\ngroupes laisses en l etat (a arbitrer a la main) :');
    skipped.slice(0, 200).forEach((s) => console.log('  ' + s));
  }

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  const specIdByFingerprint = new Map();
  const resolveSpecId = async (spec, make) => {
    const fp = fingerprint(spec, make);
    let id = specIdByFingerprint.get(fp);
    if (!id) {
      const existing = await prisma.oilFinderOilSpec.findFirst({ where: { fingerprint: fp } });
      const row = existing ?? (await prisma.oilFinderOilSpec.create({ data: { ...spec, fingerprint: fp } }));
      id = row.id;
      specIdByFingerprint.set(fp, id);
    }
    return id;
  };

  for (const { r, win } of ofvRows) {
    snapshot.oilFinderVehicles.push({ id: r.id, make: r.make, engineCode: r.engineCode, was: r.oilSpecId });
    await prisma.oilFinderVehicle.update({
      where: { id: r.id },
      data: { oilSpecId: await resolveSpecId(win, r.make.toUpperCase()) },
    });
  }
  for (const { r, make, win } of veRows) {
    snapshot.vehicleEngines.push({ id: r.id, engineCode: r.engineCode, was: r.oilSpecId });
    await prisma.vehicleEngine.update({
      where: { id: r.id },
      data: { oilSpecId: await resolveSpecId(win, make.toUpperCase()) },
    });
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
