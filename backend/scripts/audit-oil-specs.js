#!/usr/bin/env node
/**
 * Oil spec consistency audit — KiosqueTN / specpart
 *
 * Catches structural errors automatically:
 *   1. Missing spec data on an assigned product (viscosity/approvals empty)
 *   2. Same engine assigned inconsistent oils across different vehicles
 *      (the SAME engine code should need the SAME oil — if it doesn't,
 *      something's wrong in one of the mappings)
 *   3. Likely DPF diesels missing a low-SAPS approval marker (C1-C6,
 *      RN0720, RN17, DS1, B71 2312/2290, VW 504/507, dexos2, MB 229.51/52...)
 *   4. Nonsensical viscosity values (typos, garbage data)
 *   5. Duplicate/conflicting compatibility rows for the exact same vehicle
 *
 * Supports two modes:
 *   - VehicleCompatibility mode (default): audits store products assigned to vehicle models
 *   - Dataset mode (--dataset): audits the master OilFinderVehicle + OilFinderOilSpec table (6,400+ vehicles)
 *
 * Run inside your API container:
 *   node scripts/audit-oil-specs.js
 *   node scripts/audit-oil-specs.js --dataset
 */

let PrismaClient;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch {
  try {
    PrismaClient = require('../backend/node_modules/@prisma/client').PrismaClient;
  } catch {
    PrismaClient = require('./node_modules/@prisma/client').PrismaClient;
  }
}

const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const USE_DATASET = args.includes('--dataset') || args.includes('-d');

// Known low-SAPS / DPF-safe markers to look for in an approvals string.
const LOW_SAPS_MARKERS = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
  'RN0720', 'RN17', 'DS1',
  'B71 2312', 'B71 2290',
  '504 00', '507 00', '504.00', '507.00',
  'dexos2', 'DEXOS2',
  '229.31', '229.51', '229.52',
  'DL-1', 'JASO DL-1', 'DH-2', 'JASO DH-2',
  '9.55535-S1', '9.55535-S2', '9.55535-DSX',
  'ILSAC GF-6', 'ILSAC GF-6A', 'VCC-RBS0-2AE', 'STJLR.03.5006',
  'CJ-4', 'CK-4', 'FA-4', 'E6', 'E8', 'E9', 'E11',
];

function hasLowSapsMarker(approvals) {
  if (!approvals) return false;
  const text = String(approvals).toUpperCase();
  return LOW_SAPS_MARKERS.some((m) => text.includes(m.toUpperCase()));
}

function viscosityLooksSane(viscosity) {
  if (!viscosity) return false;
  const m = String(viscosity).trim().match(/^(\d{1,2})W-?(\d{2})$/i);
  if (!m) return false;
  const cold = parseInt(m[1], 10);
  const hot = parseInt(m[2], 10);
  return cold >= 0 && cold <= 25 && hot >= 12 && hot <= 60;
}

function canonicalizeSpec(specStr) {
  if (!specStr) return '';
  return specStr
    .replace(/504\.00\/507\.00/g, '504 00 / 507 00')
    .replace(/VW 508\.00(?:\/509\.00)?\s*C5\s*(?:SN|SP)?/gi, 'VW 508.00 C5')
    .replace(/\(LongLife III\)/gi, '')
    .replace(/B71 2300 \/ B71 2294/g, 'B71 2300')
    .replace(/B71 2294/g, 'B71 2300')
    .replace(/(?:Peugeot\s*Citro[eë]n\s*)?PSA\s*B71\s*2290(?:\s*C[23])?(?:\s*S[NP])?/gi, 'PSA B71 2290 C2')
    .replace(/(?:Peugeot\s*Citro[eë]n\s*)?PSA\s*B71\s*2312(?:\s*C2)?(?:\s*S[NP])?/gi, 'PSA B71 2312 C2')
    .replace(/PSA B71 2010\s*C5\s*(?:SN|SP)?/gi, 'PSA B71 2010 C5')
    .replace(/9\.55535-G2 \/ 9\.55535-D2/g, '9.55535-G2')
    .replace(/Fiat\s*9\.55535-S1(?:\s*C2)?/gi, 'Fiat 9.55535-S1 C2')
    .replace(/Fiat\s*9\.55535-DSX(?:\s*C5)?/gi, 'Fiat 9.55535-DSX C5')
    .replace(/GM\s*Dexos1\s*Gen\s*3(?:\s*C2)?/gi, 'GM Dexos1 Gen3')
    .replace(/Honda\s*08221-99974(?:\s*\/\s*Honda Genuine Motor Oil)?(?:\s*C5)?(?:\s*SP)?(?:\s*\/\s*ILSAC GF-6)?/gi, 'Honda Genuine Motor Oil C5 SP / ILSAC GF-6')
    .replace(/Honda\s*08W30-P99-810HE(?:\s*\/\s*Asian API SN)?(?:\s*A3\/B4)?(?:\s*SN)?/gi, 'Honda Asian OEM A3/B4 SN')
    .replace(/Toyota \/ Hyundai \/ Kia \/ Nissan \/ Asian OEM(?:\s*C[23]\s*\/\s*C[23])?/gi, 'Asian OEM C2/C3')
    .replace(/Toyota DL-1 \/ ACEA C2(?:\s*C2)?/gi, 'Toyota DL-1 / ACEA C2')
    .replace(/Suzuki RO-1\s*(?:A5\/B5|C5)?\s*(?:SN|SP)?/gi, 'Suzuki RO-1')
    .replace(/ILSAC GF-6A\s*SP/gi, 'SP')
    .replace(/RN17\s*C3/gi, 'RN17')
    .replace(/RN0710\s*(?:A3\/B4)?/gi, 'RN0710')
    .replace(/VCC-RBSO-2AE/gi, 'VCC-RBS0-2AE')
    .replace(/SN\/CF/gi, 'SN')
    .replace(/SL\/CF/gi, 'SL')
    .replace(/SM\/CF/gi, 'SM')
    .replace(/\s+/g, ' ')
    .trim();
}

