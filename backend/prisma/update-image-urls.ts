import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Migrating image URLs from .jpg to .png...')
  
  const productImages = await prisma.productImage.findMany({
    where: {
      url: {
        endsWith: '.jpg'
      }
    }
  })

  console.log(`Found ${productImages.length} ProductImages to update.`)
  
  let pCount = 0;
  for (const img of productImages) {
    await prisma.productImage.update({
      where: { id: img.id },
      data: { url: img.url.replace('.jpg', '.png') }
    })
    pCount++;
  }
  
  const categories = await prisma.category.findMany({
    where: {
      imageUrl: {
        endsWith: '.jpg'
      }
    }
  })

  console.log(`Found ${categories.length} Categories to update.`)

  let cCount = 0;
  for (const cat of categories) {
    if (cat.imageUrl) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { imageUrl: cat.imageUrl.replace('.jpg', '.png') }
      })
      cCount++;
    }
  }

  console.log(`Successfully updated ${pCount} ProductImages and ${cCount} Categories.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
