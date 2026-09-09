/**
 * One-off: push the site-wide legacy-image watermark batch (everything
 * outside the 4 filter categories + Carrosserie et Habitacle, which were
 * already watermarked earlier) live. Reads url_map.csv (source_url,
 * local_file, status) produced by filtre/legacy-watermark/watermark_legacy_images.py
 * and, per row, overwrites the image at its *same* URL/location so no DB
 * change is needed for the 3 normal cases:
 *   - /storage/specpart/<key>      -> MinIO, same key
 *   - /uploads/products/<file>     -> direct filesystem overwrite (same
 *                                     bind mount nginx serves from)
 *   - Cloudinary res.cloudinary.com/.../<public_id> -> re-upload with the
 *                                     same public_id + overwrite:true
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/apply-legacy-watermarks.ts            # dry-run
 *   npx tsx scripts/apply-legacy-watermarks.ts --apply     # write
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const DATA_DIR = path.dirname(__filename);
const CSV_PATH = path.join(DATA_DIR, 'url_map.csv');
const OUT_DIR = path.join(DATA_DIR, 'out');
const UPLOADS_PRODUCTS_DIR = '/app/uploads/products';

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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function parseCsv(text: string): { source_url: string; local_file: string; status: string }[] {
  const lines = text.split('\n').filter((l) => l.trim());
  const header = lines[0].split(',');
  return lines.slice(1).map((line) => {
    // source_url never contains commas in this dataset; local_file/status are simple tokens
    const lastComma = line.lastIndexOf(',');
    const secondLastComma = line.lastIndexOf(',', lastComma - 1);
    return {
      source_url: line.slice(0, secondLastComma),
      local_file: line.slice(secondLastComma + 1, lastComma),
      status: line.slice(lastComma + 1).trim(),
    };
  });
}

async function uploadToMinio(key: string, localPath: string) {
  const buffer = fs.readFileSync(localPath);
  if (!APPLY) return;
  await s3.send(new PutObjectCommand({ Bucket: MINIO_BUCKET, Key: key, Body: buffer, ContentType: 'image/jpeg' }));
}

async function main() {
  const rows = parseCsv(fs.readFileSync(CSV_PATH, 'utf-8'));
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'} — ${rows.length} rows`);

  let minioCount = 0, uploadsCount = 0, cloudinaryCount = 0, skipped = 0;

  for (const row of rows) {
    const localPath = path.join(OUT_DIR, row.local_file);
    if (!fs.existsSync(localPath)) {
      console.warn(`  ⚠️  Missing local file for ${row.source_url}: ${row.local_file}`);
      skipped++;
      continue;
    }

    if (row.source_url.includes('/storage/specpart/')) {
      const key = row.source_url.split('/storage/specpart/')[1];
      console.log(`  [minio] ${key}`);
      await uploadToMinio(key, localPath);
      minioCount++;
    } else if (row.source_url.includes('/uploads/products/')) {
      const filename = row.source_url.split('/uploads/products/')[1];
      const dest = path.join(UPLOADS_PRODUCTS_DIR, filename);
      console.log(`  [uploads] ${filename}`);
      if (APPLY) fs.copyFileSync(localPath, dest);
      uploadsCount++;
    } else if (row.source_url.includes('res.cloudinary.com')) {
      // https://res.cloudinary.com/<cloud>/image/upload/v<version>/<public_id>.<ext>
      const m = row.source_url.match(/\/image\/upload\/v\d+\/(.+)\.\w+$/);
      if (!m) {
        console.warn(`  ⚠️  Could not parse Cloudinary public_id from ${row.source_url}`);
        skipped++;
        continue;
      }
      const publicId = m[1];
      console.log(`  [cloudinary] ${publicId}`);
      if (APPLY) {
        await cloudinary.uploader.upload(localPath, { public_id: publicId, overwrite: true, invalidate: true });
      }
      cloudinaryCount++;
    } else {
      console.warn(`  ⚠️  Unrecognized source_url pattern, skipping: ${row.source_url}`);
      skipped++;
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  MinIO:      ${minioCount}`);
  console.log(`  Uploads FS: ${uploadsCount}`);
  console.log(`  Cloudinary: ${cloudinaryCount}`);
  console.log(`  Skipped:    ${skipped}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main().catch((e) => { console.error(e); process.exit(1); });
