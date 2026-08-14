const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

const PRICE_UPDATES = [
  {
    "slug": "mannol-nettoyant-injecteurs-essence-250ml",
    "price": 19.9
  },
  {
    "slug": "mannol-motor-doctor-ester",
    "price": 14.9
  },
  {
    "slug": "mannol-molibden-350-ml",
    "price": 27.9
  },
  {
    "slug": "mannol-liquide-de-refroidissement-g11",
    "price": 12.9
  },
  {
    "slug": "mannol-shampoing-super-concentre-1l",
    "price": 23.8
  },
  {
    "slug": "mannol-huile-de-boite-auto-toyota-atf-ws",
    "price": 37.85
  },
  {
    "slug": "mannol-huile-de-boite-mtf-3-75w-1l",
    "price": 24.9
  }
]

async function main() {
  console.log('=== PRICE UPDATE ===')
  let updated = 0, missed = 0
  for (const entry of PRICE_UPDATES) {
    const product = await p.product.findUnique({ where: { slug: entry.slug }, include: { variants: true } })
    if (!product) { missed++; continue }
    // Update all variants to have the correct price
    for (const variant of product.variants) {
      await p.productVariant.update({
        where: { id: variant.id },
        data: { price: entry.price }
      })
    }
    updated++
  }
  console.log(`Updated: ${updated}, Not found: ${missed}`)
  await p.$disconnect()
}

main().catch(async e => { console.error(e); await p.$disconnect(); process.exit(1) })