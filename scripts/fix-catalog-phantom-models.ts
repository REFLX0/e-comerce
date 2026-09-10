/**
 * One-off: clean the ALREADY-HARVESTED clean-catalog-hierarchy.json in place.
 *
 * The harvester (scripts/tecdoc-catalog-harvester.ts) had a bug where a handful of
 * makes get a bare series/class digit or a make-name-as-model phantom entry instead
 * of the real commercial model name (reported live: BMW's model picker showing "3"
 * and "2" as if they were car models, sitting next to the real "Série 3"/"Série 2").
 * That harvester bug is now fixed so future harvests self-heal, but the CURRENTLY
 * live catalog file was generated before the fix and still has the bad entries baked
 * in — this script cleans that existing file directly, no re-harvest (no DB) needed.
 * Mirrors the exact same fixup tables as the harvester so both stay consistent.
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/fix-catalog-phantom-models.ts            # dry-run report
 *   npx tsx scripts/fix-catalog-phantom-models.ts --apply     # write the fix
 *
 * After --apply, restart the backend so it drops its in-memory cache and re-reads
 * the file: docker compose restart backend
 */
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');

interface CleanEngine { engineCode: string; powerHp: number | null; fuelType: string }
interface CleanGeneration { engines: CleanEngine[]; [k: string]: any }
interface CleanModel { modelName: string; modelSlug: string; category?: string; generations: Record<string, CleanGeneration> }
interface CleanMake { makeName: string; makeSlug: string; categories?: string[]; models: Record<string, CleanModel> }
type CleanCatalog = Record<string, CleanMake>;

const MODEL_SLUG_ALIASES: Record<string, { name: string; slug: string }> = {
  'bmw:1': { name: 'Série 1', slug: 'serie-1' },
  'bmw:2': { name: 'Série 2', slug: 'serie-2' },
  'bmw:3': { name: 'Série 3', slug: 'serie-3' },
  'bmw:4': { name: 'Série 4', slug: 'serie-4' },
  'bmw:5': { name: 'Série 5', slug: 'serie-5' },
  'bmw:6': { name: 'Série 6', slug: 'serie-6' },
  'bmw:7': { name: 'Série 7', slug: 'serie-7' },
  'bmw:8': { name: 'Série 8', slug: 'serie-8' },
  'mercedes-benz:a': { name: 'Classe A', slug: 'classe-a' },
  'mercedes-benz:a-class': { name: 'Classe A', slug: 'classe-a' },
  'mercedes-benz:b': { name: 'Classe B', slug: 'classe-b' },
  'mercedes-benz:c': { name: 'Classe C', slug: 'classe-c' },
  'mercedes-benz:c-class': { name: 'Classe C', slug: 'classe-c' },
  'mercedes-benz:e': { name: 'Classe E', slug: 'classe-e' },
  'mercedes-benz:e-class': { name: 'Classe E', slug: 'classe-e' },
  'mercedes-benz:g': { name: 'Classe G', slug: 'classe-g' },
  'mercedes-benz:s': { name: 'Classe S', slug: 'classe-s' },
  'mercedes-benz:v': { name: 'Classe V', slug: 'classe-v' },
  'volkswagen:t': { name: 'T-Roc', slug: 't-roc' },
  'volkswagen:troc': { name: 'T-Roc', slug: 't-roc' },
  'ford:c': { name: 'C-Max', slug: 'c-max' },
  'ford:cmax': { name: 'C-Max', slug: 'c-max' },
  'toyota:rav': { name: 'RAV4', slug: 'rav4' },
  'toyota:chr': { name: 'C-HR', slug: 'c-hr' },
  'honda:crv': { name: 'CR-V', slug: 'cr-v' },
  'honda:hrv': { name: 'HR-V', slug: 'hr-v' },
  'nissan:xtrail': { name: 'X-Trail', slug: 'x-trail' },
  'mazda:2': { name: 'Mazda 2', slug: 'mazda-2' },
  'mazda:mazda2': { name: 'Mazda 2', slug: 'mazda-2' },
  'mazda:3': { name: 'Mazda 3', slug: 'mazda-3' },
  'mazda:mazda3': { name: 'Mazda 3', slug: 'mazda-3' },
  'mazda:6': { name: 'Mazda 6', slug: 'mazda-6' },
  'mazda:mazda6': { name: 'Mazda 6', slug: 'mazda-6' },
  'mazda:cx5': { name: 'CX-5', slug: 'cx-5' },
  'mazda:cx3': { name: 'CX-3', slug: 'cx-3' },
  'isuzu:dmax': { name: 'D-Max', slug: 'd-max' },
  // Same car, split into two model buckets by an apostrophe/hyphen inconsistency —
  // found via a full-catalog scan (duplicate model names within the same make).
  'kia:cee-d': { name: 'Ceed', slug: 'ceed' },
  'mitsubishi:l-200': { name: 'L200', slug: 'l200' },
};

