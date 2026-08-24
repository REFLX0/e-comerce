import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function cleanSlugName(slugOrName: string, brandName?: string): string {
  // If it doesn't look like a raw kebab-case slug, return as is
  if (!slugOrName.includes('-') && !slugOrName.includes('_')) {
    return slugOrName
  }

  // Split by dashes and underscores
  let words = slugOrName
    .replace(/^auto-/i, '')
    .split(/[-_]+/)
    .filter(Boolean)

  // Capitalize words appropriately
  const capitalized = words.map((w, idx) => {
    const lower = w.toLowerCase()
    
    // Viscosity patterns (e.g. 5w30, 5w-30, 10w40, 0w20, 15w50, 20w50, 75w80, 80w90)
    if (/^\d+w\d*$/i.test(lower)) {
      return lower.toUpperCase()
    }
    // Volume patterns (e.g. 1l, 4l, 5l, 20l, 60l, 208l, 250ml, 500ml)
    if (/^\d+(\.\d+)?(l|ml)$/i.test(lower)) {
      return lower.toUpperCase()
    }
    // Engine/spec terms (e.g. 4t, 2t, atf, dsg, cvt, dot3, dot4, dot5.1, h4, h7, h1, w5w)
    if (/^(4t|2t|atf|dsg|cvt|mtf|dot3|dot4|h1|h4|h7|h11|w5w|led|api|acea|mos2|oem)$/i.test(lower)) {
      return lower.toUpperCase()
    }
    if (/^(\d+)w$/i.test(lower)) {
      return lower.toUpperCase()
    }
    if (/^(\d+)v$/i.test(lower)) {
      return lower.toUpperCase()
    }

    // Common French lowercase words unless first word
    if (idx > 0 && ['de', 'du', 'des', 'le', 'la', 'les', 'et', 'pour', 'en', 'sur', 'a', 'à', 'au', 'aux'].includes(lower)) {
      return lower
    }

    // Standard word capitalization
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  })

  let title = capitalized.join(' ')

  // Clean brand duplication if title starts with brand
  if (brandName) {
    const brandLower = brandName.toLowerCase()
    if (title.toLowerCase().startsWith(brandLower + ' ')) {
      // Keep brand with exact casing
      title = brandName + title.slice(brandName.length)
    }
  }

  return title
}

function cleanProductSku(sku: string, slug: string, brandName?: string): string {
  if (!sku.startsWith('AUTO-')) return sku

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

  // Look for numeric ID at the end (e.g. -2424 or -3188 or 3089-1L)
  const trailingMatch = sku.match(/-(\d+)(?:-([A-Z0-9]+))?$/i)
  if (trailingMatch) {
    const num = trailingMatch[1]
    const suffix = trailingMatch[2] && trailingMatch[2] !== 'UNITÉ' && trailingMatch[2] !== 'UNITE' ? `-${trailingMatch[2]}` : ''
    return `${prefix}-${num}${suffix}`
  }

  // Otherwise generate from slug
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
    const brandName = product.brand?.name || ''
    const isSlugName = product.nameFr.includes('-') || product.nameFr.includes('_')
    const isAutoSku = product.sku.startsWith('AUTO-')

    if (!isSlugName && !isAutoSku) continue

    const newNameFr = isSlugName ? cleanSlugName(product.nameFr, brandName) : product.nameFr
    const newSku = isAutoSku ? cleanProductSku(product.sku, product.slug, brandName) : product.sku

    // Update product
    await prisma.product.update({
      where: { id: product.id },
      data: {
        nameFr: newNameFr,
        sku: newSku,
      }
    })

    // Update variant SKUs if they contain AUTO-
    for (const variant of product.variants) {
      if (variant.skuVariant.startsWith('AUTO-')) {
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
