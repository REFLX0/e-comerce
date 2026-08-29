import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaReadService } from '../prisma/prisma-read.service';
import { Client } from '@opensearch-project/opensearch';
import { Prisma } from '@prisma/client';

const PRODUCT_INDEX = 'specpart_products';

/**
 * OpenSearch SearchService
 *
 * Architecture:
 * - Wraps the official @opensearch-project/opensearch Node.js client
 * - Uses an edge n-gram analyzer for fast prefix autocomplete
 * - Falls back gracefully to PostgreSQL if OpenSearch is unavailable
 * - Exposes: indexProduct(), bulkIndex(), search(), getSuggestions()
 */
@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: Client | null = null;
  private isAvailable = false;

  constructor(
    private readonly config: ConfigService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async onModuleInit() {
    const host = this.config.get<string>('OPENSEARCH_HOST') || 'http://opensearch:9200';
    try {
      this.client = new Client({ node: host });
      const health = await this.client.cluster.health({});
      this.isAvailable = ['green', 'yellow'].includes(health.body.status);
      if (this.isAvailable) {
        this.logger.log(`OpenSearch connected — status: ${health.body.status}`);
        await this.ensureIndex();
      } else {
        this.logger.warn('OpenSearch cluster status is RED — falling back to PostgreSQL');
      }
    } catch (err) {
      this.logger.warn(`OpenSearch not reachable — falling back to PostgreSQL. Reason: ${(err as Error).message}`);
      this.isAvailable = false;
    }
  }

  // ── Index Management ──────────────────────────────────────────────────────

  private async ensureIndex() {
    if (!this.client) return;
    const exists = await this.client.indices.exists({ index: PRODUCT_INDEX });
    if (exists.body) return;

    await this.client.indices.create({
      index: PRODUCT_INDEX,
      body: {
        settings: {
          analysis: {
            tokenizer: {
              edge_ngram_tokenizer: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 15,
                token_chars: ['letter', 'digit'],
              },
            },
            analyzer: {
              // Used at index time: generates n-gram tokens for fast prefix search
              autocomplete_index: {
                type: 'custom',
                tokenizer: 'edge_ngram_tokenizer',
                filter: ['lowercase', 'asciifolding'],
              },
              // Used at query time: exact match only (don't n-gram the query itself)
              autocomplete_search: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding'],
              },
              // General French-aware text analysis
              french_standard: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding', 'french_stop'],
              },
            },
            filter: {
              french_stop: {
                type: 'stop',
                stopwords: '_french_',
              },
            },
          },
        },
        mappings: {
          properties: {
            id:          { type: 'keyword' },
            slug:        { type: 'keyword' },
            sku:         { type: 'keyword' },
            categoryId:  { type: 'keyword' },
            categorySlug:{ type: 'keyword' },
            brandId:     { type: 'keyword' },
            brandSlug:   { type: 'keyword' },
            isPublished: { type: 'boolean' },
            isFeatured:  { type: 'boolean' },
            createdAt:   { type: 'date' },
            price:       { type: 'float' },
            stockQty:    { type: 'integer' },
            // Full-text searchable fields
            name: {
              type: 'text',
              analyzer: 'autocomplete_index',
              search_analyzer: 'autocomplete_search',
              fields: {
                keyword: { type: 'keyword' },       // for exact matching / sorting
                french:  { type: 'text', analyzer: 'french_standard' }, // for relevance
              },
            },
            brand: {
              type: 'text',
              analyzer: 'autocomplete_index',
              search_analyzer: 'autocomplete_search',
            },
            category: {
              type: 'text',
              analyzer: 'french_standard',
            },
            viscosity: { type: 'keyword' },
            description: {
              type: 'text',
              analyzer: 'french_standard',
              index_options: 'offsets',
            },
          },
        },
      },
    });
    this.logger.log(`OpenSearch index "${PRODUCT_INDEX}" created with edge n-gram analyzers`);
  }

  // ── Document Indexing ─────────────────────────────────────────────────────

  async indexProduct(product: {
    id: string; slug: string; sku: string;
    nameFr: string; categoryId: string; categorySlug: string;
    brandId: string; brandName: string; brandSlug: string;
    isPublished: boolean; isFeatured: boolean;
    price: number; stockQty: number; createdAt: Date;
    viscosity?: string | null; description?: string;
  }) {
    if (!this.client || !this.isAvailable) return;
    await this.client.index({
      index: PRODUCT_INDEX,
      id: product.id,
      body: {
        id: product.id,
        slug: product.slug,
        sku: product.sku,
        name: product.nameFr,
        brand: product.brandName,
        brandId: product.brandId,
        brandSlug: product.brandSlug,
        categoryId: product.categoryId,
        categorySlug: product.categorySlug,
        isPublished: product.isPublished,
        isFeatured: product.isFeatured,
        price: product.price,
        stockQty: product.stockQty,
        createdAt: product.createdAt,
        viscosity: product.viscosity,
        description: product.description,
      },
    });
  }

  async deleteProduct(id: string) {
    if (!this.client || !this.isAvailable) return;
    await this.client.delete({ index: PRODUCT_INDEX, id }).catch(() => {});
  }

  // ── Full-text Product Search ───────────────────────────────────────────────

  async search(params: {
    query: string;
    categorySlug?: string;
    brandSlugs?: string[];
    priceMin?: number;
    priceMax?: number;
    inStockOnly?: boolean;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ ids: string[]; total: number } | null> {
    if (!this.client || !this.isAvailable) return null;

    const { query, page = 1, limit = 24 } = params;
    const from = (page - 1) * limit;

    const filter: any[] = [{ term: { isPublished: true } }];
    if (params.categorySlug) filter.push({ term: { categorySlug: params.categorySlug } });
    if (params.brandSlugs?.length) filter.push({ terms: { brandSlug: params.brandSlugs } });
    if (params.inStockOnly) filter.push({ range: { stockQty: { gt: 0 } } });
    if (params.priceMin !== undefined || params.priceMax !== undefined) {
      filter.push({ range: { price: { gte: params.priceMin, lte: params.priceMax } } });
    }

    const sort: any[] = [];
    if (params.sortBy === 'price_asc') sort.push({ price: 'asc' });
    else if (params.sortBy === 'price_desc') sort.push({ price: 'desc' });
    else if (params.sortBy === 'newest') sort.push({ createdAt: 'desc' });
    else sort.push('_score');

    const body: any = {
      from,
      size: limit,
      sort,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['name^4', 'name.french^2', 'brand^3', 'sku^5', 'category^1', 'viscosity^3', 'description'],
                type: 'best_fields',
                fuzziness: 'AUTO',
                prefix_length: 2,
              },
            },
          ],
          filter,
        },
      },
      highlight: {
        fields: { name: {}, brand: {} },
      },
    };

    try {
      const res = await this.client.search({ index: PRODUCT_INDEX, body });
      const hits = res.body.hits;
      return {
        ids: hits.hits.map((h: any) => h._id),
        total: hits.total?.value ?? 0,
      };
    } catch (err) {
      this.logger.error(`OpenSearch search failed: ${(err as Error).message}`);
      return null;
    }
  }

  // ── Autocomplete Suggestions ───────────────────────────────────────────────

  async getSuggestions(query: string, limit = 10): Promise<string[] | null> {
    if (!this.client || !this.isAvailable || query.length < 2) return null;

    try {
      const res = await this.client.search({
        index: PRODUCT_INDEX,
        body: {
          size: limit,
          _source: ['name', 'slug', 'brand', 'sku'],
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query,
                    fields: ['name^4', 'sku^5', 'brand^3'],
                    type: 'phrase_prefix',
                  },
                },
              ],
              filter: [{ term: { isPublished: true } }],
            },
          },
        },
      });
      return res.body.hits.hits.map((h: any) => h._source.slug);
    } catch {
      return null;
    }
  }

  // ── PostgreSQL fallback (used when OpenSearch is not available) ───────────

  private searchTokens(q: string): string[] {
    const tokens = [q];
    const viscMatch = q.match(/(\d+)\s*[wW]\s*-?\s*(\d+)/);
    if (viscMatch) {
      tokens.push(`${viscMatch[1]}W${viscMatch[2]}`);
      tokens.push(`${viscMatch[1]}W-${viscMatch[2]}`);
    }
    const stripped = q.replace(/[\s-]/g, '');
    if (stripped !== q) tokens.push(stripped);
    return [...new Set(tokens)];
  }

  buildPrismaSearchWhere(q: string): Prisma.ProductWhereInput {
    const tokens = this.searchTokens(q);
    return {
      isPublished: true,
      OR: tokens.flatMap((term) => [
        { nameFr: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
        { brand: { name: { contains: term, mode: 'insensitive' } } },
        { specs: { viscosity: { contains: term, mode: 'insensitive' } } },
        { category: { nameFr: { contains: term, mode: 'insensitive' } } },
      ]),
    };
  }

  private buildInclude() {
    return {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' as const } },
      variants: true,
      specs: true,
    };
  }

  private serializeSearch(product: any) {
    return {
      id: product.id,
      slug: product.slug,
      name: product.nameFr,
      sku: product.sku,
      images: product.images?.map((img: any) => img.url) ?? [],
      brand: product.brand ? { name: product.brand.name, slug: product.brand.slug } : null,
      category: product.category ? { name: product.category.nameFr, slug: product.category.slug } : null,
      variants: product.variants?.map((v: any) => ({
        id: v.id, priceHT: +(v.price / 1.19).toFixed(3), priceTTC: v.price, stock: v.stockQty,
      })) ?? [],
      specs: product.specs ? { viscosity: product.specs.viscosity } : null,
      isBestSeller: product.isFeatured,
      isNew: Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000,
    };
  }

  async getSuggestionsWithFallback(query: string) {
    if (!query || query.trim().length < 2) return { products: [], categories: [], brands: [] };
    const q = query.trim();

    const [categories, brands] = await Promise.all([
      this.prismaRead.db.category.findMany({ where: { nameFr: { contains: q, mode: 'insensitive' } }, take: 5 }),
      this.prismaRead.db.brand.findMany({ where: { name: { contains: q, mode: 'insensitive' } }, take: 5 }),
    ]);

    // Try OpenSearch first
    const osSlugs = await this.getSuggestions(q, 10);
    if (osSlugs) {
      const products = await this.prismaRead.db.product.findMany({
        where: { slug: { in: osSlugs } },
        include: { images: { take: 1 }, variants: { take: 1 }, brand: true },
      });
      const map = new Map(products.map((p) => [p.slug, p]));
      const ordered = osSlugs.map((s) => map.get(s)).filter(Boolean);
      return {
        products: ordered.map((p: any) => ({ id: p.id, name: p.nameFr, slug: p.slug, image: p.images[0]?.url, price: p.variants[0]?.price, brandName: p.brand?.name })),
        categories: categories.map((c) => ({ id: c.id, name: c.nameFr, slug: c.slug })),
        brands: brands.map((b) => ({ id: b.id, name: b.name, slug: b.slug, logo: b.logoUrl })),
      };
    }

    // Fallback to PostgreSQL
    const where = this.buildPrismaSearchWhere(q);
    const products = await this.prismaRead.db.product.findMany({ where, include: { images: { take: 1 }, variants: { take: 1 }, brand: true }, take: 10 });
    return {
      products: products.map((p) => ({ id: p.id, name: p.nameFr, slug: p.slug, image: p.images[0]?.url, price: p.variants[0]?.price, brandName: p.brand?.name })),
      categories: categories.map((c) => ({ id: c.id, name: c.nameFr, slug: c.slug })),
      brands: brands.map((b) => ({ id: b.id, name: b.name, slug: b.slug, logo: b.logoUrl })),
    };
  }

  async fullSearch(query: string, page = 1, limit = 20) {
    if (!query || query.trim().length < 2) return { products: [], total: 0 };
    const q = query.trim();

    const osResult = await this.search({ query: q, page, limit });
    if (osResult) {
      const products = await this.prismaRead.db.product.findMany({
        where: { id: { in: osResult.ids } },
        include: this.buildInclude(),
      });
      const map = new Map(products.map((p) => [p.id, p]));
      const ordered = osResult.ids.map((id) => map.get(id)).filter(Boolean);
      return { products: ordered.map((p) => this.serializeSearch(p)), total: osResult.total };
    }

    // Fallback
    const where = this.buildPrismaSearchWhere(q);
    const [products, total] = await Promise.all([
      this.prismaRead.db.product.findMany({ where, include: this.buildInclude(), skip: (page - 1) * limit, take: limit }),
      this.prismaRead.db.product.count({ where }),
    ]);
    return { products: products.map((p) => this.serializeSearch(p)), total };
  }

  async searchProducts(query: string, limit = 5) {
    if (!query || query.trim().length < 2) return [];
    const q = query.trim();

    const osSlugs = await this.getSuggestions(q, limit);
    if (osSlugs) {
      const products = await this.prismaRead.db.product.findMany({ where: { slug: { in: osSlugs } }, include: this.buildInclude() });
      const map = new Map(products.map((p) => [p.slug, p]));
      return osSlugs.map((s) => map.get(s)).filter(Boolean).map((p) => this.serializeSearch(p));
    }

    const where = this.buildPrismaSearchWhere(q);
    const products = await this.prismaRead.db.product.findMany({ where, include: this.buildInclude(), take: limit });
    return products.map((p) => this.serializeSearch(p));
  }
}
