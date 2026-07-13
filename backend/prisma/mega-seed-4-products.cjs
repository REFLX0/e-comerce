// mega-seed-4-products.cjs — Ajoute 185 produits depuis bestoil.tn
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

const raw = require('/app/bestoil_products.json')
const products = Object.values(raw)

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractViscosity(name) {
  const m = name.match(/(\d+W[-\s]?\d+)/i)
  return m ? m[1].replace(/\s*-\s*/, '-') : null
}

function extractVolume(name) {
  const m = name.match(/(\d+)\s*L/i)
  return m ? `${m[1]}L` : null
}

const CATEGORY_SLUG = 'huiles-moteur'
const BRANDS = [
  { name: 'Shell', slug: 'shell' },
  { name: 'Yacco', slug: 'yacco' },
  { name: 'Accor', slug: 'accor' },
  { name: 'Kennol', slug: 'kennol' },
  { name: 'Liqui Moly', slug: 'liqui-moly' },
]

async function main() {
  console.log('=== MEGA SEED 4: 185 products from bestoil.tn ===\n')

  // 1. Ensure category exists
  let cat = await p.category.findUnique({ where: { slug: CATEGORY_SLUG } })
  if (!cat) {
    cat = await p.category.create({
      data: { nameFr: 'Huiles Moteur', slug: CATEGORY_SLUG, sortOrder: 1 },
    })
    console.log(`  [category] Created: ${cat.nameFr}`)
  }

  // 2. Upsert brands
  const brandMap = {}
  for (const b of BRANDS) {
    const brand = await p.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: { name: b.name, slug: b.slug },
    })
    brandMap[b.name.toLowerCase()] = brand
    console.log(`  [brand] ${brand.name}`)
  }
  // Map Bestoil.tn brand to Accor (it's their house brand)
  brandMap['bestoil.tn'] = brandMap['accor']

  let created = 0, skipped = 0, imgDl = 0

  for (const item of products) {
    const name = item.name
      .replace(/^(Huile Moteur|Huile)\s+/i, '')
      .trim()
    const slug = slugify('huile-' + name.substring(0, 60))
    const brandName = item.brand?.toLowerCase() || 'accor'
    const brand = brandMap[brandName] || brandMap['accor']

    // Check duplicate
    const exists = await p.product.findUnique({ where: { slug } })
    if (exists) { skipped++; continue }

    const viscosity = extractViscosity(name)
    const volume = extractVolume(name)
    const priceStr = item.price?.replace(/[^0-9,]/g, '').replace(',', '.') || '0'
    const price = parseFloat(priceStr) || 0

    const desc = `${item.brand} ${name} — Huile moteur${viscosity ? ' de viscosité ' + viscosity : ''} disponible en ${volume || 'plusieurs conditionnements'}.`

    try {
      await p.product.create({
        data: {
          sku: 'SKU-' + slug.substring(0, 47),
          nameFr: name.substring(0, 255),
          slug,
          description: desc,
          brandId: brand.id,
          categoryId: cat.id,
          isPublished: true,
          specs: viscosity ? {
            create: { viscosity },
          } : undefined,
          variants: price > 0 ? {
            create: [{
              volume: volume || '5L',
              price,
              stockQty: 10,
              skuVariant: slug + '-' + (volume || '5l').toLowerCase(),
            }],
          } : undefined,
          images: {
            create: [{
              url: `/img/products/${slug}.jpg`,
              isPrimary: true,
              sortOrder: 0,
            }],
          },
        },
      })
      created++
      process.stdout.write(`  [create] ${slug}\n`)
    } catch (err) {
      console.error(`  [FAIL] ${slug}: ${err.message}`)
    }
  }

  console.log(`\nDone: created=${created} skipped=${skipped} total=${products.length}`)
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect())
