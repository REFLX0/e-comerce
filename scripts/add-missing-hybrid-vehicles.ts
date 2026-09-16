/**
 * Adds 9 vehicle/engine combinations reported missing from Oil Finder (all
 * researched individually via web search — see each entry's `source` field
 * for the citation trail; nothing here is guessed). A 10th reported item,
 * Haval H6 2.0 (Gulf/GCC-spec), turned out to already be in the catalogue —
 * the GCC-market H6 2.0 is the turbocharged 2.0T variant, which already
 * exists (Haval H6 B06/HM, 2.0T, essence). Not touched.
 *
 * Every capacityLiters/changeIntervalKm left null below is a case where
 * independent sources disagreed by a meaningful margin or the figure found
 * was for a different (larger) engine that shares a similar model name —
 * left unset rather than guessed, matching this table's existing convention
 * (e.g. several pre-existing BMW B48 rows also have no capacity on file).
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/add-missing-hybrid-vehicles.ts            # dry-run report
 *   npx tsx scripts/add-missing-hybrid-vehicles.ts --apply    # write
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface NewEntry {
  make: string;
  model: string;
  generation: string;
  engineCode: string;
  yearFrom?: number;
  yearTo?: number;
  displacementCc?: number;
  powerKw?: number;
  powerHp?: number;
  fuelType: 'hybrid' | 'essence';
  confidence: 'high' | 'medium';
  source: string;
  spec: {
    viscosity: string;
    apiStandard?: string;
    aceaStandard?: string;
    jasoStandard?: string;
    oemApproval?: string;
    capacityLiters?: number;
    changeIntervalKm?: number;
  };
}

const ENTRIES: NewEntry[] = [
  {
    make: 'Volkswagen', model: 'Golf', generation: 'MK8', engineCode: 'DGEA',
    yearFrom: 2020, displacementCc: 1395, powerKw: 150, powerHp: 204, fuelType: 'hybrid',
    confidence: 'medium',
    source: 'autodoc.co.uk / auto-data.net Golf VIII GTE 1.4 TSI eHybrid spec pages; VW dealer service spec sheets citing VW 508 00 0W-20 for the evo2 1.4 TSI PHEV. Capacity not independently confirmed for this exact engine variant, left unset.',
    spec: { viscosity: '0W-20', apiStandard: 'SN PLUS/SP', aceaStandard: 'C5', oemApproval: 'VW 508 00 / VW 509 00' },
  },
  {
    make: 'Volkswagen', model: 'Passat', generation: 'B8 (3G)', engineCode: 'DGEB',
    yearFrom: 2015, displacementCc: 1395, powerKw: 160, powerHp: 218, fuelType: 'hybrid',
    confidence: 'high',
    source: 'autodoc.co.uk / buycarparts.co.uk Passat B8 1.4 GTE Hybrid (DGEB) spec pages, corroborated across multiple listings: VW 504 00 / 507 00, 5W-30, 4.0L capacity (older-generation 1.4 TSI than the Golf 8 GTE - different spec).',
    spec: { viscosity: '5W-30', aceaStandard: 'C3', oemApproval: 'VW 504 00 / VW 507 00', capacityLiters: 4.0 },
  },
  {
    make: 'Hyundai', model: 'Tucson', generation: 'Tucson IV (NX4) (2020 - Présent)', engineCode: 'G4FT',
    yearFrom: 2020, displacementCc: 1598, powerKw: 169, powerHp: 230, fuelType: 'hybrid',
    confidence: 'medium',
    source: 'autodoc.co.uk Tucson NX4/NX4E 1.6 T-GDi Hybrid (G4FT) spec page; Hyundai service data: 0W-20, API SN PLUS/SP. Capacity sources disagreed (4.0L vs 4.8L depending on site), left unset.',
    spec: { viscosity: '0W-20', apiStandard: 'SN PLUS/SP' },
  },
  {
    make: 'Kia', model: 'Sportage', generation: 'Sportage V (NQ5) (2021 - Présent)', engineCode: 'G4FT',
    yearFrom: 2021, displacementCc: 1598, powerKw: 169, powerHp: 230, fuelType: 'hybrid',
    confidence: 'medium',
    source: 'Same Hyundai-Kia Smartstream 1.6 T-GDi hybrid (G4FT) powertrain and platform as the Tucson NX4 Hybrid above - shared engine, same OEM spec. 0W-20, API SN PLUS/SP.',
    spec: { viscosity: '0W-20', apiStandard: 'SN PLUS/SP' },
  },
  {
    make: 'Toyota', model: 'Corolla', generation: 'Corolla XII (E210) (2019 - Présent)', engineCode: '2ZR-FXE',
    yearFrom: 2019, displacementCc: 1798, fuelType: 'hybrid',
    confidence: 'medium',
    source: 'legacytoyotadallas.com / engineoilguide.org Corolla Hybrid 1.8L (2ZR-FXE) spec pages: 0W-16 primary (0W-20 acceptable substitute per Toyota manual), ILSAC GF-6B / API SN PLUS. Capacity sources ranged 3.88-4.4L, left unset.',
    spec: { viscosity: '0W-16', apiStandard: 'SN PLUS/GF-6B' },
  },
  {
    make: 'Toyota', model: 'Yaris', generation: 'Yaris IV (XP210) (2020 - Présent)', engineCode: 'M15A-FXE',
    yearFrom: 2020, displacementCc: 1490, powerKw: 85, powerHp: 116, fuelType: 'hybrid',
    confidence: 'high',
    source: 'Castrol rego2oil.castrol.com Yaris 1.5 Hybrid M15A-FXE fitment data + AUTODOC Yaris IV M15A-FXE spec page, corroborated: 0W-16 (0W-8 also factory-listed in some markets), 3.6L service refill capacity.',
    spec: { viscosity: '0W-16', apiStandard: 'SP/GF-6B', capacityLiters: 3.6 },
  },
  {
    make: 'Toyota', model: 'Rav 4', generation: 'Rav 4 V (XA50) (2018 - Présent)', engineCode: 'A25A-FXS',
    yearFrom: 2018, displacementCc: 2487, fuelType: 'hybrid',
    confidence: 'high',
    source: 'AMSOIL/OilType.net RAV4 A25A-FXS fitment pages, corroborated across multiple sources: 0W-16, API SP / ILSAC GF-6B, ~4.4 US quarts (~4.2L) service capacity.',
    spec: { viscosity: '0W-16', apiStandard: 'SP/GF-6B', capacityLiters: 4.2 },
  },
  {
    make: 'Mercedes-Benz', model: 'Cla', generation: 'Cla (C118)', engineCode: 'M282',
    yearFrom: 2019, displacementCc: 1332, powerHp: 218, fuelType: 'hybrid',
    confidence: 'medium',
    source: 'blauparts.com Mercedes M282 1.3L engine oil kit listings citing MB 229.71/229.72, 0W-20. Note: the CLA 250e (M282, 1.3L PHEV) is a different engine from the non-hybrid CLA 250 (M264, 2.0L) despite the similar name - capacity figures found were for the 2.0L and were not used here; left unset.',
    spec: { viscosity: '0W-20', oemApproval: 'MB 229.71 / MB 229.72' },
  },
  {
    make: 'BMW', model: '3', generation: '3 (G20, G21)', engineCode: 'B48',
    yearFrom: 2019, displacementCc: 1998, fuelType: 'hybrid',
    confidence: 'medium',
    source: 'Turner Motorsport / Blauparts BMW G20 330e B48 PHEV oil kit listings: 0W-20, BMW Longlife-17 FE+. Distinct from the non-hybrid B48 spec already in this table (5W-30, LL-04) - the PHEV tune uses the newer low-viscosity LL-17 FE+ spec.',
    spec: { viscosity: '0W-20', oemApproval: 'BMW Longlife-17 FE+ (LL-17 FE+)' },
  },
  {
    make: 'BMW', model: '5', generation: '5 (G30, F90)', engineCode: 'B48 PHEV',
    yearFrom: 2017, displacementCc: 1998, fuelType: 'hybrid',
    confidence: 'medium',
    source: 'Blauparts BMW 530i/530e G30 B48 oil kit listings: 0W-20, BMW Longlife-17 FE+ - same PHEV-tuned B48 spec as the 330e above. Existing G30 rows in this table are the non-hybrid B48 variants (5W-30/LL-04); this adds the 530e specifically.',
    spec: { viscosity: '0W-20', oemApproval: 'BMW Longlife-17 FE+ (LL-17 FE+)' },
  },
];

// Geely GX3 Pro is not a hybrid (1.5L naturally aspirated) - kept separate
// since its fuelType is 'essence', not 'hybrid' like the rest of this batch.
const GEELY_GX3: NewEntry = {
  make: 'Geely', model: 'GX3 Pro', generation: 'GX3 Pro (2022 - Présent)', engineCode: 'JLC-4G15B',
  yearFrom: 2022, displacementCc: 1498, powerHp: 102, fuelType: 'essence',
  confidence: 'medium',
  source: 'auto-data.net / zigwheels.ph Geely GX3 Pro 1.5 (102hp) spec pages; Ravenol fitment data lists engine codes JLY-4G15/JL4G15D/JLC-4G15B/JLC-4G15C across model years. 5W-30, API SN - standard small-NA-engine spec, not manufacturer-approval-coded like VW/BMW/MB. Capacity not found in any source checked, left unset.',
  spec: { viscosity: '5W-30', apiStandard: 'SN' },
};

async function upsertSpec(spec: NewEntry['spec']) {
  const fingerprint = `${slugify(spec.viscosity)}_${slugify(spec.oemApproval || 'generic')}_${slugify(spec.aceaStandard || 'std')}_${slugify(spec.apiStandard || 'anyapi')}`;
  if (!APPLY) return { id: `dry-run-${fingerprint}`, fingerprint };
  return prisma.oilFinderOilSpec.upsert({
    where: { fingerprint },
    update: {},
    create: {
      viscosity: spec.viscosity,
      apiStandard: spec.apiStandard || null,
      aceaStandard: spec.aceaStandard || null,
      jasoStandard: spec.jasoStandard || null,
      oemApproval: spec.oemApproval || null,
      capacityLiters: spec.capacityLiters ?? null,
      changeIntervalKm: spec.changeIntervalKm ?? null,
      fingerprint,
    },
  });
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write)'}\n`);
  const all = [...ENTRIES, GEELY_GX3];

  let created = 0, skippedExisting = 0;
  for (const e of all) {
    const existing = await prisma.oilFinderVehicle.findFirst({
      where: { make: e.make, model: e.model, generation: e.generation, engineCode: e.engineCode },
    });
    if (existing) {
      skippedExisting++;
      console.log(`  ⚡ Already exists, skipping: ${e.make} ${e.model} ${e.generation} ${e.engineCode}`);
      continue;
    }

    console.log(`  + ${e.make} ${e.model} | ${e.generation} | ${e.engineCode} | ${e.fuelType} | ${e.spec.viscosity} ${e.spec.oemApproval || ''}`);
    created++;

    if (APPLY) {
      const spec = await upsertSpec(e.spec);
      await prisma.oilFinderVehicle.create({
        data: {
          make: e.make,
          model: e.model,
          generation: e.generation,
          engineCode: e.engineCode,
          yearFrom: e.yearFrom ?? null,
          yearTo: e.yearTo ?? null,
          displacementCc: e.displacementCc ?? null,
          powerKw: e.powerKw ?? null,
          powerHp: e.powerHp ?? null,
          fuelType: e.fuelType,
          oilSpecId: spec.id,
          source: e.source,
          confidence: e.confidence,
        },
      });
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Created: ${created}`);
  console.log(`  Already existing (skipped): ${skippedExisting}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