function genNames(model: CleanModel): string[] {
  return Object.values(model.generations).map((g) => g.genName || '(unnamed)');
}

function mergeModel(catalog: CleanCatalog, makeSlug: string, sourceSlug: string, targetSlug: string, targetName?: string): { genNames: string[] } | null {
  const make = catalog[makeSlug];
  const source = make?.models?.[sourceSlug];
  if (!source) return null;
  const movedGenNames = genNames(source);

  if (!make.models[targetSlug]) {
    make.models[targetSlug] = {
      modelName: targetName || source.modelName,
      modelSlug: targetSlug,
      category: source.category || 'automobile',
      generations: {},
    };
  }
  const target = make.models[targetSlug];
  if (targetName) target.modelName = targetName;

  for (const [genKey, genVal] of Object.entries(source.generations)) {
    if (!target.generations[genKey]) {
      target.generations[genKey] = genVal;
    } else {
      const existing = target.generations[genKey].engines;
      const seen = new Set(existing.map((e) => `${e.engineCode}_${e.powerHp || ''}_${e.fuelType || ''}`));
      for (const eng of genVal.engines) {
        const k = `${eng.engineCode}_${eng.powerHp || ''}_${eng.fuelType || ''}`;
        if (!seen.has(k)) {
          seen.add(k);
          existing.push(eng);
        }
      }
    }
  }
  delete make.models[sourceSlug];
  return { genNames: movedGenNames };
}

function dropIfPresent(catalog: CleanCatalog, makeSlug: string, modelSlug: string): { genNames: string[] } | null {
  const model = catalog[makeSlug]?.models?.[modelSlug];
  if (!model) return null;
  const names = genNames(model);
  delete catalog[makeSlug].models[modelSlug];
  return { genNames: names };
}

