/**
 * Corrects two scooter classifications that the first pass got wrong.
 *
 * Piaggio and Vespa were given JASO MB on the reasoning that a CVT scooter has
 * no wet clutch. That is not true of these: they run an oil-bathed centrifugal
 * clutch, and Piaggio's own workshop manual and the Vespa GTS 300 HPE manual
 * both call for JASO MA. The researched rows in the database already said so —
 * it was their Title-Case duplicates, which had no rating at all, that the first
 * pass filled in wrongly. MB is the dangerous direction here, so this matters.
 *
 * Suzuki's Access 125 and Burgman Street 125 kept 0W-20 ILSAC GF-5. The earlier
 * fix set them to 10W-30 and was then overwritten in the same run by the
 * JASO pass, which was working from a snapshot taken before it.
 *
 * Runs read-only unless --apply is passed.
 */
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');

async function main() {
  const prisma = new PrismaClient();

  const piaggio = await prisma.oilFinderVehicle.findMany({
    where: {
      category: 'moto',
      OR: [
        { make: { equals: 'PIAGGIO', mode: 'insensitive' } },
        { make: { equals: 'VESPA', mode: 'insensitive' } },
      ],
    },
    include: { oilSpec: true },
  });
  const wrongMb = piaggio.filter((r) => r.oilSpec?.jasoStandard === 'MB');

  const suzuki = await prisma.oilFinderVehicle.findMany({
    where: {
      category: 'moto',
      OR: [{ model: { contains: 'Access' } }, { model: { contains: 'Burgman Street' } }],
    },
    include: { oilSpec: true },
  });
  const wrongVisc = suzuki.filter((r) => r.oilSpec?.viscosity !== '10W-30');

  console.log(`Piaggio/Vespa rows on JASO MB (should be MA): ${wrongMb.length}`);
  wrongMb.forEach((r) => console.log(`   ${r.make} ${r.model}  ${r.oilSpec.viscosity} MB -> MA`));
  console.log(`\nSuzuki scooters still on a car viscosity: ${wrongVisc.length}`);
  wrongVisc.forEach((r) => console.log(`   ${r.make} ${r.model}  ${r.oilSpec.viscosity} ${r.oilSpec.oemApproval || ''} -> 10W-30 JASO MB`));

  if (!APPLY) { console.log('\nNothing written. Re-run with --apply.'); await prisma.$disconnect(); return; }

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
  for (const r of wrongMb) {
    const spec = await specFor(r.oilSpec, {
      jasoStandard: 'MA',
      oemApproval: 'JASO MA (embrayage centrifuge a bain d huile - Piaggio/Vespa)',
    });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { oilSpecId: spec.id } });
    n++;
  }
  for (const r of wrongVisc) {
    const spec = await specFor(r.oilSpec, {
      viscosity: '10W-30', apiStandard: 'SL', aceaStandard: null, capacityLiters: 1.0,
      jasoStandard: 'MB', oemApproval: 'JASO MB (scooter CVT)',
    });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { oilSpecId: spec.id } });
    n++;
  }
  console.log(`\nUpdated ${n} row(s).`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
