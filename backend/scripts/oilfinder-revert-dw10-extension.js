/**
 * Reverts the part of the DW10 change that was not supported by the data.
 *
 * oilfinder-dw10-fap-split.js did two different things under one rule. On
 * RHZ (DW10ATED) the qualifier states the variant, so the absence of a
 * particulate filter is in the data and the specification follows from it. On
 * RHM, RHT, RHW, RHS, RHV and RHY it did not: those rows were moved from
 * 10W-40 PSA B71 2294 to 5W-40 PSA B71 2296 because they are the same engine
 * family, which is similarity and not evidence. The unqualified rows are the
 * same mistake from the other end — bare RHZ and bare RHW carry no variant at
 * all, so nothing in them supports a filter or no-filter reading either way,
 * and they keep the value they had.
 *
 * Propagating a specification across an engine family on resemblance is how the
 * generated data got here in the first place, so only RHZ (DW10ATED) keeps the
 * new value.
 *
 * The before-values are written out explicitly rather than read from the
 * snapshot that change wrote: /app is not persisted across a container restart
 * and the snapshot went with the restart that followed. They are the values the
 * change itself reported moving away from, and the OilFinderOilSpec rows they
 * point at still exist, so the restore resolves onto the same rows it left.
 *
 * Runs read-only unless --apply is passed.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/dw10-revert-snapshot-${Date.now()}.json`;

/** What PSA's full-SAPS spec looked like on these rows before the change. */
const B71_2294 = {
  viscosity: '10W-40',
  apiStandard: 'SL/CF',
  aceaStandard: 'A3/B4',
  oemApproval: 'PSA B71 2294',
  jasoStandard: null,
  capacityLiters: 4.75,
  changeIntervalKm: 15000,
};

/** And the low-SAPS filter spec, which the unqualified rows carried. */
const B71_2290 = {
  viscosity: '5W-30',
  apiStandard: 'SN/CF',
  aceaStandard: 'C2',
  oemApproval: 'PSA B71 2290',
  jasoStandard: null,
  capacityLiters: 5.25,
  changeIntervalKm: 20000,
};

/**
 * Every code the change touched except RHZ (DW10ATED), with the spec it held.
 * The qualified ATED and pre-filter variants were on B71 2294; the two codes the
 * catalogue leaves unqualified were on B71 2290.
 */
const RESTORE = [
  { codes: ['RHM (DW10ATED4)', 'RHS (DW10ATED)', 'RHT (DW10ATED4)', 'RHW (DW10ATED4)',
    'RHV (DW10)', 'RHV (DW10TD)', 'RHV (DW10UTD)', 'RHY (DW10TD)'], spec: B71_2294 },
  { codes: ['RHZ', 'RHW'], spec: B71_2290 },
];

const norm = (c) => String(c || '').toUpperCase().replace(/\s+/g, ' ').trim();
const target = new Map();
for (const r of RESTORE) for (const c of r.codes) target.set(norm(c), r.spec);

const SPEC_FIELDS = ['viscosity', 'apiStandard', 'aceaStandard', 'oemApproval',
  'jasoStandard', 'capacityLiters', 'changeIntervalKm'];
const specKey = (s) => SPEC_FIELDS.map((k) => s?.[k] ?? '-').join('|');

const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`]
    .map(slugify).join('_');

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { catalog: [], oilFinderVehicles: [], vehicleEngines: [] };
  const counts = new Map();

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          const want = target.get(norm(e.engineCode));
          if (!want || specKey(want) === specKey(e.oilSpec)) continue;
          const k = `${norm(e.engineCode)}  ${e.oilSpec?.viscosity} ${e.oilSpec?.oemApproval}  ->  ${want.viscosity} ${want.oemApproval}`;
          counts.set(k, (counts.get(k) || 0) + 1);
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
    .map((r) => ({ r, want: target.get(norm(r.engineCode)) }))
    .filter(({ r, want }) => want && specKey(want) !== specKey(r.oilSpec));
  const veRows = (await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  })).map((r) => ({ r, make: r.generation?.model?.make?.name || '', want: target.get(norm(r.engineCode)) }))
    .filter(({ r, want }) => want && specKey(want) !== specKey(r.oilSpec));

  console.log('conserve : RHZ (DW10ATED) -> 5W-40 PSA B71 2296 (variante indiquee par les donnees)\n');
  for (const [k, n] of [...counts].sort()) console.log(`  x${String(n).padStart(4)}  ${k}`);
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
      const row = existing ?? (await prisma.oilFinderOilSpec.create({ data: { ...spec, fingerprint: fp } }));
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
  console.log(`\nSnapshot -> ${SNAPSHOT}  (copier hors du conteneur : /app n est pas persistant)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
