import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting category restructure...')
  
  // 1. Ensure Automobile exists
  let automobile = await prisma.category.findUnique({ where: { slug: 'automobile' } })
  if (!automobile) {
    automobile = await prisma.category.create({
      data: {
        id: 'nav-automobile',
        nameFr: 'Automobile',
        slug: 'automobile',
        sortOrder: 1,
      }
    })
  }

  // 2. Move existing fluids under Automobile
  const fluids = [
    { slug: 'huiles-moteur', name: 'Huile moteur', order: 0 },
    { slug: 'frein', name: 'Liquide de frein', order: 1 },
    { slug: 'direction-assistee', name: 'Liquide de direction', order: 2 },
    { slug: 'transmission', name: 'Huile de boîte', order: 3 },
  ]

  for (const fluid of fluids) {
    await prisma.category.upsert({
      where: { slug: fluid.slug },
      create: {
        id: `nav-${fluid.slug}`,
        nameFr: fluid.name,
        slug: fluid.slug,
        sortOrder: fluid.order,
        parentId: automobile.id
      },
      update: {
        nameFr: fluid.name,
        parentId: automobile.id,
        sortOrder: fluid.order,
      }
    })
  }

  // 3. Add new fluids under Automobile
  const newFluids = [
    { slug: 'refroidissement', name: 'Liquide de refroidissement', order: 4 },
    { slug: 'adblue', name: 'AD Blue', order: 5 },
  ]

  for (const fluid of newFluids) {
    await prisma.category.upsert({
      where: { slug: fluid.slug },
      create: {
        id: `nav-${fluid.slug}`,
        nameFr: fluid.name,
        slug: fluid.slug,
        sortOrder: fluid.order,
        parentId: automobile.id
      },
      update: {
        nameFr: fluid.name,
        parentId: automobile.id,
        sortOrder: fluid.order,
      }
    })
  }

  // 4. Create Additifs top level
  let additifs = await prisma.category.findUnique({ where: { slug: 'additifs' } })
  if (!additifs) {
    additifs = await prisma.category.create({
      data: {
        id: 'nav-additifs',
        nameFr: 'Additifs',
        slug: 'additifs',
        sortOrder: 2,
      }
    })
  } else {
    additifs = await prisma.category.update({
      where: { id: additifs.id },
      data: { parentId: null }
    })
  }

  // 5. Create Additifs subcategories
  const additifsSub = [
    { slug: 'additif-essence', name: 'Additif Essence', order: 0 },
    { slug: 'additif-diesel', name: 'Additif Diesel', order: 1 },
    { slug: 'additif-huile', name: 'Additif Huile', order: 2 },
  ]

  for (const sub of additifsSub) {
    await prisma.category.upsert({
      where: { slug: sub.slug },
      create: {
        id: `nav-${sub.slug}`,
        nameFr: sub.name,
        slug: sub.slug,
        sortOrder: sub.order,
        parentId: additifs.id
      },
      update: {
        nameFr: sub.name,
        parentId: additifs.id,
        sortOrder: sub.order,
      }
    })
  }

  console.log('Category restructure complete.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
