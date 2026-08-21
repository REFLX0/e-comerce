const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resolveCategoryIds(slug) {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!category) return [];

  const categories = await prisma.category.findMany({
    select: { id: true, parentId: true },
  });
  
  const ids = new Set([category.id]);
  const pending = [category.id];
  while (pending.length > 0) {
    const parentId = pending.shift();
    for (const child of categories) {
      if (child.parentId === parentId && !ids.has(child.id)) {
        ids.add(child.id);
        pending.push(child.id);
      }
    }
  }
  return Array.from(ids);
}

async function test() {
  const ids = await resolveCategoryIds('moto-karting');
  console.log('IDs found for moto-karting:', ids);
  
  // Count products for these IDs
  if (ids.length > 0) {
    const count = await prisma.product.count({
      where: { categoryId: { in: ids } }
    });
    console.log('Total products for moto-karting:', count);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
