/**
 * Re-watermarks every product whose primary image was processed while the
 * backend container had no fontconfig/font installed (fixed in backend/Dockerfile) —
 * the watermark rendered as either nothing or "tofu box" missing-glyph
 * placeholders instead of readable "specpart" text.
 *
 * Scope: every product created by scripts/import-accessoires-auto.ts (its 5
 * category slugs), by SKU prefix (TM-/lmp/aaroma/etc. all came from that one
 * import run), identified here simply by reading the same source data file's
 * SKU list — plus any extra SKUs passed on the command line for one-off cases
 * found elsewhere in the catalog (e.g. a legacy image with the same symptom).
 *
 * Downloads each product's CURRENT primary image (already the right photo,
 * just wrongly/invisibly watermarked), re-applies the tiled watermark with the
 * now-fixed renderer, uploads as a new object, and repoints the ProductImage
 * row — old broken objects are simply orphaned in MinIO, not deleted (matches
 * every other fix script's convention in this repo).
 *
 * Usage (inside the backend container, AFTER rebuilding with the font fix):
 *   npx tsx scripts/rewatermark-broken-images.ts                    # dry-run
 *   npx tsx scripts/rewatermark-broken-images.ts --apply             # write
 *   npx tsx scripts/rewatermark-broken-images.ts --apply --sku=1597  # + one extra SKU
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const EXTRA_SKUS = process.argv.filter((a) => a.startsWith('--sku=')).map((a) => a.slice('--sku='.length));

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
  // Flatten against white BEFORE the JPEG encode: a transparent source (several
  // legacy PNGs are) would otherwise default to sharp's black flatten background,
  // silently turning a clean product photo into one with a black backdrop.
  return image
    .flatten({ background: '#ffffff' })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer();
}

// The source photo behind every broken watermark is unaffected (the bug is
// purely in the overlay compositing step), so this fetches from MinIO
// directly rather than trusting the underlying image needed re-downloading
// from any external source.
async function fetchCurrentImage(url: string): Promise<Buffer> {
  const key = url.replace(`/storage/${MINIO_BUCKET}/`, '');
  const res = await fetch(`${MINIO_ENDPOINT}/${MINIO_BUCKET}/${key}`);
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

  const dataPath = path.join(__dirname, 'accessoires-auto-data.json');
  const importedSkus: string[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8')).map((p: any) => p.sku);
  const skus = [...new Set([...importedSkus, ...EXTRA_SKUS])];
  console.log(`Target SKUs: ${importedSkus.length} from the accessoires-auto import + ${EXTRA_SKUS.length} extra = ${skus.length} total\n`);

  let fixed = 0, skipped = 0, failed = 0;
  for (const sku of skus) {
    const product = await prisma.product.findUnique({
      where: { sku },
      include: { images: { where: { isPrimary: true } } },
    });
    if (!product || !product.images[0]) { skipped++; continue; }

    try {
      const raw = await fetchCurrentImage(product.images[0].url);
      const watermarked = await applyTiledWatermark(raw);
      const newUrl = await uploadImage(watermarked);
      console.log(`  + ${sku} | ${product.nameFr} | ${product.images[0].url} -> ${newUrl}`);
      if (APPLY) {
        await prisma.productImage.update({ where: { id: product.images[0].id }, data: { url: newUrl } });
      }
      fixed++;
    } catch (e: any) {
      failed++;
      console.warn(`  ⚠️  Failed for ${sku}: ${e?.message}`);
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Fixed:   ${fixed}`);
  console.log(`  Skipped (product/image not found): ${skipped}`);
  console.log(`  Failed:  ${failed}`);
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
