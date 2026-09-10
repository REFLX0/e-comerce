/**
 * Oil Finder data audit — re-runnable safety net.
 *
 * Checks the rule engine and the live catalog against hard automotive invariants:
 * things that can never be a correct recommendation regardless of brand. Run it after
 * any harvest, or any change to deriveOilSpecification, to catch regressions.
 *
 *   npx tsx scripts/audit-oil-finder.ts
 *
 * Exits non-zero if anything fails, so it can be wired into CI.
 *
 * What it checks:
 *   1. SYNTHETIC PROBES — every (make x year x displacement x power x fuel) combination,
 *      to catch latent branch-ordering bugs even when no current row happens to hit them.
 *      This is how the PSA/Opel "2018+ diesel gets the 0W-20 petrol spec" bug was found.
 *   2. LIVE SPEC INVARIANTS — no petrol-only approval on a diesel (and vice versa), no
 *      High-SAPS oil on a post-2011 DPF diesel, no malformed viscosity.
 *   3. FUEL TYPE vs ENGINE CODE — deterministic manufacturer conventions (Mercedes "OM",
 *      BMW's B/D letter, PSA DV/DW, GM's "DT" family) must agree with the stored fuelType.
 *   4. ANACHRONISMS — an approval or ACEA class attached to a car built before it existed.
 *   5. STRUCTURAL — impossible/inverted years, EVs carrying an oil spec, combustion
 *      engines missing one, empty generations.
 *
 * Deliberately NOT flagged: modern API service grades (SL/SN/SP) on older cars. Those
 * categories are backward-compatible and are what's actually purchasable today, so
 * recommending them for a classic is correct advice, not an error.
 */
import * as fs from 'fs';
import * as path from 'path';
import { deriveOilSpecification, isDieselEngine } from './tecdoc-catalog-harvester';

type Spec = ReturnType<typeof deriveOilSpecification>;

const PETROL_ONLY = [
  { re: /\bdexos\s*1\b/i, why: 'dexos1 is GM petrol; diesel is dexos2' },
  { re: /\bILSAC\b|\bGF-\d/i, why: 'ILSAC is a petrol-only standard' },
  { re: /MS-6395/i, why: 'Chrysler/FCA petrol spec' },
  { re: /\bPorsche A40\b/i, why: 'Porsche petrol spec' },
  { re: /B71 2010/i, why: 'PSA 0W-20 PureTech petrol spec; diesel is B71 2312/2290' },
];
const DIESEL_ONLY = [
  { re: /\bdexos\s*2\b/i, why: 'dexos2 is the diesel/mixed-fleet spec' },
  { re: /JASO\s*D[HL]-?\d/i, why: 'JASO DH/DL are heavy-duty diesel standards' },
];

const APPROVAL_INTRODUCED: { re: RegExp; year: number; name: string }[] = [
  { re: /LL-98/i, year: 1998, name: 'BMW LL-98' },
  { re: /LL-01/i, year: 2001, name: 'BMW LL-01' },
  { re: /LL-04/i, year: 2004, name: 'BMW LL-04' },
  { re: /LL-12/i, year: 2012, name: 'BMW LL-12' },
  { re: /LL-17/i, year: 2017, name: 'BMW LL-17 FE+' },
  { re: /MB 229\.5\b/i, year: 2002, name: 'MB 229.5' },
  { re: /MB 229\.51\b/i, year: 2004, name: 'MB 229.51' },
  { re: /MB 229\.52\b/i, year: 2014, name: 'MB 229.52' },
  { re: /VW 50[12]\.0/i, year: 1997, name: 'VW 501/502' },
  { re: /VW 504\.00|507\.00/i, year: 2006, name: 'VW 504/507' },
  { re: /VW 508\.00|509\.00/i, year: 2018, name: 'VW 508/509' },
  { re: /B71 2290/i, year: 2008, name: 'PSA B71 2290' },
  { re: /B71 2312/i, year: 2013, name: 'PSA B71 2312' },
  { re: /B71 2010/i, year: 2018, name: 'PSA B71 2010' },
  { re: /dexos\s*1/i, year: 2011, name: 'GM dexos1' },
  { re: /dexos\s*2/i, year: 2010, name: 'GM dexos2' },
  { re: /WSS-M2C913/i, year: 2002, name: 'Ford WSS-M2C913' },
  { re: /WSS-M2C948/i, year: 2012, name: 'Ford WSS-M2C948-B' },
  { re: /WSS-M2C950/i, year: 2014, name: 'Ford WSS-M2C950-A' },
  { re: /RN0700|RN0710/i, year: 2007, name: 'Renault RN0700/0710' },
  { re: /RN0720/i, year: 2010, name: 'Renault RN0720' },
  { re: /\bRN17\b/i, year: 2017, name: 'Renault RN17' },
  { re: /9\.55535/i, year: 2003, name: 'Fiat 9.55535-xx' },
  { re: /Porsche A40/i, year: 1997, name: 'Porsche A40' },
  { re: /Porsche C[234]0/i, year: 2016, name: 'Porsche C20/C30/C40' },
];

