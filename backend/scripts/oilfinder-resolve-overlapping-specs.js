/**
 * Resolves engines that show two oils in the same years.
 *
 * 162 engines carry more than one spec. 17 of those are era differences and are
 * correct — a BMW M47 D20 is Longlife-98 before 2004 and Longlife-04 after, the
 * customer picks a generation, and each row answers about a different car. The
 * other 145 have year ranges that overlap: the same car, two answers, and
 * nothing for the customer to choose between them. They exist because the same
 * engine sits under several marques — an EA189 is in a Golf, an A3, an Octavia
 * and a Leon — and the per-engine spec tables were applied one marque at a time.
 *
 * Only one rule is applied here, and it is the same one that settled the 1 534
 * split specs earlier: a generated default loses to a real manufacturer
 * approval. The generated strings are known because this dataset wrote them —
 * "VW 501.01/505.00" and "VW 502.00/505.01" are the era-based defaults, and
 * "Asian OEM Standard", "Universal High-Performance" and an empty approval are
 * placeholders. Everything else was written by a per-engine table against a
 * source.
 *
 * Note what is deliberately NOT resolved. Where both candidates are real
 * approvals — Ford WSS-M2C913-D against WSS-M2C950-A, BMW Longlife-98 against
 * Longlife-04, JLR STJLR.03.5003 against 51.5122 — taking "the newer one" is
 * not safe, because these are not a supersession chain: Ford's 948-B is a 5W-20
 * for one engine family and 950-A a 0W-30 low-SAPS for another, not successive
 * versions of one spec. And VW 508.00/509.00 is explicitly not interchangeable
 * with 504.00/507.00 in either direction, as is the Pumpe-Duse 505.01. Those
 * need the engine sourced, not a rule, and guessing at them is the mistake this
 * work has had to undo twice already.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/overlapping-specs-snapshot-${Date.now()}.json`;
const THIS_YEAR = new Date().getFullYear();

/** Approvals this dataset generated rather than sourced. */
const GENERATED = [
  /^VW\s*501\.01\/505\.00$/i,
  /^VW\s*502\.00\/505\.01$/i,
  /^Asian OEM/i,
  /^Universal /i,
  /^MB Sheet 229\.1 or/i,
];
const isGenerated = (a) => !a || GENERATED.some((re) => re.test(String(a).trim()));

const norm = (c) => String(c || '').toUpperCase().replace(/\s+/g, ' ').trim();

/**
 * "Moteur Standard" is what the harvest writes when it finds no engine code. It
 * is not an identifier, so grouping by it puts a 1956 Citroen DS, a Glas Isar
 * and an electric E-Mehari in one group and hands them all the same oil. Any row
 * carrying it is left alone, and so is anything already marked electrique.
 */
const isPlaceholder = (c) => /moteur standard/i.test(String(c || ''));
const SPEC_FIELDS = ['viscosity', 'apiStandard', 'aceaStandard', 'oemApproval',
  'jasoStandard', 'capacityLiters', 'changeIntervalKm'];
const pick = (s) => { const o = {}; for (const f of SPEC_FIELDS) o[f] = s?.[f] ?? null; return o; };
const specKey = (s) => SPEC_FIELDS.map((f) => s?.[f] ?? '-').join('|');

