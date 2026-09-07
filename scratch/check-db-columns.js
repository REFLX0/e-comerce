process.env.DATABASE_URL = "postgresql://kiosquetn:kiosquetn_local_secret@localhost:5433/kiosquetn?schema=public";
const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name IN ('Product', 'ProductVariant', 'ProductImage', 'ProductSpecs', 'Brand', 'Category', 'VehicleCompatibility', 'Review')
      ORDER BY table_name, ordinal_position;
    `);
    console.log('Columns in DB (' + cols.length + ' columns found):');
    cols.forEach(c => console.log('  ' + c.table_name + ' -> ' + c.column_name + ' (' + c.data_type + ')'));

    console.log('\nTesting prisma.product.findFirst():');
    const p = await prisma.product.findFirst({
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: {
            volume: { not: { startsWith: '[ARCHIVED]' } }
          }
        },
        specs: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
        compatibilities: {
          include: { vehicleModel: { include: { make: true } } },
        },
      }
    });
    console.log('Product findFirst result:', p ? p.slug : 'No product found');
  } catch (err) {
    console.error('ERROR during test:');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
