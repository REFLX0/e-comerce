/**
 * Comprehensive Automated Regression & Verification Suite for Oil Finder (TecDoc Production Grade)
 * 
 * Strict Regression Gate:
 * Enforces that:
 * 1. ONLY real rows in oilFinderVehicle or authentic TecDoc data produce status: 'found'.
 * 2. Unbacked vehicles MUST return status: 'not_found' with TecDoc-enriched category messaging.
 * 3. Hardcoded / fabricated fallback specs are strictly forbidden and trigger a test failure.
 * 4. When status is 'found', resolvedBy must be 'exact' or 'minor-conflict-auto-resolve' with backingRows >= 1.
 * 
 * Usage:
 *   node scripts/test-all-variants.js [optional_base_url]
 * Default base_url: http://localhost:4000/api/v1
 */

const http = require('http');

const BASE_URL = process.argv[2] || 'http://localhost:4000/api/v1';

function requestJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

const TEST_CASES = [
  // ── 1. Commercial Heavy Vehicles (Poids Lourd / Trucks) ──
  {
    category: 'TRUCK',
    make: 'SCANIA',
    model: 'L,P,G,R,S - series',
    engineCode: 'DC13 Euro 6',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'poids lourd',
    label: 'Scania Modern Truck (TecDoc Category Poids Lourd)',
  },
  {
    category: 'TRUCK',
    make: 'SCANIA',
    model: 'OMNILINK',
    engineCode: 'Euro 5 Low-SAPS',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'poids lourd',
    label: 'Scania Omnilink Heavy Bus',
  },
  {
    category: 'TRUCK',
    make: 'VOLVO',
    model: 'FH',
    engineCode: 'D13K Euro 6',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'poids lourd',
    label: 'Volvo FH Heavy Truck',
  },
  {
    category: 'TRUCK (VINTAGE)',
    make: 'RENAULT',
    model: 'MAGNUM',
    engineCode: 'Euro 2/3 (15W-40)',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'poids lourd',
    label: 'Renault Magnum Vintage Truck',
  },

  // ── 2. Agriculture & Tractors ──
  {
    category: 'AGRICULTURE',
    make: 'AGCO',
    model: 'DT Series',
    engineCode: 'Moteur Diesel Stage IV',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'agricole',
    label: 'AGCO DT Series Tractor',
  },
  {
    category: 'AGRICULTURE',
    make: 'JOHN DEERE',
    model: '6R',
    engineCode: 'Transmission & Relevage Hydraulique (UTTO)',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'agricole',
    label: 'John Deere Tractor',
  },

  // ── 3. Motorcycles & Scooters ──
  {
    category: 'MOTORBIKE (4T)',
    make: 'ADIVA',
    model: 'AD',
    engineCode: '125cc 4T',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'moto',
    label: 'Adiva AD Scooter (TecDoc Motorbike)',
  },
  {
    category: 'MOTORBIKE (2T)',
    make: 'PIAGGIO',
    model: 'ZIP 50 2T',
    engineCode: '50cc 2-Temps',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'moto',
    label: 'Piaggio Zip 50 2-Stroke Scooter',
  },
  {
    category: 'MOTORBIKE (SUPERSPORT)',
    make: 'DUCATI',
    model: 'PANIGALE V4',
    engineCode: '1100cc V4 Racing',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'moto',
    label: 'Ducati Panigale V4 Superbike',
  },

  // ── 4. Marine Engines ──
  {
    category: 'MARINE (4T)',
    make: 'YAMAHA MARINE',
    model: 'F150 FourStroke',
    engineCode: 'Hors-Bord 4-Temps',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'marin',
    label: 'Yamaha Marine 4-Stroke Outboard',
  },
  {
    category: 'MARINE (2T)',
    make: 'MERCURY',
    model: 'OptiMax 2T',
    engineCode: 'Hors-Bord 2-Temps (TC-W3)',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'marin',
    label: 'Mercury 2-Stroke Outboard (TC-W3)',
  },

  // ── 5. Passenger Cars Without oilFinderVehicle Row ──
  {
    category: 'CAR (UNSEEDED)',
    make: 'Citroen',
    model: 'saxo',
    engineCode: '1.1 X,SX',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'automobile',
    label: 'Citroën Saxo 1.1 (TecDoc Passenger Car)',
  },
  {
    category: 'CAR (UNSEEDED)',
    make: 'Volkswagen',
    model: 'golf-vii',
    engineCode: '2.0 TDI',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'automobile',
    label: 'VW Golf VII 2.0 TDI (TecDoc Passenger Car)',
  },

  // ── 6. Unknown / Unmatched Makes ──
  {
    category: 'UNKNOWN',
    make: 'UnknownGenericBrandXYZ',
    model: 'GenericCar',
    engineCode: '1.6L Petrol',
    expectedStatus: 'not_found',
    expectedMessageKeyword: 'Aucune spécification',
    label: 'Unknown Manufacturer (Unmatched Fallback)',
  },
];

