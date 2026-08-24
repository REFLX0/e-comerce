const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const lubes = await prisma.product.findMany({
    where: {
      OR: [
        { brand: { name: { in: ['Mannol', 'Liqui Moly', 'Motul', 'Castrol', 'TotalEnergies', 'Shell', 'Elf', 'Petronas', 'Yacco'] } } },
        { nameFr: { contains: '5W' } },
        { nameFr: { contains: '10W' } },
        { nameFr: { contains: '0W' } },
        { nameFr: { contains: '15W' } },
        { nameFr: { contains: '75W' } },
        { nameFr: { contains: '80W' } }
      ]
    },
    select: {
      id: true,
      nameFr: true,
      sku: true,
      brand: { select: { name: true } },
      variants: { select: { volume: true, skuVariant: true } }
    },
    take: 150
  })

  console.log(`Total lubricants found: ${lubes.length}`)
  console.log(JSON.stringify(lubes.map(o => ({
    name: o.nameFr,
    sku: o.sku,
    brand: o.brand?.name,
    variantSku: o.variants[0]?.skuVariant
  })), null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