interface Finding { rule: string; detail: string }

function checkSpec(isDiesel: boolean, year: number, spec: Spec, ctx: string): Finding[] {
  const out: Finding[] = [];
  if (!spec) return out;
  const approval = spec.oemApproval || '';
  const acea = (spec.aceaStandard || '').toUpperCase();
  const visc = spec.viscosity || '';
  const shown = `${ctx} -> "${visc} / ${approval || '(none)'}"`;

  for (const p of isDiesel ? PETROL_ONLY : DIESEL_ONLY) {
    if (p.re.test(approval)) {
      out.push({ rule: isDiesel ? 'PETROL_SPEC_ON_DIESEL' : 'DIESEL_SPEC_ON_PETROL', detail: `${shown} — ${p.why}` });
    }
  }
  if (isDiesel && year >= 2011 && !/\bC[1-6]\b/.test(acea)) {
    out.push({ rule: 'HIGH_SAPS_ON_DPF_DIESEL', detail: `${shown} ACEA=${acea || '(none)'}` });
  }
  if (year < 2004 && (/\bC[1-6]\b/.test(acea) || /\bA5\/B5\b/.test(acea))) {
    out.push({ rule: 'LOW_SAPS_ON_PRE_2004', detail: `${shown} ACEA=${acea}` });
  }
  for (const a of APPROVAL_INTRODUCED) {
    if (a.re.test(approval) && year + 2 < a.year) {
      out.push({ rule: `ANACHRONISTIC_APPROVAL:${a.name}`, detail: `${shown} — ${a.name} did not exist until ${a.year}` });
    }
  }
  if (!/^\d+W-\d+$/.test(visc)) out.push({ rule: 'MALFORMED_VISCOSITY', detail: shown });
  return out;
}

const MAKES = [
  'bmw', 'mini', 'alpina', 'mercedes-benz', 'smart', 'volkswagen', 'audi', 'seat', 'skoda', 'cupra',
  'opel', 'vauxhall', 'peugeot', 'citroen', 'ds', 'renault', 'dacia', 'nissan', 'infiniti', 'ford',
  'ford-usa', 'toyota', 'lexus', 'hyundai', 'kia', 'mazda', 'honda', 'volvo', 'fiat', 'alfa-romeo',
  'lancia', 'jeep', 'chrysler', 'dodge', 'chevrolet', 'saab', 'porsche', 'jaguar', 'land-rover',
  'mitsubishi', 'subaru', 'suzuki', 'isuzu', 'ssangyong', 'mg', 'rover', 'bentley', 'maserati',
  'ferrari', 'lamborghini', 'lada', 'daewoo', 'proton', 'genesis', 'byd', 'chery', 'geely', 'bedford',
];
const YEARS = [1965, 1975, 1985, 1995, 2000, 2005, 2008, 2011, 2014, 2016, 2018, 2020, 2023];
const DISPLACEMENTS = [998, 1400, 1600, 2000, 2500, 3000, 4000];
const POWERS = [60, 110, 150, 200, 300];

