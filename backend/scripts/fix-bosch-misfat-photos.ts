/**
 * One-off: replace the images for 115 Bosch/Misfat products (across filtre à
 * huile / filtre à air / filtre carburant) that were showing a tomobile.store
 * generic stock photo shared across many different SKUs — same problem as
 * fix-mann-filter-photos.ts, different brands/sources (Bosch via autopart.tn,
 * Misfat via bestoil.tn). Reads manifest.txt (sku|category|filename, one per
 * line) and uploads each staged file at ./flat/<filename> to MinIO, repointing
 * the product's existing ProductImage row at it.
 *
 * Usage:
 *   npx tsx scripts/fix-bosch-misfat-photos.ts            # dry-run
 *   npx tsx scripts/fix-bosch-misfat-photos.ts --apply     # write + upload
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const DATA_DIR = path.dirname(__filename);
const MANIFEST_PATH = path.join(DATA_DIR, 'manifest.txt');
const FLAT_DIR = path.join(DATA_DIR, 'flat');

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
  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext === '.png' ? '.png' : '.jpg'}`;

  if (!APPLY) return `/storage/${MINIO_BUCKET}/${filename}`;

  await s3.send(new PutObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  }));
  return `/storage/${MINIO_BUCKET}/${filename}`;
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write + upload)'}`);

  const lines = fs.readFileSync(MANIFEST_PATH, 'utf-8').split('\n').map((l) => l.trim()).filter(Boolean);
  console.log(`Loaded ${lines.length} manifest entries.`);

  let fixed = 0;
  let notFound = 0;
  let noImageFile = 0;

  for (const line of lines) {
    const [sku, category, filename] = line.split('|');
    const product = await prisma.product.findUnique({ where: { sku }, select: { id: true, slug: true } });
    if (!product) {
      notFound++;
      console.warn(`  ⚠️  Product not found for SKU: ${sku}`);
      continue;
    }

    const localPath = path.join(FLAT_DIR, filename);
    if (!fs.existsSync(localPath)) {
      noImageFile++;
      console.warn(`  ⚠️  Staged image not found for ${sku}: ${localPath}`);
      continue;
    }

    const newUrl = await uploadImage(localPath);
    console.log(`  ~ ${sku} (${category}) | ${filename} -> ${newUrl}`);

    if (APPLY) {
      await prisma.productImage.updateMany({
        where: { productId: product.id, isPrimary: true },
        data: { url: newUrl },
      });
    }
    fixed++;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Total entries:     ${lines.length}`);
  console.log(`  Fixed:             ${fixed}`);
  console.log(`  Product not found: ${notFound}`);
  console.log(`  No local image:    ${noImageFile}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
