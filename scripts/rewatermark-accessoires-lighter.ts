/**
 * Re-watermarks every product from the Car Accessories import
 * (scripts/import-accessoires-auto.ts, commit 528f0a8e / scripts/accessoires-auto-data.json)
 * with the new, lighter watermark style (backend/src/uploads/watermark.util.ts,
 * commit a2310935) — the old bold (font-weight 700) mark visually dominated
 * the product photo instead of sitting as a subtle overlay.
 *
 * Re-fetches each product's ORIGINAL image from its external source URL (the
 * "images" field in accessoires-auto-data.json) rather than re-processing the
 * already-watermarked copy currently stored in MinIO — re-watermarking an
 * already-watermarked image would stack a second mark on top of the first
 * instead of replacing it. This is the only batch in the catalog where a
 * clean redo is possible: it's the only import that kept the original source
 * URL on file. Anything uploaded through the admin panel only ever had the
 * watermarked version stored, so there's no clean original to redo from.
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/rewatermark-accessoires-lighter.ts            # dry-run
 *   npx tsx scripts/rewatermark-accessoires-lighter.ts --apply    # write
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
const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: MINIO_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'changemechangeme',
  },
});

// Same renderer as backend/src/uploads/watermark.util.ts (kept as a local copy,
// matching this repo's existing convention for one-off catalog scripts — see
// rewatermark-broken-images.ts) - font-weight 400, lower opacity.
async function applyLightWatermark(buffer: Buffer): Promise<Buffer> {
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
          <text x="1" y="${textY + 1}" font-family="Arial, Helvetica, sans-serif" font-weight="400"
            font-size="${fontSize}" fill="black" fill-opacity="0.10">specpart</text>
          <text x="0" y="${textY}" font-family="Arial, Helvetica, sans-serif" font-weight="400"
            font-size="${fontSize}" fill="white" fill-opacity="0.22">specpart</text>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#wm)" />
    </svg>
  `;
  return image
    .flatten({ background: '#ffffff' })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer();
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

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write + upload images)'}`);

  const source: { sku: string; images: string[] }[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  console.log(`Loaded ${source.length} products from ${DATA_PATH}\n`);

  let fixed = 0, skipped = 0, failed = 0;
  for (const p of source) {
    if (!p.images?.length) { skipped++; continue; }

    const product = await prisma.product.findUnique({
      where: { sku: p.sku },
      include: { images: { where: { isPrimary: true } } },
    });
    if (!product || !product.images[0]) { skipped++; continue; }

    try {
      const raw = await downloadImage(p.images[0]);
      const watermarked = await applyLightWatermark(raw);
      const newUrl = await uploadImage(watermarked);
      console.log(`  + ${p.sku} | ${product.nameFr} | ${product.images[0].url} -> ${newUrl}`);
      if (APPLY) {
        await prisma.productImage.update({ where: { id: product.images[0].id }, data: { url: newUrl } });
      }
      fixed++;
    } catch (e: any) {
      failed++;
      console.warn(`  ⚠️  Failed for ${p.sku}: ${e?.message}`);
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Fixed:   ${fixed}`);
  console.log(`  Skipped (product/image not found, or no source URL): ${skipped}`);
  console.log(`  Failed:  ${failed}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
