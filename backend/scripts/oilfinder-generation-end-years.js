/**
 * Closes the generations whose end year has been researched and sourced.
 *
 * 1 127 generations read "Présent" because they carry no end year, and many of
 * them finished years ago — a Kia Sportage SL shows as current when the QL
 * replaced it in 2015. TecDoc cannot settle this: it holds a date_to for every
 * vehicle, but matching generations to it by chassis code closes only 30 of the
 * 1 127 and biases early, putting the Fiat Doblo 263 at 2010 against a real run
 * to 2022. So the years below are researched per generation, each with its
 * source, and only the ones confirmed to a published date are here.
 *
 * The rule that governs what gets in: an end year that is too early is worse
 * than no end year. "Présent" on a generation that finished in 2016 is untidy;
 * 2012 on a generation that ran to 2016 tells a 2014 owner their car is not
 * covered. So a year is written only where a source names it, and a generation
 * researched and found still in production is recorded as such rather than
 * being left an open question — the Peugeot 301 is deliberately untouched,
 * because it really is still made.
 *
 * A warning for anyone tempted to automate this from the data instead. The
 * catalogue files body styles as separate model rows, so the next row that
 * starts after a generation is often not its successor: "Fiesta VI Van" begins
 * in 2009 and looks like the end of "Fiesta VI (CB1, CCN)", but it is the same
 * generation in a van body, and the hatchback ran to 2017. A rule that closed
 * each generation at the next one's start would have cut that range from nine
 * years to one, and done the same across the file.
 *
 * Two of these are not "replaced by the next generation" but "discontinued":
 * Ford stopped building the Fiesta entirely in July 2023 and the Focus in
 * November 2025, with no successor to either.
 *
 * Runs read-only unless --apply is passed. Snapshots every row it changes.
 */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const APPLY = process.argv.includes('--apply');
const CATALOG = '/app/oil-finder-full-dataset/clean-catalog-hierarchy.json';
const SNAPSHOT = `/app/generation-years-snapshot-${Date.now()}.json`;

