const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.oilFinderVehicle.count();
  const groups = await prisma.oilFinderVehicle.groupBy({
    by: ['source'],
    _count: { id: true },
  });
  console.log('TOTAL DB VEHICLES:', count);
  console.table(groups);
}

main().finally(() => prisma.$disconnect());