async function runTests() {
  console.log('='.repeat(80));
  console.log('SPECPART MULTI-CATEGORY OIL FINDER REGRESSION SUITE (DATABASE GROUNDED)');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    const url = `${BASE_URL}/oil-finder/vehicle?make=${encodeURIComponent(tc.make)}&model=${encodeURIComponent(tc.model)}&engineCode=${encodeURIComponent(tc.engineCode || '')}`;
    try {
      const res = await requestJson(url);
      const body = res.body || {};
      const status = body.status || body.oilFinderStatus;
      const spec = body.oilSpec;
      const message = body.message || '';

      // Check 1: Must never return a fabricated spec for unbacked vehicles
      if (tc.expectedStatus === 'not_found') {
        const hasNoFabricatedSpec = !spec;
        const statusMatch = status === 'not_found';
        const messageMatch = !tc.expectedMessageKeyword || message.toLowerCase().includes(tc.expectedMessageKeyword.toLowerCase());

        if (statusMatch && hasNoFabricatedSpec && messageMatch) {
          passed++;
          console.log(`[PASS] [${tc.category}] ${tc.label}`);
          console.log(`       Status: ${status} | Message: "${message}"`);
        } else {
          failed++;
          console.log(`[FAIL] [${tc.category}] ${tc.label}`);
          if (spec) {
            console.log(`       REGRESSION: Fabricated oilSpec returned! (${spec.viscosity}, ${spec.aceaStandard || spec.oemApproval})`);
            console.log(`       Unbacked vehicles must return status: 'not_found', never fabricated specs.`);
          }
          if (!statusMatch) {
            console.log(`       Expected status 'not_found', got '${status}'`);
          }
          if (!messageMatch) {
            console.log(`       Expected message to contain '${tc.expectedMessageKeyword}', got '${message}'`);
          }
        }
      } else if (tc.expectedStatus === 'found') {
        // For real DB rows:
        const statusMatch = status === 'found';
        const hasSpec = Boolean(spec && spec.viscosity);
        const resolvedByMatch = body.resolvedBy === 'exact' || body.resolvedBy === 'minor-conflict-auto-resolve';
        const backingRowsMatch = typeof body.backingRows === 'number' && body.backingRows >= 1;

        if (statusMatch && hasSpec && resolvedByMatch && backingRowsMatch) {
          passed++;
          console.log(`[PASS] [${tc.category}] ${tc.label}`);
          console.log(`       Viscosity: ${spec.viscosity} | resolvedBy: ${body.resolvedBy} | backingRows: ${body.backingRows}`);
        } else {
          failed++;
          console.log(`[FAIL] [${tc.category}] ${tc.label}`);
          console.log(`       Status: ${status}, resolvedBy: ${body.resolvedBy}, backingRows: ${body.backingRows}`);
        }
      }
    } catch (err) {
      failed++;
      console.log(`[ERROR] [${tc.category}] ${tc.label}: ${err.message}`);
    }
  }

  console.log('='.repeat(80));
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('='.repeat(80));

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
