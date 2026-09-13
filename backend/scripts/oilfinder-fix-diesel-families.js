/**
 * Corrects whole engine families recorded as petrol.
 *
 * oilfinder-fix-fuel-types.js recovers the fuel from manufacturer nomenclature
 * — a name containing TDI, HDi, JTD or -FTV can only be a diesel. That misses
 * every family whose codes carry no such marker: Iveco-Fiat's Sofim 8140 and
 * 8144, Iveco's F1A and F1C MultiJet, and PSA's XUD, DW and DV families, whose
 * codes are bare strings like "8140.43S", "F1AE0481N", "DJY" and "4HV". 291
 * engines across those five families sit in the catalogue marked "essence".
 *
 * None of these families ever made a petrol version. The evidence is in the
 * catalogue itself: the same codes appear on Iveco and Peugeot rows correctly
 * marked diesel, because the Ducato, the Boxer, the Jumper and the Daily are
 * the same Sevel van carrying the same engine.
 *
 * The label is the smaller half of the damage. Each spec was generated from the
 * fuel type, so a diesel marked petrol was given a petrol oil — and the later
 * per-engine correction passes, trusting the same field, made it worse rather
 * than better: the Ducato's 2.3 MultiJet now carries Fiat 9.55535-S2, which is
 * the petrol specification. So where a correctly-marked sibling of the same
 * engine exists, its spec is adopted too.
 *
 * Writes all three stores, since the dropdowns read the catalogue file first:
 *   1. engines[].fuelType + engines[].oilSpec in clean-catalog-hierarchy.json
 *   2. OilFinderVehicle.fuelType + oilSpecId
 *   3. VehicleEngine.fuelType + oilSpecId
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/diesel-families-snapshot-${Date.now()}.json`;

/**
 * Engine families that only ever made diesels. Each is a manufacturer family,
 * not a guess from the shape of the string: PSA's XU is the petrol family and
 * XUD the diesel one, and the codes below are the diesel family's build codes.
 */
const DIESEL_FAMILIES = [
  { name: 'Sofim 8140 / 8144 (Iveco-Fiat)', re: /^81(40|44)\./i },
  { name: 'Iveco F1A / F1C MultiJet', re: /^F1[AC][A-Z]{0,3}\d/i },
  { name: 'PSA XUD (D8x, D9x, DHx, DJx)', re: /^(D8[A-Z]|D9[A-Z]|DH[A-Z]|DJ[A-Z])$/i },
  { name: 'PSA DW10 / DW12 HDi (RHx, 4Hx)', re: /^(RH[A-Z]|4H[A-Z])$/i },
  { name: 'PSA DV4 / DV6 HDi (8Hx, 9Hx)', re: /^(8H[A-Z]|9H[A-Z])$/i },
];

/**
 * Single engines the catalogue contradicts itself about: the same code appears
 * with both fuel types, so one of the two rows is wrong and a family rule
 * cannot settle which. Each is named with its make, because a bare code is not
 * unique across manufacturers - VW's AHW is a 1.4 petrol while PSA's is a
 * diesel, and Toyota's 2L is a diesel while VW's 2L is not the same engine at
 * all. Only codes whose identity is unambiguous are listed; the rest are
 * reported and left for a human.
 */
