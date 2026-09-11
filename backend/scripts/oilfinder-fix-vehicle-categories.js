/**
 * Re-categorises vehicles that were filed under "automobile" by mistake.
 *
 * Root cause: the brands below exist twice in OilFinderVehicle — a correctly
 * categorised UPPERCASE row set that was hand-seeded, and a Title-Case duplicate
 * from the TecDoc bulk import whose `category` column was left at "automobile"
 * for every row. getMakes() keys categories by slugify(make), so both sets
 * collapse onto one slug and the brand surfaces under *both* filters: Yamaha,
 * Tohatsu and Iveco all showed up in the car dropdown.
 *
 * Two stores have to agree, because getMakes()/getModels() read the catalogue
 * file first and only fall back to the database for makes absent from it:
 *   1. OilFinderVehicle.category            (database)
 *   2. makeNode.categories / modelNode.category (clean-catalog-hierarchy.json)
 *
 * Runs read-only unless --apply is passed. Always writes a snapshot first.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/category-fix-snapshot-${Date.now()}.json`;

/** Brands that build exactly one kind of vehicle — safe to move wholesale. */
const WHOLE_BRAND = {
  moto: ['APRILIA', 'CFMOTO', 'KAWASAKI', 'KTM', 'KYMCO', 'MOTO GUZZI', 'SENKE',
    'SLC', 'SMT', 'SYM', 'VESPA', 'YAMAHA', 'ZIMOTA', 'ZONTES'],
  marine: ['HONDA MARINE', 'MERCURY', 'PARSUN', 'SELVA', 'SUZUKI MARINE',
    'TOHATSU', 'YAMAHA MARINE', 'YANMAR'],
  'poids-lourd': ['ASTRA', 'DAF', 'DONGFENG', 'FAW', 'FORD TRUCKS', 'IVECO', 'JAC',
    'KING LONG', 'MAN', 'OTOKAR', 'RENAULT TRUCKS', 'SCANIA', 'SHACMAN',
    'SINOTRUK', 'VOLVO TRUCKS'],
};

/**
 * Brands that genuinely build more than one kind of vehicle. Each rule is tried
 * in order and the first match wins; anything unmatched keeps its category.
 * KTM is listed in WHOLE_BRAND as moto but builds one car, so it needs an
 * exception here — the override runs after the wholesale pass.
 */
const SPLIT_BRAND = {
  KTM: [[/x-?bow/i, 'automobile']],
  PIAGGIO: [
    [/^(ape|porter|quargo)/i, 'poids-lourd'],
    [/^(beverly|liberty|medley|m500)/i, 'moto'],
  ],
  ISUZU: [[/^(elf|ftr|fvr|gvr|nkr|nlr|npr|nqr)\b/i, 'poids-lourd']],
  HYUNDAI: [[/^(hd170|hd78|xcient)\b/i, 'poids-lourd']],
  'MERCEDES-BENZ': [[/^(actros|arocs|atego|vario|t2\/l|henschel)\b/i, 'poids-lourd']],
  TATA: [[/^(lpt|prima|signa|loadbeta)\b/i, 'poids-lourd']],
  CHANGAN: [[/^(hunter|kaicene)\b/i, 'poids-lourd']],
};

/** DB spelling -> catalogue-file spelling. */
const toCatalogCat = (c) => (c === 'poids-lourd' ? 'poids_lourd' : c);

function targetFor(make, model) {
  const MAKE = make.toUpperCase().trim();
  const rules = SPLIT_BRAND[MAKE];
  if (rules) {
    for (const [re, cat] of rules) if (re.test(model || '')) return cat;
  }
  for (const [cat, brands] of Object.entries(WHOLE_BRAND)) {
    if (brands.includes(MAKE)) return cat;
  }
  // A split brand whose model matched no rule keeps whatever it has.
  return null;
}

async function main() {
  const prisma = new PrismaClient();
  const rows = await prisma.oilFinderVehicle.findMany({
    select: { id: true, make: true, model: true, category: true },
  });

  const changes = [];
  for (const r of rows) {
    const want = targetFor(r.make, r.model);
    if (want && want !== r.category) changes.push({ ...r, from: r.category, to: want });
  }

  // --- catalogue file ---
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const catalogChanges = [];
  for (const makeNode of Object.values(catalog)) {
    const MAKE = (makeNode.makeName || '').toUpperCase().trim();
    const isWhole = Object.values(WHOLE_BRAND).some((b) => b.includes(MAKE));
    if (!isWhole && !SPLIT_BRAND[MAKE]) continue;
    // Resolve every model first, so the make-level array below reflects the
    // post-fix state even on a dry run (where nothing is mutated).
    const resolved = [];
    for (const modelNode of Object.values(makeNode.models || {})) {
      const want = targetFor(MAKE, modelNode.modelName || '');
      const wantCat = want ? toCatalogCat(want) : modelNode.category;
      resolved.push(wantCat);
      if (want && modelNode.category !== wantCat) {
        catalogChanges.push({
          make: makeNode.makeName, model: modelNode.modelName,
          from: modelNode.category, to: wantCat,
        });
        if (APPLY) modelNode.category = wantCat;
      }
    }
    // The make-level `categories` array is what hides a brand from a dropdown;
    // rebuild it from whatever its models now say.
    const cats = [...new Set(resolved.filter(Boolean))];
    if (cats.length && JSON.stringify(cats) !== JSON.stringify(makeNode.categories)) {
      catalogChanges.push({
        make: makeNode.makeName, model: '(make-level categories)',
        from: JSON.stringify(makeNode.categories), to: JSON.stringify(cats),
      });
      if (APPLY) makeNode.categories = cats;
    }
  }

  // --- report ---
  const byMake = new Map();
  for (const c of changes) {
    const k = `${c.make.toUpperCase()} ${c.from} -> ${c.to}`;
    byMake.set(k, (byMake.get(k) || 0) + 1);
  }
  console.log(`=== ${APPLY ? 'APPLYING' : 'DRY RUN'} ===`);
  console.log(`\nOilFinderVehicle rows to recategorise: ${changes.length}`);
  [...byMake.entries()].sort().forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));
  console.log(`\nCatalogue-file changes: ${catalogChanges.length}`);
  catalogChanges.forEach((c) => console.log(`  ${c.make} / ${c.model}: ${c.from} -> ${c.to}`));

  if (!APPLY) {
    console.log('\nNothing written. Re-run with --apply.');
    await prisma.$disconnect();
    return;
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify({ dbChanges: changes, catalogChanges }, null, 2));
  console.log(`\nSnapshot written to ${SNAPSHOT}`);

  // Group by target category so this is a handful of updateMany calls rather
  // than one round trip per row.
  const byTarget = new Map();
  for (const c of changes) {
    if (!byTarget.has(c.to)) byTarget.set(c.to, []);
    byTarget.get(c.to).push(c.id);
  }
  let updated = 0;
  for (const [cat, ids] of byTarget) {
    for (let i = 0; i < ids.length; i += 500) {
      const res = await prisma.oilFinderVehicle.updateMany({
        where: { id: { in: ids.slice(i, i + 500) } },
        data: { category: cat },
      });
      updated += res.count;
    }
  }
  console.log(`Database rows updated: ${updated}`);

  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`Catalogue file rewritten: ${CATALOG}`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
