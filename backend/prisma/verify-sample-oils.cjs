const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verify() {
  const lubes = await prisma.product.findMany({
    where: { brand: { name: { in: ['Mannol', 'Liqui Moly', 'Motul', 'TotalEnergies', 'Castrol', 'Rowe', 'Champion Lubricants'] } } },
    select: { nameFr: true, sku: true, brand: { select: { name: true } }, variants: { select: { skuVariant: true } } },
    take: 20
  })
  console.log('Sample Lube SKUs:', JSON.stringify(lubes, null, 2))
}

verify().catch(console.error).finally(() => prisma.$disconnect())
