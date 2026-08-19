/**
 * reindex-products.ts
 *
 * Bulk-indexes all published products from PostgreSQL into OpenSearch.
 * Designed to be run once on first boot or when the index needs rebuilding.
 *
 * Usage (inside backend container or locally with DB access):
 *   npx tsx backend/scripts/reindex-products.ts
 *
 * Environment variables:
 *   DATABASE_URL        — Postgres connection string
 *   OPENSEARCH_HOST     — e.g. http://opensearch:9200
 */

import { PrismaClient } from '@prisma/client';
import { Client } from '@opensearch-project/opensearch';

const INDEX = 'specpart_products';
const BATCH = 200;

const prisma = new PrismaClient();
const os = new Client({ node: process.env.OPENSEARCH_HOST || 'http://localhost:9200' });

async function ensureIndex() {
  const exists = await os.indices.exists({ index: INDEX });
  if (exists.body) {
    console.log(`[reindex] Index "${INDEX}" already exists — deleting and recreating…`);
    await os.indices.delete({ index: INDEX });
  }

  await os.indices.create({
    index: INDEX,
    body: {
      settings: {
        analysis: {
          tokenizer: {
            edge_ngram_tokenizer: { type: 'edge_ngram', min_gram: 2, max_gram: 15, token_chars: ['letter', 'digit'] },
          },
          analyzer: {
            autocomplete_index: { type: 'custom', tokenizer: 'edge_ngram_tokenizer', filter: ['lowercase', 'asciifolding'] },
            autocomplete_search: { type: 'custom', tokenizer: 'standard', filter: ['lowercase', 'asciifolding'] },
            french_standard: { type: 'custom', tokenizer: 'standard', filter: ['lowercase', 'asciifolding', 'french_stop'] },
          },
          filter: {
            french_stop: { type: 'stop', stopwords: '_french_' },
          },
        },
      },
      mappings: {
        properties: {
          id:           { type: 'keyword' },
          slug:         { type: 'keyword' },
          sku:          { type: 'keyword' },
          categoryId:   { type: 'keyword' },
          categorySlug: { type: 'keyword' },
          brandId:      { type: 'keyword' },
          brandSlug:    { type: 'keyword' },
          isPublished:  { type: 'boolean' },
          isFeatured:   { type: 'boolean' },
          createdAt:    { type: 'date' },
          price:        { type: 'float' },
          stockQty:     { type: 'integer' },
          name:     { type: 'text', analyzer: 'autocomplete_index', search_analyzer: 'autocomplete_search', fields: { keyword: { type: 'keyword' }, french: { type: 'text', analyzer: 'french_standard' } } },
          brand:    { type: 'text', analyzer: 'autocomplete_index', search_analyzer: 'autocomplete_search' },
          category: { type: 'text', analyzer: 'french_standard' },
          viscosity:    { type: 'keyword' },
          description:  { type: 'text', analyzer: 'french_standard' },
        },
      },
    },
  });
  console.log(`[reindex] Index "${INDEX}" created`);
}

async function main() {
  console.log('[reindex] Connecting to OpenSearch…');
  const health = await os.cluster.health({});
  console.log(`[reindex] OpenSearch status: ${health.body.status}`);

  await ensureIndex();

  console.log('[reindex] Counting products…');
  const total = await prisma.product.count({ where: { isPublished: true } });
  console.log(`[reindex] ${total} products to index`);

  let indexed = 0;
  let cursor: string | undefined = undefined;

  while (true) {
    const products = await prisma.product.findMany({
      where: { isPublished: true },
      include: {
        brand: true,
        category: true,
        variants: { take: 1, orderBy: { price: 'asc' } },
        specs: { select: { viscosity: true } },
      },
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (products.length === 0) break;
    cursor = products[products.length - 1].id;

    const body = products.flatMap((p) => [
      { index: { _index: INDEX, _id: p.id } },
      {
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        name: p.nameFr,
        brand: p.brand?.name ?? '',
        brandId: p.brandId,
        brandSlug: p.brand?.slug ?? '',
        categoryId: p.categoryId,
        categorySlug: p.category?.slug ?? '',
        isPublished: p.isPublished,
        isFeatured: p.isFeatured,
        price: p.variants[0]?.price ?? 0,
        stockQty: p.variants[0]?.stockQty ?? 0,
        createdAt: p.createdAt,
        viscosity: p.specs?.viscosity ?? null,
        description: p.description?.slice(0, 500) ?? '',
      },
    ]);

    const { body: bulkResponse } = await os.bulk({ body });
    if (bulkResponse.errors) {
      const errors = (bulkResponse.items as any[]).filter((a) => a.index?.error);
      console.error(`[reindex] Bulk errors:`, errors.slice(0, 3));
    }

    indexed += products.length;
    process.stdout.write(`\r[reindex] ${indexed}/${total} (${Math.round(indexed / total * 100)}%)`);
  }

  console.log(`\n[reindex] ✅ Done! ${indexed} products indexed into "${INDEX}"`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
