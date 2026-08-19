import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.MINIO_REGION || 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'changemechangeme',
  },
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'specpart-images';
const FRONTEND_IMG_DIR = path.join(__dirname, '../../frontend/public');
const AUTOPART_DB_DIR = path.join(__dirname, '../../autopart_db/images');

async function processImage(url: string | null): Promise<string | null> {
  if (!url) return null;
  if (!url.startsWith('/img/products/') && !url.startsWith('/product-images/')) {
    return null; // Already migrated or external
  }

  let localPath = '';
  if (url.startsWith('/img/products/')) {
    localPath = path.join(FRONTEND_IMG_DIR, url);
  } else if (url.startsWith('/product-images/')) {
    const filename = url.replace('/product-images/', '');
    localPath = path.join(AUTOPART_DB_DIR, filename);
  }

  if (!fs.existsSync(localPath)) {
    console.warn(`File not found: ${localPath}`);
    return null;
  }

  const ext = path.extname(localPath);
  const filename = path.basename(localPath);
  const newFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const fileBuffer = fs.readFileSync(localPath);
  const mimeType = ext.toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: newFilename,
        Body: fileBuffer,
        ContentType: mimeType,
      })
    );
    
    // Delete local file to free space
    fs.unlinkSync(localPath);
    console.log(`Migrated: ${filename} -> MinIO ${newFilename}`);
    
    return `/storage/${BUCKET_NAME}/${newFilename}`;
  } catch (err) {
    console.error(`Failed to upload ${localPath}`, err);
    return null;
  }
}

async function main() {
  console.log('Starting migration...');
  
  const images = await prisma.productImage.findMany();
  for (const img of images) {
    const newUrl = await processImage(img.url);
    if (newUrl) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: newUrl }
      });
    }
  }

  const variants = await prisma.productVariant.findMany({
    where: { imageUrl: { not: null } }
  });
  for (const variant of variants) {
    const newUrl = await processImage(variant.imageUrl);
    if (newUrl) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { imageUrl: newUrl }
      });
    }
  }

  console.log('Migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
