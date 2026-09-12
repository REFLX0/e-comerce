/**
 * Fills in the rating that actually matters for two-wheelers and outboards, and
 * fixes two vehicles that were given the wrong kind of oil entirely.
 *
 * JASO is the part a motorcycle owner needs. A manual bike runs its clutch in
 * the engine oil, so it needs JASO MA/MA2 — an oil WITHOUT the friction
 * modifiers that make a clutch slip. A CVT scooter has no wet clutch and takes
 * JASO MB. 68 rows carried a viscosity and no rating at all.
 *
 * Where a model could not be classified with confidence it is given MA, not MB.
 * The asymmetry is deliberate: MA in a scooter is harmless, MB in a wet clutch
 * is not.
 *
 * Two outright errors:
 *  - Suzuki's Access 125 and Burgman Street 125 were on 0W-20 ILSAC GF-5, a car
 *    specification. Their engine is recorded as "K15B", which is a Suzuki *car*
 *    engine code, so the per-engine Suzuki table matched them and applied the
 *    Boosterjet figures to a 125 cc scooter.
 *  - The Piaggio M500 was filed as a motorcycle. It is the Porter M500, a light
 *    commercial with a Lombardini LDW502 diesel.
 *
 * Marine rows already name the manufacturer's own oil (Yamalube 4M, Mercury
 * 4-Stroke, ECSTAR V7000), all of which are NMMA FC-W certified; this states it
 * so the customer can match it on the shelf. Yanmar is excluded — those are
 * marine diesels, and FC-W is a four-stroke petrol standard.
 *
 * Runs read-only unless --apply is passed.
 */
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');

/** CVT scooters: no wet clutch, so JASO MB. */
const SCOOTER = [
  /^PCX/i, /^SH\d/i, /^AK$/i, /^Agility/i, /^DT$/i, /^Like/i,
  /^Beverly/i, /^Liberty/i, /^Medley/i, /^GTS/i, /^Primavera/i, /^Sprint/i,
  /^Aerox/i, /^NMax/i, /^Fascino/i, /^RayZR/i, /^Jet/i, /^Symphony/i,
  /^Access/i, /^Burgman/i,
];

/** Everything else with a manual gearbox runs a wet clutch: JASO MA2. */
const MANUAL = [
  /^RS$/i, /^Tuono/i, /NK$/i, /^800MT/i, /^KLX/i, /^Ninja/i, /^Versys/i,
  /^Z\d/i, /^390$/i, /^790$/i, /^890$/i, /^Duke/i, /^V7$/i, /^V85/i,
  /^MT-\d/i, /^Tenere/i, /^Teneré/i, /^Tracer/i, /^WR\d/i, /^XSR/i, /^YZF/i,
  /^350T/i, /^G125/i, /^R310/i, /^Série SK/i, /^V-Strom/i, /^NH-T/i,
];

const classify = (model) => {
  if (SCOOTER.some((r) => r.test(model))) return 'MB';
  if (MANUAL.some((r) => r.test(model))) return 'MA2';
  // Unclassified: MA is safe in a scooter, MB is not safe in a wet clutch.
  return 'MA';
};

