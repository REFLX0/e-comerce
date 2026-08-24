const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function audit() {
  const total = await prisma.product.count()
  const totalVariants = await prisma.productVariant.count()
  
  // 1. Any AUTO- SKUs
  const autoSkus = await prisma.product.count({ where: { sku: { contains: 'AUTO-' } } })
  const autoVariants = await prisma.productVariant.count({ where: { skuVariant: { contains: 'AUTO-' } } })

  // 2. Any PRICE-TBD or placeholder SKUs
  const tbdSkus = await prisma.product.count({ where: { sku: { contains: 'PRICE-TBD' } } })

  // 3. Any null or empty SKUs
  const emptySkus = await prisma.product.count({ where: { sku: '' } })

  // 4. Inspect SKUs across different product types/brands
  const brandSamples = await prisma.brand.findMany({
    select: {
      name: true,
      products: {
        select: {
          nameFr: true,
          sku: true,
          variants: { select: { volume: true, skuVariant: true } }
        },
        take: 2
      }
    },
    take: 25
  })

  // 5. Look for any suspicious long string SKUs (> 40 chars)
  const allProducts = await prisma.product.findMany({
    select: { id: true, nameFr: true, sku: true, brand: { select: { name: true } } }
  })

  const suspiciousSkus = allProducts.filter(p => p.sku.length > 35 || p.sku.includes('LIQUIDE') || p.sku.includes('HUILE') || p.sku.includes('REFROID'))

  console.log(JSON.stringify({
    totalProducts: total,
    totalVariants: totalVariants,
    autoSkusCount: autoSkus,
    autoVariantsCount: autoVariants,
    tbdSkusCount: tbdSkus,
    emptySkusCount: emptySkus,
    suspiciousSkusCount: suspiciousSkus.length,
    suspiciousSample: suspiciousSkus.slice(0, 10),
    brandSamples: brandSamples.filter(b => b.products.length > 0).map(b => ({
      brand: b.name,
      sampleProduct: b.products[0]?.nameFr,
      sku: b.products[0]?.sku,
      variantSku: b.products[0]?.variants[0]?.skuVariant
    }))
  }, null, 2))
}

audit()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
