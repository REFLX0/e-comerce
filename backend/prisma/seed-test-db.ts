import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing test data
  await prisma.vehicleCompatibility.deleteMany()
  await prisma.vehicleModel.deleteMany()
  await prisma.vehicleMake.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productSpecs.deleteMany()
  await prisma.product.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()

  // Categories (minimal)
  const cAuto = await prisma.category.create({ data: { nameFr: 'Automobile', slug: 'automobile' } })
  const cAutoSynth = await prisma.category.create({ data: { nameFr: '100% Synthèse', slug: 'auto-synthese', parentId: cAuto.id } })
  const cAutoSemi = await prisma.category.create({ data: { nameFr: 'Semi-Synthèse', slug: 'auto-semi', parentId: cAuto.id } })
  const cAutoMin = await prisma.category.create({ data: { nameFr: 'Minérale', slug: 'auto-minerale', parentId: cAuto.id } })

  // Brands
  const yacco = await prisma.brand.create({ data: { name: 'Yacco', slug: 'yacco' } })
  const shell = await prisma.brand.create({ data: { name: 'Shell', slug: 'shell' } })
  const total = await prisma.brand.create({ data: { name: 'TotalEnergies', slug: 'totalenergies' } })
  const castrol = await prisma.brand.create({ data: { name: 'Castrol', slug: 'castrol' } })
  const bosch = await prisma.brand.create({ data: { name: 'Bosch', slug: 'bosch' } })

  // Products matching the real SKUs
  const products = [
    { name: 'Yacco Lube DI 0W-20 C6', sku: 'YAC-0W20', brandId: yacco.id, categoryId: cAutoSynth.id, price: 22.5 },
    { name: 'Shell Helix Ultra 5W-40', sku: 'SHL-5W40-U', brandId: shell.id, categoryId: cAutoSynth.id, price: 18.0 },
    { name: 'Total Quartz 7000 10W-40', sku: 'TOT-10W40-Q7', brandId: total.id, categoryId: cAutoSemi.id, price: 12.0 },
    { name: 'Castrol Edge 5W-30 LL', sku: 'CAS-5W30-EDGE', brandId: castrol.id, categoryId: cAutoSynth.id, price: 20.0 },
    { name: 'Filtre à Huile Bosch P3045', sku: 'BOSCH-P3045', brandId: bosch.id, categoryId: cAutoMin.id, price: 15.0 },
  ]

  for (const p of products) {
    await prisma.product.create({
      data: {
        nameFr: p.name,
        slug: p.sku.toLowerCase().replace(/_/g, '-'),
        sku: p.sku,
        description: p.name,
        brandId: p.brandId,
        categoryId: p.categoryId,
        isPublished: true,
        variants: { create: [{ volume: '1L', price: p.price, stockQty: 50, skuVariant: p.sku + '-1L' }] },
        images: { create: [{ url: '/img/product.png', isPrimary: true }] },
      },
    })
  }

  // Also create the 15 standard oils
  const catMin = await prisma.category.findUniqueOrThrow({ where: { slug: 'auto-minerale' } })
  for (let i = 1; i <= 15; i++) {
    await prisma.product.create({
      data: {
        nameFr: `Huile Standard V${i} 15W-40`,
        slug: `huile-standard-v${i}`,
        sku: `STD-15W40-V${i}`,
        description: `Huile standard V${i}`,
        brandId: total.id,
        categoryId: catMin.id,
        isPublished: true,
        variants: { create: [{ volume: '5L', price: 35.0, stockQty: 20, skuVariant: `STD-15W40-V${i}-5L` }] },
        images: { create: [{ url: '/img/product.png', isPrimary: true }] },
      },
    })
  }

  console.log('Test DB seeded: 5 branded products + 15 standard oils')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
