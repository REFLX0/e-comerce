/**
 * SpecPart Clean Vehicle Catalog Migration Script
 * Normalizes vehicle catalog into a clean 4-tier hierarchy:
 * Brand -> Model -> Generation -> Engine
 *
 * Usage: npx tsx backend/scripts/clean-and-migrate-catalog.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma: any = new PrismaClient();

interface CleanEngine {
  engineCode: string;
  fuelType: string;
  displacementCc?: number | null;
  powerHp?: number | null;
  powerKw?: number | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  oilSpec?: {
    viscosity?: string;
    oemApproval?: string;
    apiStandard?: string;
    aceaStandard?: string;
    capacityLiters?: number;
    changeIntervalKm?: number;
  } | null;
}

interface CleanGeneration {
  genName: string;
  genSlug: string;
  yearFrom?: number | null;
  yearTo?: number | null;
  engines: CleanEngine[];
}

interface CleanModel {
  modelName: string;
  modelSlug: string;
  generations: Record<string, CleanGeneration>;
}

interface CleanMake {
  makeName: string;
  makeSlug: string;
  models: Record<string, CleanModel>;
}

type CleanCatalog = Record<string, CleanMake>;

async function main() {
  console.log('🚀 Starting Clean Vehicle Catalog Migration (4-Tier Hierarchy)...');

  const candidatePaths = [
    path.join(__dirname, '../src/oil-finder/clean-catalog-hierarchy.json'),
    path.join(__dirname, 'clean-catalog-hierarchy.json'),
    path.join(__dirname, '../oil-finder/clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'backend', 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'oil-finder-full-dataset', 'clean-catalog-hierarchy.json'),
    '/app/clean-catalog-hierarchy.json',
    '/app/backend/src/oil-finder/clean-catalog-hierarchy.json',
    '/app/src/oil-finder/clean-catalog-hierarchy.json',
    '/app/dist/src/oil-finder/clean-catalog-hierarchy.json',
  ];
  let jsonPath = candidatePaths.find(p => fs.existsSync(p));
  if (!jsonPath) {
    throw new Error(`Catalog file clean-catalog-hierarchy.json not found in any standard path.`);
  }

  const SCOPED_MAKES = ['dacia', 'volkswagen', 'audi', 'seat', 'skoda', 'cupra'];
  const catalog: CleanCatalog = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const makes = Object.values(catalog).filter(m => SCOPED_MAKES.includes(m.makeSlug.toLowerCase()));

  console.log(`📦 Loaded ${makes.length} scoped makes (Dacia + VAG) from clean hierarchy dataset.`);

  let insertedMakes = 0;
  let insertedModels = 0;
  let insertedGenerations = 0;
  let insertedEngines = 0;

  for (const m of makes) {
    console.log(`\nSyncing make: ${m.makeName} (${m.makeSlug})...`);
    // 1. Upsert VehicleMake
    const makeRecord = await prisma.vehicleMake.upsert({
      where: { slug: m.makeSlug },
      update: { name: m.makeName },
      create: {
        name: m.makeName,
        slug: m.makeSlug,
      },
    });
    insertedMakes++;

    for (const mod of Object.values(m.models)) {
      // 2. Upsert VehicleModel
      const uniqueModelSlug = `${m.makeSlug}-${mod.modelSlug}`;
      const modelRecord = await prisma.vehicleModel.upsert({
        where: { slug: uniqueModelSlug },
        update: {
          name: mod.modelName,
          makeId: makeRecord.id,
        },
        create: {
          name: mod.modelName,
          slug: uniqueModelSlug,
          makeId: makeRecord.id,
        },
      });
      insertedModels++;

      // Delete obsolete generations for this model that are not in the canonical JSON
      const canonicalGenSlugs = Object.keys(mod.generations);
      await prisma.vehicleGeneration.deleteMany({
        where: {
          modelId: modelRecord.id,
          slug: { notIn: canonicalGenSlugs },
        },
      });

      for (const gen of Object.values(mod.generations)) {
        // 3. Upsert VehicleGeneration
        const genRecord = await prisma.vehicleGeneration.upsert({
          where: {
            modelId_slug: {
              modelId: modelRecord.id,
              slug: gen.genSlug,
            },
          },
          update: {
            name: gen.genName,
            yearFrom: gen.yearFrom || null,
            yearTo: gen.yearTo || null,
          },
          create: {
            modelId: modelRecord.id,
            name: gen.genName,
            slug: gen.genSlug,
            yearFrom: gen.yearFrom || null,
            yearTo: gen.yearTo || null,
          },
        });
        insertedGenerations++;

        // Delete existing engines for this generation to guarantee exact sync
        await prisma.vehicleEngine.deleteMany({
          where: { generationId: genRecord.id },
        });

        for (const eng of gen.engines) {
          // Find or link OilSpec if available
          let oilSpecId: string | null = null;
          if (eng.oilSpec?.viscosity) {
            try {
              const spec = await prisma.oilFinderOilSpec.findFirst({
                where: {
                  viscosity: eng.oilSpec.viscosity,
                  ...(eng.oilSpec.oemApproval ? { oemApproval: { contains: eng.oilSpec.oemApproval.split('/')[0].trim(), mode: 'insensitive' } } : {}),
                },
              });
              if (spec) {
                oilSpecId = spec.id;
              }
            } catch {
              // Ignore spec lookup error
            }
          }

          // 4. Create VehicleEngine
          await prisma.vehicleEngine.create({
            data: {
              generationId: genRecord.id,
              name: `${eng.engineCode} (${eng.powerHp ? eng.powerHp + ' ch' : ''})`.trim(),
              engineCode: eng.engineCode,
              displacementCc: eng.displacementCc || null,
              powerHp: eng.powerHp ? Number(eng.powerHp) : null,
              powerKw: eng.powerKw ? Number(eng.powerKw) : null,
              fuelType: eng.fuelType || 'essence',
              oilSpecId: oilSpecId,
            },
          });
          insertedEngines++;
        }
      }
    }
  }

  console.log('\n✅ Clean Vehicle Catalog Migration Completed (Dacia + VAG)!');
  console.log(`- Makes: ${insertedMakes}`);
  console.log(`- Models: ${insertedModels}`);
  console.log(`- Generations: ${insertedGenerations}`);
  console.log(`- Engines: ${insertedEngines}`);

  console.log('\n🔍 Running Postgres Read-Back Verification for Scoped Makes...');
  console.log('-----------------------------------------------------------------------------------------');
  console.log('| Make        | DB Models (JSON) | DB Gens (JSON) | DB Engines (JSON) | Verification     |');
  console.log('-----------------------------------------------------------------------------------------');

  let allMatched = true;
  for (const m of makes) {
    const dbMake = await prisma.vehicleMake.findUnique({
      where: { slug: m.makeSlug },
      include: {
        models: {
          include: {
            generations: {
              include: {
                engines: true,
              },
            },
          },
        },
      },
    });

    const jsonModelCount = Object.keys(m.models).length;
    let jsonGenCount = 0;
    let jsonEngineCount = 0;
    for (const mod of Object.values(m.models)) {
      jsonGenCount += Object.keys(mod.generations).length;
      for (const gen of Object.values(mod.generations)) {
        jsonEngineCount += gen.engines.length;
      }
    }

    const dbModelCount = dbMake?.models?.length || 0;
    let dbGenCount = 0;
    let dbEngineCount = 0;
    if (dbMake?.models) {
      for (const mod of dbMake.models) {
        dbGenCount += mod.generations?.length || 0;
        for (const gen of mod.generations || []) {
          dbEngineCount += gen.engines?.length || 0;
        }
      }
    }

    const match = dbModelCount === jsonModelCount && dbGenCount === jsonGenCount && dbEngineCount === jsonEngineCount;
    if (!match) allMatched = false;

    const makePad = m.makeName.padEnd(11);
    const modStr = `${dbModelCount} (${jsonModelCount})`.padEnd(16);
    const genStr = `${dbGenCount} (${jsonGenCount})`.padEnd(14);
    const engStr = `${dbEngineCount} (${jsonEngineCount})`.padEnd(17);
    const status = match ? '✅ PASS' : '❌ MISMATCH';

    console.log(`| ${makePad} | ${modStr} | ${genStr} | ${engStr} | ${status.padEnd(16)} |`);
  }
  console.log('-----------------------------------------------------------------------------------------');
  if (allMatched) {
    console.log('🎉 ALL ROW COUNTS MATCH CANONICAL JSON PERFECTLY!\n');
  } else {
    console.warn('⚠️ SOME ROW COUNTS DIFFER BETWEEN POSTGRES AND JSON!\n');
  }
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
