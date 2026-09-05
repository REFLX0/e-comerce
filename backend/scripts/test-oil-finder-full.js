#!/usr/bin/env node
/**
 * Full Oil Finder validation — KiosqueTN / specpart
 *
 * Strategy:
 * 1. Pull vehicle-to-product compatibility rows directly from the DB (`VehicleCompatibility`).
 * 2. Query the live Oil Finder API: GET /api/oil-finder/vehicle?make=...&model=...&engineCode=...
 * 3. Verify if the API successfully resolves the vehicle specification and recommends the expected SKU.
 * 4. Also supports validating against `OilFinderVehicle` dataset if specified (--source=dataset).
 *
 * Run inside your backend container / VM:
 *   BASE_URL=http://localhost:4000 node scripts/test-oil-finder-full.js
 *
 * Options:
 *   BASE_URL=http://localhost:4000  Backend base URL (default: http://localhost:4000 or http://localhost:3000)
 *   --limit=50                      Test only first N entries
 *   --concurrency=5                 Number of concurrent API calls (default: 5)
 *   --source=compat|dataset         Data source: 'compat' (VehicleCompatibility) or 'dataset' (OilFinderVehicle)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = (process.env.BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');
const ENDPOINT = '/api/oil-finder/vehicle';

// Parse CLI flags
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage:
  BASE_URL=http://localhost:4000 node scripts/test-oil-finder-full.js [options]

Options:
  --limit=N                Test only first N entries (e.g. --limit=50)
  --concurrency=N          Number of concurrent HTTP requests (default: 5)
  --source=compat|dataset  Data source:
                             'compat'  -> VehicleCompatibility table (vehicle -> product SKU)
                             'dataset' -> OilFinderVehicle table (35k staging vehicles -> oil spec)
  --help, -h               Show this help message
`);
  process.exit(0);
}

const limitArg = args.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

const concurrencyArg = args.find((a) => a.startsWith('--concurrency='));
const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : 5;

const sourceArg = args.find((a) => a.startsWith('--source='));
const SOURCE = sourceArg ? sourceArg.split('=')[1] : 'compat';

/**
 * 1. Fetch VehicleCompatibility rows from DB
 */
async function getCompatibilityRows(limit) {
  return prisma.vehicleCompatibility.findMany({
    include: {
      vehicleModel: {
        include: {
          make: true,
        },
      },
      product: {
        select: {
          id: true,
          sku: true,
          nameFr: true,
          isPublished: true,
        },
      },
    },
    take: limit,
  });
}

/**
 * Alternative: Fetch OilFinderVehicle dataset rows (staging vehicle specs)
 */
async function getOilFinderDatasetRows(limit) {
  return prisma.oilFinderVehicle.findMany({
    include: {
      oilSpec: true,
    },
    take: limit,
  });
}

/**
 * 2. Build Query Parameters for the live Oil Finder API
 */
function buildQueryParams(row, isDataset = false) {
  if (isDataset) {
    return new URLSearchParams({
      make: row.make || '',
      model: row.model || '',
      engineCode: row.engineCode || '',
    }).toString();
  }

  const make = row.vehicleModel?.make?.name || '';
  const model = row.vehicleModel?.name || '';
  const engine = row.engineCode || '';

  const params = new URLSearchParams({
    make,
    model,
  });
  if (engine) {
    params.set('engineCode', engine);
  }
  return params.toString();
}

/**
 * 3. Extract Result from the API response
 */
function extractResult(json) {
  const products = Array.isArray(json?.data) ? json.data : [];
  const skus = products.map((p) => p.sku).filter(Boolean);

  return {
    status: json?.oilFinderStatus || (json?.data?.length ? 'found' : 'not_found'),
    skus,
    total: json?.total ?? products.length,
    oilSpec: json?.oilSpec || null,
    viscosity: json?.oilSpec?.viscosity || null,
    oemApproval: json?.oilSpec?.oemApproval || null,
    resolvedBy: json?.resolvedBy || null,
    confidence: json?.confidence || null,
  };
}

/**
 * 4. Call live Oil Finder API (GET /api/oil-finder/vehicle?...)
 */