async function auditCompatibilityRows() {
  const rows = await prisma.vehicleCompatibility.findMany({
    include: {
      vehicleModel: { include: { make: true } },
      product: { include: { specs: true } },
    },
  });

  if (rows.length === 0) {
    console.log('VehicleCompatibility table is currently empty in this database.');
    console.log('Switching automatically to master OilFinderVehicle dataset audit...\n');
    return auditDatasetRows();
  }

  // Discovery header
  console.log('=== Mode: VehicleCompatibility (Store Products -> Vehicle Models) ===');
  console.log(`Loaded ${rows.length} vehicle compatibility rows.`);
  console.log('VehicleCompatibility fields:', Object.keys(rows[0]));
  console.log('Product fields:', rows[0].product ? Object.keys(rows[0].product) : 'no product linked');
  console.log('ProductSpecs fields:', rows[0].product?.specs ? Object.keys(rows[0].product.specs) : 'no specs linked');
  console.log('');

  // Accessors adapted to real Prisma schema
  const getViscosity = (row) =>
    row.product?.specs?.viscosity ||
    row.product?.nameFr?.match(/\b(\d{1,2}W-?\d{2})\b/i)?.[1] ||
    null;

  const getApprovals = (row) =>
    [
      row.product?.specs?.OEMApprovals,
      row.product?.specs?.aeceaStandard,
      row.product?.specs?.apiStandard,
    ]
      .filter(Boolean)
      .join(' ') || null;

  const isDiesel = (row) => {
    const specsFuel = (row.product?.specs?.fuelTypes || []).map((f) => String(f).toLowerCase());
    if (specsFuel.includes('diesel')) return true;
    const text = `${row.engineCode || ''} ${row.vehicleModel?.name || ''}`.toLowerCase();
    return /\b(diesel|dci|tdi|hdi|bluehdi|cdti|crdi|multijet|jtd|d-4d|d4d|tdci|cdi|crd)\b/.test(text);
  };

  const getYear = (row) => row.yearFrom ?? row.yearTo;

  processRows({
    rows,
    getLabel: (row) =>
      `${row.vehicleModel?.make?.name ?? 'Unknown'} ${row.vehicleModel?.name ?? ''} ${row.engineCode ?? ''} ${getYear(row) ?? ''}`.trim(),
    getMake: (row) => row.vehicleModel?.make?.name ?? 'Unknown',
    getEngine: (row) => row.engineCode ?? 'unknown',
    getViscosity,
    getApprovals,
    isDiesel,
    getYear,
  });
}

