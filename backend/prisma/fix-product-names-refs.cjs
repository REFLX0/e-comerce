const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function cleanSlugName(slugOrName, brandName) {
  if (!slugOrName) return slugOrName

  // Remove leading auto- if present
  let clean = slugOrName.replace(/^auto-/i, '')

  // If already nicely spaced and capitalized, leave as is
  if (!clean.includes('-') && !clean.includes('_')) {
    return clean
  }

  let words = clean.split(/[-_]+/).filter(Boolean)

  const capitalized = words.map((w, idx) => {
    const lower = w.toLowerCase()

    // Viscosities (e.g. 5W30, 5W-30, 10W40, 0W20, 15W50, 20W50, 75W80, 80W90)
    if (/^\d+w\d*$/i.test(lower)) return lower.toUpperCase()
    // Volumes (e.g. 1L, 4L, 5L, 20L, 60L, 208L, 250ML, 500ML)
    if (/^\d+(\.\d+)?(l|ml)$/i.test(lower)) return lower.toUpperCase()
    // Specs and acronyms
    if (/^(4t|2t|atf|dsg|cvt|mtf|dot3|dot4|h1|h4|h7|h11|w5w|led|api|acea|mos2|oem)$/i.test(lower)) {
      return lower.toUpperCase()
    }
    if (/^(\d+)w$/i.test(lower) || /^(\d+)v$/i.test(lower)) {
      return lower.toUpperCase()
    }

    if (idx > 0 && ['de', 'du', 'des', 'le', 'la', 'les', 'et', 'pour', 'en', 'sur', 'a', 'à', 'au', 'aux'].includes(lower)) {
      return lower
    }

    return lower.charAt(0).toUpperCase() + lower.slice(1)
  })

  let title = capitalized.join(' ')

  if (brandName) {
    const brandLower = brandName.toLowerCase()
    if (title.toLowerCase().startsWith(brandLower + ' ')) {
      title = brandName + title.slice(brandName.length)
    }
  }

  return title
}

function cleanProductSku(sku, slug, brandName) {
  if (!sku || !sku.startsWith('AUTO-')) return sku

  const brand = (brandName || '').toUpperCase()
  let prefix = 'REF'
  if (brand.includes('MANNOL')) prefix = 'MN'
  else if (brand.includes('LIQUI MOLY') || brand.includes('LIQUIMOLY')) prefix = 'LM'
  else if (brand.includes('OSRAM')) prefix = 'OSR'
  else if (brand.includes('MOTUL')) prefix = 'MOT'
  else if (brand.includes('CASTROL')) prefix = 'CAS'
  else if (brand.includes('TOTAL')) prefix = 'TOT'
  else if (brand.includes('SHELL')) prefix = 'SHL'
  else if (brand.length > 0) prefix = brand.slice(0, 3)

  // Look for numeric ID at the end
  const trailingMatch = sku.match(/-(\d+)(?:-([A-Z0-9]+))?$/i)
  if (trailingMatch) {
    const num = trailingMatch[1]
    const suffix = trailingMatch[2] && trailingMatch[2] !== 'UNITÉ' && trailingMatch[2] !== 'UNITE' ? `-${trailingMatch[2]}` : ''
    return `${prefix}-${num}${suffix}`
  }

  const slugParts = slug.split('-').filter(p => p.length > 1)
  const shortCode = slugParts.slice(-2).join('-').toUpperCase()
  return `${prefix}-${shortCode}`
}

async function main() {
  console.log('🚀 Starting product names and SKUs cleanup...')

  const products = await prisma.product.findMany({
    include: {
      brand: true,
      variants: true,
    }
  })

  console.log(`Analyzing ${products.length} products...`)

  let updatedCount = 0

  for (const product of products) {
    const brandName = product.brand ? product.brand.name : ''
    const isSlugName = product.nameFr.includes('-') && !product.nameFr.includes(' ')
    const isAutoSku = product.sku.startsWith('AUTO-')

    if (!isSlugName && !isAutoSku) continue

    const newNameFr = isSlugName ? cleanSlugName(product.nameFr, brandName) : product.nameFr
    const newSku = isAutoSku ? cleanProductSku(product.sku, product.slug, brandName) : product.sku

    await prisma.product.update({
      where: { id: product.id },
      data: {
        nameFr: newNameFr,
        sku: newSku,
      }
    })

    for (const variant of product.variants) {
      if (variant.skuVariant && variant.skuVariant.startsWith('AUTO-')) {
        const vol = variant.volume && variant.volume !== 'unité' ? `-${variant.volume.toUpperCase()}` : ''
        const newVariantSku = `${newSku}${vol}`
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { skuVariant: newVariantSku }
        })
      }
    }

    updatedCount++
  }

  console.log(`✅ Finished cleanup! Updated ${updatedCount} products and their variants.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