const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`].map(slugify).join('_');

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

  // ── collect every spec each engine is shown with, and the years it sits on ──
  const groups = new Map();
  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        const from = gen.yearFrom ?? null;
        const to = gen.yearTo === 9999 ? null : gen.yearTo ?? null;
        for (const e of gen.engines || []) {
          if (isPlaceholder(e.engineCode) || e.fuelType === 'electrique') continue;
          const key = `${norm(mk.makeName)}|${norm(e.engineCode)}|${e.displacementCc ?? '?'}`;
          if (!groups.has(key)) groups.set(key, new Map());
          const m = groups.get(key);
          const sk = specKey(e.oilSpec);
          if (!m.has(sk)) m.set(sk, { spec: pick(e.oilSpec), n: 0, from: [], to: [] });
          const v = m.get(sk);
          v.n++;
          if (from != null) v.from.push(from);
          v.to.push(to == null ? THIS_YEAR : to);
        }
      }
    }
  }

  const overlaps = (a, b) => {
    if (!a.from.length || !b.from.length) return true;
    return Math.min(Math.max(...a.to), Math.max(...b.to)) - Math.max(Math.min(...a.from), Math.min(...b.from)) > 1;
  };

  // ── decide ──
  const winners = new Map();
  let era = 0; let resolved = 0; let needsSource = 0;
  const left = new Map();
  for (const [k, m] of groups) {
    if (m.size < 2) continue;
    const specs = [...m.values()];
    let clash = false;
    for (let i = 0; i < specs.length && !clash; i++) {
      for (let j = i + 1; j < specs.length && !clash; j++) if (overlaps(specs[i], specs[j])) clash = true;
    }
    if (!clash) { era++; continue; }
    const real = specs.filter((v) => !isGenerated(v.spec.oemApproval));
    if (real.length === 1) { winners.set(k, real[0].spec); resolved++; continue; }
    needsSource++;
    const pair = specs.map((v) => `${v.spec.viscosity} ${v.spec.oemApproval || '(sans)'}`).sort().join('  VS  ');
    left.set(pair, (left.get(pair) || 0) + 1);
  }

  console.log(`moteurs a plusieurs specs : ${era + resolved + needsSource}`);
  console.log(`  differences d epoque, laissees telles quelles : ${era}`);
  console.log(`  tranchees ici (un defaut genere contre une homologation reelle) : ${resolved}`);
  console.log(`  a sourcer moteur par moteur : ${needsSource}`);
  console.log('\n  restent a sourcer :');
  for (const [p, n] of [...left].sort((a, b) => b[1] - a[1])) console.log(`    x${String(n).padStart(3)}  ${p}`);

  // ── apply ──
  const snapshot = { catalog: [], oilFinderVehicles: [], vehicleEngines: [] };
  let catN = 0;
  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          if (isPlaceholder(e.engineCode) || e.fuelType === 'electrique') continue;
          const win = winners.get(`${norm(mk.makeName)}|${norm(e.engineCode)}|${e.displacementCc ?? '?'}`);
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
  const ofv = (await prisma.oilFinderVehicle.findMany({ include: { oilSpec: true } }))
    .map((r) => ({ r, win: isPlaceholder(r.engineCode) || r.fuelType === 'electrique' ? undefined : winners.get(`${norm(r.make)}|${norm(r.engineCode)}|${r.displacementCc ?? '?'}`) }))
    .filter(({ r, win }) => win && specKey(win) !== specKey(r.oilSpec));
  const ve = (await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  })).map((r) => ({ r, make: r.generation?.model?.make?.name || '' }))
    .map((x) => ({ ...x, win: winners.get(`${norm(x.make)}|${norm(x.r.engineCode)}|${x.r.displacementCc ?? '?'}`) }))
    .filter(({ r, win }) => win && specKey(win) !== specKey(r.oilSpec));

  console.log(`\nlignes a aligner : ${catN} catalogue, ${ofv.length} OilFinderVehicle, ${ve.length} VehicleEngine`);
  if (!APPLY) { console.log('\nRien ecrit. Relancer avec --apply.'); await prisma.$disconnect(); return; }

  const cache = new Map();
  const resolveSpecId = async (spec, make) => {
    const fp = fingerprint(spec, make);
    if (cache.has(fp)) return cache.get(fp);
    const existing = await prisma.oilFinderOilSpec.findFirst({ where: { fingerprint: fp } });
    const data = {}; for (const f of SPEC_FIELDS) data[f] = spec[f] ?? null;
    const row = existing ?? (await prisma.oilFinderOilSpec.create({ data: { ...data, fingerprint: fp } }));
    cache.set(fp, row.id);
    return row.id;
  };
  for (const { r, win } of ofv) {
    snapshot.oilFinderVehicles.push({ id: r.id, was: r.oilSpecId });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { oilSpecId: await resolveSpecId(win, norm(r.make)) } });
  }
  for (const { r, make, win } of ve) {
    snapshot.vehicleEngines.push({ id: r.id, was: r.oilSpecId });
    await prisma.vehicleEngine.update({ where: { id: r.id }, data: { oilSpecId: await resolveSpecId(win, norm(make)) } });
  }
  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}\nCatalogue reecrit.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