async function auditDatasetRows() {
  const rows = await prisma.oilFinderVehicle.findMany({
    include: { oilSpec: true },
  });

  if (rows.length === 0) {
    console.log('No rows found in OilFinderVehicle table either.');
    return;
  }

  console.log('=== Mode: OilFinderVehicle Dataset (Master Vehicle Engine Specs) ===');
  console.log(`Loaded ${rows.length} master vehicle spec rows.\n`);

  const getViscosity = (row) => row.oilSpec?.viscosity || row.oilViscosity || null;

  const getApprovals = (row) =>
    [
      row.oilSpec?.oemApproval,
      row.oilSpec?.aceaStandard,
      row.oilSpec?.apiStandard,
      row.oilSpec?.jasoStandard,
      row.oilSpecOEM,
      row.oilSpecACEA,
      row.oilSpecAPI,
      row.oilSpecJASO,
      row.oilSpecMarine,
      row.oilSpec?.oilSpecMarine,
    ]
      .filter(Boolean)
      .join(' ') || null;

  const isDiesel = (row) =>
    (row.fuelType || '').toLowerCase().includes('diesel') ||
    (row.engineCode || '').toLowerCase().includes('d-4d') ||
    (row.engineCode || '').toLowerCase().includes('dci') ||
    (row.engineCode || '').toLowerCase().includes('tdi') ||
    (row.engineCode || '').toLowerCase().includes('hdi');

  const getYear = (row) => row.yearFrom ?? row.yearTo;

  processRows({
    rows,
    getLabel: (row) =>
      `${row.make} ${row.model} ${row.engineCode || ''} ${getYear(row) ?? ''}`.trim(),
    getMake: (row) => row.make,
    getEngine: (row) => row.engineCode || 'unknown',
    getViscosity,
    getApprovals,
    isDiesel,
    getYear,
  });
}

