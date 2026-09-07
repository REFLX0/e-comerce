/**
 * Targeted Dacia Catalog Postgres Sync Script
 * ONLY touches Dacia records (makeSlug: 'dacia').
 * Leaves all other manufacturers completely untouched.
 *
 * Usage: npx tsx backend/scripts/sync-dacia-catalog.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma: any = new PrismaClient();

async function main() {
  console.log('🚀 Starting targeted Postgres sync for DACIA ONLY...');

  const jsonPath = path.join(__dirname, '../src/oil-finder/clean-catalog-hierarchy.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Catalog file not found at ${jsonPath}`);
  }

  const catalog = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const daciaMake = catalog['dacia'];
  if (!daciaMake) {
    throw new Error('Dacia not found in clean-catalog-hierarchy.json');
  }

  // 1. Upsert VehicleMake for Dacia only
  const makeRecord = await prisma.vehicleMake.upsert({
    where: { slug: 'dacia' },
    update: { name: daciaMake.makeName || 'Dacia' },
    create: {
      name: daciaMake.makeName || 'Dacia',
      slug: 'dacia',
    },
  });
  console.log(`✅ Upserted VehicleMake: ${makeRecord.name} (id: ${makeRecord.id})`);

  let syncedModels = 0;
  let syncedGenerations = 0;
  let syncedEngines = 0;

  for (const [modSlug, mod] of Object.entries(daciaMake.models as Record<string, any>)) {
    const uniqueModelSlug = `dacia-${mod.modelSlug || modSlug}`;
    
    // 2. Upsert VehicleModel
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
    syncedModels++;

    const activeGenSlugs = new Set(Object.keys(mod.generations));

    // 3. Find and cleanup orphaned/corrupted generations for this Dacia model (e.g. 'sd', 'express-fsd', 'hs')
    const existingGens = await prisma.vehicleGeneration.findMany({
      where: { modelId: modelRecord.id },
      select: { id: true, slug: true },
    });

    for (const exGen of existingGens) {
      if (!activeGenSlugs.has(exGen.slug)) {
        console.log(`  🗑️ Removing obsolete generation '${exGen.slug}' from model '${modelRecord.name}'`);
        // Delete engines first
        await prisma.vehicleEngine.deleteMany({
          where: { generationId: exGen.id },
        });
        await prisma.vehicleGeneration.delete({
          where: { id: exGen.id },
        });
      }
    }

    // 4. Upsert canonical generations and engines
    for (const [genSlug, gen] of Object.entries(mod.generations as Record<string, any>)) {
      const genRecord = await prisma.vehicleGeneration.upsert({
        where: {
          modelId_slug: {
            modelId: modelRecord.id,
            slug: gen.genSlug || genSlug,
          },
        },
        update: {
          name: gen.genName,
          yearFrom: gen.yearFrom || null,
          yearTo: gen.yearTo === 9999 ? null : gen.yearTo || null,
        },
        create: {
          modelId: modelRecord.id,
          name: gen.genName,
          slug: gen.genSlug || genSlug,
          yearFrom: gen.yearFrom || null,
          yearTo: gen.yearTo === 9999 ? null : gen.yearTo || null,
        },
      });
      syncedGenerations++;

      // Delete old engines for this generation and re-insert deduped set
      await prisma.vehicleEngine.deleteMany({
        where: { generationId: genRecord.id },
      });

      for (const eng of gen.engines || []) {
        // Exclude templated seed phantoms from DB insertion
        if (eng.isTemplatedSeed) {
          continue;
        }

        let oilSpecId: string | null = null;
        if (eng.oilSpec?.viscosity) {
          try {
            const spec = await prisma.oilFinderOilSpec.findFirst({
              where: {
                viscosity: eng.oilSpec.viscosity,
                ...(eng.oilSpec.oemApproval ? { oemApproval: { contains: eng.oilSpec.oemApproval.split('/')[0].trim(), mode: 'insensitive' } } : {}),
              },
            });
            if (spec) oilSpecId = spec.id;
          } catch {}
        }

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
        syncedEngines++;
      }
    }
  }

  console.log('\n✅ DACIA targeted sync completed successfully!');
  console.log(`- Models synced: ${syncedModels}`);
  console.log(`- Generations synced: ${syncedGenerations}`);
  console.log(`- Engines synced: ${syncedEngines}`);
}

main()
  .catch((e) => {
    console.error('Targeted sync error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
