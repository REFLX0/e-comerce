/**
 * Splits PSA's DW10 2.0 HDi by whether the variant has a particulate filter.
 *
 * The engine code alone does not decide this engine's oil; the variant does, and
 * the variant is written in the catalogue inside the parentheses after the code.
 * A Jumpy lists RHZ five different ways — RHZ (DW10ATED), (DW10BTED),
 * (DW10BTED+), (DW10CTED), (DW10CTED+) — and they are not the same engine:
 *
 *   ATED / ATED4, and the pre-filter DW10, DW10TD, DW10UTD
 *       no FAP  ->  5W-40, ACEA A3/B4, PSA B71 2296
 *   BTED / BTED4 / CTED / CTED4 / UTED4
 *       with FAP ->  5W-30, ACEA C2, PSA B71 2290
 *   CB (BlueHDi, SCR)
 *       ->  0W-30, ACEA C2, PSA B71 2312
 *
 * PSA B71 2290 is a low-SAPS C2 specification that exists because of the filter.
 * Putting it on a variant that has no filter is not merely imprecise: it sends
 * the owner of a pre-filter 2.0 HDi to a thinner, lower-HTHS oil than the engine
 * was approved for, in a climate that argues the other way. And the filter
 * variants must keep it, because a high-SAPS 40-weight would block the filter.
 *
 * What had gone wrong on RHZ specifically: one RHZ (DW10ATED) row had drifted
 * onto the filter specification despite its qualifier saying otherwise.
 *
 * Only rows whose qualifier states the variant are rewritten. The filter and
 * BlueHDi rows already carry the right specification and are left untouched, and
 * this is a named list rather than a rule over the RH family for the same reason
 * the list is short — RHBA is a Ford code, RHP carries a generic low-SAPS note,
 * and the unqualified rows say nothing about a filter at all.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/dw10-fap-split-snapshot-${Date.now()}.json`;

/**
 * One entry, and deliberately only one.
 *
 * This started as the whole non-filter half of the DW10 family — RHM, RHS, RHT,
 * RHW, RHV, RHY and the unqualified rows — and that was reverted, because those
 * rows were being moved on the strength of belonging to the same engine family
 * rather than on anything the data says about them. Resemblance is not evidence,
 * and propagating a specification across a family on resemblance is how the
 * generated data got here.
 *
 * RHZ (DW10ATED) stays because its own qualifier names the variant: ATED is the
 * pre-filter build, so the absence of a particulate filter is recorded in the
 * row itself and the specification follows from it. Bare RHZ is not included for
 * the same reason in reverse — with no qualifier, nothing in the row supports a
 * filter or no-filter reading either way, so it keeps the value it had.
 *
 * Adding a code here needs the variant to be stated in the data, not inferred
 * from a sibling.
 */
const NO_FAP = ['RHZ (DW10ATED)'];

/** What PSA specifies for them: a full-SAPS synthetic 40-weight. */
const SPEC = {
  viscosity: '5W-40',
  apiStandard: 'SL/CF',
  aceaStandard: 'A3/B4',
  oemApproval: 'PSA B71 2296 (sans FAP)',
  jasoStandard: null,
  capacityLiters: 4.75,
  changeIntervalKm: 15000,
};

const norm = (c) => String(c || '').toUpperCase().replace(/\s+/g, ' ').trim();
const TARGETS = new Set(NO_FAP.map(norm));
const isTarget = (code) => TARGETS.has(norm(code));

const SPEC_FIELDS = Object.keys(SPEC);
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
  const from = new Map();

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          if (!isTarget(e.engineCode)) continue;
          if (specKey(e.oilSpec) === specKey(SPEC)) continue;
          const label = `${e.oilSpec?.viscosity || '-'} / ${e.oilSpec?.oemApproval || '-'} / ${e.oilSpec?.aceaStandard || '-'}`;
          from.set(label, (from.get(label) || 0) + 1);
          snapshot.catalog.push({
            make: mk.makeName, model: md.modelName, generation: gen.genName,
            engineCode: e.engineCode, was: e.oilSpec,
          });
          if (APPLY) e.oilSpec = { ...e.oilSpec, ...SPEC };
        }
      }
    }
  }

  const ofvRows = (await prisma.oilFinderVehicle.findMany({ include: { oilSpec: true } }))
    .filter((r) => isTarget(r.engineCode) && specKey(r.oilSpec) !== specKey(SPEC));
  const veRows = (await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  })).filter((r) => isTarget(r.engineCode) && specKey(r.oilSpec) !== specKey(SPEC));

  console.log(`variantes sans FAP visees : ${NO_FAP.length} ecritures de code`);
  console.log(`vers : ${SPEC.viscosity} / ${SPEC.oemApproval} / ${SPEC.aceaStandard}\n`);
  for (const [k, n] of [...from].sort((a, b) => b[1] - a[1])) console.log(`  x${String(n).padStart(4)}  depuis  ${k}`);
  console.log(`\n${snapshot.catalog.length} catalogue, ${ofvRows.length} OilFinderVehicle, ${veRows.length} VehicleEngine`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  const specIdByFingerprint = new Map();
  const resolveSpecId = async (make) => {
    const fp = fingerprint(SPEC, make);
    let id = specIdByFingerprint.get(fp);
    if (!id) {
      const existing = await prisma.oilFinderOilSpec.findFirst({ where: { fingerprint: fp } });
      const row = existing ?? (await prisma.oilFinderOilSpec.create({ data: { ...SPEC, fingerprint: fp } }));
      id = row.id;
      specIdByFingerprint.set(fp, id);
    }
    return id;
  };

  for (const r of ofvRows) {
    snapshot.oilFinderVehicles.push({ id: r.id, make: r.make, engineCode: r.engineCode, was: r.oilSpecId });
    await prisma.oilFinderVehicle.update({
      where: { id: r.id }, data: { oilSpecId: await resolveSpecId(r.make.toUpperCase()) },
    });
  }
  for (const r of veRows) {
    const make = (r.generation?.model?.make?.name || '').toUpperCase();
    snapshot.vehicleEngines.push({ id: r.id, engineCode: r.engineCode, was: r.oilSpecId });
    await prisma.vehicleEngine.update({
      where: { id: r.id }, data: { oilSpecId: await resolveSpecId(make) },
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
