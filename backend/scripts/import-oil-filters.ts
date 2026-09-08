/**
 * One-off import: "Filtre à huile" catalog from a CSV + local image folder.
 *
 * Usage (inside the backend container, with CSV + imgs/ under /app/import-oil-filters):
 *   npx tsx scripts/import-oil-filters.ts            # dry-run report
 *   npx tsx scripts/import-oil-filters.ts --apply     # write changes + upload images
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const DATA_DIR = path.dirname(__filename);
const CSV_PATH = path.join(DATA_DIR, 'tomobile_filtres_a_huile.csv');
const CATEGORY_ID = 'cmtnthkmk000onpcyhhmbhx6h'; // Filtre à huile

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

// Known canonical brand IDs already in the DB (avoids creating duplicate brand rows).
const BRAND_ID_MAP: Record<string, string> = {
  'MISFAT': 'ap-brand-8db86e3060dae0c102fe',
  'MANN FILTER': 'ap-brand-4f7b0b880fca862aea3e',
  'BOSCH': 'cmrs0sfrt0009rt4p4zrxwt0n',
  'WUNDER': 'ap-brand-d11068c782573b34be81',
  'JAPANPARTS': 'ap-brand-a532060949b1a0567f91',
  'PEUGEOT': 'ap-brand-887068e12d54893354b5',
  'MAHLE': 'ap-brand-80a464d590efbbe6ff29',
  'BLUE PRINT': 'ap-brand-804a08783ecff9d9d6e7',
  'ASHIKA': 'ap-brand-8ffcadc3266fe532be9d',
  'WIX FILTERS': 'e2b95253-29b6-430a-89db-5af1d105b913',
  'VALEO': 'ap-brand-2e36c165b37ab0aeb49f',
  'HYUNDAI': 'e074bb40-94ac-477d-8f00-f793e164e3ae',
  'FORD': 'ff0ad7d7-0572-4962-aaf9-5a44a76bed6f',
};

// Rows with an empty "Marque Fabricant" column — inferred from the product name.
const EMPTY_BRAND_OVERRIDE: Record<string, string> = {
  '263202F10': 'KIA',
  'OX 196/1D': 'MAHLE',
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCsv(text: string): Record<string, string>[] {
  // Minimal RFC-4180 CSV parser (handles quoted fields with embedded commas/newlines/escaped quotes).
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

async function resolveBrandId(rawBrand: string, sku: string, cache: Map<string, string>): Promise<string> {
  const brand = (EMPTY_BRAND_OVERRIDE[sku] || rawBrand || '').trim();
  const key = brand.toUpperCase();
  if (BRAND_ID_MAP[key]) return BRAND_ID_MAP[key];
  if (cache.has(key)) return cache.get(key)!;

  const slug = slugify(brand) || `brand-${sku}`;
  const existing = await prisma.brand.findFirst({ where: { OR: [{ name: brand }, { slug }] } });
  if (existing) {
    cache.set(key, existing.id);
    return existing.id;
  }

  if (!APPLY) {
    const fakeId = `pending-${slug}`;
    cache.set(key, fakeId);
    return fakeId;
  }

  const created = await prisma.brand.create({ data: { name: brand, slug } });
  cache.set(key, created.id);
  return created.id;
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write + upload images)'}`);
  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCsv(csvText);
  console.log(`Parsed ${rows.length} rows from CSV.`);

  const brandCache = new Map<string, string>();
  let created = 0;
  let skippedExisting = 0;
  const newBrandsSeen = new Set<string>();

  for (const r of rows) {
    const nameFr = r['Nom du produit *']?.trim();
    const slug = r['Slug URL *']?.trim();
    const sku = r['Référence SKU / Code Article']?.trim();
    const rawBrand = r['Marque Fabricant *']?.trim();
    const shortDescription = r["Description courte / Résumé d'en-tête"]?.trim() || undefined;
    const description = r['Description détaillée (Onglet complet)']?.trim() || nameFr;
    const price = parseFloat(r['Prix de Vente (TND) *']?.trim() || '0') || 0;
    const photoUrl = r['Photo URL']?.trim();
    const vehiclesRaw = r['Vehicules Compatibles']?.trim() || '';
    const compatibleVehiclesNote = vehiclesRaw
      ? vehiclesRaw.split('|').map((s) => s.trim()).filter(Boolean).join('\n')
      : undefined;

    if (!nameFr || !slug || !sku) {
      console.warn(`  ⚠️  Skipping row with missing required field: ${JSON.stringify(r).slice(0, 120)}`);
      continue;
    }

    const existing = await prisma.product.findFirst({ where: { OR: [{ sku }, { slug }] } });
    if (existing) {
      skippedExisting++;
      console.log(`  ⚡ Already exists, skipping: ${sku} (${nameFr})`);
      continue;
    }

    const brandKey = (EMPTY_BRAND_OVERRIDE[sku] || rawBrand || '(none)').toUpperCase();
    if (!BRAND_ID_MAP[brandKey]) newBrandsSeen.add(brandKey);
    const brandId = await resolveBrandId(rawBrand, sku, brandCache);

    const localImgPath = path.join(DATA_DIR, photoUrl);
    if (!fs.existsSync(localImgPath)) {
      console.warn(`  ⚠️  Image not found for ${sku}: ${localImgPath} — skipping row.`);
      continue;
    }
    const imageUrl = await uploadImage(localImgPath);

    console.log(`  + ${sku} | ${nameFr} | brand=${brandKey} | price=${price} TND | img=${imageUrl}`);

    if (APPLY) {
      await prisma.product.create({
        data: {
          sku,
          nameFr,
          slug,
          description,
          shortDescription,
          brandId,
          categoryId: CATEGORY_ID,
          isPublished: true,
          isFeatured: false,
          compatibleVehiclesNote,
          images: { create: [{ url: imageUrl, isPrimary: true, sortOrder: 0 }] },
          variants: {
            create: [{
              volume: '1 Pièce',
              price,
              stockQty: 10,
              skuVariant: `${sku}-1P`,
            }],
          },
        },
      });
    }
    created++;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Rows in CSV:        ${rows.length}`);
  console.log(`  Products created:   ${created}`);
  console.log(`  Already existed:    ${skippedExisting}`);
  console.log(`  New brands needed:  ${[...newBrandsSeen].join(', ') || '(none)'}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
