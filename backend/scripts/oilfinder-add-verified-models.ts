/**
 * Adds researched, per-engine oil-finder entries and removes fabricated ones.
 *
 * Background: the rows sourced from "SpecPart OEM Catalogue Homologations" were
 * built by applying one engine list per MAKE to every model of that make. For
 * mainstream brands that mostly coincides with real platform sharing, but for
 * the low-information brands it produced combinations that never existed --
 * e.g. the Chery QQ, a city car, listed with a 1.6 TGDI 197 hp. All of it is
 * flagged confidence "high" and points at a single generic oil spec per make,
 * so a Haval F7 (which actually wants 0W-20 ACEA C5, 4.1 L) was being told
 * 5W-30 ACEA A3/B4, 4 L.
 *
 * Each model in the data file below carries its own researched spec and cites
 * the source it came from. Replaced rows are written to a snapshot file before
 * deletion so the change is recoverable.
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/oilfinder-add-verified-models.ts            # dry run
 *   npx tsx scripts/oilfinder-add-verified-models.ts --apply
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
// A data file may be named as the first argument, so several batches can be kept
// side by side instead of the file being rewritten for each one.
const DATA_ARG = process.argv.slice(2).find((a) => !a.startsWith('--'));
const DATA_PATH = DATA_ARG
  ? path.resolve(DATA_ARG)
  : path.join(__dirname, 'oilfinder-verified-models.json');
const SNAPSHOT_PATH = path.join(
  __dirname,
  `oilfinder-replaced-snapshot-${new Date().toISOString().slice(0, 10)}.json`,
);
const FABRICATED_SOURCE = 'SpecPart OEM Catalogue Homologations';

const prisma = new PrismaClient();

interface OilSpecInput {
  viscosity: string;
  apiStandard?: string | null;
  aceaStandard?: string | null;
  oemApproval?: string | null;
  capacityLiters?: number | null;
  changeIntervalKm?: number | null;
}

interface EngineInput {
  engineCode: string;
  displacementCc?: number | null;
  powerHp?: number | null;
  fuelType: string;
  spec: OilSpecInput;
}

interface ModelInput {
  make: string;
  model: string;
  generation: string;
  yearFrom?: number | null;
  yearTo?: number | null;
  category?: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  /** Remove the fabricated catalogue rows for this make+model before inserting. */
  replaceFabricated?: boolean;
  engines: EngineInput[];
}

function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * An engine code reduced to what identifies the engine: punctuation dropped and
 * any trailing parenthetical trim removed, so "D16DTF (1.6 e-XDi)" and "D16DTF"
 * are recognised as one engine across the two stores.
 */
