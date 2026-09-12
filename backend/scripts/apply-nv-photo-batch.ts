/**
 * One-off: apply the "nv photo" manufacturer-photo batch (MANNOL/Liqui Moly
 * oils & additives) the user dropped in the repo, matched to live products
 * by exact SKU (safest signal) and already watermarked with the standard
 * mark. Files are named <productId>.jpg. Uploads each to MinIO and repoints
 * that product's existing primary ProductImage row — no auto-watermark flag
 * involved, these are pre-watermarked so that flag would double-stack.
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/apply-nv-photo-batch.ts            # dry-run
 *   npx tsx scripts/apply-nv-photo-batch.ts --apply     # write + upload
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const DATA_DIR = path.dirname(__filename);
const OUT_DIR = path.join(DATA_DIR, 'out');

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

async function uploadImage(localPath: string): Promise<string> {
  const buffer = fs.readFileSync(localPath);
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
  if (!APPLY) return `/storage/${MINIO_BUCKET}/${filename}`;
  await s3.send(new PutObjectCommand({ Bucket: MINIO_BUCKET, Key: filename, Body: buffer, ContentType: 'image/jpeg' }));
  return `/storage/${MINIO_BUCKET}/${filename}`;
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.jpg'));
  console.log(`Found ${files.length} files in ${OUT_DIR}`);

  let fixed = 0;
  let notFound = 0;

  for (const file of files) {
    const productId = file.replace(/\.jpg$/, '');
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, sku: true, nameFr: true } });
    if (!product) {
      notFound++;
      console.warn(`  ⚠️  No product for id: ${productId}`);
      continue;
    }

    const localPath = path.join(OUT_DIR, file);
    const newUrl = await uploadImage(localPath);
    console.log(`  ~ ${product.sku} | ${product.nameFr} -> ${newUrl}`);

    if (APPLY) {
      await prisma.productImage.updateMany({ where: { productId: product.id, isPrimary: true }, data: { url: newUrl } });
    }
    fixed++;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Fixed:     ${fixed}`);
  console.log(`  Not found: ${notFound}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
