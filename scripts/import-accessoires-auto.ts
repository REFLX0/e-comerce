/**
 * Import "Car Accessories" products scraped from tomobile.store's acessoires-auto
 * category (via its public WooCommerce Store API — id/name/sku/price/images/brand/
 * source-category tags, no HTML scraping needed) into the 5 subcategories under
 * Automobile > Accessoires Auto:
 *
 *   lavage-carrosserie        Lavage, Carrosserie & Detailing
 *   nettoyage-interieur       Nettoyage & Entretien Intérieur
 *   outillage-atelier         Outillage & Atelier              (new)
 *   confort-equipements-auto  Confort & Équipements Auto       (new)
 *   produits-divers           Produits divers & Maintenance
 *
 * Category for each product was decided up front from the source site's own
 * category tags (see accessoires-auto-data.json, field "bucket") — a full car
 * body cover mis-tagged under "Housses" was manually corrected to the exterior
 * bucket rather than trusted blindly.
 *
 * One image per product (matching the single-primary-image convention used by
 * every other catalog import), watermarked with the same diagonal tiled
 * "specpart" mark used for admin-panel uploads (backend/src/uploads/watermark.util.ts).
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/import-accessoires-auto.ts            # dry-run report
 *   npx tsx scripts/import-accessoires-auto.ts --apply     # write + upload images
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const DATA_PATH = path.join(__dirname, 'accessoires-auto-data.json');

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

const BUCKET_TO_CATEGORY_SLUG: Record<string, string> = {
  'lavage-carrosserie': 'lavage-carrosserie',
  'nettoyage-interieur': 'nettoyage-interieur',
  'outillage-atelier': 'outillage-atelier',
  'confort-equipements-auto': 'confort-equipements-auto',
  'produits-divers': 'produits-divers',
};

interface SourceProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  brand: string;
  bucket: string;
  images: string[];
  shortDesc: string;
}

// "specpart" tiled diagonally across the whole photo — same mark as admin-panel
// uploads (backend/src/uploads/watermark.util.ts) — so it can't be cropped out.
async function applyTiledWatermark(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer, { failOn: 'none' });
  const metadata = await image.metadata();
  const width = metadata.width ?? 800;
  const height = metadata.height ?? 800;

  const fontSize = Math.max(10, Math.round(width * 0.045));
  const tileWidth = fontSize * 6.5;
  const tileHeight = fontSize * 4.5;
  const textY = tileHeight * 0.65;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wm" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <text x="1" y="${textY + 1}" font-family="Arial, Helvetica, sans-serif" font-weight="700"
            font-size="${fontSize}" fill="black" fill-opacity="0.16">specpart</text>
          <text x="0" y="${textY}" font-family="Arial, Helvetica, sans-serif" font-weight="700"
            font-size="${fontSize}" fill="white" fill-opacity="0.3">specpart</text>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#wm)" />
    </svg>
  `;
  return image.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).jpeg({ quality: 90 }).toBuffer();
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadImage(buffer: Buffer): Promise<string> {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
  if (!APPLY) return `/storage/${MINIO_BUCKET}/${filename}`;
  await s3.send(new PutObjectCommand({ Bucket: MINIO_BUCKET, Key: filename, Body: buffer, ContentType: 'image/jpeg' }));
  return `/storage/${MINIO_BUCKET}/${filename}`;
}

const brandCache = new Map<string, string>();
async function resolveBrandId(rawBrand: string): Promise<string> {
  const brand = (rawBrand || '').trim() || 'Générique';
  const key = brand.toLowerCase();
  if (brandCache.has(key)) return brandCache.get(key)!;

  const slug = brand.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'generique';
  const existing = await prisma.brand.findFirst({ where: { OR: [{ name: brand }, { slug }] } });
  if (existing) { brandCache.set(key, existing.id); return existing.id; }

  if (!APPLY) { const fake = `pending-${slug}`; brandCache.set(key, fake); return fake; }
  const created = await prisma.brand.create({ data: { name: brand, slug } });
  brandCache.set(key, created.id);
  return created.id;
}

// Short factual description, varied by bucket + a per-product rotation so 160
// products don't all read identically — same approach as the filter imports'
// generateDescription(), not a copy of the source site's marketing copy.
const BUCKET_BLURB: Record<string, string[]> = {
  'lavage-carrosserie': [
    'Produit d\'entretien extérieur pour la carrosserie : nettoyage, protection et finition.',
    'Accessoire dédié au lavage et à la protection de la carrosserie de votre véhicule.',
    'Conçu pour l\'entretien extérieur : carrosserie, jantes et éléments de protection.',
  ],
  'nettoyage-interieur': [
    'Accessoire d\'entretien et de confort pour l\'habitacle de votre véhicule.',
    'Conçu pour le nettoyage et l\'aménagement intérieur de votre voiture.',
    'Idéal pour l\'entretien quotidien de l\'habitacle : propreté, confort et finition.',
  ],
  'outillage-atelier': [
    'Outil pratique pour l\'entretien mécanique et les interventions d\'atelier.',
    'Accessoire d\'atelier conçu pour faciliter les travaux mécaniques courants.',
    'Équipement utile pour l\'entretien, le dépannage et les petites réparations.',
  ],
  'confort-equipements-auto': [
    'Équipement pratique pour le confort et l\'usage quotidien de votre véhicule.',
    'Accessoire auto conçu pour faciliter vos trajets au quotidien.',
    'Équipement additionnel pour améliorer le confort et la praticité à bord.',
  ],
  'produits-divers': [
    'Accessoire auto polyvalent pour l\'équipement et la protection de votre véhicule.',
    'Produit pratique pour l\'entretien et l\'équipement général de votre voiture.',
    'Accessoire utile au quotidien pour votre véhicule.',
  ],
};

function generateDescription(p: SourceProduct): string {
  const idx = Array.from(p.name).reduce((sum, c) => sum + c.charCodeAt(0), 0) % 3;
  const blurb = (BUCKET_BLURB[p.bucket] || BUCKET_BLURB['produits-divers'])[idx];
  const brandLine = p.brand ? `${p.brand} — ${p.name}.` : `${p.name}.`;
  const lines = [brandLine, blurb];
  if (p.shortDesc && p.shortDesc.length > 15 && p.shortDesc.length < 200) {
    // Keep only as a short factual third line, trimmed — not the full marketing copy.
    const trimmed = p.shortDesc.split(/(?<=[.!])\s/)[0];
    if (trimmed && trimmed.length < 160) lines.push(trimmed);
  }
  return lines.join('\n');
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write + upload images)'}`);
  const products: SourceProduct[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  console.log(`Loaded ${products.length} products from ${DATA_PATH}\n`);

  const categoryIds = new Map<string, string>();
  for (const slug of Object.values(BUCKET_TO_CATEGORY_SLUG)) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) throw new Error(`Category not found: ${slug}`);
    categoryIds.set(slug, cat.id);
  }

  let created = 0, skippedExisting = 0, skippedNoImage = 0, failed = 0;
  const byBucket: Record<string, number> = {};

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { OR: [{ sku: p.sku }, { slug: p.slug }] } });
    if (existing) { skippedExisting++; console.log(`  ⚡ Already exists, skipping: ${p.sku} (${p.name})`); continue; }

    if (!p.images.length) { skippedNoImage++; console.warn(`  ⚠️  No image for ${p.sku}: ${p.name} — skipping.`); continue; }

    const categorySlug = BUCKET_TO_CATEGORY_SLUG[p.bucket];
    const categoryId = categoryIds.get(categorySlug)!;
    const brandId = await resolveBrandId(p.brand);
    const description = generateDescription(p);

    let imageUrl: string;
    try {
      const raw = await downloadImage(p.images[0]);
      const watermarked = await applyTiledWatermark(raw);
      imageUrl = await uploadImage(watermarked);
    } catch (e: any) {
      failed++;
      console.warn(`  ⚠️  Image failed for ${p.sku} (${p.name}): ${e?.message} — skipping row.`);
      continue;
    }

    byBucket[p.bucket] = (byBucket[p.bucket] || 0) + 1;
    console.log(`  + [${p.bucket}] ${p.sku} | ${p.name} | ${p.price} TND | brand=${p.brand || 'Générique'}`);

    if (APPLY) {
      await prisma.product.create({
        data: {
          sku: p.sku,
          nameFr: p.name,
          slug: p.slug,
          description,
          brandId,
          categoryId,
          isPublished: true,
          isFeatured: false,
          images: { create: [{ url: imageUrl, isPrimary: true, sortOrder: 0 }] },
          variants: { create: [{ volume: '1 Pièce', price: p.price, stockQty: 10, skuVariant: `${p.sku}-1P` }] },
        },
      });
    }
    created++;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Source rows:        ${products.length}`);
  console.log(`  Created:            ${created}`);
  console.log(`  Already existed:    ${skippedExisting}`);
  console.log(`  Skipped (no image): ${skippedNoImage}`);
  console.log(`  Image download failed: ${failed}`);
  console.log(`  By category:`, byBucket);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
