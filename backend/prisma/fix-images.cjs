const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const updates = [
    { slug: 'liqui-moly-ceratec', img: '/img/products/liqui-moly-ceratec.png' },
    { slug: 'motul-300v-10w40', img: '/img/products/motul-300v-10w40.png' },
    { slug: 'castrol-edge-5w30-ll', img: '/img/products/castrol-edge-5w30-ll.png' },
    { slug: 'shell-helix-ultra-5w40', img: '/img/products/shell-helix-ultra-5w40.png' },
    { slug: 'yacco-lube-di-0w20-c6', img: '/img/products/yacco-lube-di-0w20-c6.png' },
    { slug: 'total-quartz-7000-10w40', img: '/img/products/total-quartz-7000-10w40.png' },
    { slug: 'huile-standard-v1-15w40', img: '/img/products/huile-standard-v1-15w40.png' },
  ];
  for (const u of updates) {
    const product = await p.product.findUnique({ where: { slug: u.slug } });
    if (!product) { console.log('NOT FOUND:', u.slug); continue; }
    const existing = await p.productImage.findFirst({ where: { productId: product.id, isPrimary: true } });
    if (existing) {
      await p.productImage.update({ where: { id: existing.id }, data: { url: u.img } });
    } else {
      await p.productImage.create({ data: { productId: product.id, url: u.img, isPrimary: true, sortOrder: 0 } });
    }
    console.log('UPDATED:', u.slug);
  }
}
main().catch(console.error).finally(() => p.$disconnect());
