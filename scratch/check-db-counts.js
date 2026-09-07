const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const makes = await prisma.vehicleMake.count();
    const models = await prisma.vehicleModel.count();
    const gens = await prisma.vehicleGeneration.count();
    const engs = await prisma.vehicleEngine.count();
    console.log('Postgres counts:', { makes, models, gens, engs });
  } catch(e) {
    console.log('Postgres connection status:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
check();