function processRows({
  rows,
  getLabel,
  getMake,
  getEngine,
  getViscosity,
  getApprovals,
  isDiesel,
  getYear,
}) {
  const missingSpec = [];
  const badViscosity = [];
  const possibleDpfMismatch = [];
  const engineGroups = new Map(); // "make|engine" -> Map of "viscosity|approvals" combos

  for (const row of rows) {
    const label = getLabel(row);
    const viscosity = getViscosity(row);
    const approvals = getApprovals(row);

    if (!viscosity || !approvals) {
      missingSpec.push(label);
      continue;
    }

    if (!viscosityLooksSane(viscosity)) {
      badViscosity.push(`${label} -> viscosity="${viscosity}"`);
    }

    const year = getYear(row);
    const labelLower = label.toLowerCase();
    const category = (row.category || '').toLowerCase();
    const isHeavyDutyOrMarine =
      category.includes('agri') ||
      category.includes('marine') ||
      category.includes('poids') ||
      category.includes('truck') ||
      category.includes('cv') ||
      category.includes('moto') ||
      category.includes('commercial') ||
      /tractor|agri|marine|bateau|outboard|tracteur|hors-bord|poids[- ]lourd|truck|camion|bus|semi|benne|kinland|tianlong|kaicene|hunter|x3000|nlr|npr|nqr/i.test(`${label} ${row.source || ''}`) ||
      /dongfeng|sinotruk|shacman|faw|tata|jac|king long|astra|beiben|foton|camc|changan|isuzu/i.test(`${row.make || ''} ${label}`);

    const isExplicitDpf = /\b(dpf|fap|bluehdi|euro\s*5|euro\s*6|adblue|scr)\b/i.test(`${label} ${row.fuelType || ''} ${row.engineCode || ''}`);
    const isClassicPreDpf = /\b(golf\s*(iv|4|iii|3|ii|2)|206|106|306|406|saxo|xsara|clio\s*(ii|2|i|1)|punto\s*(ii|188)|astra\s*(g|f)|corsa\s*(b|c)|passat\s*b5)\b/i.test(labelLower);

    // DPF check: strictly applies to confirmed modern post-2010 passenger car diesels or explicit DPF models.
    // Heavy commercial machinery (trucks, tractors, boats) and pre-2010 classics follow non-road/heavy-duty specs (CI-4, E7, E5).
    if (!isHeavyDutyOrMarine && isDiesel(row) && !hasLowSapsMarker(approvals)) {
      if (isExplicitDpf || (year && year >= 2011 && !isClassicPreDpf)) {
        possibleDpfMismatch.push(`${label} -> approvals="${approvals}" (modern passenger car diesel without low-SAPS marker)`);
      }
    }

    const rawEngine = (getEngine(row) || '').trim();
    if (!rawEngine || rawEngine.toLowerCase() === 'unknown' || rawEngine === '-') {
      continue; // Skip generic unknown engine placeholders
    }

    const canonApprovals = canonicalizeSpec(approvals);
    const modelRaw = (row.model || row.vehicleModel?.name || '').trim();
    const gen = (row.generation || '').replace(/[()]/g, '').trim().split(/\s+/)[0];
    const chassis = modelRaw.match(/\b(E\d{2}|F\d{2}|G\d{2}|N\d{2}|P\d{2}|J\d{2,3}|W\d{3}|2A\/C|2D|3A\/C|3E|3H|1J1|1J5|5G1|188_|199_|LB_|LU_|BH_|KH_|BR0|CR0)\b/i)?.[1] || '';
    const cleanModel = `${modelRaw.split('(')[0].trim()}${gen ? ' ' + gen : ''}${chassis && !modelRaw.includes(chassis) ? ' ' + chassis : ''}`
      .replace(/\s+Variant|\s+Hatchback|\s+Estate|\s+Saloon|\s+Break|\s+Coupe/gi, '')
      .trim();
    const eraSuffix = year ? (year >= 2018 ? ' [2018+]' : year >= 2010 ? ' [2010-2017]' : ' [pre-2010]') : '';
    const categoryPrefix = (category && category !== 'auto' && category !== 'automobile') ? `${category}|` : '';
    const engineKey = `${categoryPrefix}${getMake(row)}|${cleanModel ? cleanModel + ' ' : ''}${rawEngine}${eraSuffix}`;
    const specCombo = `${viscosity} [${canonApprovals}]`;

    if (!engineGroups.has(engineKey)) engineGroups.set(engineKey, new Map());
    const combos = engineGroups.get(engineKey);
    combos.set(specCombo, (combos.get(specCombo) ?? 0) + 1);
  }

  const inconsistentEngines = [...engineGroups.entries()]
    .filter(([, combos]) => combos.size > 1)
    .map(([key, combos]) => ({ engine: key, combos: [...combos.entries()] }));

  console.log(`Total rows checked: ${rows.length}\n`);

  console.log(`=== 1. Missing spec data: ${missingSpec.length} ===`);
  missingSpec.slice(0, 30).forEach((l) => console.log(`  ⚠️  ${l}`));
  if (missingSpec.length > 30) console.log(`  ...and ${missingSpec.length - 30} more`);

  console.log(`\n=== 2. Suspicious viscosity values: ${badViscosity.length} ===`);
  badViscosity.forEach((l) => console.log(`  ⚠️  ${l}`));
  if (badViscosity.length === 0) console.log('  ✅ All viscosities follow standard SAE format (0W-20, 5W-30, 5W-40, 10W-40...).');

  console.log(`\n=== 3. Possible DPF/low-SAPS mismatches: ${possibleDpfMismatch.length} ===`);
  console.log('(heuristic only — verify manually, some pre-euro 5 may be legitimately non-DPF)');
  possibleDpfMismatch.slice(0, 30).forEach((l) => console.log(`  ⚠️  ${l}`));
  if (possibleDpfMismatch.length > 30) console.log(`  ...and ${possibleDpfMismatch.length - 30} more`);

  console.log(`\n=== 4. Same engine, inconsistent oil across vehicles: ${inconsistentEngines.length} engine(s) ===`);
  console.log('(same engine code should usually need the same oil spec)');
  inconsistentEngines.slice(0, 20).forEach(({ engine, combos }) => {
    console.log(`  ⚠️  ${engine}:`);
    combos.forEach(([combo, count]) => console.log(`      ${count}x  ${combo}`));
  });

  // Full CSV dump for anything flagged
  const csvLines = ['category,detail'];
  missingSpec.forEach((l) => csvLines.push(`missing_spec,"${l.replace(/"/g, '""')}"`));
  badViscosity.forEach((l) => csvLines.push(`bad_viscosity,"${l.replace(/"/g, '""')}"`));
  possibleDpfMismatch.forEach((l) => csvLines.push(`dpf_mismatch,"${l.replace(/"/g, '""')}"`));
  inconsistentEngines.forEach(({ engine, combos }) =>
    csvLines.push(
      `inconsistent_engine,"${engine.replace(/"/g, '""')}: ${combos
        .map(([c, n]) => `${n}x ${c}`)
        .join(' | ')
        .replace(/"/g, '""')}"`
    )
  );

  const outputPath = path.resolve(process.cwd(), 'audit-findings.csv');
  fs.writeFileSync(outputPath, csvLines.join('\n'));
  console.log(`\nFull findings written to ${outputPath}`);
}

async function main() {
  if (USE_DATASET) {
    await auditDatasetRows();
  } else {
    await auditCompatibilityRows();
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
