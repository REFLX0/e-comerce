import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding massive realistic dataset...')

  // Clear existing
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.vehicleCompatibility.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productSpecs.deleteMany()
  await prisma.product.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.category.deleteMany()
  await prisma.vehicleModel.deleteMany()
  await prisma.vehicleMake.deleteMany()
  await prisma.user.deleteMany()

  // 1. ADMIN USER
  const passwordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@kiosquetn.tn', passwordHash, role: 'ADMIN' },
  })

  const customer = await prisma.user.create({
    data: { name: 'Achref', email: 'achref@kiosquetn.tn', passwordHash, role: 'CUSTOMER' },
  })

  // 2. BRANDS
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'Yacco', slug: 'yacco', logoUrl: '/img/b/yacco.svg' } }),
    prisma.brand.create({ data: { name: 'Shell', slug: 'shell', logoUrl: '/img/b/shell.svg' } }),
    prisma.brand.create({ data: { name: 'TotalEnergies', slug: 'totalenergies', logoUrl: '/img/b/total.svg' } }),
    prisma.brand.create({ data: { name: 'Castrol', slug: 'castrol', logoUrl: '/img/b/castrol.svg' } }),
    prisma.brand.create({ data: { name: 'Liqui Moly', slug: 'liqui-moly', logoUrl: '/img/b/liqui-moly.svg' } }),
    prisma.brand.create({ data: { name: 'Motul', slug: 'motul', logoUrl: '/img/b/motul.svg' } }),
    prisma.brand.create({ data: { name: 'Bosch', slug: 'bosch', logoUrl: '/img/b/bosch.svg' } }),
    prisma.brand.create({ data: { name: 'Purflux', slug: 'purflux', logoUrl: '/img/b/purflux.svg' } }),
    prisma.brand.create({ data: { name: 'Wynn\'s', slug: 'wynns', logoUrl: '/img/b/wynns.svg' } }),
  ])
  const [yacco, shell, total, castrol, liqui, motul, bosch, purflux, wynns] = brands

  // 3. CATEGORIES
  const cAuto = await prisma.category.create({ data: { nameFr: 'Automobile', slug: 'automobile', imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800' } })
  const cMoto = await prisma.category.create({ data: { nameFr: 'Moto', slug: 'moto', imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800' } })
  const cHeavy = await prisma.category.create({ data: { nameFr: 'Poids Lourd & Agricole', slug: 'poids-lourd-agricole', imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800' } })
  const cFilters = await prisma.category.create({ data: { nameFr: 'Filtres', slug: 'filtres', imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800' } })
  const cAdditives = await prisma.category.create({ data: { nameFr: 'Additifs & Entretien', slug: 'additifs', imageUrl: 'https://images.unsplash.com/photo-1621245131495-21d3f9479b15?q=80&w=800' } })
  
  // Subcategories
  const cAutoSynth = await prisma.category.create({ data: { nameFr: '100% Synthèse', slug: 'auto-synthese', parentId: cAuto.id } })
  const cAutoSemi = await prisma.category.create({ data: { nameFr: 'Semi-Synthèse', slug: 'auto-semi', parentId: cAuto.id } })
  const cAutoMin = await prisma.category.create({ data: { nameFr: 'Minérale', slug: 'auto-minerale', parentId: cAuto.id } })

  // 4. VEHICLES
  const renault = await prisma.vehicleMake.create({ data: { name: 'Renault', slug: 'renault' } })
  const clio = await prisma.vehicleModel.create({ data: { makeId: renault.id, name: 'Clio 4', slug: 'clio-4' } })
  const megane = await prisma.vehicleModel.create({ data: { makeId: renault.id, name: 'Megane 4', slug: 'megane-4' } })
  
  const vw = await prisma.vehicleMake.create({ data: { name: 'Volkswagen', slug: 'volkswagen' } })
  const golf = await prisma.vehicleModel.create({ data: { makeId: vw.id, name: 'Golf 7', slug: 'golf-7' } })
  const polo = await prisma.vehicleModel.create({ data: { makeId: vw.id, name: 'Polo 6', slug: 'polo-6' } })

  const peugeot = await prisma.vehicleMake.create({ data: { name: 'Peugeot', slug: 'peugeot' } })
  const p208 = await prisma.vehicleModel.create({ data: { makeId: peugeot.id, name: '208', slug: '208' } })

  // 5. MASSIVE PRODUCT CREATION
  const products = [
    {
      name: 'Yacco Lube DI 0W-20 C6',
      slug: 'yacco-lube-di-0w20-c6',
      sku: 'YAC-0W20',
      brandId: yacco.id,
      categoryId: cAutoSynth.id,
      isFeatured: true,
      desc: 'Huile 100% synthèse de toute dernière technologie pour les moteurs essence et diesel récents.',
      img: 'https://images.unsplash.com/photo-1621245131495-21d3f9479b15?q=80&w=800',
      specs: { viscosity: '0W-20', apiStandard: 'API SP', aeceaStandard: 'ACEA C6', isFullySynth: true },
      compat: [{ vehicleModelId: clio.id, engineCode: '1.5 dCi' }, { vehicleModelId: p208.id, engineCode: '1.2 PureTech' }],
      variants: [{ vol: '1L', price: 22.5, stock: 50 }, { vol: '5L', price: 95.0, stock: 30 }]
    },
    {
      name: 'Shell Helix Ultra 5W-40',
      slug: 'shell-helix-ultra-5w40',
      sku: 'SHL-5W40-U',
      brandId: shell.id,
      categoryId: cAutoSynth.id,
      isFeatured: true,
      desc: 'Huile moteur entièrement synthétique formulée avec la technologie PurePlus de Shell.',
      img: 'https://images.unsplash.com/photo-1625298816538-349f8fc322dc?q=80&w=800',
      specs: { viscosity: '5W-40', apiStandard: 'API SN PLUS', aeceaStandard: 'ACEA A3/B4', isFullySynth: true },
      compat: [{ vehicleModelId: golf.id, engineCode: '2.0 TDI' }, { vehicleModelId: megane.id, engineCode: '1.6 dCi' }],
      variants: [{ vol: '1L', price: 18.0, stock: 100 }, { vol: '5L', price: 75.0, stock: 60 }]
    },
    {
      name: 'Total Quartz 7000 10W-40',
      slug: 'total-quartz-7000-10w40',
      sku: 'TOT-10W40-Q7',
      brandId: total.id,
      categoryId: cAutoSemi.id,
      isFeatured: false,
      desc: 'Huile moteur semi-synthétique performante conçue pour s\'adapter à tous les usages.',
      img: 'https://images.unsplash.com/photo-1579294218335-b248a39a7b97?q=80&w=800',
      specs: { viscosity: '10W-40', apiStandard: 'API SN', aeceaStandard: 'ACEA A3/B4', isSemiSynth: true },
      compat: [{ vehicleModelId: clio.id, engineCode: '1.2 16V' }, { vehicleModelId: polo.id, engineCode: '1.4 MPI' }],
      variants: [{ vol: '1L', price: 12.0, stock: 120 }, { vol: '4L', price: 42.0, stock: 80 }]
    },
    {
      name: 'Castrol Edge 5W-30 LL',
      slug: 'castrol-edge-5w30-ll',
      sku: 'CAS-5W30-EDGE',
      brandId: castrol.id,
      categoryId: cAutoSynth.id,
      isFeatured: true,
      desc: 'Le fluide Titanium fortifie l\'huile pour résister à la pression et maximiser les performances.',
      img: 'https://images.unsplash.com/photo-1610665971510-73f1d32a9263?q=80&w=800',
      specs: { viscosity: '5W-30', apiStandard: 'API SN', aeceaStandard: 'ACEA C3', isFullySynth: true },
      compat: [{ vehicleModelId: golf.id, engineCode: '1.6 TDI' }, { vehicleModelId: polo.id, engineCode: '1.2 TSI' }],
      variants: [{ vol: '1L', price: 20.0, stock: 40 }, { vol: '5L', price: 88.0, stock: 25 }]
    },
    {
      name: 'Motul 300V Factory Line 10W-40',
      slug: 'motul-300v-10w40',
      sku: 'MOT-300V-10W40',
      brandId: motul.id,
      categoryId: cMoto.id,
      isFeatured: true,
      desc: 'Huile moto 4T haute performance 100% synthèse utilisant la technologie ESTER Core.',
      img: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?q=80&w=800',
      specs: { viscosity: '10W-40', isFullySynth: true },
      compat: [],
      variants: [{ vol: '1L', price: 25.0, stock: 15 }, { vol: '4L', price: 95.0, stock: 10 }]
    },
    {
      name: 'Liqui Moly Ceratec Additif',
      slug: 'liqui-moly-ceratec',
      sku: 'LIQ-CERATEC',
      brandId: liqui.id,
      categoryId: cAdditives.id,
      isFeatured: true,
      desc: 'Additif haute technologie de protection contre l\'usure.',
      img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800',
      specs: {},
      compat: [],
      variants: [{ vol: '300ml', price: 28.5, stock: 200 }]
    },
    {
      name: 'Filtre à Huile Bosch P3045',
      slug: 'bosch-filtre-p3045',
      sku: 'BOSCH-P3045',
      brandId: bosch.id,
      categoryId: cFilters.id,
      isFeatured: false,
      desc: 'Filtre à huile haute qualité pour protéger votre moteur.',
      img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800',
      specs: {},
      compat: [{ vehicleModelId: golf.id, engineCode: '1.6 TDI' }, { vehicleModelId: polo.id, engineCode: '1.6 TDI' }],
      variants: [{ vol: 'Pièce', price: 15.0, stock: 300 }]
    }
  ]

  for (const p of products) {
    await prisma.product.create({
      data: {
        nameFr: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.desc,
        brandId: p.brandId,
        categoryId: p.categoryId,
        isFeatured: p.isFeatured,
        variants: {
          create: p.variants.map((v, idx) => ({
            volume: v.vol,
            price: v.price,
            stockQty: v.stock,
            skuVariant: `${p.sku}-${v.vol.toUpperCase()}`
          }))
        },
        images: {
          create: [{ url: p.img, isPrimary: true }]
        },
        specs: Object.keys(p.specs).length ? { create: p.specs } : undefined,
        compatibilities: p.compat.length ? {
          create: p.compat.map(c => ({
            vehicleModelId: c.vehicleModelId,
            engineCode: c.engineCode,
          }))
        } : undefined
      }
    })
  }

  // Generate some random products to bulk up the catalog (15 more products)
  for (let i = 1; i <= 15; i++) {
    await prisma.product.create({
      data: {
        nameFr: `Huile Standard V${i} 15W-40`,
        slug: `huile-standard-v${i}-15w40`,
        sku: `STD-15W40-V${i}`,
        description: `Huile moteur minérale de qualité standard pour les moteurs d'ancienne génération. Formule améliorée V${i}.`,
        brandId: total.id,
        categoryId: cAutoMin.id,
        isFeatured: false,
        variants: {
          create: [
            { volume: '1L', price: 9.0 + (i*0.5), stockQty: 50, skuVariant: `STD-15W40-V${i}-1L` },
            { volume: '5L', price: 35.0 + (i*1.5), stockQty: 20, skuVariant: `STD-15W40-V${i}-5L` }
          ]
        },
        images: {
          create: [{ url: 'https://images.unsplash.com/photo-1579294218335-b248a39a7b97?q=80&w=800', isPrimary: true }]
        }
      }
    })
  }

  console.log('Massive dataset injected successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

