const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const categories = {
    'Huiles Moteur': 'https://m.media-amazon.com/images/I/71rO2aXmZ4L._AC_SL1500_.jpg',
    'Huiles Transmission & Boîte': 'https://m.media-amazon.com/images/I/71r3ZJ6k-1L._AC_SL1500_.jpg',
    'Liquides Hydrauliques': 'https://m.media-amazon.com/images/I/61U0jF+0aIL._AC_SL1500_.jpg',
    'Graisses & Lubrifiants': 'https://m.media-amazon.com/images/I/71tK6Eozl-L._AC_SL1500_.jpg',
    'Liquides de Refroidissement': 'https://m.media-amazon.com/images/I/61dC2R+dIHL._AC_SL1500_.jpg',
    'Liquides de Frein': 'https://m.media-amazon.com/images/I/71m6n2+oT-L._AC_SL1500_.jpg',
    'Additifs & Entretien': 'https://m.media-amazon.com/images/I/61dC2R+dIHL._AC_SL1500_.jpg',
    'Moto': 'https://m.media-amazon.com/images/I/71r3ZJ6k-1L._AC_SL1500_.jpg',
    'Poids Lourd & Agricole': 'https://m.media-amazon.com/images/I/71tK6Eozl-L._AC_SL1500_.jpg',
    'Automobile': 'https://m.media-amazon.com/images/I/71rO2aXmZ4L._AC_SL1500_.jpg'
  };
  
  let updated = 0;
  for (const [name, image] of Object.entries(categories)) {
    const cat = await prisma.category.findFirst({ where: { name } });
    if (cat) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { image }
      });
      updated++;
    }
  }
  console.log('Updated ' + updated + ' categories with images');
}

run().catch(console.error).finally(() => prisma.$disconnect());