/** make | model | generation (as the catalogue spells it) | end year | source */
const RESEARCHED = [
  ['DACIA', 'Duster', 'Duster', 2017, 'Dacia Duster HS 2010-2017, replaced by the second generation'],
  ['DACIA', 'Logan', 'Logan (LS_)', 2012, 'Logan I 2004-2012 in Europe; licensed production elsewhere ran longer'],
  ['DACIA', 'Logan Mcv', 'Logan Mcv (KS_)', 2013, 'MCV I launched Paris 2006, replaced by MCV II at Geneva 2013'],
  ['DACIA', 'Logan Pickup', 'Logan Pickup (US_)', 2012, 'Dacia discontinued the Logan Pick-Up July 2012; the Nissan NP200 is a different nameplate'],

  ['RENAULT', 'Clio', 'Clio III (BR0/1, CR0/1)', 2012, 'Clio III 2005-2012, replaced by Clio IV'],
  ['RENAULT', 'Clio', 'Clio IV (BH_)', 2019, 'Clio IV 2012-2019, Clio V unveiled Geneva 2019'],
  ['RENAULT', 'Megane', 'Megane III Coupe (DZ0/1_)', 2016, 'Megane III 2008-2016 including the 2012 facelift'],
  ['RENAULT', 'Megane', 'Megane III Hatchback (BZ0/1_)', 2016, 'Megane III 2008-2016 including the 2012 facelift'],
  ['RENAULT', 'Megane Iii Coupe', 'Megane Iii Coupe (DZ0/1_)', 2016, 'Megane III 2008-2016'],
  ['RENAULT', 'Megane Iii Hatchback', 'Megane Iii Hatchback (BZ0/1_)', 2016, 'Megane III 2008-2016'],

  ['PEUGEOT', '208', '208 (CA_, CC_)', 2019, '208 I 2012-2019'],
  ['PEUGEOT', '308', '308 (4A_, 4C_)', 2013, '308 I 2007-2013'],
  ['PEUGEOT', '308', '308 II', 2021, '308 II 2013-2021'],
  ['PEUGEOT', '308 Cc', '308 Cc (4B_)', 2015, '308 CC discontinued 2015 with the folding-hardtop segment, no successor'],
  ['PEUGEOT', 'Partner', 'Partner Tepee', 2018, 'replaced by the Peugeot Rifter in 2018'],
  ['PEUGEOT', 'Partner Tepee', 'Partner Tepee', 2018, 'replaced by the Peugeot Rifter in 2018'],

  ['CITROËN', 'C3', 'C3 I (FC_, FN_)', 2009, 'C3 I 2002-2009'],
  ['CITROËN', 'C3', 'C3 II (SC_)', 2016, 'C3 II 2009-2016'],
  ['CITROËN', 'Berlingo Box', 'Berlingo Box (B9)', 2018, 'Berlingo II (B9) 2008-2018, replaced by Berlingo III March 2018'],
  ['CITROËN', 'Berlingo Platform/Chassis', 'Berlingo Platform/Chassis (B9)', 2018, 'Berlingo II (B9) 2008-2018'],

  ['FORD', 'Fiesta', 'Fiesta VI (CB1, CCN)', 2017, 'Fiesta VI 2008-2017; the 2009 "Fiesta VI Van" is the same generation, not its successor'],
  ['FORD', 'Fiesta', 'Fiesta VI Van', 2017, 'same Fiesta VI generation in van body'],
  ['FORD', 'Fiesta Vi Van', 'Fiesta Vi Van', 2017, 'same Fiesta VI generation in van body'],
  ['FORD', 'Fiesta', 'Fiesta VII', 2023, 'Ford ended Fiesta production entirely 7 July 2023 at Cologne; no successor'],
  ['FORD', 'Focus', 'Focus III', 2018, 'Focus III 2010-2018 in Europe'],
  ['FORD', 'Focus', 'Focus III Saloon', 2018, 'Focus III 2010-2018 in Europe'],
  ['FORD', 'Focus Iii Saloon', 'Focus Iii Saloon', 2018, 'Focus III 2010-2018 in Europe'],
  ['FORD', 'Focus Iii Turnier', 'Focus Iii Turnier', 2018, 'Focus III 2010-2018 in Europe'],
  ['FORD', 'Focus', 'Focus IV', 2025, 'last Focus built at Saarlouis 14 November 2025; no successor assigned'],
  ['FORD', 'Focus Iv Turnier', 'Focus Iv Turnier', 2025, 'last Focus built at Saarlouis 14 November 2025; no successor assigned'],
  ['FORD', 'Ranger', 'Ranger (TKE)', 2022, 'Ranger T6 2011-2022, T6.2 revealed late 2021 for 2022'],

  // -- second batch --
  ['VW', 'Golf', 'Golf VI Convertible (517)', 2016, 'Golf VI Cabriolet 2011-2016 per VW own history; the open-top Golf was then discontinued, and the Mk7 hatchback launch in 2012 is not its successor'],
  ['VW', 'Golf Vi Convertible', 'Golf Vi Convertible (517)', 2016, 'Golf VI Cabriolet 2011-2016, discontinued with no successor'],

  ['KIA', 'Picanto', 'Picanto (SA)', 2011, 'Picanto SA 2004-2011, replaced by the TA'],
  ['KIA', 'Picanto', 'Picanto (TA)', 2017, 'Picanto TA 2011-2017, replaced by the JA'],
  ['KIA', 'Rio', 'Rio II (JB)', 2011, 'Rio JB 2005-2011, replaced by the UB'],
  ['KIA', 'Rio', 'Rio III (UB)', 2017, 'Rio UB 2011-2017, replaced by the YB'],
  ['KIA', 'Rio Ii Saloon', 'Rio Ii Saloon (JB)', 2011, 'Rio JB 2005-2011'],
  ['KIA', 'Rio Iii Saloon', 'Rio Iii Saloon (UB)', 2017, 'Rio UB 2011-2017'],
  ['KIA', 'Sportage', 'Sportage (JE_, KM_)', 2010, 'Sportage JE/KM 2004-2010, replaced by the SL'],
  // The QL was launched in 2015, but the SL sold on into 2016 and TecDoc's own
  // 31 vehicles for it run to 2016. Where a successor's launch and a production
  // record disagree by a year, the later one wins: an overlap lists a car twice,
  // a short range tells its owner the car is not covered.
  ['KIA', 'Sportage', 'Sportage (SL)', 2016, 'Sportage SL 2010-2016; QL launched 2015 and the two overlapped'],
  ['KIA', 'Sportage', 'Sportage (QL, QLE)', 2021, 'Sportage QL 2015-2021, replaced by the NQ5'],

  ['SUZUKI', 'Swift', 'Swift V (AZ)', 2024, 'Swift AZ 2017-2024, all-new generation on sale April 2024'],

  ['NISSAN', 'Micra', 'Micra V (K14)', 2023, 'K14 combustion production ended January 2023 at Flins; the next Micra is an unrelated EV'],
  ['NISSAN', 'Micra', 'Micra V (K14) (2017 - Présent)', 2023, 'K14 combustion production ended January 2023 at Flins'],

  // -- third batch: the vans, where the body-style split is heaviest --
  ['NISSAN', 'Qashqai Ii Closed Off-Road Vehicle', 'Qashqai Ii Closed Off-Road Vehicle (J11, J11_)', 2021,
    'Qashqai J11 2013-2021, replaced by the J12 in February 2021'],

  ['IVECO', 'Daily Line', 'Daily Line Bus', 2025,
    'the 2014 Daily ran to late 2025 through the 2016, 2019, 2022 and MY24 updates; 2016 is a refresh year, not a new generation'],
  ['IVECO', 'Daily Tourys', 'Daily Tourys Bus', 2025,
    'the 2014 Daily ran to late 2025 through its mid-cycle updates'],

  // The Transit Custom and the Transit Courier each have their own generation
  // cycle, separate from the big Transit, which has run unbroken since 2013 and
  // is deliberately left open.
  ['FORD', 'Transit Custom', 'Transit Custom Box', 2023, 'Transit Custom I 2012-2023, all-new generation launched in Europe Q4 2023'],
  ['FORD', 'Transit Custom Box', 'Transit Custom Box', 2023, 'Transit Custom I 2012-2023'],
  ['FORD', 'Transit Custom Bus', 'Transit Custom Bus', 2023, 'Transit Custom I 2012-2023'],
  ['FORD', 'Transit Courier', 'Transit Courier Box', 2023,
    'Transit Courier I 2014-2023, second generation into production at Craiova in 2023; the "Courier discontinued" reports are North America only'],
  ['FORD', 'Transit Courier Box', 'Transit Courier Box', 2023, 'Transit Courier I 2014-2023'],
  ['FORD', 'Transit Courier Kombi', 'Transit Courier Kombi', 2023, 'Transit Courier I 2014-2023'],

  // -- fourth batch, worked in order of how many engines sit behind each row --
  ['SEAT', 'Leon', 'Leon (5F1)', 2020, 'Leon III 2012-2020'],
  ['SEAT', 'Leon St', 'Leon St (5F8)', 2020, 'Leon III 2012-2020'],
  ['SEAT', 'Leon Sc', 'Leon Sc (5F5)', 2020, 'Leon III 2012-2020'],

  ['VW', 'Beetle', 'Beetle (5C1, 5C2)', 2019, 'last Beetle built July 2019; VW retired the nameplate entirely'],
  ['VW', 'Beetle Convertible', 'Beetle Convertible (5C7, 5C8)', 2019, 'last Beetle built July 2019, no successor'],
  ['VW', 'Passat', 'Passat (3G2)', 2023, 'Passat B8 2014-2023'],
  ['VW', 'Passat Variant', 'Passat Variant (3G5)', 2023, 'Passat B8 2014-2023'],
  ['VW', 'Touareg', 'Touareg (7P5, 7P6)', 2018, 'Touareg II 2010-2018, replaced by the Touareg III'],
  ['VW', 'Sharan', 'Sharan (7N1, 7N2)', 2022, 'Sharan II 2010-2022; VW left the minivan segment, no successor'],
  ['VW', 'Caddy Iv Box', 'Caddy Iv Box (SAA, SAH)', 2020, 'Caddy IV 2015-2020, fifth generation revealed February 2020'],
  ['VW', 'Caddy Iv Estate', 'Caddy Iv Estate (SAB, SAJ)', 2020, 'Caddy IV 2015-2020'],

  ['FORD', 'C-Max', 'C-Max II (DXA/CB7, DXA/CEU)', 2019, 'C-Max II ended at Saarlouis June 2019, no successor'],
  ['FORD', 'Grand C-Max', 'Grand C-Max (DXA/CB7, DXA/CEU)', 2019, 'Grand C-Max ended June 2019, no successor'],
  ['FORD', 'Mondeo', 'Mondeo V Hatchback', 2022, 'European Mondeo production ended March 2022, no EU successor'],
  ['FORD', 'Mondeo V Hatchback', 'Mondeo V Hatchback', 2022, 'European Mondeo production ended March 2022'],
  ['FORD', 'Mondeo V Saloon', 'Mondeo V Saloon', 2022, 'European Mondeo production ended March 2022'],
  ['FORD', 'Mondeo V Turnier', 'Mondeo V Turnier', 2022, 'European Mondeo production ended March 2022'],
  ['FORD', 'Kuga', 'Kuga II (DM2)', 2019, 'Kuga II 2013-2019, Kuga III debuted April 2019'],

  ['CITROËN', 'C5', 'C5 III (RD_)', 2017, 'C5 III 2008-2017; the C5 X and C5 Aircross are a different body segment, not a direct successor'],
  ['CITROËN', 'C5', 'C5 III Break (RW_)', 2017, 'C5 III 2008-2017'],
  ['CITROËN', 'C5 Iii Break', 'C5 Iii Break (RW_)', 2017, 'C5 III 2008-2017'],
  // A rename rather than a new generation - the car became the C4 SpaceTourer in
  // early 2018 - but the catalogue already carries C4 Spacetourer as its own
  // model from 2018, so closing this one here keeps the two consistent instead
  // of listing the same car twice from 2018 on.
  ['CITROËN', 'C4 Picasso', 'C4 Picasso II', 2018, 'renamed C4 SpaceTourer in early 2018, which the catalogue holds as a separate model'],

  ['RENAULT', 'ScÉNic', 'ScÉNic III (JZ0/1_)', 2016, 'Scenic III 2009-2016'],
  ['RENAULT', 'Grand ScÉNic', 'Grand ScÉNic III (JZ0/1_)', 2016, 'Grand Scenic III 2009-2016'],
  ['RENAULT', 'Kangoo', 'Kangoo / Grand Kangoo (KW0/1_)', 2021, 'Kangoo II 2008-2021, Kangoo III presented November 2020'],
  ['RENAULT', 'Kangoo / Grand Kangoo', 'Kangoo / Grand Kangoo (KW0/1_)', 2021, 'Kangoo II 2008-2021'],
  ['RENAULT', 'Master', 'Master III Box (FV)', 2024, 'Batilly halted Master III production August 2024, replaced by Master IV'],
  ['RENAULT', 'Master', 'Master III Platform/Chassis (EV, HV, UV)', 2024, 'Master III ended August 2024'],
  ['RENAULT', 'Master Iii Box', 'Master Iii Box (FV)', 2024, 'Master III ended August 2024'],
  ['RENAULT', 'Master Iii Platform/Chassis', 'Master Iii Platform/Chassis (EV, HV, UV)', 2024, 'Master III ended August 2024'],
  // The row the file's "successor starts 2011" hint was pointing at. It is the
  // Master III bus body arriving a year after the van, not a new generation, and
  // its own name says Master III — so the same August 2024 end applies. Naming
  // the generation is what makes this a match rather than an inference from a
  // sibling row.
  ['RENAULT', 'Master', 'Master III Bus (JV)', 2024, 'Master III ended August 2024; the bus body launched a year after the van'],
  ['RENAULT', 'Modus / Grand Modus', 'Modus / Grand Modus (F/JP0_)', 2012, 'Modus 2004-2012; Renault left the mini-MPV segment, the Captur is a crossover and not a direct successor'],

  ['FIAT', 'Punto', 'Punto (199_)', 2018, 'Punto taken off sale 2018 after 13 years, no successor built'],

  // -- fifth batch: the three held-back items, each resolved from evidence --

  // Only the rows that name the 244 generation are closed. The unqualified
  // "Boxer Box", "Boxer Bus" and "Boxer Platform/Chassis" rows carry 16-18
  // engines against these five or six, and the extras are AHM/AHN/AHP — the
  // DW10 with a particulate filter — and the Iveco F1C 3.0 litre, none of which
  // existed in 2002. Those rows span both generations and stay open; closing
  // them at 2006 would remove every Boxer built since from the plain label.
  ['PEUGEOT', 'Boxer Box', 'Boxer Box (244)', 2006, 'Boxer 244 2002-2006, replaced by the Ducato-platform 250'],
  ['PEUGEOT', 'Boxer Bus', 'Boxer Bus (244, Z_)', 2006, 'Boxer 244 2002-2006'],
  ['PEUGEOT', 'Boxer Platform/Chassis', 'Boxer Platform/Chassis (244)', 2006, 'Boxer 244 2002-2006'],

  // Tunisia's Rapids came through Ennakl Automobiles, Skoda's official importer
  // and part of VW Group distribution, not the Russian or Indian lines — and
  // Ennakl's own range says the Scala replaced the Rapid Spaceback. So the
  // European end date is the one that applies here.
  ['SKODA', 'Rapid', 'Rapid (NH3)', 2019, 'European Rapid ended 2019, replaced by the Scala; Tunisia was supplied by Ennakl from the European line'],
  ['SKODA', 'Rapid Spaceback', 'Rapid Spaceback (NH1)', 2019, 'European Rapid Spaceback ended 2019, replaced by the Scala'],

  ['CITROËN', 'C4 Grand Picasso', 'C4 Grand Picasso II', 2018, 'renamed Grand C4 SpaceTourer in 2018, which the catalogue holds as a separate model from 2018'],

  // -- sixth batch, from a scan for rows whose engines disagree with their label --

  // The Jumper is the Boxer under another badge and behaves identically. Its
  // unqualified "Jumper Box" and "Jumper Bus" rows carry 16 and 14 engines
  // including AHM/AHN/AHP and the Iveco F1C, so they span both generations and
  // stay open. The rows that name the 244 hold four and five engines, nothing
  // later than that era, and close with it.
  ['CITROËN', 'Jumper Box', 'Jumper Box (244)', 2006, 'Jumper 244 2002-2006, replaced by the Ducato-platform 250'],
  ['CITROËN', 'Jumper Bus', 'Jumper Bus (244, Z_)', 2006, 'Jumper 244 2002-2006'],

  // The Doblo 263 looked like the same defect from the spread of its engine
  // dates, and is not: every code in it is a Fiat internal number of its own era
  // and none belongs to the Stellantis Doblo III, which the catalogue already
  // carries separately from 2022. A real generation boundary, just undated.
  ['FIAT', 'Doblo', 'Doblo Box Body / Estate (263_)', 2022, 'Doblo 263 2010-2022, replaced by the Stellantis Doblo III'],
  ['FIAT', 'Doblo', 'Doblo Kombi (263_)', 2022, 'Doblo 263 2010-2022'],
  ['FIAT', 'Doblo', 'Doblo Platform/Chassis (263_)', 2022, 'Doblo 263 2010-2022'],
  ['FIAT', 'Doblo Box Body / Estate', 'Doblo Box Body / Estate (263_)', 2022, 'Doblo 263 2010-2022'],
  ['FIAT', 'Doblo Box Body /', 'Doblo Box Body / Estate (263_)', 2022, 'Doblo 263 2010-2022'],
  ['FIAT', 'Doblo Kombi', 'Doblo Kombi (263_)', 2022, 'Doblo 263 2010-2022'],
  ['FIAT', 'Doblo Platform/Chassis', 'Doblo Platform/Chassis (263_)', 2022, 'Doblo 263 2010-2022'],
];