const EXPLICIT = [
  // VW EA288 2.0 TDI, and the 1.6 D of the Passat B2.
  { make: 'VW', codes: ['CUNA', 'DGCA', 'DT'], fuelType: 'diesel' },
  // Ford: the 2.5 DI and Duratorq Transit units, the 2.0 TDCi, and the
  // Mazda-built WL 2.5 TD of the Ranger.
  { make: 'FORD', codes: ['4EB', '4EC', 'P7PA', 'P7PB', 'R2PA', 'FMBA', 'RTJ', 'RTK', 'WL'], fuelType: 'diesel' },
  { make: 'MAZDA', codes: ['WL', 'RTJ', 'RTK'], fuelType: 'diesel' },
  // Volvo names diesels D and petrols B, so the prefix settles both directions.
  { make: 'VOLVO', codes: ['D 24', 'D 4204 T', 'D 5244 T9', 'D 5244 T17'], fuelType: 'diesel' },
  { make: 'VOLVO', codes: ['B 4164 T', 'B 4164 T3'], fuelType: 'essence' },
  { make: 'NISSAN', codes: ['BD-30TI'], fuelType: 'diesel' },
  // GM's 2.0 VCDi and the Captiva diesel.
  { make: 'CHEVROLET', codes: ['Z 20 D1', 'Z 20 DMH', 'LNP'], fuelType: 'diesel' },
  { make: 'ISUZU', codes: ['4JA1', 'C223'], fuelType: 'diesel' },
  { make: 'OPEL', codes: ['4JA1', 'C223'], fuelType: 'diesel' },
  // Toyota's own diesel codes, scoped to Toyota: VW uses some of the same
  // two-character strings for something else entirely.
  { make: 'TOYOTA', codes: ['1C', '2L', '2H', '3B'], fuelType: 'diesel' },
  // PSA's XUD11 2.1 TD.
  { make: 'CITROËN', codes: ['THY'], fuelType: 'diesel' },
  { make: 'PEUGEOT', codes: ['THY'], fuelType: 'diesel' },
  // Renault-Nissan's 3.0 V6 dCi, sold as a diesel under every badge that got it.
  { make: 'INFINITI', codes: ['V9X'], fuelType: 'diesel' },
  { make: 'RENAULT', codes: ['V9X'], fuelType: 'diesel' },
  // The X-Type's 2.0 TDCi, the Jeep 2.8 CRD, the Mazda WL turbo, and GM's
  // 2.0 VCDi under its second badge.
  { make: 'JAGUAR', codes: ['FMBA'], fuelType: 'diesel' },
  { make: 'JEEP', codes: ['ENC'], fuelType: 'diesel' },
  { make: 'FORD', codes: ['WL-T'], fuelType: 'diesel' },
  { make: 'OPEL', codes: ['Z 20 DMH'], fuelType: 'diesel' },
  // Fiat's 1.9 turbodiesel of the 1980s, sold as the Regata 80 Turbo DS and the
  // Lancia Delta and Prisma 1.9 Turbo DS. Parts listings for both marques give
  // it as a diesel; the catalogue had it both ways.
  { make: 'FIAT', codes: ['831 D1.000'], fuelType: 'diesel' },
  { make: 'LANCIA', codes: ['831 D1.000'], fuelType: 'diesel' },
  // The battery-electric vans, which have no oil at all.
  { make: 'CITROËN', codes: ['Y4F1'], fuelType: 'electrique' },
  { make: 'RENAULT', codes: ['5AQ 604'], fuelType: 'electrique' },
];
const explicitFuel = (make, code) => {
  const m = String(make || '').toUpperCase();
  const c = base(code);
  const hit = EXPLICIT.find((e) => e.make === m && e.codes.some((x) => base(x) === c));
  return hit?.fuelType;
};

/** Makes that share these engines, so a code means the same engine across them. */
const PLATFORM = [
  ['FIAT', 'ALFA ROMEO', 'LANCIA', 'IVECO', 'ABARTH', 'UAZ', 'SANTANA'],
  ['CITROËN', 'CITROEN', 'PEUGEOT', 'DS', 'FORD', 'MAZDA', 'MITSUBISHI', 'SUZUKI', 'MINI', 'VOLVO'],
  ['RENAULT', 'RENAULT TRUCKS', 'DACIA', 'NISSAN'],
];
const platformOf = (make) => {
  const u = String(make || '').toUpperCase();
  const g = PLATFORM.find((p) => p.includes(u));
  return g ? g[0] : u;
};

const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Same normalisation the other oil-finder scripts use: "2ZR-FE (SC)" -> "2ZR-FE". */
const base = (c) => String(c || '').trim().toUpperCase().replace(/\s*\([^)]*\)\s*$/, '').trim();

const familyOf = (code) => DIESEL_FAMILIES.find((f) => f.re.test(base(code)));

/**
 * Approvals that only exist for a petrol engine. A row carrying one of these
 * was given it *because* the fuel type said petrol, so it is wrong by the same
 * mistake and has to go with it — Fiat's 9.55535-S2 is the petrol half of the
 * pair whose diesel half is S1. An approval that a diesel can legitimately hold
 * (BMW Longlife-04 on a Mini's PSA-built 9HZ, Ford WSS-M2C913-D on a Transit)
 * was not derived from the fuel type and is left alone: replacing it with a
 * sibling's would be trading one marque's own specification for another's.
 */
const PETROL_ONLY_APPROVAL = /9\.55535[\s-]?(S2|G\d|H\d|N\d)|ILSAC|GF-?[456]|RESOURCE.?CONSERV/i;
const specIsReplaceable = (s) => !s || !s.oemApproval || PETROL_ONLY_APPROVAL.test(s.oemApproval);

const SPEC_FIELDS = ['viscosity', 'apiStandard', 'aceaStandard', 'oemApproval',
  'jasoStandard', 'capacityLiters', 'changeIntervalKm'];
