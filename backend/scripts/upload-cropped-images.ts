/**
 * One-off: replace product images with tightly-cropped versions across all
 * 4 filter categories. Source images (from tomobile.store, autopart.tn,
 * bestoil.tn, mann-filter.com) often had the actual product occupying a
 * small fraction of a much larger white/blue canvas — auto-cropped locally
 * (content-bbox detection with a safety net that skips low-confidence
 * cases rather than risk mangling a low-contrast image), this uploads the
 * cropped result and repoints each product's existing ProductImage row.
 *
 * Reads manifest files (one filename per line, same as local imgs_cropped/
 * folder contents) — filename minus extension is the product's slug.
 *
 * Usage:
 *   npx tsx scripts/upload-cropped-images.ts            # dry-run
 *   npx tsx scripts/upload-cropped-images.ts --apply     # write + upload
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

const CATEGORIES: { key: string; categoryId: string; manifest: string; folder: string }[] = [
  { key: 'huile', categoryId: 'cmtnthkmk000onpcyhhmbhx6h', manifest: 'cropped_huile.txt', folder: 'cropped_huile' },
  { key: 'air', categoryId: 'cmtnthkmj000nnpcye0lojphe', manifest: 'cropped_air.txt', folder: 'cropped_air' },
  { key: 'carburant', categoryId: 'cmtnthkml000pnpcy8efrdk1l', manifest: 'cropped_carburant.txt', folder: 'cropped_carburant' },
  { key: 'habitacle', categoryId: 'cmtnthkmm000qnpcyyvb395yl', manifest: 'cropped_habitacle.txt', folder: 'cropped_habitacle' },
];

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

async function uploadImage(localPath: string): Promise<string> {
  const buffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
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

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write + upload)'}`);

  let totalFixed = 0;
  let totalNotFound = 0;

  for (const cat of CATEGORIES) {
    const manifestPath = path.join(DATA_DIR, cat.manifest);
    if (!fs.existsSync(manifestPath)) {
      console.warn(`  ⚠️  Manifest not found: ${manifestPath} — skipping category ${cat.key}`);
      continue;
    }
    const filenames = fs.readFileSync(manifestPath, 'utf-8').split('\n').map((l) => l.trim()).filter(Boolean);
    console.log(`\n[${cat.key}] ${filenames.length} images in manifest`);

    let fixed = 0;
    let notFound = 0;

    for (const filename of filenames) {
      const slug = filename.replace(/\.(jpg|jpeg|png)$/i, '');
      let product = await prisma.product.findFirst({ where: { slug, categoryId: cat.categoryId }, select: { id: true } });
      if (!product) {
        // Some source images had accents stripped from the filename during
        // an earlier download step; the DB slug (from the original CSV) may
        // still carry them — fall back to an accent-insensitive match.
        const candidates = await prisma.product.findMany({ where: { categoryId: cat.categoryId }, select: { id: true, slug: true } });
        const match = candidates.find((c) => stripAccents(c.slug) === slug);
        if (match) product = { id: match.id };
      }
      if (!product) {
        notFound++;
        console.warn(`  ⚠️  No product for slug: ${slug}`);
        continue;
      }

      const localPath = path.join(DATA_DIR, cat.folder, filename);
      if (!fs.existsSync(localPath)) {
        notFound++;
        console.warn(`  ⚠️  Local file missing: ${localPath}`);
        continue;
      }

      const newUrl = await uploadImage(localPath);
      if (APPLY) {
        await prisma.productImage.updateMany({ where: { productId: product.id, isPrimary: true }, data: { url: newUrl } });
      }
      fixed++;
    }

    console.log(`[${cat.key}] fixed=${fixed} notFound=${notFound}`);
    totalFixed += fixed;
    totalNotFound += notFound;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Total fixed:     ${totalFixed}`);
  console.log(`  Total not found: ${totalNotFound}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
