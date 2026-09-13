/**
 * Removes every particulate-filter claim the data does not actually support.
 *
 * Filter fitment is a property of the vehicle and its market, not of the engine
 * code, and PSA's own tables prove it: RHS is a DW10ATED *with* a filter while
 * RHZ is a DW10ATED without one, so reading "ATED" as "no filter" is wrong on
 * its face. The same objection applies to reading a VW Pumpe-Duse code as
 * evidence of a filter. Nothing in this dataset records fitment, so nothing in
 * it should assert fitment.
 *
 * Two things go:
 *
 *   1. RHZ (DW10ATED), 19 rows, returns to the values it held before the
 *      filter-based split — 18 on 10W-40 PSA B71 2294 and the one Lancia Zeta
 *      row on 5W-30 PSA B71 2290, which is where each of them was.
 *   2. The "(PD avec FAP)" note is stripped from 87 VW-group rows, leaving the
 *      approval itself alone. VW 507.00 is the right specification for those
 *      Pumpe-Duse engines either way; what was wrong was the sentence appended
 *      to it, which claimed a filter the row has no way of knowing about.
 *
 * What stays is the Changan D20TCIE. Its filter is not inferred from anything:
 * Changan's own overseas-version distributor deck lists the DPF three times,
 * including a forced-regeneration procedure, and instructs 5W-30 ACEA C4 in the
 * DPF section. A claim with a source behind it is not the same kind of statement
 * as a claim read off an engine code.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/fap-claims-snapshot-${Date.now()}.json`;

/** Where RHZ (DW10ATED) sat before the split, by the model that held it. */
const B71_2294 = {
  viscosity: '10W-40', apiStandard: 'SL/CF', aceaStandard: 'A3/B4',
  oemApproval: 'PSA B71 2294', jasoStandard: null,
  capacityLiters: 4.75, changeIntervalKm: 15000,
};
const B71_2290 = {
  viscosity: '5W-30', apiStandard: 'SN/CF', aceaStandard: 'C2',
  oemApproval: 'PSA B71 2290', jasoStandard: null,
  capacityLiters: 5.25, changeIntervalKm: 20000,
};

const norm = (c) => String(c || '').toUpperCase().replace(/\s+/g, ' ').trim();
const isRhzAted = (code) => norm(code) === 'RHZ (DW10ATED)';
/** The single row that had drifted onto the filter specification. */
const wasOnFilterSpec = (make, model) =>
  String(make).toUpperCase() === 'LANCIA' && /^ZETA$/i.test(String(model).trim());

/** Notes that assert filter fitment. The Changan one is sourced and excluded. */
const INFERRED_NOTE = /\s*\((?:PD\s+)?(?:avec|sans)\s+FAP\)\s*$/i;
const stripNote = (approval) => {
  if (!approval || /changan/i.test(approval)) return undefined;
  const out = approval.replace(INFERRED_NOTE, '').trim();
  return out !== approval ? out : undefined;
};

const SPEC_FIELDS = ['viscosity', 'apiStandard', 'aceaStandard', 'oemApproval',
  'jasoStandard', 'capacityLiters', 'changeIntervalKm'];
const specKey = (s) => SPEC_FIELDS.map((k) => s?.[k] ?? '-').join('|');

const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`]
    .map(slugify).join('_');

/** The spec a row should end on, or undefined to leave it alone. */
const wantedFor = (make, model, code, spec) => {
  if (isRhzAted(code)) {
    return wasOnFilterSpec(make, model) ? B71_2290 : B71_2294;
  }
  const stripped = stripNote(spec?.oemApproval);
  return stripped === undefined ? undefined : { ...spec, oemApproval: stripped };
};

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { catalog: [], oilFinderVehicles: [], vehicleEngines: [] };
  const moves = new Map();

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          const want = wantedFor(mk.makeName, md.modelName, e.engineCode, e.oilSpec);
          if (!want || specKey(want) === specKey(e.oilSpec)) continue;
          const k = `${norm(e.engineCode)}  ${e.oilSpec?.viscosity} ${e.oilSpec?.oemApproval}  ->  ${want.viscosity} ${want.oemApproval}`;
          moves.set(k, (moves.get(k) || 0) + 1);
          snapshot.catalog.push({
            make: mk.makeName, model: md.modelName, generation: gen.genName,
            engineCode: e.engineCode, was: e.oilSpec,
          });
          if (APPLY) e.oilSpec = { ...e.oilSpec, ...want };
        }
      }
    }
  }

  const ofvRows = (await prisma.oilFinderVehicle.findMany({ include: { oilSpec: true } }))
    .map((r) => ({ r, want: wantedFor(r.make, r.model, r.engineCode, r.oilSpec) }))
    .filter(({ r, want }) => want && specKey(want) !== specKey(r.oilSpec));
  const veRows = (await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  })).map((r) => {
    const make = r.generation?.model?.make?.name || '';
    const model = r.generation?.model?.name || '';
    return { r, make, want: wantedFor(make, model, r.engineCode, r.oilSpec) };
  }).filter(({ r, want }) => want && specKey(want) !== specKey(r.oilSpec));

  for (const [k, n] of [...moves].sort()) console.log(`  x${String(n).padStart(4)}  ${k}`);
  console.log(`\n${snapshot.catalog.length} catalogue, ${ofvRows.length} OilFinderVehicle, ${veRows.length} VehicleEngine`);

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

  for (const { r, want } of ofvRows) {
    snapshot.oilFinderVehicles.push({ id: r.id, engineCode: r.engineCode, was: r.oilSpecId });
    await prisma.oilFinderVehicle.update({
      where: { id: r.id }, data: { oilSpecId: await resolveSpecId(want, r.make.toUpperCase()) },
    });
  }
  for (const { r, make, want } of veRows) {
    snapshot.vehicleEngines.push({ id: r.id, engineCode: r.engineCode, was: r.oilSpecId });
    await prisma.vehicleEngine.update({
      where: { id: r.id }, data: { oilSpecId: await resolveSpecId(want, make.toUpperCase()) },
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
