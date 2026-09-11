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
const DATA_PATH = path.join(__dirname, 'oilfinder-verified-models.json');
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

async function main() {
  const models: ModelInput[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Models in data file: ${models.length}\n`);

  const snapshot: unknown[] = [];
  let deleted = 0;
  let inserted = 0;
  let alreadyPresent = 0;
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
  }

  if (snapshot.length) {
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
    console.log(`\nSnapshot of replaced rows -> ${SNAPSHOT_PATH}`);
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Fabricated rows removed: ${deleted}`);
  console.log(`  Vehicle rows inserted:   ${inserted}`);
  console.log(`  Already present:         ${alreadyPresent}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
