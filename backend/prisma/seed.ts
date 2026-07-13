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
  const cAuto = await prisma.category.create({ data: { nameFr: 'Automobile', slug: 'automobile', imageUrl: '/img/product.jpg' } })
  const cMoto = await prisma.category.create({ data: { nameFr: 'Moto', slug: 'moto', imageUrl: '/img/product.jpg' } })
  const cHeavy = await prisma.category.create({ data: { nameFr: 'Poids Lourd & Agricole', slug: 'poids-lourd-agricole', imageUrl: '/img/product.jpg' } })
  const cFilters = await prisma.category.create({ data: { nameFr: 'Filtres', slug: 'filtres', imageUrl: '/img/product.jpg' } })
  const cAdditives = await prisma.category.create({ data: { nameFr: 'Additifs & Entretien', slug: 'additifs', imageUrl: '/img/product.jpg' } })
  
  // Subcategories
  const cAutoSynth = await prisma.category.create({ data: { nameFr: '100% Synthèse', slug: 'auto-synthese', parentId: cAuto.id } })
  const cAutoSemi = await prisma.category.create({ data: { nameFr: 'Semi-Synthèse', slug: 'auto-semi', parentId: cAuto.id } })
  const cAutoMin = await prisma.category.create({ data: { nameFr: 'Minérale', slug: 'auto-minerale', parentId: cAuto.id } })

  // 4. VEHICLES — 25 makes with multiple models each
  const renault = await prisma.vehicleMake.create({ data: { name: 'Renault', slug: 'renault' } })
  const clio = await prisma.vehicleModel.create({ data: { makeId: renault.id, name: 'Clio 4', slug: 'clio-4' } })
  const megane = await prisma.vehicleModel.create({ data: { makeId: renault.id, name: 'Megane 4', slug: 'megane-4' } })
  await prisma.vehicleModel.create({ data: { makeId: renault.id, name: 'Kadjar', slug: 'kadjar' } })
  await prisma.vehicleModel.create({ data: { makeId: renault.id, name: 'Duster', slug: 'duster' } })
  await prisma.vehicleModel.create({ data: { makeId: renault.id, name: 'Symbol', slug: 'symbol' } })
  await prisma.vehicleModel.create({ data: { makeId: renault.id, name: 'Logan', slug: 'logan' } })

  const vw = await prisma.vehicleMake.create({ data: { name: 'Volkswagen', slug: 'volkswagen' } })
  const golf = await prisma.vehicleModel.create({ data: { makeId: vw.id, name: 'Golf 7', slug: 'golf-7' } })
  const polo = await prisma.vehicleModel.create({ data: { makeId: vw.id, name: 'Polo 6', slug: 'polo-6' } })
  await prisma.vehicleModel.create({ data: { makeId: vw.id, name: 'Passat', slug: 'passat' } })
  await prisma.vehicleModel.create({ data: { makeId: vw.id, name: 'Tiguan', slug: 'tiguan' } })
  await prisma.vehicleModel.create({ data: { makeId: vw.id, name: 'Touareg', slug: 'touareg' } })

  const peugeot = await prisma.vehicleMake.create({ data: { name: 'Peugeot', slug: 'peugeot' } })
  const p208 = await prisma.vehicleModel.create({ data: { makeId: peugeot.id, name: '208', slug: '208' } })
  await prisma.vehicleModel.create({ data: { makeId: peugeot.id, name: '308', slug: '308' } })
  await prisma.vehicleModel.create({ data: { makeId: peugeot.id, name: '3008', slug: '3008' } })
  await prisma.vehicleModel.create({ data: { makeId: peugeot.id, name: '5008', slug: '5008' } })
  await prisma.vehicleModel.create({ data: { makeId: peugeot.id, name: '508', slug: '508' } })

  const citroen = await prisma.vehicleMake.create({ data: { name: 'Citroën', slug: 'citroen' } })
  await prisma.vehicleModel.create({ data: { makeId: citroen.id, name: 'C3', slug: 'c3' } })
  await prisma.vehicleModel.create({ data: { makeId: citroen.id, name: 'C4', slug: 'c4' } })
  await prisma.vehicleModel.create({ data: { makeId: citroen.id, name: 'C5 Aircross', slug: 'c5-aircross' } })
  await prisma.vehicleModel.create({ data: { makeId: citroen.id, name: 'Berlingo', slug: 'berlingo' } })

  const toyota = await prisma.vehicleMake.create({ data: { name: 'Toyota', slug: 'toyota' } })
  await prisma.vehicleModel.create({ data: { makeId: toyota.id, name: 'Corolla', slug: 'corolla' } })
  await prisma.vehicleModel.create({ data: { makeId: toyota.id, name: 'Yaris', slug: 'yaris' } })
  await prisma.vehicleModel.create({ data: { makeId: toyota.id, name: 'RAV4', slug: 'rav4' } })
  await prisma.vehicleModel.create({ data: { makeId: toyota.id, name: 'Land Cruiser', slug: 'land-cruiser' } })
  await prisma.vehicleModel.create({ data: { makeId: toyota.id, name: 'Camry', slug: 'camry' } })

  const bmw = await prisma.vehicleMake.create({ data: { name: 'BMW', slug: 'bmw' } })
  await prisma.vehicleModel.create({ data: { makeId: bmw.id, name: 'Série 1', slug: 'serie-1' } })
  await prisma.vehicleModel.create({ data: { makeId: bmw.id, name: 'Série 3', slug: 'serie-3' } })
  await prisma.vehicleModel.create({ data: { makeId: bmw.id, name: 'Série 5', slug: 'serie-5' } })
  await prisma.vehicleModel.create({ data: { makeId: bmw.id, name: 'X3', slug: 'x3' } })
  await prisma.vehicleModel.create({ data: { makeId: bmw.id, name: 'X5', slug: 'x5' } })

  const mercedesBenz = await prisma.vehicleMake.create({ data: { name: 'Mercedes-Benz', slug: 'mercedes-benz' } })
  await prisma.vehicleModel.create({ data: { makeId: mercedesBenz.id, name: 'Classe A', slug: 'classe-a' } })
  await prisma.vehicleModel.create({ data: { makeId: mercedesBenz.id, name: 'Classe C', slug: 'classe-c' } })
  await prisma.vehicleModel.create({ data: { makeId: mercedesBenz.id, name: 'Classe E', slug: 'classe-e' } })
  await prisma.vehicleModel.create({ data: { makeId: mercedesBenz.id, name: 'GLC', slug: 'glc' } })
  await prisma.vehicleModel.create({ data: { makeId: mercedesBenz.id, name: 'GLE', slug: 'gle' } })

  const audi = await prisma.vehicleMake.create({ data: { name: 'Audi', slug: 'audi' } })
  await prisma.vehicleModel.create({ data: { makeId: audi.id, name: 'A3', slug: 'a3' } })
  await prisma.vehicleModel.create({ data: { makeId: audi.id, name: 'A4', slug: 'a4' } })
  await prisma.vehicleModel.create({ data: { makeId: audi.id, name: 'A6', slug: 'a6' } })
  await prisma.vehicleModel.create({ data: { makeId: audi.id, name: 'Q3', slug: 'q3' } })
  await prisma.vehicleModel.create({ data: { makeId: audi.id, name: 'Q5', slug: 'q5' } })

  const ford = await prisma.vehicleMake.create({ data: { name: 'Ford', slug: 'ford' } })
  await prisma.vehicleModel.create({ data: { makeId: ford.id, name: 'Focus', slug: 'focus' } })
  await prisma.vehicleModel.create({ data: { makeId: ford.id, name: 'Fiesta', slug: 'fiesta' } })
  await prisma.vehicleModel.create({ data: { makeId: ford.id, name: 'Kuga', slug: 'kuga' } })
  await prisma.vehicleModel.create({ data: { makeId: ford.id, name: 'Puma', slug: 'puma' } })

  const opel = await prisma.vehicleMake.create({ data: { name: 'Opel', slug: 'opel' } })
  await prisma.vehicleModel.create({ data: { makeId: opel.id, name: 'Corsa', slug: 'corsa' } })
  await prisma.vehicleModel.create({ data: { makeId: opel.id, name: 'Astra', slug: 'astra' } })
  await prisma.vehicleModel.create({ data: { makeId: opel.id, name: 'Insignia', slug: 'insignia' } })
  await prisma.vehicleModel.create({ data: { makeId: opel.id, name: 'Grandland X', slug: 'grandland-x' } })

  const skoda = await prisma.vehicleMake.create({ data: { name: 'Škoda', slug: 'skoda' } })
  await prisma.vehicleModel.create({ data: { makeId: skoda.id, name: 'Octavia', slug: 'octavia' } })
  await prisma.vehicleModel.create({ data: { makeId: skoda.id, name: 'Fabia', slug: 'fabia' } })
  await prisma.vehicleModel.create({ data: { makeId: skoda.id, name: 'Superb', slug: 'superb' } })
  await prisma.vehicleModel.create({ data: { makeId: skoda.id, name: 'Karoq', slug: 'karoq' } })

  const seat = await prisma.vehicleMake.create({ data: { name: 'SEAT', slug: 'seat' } })
  await prisma.vehicleModel.create({ data: { makeId: seat.id, name: 'Ibiza', slug: 'ibiza' } })
  await prisma.vehicleModel.create({ data: { makeId: seat.id, name: 'Leon', slug: 'leon' } })
  await prisma.vehicleModel.create({ data: { makeId: seat.id, name: 'Arona', slug: 'arona' } })
  await prisma.vehicleModel.create({ data: { makeId: seat.id, name: 'Ateca', slug: 'ateca' } })

  const hyundai = await prisma.vehicleMake.create({ data: { name: 'Hyundai', slug: 'hyundai' } })
  await prisma.vehicleModel.create({ data: { makeId: hyundai.id, name: 'i20', slug: 'i20' } })
  await prisma.vehicleModel.create({ data: { makeId: hyundai.id, name: 'i30', slug: 'i30' } })
  await prisma.vehicleModel.create({ data: { makeId: hyundai.id, name: 'Tucson', slug: 'tucson' } })
  await prisma.vehicleModel.create({ data: { makeId: hyundai.id, name: 'Santa Fe', slug: 'santa-fe' } })
  await prisma.vehicleModel.create({ data: { makeId: hyundai.id, name: 'Elantra', slug: 'elantra' } })

  const kia = await prisma.vehicleMake.create({ data: { name: 'Kia', slug: 'kia' } })
  await prisma.vehicleModel.create({ data: { makeId: kia.id, name: 'Picanto', slug: 'picanto' } })
  await prisma.vehicleModel.create({ data: { makeId: kia.id, name: 'Rio', slug: 'rio' } })
  await prisma.vehicleModel.create({ data: { makeId: kia.id, name: 'Sportage', slug: 'sportage' } })
  await prisma.vehicleModel.create({ data: { makeId: kia.id, name: 'Sorento', slug: 'sorento' } })
  await prisma.vehicleModel.create({ data: { makeId: kia.id, name: 'Stinger', slug: 'stinger' } })

  const nissan = await prisma.vehicleMake.create({ data: { name: 'Nissan', slug: 'nissan' } })
  await prisma.vehicleModel.create({ data: { makeId: nissan.id, name: 'Micra', slug: 'micra' } })
  await prisma.vehicleModel.create({ data: { makeId: nissan.id, name: 'Qashqai', slug: 'qashqai' } })
  await prisma.vehicleModel.create({ data: { makeId: nissan.id, name: 'X-Trail', slug: 'x-trail' } })
  await prisma.vehicleModel.create({ data: { makeId: nissan.id, name: 'Juke', slug: 'juke' } })

  const honda = await prisma.vehicleMake.create({ data: { name: 'Honda', slug: 'honda' } })
  await prisma.vehicleModel.create({ data: { makeId: honda.id, name: 'Civic', slug: 'civic' } })
  await prisma.vehicleModel.create({ data: { makeId: honda.id, name: 'CR-V', slug: 'cr-v' } })
  await prisma.vehicleModel.create({ data: { makeId: honda.id, name: 'Jazz', slug: 'jazz' } })
  await prisma.vehicleModel.create({ data: { makeId: honda.id, name: 'HR-V', slug: 'hr-v' } })

  const mazda = await prisma.vehicleMake.create({ data: { name: 'Mazda', slug: 'mazda' } })
  await prisma.vehicleModel.create({ data: { makeId: mazda.id, name: 'Mazda3', slug: 'mazda3' } })
  await prisma.vehicleModel.create({ data: { makeId: mazda.id, name: 'Mazda6', slug: 'mazda6' } })
  await prisma.vehicleModel.create({ data: { makeId: mazda.id, name: 'CX-5', slug: 'cx-5' } })
  await prisma.vehicleModel.create({ data: { makeId: mazda.id, name: 'MX-5', slug: 'mx-5' } })

  const fiat = await prisma.vehicleMake.create({ data: { name: 'Fiat', slug: 'fiat' } })
  await prisma.vehicleModel.create({ data: { makeId: fiat.id, name: 'Punto', slug: 'punto' } })
  await prisma.vehicleModel.create({ data: { makeId: fiat.id, name: '500', slug: '500' } })
  await prisma.vehicleModel.create({ data: { makeId: fiat.id, name: 'Tipo', slug: 'tipo' } })
  await prisma.vehicleModel.create({ data: { makeId: fiat.id, name: 'Panda', slug: 'panda' } })

  const alfa = await prisma.vehicleMake.create({ data: { name: 'Alfa Romeo', slug: 'alfa-romeo' } })
  await prisma.vehicleModel.create({ data: { makeId: alfa.id, name: 'Giulia', slug: 'giulia' } })
  await prisma.vehicleModel.create({ data: { makeId: alfa.id, name: 'Stelvio', slug: 'stelvio' } })
  await prisma.vehicleModel.create({ data: { makeId: alfa.id, name: '147', slug: '147' } })
  await prisma.vehicleModel.create({ data: { makeId: alfa.id, name: '156', slug: '156' } })

  const volvo = await prisma.vehicleMake.create({ data: { name: 'Volvo', slug: 'volvo' } })
  await prisma.vehicleModel.create({ data: { makeId: volvo.id, name: 'S60', slug: 's60' } })
  await prisma.vehicleModel.create({ data: { makeId: volvo.id, name: 'V40', slug: 'v40' } })
  await prisma.vehicleModel.create({ data: { makeId: volvo.id, name: 'XC40', slug: 'xc40' } })
  await prisma.vehicleModel.create({ data: { makeId: volvo.id, name: 'XC60', slug: 'xc60' } })
  await prisma.vehicleModel.create({ data: { makeId: volvo.id, name: 'XC90', slug: 'xc90' } })

  const subaru = await prisma.vehicleMake.create({ data: { name: 'Subaru', slug: 'subaru' } })
  await prisma.vehicleModel.create({ data: { makeId: subaru.id, name: 'Impreza', slug: 'impreza' } })
  await prisma.vehicleModel.create({ data: { makeId: subaru.id, name: 'Forester', slug: 'forester' } })
  await prisma.vehicleModel.create({ data: { makeId: subaru.id, name: 'Outback', slug: 'outback' } })

  const mitsubishi = await prisma.vehicleMake.create({ data: { name: 'Mitsubishi', slug: 'mitsubishi' } })
  await prisma.vehicleModel.create({ data: { makeId: mitsubishi.id, name: 'Lancer', slug: 'lancer' } })
  await prisma.vehicleModel.create({ data: { makeId: mitsubishi.id, name: 'Outlander', slug: 'outlander' } })
  await prisma.vehicleModel.create({ data: { makeId: mitsubishi.id, name: 'Eclipse Cross', slug: 'eclipse-cross' } })
  await prisma.vehicleModel.create({ data: { makeId: mitsubishi.id, name: 'L200', slug: 'l200' } })

  const suzuki = await prisma.vehicleMake.create({ data: { name: 'Suzuki', slug: 'suzuki' } })
  await prisma.vehicleModel.create({ data: { makeId: suzuki.id, name: 'Swift', slug: 'swift' } })
  await prisma.vehicleModel.create({ data: { makeId: suzuki.id, name: 'Vitara', slug: 'vitara' } })
  await prisma.vehicleModel.create({ data: { makeId: suzuki.id, name: 'S-Cross', slug: 's-cross' } })
  await prisma.vehicleModel.create({ data: { makeId: suzuki.id, name: 'Jimny', slug: 'jimny' } })

  const dacia = await prisma.vehicleMake.create({ data: { name: 'Dacia', slug: 'dacia' } })
  await prisma.vehicleModel.create({ data: { makeId: dacia.id, name: 'Sandero', slug: 'sandero' } })
  await prisma.vehicleModel.create({ data: { makeId: dacia.id, name: 'Duster', slug: 'duster-dacia' } })
  await prisma.vehicleModel.create({ data: { makeId: dacia.id, name: 'Logan', slug: 'logan-dacia' } })
  await prisma.vehicleModel.create({ data: { makeId: dacia.id, name: 'Dokker', slug: 'dokker' } })

  const jeep = await prisma.vehicleMake.create({ data: { name: 'Jeep', slug: 'jeep' } })
  await prisma.vehicleModel.create({ data: { makeId: jeep.id, name: 'Wrangler', slug: 'wrangler' } })
  await prisma.vehicleModel.create({ data: { makeId: jeep.id, name: 'Cherokee', slug: 'cherokee' } })
  await prisma.vehicleModel.create({ data: { makeId: jeep.id, name: 'Grand Cherokee', slug: 'grand-cherokee' } })
  await prisma.vehicleModel.create({ data: { makeId: jeep.id, name: 'Renegade', slug: 'renegade' } })

  const land = await prisma.vehicleMake.create({ data: { name: 'Land Rover', slug: 'land-rover' } })
  await prisma.vehicleModel.create({ data: { makeId: land.id, name: 'Discovery', slug: 'discovery' } })
  await prisma.vehicleModel.create({ data: { makeId: land.id, name: 'Range Rover', slug: 'range-rover' } })
  await prisma.vehicleModel.create({ data: { makeId: land.id, name: 'Defender', slug: 'defender' } })
  await prisma.vehicleModel.create({ data: { makeId: land.id, name: 'Freelander', slug: 'freelander' } })

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
      img: '/img/product.jpg',
      specs: { viscosity: '0W-20', apiStandard: 'API SP', aeceaStandard: 'ACEA C6', isFullySynth: true, vehicleTypes: ['AUTOMOBILE'], fuelTypes: ['ESSENCE', 'DIESEL'], minCylinders: 3, maxCylinders: 6, minPower: 90, maxPower: 300 },
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
      img: '/img/product.jpg',
      specs: { viscosity: '5W-40', apiStandard: 'API SN PLUS', aeceaStandard: 'ACEA A3/B4', isFullySynth: true, vehicleTypes: ['AUTOMOBILE', 'POIDS_LOURD'], fuelTypes: ['DIESEL', 'ESSENCE'], minCylinders: 4, maxCylinders: 8 },
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
      img: '/img/product.jpg',
      specs: { viscosity: '10W-40', apiStandard: 'API SN', aeceaStandard: 'ACEA A3/B4', isSemiSynth: true, vehicleTypes: ['AUTOMOBILE'], fuelTypes: ['ESSENCE', 'DIESEL'] },
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
      img: '/img/product.jpg',
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
      img: '/img/product.jpg',
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
      img: '/img/product.jpg',
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
      img: '/img/product.jpg',
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
        specs: Object.keys(p.specs).length ? { create: p.specs as any } : undefined,
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
          create: [{ url: '/img/product.jpg', isPrimary: true }]
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

