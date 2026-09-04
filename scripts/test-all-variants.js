/**
 * Comprehensive Automated Test Suite for Oil Finder (TecDoc Production Grade)
 * Validates Passenger Cars, Commercial Trucks, Motorcycles, Agriculture, and Marine.
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
    label: 'Scania Modern Truck (Euro 6 Low-SAPS)',
  },
  {
    category: 'TRUCK',
    make: 'SCANIA',
    model: 'OMNILINK',
    engineCode: 'Euro 5 Low-SAPS',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA E6 / E9 / E7',
    label: 'Scania Omnilink Heavy Bus',
  },
  {
    category: 'TRUCK',
    make: 'VOLVO',
    model: 'FH',
    engineCode: 'D13K Euro 6',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA E6 / E9 / E7',
    label: 'Volvo FH Heavy Truck (VDS-4.5)',
  },
  {
    category: 'TRUCK (VINTAGE)',
    make: 'RENAULT',
    model: 'MAGNUM',
    engineCode: 'Euro 2/3 (15W-40)',
    expectedViscosity: '15W-40',
    expectedAcea: 'ACEA E7',
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
    label: 'AGCO DT Series Tractor Engine',
  },
  {
    category: 'AGRICULTURE',
    make: 'JOHN DEERE',
    model: '6R',
    engineCode: 'Transmission & Relevage Hydraulique (UTTO)',
    expectedViscosity: '10W-30',
    expectedAcea: 'UTTO Multifonction (Freins immergés)',
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
    label: 'Adiva AD Scooter (TecDoc Motorbike)',
  },
  {
    category: 'MOTORBIKE (2T)',
    make: 'PIAGGIO',
    model: 'ZIP 50 2T',
    engineCode: '50cc 2-Temps',
    expectedViscosity: '2T',
    expectedAcea: 'JASO FD / ISO-L-EGD',
    label: 'Piaggio Zip 50 2-Stroke Scooter',
  },
  {
    category: 'MOTORBIKE (SUPERSPORT)',
    make: 'DUCATI',
    model: 'PANIGALE V4',
    engineCode: '1100cc V4 Racing',
    expectedViscosity: '10W-50',
    expectedAcea: 'JASO MA2',
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
    label: 'Yamaha Marine 4-Stroke Outboard',
  },
  {
    category: 'MARINE (2T)',
    make: 'MERCURY',
    model: 'OptiMax 2T',
    engineCode: 'Hors-Bord 2-Temps (TC-W3)',
    expectedViscosity: '2T',
    expectedAcea: 'NMMA TC-W3 Certified (Outboard)',
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
    label: 'Citroën Saxo 1.1 (Vintage PSA Petrol)',
  },
  {
    category: 'CAR (VINTAGE)',
    make: 'Peugeot',
    model: '206',
    engineCode: '1.4 i',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA A3/B4',
    label: 'Peugeot 206 1.4 i (Vintage PSA Petrol)',
  },
  {
    category: 'CAR (VINTAGE)',
    make: 'Renault',
    model: 'clio-ii',
    engineCode: '1.2 16V',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA A3/B4',
    label: 'Renault Clio II 1.2 (Vintage RN0700)',
  },
  {
    category: 'CAR (VINTAGE)',
    make: 'Volkswagen',
    model: 'golf-iv',
    engineCode: '1.6',
    expectedViscosity: '10W-40',
    expectedAcea: 'ACEA A3/B4',
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
    label: 'Peugeot 208 1.6 BlueHDi (Modern PSA DPF)',
  },
  {
    category: 'CAR (MODERN DPF)',
    make: 'Renault',
    model: 'clio-iv',
    engineCode: '1.5 dCi 90',
    expectedViscosity: '5W-30',
    expectedAcea: 'ACEA C4',
    label: 'Renault Clio IV 1.5 dCi (RN0720 DPF)',
  },
  {
    category: 'CAR (MODERN DPF)',
    make: 'Volkswagen',
    model: 'golf-vii',
    engineCode: '2.0 TDI',
    expectedViscosity: '5W-30',
    expectedAcea: 'ACEA C3',
    label: 'VW Golf VII 2.0 TDI (VW 504/507)',
  },
];

async function runTests() {
  console.log('='.repeat(80));
  console.log('SPECPART MULTI-CATEGORY OIL FINDER VERIFICATION SUITE (TECDOC DRIVEN)');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    const url = `${BASE_URL}/oil-finder/vehicle?make=${encodeURIComponent(tc.make)}&model=${encodeURIComponent(tc.model)}&engineCode=${encodeURIComponent(tc.engineCode || '')}`;
    try {
      const res = await requestJson(url);
      const spec = res.body?.oilSpec;

      const viscMatch = spec && spec.viscosity === tc.expectedViscosity;
      const aceaMatch = !tc.expectedAcea || (spec && spec.aceaStandard && spec.aceaStandard.includes(tc.expectedAcea.split(' ')[0]));

      if (viscMatch && aceaMatch) {
        passed++;
        console.log(`[PASS] [${tc.category}] ${tc.label}`);
        console.log(`       Viscosity: ${spec.viscosity} | Spec: ${spec.aceaStandard || spec.oemApproval}`);
      } else {
        failed++;
        console.log(`[FAIL] [${tc.category}] ${tc.label}`);
        console.log(`       Expected: ${tc.expectedViscosity} (${tc.expectedAcea})`);
        console.log(`       Got:      ${spec ? spec.viscosity : 'NO SPEC'} (${spec ? spec.aceaStandard : 'none'})`);
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
