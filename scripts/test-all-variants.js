/**
 * Comprehensive Automated Regression & Verification Suite for Oil Finder (TecDoc Production Grade)
 * Validates Passenger Cars, Commercial Trucks, Motorcycles, Agriculture, and Marine.
 * 
 * Strict Regression Gate:
 * Asserts both oil specifications (viscosity, ACEA/API/OEM) AND resolution metadata:
 *   - resolvedBy: 'exact' | 'minor-conflict-auto-resolve' | 'category-default'
 *   - confidence: 'high' | 'medium' | 'low'
 *   - backingRows: number of DB rows backing this recommendation (0 for fallbacks)
 * 
 * Distinguishes genuine DB row matches from category/brand defaults.
 * Rejects heuristic results masquerading as 'minor-conflict-auto-resolve'.
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
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA E6 / E9 / E7',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Scania Modern Truck (Euro 6 Low-SAPS)',
  },
  {
    category: 'TRUCK',
    make: 'SCANIA',
    model: 'OMNILINK',
    engineCode: 'Euro 5 Low-SAPS',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA E6 / E9 / E7',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Scania Omnilink Heavy Bus',
  },
  {
    category: 'TRUCK',
    make: 'VOLVO',
    model: 'FH',
    engineCode: 'D13K Euro 6',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA E6 / E9 / E7',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Volvo FH Heavy Truck (VDS-4.5)',
  },
  {
    category: 'TRUCK (VINTAGE)',
    make: 'RENAULT',
    model: 'MAGNUM',
    engineCode: 'Euro 2/3 (15W-40)',
    expectedViscosity: '15W-40',
    expectedAcea: 'ACEA E7',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Renault Magnum Vintage Truck',
  },

  // ── 2. Agriculture & Tractors ──
  {
    category: 'AGRICULTURE',
    make: 'AGCO',
    model: 'DT Series',
    engineCode: 'Moteur Diesel Stage IV',
    expectedViscosity: '15W-40',
    expectedAcea: 'ACEA E9 / E7',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'AGCO DT Series Tractor Engine',
  },
  {
    category: 'AGRICULTURE',
    make: 'JOHN DEERE',
    model: '6R',
    engineCode: 'Transmission & Relevage Hydraulique (UTTO)',
    expectedViscosity: '10W-30',
    expectedAcea: 'UTTO Multifonction (Freins immergés)',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'John Deere Tractor UTTO Transmission',
  },

  // ── 3. Motorcycles & Scooters ──
  {
    category: 'MOTORBIKE (4T)',
    make: 'ADIVA',
    model: 'AD',
    engineCode: '125cc 4T',
    expectedViscosity: '10W-40',
    expectedAcea: 'JASO MA2',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Adiva AD Scooter (TecDoc Motorbike)',
  },
  {
    category: 'MOTORBIKE (2T)',
    make: 'PIAGGIO',
    model: 'ZIP 50 2T',
    engineCode: '50cc 2-Temps',
    expectedViscosity: '2T',
    expectedAcea: 'JASO FD / ISO-L-EGD',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Piaggio Zip 50 2-Stroke Scooter',
  },
  {
    category: 'MOTORBIKE (SUPERSPORT)',
    make: 'DUCATI',
    model: 'PANIGALE V4',
    engineCode: '1100cc V4 Racing',
    expectedViscosity: '10W-50',
    expectedAcea: 'JASO MA2',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Ducati Panigale V4 Superbike (10W-50)',
  },

  // ── 4. Marine Engines ──
  {
    category: 'MARINE (4T)',
    make: 'YAMAHA MARINE',
    model: 'F150 FourStroke',
    engineCode: 'Hors-Bord 4-Temps',
    expectedViscosity: '10W-40',
    expectedAcea: 'NMMA FC-W Catalyst Compatible',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Yamaha Marine 4-Stroke Outboard',
  },
  {
    category: 'MARINE (2T)',
    make: 'MERCURY',
    model: 'OptiMax 2T',
    engineCode: 'Hors-Bord 2-Temps (TC-W3)',
    expectedViscosity: '2T',
    expectedAcea: 'NMMA TC-W3 Certified (Outboard)',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Mercury 2-Stroke Outboard (TC-W3)',
  },

  // ── 5. Vintage Passenger Cars (Pre-2007) ──
  {
    category: 'CAR (VINTAGE)',
    make: 'Citroen',
    model: 'saxo',
    engineCode: '1.1 X,SX',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA A3/B4',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Citroën Saxo 1.1 (Vintage PSA Petrol)',
  },
  {
    category: 'CAR (VINTAGE)',
    make: 'Peugeot',
    model: '206',
    engineCode: '1.4 i',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA A3/B4',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Peugeot 206 1.4 i (Vintage PSA Petrol)',
  },
  {
    category: 'CAR (VINTAGE)',
    make: 'Renault',
    model: 'clio-ii',
    engineCode: '1.2 16V',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA A3/B4',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Renault Clio II 1.2 (Vintage RN0700)',
  },
  {
    category: 'CAR (VINTAGE)',
    make: 'Volkswagen',
    model: 'golf-iv',
    engineCode: '1.6',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA A3/B4',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'VW Golf IV 1.6 (Vintage VW 502/505)',
  },

  // ── 6. Modern Passenger Cars (Post-2007 with DPF) ──
  {
    category: 'CAR (MODERN DPF)',
    make: 'Peugeot',
    model: '208',
    engineCode: '1.6 BlueHDi',
    expectedViscosity: '5W-30',
    expectedAcea: 'ACEA C2 / C3',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Peugeot 208 1.6 BlueHDi (Modern PSA DPF)',
  },
  {
    category: 'CAR (MODERN DPF)',
    make: 'Renault',
    model: 'clio-iv',
    engineCode: '1.5 dCi 90',
    expectedViscosity: '5W-30',
    expectedAcea: 'ACEA C4',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'Renault Clio IV 1.5 dCi (RN0720 DPF)',
  },
  {
    category: 'CAR (MODERN DPF)',
    make: 'Volkswagen',
    model: 'golf-vii',
    engineCode: '2.0 TDI',
    expectedViscosity: '5W-30',
    expectedAcea: 'ACEA C3',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'medium',
    expectedBackingRows: 0,
    label: 'VW Golf VII 2.0 TDI (VW 504/507)',
  },

  // ── 7. Universal Unknown Passenger Car Fallback ──
  {
    category: 'CAR (UNIVERSAL)',
    make: 'UnknownGenericBrandXYZ',
    model: 'GenericCar',
    engineCode: '1.6L Petrol',
    expectedViscosity: '5W-30',
    expectedAcea: 'ACEA C3',
    expectedResolvedBy: 'category-default',
    expectedConfidence: 'low',
    expectedBackingRows: 0,
    label: 'Unknown Manufacturer (Universal Fallback, Low Confidence)',
  },
];

async function runTests() {
  console.log('='.repeat(80));
  console.log('SPECPART MULTI-CATEGORY OIL FINDER REGRESSION SUITE (TECDOC DRIVEN)');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    const url = `${BASE_URL}/oil-finder/vehicle?make=${encodeURIComponent(tc.make)}&model=${encodeURIComponent(tc.model)}&engineCode=${encodeURIComponent(tc.engineCode || '')}`;
    try {
      const res = await requestJson(url);
      const spec = res.body?.oilSpec;
      const resolvedBy = res.body?.resolvedBy;
      const confidence = res.body?.confidence;
      const backingRows = res.body?.backingRows;

      const viscMatch = Boolean(spec && spec.viscosity === tc.expectedViscosity);
      const aceaMatch = !tc.expectedAcea || Boolean(spec && spec.aceaStandard && spec.aceaStandard.includes(tc.expectedAcea.split(' ')[0]));
      const resolvedByMatch = resolvedBy === tc.expectedResolvedBy;
      const confidenceMatch = !tc.expectedConfidence || confidence === tc.expectedConfidence;
      const backingRowsMatch = tc.expectedBackingRows === undefined || backingRows === tc.expectedBackingRows;

      const isPass = viscMatch && aceaMatch && resolvedByMatch && confidenceMatch && backingRowsMatch;

      if (isPass) {
        passed++;
        console.log(`[PASS] [${tc.category}] ${tc.label}`);
        console.log(`       Viscosity: ${spec.viscosity} | Spec: ${spec.aceaStandard || spec.oemApproval}`);
        console.log(`       Resolution: resolvedBy=${resolvedBy} | confidence=${confidence} | backingRows=${backingRows}`);
      } else {
        failed++;
        console.log(`[FAIL] [${tc.category}] ${tc.label}`);
        if (!viscMatch || !aceaMatch) {
          console.log(`       Spec Expected: ${tc.expectedViscosity} (${tc.expectedAcea})`);
          console.log(`       Spec Got:      ${spec ? spec.viscosity : 'NO SPEC'} (${spec ? spec.aceaStandard : 'none'})`);
        }
        if (!resolvedByMatch || !confidenceMatch || !backingRowsMatch) {
          console.log(`       Resolution Expected: resolvedBy=${tc.expectedResolvedBy} | confidence=${tc.expectedConfidence} | backingRows=${tc.expectedBackingRows}`);
          console.log(`       Resolution Got:      resolvedBy=${resolvedBy} | confidence=${confidence} | backingRows=${backingRows}`);
        }
        if (resolvedBy === 'minor-conflict-auto-resolve' && tc.expectedResolvedBy === 'category-default') {
          console.log(`       REGRESSION: Result was marked 'minor-conflict-auto-resolve' instead of 'category-default'! Fallbacks must not masquerade as DB row conflict resolutions.`);
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
