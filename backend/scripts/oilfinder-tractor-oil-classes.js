/**
 * Gives the tractors the API and ACEA class their 15W-40 was missing.
 *
 * All 35 agricultural rows said 15W-40 and almost none said anything about the
 * class behind it. Researched marque by marque, and the headline is reassuring:
 * 15W-40 is right nearly everywhere, because these are pre-DPF agricultural
 * diesels where a high-SAPS oil is the correct family. So no viscosity moves
 * here — only the class it belongs to, and the OEM names, three of which were
 * wrong in different ways.
 *
 * "John Deere JD-30" could not be sourced as a real specification at all. John
 * Deere's engine oils are the branded Plus-50 family and the open classes they
 * accept are API CH-4/CI-4 and ACEA E3/E4/E5; JDM J20C and J20D are real John
 * Deere numbers but they are hydraulic and transmission fluids, not engine oil,
 * which is the likeliest thing "JD-30" is a garbled memory of. It is removed
 * rather than kept as something recognisable, because a name that looks like a
 * specification and is not is worse than no name.
 *
 * "AGCO OEM" and "Kubota Engine Oil" are the opposite problem: real products
 * named imprecisely. AGCO's is "AGCO Parts Premium Engine Oil", Kubota's is
 * "Kubota Power 15W-40". Both are renamed and given the class behind them, so a
 * buyer can match either the product or the rating on a bottle.
 *
 * "SDF Special 9" loses the 9. The SDF Special and Super 15W-40 family is real
 * and sold for Same, Lamborghini, Hurlimann and Deutz-Fahr machines, but the
 * trailing variant number could not be confirmed from anything published, so
 * the part that is sourced stays and the part that is not goes.
 *
 * Landini is the transferability case. Its Perkins 1103C-33 takes Perkins'
 * own published spec, which is also evidence for the Massey Ferguson 1104.4C —
 * same engine maker, same document. Its Yanmar 4TNV88 takes Yanmar's. Neither
 * inherits anything from the tractor marque.
 *
 * Mahindra, Solis and Agrimont get a generic API class and no OEM name, and
 * that is the honest answer rather than a gap: no lubricant specification is
 * published for any of them that could be found. CF-4/CH-4 is the heavy-duty
 * class this generation of mechanically-injected diesel was designed around.
 * It is an engineering convention, not a citation, and is recorded as such.
 *
 * Nothing is moved to a low-SAPS E6 or E9 class. These engines have no
 * aftertreatment, and a low-SAPS oil in one of them is the same mistake as C2
 * in a pre-filter HDi.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/tractor-classes-snapshot-${Date.now()}.json`;

/** make -> what the class and OEM name should be. engine narrows it where a marque mixes suppliers. */
const RULES = [
  { make: 'JOHN DEERE', api: 'CH-4/CI-4', acea: 'E3/E4/E5', oem: null,
    why: 'JD-30 not sourceable as a real spec; Plus-50 family, open classes CH-4/CI-4' },
  { make: 'MASSEY FERGUSON', api: 'CI-4', acea: 'E4/E7', oem: 'AGCO Parts Premium Engine Oil',
    why: 'AGCO published product and class' },
  { make: 'NEW HOLLAND', api: 'CI-4', acea: 'E7', oem: 'New Holland Ambra MASTERGOLD',
    why: 'FPT NEF industrial engines' },
  { make: 'KUBOTA', api: 'CI-4/CH-4', acea: null, oem: 'Kubota Power 15W-40',
    why: 'Kubota state API only, no ACEA rating in their literature' },
  { make: 'LAMBORGHINI', api: null, acea: null, oem: 'SDF Special 15W-40',
    why: 'SDF Special family confirmed, the variant number was not' },
  { make: 'SAME', api: null, acea: null, oem: 'SDF Special 15W-40',
    why: 'SDF Special family confirmed, the variant number was not' },
  { make: 'LANDINI', engine: /^perkins/i, api: 'CI-4', acea: null, oem: 'Perkins Engine Oil 15W-40',
    why: "Perkins' own published spec for the 1103C/1104A family" },
  { make: 'LANDINI', engine: /^yanmar/i, api: 'CF-4/CI-4', acea: null, oem: null,
    why: 'Yanmar service guidance; no OEM approval scheme' },
  { make: 'MAHINDRA', api: 'CF-4/CH-4', acea: null, oem: null,
    why: 'no published Mahindra lubricant spec found; generic heavy-duty class for the engine generation' },
  { make: 'SOLIS', api: 'CF-4/CH-4', acea: null, oem: null,
    why: 'no published Solis/Sonalika/ITL spec found; generic heavy-duty class' },
  { make: 'AGRIMONT', api: 'CF-4/CH-4', acea: null, oem: null,
    why: 'no published spec for these Chinese engines; generic heavy-duty class' },
];