function findCatalog(): string | null {
  const candidates = [
    '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json',
    path.join(process.cwd(), 'oil-finder-full-dataset', 'clean-catalog-hierarchy.json'),
    path.join(process.cwd(), 'src', 'oil-finder', 'clean-catalog-hierarchy.json'),
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function report(title: string, findings: Finding[]): number {
  console.log(`\n=== ${title}: ${findings.length} ===`);
  const byRule = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!byRule.has(f.rule)) byRule.set(f.rule, []);
    byRule.get(f.rule)!.push(f);
  }
  for (const [rule, list] of [...byRule.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${rule}: ${list.length}`);
    list.slice(0, 5).forEach((l) => console.log(`      ${l.detail}`));
    if (list.length > 5) console.log(`      ... and ${list.length - 5} more`);
  }
  return findings.length;
}

function main() {
  let failures = 0;

  // 1. Synthetic probe matrix
  const synthetic: Finding[] = [];
  let probes = 0;
  for (const make of MAKES) {
    for (const year of YEARS) {
      for (const cc of DISPLACEMENTS) {
        for (const hp of POWERS) {
          for (const fuel of ['diesel', 'essence']) {
            probes++;
            const spec = deriveOilSpecification(make, fuel, year, cc, hp, undefined);
            synthetic.push(...checkSpec(fuel === 'diesel', year, spec, `${make} ${fuel} ${year} ${cc}cc ${hp}hp`));
          }
        }
      }
    }
  }
  console.log(`Synthetic probes: ${probes}`);
  failures += report('RULE ENGINE (synthetic)', synthetic);

  // 2-5. Live catalog
  const catalogPath = findCatalog();
  if (!catalogPath) {
    console.log('\nNo catalog file found — skipping live-data checks.');
    process.exit(failures > 0 ? 1 : 0);
  }
  console.log(`\nLive catalog: ${catalogPath}`);
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  const liveSpec: Finding[] = [];
  const fuelConflicts: Finding[] = [];
  const structural: Finding[] = [];
  let engines = 0;

  for (const [makeSlug, make] of Object.entries<any>(catalog)) {
    for (const mod of Object.values<any>(make.models || {})) {
      for (const gen of Object.values<any>(mod.generations || {})) {
        const gy = gen.yearFrom;
        const gt = gen.yearTo;
        const gctx = `${make.makeName} ${mod.modelName} "${gen.genName}"`;
        if (gy && (gy < 1900 || gy > 2035)) structural.push({ rule: 'IMPOSSIBLE_GEN_YEAR', detail: `${gctx} yearFrom=${gy}` });
        if (gy && gt && gt !== 9999 && gt < gy) structural.push({ rule: 'INVERTED_GEN_YEARS', detail: `${gctx} ${gy}->${gt}` });
        if (!gen.engines || gen.engines.length === 0) structural.push({ rule: 'EMPTY_GENERATION', detail: gctx });

        for (const eng of gen.engines || []) {
          engines++;
          const code = (eng.engineCode || '').trim();
          const fuel = (eng.fuelType || '').toLowerCase();
          const ctx = `${gctx} — ${code} (${eng.yearFrom ?? '?'})`;

          if (eng.yearFrom && (eng.yearFrom < 1900 || eng.yearFrom > 2035)) structural.push({ rule: 'IMPOSSIBLE_ENGINE_YEAR', detail: ctx });
          if (fuel === 'electrique' && eng.oilSpec) structural.push({ rule: 'EV_WITH_OIL_SPEC', detail: ctx });
          if (fuel && fuel !== 'electrique' && !eng.oilSpec) structural.push({ rule: 'COMBUSTION_WITHOUT_SPEC', detail: ctx });

          if (eng.oilSpec) liveSpec.push(...checkSpec(fuel === 'diesel', eng.yearFrom || 2015, eng.oilSpec, ctx));

          if (fuel !== 'diesel' && fuel !== 'electrique' && isDieselEngine(makeSlug, '', code)) {
            fuelConflicts.push({ rule: 'DIESEL_CODE_NOT_DIESEL', detail: `${ctx} fuelType="${fuel}"` });
          }
        }
      }
    }
  }

  console.log(`Engines scanned: ${engines}`);
  failures += report('LIVE SPEC INVARIANTS', liveSpec);
  failures += report('FUEL TYPE vs ENGINE CODE', fuelConflicts);
  failures += report('STRUCTURAL', structural);

  console.log(`\n${failures === 0 ? 'PASS — no violations found.' : `FAIL — ${failures} violation(s).`}`);
  process.exit(failures > 0 ? 1 : 0);
}

main();
