/**
 * Takes every unsourced particulate-filter assertion out of the approval field,
 * and fixes the four Mitsubishi rows that assertion was hiding.
 *
 * "Low-SAPS (FAP/DPF)" is not a manufacturer approval. It is a sentence about
 * equipment this dataset does not record, written into the field that is meant
 * to name a published specification, and it is on 807 rows — 344 of them with it
 * as the entire approval. The earlier pass only caught the trailing "(avec FAP)"
 * and "(sans FAP)" forms, so this whole class survived.
 *
 * The Mitsubishi 4M40-T shows why it matters rather than being merely untidy: a
 * 1994-1999 Pajero 2.8 TD was being given 5W-30 ACEA C3 because the row claimed
 * a filter. That engine is a mechanical indirect-injection diesel, no filter was
 * ever fitted to it, and Mitsubishi specifies API CD/CF on a 15W-40. The
 * assertion produced a wrong grade, not just a wrong sentence.
 *
 * Sixteen distinct strings carry a filter claim and each is listed explicitly
 * rather than matched by pattern, so the result is auditable: a real approval
 * keeps its name and loses only the claim appended to it, and a string that was
 * nothing but the claim leaves the field empty. The low-SAPS requirement itself
 * is not lost with it — that is what the ACEA C class on the same row states,
 * and it stays untouched.
 *
 * The one claim that stays is the Changan D20TCIE's, which is not an inference:
 * Changan's own overseas distributor deck lists the DPF three times, including a
 * forced-regeneration procedure, and instructs 5W-30 ACEA C4.
 *
 * Also in this pass, from the Mitsubishi review:
 *   - 4M40-T (all years) and 4M41 before 2006 return to 15W-40 ACEA B3/B4 API
 *     CF. Neither had a particulate filter; the 3.2 DI-D only got one on the
 *     later Pajero IV in some markets.
 *   - The model "I" is the i-MiEV. Its Y4F1 is a drive unit, not an engine, and
 *     it was being offered 10W-40 petrol oil. Marked electrique, as the Citroen
 *     and Peugeot rebadges of the same car already are.
 *   - The "3.2 Essence" row on the Pajero is deleted. The 3.2 is the 4M41
 *     diesel, this row called it petrol, its ACEA field held two incompatible
 *     classes at once ("A5/B5 / C2"), its approval was the placeholder "Asian
 *     OEM Standard", and it duplicated the real 4M41 entry.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/filter-assertions-snapshot-${Date.now()}.json`;

/**
 * Every approval string in the catalogue that mentions a filter, and what it
 * should say instead. null empties the field: those strings were only ever the
 * assertion. Keys are normalised (case, spacing, dash variants) so an em dash or
 * a double space cannot make a row slip through.
 */
const REWRITE = [
  ['Low-SAPS (FAP/DPF)', null],
  ['Low-SAPS (DPF)', null],
  ['Low-SAPS (FAP)', null],
  ['Low-SAPS (FAP/DPF) - Euro 6', null],
  ['Asian OEM C2/C3 DPF', null],
  ['Ford WSS-M2C913-D (Low-SAPS override - DPF safety)', 'Ford WSS-M2C913-D'],
  ['Ford WSS-M2C950-A (FAP)', 'Ford WSS-M2C950-A'],
  ['Mazda Dexelia / Low-SAPS (FAP/DPF)', 'Mazda Dexelia'],
  ['Honda HFE / Low-SAPS (FAP/DPF)', 'Honda HFE'],
  ['VW 507.00 (FAP)', 'VW 507.00'],
  ['Toyota LL-B (DPF)', 'Toyota LL-B'],
  ['Isuzu BESCO CLEAN / BESCO CLEAN SUPER (JASO DH-2) (Low-SAPS override - DPF safety)',
    'Isuzu BESCO CLEAN / BESCO CLEAN SUPER (JASO DH-2)'],
  ['Isuzu BESCO CLEAN (JASO DH-2, FAP/DPF)', 'Isuzu BESCO CLEAN (JASO DH-2)'],
  ['Great Wall OEM-specified engine oil (Low-SAPS override - DPF safety)',
    'Great Wall OEM-specified engine oil'],
  ['Volvo VCC 95200377 (Low-SAPS override - DPF safety)', 'Volvo VCC 95200377'],
];

/** Dashes, spacing and case vary between the stores; the meaning does not. */
const key = (s) => String(s || '')
  .replace(/[‐-―−]/g, '-')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const rewrites = new Map(REWRITE.map(([from, to]) => [key(from), to]));
const mentionsFilter = (s) => /\b(FAP|DPF)\b/i.test(String(s || ''));
/** Sourced, not inferred: keep it. */
const isSourced = (s) => /changan/i.test(String(s || ''));

/** The Mitsubishi diesels that never had a filter. */
const noFilterDiesel = (code, year) => {
  const c = String(code || '').toUpperCase();
  if (/^4M40/.test(c)) return true;
  if (/^4M41/.test(c)) return (year ?? 0) < 2006;
  return false;
};
const PRE_FILTER_DIESEL = {
  viscosity: '15W-40', apiStandard: 'CF', aceaStandard: 'B3/B4', oemApproval: null,
};

