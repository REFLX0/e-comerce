/**
 * Two-stroke cars do not take engine oil, and the catalogue was selling it to them.
 *
 * Nothing in this dataset knew about two-stroke engines — every row, in every
 * category, was treated as a four-stroke with a sump and a drain interval. For
 * the motorcycles that turned out to be harmless, because the whole moto range
 * here is four-stroke and already carries JASO MA, MA2 or MB. For a handful of
 * classic cars it is not: a Trabant P 601 was being recommended 20W-50, and it
 * has no oil change at all. Its oil goes in the fuel at 1:50.
 *
 * The list is per model, and where a nameplate spans both kinds, per
 * displacement — because several of these cars were re-engined at the end of
 * their lives and the later engine really is a four-stroke that really does
 * take 20W-50:
 *
 *   Trabant     P 601 two-stroke; the 1.1 is a VW four-stroke and is left alone
 *   Wartburg    353 1000 cc two-stroke; the 1300 is the VW four-stroke
 *   Barkas      B 1000 at 1000 cc two-stroke; the 1300 is the VW four-stroke
 *   Lloyd       LP/LC/LK/LS up to 400 cc two-stroke; the 600 is a four-stroke boxer
 *   Glas        Goggomobil two-stroke; the Isar, 04, GT, V and 1700 are not
 *   Auto Union  every model — DKW built nothing but two-strokes
 *   Zuendapp    Janus
 *
 * Deliberately not included: the Puch G-Modell, which is a Mercedes G with a
 * four-stroke engine and would have been caught by any rule written on the
 * marque rather than the model.
 *
 * What replaces the viscosity is not another viscosity. A two-stroke takes
 * API TC / JASO FB two-stroke oil mixed into the petrol, so the grade field
 * says 2T and the approval says what to do with it.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/two-stroke-snapshot-${Date.now()}.json`;

/** make -> model test, plus an optional displacement ceiling for mixed nameplates. */
const TWO_STROKE = [
  { make: 'AUTO UNION', model: /./ },
  { make: 'TRABANT', model: /^p\s?601/i },
  { make: 'WARTBURG', model: /^353/, maxCc: 1000 },
  { make: 'BARKAS', model: /^b\s?1000/i, maxCc: 1000 },
  { make: 'LLOYD', model: /^l[ckps]$/i, maxCc: 400 },
  { make: 'GLAS', model: /^goggomobil/i },
  { make: 'ZUENDAPP', model: /^janus/i },
];

const SPEC = {
  viscosity: '2T',
  apiStandard: 'TC',
  aceaStandard: null,
  oemApproval: 'Huile deux-temps, melange 1:50 — pas de vidange moteur',
  jasoStandard: 'FB',
  capacityLiters: null,
  changeIntervalKm: null,
};

const matches = (make, model, cc) => TWO_STROKE.some((t) => {
  if (String(make).toUpperCase() !== t.make) return false;
  if (!t.model.test(String(model).trim())) return false;
  if (t.maxCc != null && cc != null && cc > t.maxCc) return false;
  return true;
});

const FIELDS = Object.keys(SPEC);
const specKey = (s) => FIELDS.map((k) => s?.[k] ?? '-').join('|');

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
  const lines = [];

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          if (!matches(mk.makeName, md.modelName, e.displacementCc)) continue;
          if (specKey(e.oilSpec) === specKey(SPEC)) continue;
          lines.push(`${mk.makeName.padEnd(12)} ${String(md.modelName).padEnd(28)} ${String(e.displacementCc ?? '?').padStart(5)}cc  ${e.oilSpec?.viscosity ?? '-'} -> 2T`);
          snapshot.catalog.push({
            make: mk.makeName, model: md.modelName, generation: gen.genName,
            engineCode: e.engineCode, was: e.oilSpec,
          });
          if (APPLY) e.oilSpec = { ...e.oilSpec, ...SPEC };
        }
      }
    }
  }

  lines.forEach((l) => console.log('  ' + l));
  console.log(`\ncatalogue : ${snapshot.catalog.length} motorisation(s)`);

  const ofv = (await prisma.oilFinderVehicle.findMany({ include: { oilSpec: true } }))
    .filter((r) => matches(r.make, r.model, r.displacementCc) && specKey(r.oilSpec) !== specKey(SPEC));
  const ve = (await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  })).filter((r) => matches(r.generation?.model?.make?.name, r.generation?.model?.name, r.displacementCc)
    && specKey(r.oilSpec) !== specKey(SPEC));
  console.log(`base      : ${ofv.length} OilFinderVehicle, ${ve.length} VehicleEngine`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  const cache = new Map();
  const resolveSpecId = async (make) => {
    const fp = fingerprint(SPEC, make);
    if (cache.has(fp)) return cache.get(fp);
    const existing = await prisma.oilFinderOilSpec.findFirst({ where: { fingerprint: fp } });
    const row = existing ?? (await prisma.oilFinderOilSpec.create({ data: { ...SPEC, fingerprint: fp } }));
    cache.set(fp, row.id);
    return row.id;
  };

  for (const r of ofv) {
    snapshot.oilFinderVehicles.push({ id: r.id, make: r.make, model: r.model, was: r.oilSpecId });
    await prisma.oilFinderVehicle.update({
      where: { id: r.id }, data: { oilSpecId: await resolveSpecId(String(r.make).toUpperCase()) },
    });
  }
  for (const r of ve) {
    const make = String(r.generation?.model?.make?.name || '').toUpperCase();
    snapshot.vehicleEngines.push({ id: r.id, engineCode: r.engineCode, was: r.oilSpecId });
    await prisma.vehicleEngine.update({
      where: { id: r.id }, data: { oilSpecId: await resolveSpecId(make) },
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
