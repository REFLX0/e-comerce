const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const compCount = await prisma.vehicleCompatibility.count();
  const makeCount = await prisma.vehicleMake.count();
  const modelCount = await prisma.vehicleModel.count();
  
  console.log('VehicleMake:', makeCount);
  console.log('VehicleModel:', modelCount);
  console.log('VehicleCompatibility:', compCount);
}

main().finally(() => prisma.$disconnect());