function baseEngineCode(code?: string | null): string {
  return String(code || '')
    .replace(/\s*\(.*$/, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function fingerprintOf(spec: OilSpecInput): string {
  // Must include apiStandard: without it, specs that differ only by API text
  // collapse onto one row and overwrite each other (see tecdoc-catalog-harvester).
  return [
    slugify(spec.viscosity),
    slugify(spec.oemApproval || 'generic'),
    slugify(spec.aceaStandard || 'std'),
    slugify(spec.apiStandard || 'anyapi'),
  ].join('_');
}

const VEHICLE_TYPE_BY_CATEGORY: Record<string, 'AUTOMOBILE' | 'MOTO' | 'POIDS_LOURD' | 'AGRICOLE'> = {
  automobile: 'AUTOMOBILE',
  moto: 'MOTO',
  'poids-lourd': 'POIDS_LOURD',
  agricole: 'AGRICOLE',
};

/** Ensures the make -> model -> generation -> engine chain exists so the car is browsable. */
async function upsertCatalogue(m: ModelInput, category: string): Promise<number> {
  const makeSlug = slugify(m.make);
  // VehicleMake is unique on BOTH name and slug, and the two do not always agree:
  // Volkswagen is stored as name "VW" with slug "volkswagen". Keying the upsert on
  // slug alone therefore tried to create a second row with an existing name and
  // failed the unique constraint, so resolve on either before creating.
  let make = await prisma.vehicleMake.findFirst({
    where: { OR: [{ slug: makeSlug }, { name: { equals: m.make, mode: "insensitive" } }] },
  });
  if (!make) {
    make = await prisma.vehicleMake.create({ data: { name: m.make, slug: makeSlug } });
  }

  const modelSlug = slugify(`${m.make} ${m.model}`);
  const model = await prisma.vehicleModel.upsert({
    where: { slug: modelSlug },
    update: {},
    create: {
      makeId: make.id,
      name: m.model,
      slug: modelSlug,
      vehicleType: VEHICLE_TYPE_BY_CATEGORY[category] || 'AUTOMOBILE',
    },
  });

  const generationSlug = slugify(m.generation);
  const generation = await prisma.vehicleGeneration.upsert({
    where: { modelId_slug: { modelId: model.id, slug: generationSlug } },
    update: {},
    create: {
      modelId: model.id,
      name: m.generation,
      slug: generationSlug,
      yearFrom: m.yearFrom ?? null,
      yearTo: m.yearTo === 9999 ? null : m.yearTo ?? null,
    },
  });

  let added = 0;
  for (const eng of m.engines) {
    const existing = await prisma.vehicleEngine.findFirst({
      where: { generationId: generation.id, engineCode: eng.engineCode },
    });
    if (existing) continue;

    const spec = await prisma.oilFinderOilSpec.findUnique({
      where: { fingerprint: fingerprintOf(eng.spec) },
    });

    await prisma.vehicleEngine.create({
      data: {
        generationId: generation.id,
        name: eng.powerHp ? `${eng.engineCode} ${eng.powerHp} ch` : eng.engineCode,
        engineCode: eng.engineCode,
        displacementCc: eng.displacementCc ?? null,
        powerHp: eng.powerHp ?? null,
        fuelType: eng.fuelType,
        oilSpecId: spec?.id ?? null,
      },
    });
    added++;
  }
  return added;
}

/**
 * The make/model/engine dropdowns read clean-catalog-hierarchy.json first and
 * only fall back to the database when a make is absent from it. So a car added
 * to the DB alone stays invisible for any make already in this file (Geely has
 * bl/ck/hq/mr/pu in here, which is why Coolray never appeared). This merges the
 * verified models into that file, which is bind-mounted and therefore survives
 * container recreation.
 */
/**
 * The catalogue key is not always slugify(makeName) - Volkswagen lives under
 * "volkswagen" while its makeName is "VW" - so a make must be resolved on either
 * before a node is created, or the brand ends up in the file twice and appears
 * twice in the dropdown.
 */
function findMakeKey(catalog: Record<string, any>, makeName: string): string | undefined {
  const makeSlug = slugify(makeName);
  if (catalog[makeSlug]) return makeSlug;
  return Object.keys(catalog).find(
    (k) =>
      catalog[k]?.makeSlug === makeSlug ||
      slugify(catalog[k]?.makeName || '') === makeSlug ||
      String(catalog[k]?.makeName || '').toUpperCase() === makeName.toUpperCase(),
  );
}

async function updateCleanCatalog(models: ModelInput[]): Promise<{ added: number; carried: number; path: string } | null> {
  const candidates = [
    '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json',
    path.join(process.cwd(), 'oil-finder-full-dataset', 'clean-catalog-hierarchy.json'),
  ];
  const catalogPath = candidates.find((p) => fs.existsSync(p));
  if (!catalogPath) {
    console.log('  ! clean-catalog-hierarchy.json not found - browse dropdowns NOT updated');
    return null;
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  let added = 0;

  for (const m of models) {
    const makeSlug = slugify(m.make);
    // The catalogue key is not always slugify(makeName): Volkswagen is stored
    // under "volkswagen" while its makeName is "VW". Keying on the slug alone
    // would add a second node and the brand would appear twice in the dropdown,
    // so match an existing node on either before creating one.
    let makeKey = findMakeKey(catalog, m.make);
    if (!makeKey) {
      makeKey = makeSlug;
      catalog[makeKey] = { makeName: m.make, makeSlug, categories: [], models: {} };
    }
    const makeNode = catalog[makeKey];
    makeNode.models = makeNode.models || {};

    const category = m.category || 'automobile';
    if (Array.isArray(makeNode.categories) && !makeNode.categories.includes(category)) {
      makeNode.categories.push(category);
    }

    const modelSlug = slugify(m.model);
    if (!makeNode.models[modelSlug]) {
      makeNode.models[modelSlug] = {
        modelName: m.model,
        modelSlug,
        category,
        generations: {},
      };
    }
    const modelNode = makeNode.models[modelSlug];
    modelNode.generations = modelNode.generations || {};

    const genSlug = slugify(m.generation);
    if (!modelNode.generations[genSlug]) {
      modelNode.generations[genSlug] = {
        genName: m.generation,
        genSlug,
        yearFrom: m.yearFrom ?? null,
        yearTo: m.yearTo === 9999 ? null : m.yearTo ?? null,
        engines: [],
      };
    }
    const genNode = modelNode.generations[genSlug];
    genNode.engines = genNode.engines || [];

    for (const eng of m.engines) {
      // Compare on the base code, not the exact string. The catalogue and a
      // verified entry routinely punctuate the same engine differently or append
      // a trim, so an exact-match check added "D16DTF (1.6 e-XDi)" alongside the
      // catalogue's own "D16DTF" and the customer was offered both.
      if (genNode.engines.some((e: any) => baseEngineCode(e.engineCode) === baseEngineCode(eng.engineCode))) continue;
      genNode.engines.push({
        engineCode: eng.engineCode,
        fuelType: eng.fuelType,
        displacementCc: eng.displacementCc ?? null,
        powerHp: eng.powerHp ?? null,
        powerKw: null,
        yearFrom: m.yearFrom ?? null,
        yearTo: m.yearTo === 9999 ? null : m.yearTo ?? null,
        oilSpec: {
          viscosity: eng.spec.viscosity,
          oemApproval: eng.spec.oemApproval ?? null,
          aceaStandard: eng.spec.aceaStandard ?? null,
          apiStandard: eng.spec.apiStandard ?? null,
          capacityLiters: eng.spec.capacityLiters ?? null,
          changeIntervalKm: eng.spec.changeIntervalKm ?? null,
        },
      });
      added++;
    }
  }

  // Adding a make to this file SUPPRESSES the database fallback for it, so any
  // model that only existed in the DB would silently vanish from the dropdown
  // (that is how Changan's Hunter/Kaicene and Haval's H2 disappeared). Carry
  // those across for every make touched here.
  // make|model -> category, from the rows that actually describe these vehicles.
  const categoryRows = await prisma.oilFinderVehicle.findMany({
    select: { make: true, model: true, category: true },
    distinct: ['make', 'model', 'category'],
  });
  const categoryByModel = new Map<string, string>();
  for (const r of categoryRows) {
    const key = `${slugify(r.make)}|${slugify(r.model)}`;
    // A non-automobile category is the informative one: where a make has both,
    // the row that says "moto" is the one worth carrying.
    if (r.category && (r.category !== 'automobile' || !categoryByModel.has(key))) {
      categoryByModel.set(key, r.category === 'poids-lourd' ? 'poids_lourd' : r.category);
    }
  }

  let carried = 0;
  for (const makeName of new Set(models.map((m) => m.make))) {
    const makeKey = findMakeKey(catalog, makeName);
    const makeNode = makeKey ? catalog[makeKey] : undefined;
    if (!makeNode) continue;

    const dbModels = await prisma.vehicleModel.findMany({
      where: {
        make: {
          OR: [
            { slug: slugify(makeName) },
            { name: { equals: makeName, mode: 'insensitive' } },
          ],
        },
      },
      include: {
        generations: { include: { engines: { include: { oilSpec: true } } } },
      },
    });

    for (const dbModel of dbModels) {
      const slug = slugify(dbModel.name);
      if (makeNode.models[slug]) continue;

      const generations: Record<string, unknown> = {};
      for (const gen of dbModel.generations) {
        generations[slugify(gen.name)] = {
          genName: gen.name,
          genSlug: slugify(gen.name),
          yearFrom: gen.yearFrom,
          yearTo: gen.yearTo,
          engines: gen.engines.map((e) => ({
            engineCode: e.engineCode,
            fuelType: e.fuelType,
            displacementCc: e.displacementCc,
            powerHp: e.powerHp,
            powerKw: e.powerKw,
            yearFrom: gen.yearFrom,
            yearTo: gen.yearTo,
            oilSpec: e.oilSpec
              ? {
                  viscosity: e.oilSpec.viscosity,
                  oemApproval: e.oilSpec.oemApproval,
                  aceaStandard: e.oilSpec.aceaStandard,
                  apiStandard: e.oilSpec.apiStandard,
                  capacityLiters: e.oilSpec.capacityLiters,
                  changeIntervalKm: e.oilSpec.changeIntervalKm,
                }
              : null,
          })),
        };
      }
      if (!Object.keys(generations).length) continue;

      // Carry the model's real category across. Hardcoding 'automobile' here put
      // Suzuki's GSX-S750, Hayabusa, Burgman and V-Strom into the car catalogue,
      // where their entries then outranked the researched motorcycle specs and a
      // wet-clutch bike was offered a 5W-30 car oil.
      const carriedCategory =
        categoryByModel.get(`${slugify(makeName)}|${slugify(dbModel.name)}`) || 'automobile';
      makeNode.models[slug] = {
        modelName: dbModel.name,
        modelSlug: slug,
        category: carriedCategory,
        generations,
      };
      carried++;
      console.log(`    ~ carried over existing DB model: ${makeNode.makeName} ${dbModel.name}`);
    }
  }

  if (added > 0 || carried > 0) {
    const backup = `${catalogPath}.bak-${Date.now()}`;
    fs.copyFileSync(catalogPath, backup);
    fs.writeFileSync(catalogPath, JSON.stringify(catalog));
    console.log(`  Catalogue file updated (backup: ${backup})`);
  }
  return { added, carried, path: catalogPath };
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  // The file is either a bare array of models, or { purgeFabricatedMakes, models }.
  const models: ModelInput[] = Array.isArray(raw) ? raw : raw.models;
  const purgeMakes: string[] = Array.isArray(raw) ? [] : raw.purgeFabricatedMakes || [];

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Models in data file: ${models.length}\n`);

  const snapshot: unknown[] = [];
  let deleted = 0;

  // Whole-make purge: these brands' catalogue rows are fabricated end to end,
  // including junk model names (a "model" literally called CHERY) and duplicate
  // spellings of the same car (TIGGO 2 / Tiggo 2). Canonical models are
  // re-inserted from the researched list below.
  for (const make of purgeMakes) {
    const doomed = await prisma.oilFinderVehicle.findMany({
      where: { make: { equals: make, mode: 'insensitive' }, source: FABRICATED_SOURCE },
      include: { oilSpec: true },
    });
    if (!doomed.length) continue;
    snapshot.push(...doomed);
    deleted += doomed.length;
    const distinctModels = new Set(doomed.map((d) => d.model)).size;
    console.log(`  - ${make}: purging ${doomed.length} fabricated row(s) across ${distinctModels} model name(s)`);
    if (APPLY) {
      await prisma.oilFinderVehicle.deleteMany({ where: { id: { in: doomed.map((d) => d.id) } } });
    }
  }
  let inserted = 0;
  let alreadyPresent = 0;
  let cataloguedEngines = 0;
  const specCache = new Map<string, string>();

  for (const m of models) {
    const category = m.category || 'automobile';

    if (m.replaceFabricated) {
      const doomed = await prisma.oilFinderVehicle.findMany({
        where: {
          make: { equals: m.make, mode: 'insensitive' },
          model: { equals: m.model, mode: 'insensitive' },
          source: FABRICATED_SOURCE,
        },
        include: { oilSpec: true },
      });
      if (doomed.length) {
        snapshot.push(...doomed);
        deleted += doomed.length;
        console.log(`  - ${m.make} ${m.model}: removing ${doomed.length} fabricated row(s)`);
        if (APPLY) {
          await prisma.oilFinderVehicle.deleteMany({
            where: { id: { in: doomed.map((d) => d.id) } },
          });
        }
      }
    }

    for (const eng of m.engines) {
      const fingerprint = fingerprintOf(eng.spec);
      let specId = specCache.get(fingerprint);

      if (!specId && APPLY) {
        const spec = await prisma.oilFinderOilSpec.upsert({
          where: { fingerprint },
          update: {
            capacityLiters: eng.spec.capacityLiters ?? null,
            changeIntervalKm: eng.spec.changeIntervalKm ?? null,
          },
          create: {
            viscosity: eng.spec.viscosity,
            apiStandard: eng.spec.apiStandard ?? null,
            aceaStandard: eng.spec.aceaStandard ?? null,
            oemApproval: eng.spec.oemApproval ?? null,
            capacityLiters: eng.spec.capacityLiters ?? null,
            changeIntervalKm: eng.spec.changeIntervalKm ?? null,
            fingerprint,
          },
        });
        specId = spec.id;
        specCache.set(fingerprint, specId);
      }

      const existing = await prisma.oilFinderVehicle.findFirst({
        where: {
          make: m.make,
          model: m.model,
          generation: m.generation,
          engineCode: eng.engineCode,
          source: m.source,
        },
      });
      if (existing) {
        alreadyPresent++;
        continue;
      }

      inserted++;
      console.log(
        `  + ${m.make} ${m.model} [${eng.engineCode}] ${eng.displacementCc ?? '?'}cc ` +
          `${eng.powerHp ?? '?'}hp ${eng.fuelType} -> ${eng.spec.viscosity} ` +
          `${eng.spec.aceaStandard || eng.spec.apiStandard || ''} ${eng.spec.capacityLiters ?? '?'}L`,
      );

      if (APPLY) {
        await prisma.oilFinderVehicle.create({
          data: {
            make: m.make,
            model: m.model,
            generation: m.generation,
            yearFrom: m.yearFrom ?? null,
            yearTo: m.yearTo ?? null,
            engineCode: eng.engineCode,
            displacementCc: eng.displacementCc ?? null,
            powerHp: eng.powerHp ?? null,
            fuelType: eng.fuelType,
            oilSpecId: specId!,
            source: m.source,
            confidence: m.confidence,
            category,
          },
        });
      }
    }

    // OilFinderVehicle only backs the lookup-by-spec path. The make/model/engine
    // dropdowns a customer actually clicks through read the catalogue chain
    // (VehicleMake -> VehicleModel -> VehicleGeneration -> VehicleEngine), so a
    // car is only findable once it exists there too.
    if (APPLY) {
      const catalogued = await upsertCatalogue(m, category);
      cataloguedEngines += catalogued;
    } else {
      cataloguedEngines += m.engines.length;
    }
  }

  if (snapshot.length) {
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
    console.log(`\nSnapshot of replaced rows -> ${SNAPSHOT_PATH}`);
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Fabricated rows removed: ${deleted}`);
  console.log(`  Vehicle rows inserted:   ${inserted}`);
  console.log(`  Already present:         ${alreadyPresent}`);
  console.log(`  Catalogue engines added: ${cataloguedEngines} (make/model/generation/engine browse chain)`);

  if (APPLY) {
    const cat = await updateCleanCatalog(models);
    if (cat) console.log(`  Browse-dropdown entries added: ${cat.added}, existing DB models carried over: ${cat.carried} -> ${cat.path}`);
    console.log('\n  NOTE: the catalogue file is cached in-process; restart the backend for it to take effect.');
  }
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
