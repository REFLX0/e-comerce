import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. Add MOTO vehicle makes + models
  const yamaha = await prisma.vehicleMake.upsert({
    where: { slug: 'yamaha' },
    update: {},
    create: { name: 'Yamaha', slug: 'yamaha' },
  })
  const mt07 = await prisma.vehicleModel.upsert({
    where: { slug: 'mt-07' },
    update: {},
    create: { makeId: yamaha.id, name: 'MT-07', slug: 'mt-07', vehicleType: 'MOTO' },
  })
  await prisma.vehicleModel.upsert({
    where: { slug: 'mt-09' },
    update: {},
    create: { makeId: yamaha.id, name: 'MT-09', slug: 'mt-09', vehicleType: 'MOTO' },
  })
  await prisma.vehicleModel.upsert({
    where: { slug: 'tenere-700' },
    update: {},
    create: { makeId: yamaha.id, name: 'Ténéré 700', slug: 'tenere-700', vehicleType: 'MOTO' },
  })

  const kawasaki = await prisma.vehicleMake.upsert({
    where: { slug: 'kawasaki' },
    update: {},
    create: { name: 'Kawasaki', slug: 'kawasaki' },
  })
  await prisma.vehicleModel.upsert({
    where: { slug: 'z-900' },
    update: {},
    create: { makeId: kawasaki.id, name: 'Z 900', slug: 'z-900', vehicleType: 'MOTO' },
  })
  await prisma.vehicleModel.upsert({
    where: { slug: 'ninja-650' },
    update: {},
    create: { makeId: kawasaki.id, name: 'Ninja 650', slug: 'ninja-650', vehicleType: 'MOTO' },
  })

  const bmwMotorrad = await prisma.vehicleMake.upsert({
    where: { slug: 'bmw-motorrad' },
    update: {},
    create: { name: 'BMW Motorrad', slug: 'bmw-motorrad' },
  })
  await prisma.vehicleModel.upsert({
    where: { slug: 'r-1250-gs' },
    update: {},
    create: { makeId: bmwMotorrad.id, name: 'R 1250 GS', slug: 'r-1250-gs', vehicleType: 'MOTO' },
  })

  // 2. Find or create the Moto category for products
  const cMoto = await prisma.category.findFirstOrThrow({ where: { slug: 'moto-karting' } })
  const cAutoSynth = await prisma.category.findFirstOrThrow({ where: { slug: 'auto-synthese' } })
  const motul = await prisma.brand.findFirstOrThrow({ where: { slug: 'motul' } })
  const castrol = await prisma.brand.findFirstOrThrow({ where: { slug: 'castrol' } })
  const liqui = await prisma.brand.findFirstOrThrow({ where: { slug: 'liqui-moly' } })

  // 3. Create proper MOTO product
  const existingMoto = await prisma.product.findUnique({ where: { sku: 'MOT-7100-10W40' } })
  if (!existingMoto) {
    await prisma.product.create({
      data: {
        nameFr: 'Motul 7100 10W-40 4T',
        slug: 'motul-7100-10w40-4t',
        sku: 'MOT-7100-10W40',
        description: 'Huile moteur 4 temps 100% synthèse pour motos à embrayage humide. JASO MA2.',
        brandId: motul.id,
        categoryId: cMoto.id,
        isFeatured: true,
        isPublished: true,
        variants: {
          create: [
            { volume: '1L', price: 15.0, stockQty: 80, skuVariant: 'MOT-7100-10W40-1L' },
            { volume: '4L', price: 52.0, stockQty: 30, skuVariant: 'MOT-7100-10W40-4L' },
          ],
        },
        images: { create: [{ url: '/img/products/motul-7100-10w40.png', isPrimary: true }] },
        specs: {
          create: {
            viscosity: '10W-40',
            apiStandard: 'API SN',
            jasoStandard: 'MA2',
            isFullySynth: true,
            vehicleTypes: ['MOTO'],
            fuelTypes: ['ESSENCE'],
            minCylinders: 1,
            maxCylinders: 4,
            minPower: 25,
            maxPower: 150,
          },
        },
        compatibilities: {
          create: [
            { vehicleModelId: mt07.id, engineCode: 'CP2 689cc' },
          ],
        },
      },
    })
  }

  // 4. Update the existing Motul 300V if it exists
  const motul300v = await prisma.product.findUnique({ where: { sku: 'MOT-300V-10W40' } })
  if (motul300v) {
    const existingSpecs = await prisma.productSpecs.findUnique({ where: { productId: motul300v.id } })
    if (existingSpecs) {
      await prisma.productSpecs.update({
        where: { productId: motul300v.id },
        data: {
          vehicleTypes: ['MOTO'],
          fuelTypes: ['ESSENCE'],
          minCylinders: 1,
          maxCylinders: 4,
          minPower: 30,
          maxPower: 200,
          jasoStandard: 'MA2',
        },
      })
    }
    const existingCompat = await prisma.vehicleCompatibility.findFirst({
      where: { productId: motul300v.id, vehicleModelId: mt07.id },
    })
    if (!existingCompat) {
      await prisma.vehicleCompatibility.create({
        data: { productId: motul300v.id, vehicleModelId: mt07.id },
      })
    }
  }

  // 5. Create a Castrol MOTO product
  const existingCastrolMoto = await prisma.product.findUnique({ where: { sku: 'CAS-PW-10W40' } })
  if (!existingCastrolMoto) {
    await prisma.product.create({
      data: {
        nameFr: 'Castrol Power 1 10W-40 4T',
        slug: 'castrol-power-1-10w40-4t',
        sku: 'CAS-PW-10W40',
        description: 'Huile moto 4 temps haute performance pour tous les types de motos.',
        brandId: castrol.id,
        categoryId: cMoto.id,
        isFeatured: true,
        isPublished: true,
        variants: {
          create: [
            { volume: '1L', price: 13.5, stockQty: 60, skuVariant: 'CAS-PW-10W40-1L' },
            { volume: '4L', price: 48.0, stockQty: 25, skuVariant: 'CAS-PW-10W40-4L' },
          ],
        },
        images: { create: [{ url: '/img/products/castrol-power-1-10w40.png', isPrimary: true }] },
        specs: {
          create: {
            viscosity: '10W-40',
            apiStandard: 'API SN',
            jasoStandard: 'MA2',
            isFullySynth: true,
            vehicleTypes: ['MOTO'],
            fuelTypes: ['ESSENCE'],
            minCylinders: 1,
            maxCylinders: 4,
            minPower: 20,
            maxPower: 180,
          },
        },
        compatibilities: {
          create: [
            { vehicleModelId: mt07.id, engineCode: 'CP2 689cc' },
          ],
        },
      },
    })
  }

  // 6. Create an additional automobile product with good oil-recommendation specs
  const liquiMolyAuto = await prisma.product.findUnique({ where: { sku: 'LM-5W30-AUTO' } })
  if (!liquiMolyAuto) {
    const renault = await prisma.vehicleMake.findFirstOrThrow({ where: { slug: 'renault' } })
    const clio = await prisma.vehicleModel.findFirstOrThrow({ where: { makeId: renault.id, slug: 'clio-4' } })
    const megane = await prisma.vehicleModel.findFirstOrThrow({ where: { makeId: renault.id, slug: 'megane-4' } })

    await prisma.product.create({
      data: {
        nameFr: 'Liqui Moly Synthoil High Tech 5W-30',
        slug: 'liqui-moly-synthoil-5w30',
        sku: 'LM-5W30-AUTO',
        description: 'Huile moteur entièrement synthétique haute performance pour moteurs essence et diesel.',
        brandId: liqui.id,
        categoryId: cAutoSynth.id,
        isFeatured: true,
        isPublished: true,
        variants: {
          create: [
            { volume: '1L', price: 16.5, stockQty: 70, skuVariant: 'LM-5W30-AUTO-1L' },
            { volume: '5L', price: 72.0, stockQty: 40, skuVariant: 'LM-5W30-AUTO-5L' },
          ],
        },
        images: { create: [{ url: '/img/products/liqui-moly-synthoil-5w30.png', isPrimary: true }] },
        specs: {
          create: {
            viscosity: '5W-30',
            apiStandard: 'API SN PLUS',
            aeceaStandard: 'ACEA C3',
            isFullySynth: true,
            vehicleTypes: ['AUTOMOBILE'],
            fuelTypes: ['ESSENCE', 'DIESEL'],
            minCylinders: 3,
            maxCylinders: 8,
            minPower: 75,
            maxPower: 400,
            DPFCompatible: true,
            TurboCompatible: true,
          },
        },
        compatibilities: {
          create: [
            { vehicleModelId: clio.id, engineCode: '1.5 dCi 90' },
            { vehicleModelId: megane.id, engineCode: '1.6 dCi 130' },
          ],
        },
      },
    })

    // 7. Add new Renault model with MOTO vehicle type to ensure diverse search
    const dacia = await prisma.vehicleMake.findFirstOrThrow({ where: { slug: 'dacia' } })
    const sandero = await prisma.vehicleModel.findFirstOrThrow({ where: { makeId: dacia.id, slug: 'sandero' } })

    // Add compatibility for Yacco Lube DI to Sandero
    const yacco = await prisma.product.findUnique({ where: { sku: 'YAC-0W20' } })
    if (yacco) {
      const existingYaccoCompat = await prisma.vehicleCompatibility.findFirst({
        where: { productId: yacco.id, vehicleModelId: sandero.id },
      })
      if (!existingYaccoCompat) {
        await prisma.vehicleCompatibility.create({
          data: { productId: yacco.id, vehicleModelId: sandero.id, engineCode: '0.9 TCe 90' },
        })
      }
    }
  }

  console.log('Supplementary seed complete: MOTO makes/models/products added, auto products enhanced')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
