/**
 * Settles fuel type from TecDoc instead of from the engine code's spelling.
 *
 * Every fuel-type fix so far has read the engine code and guessed: a name
 * containing TDI or HDi is a diesel, a Sofim 8140 is a diesel, and so on. That
 * works until it doesn't — Ford's Transit codes are bare strings like "4AB" and
 * "NAT", and they are not all the same fuel. Guessing from the code shape gets
 * "170 D" wrong (it is a 2.0 petrol despite the D) and "CY" wrong in the other
 * direction (a 1.6 TD despite looking like nothing).
 *
 * The catalogue was harvested from TecDoc, and TecDoc's own vehicle
 * descriptions are still in this database, in tecdoc.passengercars: "2.5 DI",
 * "1.9 D", "130 Multijet 2,3 D", "1.6 i". Joining those to tecdoc.engines gives
 * the fuel for an engine code from the source the data came from, which is
 * evidence rather than recall.
 *
 * A code alone is not enough — TecDoc lists "1Y" against both a 1.9 D and a
 * 1.6 petrol — so the verdict is keyed on code AND displacement, read out of
 * the litre figure in the description itself. Where a pair is described both
 * ways, nothing is written and the pair is reported.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const VERBOSE = process.argv.includes('--list');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/fuel-from-tecdoc-snapshot-${Date.now()}.json`;

/**
 * Diesel markers as they appear in a TecDoc sales description. "D" and "DI"
 * have to be whole words — "1.9 D" is a diesel, "1.9 DOHC" is not — and the
 * list is of marketing suffixes, so TDI, HDi, JTD, dCi and the rest all sit
 * here rather than being inferred from the engine code.
 */
const DIESEL = /(^|[\s(,/-])(D|DI|TD|TDI|TDCI|TDDI|SDI|HDI|BLUEHDI|JTD|JTDM|MJET|MJT|MULTIJET|CDTI|CTDI|CDI|BLUETEC|CRDI|CRD|DCI|DDIS|DT|DTI|DTEC|GTD|D4D|DID|TDS|IDI|XDI|TID|TTID|DURATORQ|DIESEL)([\s),/-]|$)/i;
const ELECTRIC = /(^|[\s(,/-])(ELECTRIC|ELEKTRO|EV|E-TRON|BEV|Z\.?E\.?)([\s),/-]|$)/i;

/**
 * Gas variants. The Ducato and the Daily are sold as "Natural Power", which is
 * compressed natural gas, and the same engine code covers the diesel and the
 * gas version. Neither "essence" nor "diesel" is right for these, so they are
 * counted separately and nothing is written for a code TecDoc describes this
 * way — a family rule that called F1CE0441A a diesel was already wrong.
 */
const GAS = /(NATURAL POWER|BIFUEL|BI-FUEL|CNG|LPG|GPL|METHANE|ECOFUEL|BLUEGAS|TGI)/i;

/**
 * Petrol markers. Needed because the absence of a diesel marker proves nothing:
 * TecDoc describes plenty of diesels as just "1.9", and reading that silence as
 * petrol would send an Isuzu RZ4E-TC — the D-Max 1.9 Ddi — to petrol oil. Only
 * a description that says something positive about either fuel is counted; the
 * rest are left unknown and nothing is written for them.
 */
const PETROL = /(^|[\s(,/-])(I|16V|8V|12V|20V|24V|32V|V6|V8|V10|V12|TSI|TFSI|FSI|GTI|GTE|VTEC|ECOBOOST|T-GDI|GDI|MPI|VVT|VVTI|DUALJET|KAT|TURBO|BITURBO|KOMPRESSOR|COMPRESSOR)([\s),/-]|$)/i;

/** The litre figure a TecDoc description opens with: "130 Multijet 2,3 D" -> 2300. */
function ccFromDescription(text) {
  const m = /(?:^|[\s(])(\d)[.,](\d)(?![\d])/.exec(String(text || ''));
  if (!m) return null;
  return Math.round(Number(`${m[1]}.${m[2]}`) * 1000);
}

/** Displacements within 100 cc are the same engine rounded differently. */
const ccMatches = (a, b) => a != null && b != null && Math.abs(a - b) <= 100;

const base = (c) => String(c || '').trim().toUpperCase().replace(/\s*\([^)]*\)\s*$/, '').trim();

