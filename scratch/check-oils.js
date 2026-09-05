const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../backend/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function run() {
  console.log('--- SEARCHING FOR VW OILS ---');
  const vwProducts = await prisma.product.findMany({
    where: {
      OR: [
        { nameFr: { contains: '504', mode: 'insensitive' } },
        { nameFr: { contains: '507', mode: 'insensitive' } },
        { description: { contains: '504 00', mode: 'insensitive' } },
        { description: { contains: '507 00', mode: 'insensitive' } },
        { specs: { OEMApprovals: { contains: '504', mode: 'insensitive' } } },
        { specs: { OEMApprovals: { contains: '507', mode: 'insensitive' } } },
        { specs: { OEMApprovals: { contains: 'VW', mode: 'insensitive' } } },
      ]
    },
    include: { specs: true, brand: true },
    take: 15
  });
  console.log(`Found ${vwProducts.length} VW products:`);
  for (const p of vwProducts) {
    console.log(`- [${p.brand?.name}] ${p.nameFr}`);
    console.log(`  visc: ${p.specs?.viscosity} | oem: ${p.specs?.OEMApprovals} | api: ${p.specs?.apiStandard} | acea: ${p.specs?.aeceaStandard}`);
  }

  console.log('\n--- SEARCHING FOR BMW OILS ---');
  const bmwProducts = await prisma.product.findMany({
    where: {
      OR: [
        { nameFr: { contains: 'LL-04', mode: 'insensitive' } },
        { nameFr: { contains: 'Longlife', mode: 'insensitive' } },
        { description: { contains: 'LL-04', mode: 'insensitive' } },
        { specs: { OEMApprovals: { contains: 'LL-04', mode: 'insensitive' } } },
        { specs: { OEMApprovals: { contains: 'BMW', mode: 'insensitive' } } },
        { specs: { OEMApprovals: { contains: 'Longlife-04', mode: 'insensitive' } } },
      ]
    },
    include: { specs: true, brand: true },
    take: 15
  });
  console.log(`Found ${bmwProducts.length} BMW products:`);
  for (const p of bmwProducts) {
    console.log(`- [${p.brand?.name}] ${p.nameFr}`);
    console.log(`  visc: ${p.specs?.viscosity} | oem: ${p.specs?.OEMApprovals} | api: ${p.specs?.apiStandard} | acea: ${p.specs?.aeceaStandard}`);
  }

  console.log('\n--- SEARCHING OIL FINDER VEHICLES FOR VW ---');
  const vwVehicles = await prisma.oilFinderVehicle.findMany({
    where: { make: { equals: 'VOLKSWAGEN', mode: 'insensitive' } },
    include: { oilSpec: true },
    take: 5
  });
  console.log(`Found ${vwVehicles.length} VW vehicles:`);
  for (const v of vwVehicles) {
    console.log(`- ${v.make} ${v.model} (${v.engineCode}) -> spec: ${v.oilSpec?.viscosity} ${v.oilSpec?.oemApproval}`);
  }

  console.log('\n--- SEARCHING OIL FINDER VEHICLES FOR BMW ---');
  const bmwVehicles = await prisma.oilFinderVehicle.findMany({
    where: { make: { equals: 'BMW', mode: 'insensitive' } },
    include: { oilSpec: true },
    take: 5
  });
  console.log(`Found ${bmwVehicles.length} BMW vehicles:`);
  for (const v of bmwVehicles) {
    console.log(`- ${v.make} ${v.model} (${v.engineCode}) -> spec: ${v.oilSpec?.viscosity} ${v.oilSpec?.oemApproval}`);
  }

  await prisma.$disconnect();
}

run().catch(console.error);
