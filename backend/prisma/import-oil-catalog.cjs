/**
 * import-oil-catalog.cjs
 * ─────────────────────────────────────────────────────────────
 * Reads all JSON files from the oil/ directory and imports them
 * as products into the Prisma database.
 *
 * Run inside the backend container:
 *   node prisma/import-oil-catalog.cjs
 */
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const p = new PrismaClient()

// ──────────────────────────────────────────────────────────────
// CATEGORY MAP: match keywords from data → our DB category slugs
// ──────────────────────────────────────────────────────────────
function guessCategorySlug(categories = '', title = '', url = '') {
  const text = (categories + ' ' + title + ' ' + url).toLowerCase()

  if (text.includes('additif diesel') || text.includes('additifs-diesel'))    return 'additifs'
  if (text.includes('additif essence') || text.includes('additifs-essence'))  return 'additifs'
  if (text.includes('additif huile') || text.includes('additifs-huile'))      return 'additifs'
  if (text.includes('additif'))                                                return 'additifs'

  if (text.includes('detailing') || text.includes('nettoyant') || text.includes('lustrant') || text.includes('entretien-auto') || text.includes('anti-rouille') || text.includes('jantes') || text.includes('pneus') || text.includes('tableau de bord') || text.includes('interior') || text.includes('exterieur')) return 'entretien-auto'

  if (text.includes('eclairage') || text.includes('lampe') || text.includes('ampoule') || text.includes('h4') || text.includes('h7') || text.includes('neolux') || text.includes('osram')) return 'auto-electricite-eclairage'

  if (text.includes('boite') || text.includes('transmission') || text.includes('cvt') || text.includes('atf') || text.includes('pont') || text.includes('direction') || text.includes('gear oil') || text.includes('75w')) return 'liquides-auto'

  if (text.includes('moto') || text.includes('motorbike') || text.includes('outboard')) return 'moto-huiles'

  if (text.includes('marine') || text.includes('bateau') || text.includes('nautique')) return 'marine-moteurs'

  if (text.includes('filtre') || text.includes('filter')) return 'auto-filtres'

  if (text.includes('huile moteur') || text.includes('huile-moteur') || text.includes('motor oil') || text.includes('engine oil') || text.includes('0w-') || text.includes('5w-') || text.includes('10w-') || text.includes('15w-') || text.includes('20w-')) return 'huiles-moteur'

  return 'huiles-moteur' // default
}

// ──────────────────────────────────────────────────────────────
// BRAND MAP: normalize brand names to our DB slug format
// ──────────────────────────────────────────────────────────────
function guessBrandSlug(brand = '') {
  const b = brand.toLowerCase().trim()
  if (b.includes('mannol'))      return 'mannol'
  if (b.includes('liqui moly') || b.includes('liqui-moly')) return 'liqui-moly'
  if (b.includes('neolux'))      return 'neolux'
  if (b.includes('osram'))       return 'osram'
  if (b.includes('castrol'))     return 'castrol'
  if (b.includes('motul'))       return 'motul'
  if (b.includes('shell'))       return 'shell'
  if (b.includes('total'))       return 'total'
  if (b.includes('mobil'))       return 'mobil'
  return b.replace(/\s+/g, '-')
}

// ──────────────────────────────────────────────────────────────
// SLUG generator
// ──────────────────────────────────────────────────────────────
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

