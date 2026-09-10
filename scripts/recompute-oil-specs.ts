/**
 * Recompute every engine's oilSpec in the clean catalog using the CURRENT
 * deriveOilSpecification logic, and diff against what's actually stored.
 *
 * Why this is needed: the harvester's own "backfill" step (5b) only fills in
 * oilSpec when it's null — it never re-checks an engine that already has a
 * value, even after the derivation rules themselves get corrected. So any
 * engine whose spec was computed by an older, since-fixed version of the
 * logic keeps the old, wrong answer forever (confirmed live: a 1977 BMW
 * M30B34 was stored with "BMW Longlife-01 (LL-01)" — a spec that isn't even
 * producible by the current code and that predates BMW's Longlife branding
 * by ~20 years). This walks every engine, recomputes, and reports/repairs.
 *
 * Pure-EV engines are skipped entirely (fuelType 'electrique') — they
 * correctly carry no oilSpec, same rule the harvester itself uses.
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/recompute-oil-specs.ts            # dry-run report
 *   npx tsx scripts/recompute-oil-specs.ts --apply     # write the corrections
 */
import * as fs from 'fs';
import * as path from 'path';
import { deriveOilSpecification } from './tecdoc-catalog-harvester';

const APPLY = process.argv.includes('--apply');

interface Engine {
  engineCode: string;
  fuelType: string;
  displacementCc: number | null;
  powerHp: number | null;
  yearFrom: number | null;
  oilSpec: any;
}

function specEqual(a: any, b: any): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

// GM/Opel/Vauxhall's own "DT" diesel-turbo engine-code family (Z13DTH, Z19DT, A17DTC,
// B16DTU, ...) isn't caught by the original free-text fuel detection, which only
// scanned car_desc — their description text doesn't spell out "diesel". Fixed at the
// source in tecdoc-catalog-harvester.ts for future harvests; this repairs engines that
// already exist in the catalog with the wrong fuelType baked in (confirmed live: Opel
// Astra H "Z 13 DTH" stored as fuelType "essence", which then derived a gasoline spec,
// GM dexos1, for what is unambiguously a diesel engine). Verified against the whole
// catalog: every engine with a standalone "DT" or "DT"+one-letter code token was
// diesel, zero exceptions, across Opel/Vauxhall/Saab/Chevrolet/Cadillac/Bedford.
const DIESEL_CODE_PATTERN = /\b(TDI|HDI|DCI|CDI|CRDI|D-4D|CDTI|JTD|DDIS|DTEC|BLUEHDI|DT[A-Z]?)\b/i;

function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write the corrections)'}`);

  const candidatePaths = [
    '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json',
    path.join(process.cwd(), 'oil-finder-full-dataset', 'clean-catalog-hierarchy.json'),
    path.join(__dirname, '..', 'backend', 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
  ];
  const sourcePath = candidatePaths.find((p) => fs.existsSync(p));
  if (!sourcePath) {
    throw new Error(`Could not find clean-catalog-hierarchy.json in any of: ${candidatePaths.join(', ')}`);
  }
  console.log(`Reading: ${sourcePath}`);

  const catalog = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  let totalEngines = 0;
  let skippedElectric = 0;
  let unchanged = 0;
  let fuelTypeFixed = 0;
  const fuelTypeFixes: { make: string; model: string; gen: string; engineCode: string; from: string; to: string }[] = [];
  const changes: { make: string; model: string; gen: string; engineCode: string; year: number | null; before: any; after: any }[] = [];

  for (const [makeSlug, make] of Object.entries<any>(catalog)) {
    for (const [modelSlug, mod] of Object.entries<any>(make.models || {})) {
      for (const [genSlug, gen] of Object.entries<any>(mod.generations || {})) {
        for (const eng of gen.engines as Engine[]) {
          totalEngines++;

          if (eng.fuelType !== 'diesel' && eng.fuelType !== 'electrique' && DIESEL_CODE_PATTERN.test(eng.engineCode || '')) {
            fuelTypeFixes.push({ make: make.makeName, model: mod.modelName, gen: gen.genName, engineCode: eng.engineCode, from: eng.fuelType, to: 'diesel' });
            fuelTypeFixed++;
            if (APPLY) eng.fuelType = 'diesel';
          }

          if (!eng.fuelType || eng.fuelType === 'electrique') {
            skippedElectric++;
            continue;
          }
          const effectiveFuelType = APPLY ? eng.fuelType : (DIESEL_CODE_PATTERN.test(eng.engineCode || '') ? 'diesel' : eng.fuelType);
          const newSpec = deriveOilSpecification(makeSlug, effectiveFuelType, eng.yearFrom, eng.displacementCc, eng.powerHp, eng.engineCode);
          if (specEqual(eng.oilSpec, newSpec)) {
            unchanged++;
            continue;
          }
          changes.push({
            make: make.makeName,
            model: mod.modelName,
            gen: gen.genName,
            engineCode: eng.engineCode,
            year: eng.yearFrom,
            before: eng.oilSpec,
            after: newSpec,
          });
          if (APPLY) eng.oilSpec = newSpec;
        }
      }
    }
  }

  console.log(`\nTotal engines scanned: ${totalEngines}`);
  console.log(`Skipped (electric/no fuel type): ${skippedElectric}`);
  console.log(`fuelType corrected (diesel-coded engine mislabeled as non-diesel): ${fuelTypeFixed}`);
  fuelTypeFixes.slice(0, 20).forEach((f) => console.log(`    ${f.make} ${f.model} "${f.gen}" — ${f.engineCode}: "${f.from}" -> "${f.to}"`));
  if (fuelTypeFixes.length > 20) console.log(`    ... and ${fuelTypeFixes.length - 20} more`);
  console.log(`Unchanged (already correct): ${unchanged}`);
  console.log(`Changed: ${changes.length}\n`);

  // Group changes by (before -> after) viscosity/approval signature so a huge diff is
  // still scannable at a glance instead of a wall of thousands of near-identical lines.
  const grouped = new Map<string, typeof changes>();
  for (const c of changes) {
    const key = `${c.before?.viscosity || 'null'} / ${c.before?.oemApproval || '(none)'}  ->  ${c.after?.viscosity || 'null'} / ${c.after?.oemApproval || '(none)'}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  }
  const sortedGroups = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length);
  console.log(`--- Change patterns (${sortedGroups.length} distinct) ---`);
  for (const [key, items] of sortedGroups) {
    console.log(`\n${key}  (${items.length} engine(s))`);
    const sample = items.slice(0, 5);
    for (const c of sample) {
      console.log(`    ${c.make} ${c.model} "${c.gen}" — ${c.engineCode} (year ${c.year ?? '?'})`);
    }
    if (items.length > sample.length) console.log(`    ... and ${items.length - sample.length} more`);
  }

  if (!APPLY) {
    console.log('\nDry run only — nothing written. Re-run with --apply to write these corrections.');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dumpsDir = path.join(path.dirname(sourcePath), 'dumps');
  try {
    fs.mkdirSync(dumpsDir, { recursive: true });
    fs.writeFileSync(path.join(dumpsDir, `oil-spec-recompute-changes-${timestamp}.json`), JSON.stringify(changes, null, 2));
    console.log(`\nChange log saved to: ${path.join(dumpsDir, `oil-spec-recompute-changes-${timestamp}.json`)}`);
  } catch (e: any) {
    console.warn(`Could not save change log: ${e?.message}`);
  }

  const saveTargets = [
    '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json',
    path.join(process.cwd(), 'oil-finder-full-dataset', 'clean-catalog-hierarchy.json'),
    path.join(__dirname, '..', 'backend', 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
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