function cleanCatalog(catalog: CleanCatalog): { renamed: string[]; merged: string[]; dropped: string[]; review: string[] } {
  const renamed: string[] = [];
  const merged: string[] = [];
  const dropped: string[] = [];
  const review: string[] = [];

  // 1. Bare digit/letter fragments that should be a named Série/Classe/etc model.
  // Low ambiguity: these makes have no OTHER real model that a bare digit could mean
  // instead (BMW never sells anything just called "3"; same logic for Mercedes classes).
  for (const [key, alias] of Object.entries(MODEL_SLUG_ALIASES)) {
    const [makeSlug, rawSlug] = key.split(':');
    const make = catalog[makeSlug];
    if (!make?.models?.[rawSlug]) continue;
    if (rawSlug === alias.slug) continue; // already correct, nothing to do
    const result = mergeModel(catalog, makeSlug, rawSlug, alias.slug, alias.name);
    if (result) {
      renamed.push(`${makeSlug}: "${rawSlug}" -> "${alias.name}" (${alias.slug}) | generations moved: ${result.genNames.join(', ') || '(none)'}`);
    }
  }

  // 1b. DS make-name-as-model phantom — unlike Porsche/Subaru below, this one is NOT a
  // guess: its only generation is explicitly named "Ds 3" and no "ds3" model exists yet,
  // so there's no ambiguity about where it belongs. Found via a full-catalog scan.
  if (catalog.ds?.models?.ds) {
    const phantom = catalog.ds.models.ds;
    const names = genNames(phantom);
    const looksLikeDs3 = Object.values(phantom.generations).every((g) => /\bds\s*3\b/i.test(g.genName || ''));
    if (looksLikeDs3 && !catalog.ds.models.ds3) {
      const result = mergeModel(catalog, 'ds', 'ds', 'ds3', 'DS 3');
      if (result) merged.push(`ds: "ds" -> "DS 3" (ds3) | generations moved: ${result.genNames.join(', ')}`);
    } else {
      review.push(`ds: "ds" (${names.length} generation(s): ${names.join(', ') || '(none)'}) — NOT auto-merged, generation name doesn't clearly say "DS 3" or a "ds3" model already exists`);
    }
  }

  // 2. Make-name-as-model phantom entries where the ONLY sane target is ambiguous
  // (Porsche sells far more than the 911; Subaru sells far more than the XV) — never
  // auto-merge these, just surface exactly what's in them so a human decides. Ported
  // from a prior one-off cleanup that DID auto-merge these; downgraded to review-only
  // here because that assumption was never re-checked against today's live data.
  for (const [mk, mod, guess] of [
    ['porsche', 'porsche', '911'],
    ['subaru', 'subaru', 'xv'],
  ] as const) {
    const model = catalog[mk]?.models?.[mod];
    if (model) {
      const names = genNames(model);
      review.push(`${mk}: "${mod}" (${names.length} generation(s): ${names.join(', ') || '(none)'}) — NOT auto-merged into "${guess}", check these are really all ${guess} before merging by hand`);
    }
  }

  // 3. Phantom fragments with no recoverable identity.
  for (const [mk, mod] of [
    ['cupra', 'cupra'], ['chery', 'chery'], ['dfsk', 'dfsk'], ['great-wall', 'great'],
    ['byd', 'byd'], ['isuzu', 'isuzu'], ['mahindra', 'mahindra'], ['mahindra', 'kuv'], ['mahindra', 'xuv'],
  ] as const) {
    const result = dropIfPresent(catalog, mk, mod);
    if (result) dropped.push(`${mk}: "${mod}" | generations discarded: ${result.genNames.join(', ') || '(none)'}`);
  }

  // 4. Conditional routing by generation-key content — each generation's own key names
  // the real model (e.g. "f-pace", "countryman"), so this isn't a blind guess like #2.
  if (catalog.jaguar?.models?.jaguar) {
    const phantom = catalog.jaguar.models.jaguar;
    const names = genNames(phantom);
    for (const [gk, gv] of Object.entries(phantom.generations)) {
      const targetSlug = gk.includes('f-pace') ? 'f-pace' : gk.includes('xe') ? 'xe' : null;
      if (targetSlug && catalog.jaguar.models[targetSlug]) {
        catalog.jaguar.models[targetSlug].generations[gk] = gv;
      }
    }
    delete catalog.jaguar.models.jaguar;
    merged.push(`jaguar: "jaguar" -> xe / f-pace (by generation) | generations moved: ${names.join(', ') || '(none)'}`);
  }

  if (catalog.mg?.models?.mg) {
    const phantom = catalog.mg.models.mg;
    const routed: string[] = [];
    const unrouted: string[] = [];
    for (const [gk, gv] of Object.entries(phantom.generations)) {
      const label = gv.genName || gk;
      let targetSlug: string | null = null;
      if (/\bzs\b/i.test(label) || gk.includes('zs')) targetSlug = 'zs';
      else if (/\bhs\b/i.test(label) || gk.includes('hs')) targetSlug = 'hs';
      else {
        // Numbered MG models (MG3, MG5, MG6, ...) — read the actual number out of the
        // generation's own name instead of assuming it's always the 3, which is what
        // put an "Mg 6 Saloon" generation under "MG3" before this check existed.
        const numMatch = label.match(/\bmg\s*(\d)\b/i) || label.match(/\b(\d)\b/);
        targetSlug = numMatch ? `mg${numMatch[1]}` : null;
      }

      if (!targetSlug) {
        unrouted.push(label);
        continue;
      }
      if (!catalog.mg.models[targetSlug]) {
        catalog.mg.models[targetSlug] = { modelName: targetSlug.toUpperCase(), modelSlug: targetSlug, category: 'automobile', generations: {} };
      }
      catalog.mg.models[targetSlug].generations[gk] = gv;
      routed.push(`${label} -> ${targetSlug.toUpperCase()}`);
    }
    if (unrouted.length === 0) {
      delete catalog.mg.models.mg;
    } else {
      // Leave the unroutable generations behind in the phantom bucket rather than
      // guessing — surfaced below for manual review.
      for (const [gk, gv] of Object.entries(phantom.generations)) {
        if (!unrouted.includes(gv.genName || gk)) delete phantom.generations[gk];
      }
    }
    merged.push(`mg: "mg" -> ${routed.join(', ') || '(none)'}`);
    if (unrouted.length > 0) {
      review.push(`mg: "mg" left with ${unrouted.length} generation(s) that couldn't be identified: ${unrouted.join(', ')} — route these by hand`);
    }
  }

  if (catalog.mini?.models?.mini) {
    const phantom = catalog.mini.models.mini;
    const names = genNames(phantom);
    if (!catalog.mini.models.cooper) {
      catalog.mini.models.cooper = { modelName: 'Mini Hatch / Cooper', modelSlug: 'cooper', category: 'automobile', generations: {} };
    }
    for (const [gk, gv] of Object.entries(phantom.generations)) {
      if (gk.includes('countryman')) {
        if (!catalog.mini.models.countryman) catalog.mini.models.countryman = { modelName: 'Countryman', modelSlug: 'countryman', category: 'automobile', generations: {} };
        catalog.mini.models.countryman.generations[gk] = gv;
      } else if (gk.includes('clubman')) {
        if (!catalog.mini.models.clubman) catalog.mini.models.clubman = { modelName: 'Clubman', modelSlug: 'clubman', category: 'automobile', generations: {} };
        catalog.mini.models.clubman.generations[gk] = gv;
      } else {
        catalog.mini.models.cooper.generations[gk] = gv;
      }
    }
    delete catalog.mini.models.mini;
    merged.push(`mini: "mini" -> cooper / countryman / clubman (by generation) | generations moved: ${names.join(', ') || '(none)'}`);
  }

  if (catalog.smart?.models?.smart) {
    const phantom = catalog.smart.models.smart;
    const names = genNames(phantom);
    for (const [gk, gv] of Object.entries(phantom.generations)) {
      const targetSlug = gk.includes('four') ? 'forfour' : 'fortwo';
      if (catalog.smart.models[targetSlug]) {
        catalog.smart.models[targetSlug].generations[gk] = gv;
      }
    }
    delete catalog.smart.models.smart;
    merged.push(`smart: "smart" -> fortwo / forfour (by generation) | generations moved: ${names.join(', ') || '(none)'}`);
  }

  return { renamed, merged, dropped, review };
}

