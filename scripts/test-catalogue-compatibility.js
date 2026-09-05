#!/usr/bin/env node
/**
 * scripts/test-catalogue-compatibility.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Vehicle vs Catalogue Compatibility Audit Tool
 *
 * Validates:
 * 1. Vehicle Lookup: Does the vehicle resolve to a valid manufacturer oil spec?
 * 2. Spec Resolution: Viscosity, OEM approvals, ACEA, API standards.
 * 3. Catalogue Availability: Are there actual matching oil products in the
 *    store catalog (under huiles-moteur / products table)?
 * 4. Gaps & Alerts: Identifies:
 *    - 🟢 MATCH: Spec found AND compatible oils are in stock.
 *    - 🟡 MISSING_STOCK: Spec found, but 0 matching oils exist in the catalog.
 *    - 🔴 UNSEEDED: Vehicle has no spec in the database (e.g., Citroën Saxo).
 *
 * Usage:
 *   node scripts/test-catalogue-compatibility.js [baseUrl] [options]
 *
 * Options:
 *   --json            Output raw JSON results
 *   --markdown        Save a Markdown report to catalogue-audit-report.md
 *   --category <cat>  Filter vehicles by category (car, moto, truck)
 *   --all-dataset     Load and test all entries from oil-finder-full-dataset/
 *
 * Default baseUrl: http://localhost:4000/api/v1
 * Example for remote EC2:
 *   node scripts/test-catalogue-compatibility.js http://localhost:4000/api/v1
 * ─────────────────────────────────────────────────────────────────────────────
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// CLI Arguments
const args = process.argv.slice(2);
const positionalArgs = args.filter(a => !a.startsWith('--'));
const BASE_URL = positionalArgs[0] || 'http://localhost:4000/api/v1';

const OUTPUT_JSON = args.includes('--json');
const OUTPUT_MARKDOWN = args.includes('--markdown');
const ALL_DATASET = args.includes('--all-dataset');
const CATEGORY_FILTER = args.find(a => a.startsWith('--category='))?.split('=')[1]?.toLowerCase();

// HTTP GET Helper
function requestJson(url) {
  const client = url.startsWith('https') ? https : http;
  return new Promise((resolve) => {
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ status: 0, error: 'Request timeout (8s)' });
    });
  });
}

// Comprehensive Matrix of Real-World Market Vehicles
const STANDARD_VEHICLE_MATRIX = [
  // ── 1. Renault & Dacia (High-Volume Core) ──
  { category: 'car', make: 'Renault', model: 'Clio', engineCode: '1.5 dCi', label: 'Renault Clio IV 1.5 dCi (Diesel DPF)' },
  { category: 'car', make: 'Renault', model: 'Clio', engineCode: '0.9 TCe', label: 'Renault Clio IV 0.9 TCe (Essence Turbo)' },
  { category: 'car', make: 'Renault', model: 'Megane', engineCode: '1.5 dCi', label: 'Renault Megane III 1.5 dCi' },
  { category: 'car', make: 'Renault', model: 'Symbol', engineCode: '1.2 16V', label: 'Renault Symbol 1.2 16V (Atmosphérique)' },
  { category: 'car', make: 'Dacia', model: 'Duster', engineCode: '1.5 dCi', label: 'Dacia Duster II 1.5 dCi 4x4' },
  { category: 'car', make: 'Dacia', model: 'Sandero', engineCode: '0.9 TCe', label: 'Dacia Sandero II 0.9 TCe' },

  // ── 2. PSA Stellantis (Peugeot & Citroën) ──
  { category: 'car', make: 'Peugeot', model: '208', engineCode: '1.2 PureTech', label: 'Peugeot 208 I 1.2 PureTech (EB2)' },
  { category: 'car', make: 'Peugeot', model: '208', engineCode: '1.6 BlueHDi', label: 'Peugeot 208 I 1.6 BlueHDi 100' },
  { category: 'car', make: 'Peugeot', model: '308', engineCode: '1.6 BlueHDi 120', label: 'Peugeot 308 II 1.6 BlueHDi 120 (PSA B71 2312)' },
  { category: 'car', make: 'Peugeot', model: 'Partner', engineCode: '1.6 HDi', label: 'Peugeot Partner Tepee 1.6 HDi' },
  { category: 'car', make: 'Citroen', model: 'C3', engineCode: 'EB2F', label: 'Citroën C3 III 1.2 PureTech 82' },
  { category: 'car', make: 'Citroen', model: 'C4', engineCode: '1.6 HDi', label: 'Citroën C4 II 1.6 HDi 90' },
  { category: 'car', make: 'Citroen', model: 'Berlingo', engineCode: '1.6 HDi', label: 'Citroën Berlingo II 1.6 HDi' },
  { category: 'car', make: 'Citroen', model: 'Saxo', engineCode: '1.1 X,SX', label: 'Citroën Saxo 1.1 X,SX (Unseeded Diagnostic)' },

  // ── 3. VAG (Volkswagen, Audi, Seat, Skoda) ──
  { category: 'car', make: 'Volkswagen', model: 'Golf', engineCode: '2.0 TDI', label: 'VW Golf VII 2.0 TDI (CRBC/CRLB)' },
  { category: 'car', make: 'Volkswagen', model: 'Golf', engineCode: '1.4 TSI', label: 'VW Golf VII 1.4 TSI (EA211)' },
  { category: 'car', make: 'Volkswagen', model: 'Polo', engineCode: '1.4 MPI', label: 'VW Polo V 1.4 MPI 85' },
  { category: 'car', make: 'Volkswagen', model: 'Polo', engineCode: '1.2 TSI', label: 'VW Polo V 1.2 TSI 90' },
  { category: 'car', make: 'Volkswagen', model: 'Passat', engineCode: '2.0 TDI', label: 'VW Passat B8 2.0 TDI' },
  { category: 'car', make: 'Audi', model: 'A3', engineCode: '2.0 TDI', label: 'Audi A3 8V 2.0 TDI Clean Diesel' },
  { category: 'car', make: 'Audi', model: 'A4', engineCode: '2.0 TFSI', label: 'Audi A4 B9 2.0 TFSI Ultra' },
  { category: 'car', make: 'Seat', model: 'Leon', engineCode: '1.6 TDI', label: 'Seat Leon III 1.6 TDI 105' },
  { category: 'car', make: 'Seat', model: 'Ibiza', engineCode: '1.2 TSI', label: 'Seat Ibiza IV 1.2 TSI' },
  { category: 'car', make: 'Skoda', model: 'Octavia', engineCode: '1.6 TDI', label: 'Skoda Octavia III 1.6 TDI' },

  // ── 4. German Premium (BMW & Mercedes-Benz) ──
  { category: 'car', make: 'BMW', model: '3 Series', engineCode: '320d', label: 'BMW 320d F30 (N47/B47 LL-04)' },
  { category: 'car', make: 'BMW', model: '1 Series', engineCode: '116i', label: 'BMW 116i F20 1.6 Turbo' },
  { category: 'car', make: 'Mercedes-Benz', model: 'A-Class', engineCode: 'A 180 CDI', label: 'Mercedes Classe A W176 A180 CDI' },
  { category: 'car', make: 'Mercedes-Benz', model: 'C-Class', engineCode: 'C 220 d', label: 'Mercedes Classe C W205 C220d (MB 229.51)' },

  // ── 5. Italian (Fiat & Alfa Romeo) ──
  { category: 'car', make: 'Fiat', model: '500', engineCode: '1.2', label: 'Fiat 500 1.2 8V Fire' },
  { category: 'car', make: 'Fiat', model: 'Punto', engineCode: '1.3 Multijet', label: 'Fiat Punto EVO 1.3 Multijet 75/95' },
  { category: 'car', make: 'Fiat', model: 'Panda', engineCode: '1.2', label: 'Fiat Panda III 1.2 69ch' },

  // ── 6. Asian Volume (Toyota, Hyundai, Kia, Nissan) ──
  { category: 'car', make: 'Toyota', model: 'Yaris', engineCode: '1.0 VVT-i', label: 'Toyota Yaris III 1.0 VVT-i (1KR-FE)' },
  { category: 'car', make: 'Toyota', model: 'Yaris', engineCode: '1.5 Hybrid', label: 'Toyota Yaris III 1.5 Hybrid (0W-20)' },
  { category: 'car', make: 'Toyota', model: 'Hilux', engineCode: '2.4 D-4D', label: 'Toyota Hilux 2.4 D-4D Pick-up' },
  { category: 'car', make: 'Hyundai', model: 'i10', engineCode: '1.0', label: 'Hyundai i10 II 1.0 MPi' },
  { category: 'car', make: 'Hyundai', model: 'i20', engineCode: '1.2', label: 'Hyundai i20 II 1.2 Kappa' },
  { category: 'car', make: 'Kia', model: 'Picanto', engineCode: '1.0', label: 'Kia Picanto II 1.0 MPI' },
  { category: 'car', make: 'Nissan', model: 'Qashqai', engineCode: '1.5 dCi', label: 'Nissan Qashqai II 1.5 dCi (K9K)' },

  // ── 7. Two-Wheelers (Motorcycles & Scooters) ──
  { category: 'moto', make: 'Yamaha', model: 'XP 530 T-Max', engineCode: '530', label: 'Yamaha T-Max 530 (JASO MA2)' },
  { category: 'moto', make: 'Yamaha', model: 'MT-07', engineCode: 'CP2 689cc', label: 'Yamaha MT-07 (JASO MA2)' },
  { category: 'moto', make: 'Vespa', model: 'GTS 300', engineCode: '300 HPE', label: 'Vespa GTS 300 Super Sport' },

  // ── 8. Heavy Trucks (Poids Lourd) ──
  { category: 'truck', make: 'Scania', model: 'R-Series', engineCode: 'DC13', label: 'Scania R-Series DC13 Heavy Truck' },
  { category: 'truck', make: 'Volvo', model: 'FH', engineCode: 'D13K', label: 'Volvo FH D13K Commercial Truck' },
];

function loadFullDatasetVehicles() {
  const datasetDir = path.resolve(__dirname, '..', 'oil-finder-full-dataset');
  if (!fs.existsSync(datasetDir)) {
    console.warn(`[WARN] Dataset directory ${datasetDir} not found, using standard matrix.`);
    return STANDARD_VEHICLE_MATRIX;
  }

  const files = fs.readdirSync(datasetDir).filter(f => f.startsWith('automobile-') && f.endsWith('.json') && !f.includes('conflicts'));
  const vehicles = [];
  files.forEach(f => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(datasetDir, f), 'utf-8'));
      if (Array.isArray(data)) {
        data.slice(0, 3).forEach(v => {
          vehicles.push({
            category: 'car',
            make: v.make,
            model: v.model,
            engineCode: v.engineCode || '',
            label: `${v.make} ${v.model} ${v.engineCode || ''} (${v.generation || ''})`.trim(),
          });
        });
      }
    } catch {
      // Ignore corrupt files
    }
  });

  return vehicles.length > 0 ? vehicles : STANDARD_VEHICLE_MATRIX;
}

// Main Execution
async function runAudit() {
  let vehiclesToTest = ALL_DATASET ? loadFullDatasetVehicles() : STANDARD_VEHICLE_MATRIX;

  if (CATEGORY_FILTER) {
    vehiclesToTest = vehiclesToTest.filter(v => v.category === CATEGORY_FILTER);
  }

  console.log(`\n================================================================================`);
  console.log(`         SPEC-PART OIL FINDER & CATALOGUE COMPATIBILITY AUDIT`);
  console.log(`================================================================================`);
  console.log(`Target API Base URL:  ${BASE_URL}`);
  console.log(`Vehicles in Scope:    ${vehiclesToTest.length}`);
  console.log(`Mode:                 ${ALL_DATASET ? 'Full Dataset Sample' : 'Standard Market Matrix'}`);
  console.log(`Timestamp:            ${new Date().toISOString()}`);
  console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

  const results = [];
  let index = 0;

  for (const v of vehiclesToTest) {
    index += 1;
    const qParams = new URLSearchParams({
      make: v.make,
      model: v.model,
    });
    if (v.engineCode) qParams.set('engineCode', v.engineCode);

    const targetUrl = `${BASE_URL}/oil-finder/vehicle?${qParams.toString()}`;
    const res = await requestJson(targetUrl);

    let verdict = 'ERROR';
    let statusText = '';
    let specSummary = 'N/A';
    let productsCount = 0;
    let sampleProducts = [];

    if (res.status === 0) {
      verdict = 'CONNECTION_ERROR';
      statusText = `Connection failed: ${res.error}`;
    } else if (res.status === 200 && res.body) {
      const body = res.body;
      const isFound = body.oilFinderStatus === 'found' || body.status === 'found';
      const spec = body.oilSpec;
      productsCount = Number(body.total) || (Array.isArray(body.data) ? body.data.length : 0);

      if (Array.isArray(body.data) && body.data.length > 0) {
        sampleProducts = body.data.slice(0, 3).map(p => {
          const brand = p.brand?.name || p.brand || '';
          const name = p.nameFr || p.name || p.sku || 'Produit';
          return `${brand} ${name}`.trim();
        });
      }

      if (isFound && spec) {
        const parts = [spec.viscosity];
        if (spec.oemApproval) parts.push(spec.oemApproval);
        else if (spec.aceaStandard) parts.push(spec.aceaStandard);
        specSummary = parts.filter(Boolean).join(' | ');

        if (productsCount > 0) {
          verdict = 'MATCH';
          statusText = `🟢 ${productsCount} oils in catalogue`;
        } else {
          verdict = 'MISSING_STOCK';
          statusText = `🟡 Spec found, 0 products in catalogue`;
        }
      } else {
        verdict = 'UNSEEDED';
        statusText = `🔴 Unseeded / not_found in DB`;
      }
    } else {
      verdict = 'HTTP_ERROR';
      statusText = `HTTP ${res.status}: ${JSON.stringify(res.body)}`;
    }

    const itemResult = {
      index,
      label: v.label || `${v.make} ${v.model} ${v.engineCode || ''}`.trim(),
      make: v.make,
      model: v.model,
      engineCode: v.engineCode || '',
      category: v.category,
      verdict,
      specSummary,
      productsCount,
      sampleProducts,
      statusText,
    };

    results.push(itemResult);

    // Terminal Logging
    const badge = verdict === 'MATCH' ? '\x1b[32m[PASS]\x1b[0m'
      : verdict === 'MISSING_STOCK' ? '\x1b[33m[WARN]\x1b[0m'
      : '\x1b[31m[FAIL]\x1b[0m';

    const countStr = productsCount > 0 ? `(${productsCount} oils)` : '';
    console.log(
      `${String(index).padStart(2, ' ')}. ${badge} ${itemResult.label.padEnd(42, ' ')} → ` +
      `${specSummary.padEnd(28, ' ')} | ${statusText} ${countStr}`
    );
    if (sampleProducts.length > 0) {
      console.log(`     └─ Example: ${sampleProducts.slice(0, 2).join(', ')}`);
    }
  }

  // Summary Metrics
  const total = results.length;
  const matchCount = results.filter(r => r.verdict === 'MATCH').length;
  const missingStockCount = results.filter(r => r.verdict === 'MISSING_STOCK').length;
  const unseededCount = results.filter(r => r.verdict === 'UNSEEDED').length;
  const errorCount = results.filter(r => r.verdict.includes('ERROR')).length;

  console.log(`\n────────────────────────────────────────────────────────────────────────────────`);
  console.log(`                         AUDIT SUMMARY & HEALTH METRICS`);
  console.log(`────────────────────────────────────────────────────────────────────────────────`);
  console.log(`Total Vehicles Audited:                ${total}`);
  console.log(`🟢 Fully Matched & In Stock:           ${matchCount} (${Math.round((matchCount / total) * 100)}%)`);
  console.log(`🟡 Spec Known, 0 Catalogue Stock:      ${missingStockCount} (${Math.round((missingStockCount / total) * 100)}%)`);
  console.log(`🔴 Unseeded / No Spec In DB:           ${unseededCount} (${Math.round((unseededCount / total) * 100)}%)`);
  if (errorCount > 0) {
    console.log(`❌ Network / Server Errors:            ${errorCount}`);
  }
  console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

  // JSON Output
  if (OUTPUT_JSON) {
    const jsonPath = path.resolve(process.cwd(), 'catalogue-audit-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ summary: { total, matchCount, missingStockCount, unseededCount }, results }, null, 2));
    console.log(`JSON report saved to: ${jsonPath}`);
  }

  // Markdown Output
  if (OUTPUT_MARKDOWN) {
    const mdPath = path.resolve(process.cwd(), 'catalogue-audit-report.md');
    let md = `# Catalogue & Oil Finder Compatibility Audit Report\n\n`;
    md += `**Generated:** ${new Date().toISOString()}  \n`;
    md += `**Target URL:** \`${BASE_URL}\`  \n\n`;
    md += `### Summary\n\n`;
    md += `- **Total Tested:** ${total}\n`;
    md += `- **🟢 In-Stock Matches:** ${matchCount} (${Math.round((matchCount / total) * 100)}%)\n`;
    md += `- **🟡 Zero Stock Gaps:** ${missingStockCount}\n`;
    md += `- **🔴 Unseeded Vehicles:** ${unseededCount}\n\n`;
    md += `### Detailed Vehicle Results\n\n`;
    md += `| # | Vehicle | Oil Spec | Catalogue Availability | Sample Products |\n`;
    md += `|---|---|---|---|---|\n`;
    results.forEach(r => {
      const icon = r.verdict === 'MATCH' ? '🟢' : r.verdict === 'MISSING_STOCK' ? '🟡' : '🔴';
      md += `| ${r.index} | ${icon} **${r.label}** | \`${r.specSummary}\` | ${r.productsCount} products | ${r.sampleProducts.join('<br>') || 'None'} |\n`;
    });
    fs.writeFileSync(mdPath, md);
    console.log(`Markdown report saved to: ${mdPath}`);
  }

  // Actionable Guidance
  if (unseededCount > 0) {
    console.log(`[ACTION NEEDED] The following vehicles are unseeded and need rows in OilFinderVehicle:`);
    results.filter(r => r.verdict === 'UNSEEDED').forEach(r => {
      console.log(`  - ${r.label} (Make: '${r.make}', Model: '${r.model}', Engine: '${r.engineCode}')`);
    });
    console.log(``);
  }
}

runAudit().catch(console.error);
