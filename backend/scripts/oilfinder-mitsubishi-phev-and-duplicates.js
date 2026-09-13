/**
 * The last two Mitsubishi items: the Outlander PHEV, and two duplicate models.
 *
 * S61 and Y61 are not junk codes. TecDoc files both against "2.0 Hybrid 4WD
 * (GG2W)" — the Outlander PHEV — and they are its motor designations rather
 * than its engine. The car still has a petrol engine, and the catalogue was
 * offering it 10W-40 ACEA A3/B4 API SL: a 2001-era category and a grade that
 * belongs to the 1990s, on a 2013 Atkinson-cycle hybrid whose engine runs in
 * short bursts and rarely reaches temperature.
 *
 * The engine in the GG2W is the 4B11, and the catalogue already holds a 4B11
 * entry on the same Outlander. That value is adopted rather than a new one
 * invented — it is read from the data at run time, not written in here, so the
 * PHEV rows say whatever the 4B11 row says and cannot drift away from it.
 *
 * Then two model nodes that are duplicates rather than models:
 *
 *   "TRITON" holds one generation, "TRITON V", with no years at all and two
 *   engines written as descriptions rather than codes — "2.4 DI-D (4N15)" and
 *   "2.5 DI-D (4D56T)". Both engines already exist properly: the 4N15 under
 *   L200 (2015-) and the 4D56 T under L200 and L 200 / Triton.
 *
 *   "L 200" duplicates "L200" down to the generation keys — the same
 *   l-200-k3-t-k2-t-k1-t-k0-t and l-200-k7-t-k6-t, carrying the same engines.
 *   It is the same truck spelled with a space.
 *
 * "L 200 / Triton" is deliberately kept: its 2005-2015 generation (KA_T, KB_T)
 * with the 4D56 HP and 4D56 (16V) exists nowhere else, so it is a real gap in
 * the other two rather than a third copy.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/mitsubishi-phev-snapshot-${Date.now()}.json`;

const MAKE = 'MITSUBISHI';
const PHEV_CODES = new Set(['S61', 'Y61']);
/** The engine those motor codes sit alongside, whose spec they should share. */
const PHEV_ENGINE = '4B11';
/** Model slugs that are duplicates of another model, with what they duplicate. */
const DUPLICATE_MODELS = [
  { slug: 'triton', duplicates: 'L200 (4N15 2015-) et L 200 / Triton (4D56 T)' },
  { slug: 'l-200', duplicates: 'L200, memes generations et memes moteurs' },
];

const SPEC_FIELDS = ['viscosity', 'apiStandard', 'aceaStandard', 'oemApproval',
  'jasoStandard', 'capacityLiters', 'changeIntervalKm'];
const pickSpec = (s) => {
  const out = {};
  for (const k of SPEC_FIELDS) out[k] = s?.[k] ?? null;
  return out;
};
const specKey = (s) => SPEC_FIELDS.map((k) => s?.[k] ?? '-').join('|');

