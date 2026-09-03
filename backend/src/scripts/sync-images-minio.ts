/**
 * MinIO Image Migration Script
 *
 * USAGE (run inside the backend Docker container on the VM):
 *   docker exec -it e-comerce-backend-1 npx ts-node src/scripts/sync-images-minio.ts
 *
 * Or in dry-run mode:
 *   docker exec -it e-comerce-backend-1 npx ts-node src/scripts/sync-images-minio.ts --dry-run
 *
 * What it does:
 *   1. Fetches all ProductImage and Category images that aren't already in MinIO
 *   2. Downloads them (from Cloudinary CDN or local /uploads/)
 *   3. Uploads them to the MinIO bucket "specpart-images"
 *   4. Updates the DB rows to point to /storage/specpart-images/<filename>
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import * as fs from 'fs';

const DRY_RUN = process.argv.includes('--dry-run');

// ─── DB ────────────────────────────────────────────────────────────────────────
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// ─── MinIO / S3 Client ─────────────────────────────────────────────────────────
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://minio:9000';
const MINIO_BUCKET   = process.env.MINIO_BUCKET    || 'specpart-images';
const MINIO_ACCESS   = process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER  || 'admin';
const MINIO_SECRET   = process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'changemechangeme';

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: MINIO_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: MINIO_ACCESS, secretAccessKey: MINIO_SECRET },
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Download any URL or read a local file from /app/uploads/<rest> */
async function downloadUrl(rawUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  // Relative local path — resolve inside the container volume
  if (rawUrl.startsWith('/uploads/') || rawUrl.startsWith('uploads/')) {
    const localPath = path.join('/app', rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`);
    if (!fs.existsSync(localPath)) throw new Error(`Local file not found: ${localPath}`);
    const buffer = fs.readFileSync(localPath);
    const ext = path.extname(localPath).toLowerCase();
    const ct = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return { buffer, contentType: ct };
  }

  const response = await fetch(rawUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${rawUrl}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'image/jpeg';

  return { buffer, contentType };
}

/** Derive a stable filename from the URL */
function filenameFromUrl(url: string): string {
  const cleaned = url.split('?')[0];
  let base = path.basename(cleaned);
  // Cloudinary / imagedelivery URLs have no extension — give them .jpg
  if (!path.extname(base) || base.length > 80) {
    base = `${Date.now()}-${Math.abs(simpleHash(url))}.jpg`;
  }
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/** Upload buffer to MinIO and return the public URL path */
async function uploadToMinio(buffer: Buffer, contentType: string, filename: string): Promise<string> {
  if (DRY_RUN) {
    console.log(`  [dry-run] would upload ${filename} (${buffer.length} bytes)`);
    return `/storage/${MINIO_BUCKET}/${filename}`;
  }

  // Check if already exists
  try {
    await s3.send(new HeadObjectCommand({ Bucket: MINIO_BUCKET, Key: filename }));
    console.log(`  ⚡ Already exists in MinIO: ${filename}`);
    return `/storage/${MINIO_BUCKET}/${filename}`;
  } catch { /* not found — proceed */ }

  await s3.send(new PutObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  }));
  return `/storage/${MINIO_BUCKET}/${filename}`;
}

/** Process one URL: download → upload → return new path. Returns null on error. */
async function migrate(originalUrl: string): Promise<string | null> {
  try {
    const { buffer, contentType } = await downloadUrl(originalUrl);
    const filename = filenameFromUrl(originalUrl);
    const newUrl = await uploadToMinio(buffer, contentType, filename);
    return newUrl;
  } catch (err: any) {
    console.warn(`  ⚠️  Could not migrate ${originalUrl}: ${err.message}`);
    return null;
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n🚀 MinIO Image Migration — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);
  console.log(`   Endpoint : ${MINIO_ENDPOINT}`);
  console.log(`   Bucket   : ${MINIO_BUCKET}\n`);

  let done = 0, skipped = 0, failed = 0;

  // ── 1. ProductImage table ────────────────────────────────────────────────────
  console.log('📦 Migrating ProductImage.url ...');
  const images = await prisma.productImage.findMany({
    where: { NOT: { url: { startsWith: '/storage/' } } },
    select: { id: true, url: true },
  });
  console.log(`   Found ${images.length} image(s) to process.`);

  for (const img of images) {
    if (!img.url) { skipped++; continue; }
    process.stdout.write(`  → ${img.url.slice(0, 70).padEnd(72)}`);
    const newUrl = await migrate(img.url);
    if (newUrl) {
      if (!DRY_RUN) await prisma.productImage.update({ where: { id: img.id }, data: { url: newUrl } });
      console.log(`✅ ${newUrl.slice(0, 50)}`);
      done++;
    } else {
      failed++;
    }
  }

  // ── 2. Category.imageUrl ─────────────────────────────────────────────────────
  console.log('\n📦 Migrating Category.imageUrl ...');
  const cats = await prisma.category.findMany({
    where: {
      imageUrl: { not: null },
      NOT: { imageUrl: { startsWith: '/storage/' } },
    },
    select: { id: true, imageUrl: true },
  });
  console.log(`   Found ${cats.length} category image(s) to process.`);

  for (const cat of cats) {
    if (!cat.imageUrl) { skipped++; continue; }
    process.stdout.write(`  → ${cat.imageUrl.slice(0, 70).padEnd(72)}`);
    const newUrl = await migrate(cat.imageUrl);
    if (newUrl) {
      if (!DRY_RUN) await prisma.category.update({ where: { id: cat.id }, data: { imageUrl: newUrl } });
      console.log(`✅ ${newUrl.slice(0, 50)}`);
      done++;
    } else {
      failed++;
    }
  }

  // ── 3. ProductVariant.imageUrl ───────────────────────────────────────────────
  console.log('\n📦 Migrating ProductVariant.imageUrl ...');
  const variants = await prisma.productVariant.findMany({
    where: {
      imageUrl: { not: null },
      NOT: { imageUrl: { startsWith: '/storage/' } },
    },
    select: { id: true, imageUrl: true },
  });
  console.log(`   Found ${variants.length} variant image(s) to process.`);

  for (const v of variants) {
    if (!v.imageUrl) { skipped++; continue; }
    process.stdout.write(`  → ${v.imageUrl.slice(0, 70).padEnd(72)}`);
    const newUrl = await migrate(v.imageUrl);
    if (newUrl) {
      if (!DRY_RUN) await prisma.productVariant.update({ where: { id: v.id }, data: { imageUrl: newUrl } });
      console.log(`✅ ${newUrl.slice(0, 50)}`);
      done++;
    } else {
      failed++;
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log(`\n✅ Migration complete!`);
  console.log(`   Migrated : ${done}`);
  console.log(`   Skipped  : ${skipped}`);
  console.log(`   Failed   : ${failed}\n`);
}

run()
  .catch(e => { console.error('Fatal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
