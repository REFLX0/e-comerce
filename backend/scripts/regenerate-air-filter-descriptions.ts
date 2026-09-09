/**
 * One-off: regenerate the (already-live) filtre-à-air product descriptions
 * into the newer 3-line format (identity / compatibility / vehicle-count or
 * fallback), reusing the same generator as import-air-filters.ts against
 * each product's own compatibleVehiclesNote / technicalCharacteristics /
 * oemReferences already in the DB — no re-scrape needed.
 *
 * Usage:
 *   npx tsx scripts/regenerate-air-filter-descriptions.ts            # dry-run
 *   npx tsx scripts/regenerate-air-filter-descriptions.ts --apply     # write
 */
import { PrismaClient } from '@prisma/client';

const APPLY = process.argv.includes('--apply');
const CATEGORY_ID = 'cmtnthkmj000nnpcye0lojphe'; // Filtre à air
const FILTER_LABEL = 'air';

const prisma = new PrismaClient();

const KNOWN_MAKES = [
  'AUDI', 'VW', 'VOLKSWAGEN', 'SEAT', 'SKODA', 'BMW', 'MERCEDES-BENZ', 'MERCEDES',
  'PEUGEOT', 'CITROËN', 'CITROEN', 'RENAULT', 'DACIA', 'FORD', 'OPEL', 'VAUXHALL',
  'FIAT', 'ALFA ROMEO', 'LANCIA', 'KIA', 'HYUNDAI', 'MAZDA', 'TOYOTA', 'LEXUS',
  'NISSAN', 'INFINITI', 'HONDA', 'VOLVO', 'LAND ROVER', 'JAGUAR', 'MINI',
  'SUZUKI', 'MITSUBISHI', 'CHEVROLET', 'JEEP', 'CHRYSLER', 'DODGE', 'SAAB',
  'PORSCHE', 'SMART', 'SUBARU', 'DS',
];
const ALIAS: Record<string, string> = { 'MERCEDES': 'MERCEDES-BENZ', 'CITROEN': 'CITROËN', 'VOLKSWAGEN': 'VW' };

function extractMakesFromCompat(compatLines: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const line of compatLines) {
    const firstWord = line.trim().split(/\s+/)[0]?.toUpperCase();
    if (!firstWord) continue;
    let make = KNOWN_MAKES.find((m) => m.includes(' ') && line.toUpperCase().startsWith(m));
    if (!make) make = KNOWN_MAKES.find((m) => m === firstWord);
    if (!make) continue;
    const canonical = ALIAS[make] || make;
    if (!seen.has(canonical)) { seen.add(canonical); ordered.push(canonical); }
  }
  return ordered;
}

function extractFilterType(technicalCharacteristics: string): string | null {
  const m = technicalCharacteristics.match(/Type de filtre\s*:\s*([^|]+)/i);
  return m ? m[1].trim() : null;
}

