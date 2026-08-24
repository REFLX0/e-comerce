const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function generateSmartSku(p) {
  const brand = (p.brand?.name || '').toUpperCase()
  let prefix = 'REF'
  if (brand.includes('MANNOL')) prefix = 'MN'
  else if (brand.includes('LIQUI MOLY') || brand.includes('LIQUIMOLY')) prefix = 'LM'
  else if (brand.includes('OSRAM')) prefix = 'OSR'
  else if (brand.includes('MOTUL')) prefix = 'MOT'
  else if (brand.includes('CASTROL')) prefix = 'CAS'
  else if (brand.includes('TOTAL')) prefix = 'TOT'

  const slug = p.slug.toLowerCase().replace(/^(liqui-moly|mannol|osram|motul)-/i, '')
  const parts = slug.split(/[-_]+/).filter(Boolean)

  // Extract viscosity if present
  const visc = parts.find(w => /^\d+w\d*$/i.test(w))
  // Extract volume if present
  const vol = parts.find(w => /^\d+(\.\d+)?(l|ml)$/i.test(w))
  
  // Significant keywords
  const keywords = parts.filter(w => w !== visc && w !== vol && !['de', 'du', 'des', 'le', 'la', 'pour', 'a', 'et', 'huile', 'moto', 'temps'].includes(w))
  const keyPart = keywords.slice(0, 3).map(k => k.toUpperCase()).join('-')

  let sku = prefix
  if (keyPart) sku += `-${keyPart}`
  if (visc) sku += `-${visc.toUpperCase()}`
  if (vol) sku += `-${vol.toUpperCase()}`

  return sku
}

async function fixSuspicious() {
  const allProducts = await prisma.product.findMany({
    include: { brand: true, variants: true }
  })

  const existingSkus = new Set(allProducts.map(p => p.sku))

  const suspicious = allProducts.filter(p => 
    p.sku.length > 25 || 
    p.sku.startsWith('AUTO-') || 
    p.sku.endsWith('-') || 
    p.sku.includes('LIQUIDE') || 
    p.sku.includes('HUILE') || 
    p.sku.includes('REFROID') ||
    p.sku.includes('LIQUI-MOLY-') ||
    p.sku.includes('MANNOL-')
  )

  console.log(`Found ${suspicious.length} remaining SKUs to clean...`)

  for (const p of suspicious) {
    existingSkus.delete(p.sku)
    let candidateSku = generateSmartSku(p)
    let finalSku = candidateSku
    let counter = 1

    while (existingSkus.has(finalSku)) {
      finalSku = `${candidateSku}-${counter}`
      counter++
    }

    existingSkus.add(finalSku)
    console.log(`Updating ${p.sku} -> ${finalSku} (${p.nameFr})`)

    await prisma.product.update({
      where: { id: p.id },
      data: { sku: finalSku }
    })

    for (const v of p.variants) {
      const vol = v.volume && v.volume !== 'unité' ? `-${v.volume.toUpperCase()}` : '-U'
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { skuVariant: `${finalSku}${vol}` }
      })
    }
  }

  console.log('✅ Cleaned all remaining suspicious SKUs with unique references!')
}

fixSuspicious()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
