#!/usr/bin/env node
/**
 * Export distinct vehicle engines + how many vehicles depend on each one.
 *
 * Why this matters: "test all vehicles" sounds huge, but many vehicles
 * share the same engine (e.g. Renault's K9K powers Clio, Duster, Logan,
 * Sandero...; Toyota's 2UZ-FE powers Land Cruiser, Tundra, Sequoia...).
 * Fixing ONE wrong engine->oil mapping can fix dozens of vehicles at once.
 * This script reveals the real number of distinct engines you need to verify,
 * ranked by how many vehicles each one affects — verify the top of the list first (80/20 rule).
 *
 * Supports two modes:
 *   - VehicleCompatibility mode (default): store products mapped to vehicle models
 *   - Dataset mode (--dataset): master 6,400+ vehicle engine dataset
 *
 * Run inside your API container:
 *   node scripts/export-engine-groups.js
 *   node scripts/export-engine-groups.js --dataset
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

async function exportCompatibilityGroups() {
  const rows = await prisma.vehicleCompatibility.findMany({
    include: {
      vehicleModel: { include: { make: true } },
      product: { select: { id: true, sku: true, nameFr: true } },
    },
  });

  if (rows.length === 0) {
    console.log('VehicleCompatibility table is currently empty in this database.');
    console.log('Switching automatically to master OilFinderVehicle dataset export...\n');
    return exportDatasetGroups();
  }

  const groups = new Map();
  for (const row of rows) {
    const make = row.vehicleModel?.make?.name ?? 'UnknownMake';
    const model = row.vehicleModel?.name ?? 'UnknownModel';
    const engine = row.engineCode ?? 'unknown';
    const key = `${make}|${model}|${engine}`;

    if (!groups.has(key)) {
      groups.set(key, {
        make,
        model,
        engine,
        vehicleCount: 0,
        productSku: row.product?.sku ?? 'MISSING',
        productName: row.product?.nameFr ?? 'MISSING',
      });
    }
    groups.get(key).vehicleCount++;
  }

  const sorted = [...groups.values()].sort((a, b) => b.vehicleCount - a.vehicleCount);

  console.log(`Total compatibility rows: ${rows.length}`);
  console.log(`Distinct make+model+engine combos: ${sorted.length}\n`);

  const csv = ['make,model,engine,vehicle_count,product_sku,product_name']
    .concat(
      sorted.map(
        (g) =>
          `"${g.make.replace(/"/g, '""')}","${g.model.replace(/"/g, '""')}","${g.engine.replace(/"/g, '""')}",${g.vehicleCount},"${g.productSku.replace(/"/g, '""')}","${g.productName.replace(/"/g, '""')}"`
      )
    )
    .join('\n');

  const outputPath = path.resolve(process.cwd(), 'engine-groups.csv');
  fs.writeFileSync(outputPath, csv);

  console.log('Top 20 by impact (verify these first):');
  sorted.slice(0, 20).forEach((g) =>
    console.log(
      `  ${g.vehicleCount}x  ${g.make} ${g.model} ${g.engine} -> ${g.productSku} (${g.productName})`
    )
  );

  const missing = sorted.filter((g) => g.productSku === 'MISSING');
  if (missing.length) {
    console.log(`\n⚠️  ${missing.length} engine groups have NO product assigned at all.`);
  }

  console.log(`\nFull list written to ${outputPath}`);
}

async function exportDatasetGroups() {
  const rows = await prisma.oilFinderVehicle.findMany({
    include: { oilSpec: true },
  });

  if (rows.length === 0) {
    console.log('No rows found in OilFinderVehicle table either.');
    return;
  }

  const groups = new Map();
  for (const row of rows) {
    const make = row.make;
    const model = row.model;
    const engine = row.engineCode || 'unknown';
    const key = `${make}|${model}|${engine}`;

    if (!groups.has(key)) {
      const viscosity = row.oilSpec?.viscosity || row.oilViscosity || 'unknown';
      const oem = row.oilSpec?.oemApproval || row.oilSpecOEM || row.oilSpec?.aceaStandard || row.oilSpecACEA || 'OEM';
      const capacity = row.oilSpec?.capacityLiters || row.oilCapacityLiters ? `${row.oilSpec?.capacityLiters || row.oilCapacityLiters}L` : '';
      groups.set(key, {
        make,
        model,
        engine,
        vehicleCount: 0,
        spec: `${viscosity} (${oem}${capacity ? `, ${capacity}` : ''})`,
      });
    }
    groups.get(key).vehicleCount++;
  }

  const sorted = [...groups.values()].sort((a, b) => b.vehicleCount - a.vehicleCount);

  console.log(`Total master dataset rows: ${rows.length}`);
  console.log(`Distinct make+model+engine combos: ${sorted.length}\n`);

  const csv = ['make,model,engine,vehicle_count,recommended_spec']
    .concat(
      sorted.map(
        (g) =>
          `"${g.make.replace(/"/g, '""')}","${g.model.replace(/"/g, '""')}","${g.engine.replace(/"/g, '""')}",${g.vehicleCount},"${g.spec.replace(/"/g, '""')}"`
      )
    )
    .join('\n');

  const outputPath = path.resolve(process.cwd(), 'engine-groups.csv');
  fs.writeFileSync(outputPath, csv);

  console.log('Top 25 engine groups by impact (verify these first):');
  sorted.slice(0, 25).forEach((g) =>
    console.log(
      `  ${g.vehicleCount}x  ${g.make} ${g.model} [${g.engine}] -> ${g.spec}`
    )
  );

  console.log(`\nFull list written to ${outputPath}`);
}

async function main() {
  if (USE_DATASET) {
    await exportDatasetGroups();
  } else {
    await exportCompatibilityGroups();
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
