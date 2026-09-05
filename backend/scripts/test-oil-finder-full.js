#!/usr/bin/env node
/**
 * Full Oil Finder validation — KiosqueTN / specpart
 *
 * Modes:
 *   1. HTTP Mode (default): Calls live API GET /api/oil-finder/vehicle
 *      Includes automatic HTTP 429 Throttler backoff & retry so high volumes succeed.
 *   2. Direct Mode (--direct): Directly invokes OilFinderService in-process
 *      Bypasses HTTP overhead & rate limits — tests all 6,400+ vehicles in seconds!
 *
 * Run inside container / VM:
 *   docker exec -it specpart-backend node test-oil-finder-full.js --source=dataset --direct
 *   docker exec -it specpart-backend node test-oil-finder-full.js --source=dataset --limit=500
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
  node test-oil-finder-full.js [options]

Options:
  --direct                 Direct service mode (bypasses HTTP rate limits, tests in seconds)
  --source=compat|dataset  Data source:
                             'dataset' -> OilFinderVehicle table (6,400+ vehicles -> oil specs)
                             'compat'  -> VehicleCompatibility table (vehicle -> product SKU)
  --limit=N                Test only first N entries (e.g. --limit=500)
  --concurrency=N          Number of concurrent workers (default: 5, recommend 15 for --direct)
  --delay=N                Delay in ms between HTTP requests (default: 0)
  --help, -h               Show this help message
`);
  process.exit(0);
}

const IS_DIRECT = args.includes('--direct') || args.includes('-d');
const limitArg = args.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

const concurrencyArg = args.find((a) => a.startsWith('--concurrency='));
const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : (IS_DIRECT ? 15 : 5);

const sourceArg = args.find((a) => a.startsWith('--source='));
const SOURCE = sourceArg ? sourceArg.split('=')[1] : 'compat';

const delayArg = args.find((a) => a.startsWith('--delay='));
const DELAY_MS = delayArg ? parseInt(delayArg.split('=')[1], 10) : 0;

// Direct service loader
let directService = null;
if (IS_DIRECT) {
  try {
    const servicePaths = [
      './dist/src/oil-finder/oil-finder.service',
      '../dist/src/oil-finder/oil-finder.service',
      '/app/dist/src/oil-finder/oil-finder.service',
    ];
    let loaded = null;
    for (const p of servicePaths) {
      try {
        loaded = require(p);
        if (loaded?.OilFinderService) break;
      } catch {}
    }
    if (loaded && loaded.OilFinderService) {
      directService = new loaded.OilFinderService(prisma);
    } else {
      console.warn('⚠️ Could not load compiled OilFinderService for --direct mode. Falling back to HTTP API mode.');
    }
  } catch (e) {
    console.warn('⚠️ Direct service initialization failed:', e.message, 'Falling back to HTTP mode.');
  }
}

/**
 * 1. Fetch VehicleCompatibility rows from DB
 */
async function getCompatibilityRows(limit) {
  return prisma.vehicleCompatibility.findMany({
    include: {
      vehicleModel: { include: { make: true } },
      product: { select: { id: true, sku: true, nameFr: true, isPublished: true } },
    },
    take: limit,
  });
}

/**
 * Alternative: Fetch OilFinderVehicle dataset rows (staging vehicle specs)
 */
