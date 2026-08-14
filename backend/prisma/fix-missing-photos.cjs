const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const categoriesToUpdate = [
    { slug: 'pieces-auto', image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?q=80&w=600' },
    { slug: 'lubrifiants', image: 'https://images.unsplash.com/photo-1600712242805-5f78671f7c4b?q=80&w=600' },
    { slug: 'moto-karting', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600' },
    { slug: 'marine', image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=600' },
    // Also set pieces-auto if it exists under another slug
    { slug: 'automobile', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=600' }
  ];

  let updatedCount = 0;
  for (const catData of categoriesToUpdate) {
    const cat = await prisma.category.findFirst({ where: { slug: catData.slug } });
    if (cat) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { imageUrl: catData.image } // Use imageUrl instead of image
      });
      console.log(`Updated category: ${catData.slug}`);
      updatedCount++;
    } else {
      // It might be named differently, let's try searching by nameFr
      if (catData.slug === 'pieces-auto') {
        const catByName = await prisma.category.findFirst({ where: { nameFr: 'Pièces Auto' } });
        if (catByName) {
          await prisma.category.update({
            where: { id: catByName.id },
            data: { imageUrl: catData.image }
          });
          console.log(`Updated category by name: Pièces Auto`);
          updatedCount++;
        }
      }
    }
  }
  
  console.log(`Finished updating ${updatedCount} categories.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
