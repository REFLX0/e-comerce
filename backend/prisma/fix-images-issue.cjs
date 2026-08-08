const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fixing category images...');
  await prisma.category.updateMany({
    where: { slug: 'hydraulique' },
    data: { imageUrl: '/img/categories/hydraulique.png' }
  });

  await prisma.category.updateMany({
    where: { slug: 'frein' },
    data: { imageUrl: '/img/categories/frein.png' }
  });

  console.log('Fixing amazon images...');
  const count = await prisma.productImage.updateMany({
    where: { url: { contains: 'm.media-amazon.com' } },
    data: { url: 'https://images.unsplash.com/photo-1600712242805-5f78671f7c4b?q=80&w=600' }
  });
  console.log(`Updated ${count.count} amazon images to fallback Unsplash image.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
