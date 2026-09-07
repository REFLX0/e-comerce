const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../backend/.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

const { PrismaClient } = require(path.join(__dirname, '../backend/node_modules/@prisma/client'));

async function test() {
  console.log('DATABASE_URL is:', process.env.DATABASE_URL);
  const prisma = new PrismaClient();
  try {
    const makeCount = await prisma.vehicleMake.count();
    console.log('VehicleMake count:', makeCount);
    const modelCount = await prisma.vehicleModel.count();
    console.log('VehicleModel count:', modelCount);
  } catch (err) {
    console.error('Error querying Prisma:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