async function main() {
  const prisma = new PrismaClient();
  const planned = [];

  // ── 1. the two wrong-oil cases ───────────────────────────────────────────
  const scooterOnCarOil = await prisma.oilFinderVehicle.findMany({
    where: { category: 'moto', OR: [{ model: { contains: 'Access' } }, { model: { contains: 'Burgman Street' } }] },
    include: { oilSpec: true },
  });
  const m500 = await prisma.oilFinderVehicle.findMany({
    where: { model: { equals: 'M500', mode: 'insensitive' } },
    include: { oilSpec: true },
  });

  // ── 2. moto rows with no JASO rating ─────────────────────────────────────
  const motoRows = await prisma.oilFinderVehicle.findMany({
    where: { category: 'moto' },
    include: { oilSpec: true },
  });
  const needJaso = motoRows.filter(
    (r) => (!r.oilSpec?.jasoStandard || r.oilSpec.jasoStandard === '') && !/^M500$/i.test(r.model),
  );

  // ── 3. marine four-stroke petrol outboards ───────────────────────────────
  const marineRows = await prisma.oilFinderVehicle.findMany({
    where: { category: 'marine' },
    include: { oilSpec: true },
  });
  const needFcw = marineRows.filter(
    (r) => !/NMMA|FC-W|TC-W/i.test(r.oilSpec?.oemApproval || '') && !/^YANMAR$/i.test(r.make),
  );

  console.log(`scooters on a car specification: ${scooterOnCarOil.length}`);
  scooterOnCarOil.forEach((r) => console.log(`   ${r.make} ${r.model}  ${r.oilSpec?.viscosity} ${r.oilSpec?.oemApproval || ''}`));
  console.log(`\nPiaggio M500 rows mis-filed as a motorcycle: ${m500.length}`);
  m500.forEach((r) => console.log(`   ${r.make} ${r.model} [${r.engineCode}] category=${r.category} fuel=${r.fuelType}`));
  console.log(`\nmoto rows needing a JASO rating: ${needJaso.length}`);
  const byRating = new Map();
  for (const r of needJaso) {
    const j = classify(r.model);
    byRating.set(j, (byRating.get(j) || 0) + 1);
  }
  [...byRating.entries()].sort().forEach(([k, v]) => console.log(`   JASO ${k}: ${v}`));
  console.log(`   sample: ${needJaso.slice(0, 6).map((r) => `${r.model}->${classify(r.model)}`).join(', ')}`);
  console.log(`\nmarine rows to state NMMA FC-W on: ${needFcw.length}`);

  if (!APPLY) { console.log('\nNothing written. Re-run with --apply.'); await prisma.$disconnect(); return; }

  // Specs are shared by fingerprint, so never edit one in place — resolve or
  // create the spec each row should point at instead.
  const specFor = async (base, patch) => {
    const data = { ...base, ...patch };
    delete data.id;
    delete data.fingerprint;
    const fp = [data.viscosity, data.oemApproval || 'generic', data.aceaStandard || 'std',
      data.apiStandard || 'anyapi', data.jasoStandard || 'nojaso', `cap${data.capacityLiters ?? 'na'}`]
      .map((x) => String(x).toLowerCase().replace(/[^a-z0-9]+/g, '-')).join('_');
    const existing = await prisma.oilFinderOilSpec.findFirst({ where: { fingerprint: fp } });
    return existing ?? (await prisma.oilFinderOilSpec.create({ data: { ...data, fingerprint: fp } }));
  };

  let n = 0;
  for (const r of scooterOnCarOil) {
    const spec = await specFor(r.oilSpec, {
      viscosity: '10W-30', apiStandard: 'SL', aceaStandard: null,
      jasoStandard: 'MB', oemApproval: 'JASO MB (scooter CVT, pas d embrayage humide)',
      capacityLiters: 1.0,
    });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { oilSpecId: spec.id } });
    n++;
  }
  for (const r of m500) {
    const spec = await specFor(r.oilSpec, {
      viscosity: '15W-40', apiStandard: 'CF', aceaStandard: 'B3/B4',
      jasoStandard: null, oemApproval: 'Lombardini LDW502 (diesel)', capacityLiters: 2.4,
    });
    await prisma.oilFinderVehicle.update({
      where: { id: r.id },
      data: { oilSpecId: spec.id, category: 'poids-lourd', fuelType: 'diesel' },
    });
    n++;
  }
  for (const r of needJaso) {
    const j = classify(r.model);
    const note = j === 'MB'
      ? 'JASO MB (scooter CVT, pas d embrayage humide)'
      : `JASO ${j} (embrayage humide - sans modificateurs de friction)`;
    const spec = await specFor(r.oilSpec, { jasoStandard: j, oemApproval: r.oilSpec?.oemApproval || note });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { oilSpecId: spec.id } });
    n++;
  }
  for (const r of needFcw) {
    const oem = r.oilSpec?.oemApproval
      ? `${r.oilSpec.oemApproval} (NMMA FC-W)`
      : 'NMMA FC-W';
    const spec = await specFor(r.oilSpec, { oemApproval: oem });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { oilSpecId: spec.id } });
    n++;
  }
  console.log(`\nUpdated ${n} row(s).`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