const norm = (s) => String(s || '').toUpperCase().replace(/\s+/g, ' ').trim();
const ruleFor = (make, engine) => RULES.find((r) => norm(make) === r.make
  && (!r.engine || r.engine.test(String(engine || '').trim())));

const SPEC_FIELDS = ['viscosity', 'apiStandard', 'aceaStandard', 'oemApproval',
  'jasoStandard', 'capacityLiters', 'changeIntervalKm'];
const slugify = (t) => (t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fingerprint = (s, make) =>
  [make, s.viscosity, s.oemApproval || 'generic', s.aceaStandard || 'std',
    s.apiStandard || 'anyapi', `cap${s.capacityLiters ?? 'na'}`].map(slugify).join('_');

async function main() {
  const prisma = new PrismaClient();
  const snapshot = { catalog: [], oilFinderVehicles: [] };

  const rows = await prisma.oilFinderVehicle.findMany({
    where: { category: 'agricole' }, include: { oilSpec: true },
    orderBy: [{ make: 'asc' }, { model: 'asc' }],
  });
  const plan = [];
  for (const r of rows) {
    const rule = ruleFor(r.make, r.engineCode);
    if (!rule) { console.log(`  AUCUNE REGLE  ${r.make} / ${r.model}`); continue; }
    const spec = {};
    for (const f of SPEC_FIELDS) spec[f] = r.oilSpec?.[f] ?? null;
    spec.apiStandard = rule.api;
    spec.aceaStandard = rule.acea;
    spec.oemApproval = rule.oem;
    const changed = spec.apiStandard !== (r.oilSpec?.apiStandard ?? null)
      || spec.aceaStandard !== (r.oilSpec?.aceaStandard ?? null)
      || spec.oemApproval !== (r.oilSpec?.oemApproval ?? null);
    if (!changed) continue;
    plan.push({ r, spec, rule });
    console.log(`  ${String(r.make).padEnd(16)} ${String(r.model).padEnd(18)} ${String(r.oilSpec?.oemApproval || '-').padEnd(24)} -> ${spec.viscosity} | API ${spec.apiStandard || '-'} | ACEA ${spec.aceaStandard || '-'} | ${spec.oemApproval || '(aucune)'}`);
  }
  console.log(`\n${plan.length} ligne(s) agricoles a mettre a jour`);

  // the three Mahindra tractors also live in the catalogue
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  let catN = 0;
  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      if (md.category !== 'agricole') continue;
      for (const gen of Object.values(md.generations || {})) {
        for (const e of gen.engines || []) {
          const rule = ruleFor(mk.makeName, e.engineCode);
          if (!rule || !e.oilSpec) continue;
          if (e.oilSpec.apiStandard === rule.api && e.oilSpec.oemApproval === rule.oem) continue;
          catN++;
          snapshot.catalog.push({ make: mk.makeName, model: md.modelName, engineCode: e.engineCode, was: e.oilSpec });
          console.log(`  catalogue  ${mk.makeName} / ${md.modelName} -> API ${rule.api || '-'}`);
          if (APPLY) e.oilSpec = { ...e.oilSpec, apiStandard: rule.api, aceaStandard: rule.acea, oemApproval: rule.oem };
        }
      }
    }
  }
  console.log(`${catN} moteur(s) du catalogue`);

  if (!APPLY) { console.log('\nRien ecrit. Relancer avec --apply.'); await prisma.$disconnect(); return; }

  const cache = new Map();
  for (const { r, spec } of plan) {
    const fp = fingerprint(spec, norm(r.make));
    let id = cache.get(fp);
    if (!id) {
      const existing = await prisma.oilFinderOilSpec.findFirst({ where: { fingerprint: fp } });
      const data = {}; for (const f of SPEC_FIELDS) data[f] = spec[f] ?? null;
      const row = existing ?? (await prisma.oilFinderOilSpec.create({ data: { ...data, fingerprint: fp } }));
      id = row.id; cache.set(fp, id);
    }
    snapshot.oilFinderVehicles.push({ id: r.id, make: r.make, model: r.model, was: r.oilSpecId });
    await prisma.oilFinderVehicle.update({ where: { id: r.id }, data: { oilSpecId: id } });
  }
  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  if (catN) fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}\nCatalogue reecrit : ${catN > 0}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