async function getOilFinderDatasetRows(limit) {
  return prisma.oilFinderVehicle.findMany({
    include: { oilSpec: true },
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

  const params = new URLSearchParams({ make, model });
  if (engine) params.set('engineCode', engine);
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

// Global pause promise to coordinate all workers when HTTP 429 occurs
let throttlePausePromise = null;

async function waitIfThrottled() {
  if (throttlePausePromise) {
    await throttlePausePromise;
  }
}

function triggerThrottlePause(durationMs = 15000) {
  if (!throttlePausePromise) {
    process.stdout.write(`\n⏳ [Throttler 429] Limite de débit atteinte. Pause de ${Math.round(durationMs / 1000)}s pour réinitialiser la fenêtre... `);
    throttlePausePromise = new Promise((resolve) => {
      setTimeout(() => {
        throttlePausePromise = null;
        console.log('Reprise des tests !');
        resolve();
      }, durationMs);
    });
  }
  return throttlePausePromise;
}

/**
 * 4. Call Oil Finder (HTTP or Direct)
 */
async function callOilFinder(row, isDataset = false) {
  if (directService) {
    const make = isDataset ? (row.make || '') : (row.vehicleModel?.make?.name || '');
    const model = isDataset ? (row.model || '') : (row.vehicleModel?.name || '');
    const engine = isDataset ? (row.engineCode || '') : (row.engineCode || '');

    const res = await directService.findByVehicle(make, model, engine);
    return {
      status: res.status,
      skus: [],
      total: res.status === 'found' ? 1 : 0,
      oilSpec: res.status === 'found' ? res.oilSpec : null,
      viscosity: res.status === 'found' ? res.oilSpec?.viscosity : null,
      oemApproval: res.status === 'found' ? res.oilSpec?.oemApproval : null,
      resolvedBy: res.status === 'found' ? res.resolvedBy : null,
      confidence: res.status === 'found' ? res.confidence : null,
    };
  }

  // HTTP API Call with automatic 429 backoff
  const qs = buildQueryParams(row, isDataset);
  const url = `${BASE_URL}${ENDPOINT}?${qs}`;

  let maxRetries = 6;
  while (maxRetries > 0) {
    await waitIfThrottled();
    if (DELAY_MS > 0) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.status === 429) {
      maxRetries--;
      const retryHeader = parseInt(res.headers.get('retry-after') || '15', 10);
      const waitTime = Math.max(retryHeader * 1000, 15000);
      await triggerThrottlePause(waitTime);
      continue;
    }

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

  throw new Error('HTTP 429: ThrottlerException persistante après plusieurs tentatives');
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
  console.log(`Mode:         ${directService ? '⚡ DIRECT IN-PROCESS (Sans limite de débit)' : '🌐 HTTP API (' + BASE_URL + ENDPOINT + ')'}`);
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
    console.warn(`Tip: Validate the 6,400+ vehicle dataset instead by running:`);
    console.warn(`   node test-oil-finder-full.js --source=dataset --direct\n`);
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
      } else if (result.status === 'found' && (result.total > 0 || directService)) {
        specPass++;
        failures.push(
          `ℹ️  ${label} -> spec matched (${result.viscosity || 'viscosity ok'}), but SKU ${expectedSku} not in top results`
        );
      } else {
        fail++;
        failures.push(`❌ ${label} -> expected ${expectedSku}, API status: '${result.status}'`);
      }
    } catch (e) {
      errors++;
      failures.push(`💥 ${label} -> ERROR: ${e.message}`);
    }
  });

  console.log(`\n=== Summary ===`);
  console.log(`✅ Exact SKU Pass:   ${exactPass}`);
  console.log(`🔹 Spec/Family Pass:  ${specPass}`);
  console.log(`❌ Fail (Not Found): ${fail}`);
  console.log(`⚠️  Orphaned:         ${orphaned}`);
  console.log(`💥 Errors / Timeout:  ${errors}`);
  console.log(`Total tested:         ${rows.length}\n`);

  if (failures.length) {
    console.log(`=== Details & Discrepancies (first 30) ===`);
    failures.slice(0, 30).forEach((f) => console.log(f));
  }
}

/**
 * Validation using OilFinderVehicle (Staging Dataset)
 */
async function validateDataset() {
  const count = await prisma.oilFinderVehicle.count();
  console.log(`Found ${count} total OilFinderVehicle entries in database.`);

  const rows = await getOilFinderDatasetRows(LIMIT);
  console.log(`Testing ${rows.length} rows against Oil Finder engine...\n`);

  let pass = 0;
  let fail = 0;
  let errors = 0;
  const failures = [];

  const startTime = Date.now();

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
          `❌ ${label} -> expected viscosity "${expectedViscosity}", got status="${result.status}" viscosity="${result.viscosity ?? 'null'}"`
        );
      }
    } catch (e) {
      errors++;
      failures.push(`💥 ${label} -> ERROR: ${e.message}`);
    }

    if ((i + 1) % 100 === 0 || i + 1 === rows.length) {
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(`Progression: ${i + 1}/${rows.length} (${elapsedSec}s) — Succès: ${pass} | Échecs: ${fail}\r`);
    }
  });

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n=== Summary (${totalTime}s) ===`);
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
