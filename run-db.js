const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const images = await prisma.productImage.findMany({ where: { url: { endsWith: '.jpg' } } });
  for(const i of images) await prisma.productImage.update({ where: { id: i.id }, data: { url: i.url.replace('.jpg', '.png') } });
  const cats = await prisma.category.findMany({ where: { imageUrl: { endsWith: '.jpg' } } });
  for(const c of cats) {
    if (c.imageUrl) await prisma.category.update({ where: { id: c.id }, data: { imageUrl: c.imageUrl.replace('.jpg', '.png') } });
  }
  console.log('Successfully updated DB');
}
main().catch(console.error).finally(() => prisma.$disconnect());