const IMIEV = (make, model, code) =>
  String(make).toUpperCase() === 'MITSUBISHI'
  && /^I$/i.test(String(model).trim())
  && /^Y4F1$/i.test(String(code || '').trim());

const JUNK_ROW = (make, code) =>
  String(make).toUpperCase() === 'MITSUBISHI' && /^3\.2\s*Essence$/i.test(String(code || '').trim());

const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`]
    .map(slugify).join('_');

/** The oil spec a row should end on, or undefined to leave it. */
function wantedSpec(code, year, spec) {
  if (noFilterDiesel(code, year)) return { ...spec, ...PRE_FILTER_DIESEL };
  const a = spec?.oemApproval;
  if (!mentionsFilter(a) || isSourced(a)) return undefined;
  if (!rewrites.has(key(a))) return undefined; // unknown string: reported, not guessed at
  return { ...spec, oemApproval: rewrites.get(key(a)) };
}

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { catalog: [], deleted: [], electric: [], oilFinderVehicles: [], vehicleEngines: [] };
  const moves = new Map();
  const unknown = new Map();
  let deleted = 0; let electric = 0;

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        const keep = [];
        for (const e of gen.engines || []) {
          if (JUNK_ROW(mk.makeName, e.engineCode)) {
            deleted++;
            snapshot.deleted.push({ make: mk.makeName, model: md.modelName, generation: gen.genName, engine: e });
            if (APPLY) continue; // dropped
            keep.push(e);
            continue;
          }
          if (IMIEV(mk.makeName, md.modelName, e.engineCode) && e.fuelType !== 'electrique') {
            electric++;
            snapshot.electric.push({ make: mk.makeName, model: md.modelName, generation: gen.genName, engineCode: e.engineCode, was: e.fuelType });
            if (APPLY) e.fuelType = 'electrique';
          }
          const year = e.yearFrom ?? gen.yearFrom ?? null;
          const want = wantedSpec(e.engineCode, year, e.oilSpec);
          if (want) {
            const k = `${e.oilSpec?.viscosity} ${e.oilSpec?.oemApproval || '-'}  ->  ${want.viscosity} ${want.oemApproval || '(vide)'}`;
            moves.set(k, (moves.get(k) || 0) + 1);
            snapshot.catalog.push({
              make: mk.makeName, model: md.modelName, generation: gen.genName,
              engineCode: e.engineCode, was: e.oilSpec,
            });
            if (APPLY) e.oilSpec = { ...e.oilSpec, ...want };
          } else if (mentionsFilter(e.oilSpec?.oemApproval) && !isSourced(e.oilSpec?.oemApproval)) {
            unknown.set(e.oilSpec.oemApproval, (unknown.get(e.oilSpec.oemApproval) || 0) + 1);
          }
          keep.push(e);
        }
        if (APPLY) gen.engines = keep;
      }
    }
  }

  const ofvRows = (await prisma.oilFinderVehicle.findMany({ include: { oilSpec: true } }))
    .map((r) => ({ r, want: wantedSpec(r.engineCode, r.yearFrom, r.oilSpec) }))
    .filter(({ want }) => want);
  const veRows = (await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  })).map((r) => ({
    r, make: r.generation?.model?.make?.name || '',
    want: wantedSpec(r.engineCode, r.generation?.yearFrom, r.oilSpec),
  })).filter(({ want }) => want);

  for (const [k, n] of [...moves].sort((a, b) => b[1] - a[1])) console.log(`  x${String(n).padStart(4)}  ${k}`);
  console.log(`\n${snapshot.catalog.length} specs catalogue, ${ofvRows.length} OilFinderVehicle, ${veRows.length} VehicleEngine`);
  console.log(`i-MiEV marque electrique : ${electric} | ligne "3.2 Essence" supprimee : ${deleted}`);
  if (unknown.size) {
    console.log('\nmentions de filtre non reconnues, laissees en place :');
    for (const [k, n] of unknown) console.log(`  x${n}  ${k}`);
  }

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  const specIdByFingerprint = new Map();
  const SPEC_FIELDS = ['viscosity', 'apiStandard', 'aceaStandard', 'oemApproval',
    'jasoStandard', 'capacityLiters', 'changeIntervalKm'];
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

  // the i-MiEV and the junk row in the database too
  const imiev = await prisma.oilFinderVehicle.findMany({
    where: { make: { equals: 'MITSUBISHI', mode: 'insensitive' }, engineCode: { equals: 'Y4F1', mode: 'insensitive' } },
  });
  for (const r of imiev) {
    if (r.fuelType === 'electrique') continue;
    snapshot.electric.push({ store: 'OilFinderVehicle', id: r.id, was: r.fuelType });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { fuelType: 'electrique' } });
  }
  const junk = await prisma.oilFinderVehicle.findMany({
    where: { make: { equals: 'MITSUBISHI', mode: 'insensitive' }, engineCode: { contains: '3.2 Essence', mode: 'insensitive' } },
  });
  for (const r of junk) {
    snapshot.deleted.push({ store: 'OilFinderVehicle', row: r });
    await prisma.oilFinderVehicle.delete({ where: { id: r.id } });
  }
  console.log(`base : ${imiev.length} ligne(s) i-MiEV, ${junk.length} ligne(s) "3.2 Essence" supprimee(s)`);

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur : /app n est pas persistant)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
