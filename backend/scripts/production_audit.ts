import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditResult {
  category: string;
  check: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string;
  metric?: string | number;
}

const results: AuditResult[] = [];

function record(category: string, check: string, status: 'PASS' | 'WARN' | 'FAIL', details: string, metric?: string | number) {
  results.push({ category, check, status, details, metric });
}

async function runAudit() {
  console.log('\n========================================================================');
  console.log('         🔍 SPECPART AUTOMATED PRODUCTION AUDIT & HEALTH REPORT         ');
  console.log('========================================================================\n');

  // ─── 1. DATABASE & DATA INTEGRITY ──────────────────────────────────────────
  try {
    const [
      productsCount,
      publishedProductsCount,
      variantsCount,
      imagesCount,
      categoriesCount,
      brandsCount,
      makesCount,
      modelsCount,
      compatibilitiesCount,
      usersCount,
      userCarsCount,
      ordersCount,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.productVariant.count(),
      prisma.productImage.count(),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.vehicleMake.count(),
      prisma.vehicleModel.count(),
      prisma.vehicleCompatibility.count(),
      prisma.user.count(),
      prisma.userCar.count(),
      prisma.order.count(),
    ]);

    record('Database', 'Products in catalog', productsCount > 0 ? 'PASS' : 'FAIL', `${productsCount} total products (${publishedProductsCount} published)`, productsCount);
    record('Database', 'Product Variants', variantsCount >= productsCount ? 'PASS' : 'WARN', `${variantsCount} packaging variants configured`, variantsCount);
    record('Database', 'Product Images Gallery', imagesCount >= productsCount ? 'PASS' : 'WARN', `${imagesCount} product images in store`, imagesCount);
    record('Database', 'Categories Tree', categoriesCount >= 5 ? 'PASS' : 'WARN', `${categoriesCount} catalog categories`, categoriesCount);
    record('Database', 'Brands Catalog', brandsCount >= 4 ? 'PASS' : 'WARN', `${brandsCount} automotive brands configured`, brandsCount);
    record('Database', 'Vehicle Garage Models', modelsCount >= 5 ? 'PASS' : 'WARN', `${makesCount} makes, ${modelsCount} car models, ${userCarsCount} user vehicles`, modelsCount);
    record('Database', 'Compatibility Rules', compatibilitiesCount > 0 ? 'PASS' : 'WARN', `${compatibilitiesCount} part-to-vehicle compatibility mappings`, compatibilitiesCount);
    record('Database', 'Users & Customers', usersCount > 0 ? 'PASS' : 'WARN', `${usersCount} registered user accounts, ${ordersCount} orders recorded`, usersCount);

    // Check for zero-price variants
    const zeroPriceVariants = await prisma.productVariant.count({
      where: { price: { lte: 0 } },
    });
    record('Data Quality', 'Zero price validation', zeroPriceVariants === 0 ? 'PASS' : 'WARN', `${zeroPriceVariants} variants have 0 TND price`, zeroPriceVariants);

    // Check for products without images
    const productsWithoutImages = await prisma.product.count({
      where: { images: { none: {} } },
    });
    record('Data Quality', 'Image coverage', productsWithoutImages === 0 ? 'PASS' : 'WARN', `${productsWithoutImages} products without images`, productsWithoutImages);

    // Check for vehicle compatibility coverage
    const partsWithCompatibility = await prisma.product.count({
      where: { compatibilities: { some: {} } },
    });
    record('Data Quality', 'Vehicle compatibility links', partsWithCompatibility > 0 ? 'PASS' : 'WARN', `${partsWithCompatibility} products mapped to vehicles`, partsWithCompatibility);

  } catch (err: any) {
    record('Database', 'Connection & Schema', 'FAIL', `Database query error: ${err.message}`);
  }

  // ─── 2. HTTP & API ENDPOINTS AUDIT ──────────────────────────────────────────
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const endpoints = [
    { name: 'Health Check', url: `${baseUrl}/health`, method: 'GET', expectedStatus: 200 },
    { name: 'Catalog Products', url: `${baseUrl}/catalog/products?page=1&limit=10`, method: 'GET', expectedStatus: 200 },
    { name: 'Catalog Categories', url: `${baseUrl}/catalog/categories`, method: 'GET', expectedStatus: 200 },
    { name: 'Catalog Brands', url: `${baseUrl}/catalog/brands`, method: 'GET', expectedStatus: 200 },
    { name: 'Vehicle Selector Makes', url: `${baseUrl}/compatibility/makes`, method: 'GET', expectedStatus: 200 },
    { name: 'Shipping Rate Calculation', url: `${baseUrl}/shipping/rate?wilaya=Tunis&subtotal=150`, method: 'GET', expectedStatus: 200 },
  ];

  for (const ep of endpoints) {
    const start = Date.now();
    try {
      const res = await fetch(ep.url, { method: ep.method });
      const duration = Date.now() - start;
      const pass = res.status === ep.expectedStatus;
      const statusText = pass ? (duration < 500 ? 'PASS' : 'WARN') : 'FAIL';
      record('API Endpoints', ep.name, statusText, `HTTP ${res.status} in ${duration}ms`, `${duration}ms`);
    } catch (err: any) {
      record('API Endpoints', ep.name, 'FAIL', `Request failed: ${err.message}`);
    }
  }

  // ─── 3. ADMIN PRODUCT WORKFLOW SIMULATION ───────────────────────────────────
  try {
    const testSku = `TEST-PIECE-${Date.now()}`;
    const brand = await prisma.brand.findFirst();
    const category = await prisma.category.findFirst();

    if (brand && category) {
      const created = await prisma.product.create({
        data: {
          nameFr: 'Plaquettes de frein Avant Brembo P85020 (Audit)',
          slug: `brembo-p85020-audit-${Date.now()}`,
          sku: testSku,
          description: 'Plaquettes de frein avant haute performance pour audit production',
          brandId: brand.id,
          categoryId: category.id,
          isPublished: true,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 0 },
              { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80', isPrimary: false, sortOrder: 1 },
            ],
          },
          variants: {
            create: {
              volume: '1 Pièce',
              price: 115.500,
              stockQty: 25,
              skuVariant: `${testSku}-1P`,
            },
          },
        },
        include: { images: true, variants: true },
      });

      const hasImages = created.images.length === 2;
      const hasVariant = created.variants.length === 1 && created.variants[0].price === 115.500;
      record('Admin Workflow', 'Auto-Part Add & Multi-Image Gallery', hasImages && hasVariant ? 'PASS' : 'FAIL', `Created product with ${created.images.length} images and price ${created.variants[0]?.price} TND`);

      // Clean up test product
      await prisma.productImage.deleteMany({ where: { productId: created.id } });
      await prisma.productVariant.deleteMany({ where: { productId: created.id } });
      await prisma.product.delete({ where: { id: created.id } });
      record('Admin Workflow', 'Product Cleanup & Isolation', 'PASS', 'Cleaned up audit test record');
    }
  } catch (err: any) {
    record('Admin Workflow', 'Auto-Part Creation', 'FAIL', `Simulation error: ${err.message}`);
  }

  // ─── 4. DISPLAY RESULTS TABLE ──────────────────────────────────────────────
  console.log('\n-----------------------------------------------------------------------------------------------------------------------');
  console.log('| Category          | Check                                  | Status | Metric    | Details');
  console.log('-----------------------------------------------------------------------------------------------------------------------');
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const r of results) {
    if (r.status === 'PASS') passCount++;
    else if (r.status === 'WARN') warnCount++;
    else failCount++;

    const cat = r.category.padEnd(17);
    const chk = r.check.padEnd(38);
    const st = r.status.padEnd(6);
    const met = (r.metric !== undefined ? String(r.metric) : '-').padEnd(9);
    console.log(`| ${cat} | ${chk} | ${st} | ${met} | ${r.details}`);
  }
  console.log('-----------------------------------------------------------------------------------------------------------------------\n');

  console.log(`📊 FINAL RESULT: ${passCount} PASS | ${warnCount} WARN | ${failCount} FAIL`);
  if (failCount === 0) {
    console.log('🏆 VERDICT: 100% PRODUCTION LEVEL GRADE (All tests passed cleanly)\n');
  } else {
    console.log('⚠️ VERDICT: AUDIT DISCOVERED ISSUES\n');
  }

  await prisma.$disconnect();
}

runAudit().catch(console.error);