// ──────────────────────────────────────────────────────────────
// Parse product objects from any file format
// ──────────────────────────────────────────────────────────────
function parseProducts(data) {
  // If it's an object keyed by brand (like all_products_final.json)
  if (!Array.isArray(data)) {
    return Object.values(data).flat()
  }
  return data
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
const brandCache = {}
async function getBrandId(slug) {
  if (brandCache[slug] !== undefined) return brandCache[slug]
  const b = await p.brand.findUnique({ where: { slug } })
  brandCache[slug] = b?.id ?? null
  return brandCache[slug]
}

const categoryCache = {}
async function getCategoryId(slug) {
  if (categoryCache[slug] !== undefined) return categoryCache[slug]
  const c = await p.category.findUnique({ where: { slug } })
  categoryCache[slug] = c?.id ?? null
  return categoryCache[slug]
}

// Ensure brand exists (upsert)
async function ensureBrand(brandName) {
  const slug = guessBrandSlug(brandName)
  const existing = await p.brand.findUnique({ where: { slug } })
  if (existing) {
    brandCache[slug] = existing.id
    return existing.id
  }
  const created = await p.brand.create({
    data: {
      id: `brand-${slug}`,
      slug,
      name: brandName,
    }
  })
  brandCache[slug] = created.id
  return created.id
}

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────
async function main() {
  console.log('=== OIL CATALOG IMPORT ===\n')

  const oilDir = path.join(__dirname, '../../oil')
  const jsonFiles = fs.readdirSync(oilDir).filter(f => f.endsWith('.json'))

  console.log(`Found ${jsonFiles.length} JSON files: ${jsonFiles.join(', ')}\n`)

  // Collect all products from all files, deduplicate by SKU or URL
  const allProducts = []
  const seenSlugs = new Set()

  for (const file of jsonFiles) {
    // Skip if not a product file
    if (file === 'official_catalog_refs.json') continue

    const raw = fs.readFileSync(path.join(oilDir, file), 'utf-8')
    const data = JSON.parse(raw)
    const products = parseProducts(data)

    console.log(`  ${file}: ${products.length} products`)
    allProducts.push(...products)
  }

  console.log(`\nTotal raw products: ${allProducts.length}`)

  // Filter products that have at least a title
  const validProducts = allProducts.filter(p => p.title && p.title.trim().length > 2)
  console.log(`Valid products (with title): ${validProducts.length}\n`)

  let created = 0, skipped = 0, failed = 0

  for (const prod of validProducts) {
    try {
      const name = (prod.title || '').trim()
      const slug = toSlug(name)

      if (!slug || seenSlugs.has(slug)) {
        skipped++
        continue
      }
      seenSlugs.add(slug)

      // Check if already exists in DB
      const existing = await p.product.findUnique({ where: { slug } })
      if (existing) {
        skipped++
        continue
      }

      const brandName = prod.brand || 'Unknown'
      const brandSlug = guessBrandSlug(brandName)
      const brandId = await ensureBrand(brandName)

      const categorySlug = guessCategorySlug(
        prod.categories || '',
        prod.title || '',
        prod.url || ''
      )
      const categoryId = await getCategoryId(categorySlug)

      if (!categoryId) {
        console.log(`  [skip] Category not found: ${categorySlug} for "${name}"`)
        skipped++
        continue
      }

      // Clean description
      const description = (prod.full_description || prod.short_description || '').trim()

      // Image URL
      const imageUrl = (prod.image_url || '').trim()

      // SKU: use provided or generate unique one from slug
      const rawSku = (prod.sku || '').trim()
      const sku = rawSku || `AUTO-${slug.slice(0, 40).toUpperCase().replace(/-/g, '')}-${Date.now() % 100000}`

      // Detect volume from slug/title for variant label
      const volMatch = (slug + ' ' + name).match(/(\d+(?:\.\d+)?)\s*(?:l|litre|liter|ml)/i)
      const volume = volMatch ? volMatch[0].replace(/\s+/g, '').toLowerCase() : 'unité'

      await p.product.create({
        data: {
          nameFr: name,
          slug,
          sku,
          description: description || name,
          brandId,
          categoryId,
          isPublished: true,
          isFeatured: false,
          images: imageUrl ? {
            create: [{ url: imageUrl, isPrimary: true, sortOrder: 0 }]
          } : undefined,
          variants: {
            create: [{
              volume: volume,
              price: 0,
              stockQty: 10,
              skuVariant: `${sku}-${volume.replace(/\s+/g, '').toUpperCase()}`.slice(0, 100),
            }]
          }
        }
      })

      created++
      if (created % 20 === 0) console.log(`  Progress: ${created} created...`)

    } catch (err) {
      console.error(`  [FAIL] "${prod.title}": ${err.message}`)
      failed++
    }
  }

  console.log(`\n=== IMPORT COMPLETE ===`)
  console.log(`  Created: ${created}`)
  console.log(`  Skipped (duplicate/missing): ${skipped}`)
  console.log(`  Failed: ${failed}`)
}

main()
  .catch(async e => {
    console.error(e)
    await p.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    await p.$disconnect()
  })