const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`]
    .map(slugify).join('_');

const norm = (c) => String(c || '').toUpperCase().replace(/\s+/g, ' ').trim();

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const mkKey = Object.keys(catalog).find(
    (k) => String(catalog[k]?.makeName || '').toUpperCase() === MAKE,
  );
  if (!mkKey) { console.error('MITSUBISHI absent du catalogue'); process.exit(1); }
  const mk = catalog[mkKey];

  // ── 1. what the 4B11 on the Outlander is running on ──
  let phevSpec;
  for (const md of Object.values(mk.models || {})) {
    if (!/^outlander$/i.test(String(md.modelName).trim())) continue;
    for (const gen of Object.values(md.generations || {})) {
      for (const e of gen.engines || []) {
        if (norm(e.engineCode) === PHEV_ENGINE && e.oilSpec?.viscosity) phevSpec = pickSpec(e.oilSpec);
      }
    }
  }
  if (!phevSpec) { console.error(`Aucun ${PHEV_ENGINE} trouve sur l Outlander — rien de sur a reprendre.`); process.exit(1); }
  console.log(`${PHEV_ENGINE} de l Outlander : ${phevSpec.viscosity} / ${phevSpec.aceaStandard || '-'} / ${phevSpec.apiStandard || '-'} / ${phevSpec.capacityLiters}L`);

  const snapshot = { phev: [], models: [], oilFinderVehicles: [], vehicleEngines: [] };
  let phevN = 0;

  for (const md of Object.values(mk.models || {})) {
    for (const gen of Object.values(md.generations || {})) {
      for (const e of gen.engines || []) {
        if (!PHEV_CODES.has(norm(e.engineCode))) continue;
        if (specKey(e.oilSpec) === specKey(phevSpec)) continue;
        phevN++;
        snapshot.phev.push({ model: md.modelName, generation: gen.genName, engineCode: e.engineCode, was: e.oilSpec });
        if (APPLY) e.oilSpec = { ...e.oilSpec, ...phevSpec };
      }
    }
  }
  console.log(`PHEV : ${phevN} moteur(s) du catalogue a reprendre sur le ${PHEV_ENGINE}`);

  // ── 2. duplicate models ──
  for (const d of DUPLICATE_MODELS) {
    const md = mk.models?.[d.slug];
    if (!md) { console.log(`  modele "${d.slug}" deja absent`); continue; }
    const engines = Object.values(md.generations || {}).reduce((a, g) => a + (g.engines || []).length, 0);
    console.log(`  supprime "${md.modelName}" (slug ${d.slug}) : ${Object.keys(md.generations || {}).length} generation(s), ${engines} moteur(s) — doublon de ${d.duplicates}`);
    snapshot.models.push({ slug: d.slug, model: md });
    if (APPLY) delete mk.models[d.slug];
  }

  // ── 3. database ──
  const phevRows = (await prisma.oilFinderVehicle.findMany({
    where: { make: { equals: MAKE, mode: 'insensitive' } }, include: { oilSpec: true },
  })).filter((r) => PHEV_CODES.has(norm(r.engineCode)) && specKey(r.oilSpec) !== specKey(phevSpec));
  const phevEngines = (await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  })).filter((r) => String(r.generation?.model?.make?.name || '').toUpperCase() === MAKE
    && PHEV_CODES.has(norm(r.engineCode)) && specKey(r.oilSpec) !== specKey(phevSpec));

  const dupNames = ['TRITON', 'L 200'];
  const dupRows = await prisma.oilFinderVehicle.findMany({
    where: {
      make: { equals: MAKE, mode: 'insensitive' },
      OR: dupNames.map((n) => ({ model: { equals: n, mode: 'insensitive' } })),
    },
  });

  console.log(`base : ${phevRows.length} OilFinderVehicle PHEV, ${phevEngines.length} VehicleEngine PHEV, ${dupRows.length} ligne(s) des modeles doublons a supprimer`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  const specIdByFingerprint = new Map();
  const resolveSpecId = async () => {
    const fp = fingerprint(phevSpec, MAKE);
    let id = specIdByFingerprint.get(fp);
    if (!id) {
      const existing = await prisma.oilFinderOilSpec.findFirst({ where: { fingerprint: fp } });
      const data = {};
      for (const f of SPEC_FIELDS) data[f] = phevSpec[f] ?? null;
      const row = existing ?? (await prisma.oilFinderOilSpec.create({ data: { ...data, fingerprint: fp } }));
      id = row.id;
      specIdByFingerprint.set(fp, id);
    }
    return id;
  };

  const specId = await resolveSpecId();
  for (const r of phevRows) {
    snapshot.oilFinderVehicles.push({ id: r.id, engineCode: r.engineCode, was: r.oilSpecId });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { oilSpecId: specId } });
  }
  for (const r of phevEngines) {
    snapshot.vehicleEngines.push({ id: r.id, engineCode: r.engineCode, was: r.oilSpecId });
    await prisma.vehicleEngine.update({ where: { id: r.id }, data: { oilSpecId: specId } });
  }
  for (const r of dupRows) {
    snapshot.oilFinderVehicles.push({ deleted: true, row: r });
    await prisma.oilFinderVehicle.delete({ where: { id: r.id } });
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur : /app n est pas persistant)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