const key = (s) => String(s || '').toUpperCase().replace(/\s+/g, ' ').trim();
const wanted = new Map(RESEARCHED.map(([mk, md, gen, to, src]) => [
  [key(mk), key(md), key(gen)].join('|'), { to, src },
]));

async function main() {
  const prisma = new PrismaClient();
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const snapshot = { catalog: [], vehicleGenerations: [] };
  const seen = new Set();
  let written = 0; let alreadyClosed = 0;

  for (const mk of Object.values(catalog)) {
    for (const md of Object.values(mk.models || {})) {
      for (const gen of Object.values(md.generations || {})) {
        const k = [key(mk.makeName), key(md.modelName), key(gen.genName)].join('|');
        const hit = wanted.get(k);
        if (!hit) continue;
        seen.add(k);
        if (gen.yearTo != null && gen.yearTo !== 9999) {
          alreadyClosed++;
          console.log(`  deja ferme : ${mk.makeName} / ${md.modelName} / ${gen.genName} = ${gen.yearTo}`);
          continue;
        }
        written++;
        console.log(`  ${mk.makeName} / ${md.modelName} / ${gen.genName} : ${gen.yearFrom} - ${hit.to}   (${hit.src})`);
        snapshot.catalog.push({
          make: mk.makeName, model: md.modelName, generation: gen.genName, was: gen.yearTo ?? null,
        });
        if (APPLY) gen.yearTo = hit.to;
      }
    }
  }

  const missing = [...wanted.keys()].filter((k) => !seen.has(k));
  if (missing.length) {
    console.log(`\n${missing.length} entree(s) sans correspondance dans le catalogue :`);
    missing.forEach((m) => console.log('  ' + m.split('|').join(' / ')));
  }

  // the database copy of the same generations
  const dbGens = await prisma.vehicleGeneration.findMany({
    include: { model: { include: { make: true } } },
  });
  const dbRows = dbGens
    .map((g) => ({
      g,
      hit: wanted.get([key(g.model?.make?.name), key(g.model?.name), key(g.name)].join('|')),
    }))
    .filter(({ g, hit }) => hit && (g.yearTo == null || g.yearTo === 9999));

  console.log(`\ncatalogue : ${written} generation(s) fermee(s), ${alreadyClosed} deja fermee(s)`);
  console.log(`base      : ${dbRows.length} VehicleGeneration`);

  if (!APPLY) {
    console.log('\nRien ecrit. Relancer avec --apply.');
    await prisma.$disconnect();
    return;
  }

  for (const { g, hit } of dbRows) {
    snapshot.vehicleGenerations.push({ id: g.id, name: g.name, was: g.yearTo ?? null });
    await prisma.vehicleGeneration.update({ where: { id: g.id }, data: { yearTo: hit.to } });
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot));
  fs.writeFileSync(CATALOG, JSON.stringify(catalog));
  console.log(`\nSnapshot -> ${SNAPSHOT}  (a copier hors du conteneur : /app n est pas persistant)`);
  console.log(`Catalogue reecrit : ${CATALOG}`);
  console.log('Redemarrer le backend : le catalogue est mis en cache au demarrage.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