function countModelsAndEngines(catalog: CleanCatalog): { models: number; engines: number } {
  let models = 0;
  let engines = 0;
  for (const make of Object.values(catalog)) {
    for (const mod of Object.values(make.models)) {
      models++;
      for (const gen of Object.values(mod.generations)) {
        engines += gen.engines.length;
      }
    }
  }
  return { models, engines };
}

function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write the fix)'}`);

  const candidatePaths = [
    '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json',
    path.join(process.cwd(), 'oil-finder-full-dataset', 'clean-catalog-hierarchy.json'),
    path.join(__dirname, '..', 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
  ];
  const sourcePath = candidatePaths.find((p) => fs.existsSync(p));
  if (!sourcePath) {
    throw new Error(`Could not find clean-catalog-hierarchy.json in any of: ${candidatePaths.join(', ')}`);
  }
  console.log(`Reading: ${sourcePath}`);

  const catalog: CleanCatalog = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const before = countModelsAndEngines(catalog);

  const { renamed, merged, dropped, review } = cleanCatalog(catalog);
  const after = countModelsAndEngines(catalog);

  console.log(`\nRenamed/merged bare fragments (${renamed.length}):`);
  renamed.forEach((l) => console.log('  ' + l));
  console.log(`\nMake-name-as-model merges (${merged.length}):`);
  merged.forEach((l) => console.log('  ' + l));
  console.log(`\nDropped phantom entries with no recoverable data (${dropped.length}):`);
  dropped.forEach((l) => console.log('  ' + l));
  console.log(`\nNEEDS MANUAL REVIEW — not touched, ambiguous target (${review.length}):`);
  review.forEach((l) => console.log('  ' + l));

  console.log(`\nModels before: ${before.models} -> after: ${after.models}`);
  console.log(`Engines before: ${before.engines} -> after: ${after.engines}`);
  if (after.engines !== before.engines) {
    console.log(`  (engine count changed only from de-duplicating engines that existed under two names for the same model)`);
  }

  if (!APPLY) {
    console.log('\nDry run only — nothing written. Re-run with --apply to write the fix.');
    return;
  }

  const saveTargets = [
    '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json',
    path.join(process.cwd(), 'oil-finder-full-dataset', 'clean-catalog-hierarchy.json'),
    path.join(__dirname, '..', 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
  ];
  let saved = 0;
  const json = JSON.stringify(catalog, null, 2);
  for (const target of saveTargets) {
    try {
      if (fs.existsSync(path.dirname(target))) {
        fs.writeFileSync(target, json, 'utf8');
        saved++;
        console.log(`Wrote: ${target}`);
      }
    } catch (e: any) {
      console.warn(`Could not write ${target}: ${e?.message}`);
    }
  }
  console.log(`\nSaved to ${saved} location(s). Restart the backend to clear its in-memory cache:`);
  console.log('  docker compose restart backend');
}

main();