function toTitleCaseMake(make: string): string {
  return make
    .split(' ')
    .map((w) => (w.length <= 3 && w === w.toUpperCase() ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(' ')
    .replace(/\bVw\b/, 'VW')
    .replace(/\bBmw\b/, 'BMW')
    .replace(/\bDs\b/, 'DS');
}

function generateDescription(brand: string, sku: string, makes: string[], filterType: string | null, vehicleCount: number, oemCount: number): string {
  const hasType = !!filterType;
  const typeLabel = hasType ? filterType!.toLowerCase() : null;
  const brandFirstWord = brand.split(' ')[0]?.toUpperCase();
  const skuWords = sku.split(' ');
  const dedupedSku = skuWords[0]?.toUpperCase() === brandFirstWord ? skuWords.slice(1).join(' ') || sku : sku;
  const brandPart = brand ? `${brand} ${dedupedSku}` : dedupedSku;

  const makesDisplay = makes.slice(0, 3).map(toTitleCaseMake);
  let makesText = '';
  if (makesDisplay.length === 1) makesText = makesDisplay[0];
  else if (makesDisplay.length === 2) makesText = `${makesDisplay[0]} et ${makesDisplay[1]}`;
  else if (makesDisplay.length >= 3) makesText = `${makesDisplay.slice(0, -1).join(', ')} et ${makesDisplay[makesDisplay.length - 1]}`;

  const remainder = makes.length - makesDisplay.length;
  const remainderText = remainder > 0 ? ` et ${remainder} ${remainder === 1 ? 'autre marque' : 'autres marques'}` : '';

  const idx = Array.from(sku).reduce((sum, c) => sum + c.charCodeAt(0), 0) % 4;

  const line1Variants = [
    `${brandPart} — filtre à ${FILTER_LABEL}${hasType ? `, ${typeLabel}` : ''}.`,
    `Filtre à ${FILTER_LABEL} ${brandPart}${hasType ? ` (${typeLabel})` : ''}.`,
    `${brandPart} : filtre à ${FILTER_LABEL}${hasType ? ` de type ${typeLabel}` : ''}.`,
    `Filtre à ${FILTER_LABEL} d'origine ${brandPart}.`,
  ];
  const line1 = line1Variants[idx];
  const line1UsedType = idx !== 3;

  const compatVariants = [
    `Compatible avec ${makesText}${remainderText}.`,
    `Conçu pour ${makesText}${remainderText}.`,
    `Pour véhicules ${makesText}${remainderText}.`,
    `Adapté aux modèles ${makesText}${remainderText}.`,
  ];
  const line2 = makesText ? compatVariants[idx] : `Pièce de remplacement directe, montage sans modification.`;

  const plural = vehicleCount > 1 ? 's' : '';
  const countVariants = [
    `${vehicleCount} motorisation${plural} compatible${plural}.`,
    `Couvre ${vehicleCount} motorisation${plural}.`,
    `${vehicleCount} motorisation${plural} référencée${plural}.`,
    `Compatible avec ${vehicleCount} motorisation${plural} au total.`,
  ];
  let line3: string;
  if (vehicleCount > 0) {
    line3 = countVariants[idx];
  } else if (hasType && !line1UsedType) {
    line3 = `Type : ${typeLabel}.`;
  } else if (oemCount > 0) {
    line3 = `${oemCount} référence${oemCount > 1 ? 's' : ''} constructeur d'origine.`;
  } else {
    line3 = `Pièce de qualité équivalente à l'origine.`;
  }

  let desc = [line1, line2, line3].map((l) => l.replace(/\s+/g, ' ').trim()).join('\n');
  desc = desc.replace(/\bLand\b(?!\s*Rover)/g, 'Land Rover');
  return desc;
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write)'}`);

  const products = await prisma.product.findMany({
    where: { categoryId: CATEGORY_ID },
    include: { brand: true, oemReferences: true },
  });
  console.log(`Found ${products.length} products in filtre-à-air category.`);

  let updated = 0;
  let skippedLegacy = 0;

  for (const p of products) {
    // The 12 pre-existing legacy placeholder rows all share one createdAt
    // timestamp from before the scrape import (2026-08-31); the 187 real
    // imported ones were all created during the import run (2026-09-09).
    // Some real imports still have null compat/specs/oem (the source page
    // genuinely had none) — those still get regenerated, just with the
    // generator's built-in fallback lines.
    if (p.createdAt < new Date('2026-09-01')) {
      skippedLegacy++;
      continue;
    }

    const compatLines = p.compatibleVehiclesNote ? p.compatibleVehiclesNote.split('\n').filter(Boolean) : [];
    const makes = extractMakesFromCompat(compatLines);
    const filterType = p.technicalCharacteristics ? extractFilterType(p.technicalCharacteristics) : null;
    const brandName = p.brand?.name || 'Générique';
    const newDesc = generateDescription(brandName, p.sku, makes, filterType, compatLines.length, p.oemReferences.length);

    console.log(`  ~ ${p.sku} | old ${p.description.length} chars -> new:\n${newDesc.split('\n').map((l) => '      ' + l).join('\n')}`);

    if (APPLY) {
      await prisma.product.update({ where: { id: p.id }, data: { description: newDesc, shortDescription: null } });
    }
    updated++;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Products in category: ${products.length}`);
  console.log(`  Regenerated:          ${updated}`);
  console.log(`  Skipped (legacy):     ${skippedLegacy}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
