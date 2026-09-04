const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const q = 'mannol';
  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [
        { nameFr: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { brand: { name: { contains: q, mode: 'insensitive' } } },
        { description: { contains: q, mode: 'insensitive' } }
      ]
    },
    include: { brand: true }
  });
  console.log('Postgres search found:', products.length, 'products');
  if (products.length > 0) {
    console.log('First product:', products[0].nameFr, 'Brand:', products[0].brand?.name);
  } else {
    // maybe there are no products with brand 'mannol'?
    const brands = await prisma.brand.findMany({ where: { name: { contains: 'mannol', mode: 'insensitive' } } });
    console.log('Brands found:', brands.map(b => b.name));
    if (brands.length > 0) {
      const prodsWithBrand = await prisma.product.count({ where: { brandId: brands[0].id } });
      console.log('Products with this brand:', prodsWithBrand);
    }
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
