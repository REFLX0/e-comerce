/**
 * One-off: replace product images with a batch of "cleaned" (higher quality,
 * de-watermarked/re-cropped) photos the user provided. Files live in
 * ./filtre-images-cleaned/ and are named "<ref>_id<n>_<slug>.png", where
 * <ref> is some OEM/manufacturer reference embedded by whatever tool
 * produced the batch — NOT necessarily this shop's own SKU. The batch mixes
 * cabin filter, air filter, oil filter and fuel filter photos despite the
 * folder's name.
 *
 * Matching strategy (tiered, most confident first), scoped to the 4 filter
 * categories:
 *   1. Exact match against Product.sku (case/space/dash-insensitive).
 *   2. Exact match against a ProductOemReference.reference on exactly one
 *      distinct product.
 *   3. <ref> as one whitespace-separated token inside a compound SKU
 *      (e.g. SKU "WP122 HB266" contains token "HB266"), if it resolves to
 *      exactly one distinct product.
 * A ref matching more than one distinct product at a tier is left
 * unresolved rather than guessed at.
 *
 * Usage (inside the backend container):
 *   npx tsx scripts/update-cleaned-filter-images.ts            # dry-run report
 *   npx tsx scripts/update-cleaned-filter-images.ts --apply     # write + upload images
 */
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');
const IMAGES_DIR = path.join(__dirname, 'filtre-images-cleaned');

const CATEGORY_IDS = [
  'cmtnthkmj000nnpcye0lojphe', // Filtre à air
  'cmtnthkmk000onpcyhhmbhx6h', // Filtre à huile
  'cmtnthkml000pnpcy8efrdk1l', // Filtre à carburant
  'cmtnthkmm000qnpcyyvb395yl', // Filtre habitacle
];

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

function norm(s: string): string {
  return (s || '').toUpperCase().replace(/[\s\-/]+/g, '');
}

async function uploadImage(localPath: string): Promise<string> {
  const buffer = fs.readFileSync(localPath);
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

  if (!APPLY) return `/storage/${MINIO_BUCKET}/${filename}`;

  await s3.send(new PutObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: 'image/png',
  }));
  return `/storage/${MINIO_BUCKET}/${filename}`;
}

interface Candidate { id: string; sku: string; slug: string; nameFr: string }

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN (add --apply to write + upload)'}`);

  if (!fs.existsSync(IMAGES_DIR)) {
    throw new Error(`Images directory not found: ${IMAGES_DIR}`);
  }
  const files = fs.readdirSync(IMAGES_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  console.log(`Found ${files.length} image files in ${IMAGES_DIR}\n`);

  const products = await prisma.product.findMany({
    where: { categoryId: { in: CATEGORY_IDS } },
    select: { id: true, sku: true, slug: true, nameFr: true, oemReferences: { select: { reference: true } } },
  });
  console.log(`Loaded ${products.length} products across the 4 filter categories.\n`);

  // Tier 1: whole SKU, normalized -> candidates
  const bySku = new Map<string, Candidate[]>();
  // Tier 2: OEM reference, normalized -> candidates (distinct products)
  const byOem = new Map<string, Candidate[]>();
  // Tier 3: SKU token, normalized -> candidates (distinct products)
  const byToken = new Map<string, Candidate[]>();

  const pushUnique = (map: Map<string, Candidate[]>, key: string, cand: Candidate) => {
    if (!key) return;
    const arr = map.get(key) ?? [];
    if (!arr.some((c) => c.id === cand.id)) arr.push(cand);
    map.set(key, arr);
  };

  for (const p of products) {
    const cand: Candidate = { id: p.id, sku: p.sku, slug: p.slug, nameFr: p.nameFr };
    pushUnique(bySku, norm(p.sku), cand);
    for (const tok of p.sku.split(/\s+/)) pushUnique(byToken, norm(tok), cand);
    for (const oem of p.oemReferences) pushUnique(byOem, norm(oem.reference), cand);
  }

  let resolved = 0;
  let noPattern = 0;
  let unmatched = 0;
  let ambiguous = 0;
  const unmatchedFiles: string[] = [];
  const ambiguousFiles: string[] = [];

  for (const file of files) {
    const m = file.match(/^(.+?)_id\d+_(.+)\.(png|jpe?g|webp)$/i);
    if (!m) { noPattern++; console.warn(`  ⚠️  Filename doesn't match expected pattern: ${file}`); continue; }
    const ref = m[1];
    const n = norm(ref);

    let match: Candidate | null = null;
    let tier = '';
    for (const [label, map] of [['sku', bySku], ['oem', byOem], ['token', byToken]] as const) {
      const arr = map.get(n);
      if (arr && arr.length === 1) { match = arr[0]; tier = label; break; }
      if (arr && arr.length > 1) { tier = label; break; } // ambiguous at this tier, stop here
    }

    if (!match) {
      const arr = bySku.get(n) ?? byOem.get(n) ?? byToken.get(n);
      if (arr && arr.length > 1) {
        ambiguous++;
        ambiguousFiles.push(`${file} -> ref "${ref}" matches ${arr.length} products (${tier}): ${arr.map((c) => c.sku).join(' | ')}`);
      } else {
        unmatched++;
        unmatchedFiles.push(file);
      }
      continue;
    }

    console.log(`  ~ [${tier}] ${ref} -> ${match.sku} | ${match.nameFr}`);
    const localPath = path.join(IMAGES_DIR, file);
    const newUrl = await uploadImage(localPath);
    console.log(`      ${match.slug}: image -> ${newUrl}`);

    if (APPLY) {
      const existingPrimary = await prisma.productImage.findFirst({ where: { productId: match.id, isPrimary: true } });
      if (existingPrimary) {
        await prisma.productImage.update({ where: { id: existingPrimary.id }, data: { url: newUrl } });
      } else {
        await prisma.productImage.create({ data: { productId: match.id, url: newUrl, isPrimary: true, sortOrder: 0 } });
      }
    }
    resolved++;
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'PLAN'}`);
  console.log(`  Total image files:     ${files.length}`);
  console.log(`  Resolved & updated:    ${resolved}`);
  console.log(`  Ambiguous (skipped):   ${ambiguous}`);
  console.log(`  Unmatched (skipped):   ${unmatched}`);
  console.log(`  Bad filename pattern:  ${noPattern}`);
  if (ambiguousFiles.length) {
    console.log('\n--- Ambiguous (needs manual review) ---');
    ambiguousFiles.forEach((l) => console.log('  ' + l));
  }
  if (unmatchedFiles.length) {
    console.log('\n--- Unmatched (no product found for this reference) ---');
    unmatchedFiles.forEach((l) => console.log('  ' + l));
  }
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
