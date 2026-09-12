/**
 * Applies a verified per-engine-code oil spec table.
 *
 * The catalogue assigns specs by era + fuel + displacement bucket, so 23,300
 * engines share 494 specs and every Yaris engine from the 1.0 to the 1.8 gets
 * the same generated value. The right granularity is the engine code: a 2ZR-FE
 * needs the same oil whether it sits in a Yaris, an Auris or a Corolla, so one
 * corrected row fixes every model that uses it.
 *
 * Writes both stores, because the dropdowns read the catalogue file first and
 * only fall back to the database:
 *   1. engines[].oilSpec + engines[].fuelType in clean-catalog-hierarchy.json
 *   2. OilFinderVehicle.fuelType and its linked OilFinderOilSpec
 *
 * Usage: node oilfinder-apply-engine-specs.js <table.json> [--apply]
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const TABLE = process.argv[2];
const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';

if (!TABLE || TABLE.startsWith('--')) {
  console.error('usage: node oilfinder-apply-engine-specs.js <table.json> [--apply]');
  process.exit(1);
}

const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Engine codes vary in punctuation between stores: "1H-Z" vs "1HZ". */
const normCode = (c) => (c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * The catalogue suffixes some codes with a build variant — "2ZR-FE (SC)" for
 * the supercharged GRMN Yaris, "1CD-FTV (CLEAN POWER)". Try the code as written
 * first so a variant can be given its own entry, then fall back to the base
 * code, which is what carries the oil requirement.
 */
function lookup(byCode, rawCode, patterns) {
  const exact = byCode.get(normCode(rawCode));
  if (exact) return exact;
  const base = (rawCode || '').replace(/\s*\(.*$/, '').trim();
  const byBase = base && base !== rawCode ? byCode.get(normCode(base)) : undefined;
  if (byBase) return byBase;

  // PSA names its engines "RHR (DW10BTED4)" — the parenthesised family is what
  // determines the oil, and there are far too many build codes to list. Patterns
  // are tried in table order, so put the more specific family first: DW10F
  // (BlueHDi, SCR) must be matched before the generic DW10.
  for (const { re, entry } of patterns) {
    if (re.test(rawCode || '')) return entry;
  }
  return undefined;
}

/**
 * OilFinderOilSpec rows are shared between vehicles by fingerprint, and the
 * existing fingerprint covers only viscosity and the approval strings — not
 * capacity. Two engines needing 5W-30 API SL but 4.2 L and 6.0 L therefore
 * collide, so updating a matched row in place would silently rewrite the sump
 * capacity of every other vehicle pointing at it, in any make. Scope the
 * fingerprint to the make and include capacity, so a spec written here is only
 * ever shared with an engine that genuinely wants the identical figures.
 */
const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`]
    .map(slugify).join('_');

async function main() {
  const table = JSON.parse(fs.readFileSync(TABLE, 'utf8'));
  // PSA sells the same engine as a Peugeot, a Citroen and a DS, so a table may
  // name several marques.
  const MAKES = (table.makes || [table.make]).map((m) => m.toUpperCase());
  const MAKE = MAKES[0];
  const isTargetMake = (name) => MAKES.includes((name || '').toUpperCase());

  // code -> entry, plus ordered family patterns for makes that name engines by
  // family rather than by a fixed code list.
  const byCode = new Map();
  const patterns = [];
  for (const e of table.engines) {
    for (const c of e.codes || []) byCode.set(normCode(c), e);
    for (const p of e.patterns || []) patterns.push({ re: new RegExp(p, 'i'), entry: e });
  }
  console.log(`${table.engines.length} spec entries: ${byCode.size} exact codes, ${patterns.length} family patterns for ${MAKE}\n`);

  const prisma = new PrismaClient();
  const report = { catalogEngines: 0, catalogFuel: 0, dbRows: 0, dbFuel: 0, unmatched: new Map() };

  // ── catalogue ──────────────────────────────────────────────────────────────
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  for (const makeNode of Object.values(catalog)) {
    if (!isTargetMake(makeNode.makeName)) continue;
    for (const modelNode of Object.values(makeNode.models || {})) {
      for (const genNode of Object.values(modelNode.generations || {})) {
        for (const eng of genNode.engines || []) {
          const entry = lookup(byCode, eng.engineCode, patterns);
          if (!entry) {
            const k = eng.engineCode || '(blank)';
            report.unmatched.set(k, (report.unmatched.get(k) || 0) + 1);
            continue;
          }
          report.catalogEngines++;
          if (entry.fuelType && eng.fuelType !== entry.fuelType) report.catalogFuel++;
          if (APPLY) {
            eng.fuelType = entry.fuelType || eng.fuelType;
            eng.oilSpec = {
              ...entry.spec,
              // Preserve JASO where the catalogue had one (motorcycle entries).
              ...(eng.oilSpec?.jasoStandard ? { jasoStandard: eng.oilSpec.jasoStandard } : {}),
            };
          }
        }
      }
    }
  }

  // ── database ───────────────────────────────────────────────────────────────
  const rows = await prisma.oilFinderVehicle.findMany({
    where: { OR: MAKES.map((m) => ({ make: { equals: m, mode: 'insensitive' } })) },
    select: { id: true, engineCode: true, fuelType: true, model: true },
  });

  // Resolve each distinct spec once, then point rows at it.
  const specIdByFingerprint = new Map();
  const plan = [];
  for (const r of rows) {
    const entry = lookup(byCode, r.engineCode, patterns);
    if (!entry) continue;
    plan.push({ row: r, entry });
  }
  report.dbRows = plan.length;
  report.dbFuel = plan.filter((p) => p.entry.fuelType && p.row.fuelType !== p.entry.fuelType).length;

  console.log(`Catalogue engines matched: ${report.catalogEngines} (fuelType corrections: ${report.catalogFuel})`);
  console.log(`OilFinderVehicle rows matched: ${report.dbRows} (fuelType corrections: ${report.dbFuel})`);
  console.log(`\nCatalogue engine codes with NO entry in the table: ${report.unmatched.size}`);
  const unmatched = [...report.unmatched.entries()].sort((a, b) => b[1] - a[1]);
  console.log('  ' + unmatched.slice(0, 30).map(([c, n]) => `${c}(${n})`).join(', '));
  if (unmatched.length > 30) console.log(`  ...and ${unmatched.length - 30} more`);

  if (!APPLY) {
    console.log('\nNothing written. Re-run with --apply.');
    await prisma.$disconnect();
    return;
  }

  // The fingerprint encodes every field written here, so a spec row that already
  // carries it is already correct and needs no update.
  const resolveSpecId = async (entry) => {
    const fp = fingerprint(entry.spec, MAKE);
    let specId = specIdByFingerprint.get(fp);
    if (!specId) {
      const existing = await prisma.oilFinderOilSpec.findFirst({ where: { fingerprint: fp } });
      const spec = existing
        ?? (await prisma.oilFinderOilSpec.create({ data: { ...entry.spec, fingerprint: fp } }));
      specId = spec.id;
      specIdByFingerprint.set(fp, specId);
    }
    return specId;
  };

  let sourceCollisions = 0;
  for (const { row, entry } of plan) {
    const specId = await resolveSpecId(entry);
    const data = {
      oilSpecId: specId,
      ...(entry.fuelType ? { fuelType: entry.fuelType } : {}),
      confidence: entry.confidence,
    };
    try {
      await prisma.oilFinderVehicle.update({
        where: { id: row.id },
        data: { ...data, source: entry.source },
      });
    } catch (e) {
      // OilFinderVehicle is unique on (make, model, generation, engineCode,
      // source), so where the same vehicle was seeded twice from different
      // sources, writing one shared source to both collides. The spec is what
      // matters; keep the duplicate's original source rather than dropping the
      // correction, and report the count so the duplicates can be cleaned up.
      if (e.code !== 'P2002') throw e;
      await prisma.oilFinderVehicle.update({ where: { id: row.id }, data });
      sourceCollisions++;
    }
  }
  console.log(`\nDatabase rows updated: ${plan.length} across ${specIdByFingerprint.size} distinct specs`);
  if (sourceCollisions > 0) {
    console.log(`  ${sourceCollisions} duplicate rows kept their original source (spec still corrected)`);
  }

  // VehicleEngine is a third store, and the add-models script copies oil specs
  // out of it when it carries a make's database-only models into the catalogue.
  // Leaving it stale therefore re-poisons the catalogue on the next such run -
  // Toyota went from 26 fabricated approvals back up to 328 that way. Correct it
  // here so all three stores agree.
  let engineRows = 0;
  const dbEngines = await prisma.vehicleEngine.findMany({
    where: {
      generation: {
        model: {
          make: { OR: MAKES.flatMap((m) => [{ slug: slugify(m) }, { name: { equals: m, mode: 'insensitive' } }]) },
        },
      },
    },
    select: { id: true, engineCode: true },
  });
  for (const e of dbEngines) {
    const entry = lookup(byCode, e.engineCode, patterns);
    if (!entry) continue;
    const specId = await resolveSpecId(entry);
    await prisma.vehicleEngine.update({
      where: { id: e.id },
      data: { oilSpecId: specId, ...(entry.fuelType ? { fuelType: entry.fuelType } : {}) },
    });
    engineRows++;
  }
  if (engineRows > 0) console.log(`VehicleEngine rows updated: ${engineRows}`);

  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`Catalogue file rewritten: ${CATALOG}`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