const pickSpec = (s) => {
  const out = {};
  for (const k of SPEC_FIELDS) out[k] = s?.[k] ?? null;
  return out;
};
const specKey = (s) => SPEC_FIELDS.map((k) => s?.[k] ?? '-').join('|');

const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`]
    .map(slugify).join('_');

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

  // ── 1. what the correctly-marked rows of each engine are running on ──
  // key: platform|baseCode -> Map(specKey -> { n, spec })
  const dieselSpecs = new Map();
  const note = (make, code, spec) => {
    // Recorded at three widths. A build code like RHZ or 8140.43S is a
    // manufacturer's own identifier and means one engine wherever it appears,
    // but a sibling inside the same marque is still the better witness.
    for (const k of [
      `${String(make || '').toUpperCase()}|${base(code)}`,
      `${platformOf(make)}|${base(code)}`,
      `*|${base(code)}`,
    ]) {
      if (!dieselSpecs.has(k)) dieselSpecs.set(k, new Map());
      const m = dieselSpecs.get(k);
      const sk = specKey(spec);
      if (!m.has(sk)) m.set(sk, { n: 0, spec: pickSpec(spec) });
      m.get(sk).n++;
    }
  };

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          if (e.fuelType === 'diesel' && familyOf(e.engineCode) && e.oilSpec) {
            note(mk.makeName, e.engineCode, e.oilSpec);
          }
        }
      }
    }
  }
  for (const r of await prisma.oilFinderVehicle.findMany({
    where: { fuelType: 'diesel' }, include: { oilSpec: true },
  })) {
    if (familyOf(r.engineCode) && r.oilSpec) note(r.make, r.engineCode, r.oilSpec);
  }

  /**
   * The reference spec for an engine: what its correctly-marked siblings run
   * on, preferring one that carries an OEM approval over a generated default,
   * and the most common among those. Returns undefined when no sibling exists,
   * and then only the label is corrected — inventing a spec for an engine
   * nothing in the data speaks for is how this mess started.
   */
  const referenceSpec = (make, code) => {
    for (const k of [
      `${String(make || '').toUpperCase()}|${base(code)}`,
      `${platformOf(make)}|${base(code)}`,
      `*|${base(code)}`,
    ]) {
      const m = dieselSpecs.get(k);
      if (!m) continue;
      const all = [...m.values()];
      const approved = all.filter((x) => x.spec.oemApproval);
      const pool = approved.length ? approved : all;
      return pool.sort((a, b) => b.n - a.n)[0].spec;
    }
    return undefined;
  };

  // ── 2. plan ──
  const stats = new Map();
  const bump = (fam, field) => {
    if (!stats.has(fam)) {
      stats.set(fam, { catalog: 0, ofv: 0, ve: 0, specFixed: 0, specKept: 0, labelOnly: 0, codes: new Set() });
    }
    stats.get(fam)[field]++;
  };
  const snapshot = { catalog: [], oilFinderVehicles: [], vehicleEngines: [] };
  const noSibling = new Map();
  /** make|code -> { from: Set(specKey), to: specKey|null }, printed by --plan. */
  const plan = new Map();

  // ── catalogue ──
  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          const want = explicitFuel(mk.makeName, e.engineCode);
          const fam = familyOf(e.engineCode) || (want ? { name: 'Codes isoles corriges un par un' } : undefined);
          const target = want || 'diesel';
          if (!fam || e.fuelType === target) continue;
          // A spec is only worth adopting from a diesel sibling when the row is
          // becoming a diesel; an engine corrected to petrol or to electric has
          // nothing to take from one.
          const ref = target === 'diesel' && specIsReplaceable(e.oilSpec)
            ? referenceSpec(mk.makeName, e.engineCode) : undefined;
          const kept = !specIsReplaceable(e.oilSpec);
          snapshot.catalog.push({
            make: mk.makeName, model: md.modelName, generation: gen.genName,
            engineCode: e.engineCode, was: { fuelType: e.fuelType, oilSpec: e.oilSpec },
          });
          bump(fam.name, 'catalog');
          stats.get(fam.name).codes.add(`${mk.makeName}:${base(e.engineCode)}`);
          const pk = `${mk.makeName}:${base(e.engineCode)}`;
          if (!plan.has(pk)) plan.set(pk, { from: new Set(), to: ref ? specKey(ref) : null });
          plan.get(pk).from.add(specKey(e.oilSpec));
          if (ref && specKey(ref) !== specKey(e.oilSpec)) {
            bump(fam.name, 'specFixed');
          } else if (!ref) {
            bump(fam.name, kept ? 'specKept' : 'labelOnly');
            if (!kept) {
              const k = `${mk.makeName}:${base(e.engineCode)}`;
              noSibling.set(k, (noSibling.get(k) || 0) + 1);
            }
          }
          if (APPLY) {
            e.fuelType = target;
            if (ref) e.oilSpec = { ...e.oilSpec, ...ref };
          }
        }
      }
    }
  }

  // ── database ──
  const targetFor = (make, code) =>
    explicitFuel(make, code) || (familyOf(code) ? 'diesel' : undefined);
  const famName = (make, code) =>
    familyOf(code)?.name || 'Codes isoles corriges un par un';

  const ofvRows = (await prisma.oilFinderVehicle.findMany({ include: { oilSpec: true } }))
    .filter((r) => {
      const t = targetFor(r.make, r.engineCode);
      return t && r.fuelType !== t;
    });
  const veRows = (await prisma.vehicleEngine.findMany({
    include: { oilSpec: true, generation: { include: { model: { include: { make: true } } } } },
  })).filter((r) => {
    const t = targetFor(r.generation?.model?.make?.name, r.engineCode);
    return t && r.fuelType !== t;
  });

  for (const r of ofvRows) bump(famName(r.make, r.engineCode), 'ofv');
  for (const r of veRows) bump(famName(r.generation?.model?.make?.name, r.engineCode), 've');

  // ── 3. report ──
  console.log('famille                                  catalogue   OFV    VE   spec reprise  spec gardee  label seul');
  for (const [fam, s] of stats) {
    console.log(`${fam.padEnd(40)} ${String(s.catalog).padStart(9)} ${String(s.ofv).padStart(5)} ${String(s.ve).padStart(5)} ${String(s.specFixed).padStart(13)} ${String(s.specKept).padStart(12)} ${String(s.labelOnly).padStart(11)}`);
  }
  const tot = [...stats.values()].reduce((a, s) => ({
    catalog: a.catalog + s.catalog, ofv: a.ofv + s.ofv, ve: a.ve + s.ve,
  }), { catalog: 0, ofv: 0, ve: 0 });
  console.log(`\ntotal: ${tot.catalog} moteurs du catalogue, ${tot.ofv} OilFinderVehicle, ${tot.ve} VehicleEngine`);

  if (noSibling.size) {
    console.log(`\nAucun jumeau diesel pour ces codes — seul le libelle est corrige, la spec reste en place (${noSibling.size}) :`);
    console.log('  ' + [...noSibling].sort().map(([k, n]) => `${k}(${n})`).join(', '));
  }

  if (process.argv.includes('--plan')) {
    console.log('');
    for (const [k, v] of [...plan].sort()) {
      console.log(k);
      for (const f of v.from) console.log('    actuel  ' + f);
      console.log('    repris  ' + (v.to || '(inchange, aucun jumeau diesel)'));
    }
  }

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  // ── 4. write ──
  const specIdByFingerprint = new Map();
  const resolveSpecId = async (spec, make) => {
    const fp = fingerprint(spec, make);
    let id = specIdByFingerprint.get(fp);
    if (!id) {
      const existing = await prisma.oilFinderOilSpec.findFirst({ where: { fingerprint: fp } });
      const row = existing ?? (await prisma.oilFinderOilSpec.create({ data: { ...spec, fingerprint: fp } }));
      id = row.id;
      specIdByFingerprint.set(fp, id);
    }
    return id;
  };

  for (const r of ofvRows) {
    snapshot.oilFinderVehicles.push({
      id: r.id, make: r.make, model: r.model, engineCode: r.engineCode,
      fuelType: r.fuelType, oilSpecId: r.oilSpecId,
    });
    const target = targetFor(r.make, r.engineCode);
    const ref = target === 'diesel' && specIsReplaceable(r.oilSpec)
      ? referenceSpec(r.make, r.engineCode) : undefined;
    const data = { fuelType: target };
    if (ref && specKey(ref) !== specKey(r.oilSpec)) {
      data.oilSpecId = await resolveSpecId(ref, r.make.toUpperCase());
    }
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data });
  }

  for (const r of veRows) {
    const make = r.generation?.model?.make?.name || '';
    snapshot.vehicleEngines.push({
      id: r.id, make, engineCode: r.engineCode, fuelType: r.fuelType, oilSpecId: r.oilSpecId,
    });
    const target = targetFor(make, r.engineCode);
    const ref = target === 'diesel' && specIsReplaceable(r.oilSpec)
      ? referenceSpec(make, r.engineCode) : undefined;
    const data = { fuelType: target };
    if (ref && specKey(ref) !== specKey(r.oilSpec)) {
      data.oilSpecId = await resolveSpecId(ref, make.toUpperCase());
    }
    await prisma.vehicleEngine.update({ where: { id: r.id }, data });
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
