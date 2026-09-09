/**
 * One-off: replace the images for 51 MANN-FILTER products (across filtre à
 * huile / filtre à air / filtre carburant) that were showing a tomobile.store
 * generic stock photo shared across many different SKUs. Corrected local
 * images (real per-reference photos from mann-filter.com, already
 * watermarked) live at <category>/imgs/<slug>.jpg — this uploads each to
 * MinIO and repoints the product's existing ProductImage row at it.
 *
 * Usage:
 *   npx tsx scripts/fix-mann-filter-photos.ts            # dry-run
 *   npx tsx scripts/fix-mann-filter-photos.ts --apply     # write + upload
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const DATA_DIR = path.dirname(__filename);

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

// sku -> { slug, category folder }
const ENTRIES: { sku: string; folder: string }[] = [
  { sku: 'CUK 2646-2', folder: 'air' }, { sku: 'CUK 2722-2', folder: 'air' }, { sku: 'CU 4054', folder: 'air' },
  { sku: 'C 22 018', folder: 'air' }, { sku: 'C 37 100', folder: 'air' }, { sku: 'C 27 125', folder: 'air' },
  { sku: 'C 25 114', folder: 'air' }, { sku: 'C 24 025', folder: 'air' }, { sku: 'C 15 105/1', folder: 'air' },
  { sku: 'C 24 024', folder: 'air' }, { sku: 'C 30 135', folder: 'air' }, { sku: 'C 3210', folder: 'air' },
  { sku: 'C 29 015', folder: 'air' }, { sku: 'C 30 030', folder: 'air' }, { sku: 'C 45 004', folder: 'air' },
  { sku: 'C 35 005', folder: 'air' }, { sku: 'C 22 020', folder: 'air' }, { sku: 'C 14 114', folder: 'air' },
  { sku: 'C 36 016', folder: 'air' }, { sku: 'C 28 034', folder: 'air' }, { sku: 'C 4312/1', folder: 'air' },
  { sku: 'C 12 178/1', folder: 'air' }, { sku: 'C 38 145', folder: 'air' }, { sku: 'C 14 130', folder: 'air' },
  { sku: 'C 15 143/1', folder: 'air' }, { sku: 'C 27 004', folder: 'air' },
  { sku: 'HU 815/2 x', folder: 'huile' }, { sku: 'HU 818 x', folder: 'huile' }, { sku: 'HU 720/3 x', folder: 'huile' },
  { sku: 'HU 925/4 x', folder: 'huile' }, { sku: 'HU 718/1 n', folder: 'huile' }, { sku: 'HU 816 z KIT', folder: 'huile' },
  { sku: 'HU 7003 x', folder: 'huile' }, { sku: 'HU 7010 z', folder: 'huile' }, { sku: 'HU 821 x', folder: 'huile' },
  { sku: 'HU 615/3 x', folder: 'huile' }, { sku: 'HU 618 x', folder: 'huile' }, { sku: 'HU 6020 z', folder: 'huile' },
  { sku: 'HU 718/1 k', folder: 'huile' }, { sku: 'HU 715/4 x', folder: 'huile' },
  { sku: 'WK 521/3', folder: 'carburant' }, { sku: 'WK 820/18', folder: 'carburant' }, { sku: 'WK 820/15', folder: 'carburant' },
  { sku: 'WK 820/22', folder: 'carburant' }, { sku: 'WK 822/1', folder: 'carburant' }, { sku: 'WK 5001', folder: 'carburant' },
  { sku: 'WK 720', folder: 'carburant' }, { sku: 'WK 820/14', folder: 'carburant' }, { sku: 'PU 8008/1', folder: 'carburant' },
  { sku: 'PU 825 x', folder: 'carburant' }, { sku: 'WK 5002 x', folder: 'carburant' },
];

// Flat staging dir: files named "<folder>__<slug>.jpg" (avoids spaces-in-path
// issues moving files onto the server; see fix-mann-filter-photos usage notes).
const STAGING_DIR = path.join(DATA_DIR, 'mann-fix-flat');

async function uploadImage(localPath: string): Promise<string> {
  const buffer = fs.readFileSync(localPath);
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;

  if (!APPLY) return `/storage/${MINIO_BUCKET}/${filename}`;

  await s3.send(new PutObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: 'image/jpeg',
  }));
  return `/storage/${MINIO_BUCKET}/${filename}`;
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write + upload)'}`);

  let fixed = 0;
  let notFound = 0;
  let noImageFile = 0;

  for (const { sku, folder } of ENTRIES) {
    const product = await prisma.product.findUnique({ where: { sku }, select: { id: true, slug: true } });
    if (!product) {
      notFound++;
      console.warn(`  ⚠️  Product not found for SKU: ${sku}`);
      continue;
    }

    const localPath = path.join(STAGING_DIR, `${folder}__${product.slug}.jpg`);
    if (!fs.existsSync(localPath)) {
      noImageFile++;
      console.warn(`  ⚠️  Local image not found for ${sku}: ${localPath}`);
      continue;
    }

    const newUrl = await uploadImage(localPath);
    console.log(`  ~ ${sku} (${folder}) | ${product.slug}.jpg -> ${newUrl}`);

    if (APPLY) {
      await prisma.productImage.updateMany({
        where: { productId: product.id, isPrimary: true },
        data: { url: newUrl },
      });
    }
    fixed++;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Total entries:     ${ENTRIES.length}`);
  console.log(`  Fixed:             ${fixed}`);
  console.log(`  Product not found: ${notFound}`);
  console.log(`  No local image:    ${noImageFile}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
