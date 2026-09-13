/**
 * Keeps the oil capacity only where a source says what it is.
 *
 * Capacity was never verified. It was generated per make into a handful of
 * buckets and then carried along beside every spec correction since, so it
 * looks like part of the recommendation without ever having been part of it.
 * The shape gives it away: Bentley has one capacity for all 64 of its engines,
 * MINI one for all 88, BMW seven for 898 with 768 of them on exactly 4 L, and
 * inside the Doblo a 1 300 cm3 diesel and a 2 000 cm3 diesel both read 3.6 L,
 * which cannot both be true.
 *
 * The hand-sourced per-make files under oil-finder-full-dataset carry a real
 * capacity for 693 engines, each with a source string. Checking the catalogue
 * against them is the only measurement available, and it is damning: of the 411
 * engines that can be checked, 288 disagree — and not marginally. A Chevrolet
 * LTG reads 4.5 L against a sourced 5.7 L, a Dacia K9K 872 reads 4.5 L against
 * 5.7 L. Someone filling to the figure on the screen underfills by more than a
 * litre.
 *
 * A capacity is acted on directly — it is the number that decides which pack
 * leaves the shop — so a figure that is wrong seven times out of ten where it
 * can be checked, and uncheckable everywhere else, should not be shown as a
 * specification. This does two things:
 *
 *   1. Where a sourced entry matches the engine, its value replaces whatever
 *      the catalogue held. That is 411 engines, 288 of them corrected.
 *   2. Everywhere else the field is emptied. Nothing is displayed rather than
 *      a number nothing stands behind.
 *
 * This is reversible and it grows: adding a sourced entry to the per-make files
 * and re-running restores the figure for those engines. Nothing is deleted from
 * the sources, only from the presentation.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const DIR = '/app/oil-finder-full-dataset';
const CATALOG = `${DIR}/clean-catalog-hierarchy.json`;
const SNAPSHOT = `/app/capacity-snapshot-${Date.now()}.json`;

const norm = (c) => String(c || '').toUpperCase().replace(/\s+/g, ' ').trim();
const baseCode = (c) => norm(c).replace(/\s*\([^)]*\)\s*$/, '').trim();
const normMake = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/** make|code -> the capacity a source gives, for both spellings of the code. */
function loadSourced() {
  const out = new Map();
  let entries = 0;
  for (const f of fs.readdirSync(DIR)) {
    if (!f.endsWith('.json')) continue;
    if (/conflicts|all-oil-products|clean-catalog|product-specs/.test(f)) continue;
    let j;
    try { j = JSON.parse(fs.readFileSync(`${DIR}/${f}`, 'utf8')); } catch (e) { continue; }
    if (!Array.isArray(j)) continue;
    for (const e of j) {
      if (!e || e.oilCapacityLiters == null || !e.source) continue;
      entries++;
      for (const k of [`${normMake(e.make)}|${norm(e.engineCode)}`,
        `${normMake(e.make)}|${baseCode(e.engineCode)}`]) {
        if (!out.has(k)) out.set(k, e.oilCapacityLiters);
      }
    }
  }
  return { map: out, entries };
}

const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`]
    .map(slugify).join('_');

const SPEC_FIELDS = ['viscosity', 'apiStandard', 'aceaStandard', 'oemApproval',
  'jasoStandard', 'capacityLiters', 'changeIntervalKm'];

async function main() {
  const prisma = new PrismaClient();
  const { map: sourced, entries } = loadSourced();
  console.log(`${entries} entrees sourcees avec capacite, ${sourced.size} cles\n`);

  const capFor = (make, code) => sourced.get(`${normMake(make)}|${norm(code)}`)
    ?? sourced.get(`${normMake(make)}|${baseCode(code)}`);

  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { catalog: [], oilFinderVehicles: [], vehicleEngines: [] };
  let kept = 0; let corrected = 0; let cleared = 0;

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          if (!e.oilSpec) continue;
          const src = capFor(mk.makeName, e.engineCode);
          const now = e.oilSpec.capacityLiters ?? null;
          const want = src ?? null;
          if (want === now) { if (want != null) kept++; continue; }
          if (want == null) cleared++; else corrected++;
          snapshot.catalog.push({
            make: mk.makeName, model: md.modelName, generation: gen.genName,
            engineCode: e.engineCode, was: now,
          });
          if (APPLY) e.oilSpec = { ...e.oilSpec, capacityLiters: want };
        }
      }
    }
  }

  const ofvAll = await prisma.oilFinderVehicle.findMany({ include: { oilSpec: true } });
  const ofvRows = ofvAll
    .map((r) => ({ r, want: capFor(r.make, r.engineCode) ?? null }))
    .filter(({ r, want }) => (r.oilSpec?.capacityLiters ?? null) !== want);
  const veAll = await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  });
  const veRows = veAll
    .map((r) => ({ r, make: r.generation?.model?.make?.name || '' }))
    .map((x) => ({ ...x, want: capFor(x.make, x.r.engineCode) ?? null }))
    .filter(({ r, want }) => (r.oilSpec?.capacityLiters ?? null) !== want);

  console.log(`catalogue : ${corrected} capacite(s) reprise(s) d une source, ${kept} deja conformes, ${cleared} videe(s)`);
  console.log(`base      : ${ofvRows.length} OilFinderVehicle, ${veRows.length} VehicleEngine`);

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
      const data = {};
      for (const f of SPEC_FIELDS) data[f] = spec[f] ?? null;
      const row = existing ?? (await prisma.oilFinderOilSpec.create({ data: { ...data, fingerprint: fp } }));
      id = row.id;
      specIdByFingerprint.set(fp, id);
    }
    return id;
  };

  /**
   * 90 000 rows move between a small number of specs, so they are grouped by
   * (spec they are on, capacity they should have) and sent as one updateMany
   * each. Row by row this is an hour of round trips for no extra safety.
   */
  const batch = async (rows, table, makeOf) => {
    const groups = new Map();
    for (const x of rows) {
      if (!x.r.oilSpec) continue;
      const k = `${x.r.oilSpecId}|${x.want ?? 'na'}|${makeOf(x).toUpperCase()}`;
      if (!groups.has(k)) groups.set(k, { spec: { ...x.r.oilSpec, capacityLiters: x.want }, make: makeOf(x).toUpperCase(), ids: [] });
      groups.get(k).ids.push(x.r.id);
    }
    let done = 0;
    for (const g of groups.values()) {
      const specId = await resolveSpecId(g.spec, g.make);
      for (let i = 0; i < g.ids.length; i += 500) {
        const slice = g.ids.slice(i, i + 500);
        await prisma[table].updateMany({ where: { id: { in: slice } }, data: { oilSpecId: specId } });
        done += slice.length;
      }
    }
    console.log(`  ${table} : ${done} lignes en ${groups.size} groupes`);
  };

  for (const x of ofvRows) snapshot.oilFinderVehicles.push({ id: x.r.id, engineCode: x.r.engineCode, was: x.r.oilSpecId });
  for (const x of veRows) snapshot.vehicleEngines.push({ id: x.r.id, engineCode: x.r.engineCode, was: x.r.oilSpecId });
  await batch(ofvRows, 'oilFinderVehicle', (x) => x.r.make || '');
  await batch(veRows, 'vehicleEngine', (x) => x.make || '');

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur : /app n est pas persistant)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