async function callOilFinder(row, isDataset = false) {
  const qs = buildQueryParams(row, isDataset);
  const url = `${BASE_URL}${ENDPOINT}?${qs}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    let errorText = '';
    try {
      const errJson = await res.json();
      errorText = errJson?.message || JSON.stringify(errJson);
    } catch {
      errorText = await res.text();
    }
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
  }

  const json = await res.json();
  return extractResult(json);
}

/**
 * Concurrency runner helper
 */
async function mapConcurrent(items, concurrency, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Main validation routine
 */
async function main() {
  console.log(`\n============================================================`);
  console.log(`🚀 Oil Finder Live Validation — specpart / KiosqueTN`);
  console.log(`============================================================`);
  console.log(`API URL:      ${BASE_URL}${ENDPOINT}`);
  console.log(`Data Source:  ${SOURCE}`);
  if (LIMIT) console.log(`Limit:        ${LIMIT}`);
  console.log(`Concurrency:  ${CONCURRENCY}\n`);

  if (SOURCE === 'dataset') {
    await validateDataset();
  } else {
    await validateCompatibility();
  }

  await prisma.$disconnect();
}

/**
 * Validation using VehicleCompatibility
 */
async function validateCompatibility() {
  const count = await prisma.vehicleCompatibility.count();
  console.log(`Found ${count} total vehicle compatibility entries in database.`);

  if (count === 0) {
    console.warn(`\n⚠️  The 'VehicleCompatibility' table is currently empty.`);
    console.warn(`Tip: You can validate the 35,000+ vehicle staging dataset instead by running:`);
    console.warn(`   node scripts/test-oil-finder-full.js --source=dataset --limit=100\n`);
    return;
  }

  const rows = await getCompatibilityRows(LIMIT);
  console.log(`Testing ${rows.length} rows...\n`);

  let exactPass = 0;
  let specPass = 0;
  let fail = 0;
  let errors = 0;
  let orphaned = 0;
  const failures = [];

  await mapConcurrent(rows, CONCURRENCY, async (row, i) => {
    const expectedSku = row.product?.sku;
    const make = row.vehicleModel?.make?.name || 'UnknownMake';
    const model = row.vehicleModel?.name || 'UnknownModel';
    const years = [row.yearFrom, row.yearTo].filter(Boolean).join('-');
    const label = `[${i + 1}/${rows.length}] ${make} ${model} ${years} (${row.engineCode || 'no-engine'})`;

    // 1. Check if product is missing or unpublished
    if (!row.product || row.product.isPublished === false) {
      orphaned++;
      failures.push(`⚠️  ${label} -> points to unpublished/missing product (SKU: ${expectedSku ?? 'none'})`);
      return;
    }

    try {
      const result = await callOilFinder(row, false);
      const hasExpectedSku = result.skus.includes(expectedSku);

      if (hasExpectedSku) {
        exactPass++;
      } else if (result.status === 'found' && result.total > 0) {
        // Vehicle was resolved and oils were returned, but not this exact SKU
        specPass++;
        failures.push(
          `ℹ️  ${label} -> spec matched (${result.viscosity || 'viscosity ok'}, ${result.total} oils), but SKU ${expectedSku} not in top results [${result.skus.slice(0, 3).join(', ')}]`
        );
      } else {
        fail++;
        failures.push(`❌ ${label} -> expected ${expectedSku}, API status: '${result.status}', 0 oils returned`);
      }
    } catch (e) {
      errors++;
      failures.push(`💥 ${label} -> ERROR: ${e.message}`);
    }
  });

  console.log(`\n=== Summary ===`);
  console.log(`✅ Exact SKU Pass:   ${exactPass}`);
  console.log(`🔹 Spec/Family Pass:  ${specPass} (Vehicle recognized & oils returned, but specific SKU not in top recommendations)`);
  console.log(`❌ Fail (Not Found): ${fail}`);
  console.log(`⚠️  Orphaned:         ${orphaned} (Product unpublished or deleted)`);
  console.log(`💥 Errors / Timeout:  ${errors}`);
  console.log(`Total tested:         ${rows.length}\n`);

  if (failures.length) {
    console.log(`=== Details & Discrepancies (first 30) ===`);
    failures.slice(0, 30).forEach((f) => console.log(f));
    if (failures.length > 30) {
      console.log(`... and ${failures.length - 30} more`);
    }
  }
}

/**
 * Validation using OilFinderVehicle (Staging Dataset)
 */
async function validateDataset() {
  const count = await prisma.oilFinderVehicle.count();
  console.log(`Found ${count} total OilFinderVehicle entries in database.`);

  const rows = await getOilFinderDatasetRows(LIMIT);
  console.log(`Testing ${rows.length} rows against live API...\n`);

  let pass = 0;
  let fail = 0;
  let errors = 0;
  const failures = [];

  await mapConcurrent(rows, CONCURRENCY, async (row, i) => {
    const expectedViscosity = row.oilSpec?.viscosity;
    const label = `[${i + 1}/${rows.length}] ${row.make} ${row.model} (${row.engineCode || row.fuelType})`;

    try {
      const result = await callOilFinder(row, true);
      const isMatch = result.status === 'found' && (!expectedViscosity || result.viscosity === expectedViscosity);

      if (isMatch) {
        pass++;
      } else {
        fail++;
        failures.push(
          `❌ ${label} -> expected viscosity "${expectedViscosity}", got API status="${result.status}" viscosity="${result.viscosity ?? 'null'}"`
        );
      }
    } catch (e) {
      errors++;
      failures.push(`💥 ${label} -> ERROR: ${e.message}`);
    }
  });

  console.log(`\n=== Summary ===`);
  console.log(`✅ Pass:              ${pass}`);
  console.log(`❌ Fail / Mismatch:   ${fail}`);
  console.log(`💥 Errors / Timeout:  ${errors}`);
  console.log(`Total tested:         ${rows.length}\n`);

  if (failures.length) {
    console.log(`=== Details & Discrepancies (first 30) ===`);
    failures.slice(0, 30).forEach((f) => console.log(f));
    if (failures.length > 30) {
      console.log(`... and ${failures.length - 30} more`);
    }
  }
}

main().catch(async (e) => {
  console.error('\nFatal Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
