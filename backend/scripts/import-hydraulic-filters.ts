/**
 * One-off import: "Filtre hydraulique" (automatic transmission filter)
 * catalog from a CSV (same layout as the other filter categories), scraped
 * from automegastore.tn. Photos sourced separately from autopart.tn (the
 * source site itself only has one shared "no image available" placeholder
 * for every product in this category) — 10 of 16 products have a real
 * per-SKU photo so far; the other 6 (Photo URL blank) are skipped here and
 * will be picked up in a follow-up run once photos are found for them.
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/import-hydraulic-filters.ts            # dry-run report
 *   npx tsx scripts/import-hydraulic-filters.ts --apply     # write changes + upload images
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const DATA_DIR = path.dirname(__filename);
const CSV_PATH = path.join(DATA_DIR, 'tomobile_filtres_hydrauliques.csv');
const CATEGORY_ID = 'cmtnthkmn000rnpcy258wx67i'; // Filtre hydraulique

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

const BRAND_ID_MAP: Record<string, string> = {
  'MAHLE': 'ap-brand-80a464d590efbbe6ff29',
};

const KNOWN_MAKES = [
  'AUDI', 'VW', 'VOLKSWAGEN', 'SEAT', 'SKODA', 'BMW', 'MERCEDES-BENZ', 'MERCEDES',
  'PEUGEOT', 'CITROËN', 'CITROEN', 'RENAULT', 'DACIA', 'FORD', 'OPEL', 'VAUXHALL',
  'FIAT', 'ALFA ROMEO', 'LANCIA', 'KIA', 'HYUNDAI', 'MAZDA', 'TOYOTA', 'LEXUS',
  'NISSAN', 'INFINITI', 'HONDA', 'VOLVO', 'LAND ROVER', 'JAGUAR', 'MINI',
  'SUZUKI', 'MITSUBISHI', 'CHEVROLET', 'JEEP', 'CHRYSLER', 'DODGE', 'SAAB',
  'PORSCHE', 'SMART', 'SUBARU', 'DS', 'CUPRA', 'HONDA',
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

// This category bundles a few non-filter accessory parts (gaskets, oil pans)
// alongside the actual filters — derive the right noun from the product's
// own name rather than assuming everything here is a "filtre hydraulique".
function productLabel(nameFr: string): string {
  const n = nameFr.toLowerCase();
  if (n.startsWith('joint')) return "joint de carter d'huile";
  if (n.startsWith('carter')) return "carter d'huile";
  return 'filtre hydraulique';
}

function generateDescription(brand: string, sku: string, makes: string[], filterType: string | null, vehicleCount: number, oemCount: number, label: string): string {
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

  const labelCap = label.charAt(0).toUpperCase() + label.slice(1);
  const line1Variants = [
    `${brandPart} — ${label}, boîte automatique${hasType ? `, ${typeLabel}` : ''}.`,
    `${labelCap} ${brandPart}, boîte automatique${hasType ? ` (${typeLabel})` : ''}.`,
    `${brandPart} : ${label} pour boîte automatique${hasType ? ` de type ${typeLabel}` : ''}.`,
    `${labelCap} d'origine ${brandPart}, boîte automatique.`,
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
      console.warn(`  ⚠️  Image not found for ${sku}: ${localImgPath || '(no photo url)'} — skipping row (no photo yet).`);
      continue;
    }
    const imageUrl = await uploadImage(localImgPath);

    const makes = extractMakesFromCompat(compatLines);
    const filterType = technicalCharacteristics ? extractFilterType(technicalCharacteristics) : null;
    const description = generateDescription(rawBrand || 'Générique', sku, makes, filterType, compatLines.length, oemReferences.length, productLabel(nameFr));

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
