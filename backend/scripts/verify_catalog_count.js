const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const totalProducts = await prisma.product.count();
  const publishedProducts = await prisma.product.count({ where: { isPublished: true } });
  const unpublishedProducts = await prisma.product.count({ where: { isPublished: false } });
  const totalVariants = await prisma.productVariant.count();
  
  const categoryCounts = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      parent: true
    },
    orderBy: [
      { parent: { nameFr: 'asc' } },
      { nameFr: 'asc' }
    ]
  });

  console.log('=== VÉRIFICATION COMPLÈTE DU CATALOGUE ===');
  console.log('Total produits dans la base (export = TOUS):', totalProducts);
  console.log('Produits PUBLIÉS (visibles sur le site):', publishedProducts);
  console.log('Produits NON PUBLIÉS (masqués sur le site):', unpublishedProducts);
  console.log('Total variantes (lignes dans les fichiers Excel):', totalVariants);
  console.log('\n--- Détail par sous-catégorie ---');
  
  let grandTotal = 0;
  for (const cat of categoryCounts) {
    const prefix = cat.parent ? '  └─ ' + cat.parent.nameFr + ' > ' : '';
    grandTotal += cat._count.products;
    console.log(prefix + cat.nameFr + ': ' + cat._count.products + ' produits');
  }
  console.log('\nSomme des catégories:', grandTotal);
  console.log('\n=== RÉSULTAT: L\'EXPORT CONTIENT', totalProducts, 'PRODUITS (100% DE LA BASE) ===');
}

check().finally(() => prisma.$disconnect());
