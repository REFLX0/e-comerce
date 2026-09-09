/**
 * One-off import: "Filtre carburant" catalog from a CSV (same layout as
 * tomobile_filtres_a_huile.csv / tomobile_filtres_a_air.csv) + local
 * watermarked image folder.
 *
 * Same approach as import-air-filters.ts: the source CSV already carries
 * real, per-product-scraped compat/specs/OEM data, so this writes
 * compatibleVehiclesNote / technicalCharacteristics / oemReferences
 * directly at creation time, and generates a short factual description
 * up front from the product's own structured data instead of importing
 * the long marketing-style "Description détaillée" column.
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/import-fuel-filters.ts            # dry-run report
 *   npx tsx scripts/import-fuel-filters.ts --apply     # write changes + upload images
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const DATA_DIR = path.dirname(__filename);
const CSV_PATH = path.join(DATA_DIR, 'tomobile_filtres_carburant.csv');
const CATEGORY_ID = 'cmtnthkml000pnpcy8efrdk1l'; // Filtre à carburant

const prisma = new PrismaClient();

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://minio:9000';
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'specpart';
const MINIO_ACCESS = process.env.MINIO_ACCESS_KEY || 'admin';
const MINIO_SECRET = process.env.MINIO_SECRET_KEY || 'changemechangeme';
const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: MINIO_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: MINIO_ACCESS, secretAccessKey: MINIO_SECRET },
});

// Known canonical brand IDs already in the DB (avoids creating duplicate brand rows
// for names that differ only in punctuation/spacing from an existing row).
const BRAND_ID_MAP: Record<string, string> = {
  'MISFAT': 'ap-brand-8db86e3060dae0c102fe',
  'MANN FILTER': 'ap-brand-4f7b0b880fca862aea3e',
  'MANN-FILTER': 'ap-brand-4f7b0b880fca862aea3e',
  'BOSCH': 'cmrs0sfrt0009rt4p4zrxwt0n',
  'WUNDER': 'ap-brand-d11068c782573b34be81',
  'WUNDER FILTER': 'ap-brand-d11068c782573b34be81',
  'JAPANPARTS': 'ap-brand-a532060949b1a0567f91',
  'PEUGEOT': 'ap-brand-887068e12d54893354b5',
  'MAHLE': 'ap-brand-80a464d590efbbe6ff29',
  'BLUE PRINT': 'ap-brand-804a08783ecff9d9d6e7',
  'ASHIKA': 'ap-brand-8ffcadc3266fe532be9d',
  'WIX FILTERS': 'e2b95253-29b6-430a-89db-5af1d105b913',
  'WIX': 'e2b95253-29b6-430a-89db-5af1d105b913',
  'VALEO': 'ap-brand-2e36c165b37ab0aeb49f',
  'HYUNDAI': 'e074bb40-94ac-477d-8f00-f793e164e3ae',
  'FORD': 'ff0ad7d7-0572-4962-aaf9-5a44a76bed6f',
  'MECAFILTER': 'ap-brand-6cb412a4c788db0a3fac',
  'EUROREPAR': 'cmttawbub009crmf9xzdz1cjw',
  'FILTRON': 'cmttawcrr00hyrmf9fxssjh4s',
};

const KNOWN_MAKES = [
  'AUDI', 'VW', 'VOLKSWAGEN', 'SEAT', 'SKODA', 'BMW', 'MERCEDES-BENZ', 'MERCEDES',
  'PEUGEOT', 'CITROËN', 'CITROEN', 'RENAULT', 'DACIA', 'FORD', 'OPEL', 'VAUXHALL',
  'FIAT', 'ALFA ROMEO', 'LANCIA', 'KIA', 'HYUNDAI', 'MAZDA', 'TOYOTA', 'LEXUS',
  'NISSAN', 'INFINITI', 'HONDA', 'VOLVO', 'LAND ROVER', 'JAGUAR', 'MINI',
  'SUZUKI', 'MITSUBISHI', 'CHEVROLET', 'JEEP', 'CHRYSLER', 'DODGE', 'SAAB',
  'PORSCHE', 'SMART', 'SUBARU', 'DS',
];
const ALIAS: Record<string, string> = { 'MERCEDES': 'MERCEDES-BENZ', 'CITROEN': 'CITROËN', 'VOLKSWAGEN': 'VW' };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  const header = rows[0].map((h) => h.replace(/^﻿/, ''));
  return rows.slice(1).filter((r) => r.length > 1 || r[0] !== '').map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
    return obj;
  });
}

function extractMakesFromCompat(compatLines: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const line of compatLines) {
    const firstWord = line.trim().split(/\s+/)[0]?.toUpperCase();
    if (!firstWord) continue;
    // Two-word makes like "LAND ROVER" / "ALFA ROMEO" won't match on first word alone;
    // fall back to checking known multi-word makes as a prefix of the line.
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

const FILTER_LABEL = 'carburant';

function generateDescription(brand: string, sku: string, makes: string[], filterType: string | null, vehicleCount: number, oemCount: number): string {
  const hasType = !!filterType;
  const typeLabel = hasType ? filterType!.toLowerCase() : null;
  // Some SKUs already embed the brand's first word (e.g. brand "Mann Filter", sku "Mann C32123") —
  // strip it so it isn't stated twice ("Mann Filter Mann C32123").
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

  // Line 1: identity — brand, sku, filter type.
  const line1Variants = [
    `${brandPart} — filtre à ${FILTER_LABEL}${hasType ? `, ${typeLabel}` : ''}.`,
    `Filtre à ${FILTER_LABEL} ${brandPart}${hasType ? ` (${typeLabel})` : ''}.`,
    `${brandPart} : filtre à ${FILTER_LABEL}${hasType ? ` de type ${typeLabel}` : ''}.`,
    `Filtre à ${FILTER_LABEL} d'origine ${brandPart}.`,
  ];
  const line1 = line1Variants[idx];
  const line1UsedType = idx !== 3;

  // Line 2: compatibility.
  const compatVariants = [
    `Compatible avec ${makesText}${remainderText}.`,
    `Conçu pour ${makesText}${remainderText}.`,
    `Pour véhicules ${makesText}${remainderText}.`,
    `Adapté aux modèles ${makesText}${remainderText}.`,
  ];
  const line2 = makesText ? compatVariants[idx] : `Pièce de remplacement directe, montage sans modification.`;

  // Line 3: vehicle count, falling back to type / OEM count / a neutral fit statement.
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

async function uploadImage(localPath: string): Promise<string> {
  const buffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  if (!APPLY) return `/storage/${MINIO_BUCKET}/${filename}`;

  await s3.send(new PutObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  }));
  return `/storage/${MINIO_BUCKET}/${filename}`;
}

interface BrandResolution { id: string; isNew: boolean }
const brandResolutionCache = new Map<string, BrandResolution>();

async function resolveBrandId(rawBrand: string, sku: string): Promise<BrandResolution> {
  const brand = (rawBrand || '').trim() || 'Générique';
  const key = brand.toUpperCase();
  if (BRAND_ID_MAP[key]) return { id: BRAND_ID_MAP[key], isNew: false };
  if (brandResolutionCache.has(key)) return brandResolutionCache.get(key)!;

  const slug = slugify(brand) || `brand-${sku}`;
  const existing = await prisma.brand.findFirst({ where: { OR: [{ name: brand }, { slug }] } });
  if (existing) {
    const res = { id: existing.id, isNew: false };
    brandResolutionCache.set(key, res);
    return res;
  }

  if (!APPLY) {
    const res = { id: `pending-${slug}`, isNew: true };
    brandResolutionCache.set(key, res);
    return res;
  }

  const created = await prisma.brand.create({ data: { name: brand, slug } });
  const res = { id: created.id, isNew: true };
  brandResolutionCache.set(key, res);
  return res;
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write + upload images)'}`);
  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCsv(csvText);
  console.log(`Parsed ${rows.length} rows from CSV.`);

  const usedSlugs = new Set<string>();
  let created = 0;
  let skippedExisting = 0;
  let skippedNoImage = 0;
  const newBrandsSeen = new Set<string>();

  for (const r of rows) {
    const nameFr = r['Nom du produit *']?.trim();
    let slug = r['Slug URL *']?.trim();
    const sku = r['Référence SKU / Code Article']?.trim();
    const rawBrand = r['Marque Fabricant *']?.trim();
    const price = parseFloat(r['Prix de Vente (TND) *']?.trim() || '0') || 0;
    const photoUrl = r['Photo URL']?.trim();
    const vehiclesRaw = r['Vehicules Compatibles']?.trim() || '';
    const compatLines = vehiclesRaw && vehiclesRaw !== '-' ? vehiclesRaw.split('|').map((s) => s.trim()).filter(Boolean) : [];
    const compatibleVehiclesNote = compatLines.length ? compatLines.join('\n') : undefined;
    const technicalCharacteristicsRaw = r['Caracteristiques Techniques']?.trim() || '';
    const technicalCharacteristics = technicalCharacteristicsRaw && technicalCharacteristicsRaw !== '-' ? technicalCharacteristicsRaw : undefined;
    const oemRaw = r['References Origine']?.trim() || '';
    const oemReferences = oemRaw && oemRaw !== '-'
      ? oemRaw.split('|').map((s) => s.trim()).filter(Boolean).map((entry) => {
          const m = entry.match(/^(\S+)\s+(.+)$/);
          return m ? { brand: m[1], reference: m[2] } : { brand: rawBrand || '', reference: entry };
        })
      : [];

    if (!nameFr || !sku) {
      console.warn(`  ⚠️  Skipping row with missing required field: ${JSON.stringify(r).slice(0, 120)}`);
      continue;
    }
    if (!slug) slug = slugify(nameFr);
    if (usedSlugs.has(slug)) slug = `${slug}-${sku.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
    usedSlugs.add(slug);

    const existing = await prisma.product.findFirst({ where: { OR: [{ sku }, { slug }] } });
    if (existing) {
      skippedExisting++;
      console.log(`  ⚡ Already exists, skipping: ${sku} (${nameFr})`);
      continue;
    }

    const brandKey = (rawBrand || 'Générique').toUpperCase();
    const { id: brandId, isNew: brandIsNew } = await resolveBrandId(rawBrand, sku);
    if (brandIsNew) newBrandsSeen.add(brandKey);

    const localImgPath = photoUrl ? path.join(DATA_DIR, photoUrl) : '';
    if (!photoUrl || !fs.existsSync(localImgPath)) {
      skippedNoImage++;
      console.warn(`  ⚠️  Image not found for ${sku}: ${localImgPath} — skipping row.`);
      continue;
    }
    const imageUrl = await uploadImage(localImgPath);

    const makes = extractMakesFromCompat(compatLines);
    const filterType = technicalCharacteristics ? extractFilterType(technicalCharacteristics) : null;
    const description = generateDescription(rawBrand || 'Générique', sku, makes, filterType, compatLines.length, oemReferences.length);

    console.log(`  + ${sku} | ${nameFr} | brand=${brandKey} | price=${price} TND | img=${imageUrl} | oem=${oemReferences.length}`);
    console.log(`    desc: ${description}`);

    if (APPLY) {
      await prisma.product.create({
        data: {
          sku,
          nameFr,
          slug,
          description,
          brandId,
          categoryId: CATEGORY_ID,
          isPublished: true,
          isFeatured: false,
          compatibleVehiclesNote,
          technicalCharacteristics,
          images: { create: [{ url: imageUrl, isPrimary: true, sortOrder: 0 }] },
          variants: {
            create: [{
              volume: '1 Pièce',
              price,
              stockQty: 10,
              skuVariant: `${sku}-1P`,
            }],
          },
          ...(oemReferences.length > 0
            ? { oemReferences: { create: oemReferences.map((r2, idx) => ({ brand: r2.brand, reference: r2.reference, sortOrder: idx })) } }
            : {}),
        },
      });
    }
    created++;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Rows in CSV:         ${rows.length}`);
  console.log(`  Products created:    ${created}`);
  console.log(`  Already existed:     ${skippedExisting}`);
  console.log(`  Skipped (no image):  ${skippedNoImage}`);
  console.log(`  New brands needed:   ${[...newBrandsSeen].join(', ') || '(none)'}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
