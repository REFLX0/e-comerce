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

const prisma = new PrismaClient();

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

  const jsonPath = path.join(__dirname, '../src/oil-finder/clean-catalog-hierarchy.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Catalog file not found at ${jsonPath}. Run scratch/build-clean-catalog.js first.`);
  }

  const catalog: CleanCatalog = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const makes = Object.values(catalog);

  console.log(`📦 Loaded ${makes.length} makes from clean hierarchy dataset.`);

  let insertedMakes = 0;
  let insertedModels = 0;
  let insertedGenerations = 0;
  let insertedEngines = 0;

  for (const m of makes) {
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
      // Note: model slug is unique per make
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

      for (const gen of Object.values(mod.generations)) {
        // 3. Upsert VehicleGeneration
        const uniqueGenSlug = `${uniqueModelSlug}-${gen.genSlug}`;
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

        for (const eng of gen.engines) {
          // Find or link OilSpec if available
          let oilSpecId: string | null = null;
          if (eng.oilSpec?.viscosity) {
            const specFingerprint = `${eng.oilSpec.viscosity.toLowerCase()}_${(eng.oilSpec.oemApproval || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 80);
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
          try {
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
          } catch {
            // Ignore duplicate engine
          }
        }
      }
    }
  }

  console.log('\n✅ Clean Vehicle Catalog Migration Completed!');
  console.log(`- Makes: ${insertedMakes}`);
  console.log(`- Models: ${insertedModels}`);
  console.log(`- Generations: ${insertedGenerations}`);
  console.log(`- Engines: ${insertedEngines}`);
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