async function main() {
  const prisma = new PrismaClient();

  // ── 1. the verdict table, straight out of TecDoc ──
  const rows = await prisma.$queryRawUnsafe(`
    SELECT trim(e.description) AS code, pc.description AS descr
    FROM tecdoc.engines e
    JOIN tecdoc.passengercars_link_engines l ON l.engine_id = e.id
    JOIN tecdoc.passengercars pc ON pc.id = l.car_id
    WHERE e.description IS NOT NULL AND trim(e.description) <> ''
  `);

  // code -> [{ cc, fuel }]
  const seen = new Map();
  for (const r of rows) {
    const code = base(r.code);
    // Diesel is tested before petrol so "1.9 JTD 16V" reads as a diesel.
    const fuel = ELECTRIC.test(r.descr) ? 'electrique'
      : GAS.test(r.descr) ? 'gaz'
        : DIESEL.test(r.descr) ? 'diesel'
          : PETROL.test(r.descr) ? 'essence' : null;
    if (!fuel) continue;
    const cc = ccFromDescription(r.descr);
    if (!seen.has(code)) seen.set(code, new Map());
    const m = seen.get(code);
    const k = `${cc ?? 'x'}|${fuel}`;
    m.set(k, (m.get(k) || 0) + 1);
  }

  const conflicts = [];
  /** The fuel TecDoc gives for this code at this displacement, or undefined. */
  const verdict = (code, cc) => {
    // Without a displacement there is nothing to match on, and a bare code is
    // shared across fuels often enough that the vote would be meaningless:
    // TecDoc files "1Y" against both a 1.9 D and a 1.6 petrol.
    if (cc == null) return undefined;
    const m = seen.get(base(code));
    if (!m) return undefined;
    const votes = new Map();
    for (const [k, n] of m) {
      const [ccStr, fuel] = k.split('|');
      if (ccStr === 'x') continue;
      if (!ccMatches(cc, Number(ccStr))) continue;
      votes.set(fuel, (votes.get(fuel) || 0) + n);
    }
    if (!votes.size) return undefined;
    if (votes.size > 1) {
      conflicts.push(`${base(code)} @${cc}: ${[...votes].map(([f, n]) => `${f}:${n}`).join(' ')}`);
      return undefined;
    }
    const only = [...votes.keys()][0];
    // Gas variants are recorded but never written: the field has no value for
    // them and overwriting would claim something false. Electric is not written
    // either — "e-tron" in a description is as likely to mean a plug-in hybrid,
    // which still takes engine oil, and a car wrongly marked electric is shown
    // no oil at all. The electric list stays hand-maintained.
    return (only === 'gaz' || only === 'electrique') ? undefined : only;
  };

  console.log(`TecDoc: ${rows.length} liaisons moteur-vehicule, ${seen.size} codes distincts`);

  // ── 2. compare ──
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { catalog: [], oilFinderVehicles: [], vehicleEngines: [] };
  const byChange = new Map();
  const examples = new Map();
  let unknown = 0;

  const record = (from, to, make, code, cc) => {
    const k = `${from} -> ${to}`;
    byChange.set(k, (byChange.get(k) || 0) + 1);
    if (!examples.has(k)) examples.set(k, []);
    const list = examples.get(k);
    if (list.length < 25) list.push(`${make}:${base(code)}@${cc ?? '?'}`);
  };

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          const want = verdict(e.engineCode, e.displacementCc);
          if (!want) { unknown++; continue; }
          if (want === e.fuelType) continue;
          // "electrique" is only ever set by hand, against models verified to
          // have no engine at all. Nothing derived overrides it.
          if (e.fuelType === 'electrique') continue;
          record(e.fuelType || '(vide)', want, mk.makeName, e.engineCode, e.displacementCc);
          snapshot.catalog.push({
            make: mk.makeName, model: md.modelName, generation: gen.genName,
            engineCode: e.engineCode, was: e.fuelType,
          });
          if (APPLY) e.fuelType = want;
        }
      }
    }
  }

  const ofvRows = (await prisma.oilFinderVehicle.findMany())
    .map((r) => ({ r, want: verdict(r.engineCode, r.displacementCc) }))
    .filter(({ r, want }) => want && want !== r.fuelType && r.fuelType !== 'electrique');
  const veRows = (await prisma.vehicleEngine.findMany())
    .map((r) => ({ r, want: verdict(r.engineCode, r.displacementCc) }))
    .filter(({ r, want }) => want && want !== r.fuelType && r.fuelType !== 'electrique');

  console.log('\nchangement                 catalogue');
  for (const [k, n] of [...byChange].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(24)} ${String(n).padStart(6)}`);
    if (VERBOSE) console.log(`      ${examples.get(k).join(', ')}`);
  }
  console.log(`\ncatalogue: ${snapshot.catalog.length} moteurs a corriger, ${unknown} inconnus de TecDoc (laisses tels quels)`);
  console.log(`base: ${ofvRows.length} OilFinderVehicle, ${veRows.length} VehicleEngine`);
  if (conflicts.length) {
    console.log(`\n${conflicts.length} couples code+cylindree decrits dans les deux sens par TecDoc, non touches`);
    if (VERBOSE) console.log('  ' + [...new Set(conflicts)].slice(0, 40).join('\n  '));
  }

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  for (const { r, want } of ofvRows) {
    snapshot.oilFinderVehicles.push({ id: r.id, make: r.make, model: r.model, engineCode: r.engineCode, was: r.fuelType });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { fuelType: want } });
  }
  for (const { r, want } of veRows) {
    snapshot.vehicleEngines.push({ id: r.id, engineCode: r.engineCode, was: r.fuelType });
    await prisma.vehicleEngine.update({ where: { id: r.id }, data: { fuelType: want } });
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
