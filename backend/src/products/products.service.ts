import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '../prisma/prisma-read.service';
import { CacheService } from '../cache/cache.service';
import { Prisma } from '@prisma/client';
import { OilRecommendationsDto } from './dto/oil-recommendations.dto';
import { calcSpecificity } from '../specificity';

export interface ProductFilters {
  categorySlug?: string;
  brandSlug?: string;
  brands?: string[];
  viscosity?: string;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  isPromo?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  search?: string;
  sortBy?: string;
  // Offset-based pagination (admin, legacy)
  page?: number;
  limit?: number;
  // Cursor-based (keyset) pagination — preferred for storefront
  cursor?: string;
  type?: string;
  api?: string;
  acea?: string;
  volume?: string;
  oem?: string;
  make?: string;
  model?: string;
  engineCode?: string;
  year?: number;
  vehicleType?: string;
}

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'filtres': ['filtre', 'filter'],
  'auto-filtres': ['filtre', 'filter'],
  'filtre-a-huile': ['filtre à huile', 'filtre a huile', 'oil filter'],
  'filtre-a-air': ['filtre à air', 'filtre a air', 'air filter'],
  'filtre-a-carburant': ['filtre à carburant', 'filtre carburant', 'fuel filter'],
  'filtre-habitacle': ['filtre d\'habitacle', 'filtre habitacle', 'cabin filter'],
  'freinage': ['frein', 'brake', 'plaquette', 'disque', 'mâchoire', 'étrier'],
  'plaquettes-de-frein': ['plaquette', 'brake pad'],
  'disques-de-frein': ['disque', 'brake disc'],
  'amortisseurs': ['amortisseur', 'shock absorber'],
  'suspension-direction': ['suspension', 'direction', 'rotule', 'bras', 'biellette', 'amortisseur'],
  'allumage-prechauffage': ['allumage', 'bougie', 'bobine', 'préchauffage', 'spark plug', 'glow plug'],
  'bougies-allumage': ['bougie d\'allumage', 'spark plug'],
  'bougies-prechauffage': ['bougie de préchauffage', 'glow plug'],
  'embrayage': ['embrayage', 'clutch', 'volant moteur', 'butée'],
  'courroies-distribution': ['courroie', 'distribution', 'galet', 'poulie', 'timing belt', 'v-belt'],
  'echappement': ['échappement', 'silencieux', 'catalyseur', 'fap', 'exhaust'],
  'refroidissement': ['refroidissement', 'radiateur', 'pompe à eau', 'thermostat', 'ventilateur', 'cooling'],
  'eclairage': ['phare', 'feu', 'ampoule', 'projecteur', 'clignotant', 'lamp'],
  'demarreur-alternateur': ['démarreur', 'alternateur', 'starter', 'alternator'],
  'moteur': ['moteur', 'joint', 'culasse', 'soupape', 'piston', 'engine'],
  'huiles-moteur': ['huile', 'oil', 'lubrifiant', 'engine oil'],
  'liquides-auto': ['liquide', 'fluide', 'antigel', 'lave glace', 'frein'],
  'additifs': ['additif', 'nettoyant', 'traitement'],
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaRead: PrismaReadService,
    private readonly cache: CacheService,
  ) {}

  /** Include every descendant when a catalogue group is selected. */
  async resolveCategoryIds(slug: string): Promise<string[]> {
    if (!slug) return [];

    const aliasGroups: Record<string, string[]> = {
      'moto-huiles': ['moto-huiles', 'huiles-moto-2t-4t', 'moto-huile-moteur', 'karting-huiles'],
      'huiles-moto-2t-4t': ['moto-huiles', 'huiles-moto-2t-4t', 'moto-huile-moteur', 'karting-huiles'],
      'moto-huile-moteur': ['moto-huiles', 'huiles-moto-2t-4t', 'moto-huile-moteur'],
      'moto-huile-boite': ['moto-huile-boite'],
      'moto-huile-fourche': ['moto-huile-fourche', 'huiles-fourche'],
      'huiles-fourche': ['moto-huile-fourche', 'huiles-fourche'],
      'moto-lubrifiants-chaine': ['moto-lubrifiants-chaine', 'entretien-chaine', 'additifs-moto'],
      'entretien-chaine': ['moto-lubrifiants-chaine', 'entretien-chaine'],
      'additifs-moto': ['moto-lubrifiants-chaine', 'additifs-moto'],
      'karting': ['moto-karting', 'karting'],
      'karting-huiles': ['moto-huiles', 'huiles-moto-2t-4t', 'karting-huiles'],
      'karting-pieces-consommables': ['moto-karting'],
      'moto': ['moto-karting', 'moto'],
      'moto-karting': ['moto-karting', 'moto', 'karting', 'huiles-moto-2t-4t', 'entretien-chaine', 'additifs-moto', 'huiles-fourche', 'moto-huiles', 'moto-huile-boite', 'moto-huile-fourche', 'moto-lubrifiants-chaine'],
      'auto-filtres': ['auto-filtres', 'filtres', 'filtres-air', 'filtres-huile', 'filtres-carburant', 'filtres-habitacle'],
      'auto-electricite-eclairage': ['auto-electricite-eclairage', 'batteries', 'essuie-glaces'],
      'additifs': ['additifs', 'additifs-huile', 'additifs-carburant', 'additif-diesel', 'additif-essence', 'additif-huile'],
      'direction-assistee': ['direction-assistee'],
      'liquide-de-frein': ['liquide-de-frein', 'liquide-frein'],
      'antigel-refroidissement': ['antigel-refroidissement', 'refroidissement'],
      'huiles-moteur': ['huiles-moteur', 'huiles-moteur-auto', 'huiles-moteur-specifiques', 'auto-synthese', 'auto-semi', 'auto-minerale'],
      'huile-de-boite': ['huile-de-boite', 'huiles-boite-transmission'],
      'marine': ['marine', 'marine-moteurs', 'marine-hydraulique', 'marine-graisses', 'marine-huiles-lubrifiants'],
    };

    const targetSlugs = Array.from(new Set([slug, ...(aliasGroups[slug] || [])]));

    const matchingCategories = await this.prismaRead.db.category.findMany({
      where: { slug: { in: targetSlugs } },
      select: { id: true, slug: true, parentId: true },
    });

    let matchedIds = matchingCategories.map((c) => c.id);

    // Fallback if none found by exact slug
    if (matchedIds.length === 0) {
      const fallback = await this.prismaRead.db.category.findFirst({
        where: {
          OR: [
            { slug: { contains: slug, mode: 'insensitive' } },
            { nameFr: { contains: slug.replace(/-/g, ' '), mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });
      if (fallback) matchedIds.push(fallback.id);
    }

    if (matchedIds.length === 0) return [];

    const allCategories = await this.prismaRead.db.category.findMany({
      select: { id: true, parentId: true },
    });

    const resultIds = new Set(matchedIds);
    const pending = [...matchedIds];
    while (pending.length > 0) {
      const parentId = pending.shift();
      for (const child of allCategories) {
        if (child.parentId === parentId && !resultIds.has(child.id)) {
          resultIds.add(child.id);
          pending.push(child.id);
        }
      }
    }

    return [...resultIds];
  }

  private normalizeViscosity(value: string) {
    const compact = value.replace(/[\s-]/g, '').toUpperCase();
    const match = compact.match(/^(\d+W)(\d+)$/);
    return match ? `${match[1]}-${match[2]}` : compact;
  }

  buildInclude() {
    return {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' as const } },
      variants: true,
      specs: true,
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    };
  }

  /** Stable cache key from filters object — sorted keys prevent key ordering mismatches. */
  private cacheKeyForFilters(filters: ProductFilters): string {
    const relevant = {
      categorySlug: filters.categorySlug,
      brandSlug: filters.brandSlug,
      brands: filters.brands?.sort().join(','),
      viscosity: filters.viscosity,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      inStockOnly: filters.inStockOnly,
      isFeatured: filters.isFeatured,
      search: filters.search,
      sortBy: filters.sortBy,
      page: filters.page ?? 1,
      cursor: filters.cursor,
      limit: filters.limit ?? 24,
      type: filters.type,
      api: filters.api,
      acea: filters.acea,
      volume: filters.volume,
      oem: filters.oem,
    };
    return `products:list:${JSON.stringify(relevant)}`;
  }

  async findAll(filters: ProductFilters) {
    const cacheKey = this.cacheKeyForFilters(filters);
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    } catch {}

    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(filters.limit ?? 24, 100);
    const skip = (page - 1) * limit;

    try {
      const where: Prisma.ProductWhereInput = { isPublished: true };
      const andConditions: Prisma.ProductWhereInput[] = [];

      if (filters.search) {
        const terms = filters.search.trim().split(/\s+/).filter(Boolean);
        for (const term of terms) {
          const viscMatch = term.replace(/[\s-]/g, '').match(/^(\d+w)(\d+)$/i);
          const viscAlt = viscMatch ? `${viscMatch[1].toUpperCase()}-${viscMatch[2]}` : term;
          const viscAlt2 = viscMatch ? `${viscMatch[1].toUpperCase()}${viscMatch[2]}` : term;

          andConditions.push({
            OR: [
              { nameFr: { contains: term, mode: 'insensitive' } },
              { nameFr: { contains: viscAlt, mode: 'insensitive' } },
              { nameFr: { contains: viscAlt2, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
              { sku: { contains: term, mode: 'insensitive' } },
              { brand: { name: { contains: term, mode: 'insensitive' } } },
              { brand: { slug: { contains: term, mode: 'insensitive' } } },
              { category: { nameFr: { contains: term, mode: 'insensitive' } } },
              { specs: { viscosity: { contains: term, mode: 'insensitive' } } },
              { specs: { viscosity: { contains: viscAlt, mode: 'insensitive' } } },
              { specs: { OEMApprovals: { contains: term, mode: 'insensitive' } } },
              { specs: { apiStandard: { contains: term, mode: 'insensitive' } } },
              { specs: { aeceaStandard: { contains: term, mode: 'insensitive' } } },
              { variants: { some: { volume: { contains: term, mode: 'insensitive' } } } },
              { variants: { some: { skuVariant: { contains: term, mode: 'insensitive' } } } },
            ],
          });
        }
      }
      if (filters.categorySlug) {
        const categoryIds = await this.resolveCategoryIds(filters.categorySlug);
        if (categoryIds.length > 0) {
          where.categoryId = { in: categoryIds };
        }
      }
      if (filters.brands?.length) {
        where.brand = { slug: { in: filters.brands } };
      } else if (filters.brandSlug) {
        where.brand = { slug: filters.brandSlug };
      }
      if (filters.isFeatured) {
        where.isFeatured = true;
      }
      if (filters.isNew) {
        where.createdAt = {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        };
      }
      if (filters.viscosity) {
        const norm = this.normalizeViscosity(filters.viscosity);
        const compact = filters.viscosity.replace(/[\s-]/g, '').toUpperCase();
        andConditions.push({
          OR: [
            { specs: { viscosity: { contains: norm, mode: 'insensitive' } } },
            { specs: { viscosity: { contains: compact, mode: 'insensitive' } } },
            { nameFr: { contains: norm, mode: 'insensitive' } },
            { nameFr: { contains: compact, mode: 'insensitive' } },
            { description: { contains: norm, mode: 'insensitive' } },
          ],
        });
      }
      const variantSome: Prisma.ProductVariantWhereInput = {};
      const specsInput: Prisma.ProductSpecsWhereInput = {};
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        variantSome.price = {
          ...(filters.priceMin !== undefined ? { gte: filters.priceMin } : {}),
          ...(filters.priceMax !== undefined ? { lte: filters.priceMax } : {}),
        };
      }
      if (filters.inStockOnly) {
        variantSome.stockQty = { gt: 0 };
      }
      if (filters.volume) {
        variantSome.volume = filters.volume;
      }
      if (filters.type) {
        switch (filters.type) {
          case '100% Synthèse':
            specsInput.isFullySynth = true;
            break;
          case 'Semi-Synthèse':
            specsInput.isSemiSynth = true;
            break;
          case 'Minérale':
            specsInput.isMinerale = true;
            break;
        }
      }
      if (filters.api) {
        specsInput.apiStandard = {
          contains: filters.api.replace(/^API\s+/i, ''),
          mode: 'insensitive',
        };
      }
      if (filters.acea) {
        specsInput.aeceaStandard = {
          contains: filters.acea.replace(/^ACEA\s+/i, ''),
          mode: 'insensitive',
        };
      }
      if (filters.oem) {
        specsInput.OEMApprovals = {
          contains: filters.oem,
          mode: 'insensitive',
        };
      }
      if (Object.keys(variantSome).length > 0)
        where.variants = { some: variantSome };
      if (Object.keys(specsInput).length > 0) {
        where.specs = { ...((where.specs as any) || {}), ...specsInput };
      }

      // Vehicle compatibility filter
      if (filters.make || filters.model || filters.engineCode) {
        const compatConditions: Prisma.ProductWhereInput[] = [];

        compatConditions.push({
          compatibilities: {
            some: {
              ...(filters.make ? { vehicleModel: { make: { name: { contains: filters.make, mode: 'insensitive' } } } } : {}),
              ...(filters.model ? { vehicleModel: { name: { contains: filters.model, mode: 'insensitive' } } } : {}),
              ...(filters.engineCode ? { engineCode: { contains: filters.engineCode, mode: 'insensitive' } } : {}),
            },
          },
        });

        if (filters.make) {
          compatConditions.push({
            specs: {
              OEMApprovals: { contains: filters.make, mode: 'insensitive' },
            },
          });
        }

        andConditions.push({ OR: compatConditions });
      }

      if (andConditions.length > 0) {
        where.AND = andConditions;
      }

      const [prismaProducts, totalCount] = await Promise.all([
        this.prismaRead.db.product.findMany({
          where,
          include: this.buildInclude(),
          orderBy: this.buildOrderBy(filters.sortBy),
          skip,
          take: limit,
        }),
        this.prismaRead.db.product.count({ where }),
      ]);

      const data = prismaProducts.map((p) => this.serialize(p)).filter(Boolean);
      const resultPage = filters.cursor ? 1 : Math.max(filters.page ?? 1, 1);

      const result: any = {
        data,
        total: totalCount,
        page: resultPage,
        limit,
        totalPages: totalCount > 0 ? Math.ceil(totalCount / limit) : 0,
        nextCursor: null,
      };

      if (totalCount > 0) {
        try {
          await this.cache.set(cacheKey, result, CacheService.TTL.PRODUCT_LIST);
        } catch {}
      }

      return result;
    } catch (err) {
      console.error('[ProductsService.findAll] Error querying products:', err);
      return {
        data: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
        nextCursor: null,
      };
    }
  }

  isSparePartCategory(slug?: string): boolean {
    if (!slug) return false;
    const s = slug.toLowerCase();
    return (
      s.startsWith('auto-') ||
      s.includes('filtre') ||
      s.includes('frein') ||
      s.includes('piece') ||
      s.includes('suspension') ||
      s.includes('moteur-distribution') ||
      s.includes('climatisation') ||
      s.includes('electricite') ||
      s.includes('carrosserie') ||
      s.includes('echappement') ||
      s.includes('transmission')
    );
  }

  async findTecdocArticles(filters: ProductFilters, limit: number, skip: number) {
    try {
      const conditions: string[] = ['a.is_valid = true'];
      const params: any[] = [];
      let pIdx = 1;

      // 1. Category / generic product filtering
      if (filters.categorySlug) {
        const cat = filters.categorySlug.toLowerCase();
        if (cat.includes('filtre') || cat.includes('filter')) {
          conditions.push(`(p.description ILIKE '%filtre%' OR p.description ILIKE '%filter%' OR p.normalized_description ILIKE '%filtre%')`);
        } else if (cat.includes('frein') || cat.includes('brake')) {
          conditions.push(`(p.description ILIKE '%frein%' OR p.description ILIKE '%brake%' OR p.description ILIKE '%plaquette%' OR p.description ILIKE '%disque%')`);
        } else if (cat.includes('suspension') || cat.includes('direction') || cat.includes('amortisseur')) {
          conditions.push(`(p.description ILIKE '%amortisseur%' OR p.description ILIKE '%suspension%' OR p.description ILIKE '%direction%' OR p.description ILIKE '%rotule%' OR p.description ILIKE '%triangle%')`);
        } else if (cat.includes('moteur') || cat.includes('distribution') || cat.includes('courroie')) {
          conditions.push(`(p.description ILIKE '%distribution%' OR p.description ILIKE '%courroie%' OR p.description ILIKE '%moteur%' OR p.description ILIKE '%galet%')`);
        } else if (cat.includes('refroidissement') || cat.includes('climatisation') || cat.includes('radiateur')) {
          conditions.push(`(p.description ILIKE '%refroidissement%' OR p.description ILIKE '%climatisation%' OR p.description ILIKE '%radiateur%' OR p.description ILIKE '%pompe à eau%')`);
        } else if (cat.includes('electricite') || cat.includes('eclairage') || cat.includes('bougie')) {
          conditions.push(`(p.description ILIKE '%bougie%' OR p.description ILIKE '%phare%' OR p.description ILIKE '%alternateur%' OR p.description ILIKE '%démarreur%' OR p.description ILIKE '%ampoule%' OR p.description ILIKE '%bobine%')`);
        } else if (cat.includes('echappement')) {
          conditions.push(`(p.description ILIKE '%échappement%' OR p.description ILIKE '%echappement%' OR p.description ILIKE '%silencieux%' OR p.description ILIKE '%catalyseur%')`);
        } else if (cat.includes('carrosserie') || cat.includes('habitacle')) {
          conditions.push(`(p.description ILIKE '%carrosserie%' OR p.description ILIKE '%habitacle%' OR p.description ILIKE '%rétroviseur%' OR p.description ILIKE '%lève-vitre%')`);
        }
      }

      // 2. Search filtering (multi-word, brand, sku, part number, OE number)
      if (filters.search) {
        const rawSearch = filters.search.trim();
        const cleanSku = rawSearch.replace(/[^a-zA-Z0-9]/g, '');
        
        params.push(`%${rawSearch}%`);
        const pTerm = `$${pIdx++}`;
        
        let skuClause = '';
        if (cleanSku.length >= 3) {
          params.push(`%${cleanSku}%`);
          const pSku = `$${pIdx++}`;
          skuClause = ` OR regexp_replace(upper(a.data_supplier_article_number), '[^A-Z0-9]', '', 'g') ILIKE ${pSku} OR oe.oe_nbr_clean ILIKE ${pSku}`;
        }

        conditions.push(`(
          a.data_supplier_article_number ILIKE ${pTerm}
          OR s.matchcode ILIKE ${pTerm}
          OR p.description ILIKE ${pTerm}
          OR a.description ILIKE ${pTerm}
          ${skuClause}
        )`);
      }

      // 3. Brand filtering
      if (filters.brands?.length) {
        const brandNames = filters.brands.map(b => b.replace(/-/g, ' '));
        params.push(brandNames);
        conditions.push(`s.matchcode = ANY($${pIdx++}::text[])`);
      } else if (filters.brandSlug) {
        params.push(filters.brandSlug.replace(/-/g, ' '));
        conditions.push(`s.matchcode ILIKE $${pIdx++}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      params.push(limit);
      const pLimit = `$${pIdx++}`;
      params.push(skip);
      const pSkip = `$${pIdx++}`;

      const query = `
        WITH clean_oe AS (
          SELECT article_id, regexp_replace(upper(oe_nbr), '[^A-Z0-9]', '', 'g') AS oe_nbr_clean
          FROM tecdoc.article_oe_numbers
        )
        SELECT DISTINCT a.id, a.data_supplier_article_number, a.supplier, s.matchcode AS brand_name,
               p.description AS product_type, a.description, a.picture_name, a.price, a.stockQty
        FROM tecdoc.articles a
        JOIN tecdoc.suppliers s ON s.id = a.supplier
        LEFT JOIN tecdoc.products p ON p.id = a.current_product
        LEFT JOIN clean_oe oe ON oe.article_id = a.id
        ${whereClause}
        ORDER BY a.id ASC
        LIMIT ${pLimit} OFFSET ${pSkip}
      `;

      const countQuery = `
        WITH clean_oe AS (
          SELECT article_id, regexp_replace(upper(oe_nbr), '[^A-Z0-9]', '', 'g') AS oe_nbr_clean
          FROM tecdoc.article_oe_numbers
        )
        SELECT COUNT(DISTINCT a.id) as total
        FROM tecdoc.articles a
        JOIN tecdoc.suppliers s ON s.id = a.supplier
        LEFT JOIN tecdoc.products p ON p.id = a.current_product
        LEFT JOIN clean_oe oe ON oe.article_id = a.id
        ${whereClause}
      `;

      const [rows, countRows] = (await Promise.all([
        this.prismaRead.db.$queryRawUnsafe(query, ...params),
        this.prismaRead.db.$queryRawUnsafe(countQuery, ...params.slice(0, -2)),
      ])) as [any[], any[]];

      const items = rows.map((r) => this.serializeTecdocArticle(r));
      const total = Number(countRows[0]?.total || 0);

      return { items, total };
    } catch (err) {
      console.warn('[ProductsService.findTecdocArticles] TecDoc query skipped/error:', (err as Error).message);
      return { items: [], total: 0 };
    }
  }

  async findBySlug(slug: string) {
    return this.cache.wrap(
      `products:slug:${slug}`,
      async () => {
        const product = await this.prismaRead.db.product.findUnique({
          where: { slug },
          include: {
            ...this.buildInclude(),
            compatibilities: {
              include: { vehicleModel: { include: { make: true } } },
            },
          },
        });
        if (product) return this.serialize(product);

        // TecDoc fallback
        try {
          const tecdocArticles: any[] = (await this.prismaRead.db.$queryRawUnsafe(`
            SELECT a.id, a.data_supplier_article_number, a.supplier, s.matchcode AS brand_name,
                   p.description AS product_type, a.description
            FROM tecdoc.articles a
            JOIN tecdoc.suppliers s ON s.id = a.supplier
            LEFT JOIN tecdoc.products p ON p.id = a.current_product
            WHERE a.data_supplier_article_number = $1
               OR LOWER(REGEXP_REPLACE(CONCAT(s.matchcode, '-', a.data_supplier_article_number), '[^a-zA-Z0-9]+', '-', 'g')) = $2
            LIMIT 1
          `, slug.toUpperCase(), slug.toLowerCase())) as any[];

          if (tecdocArticles.length > 0) {
            const item = tecdocArticles[0];
            const [oeRows, attrRows, vehRows]: [any[], any[], any[]] = (await Promise.all([
              this.prismaRead.db.$queryRawUnsafe(`
                SELECT m.matchcode as manufacturer, oe.oe_nbr
                FROM tecdoc.article_oe_numbers oe
                LEFT JOIN tecdoc.manufacturers m ON m.id = oe.manufacturer
                WHERE oe.article_id = $1
                LIMIT 50
              `, item.id),
              this.prismaRead.db.$queryRawUnsafe(`
                SELECT display_title as name, display_value as value
                FROM tecdoc.article_attributes
                WHERE article_id = $1
              `, item.id),
              this.prismaRead.db.$queryRawUnsafe(`
                SELECT DISTINCT m.matchcode AS make, mo.description AS model, pc.description AS trim,
                       pc.date_from AS "yearFrom", pc.date_to AS "yearTo"
                FROM tecdoc.tree_node_products tnp
                JOIN tecdoc.passengercars pc ON pc.id = tnp.item_id
                JOIN tecdoc.models mo ON mo.id = pc.model_id
                JOIN tecdoc.manufacturers m ON m.id = mo.manufacturer_id
                WHERE tnp.product_id = (SELECT current_product FROM tecdoc.articles WHERE id = $1)
                LIMIT 30
              `, item.id),
            ])) as [any[], any[], any[]];

            return this.serializeTecdocArticle(item, { oeRows, attrRows, vehRows });
          }
        } catch {
          // Fallback
        }

        return null;
      },
      CacheService.TTL.PRODUCT_SLUG,
    );
  }

  serializeTecdocArticle(r: any, extra?: { oeRows?: any[]; attrRows?: any[]; vehRows?: any[] }) {
    const slug = `${r.brand_name}-${r.data_supplier_article_number}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const name = `${r.brand_name} ${r.data_supplier_article_number} - ${r.product_type || 'Pièce détachée'}`;
    
    // Deterministic realistic pricing if price is 0
    let price = r.price !== null && r.price !== undefined && Number(r.price) > 0 ? Number(r.price) : 0;
    if (price === 0) {
      const hash = Math.abs((Number(r.id || 1) * 2654435761) ^ (Number(r.supplier || 1) * 2246822519)) % 140 + 35;
      price = +(hash).toFixed(3);
    }
    const stockQty = r.stockQty !== null && r.stockQty !== undefined && Number(r.stockQty) > 0 ? Number(r.stockQty) : 10;

    let imageUrl = `/images/${r.supplier}_${r.data_supplier_article_number?.trim().replace(/\s+/g, '_')}_1.webp`;
    if (r.picture_name) {
      const cleanPic = r.picture_name.trim();
      if (cleanPic.startsWith('http://') || cleanPic.startsWith('https://')) {
        imageUrl = cleanPic;
      } else if (cleanPic.startsWith('/')) {
        imageUrl = cleanPic;
      } else {
        imageUrl = `/images/${cleanPic}`;
      }
    }

    const desc = r.description || `Pièce d'origine ${r.brand_name} Référence ${r.data_supplier_article_number}. Qualité équipementier certifiée.`;

    return {
      id: `tecdoc-${r.id}`,
      slug,
      name,
      sku: r.data_supplier_article_number || '',
      articleNumber: r.data_supplier_article_number || '',
      description: desc,
      shortDescription: desc.slice(0, 160),
      brandId: r.brand_name || '',
      brand: {
        id: r.brand_name || '',
        name: r.brand_name || '',
        slug: (r.brand_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logo: null,
      },
      categoryId: r.product_type || 'auto-pieces-rechange',
      category: {
        id: r.product_type || 'auto-pieces-rechange',
        name: r.product_type || 'Pièces de rechange',
        slug: (r.product_type || 'auto-pieces-rechange').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
      isPublished: true,
      isFeatured: false,
      isBestSeller: false,
      isNew: false,
      isPromo: false,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: [imageUrl],
      variants: [
        {
          id: `var-tecdoc-${r.id}`,
          productId: `tecdoc-${r.id}`,
          volume: '1 Pièce',
          imageUrl: null,
          priceHT: +(price / 1.19).toFixed(3),
          priceTTC: price,
          stock: stockQty,
          sku: r.data_supplier_article_number || '',
          status: 'in_stock',
          supplierName: r.brand_name || '',
          warehouse: 'Principal',
        },
      ],
      specs: null,
      compatibility: (extra?.vehRows || []).map((v) => ({
        id: `compat-${v.make}-${v.model}-${v.trim}`,
        productId: `tecdoc-${r.id}`,
        make: v.make || '',
        model: v.model || '',
        yearFrom: v.yearFrom,
        yearTo: v.yearTo,
        engine: v.trim,
      })),
      sourcing: [],
      compatibilities: (extra?.vehRows || []).map((v) => ({
        id: `compat-${v.make}-${v.model}-${v.trim}`,
        vehicleModel: {
          id: v.model,
          name: v.model,
          slug: v.model.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          make: {
            id: v.make,
            name: v.make,
            slug: v.make.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          },
        },
        engineCode: v.trim,
        yearFrom: v.yearFrom,
        yearTo: v.yearTo,
      })),
      oeNumbers: extra?.oeRows || [],
      attributes: extra?.attrRows || [],
      tags: [],
    };
  }

  /** Call after any admin write to this product to purge stale cache. */
  async invalidateProduct(slug: string) {
    await Promise.all([
      this.cache.del(`products:slug:${slug}`),
      this.cache.delPattern('products:list:*'),
      this.cache.delPattern('products:best-sellers:*'),
      this.cache.delPattern('products:new:*'),
      this.cache.delPattern('products:facets:*'),
    ]);
  }

  async findBestSellers(limit = 8) {
    return this.cache.wrap(
      `products:best-sellers:${limit}`,
      () => this._findBestSellers(limit),
      CacheService.TTL.BEST_SELLERS,
    );
  }

  private async _findBestSellers(limit = 8) {
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const topProductIds: string[] = [];

      try {
        const rows = await this.prismaRead.db.$queryRaw<Array<{ productid: string }>>`
          SELECT oi."productId" AS productid, SUM(oi.quantity)::int AS totalsold
          FROM public."OrderItem" oi
          INNER JOIN public."Order" o ON oi."orderId" = o.id
          WHERE o.status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')
            AND o."createdAt" >= ${ninetyDaysAgo}
          GROUP BY oi."productId"
          ORDER BY totalsold DESC, oi."productId" DESC
          LIMIT ${limit}
        `;
        topProductIds.push(
          ...rows
            .map((r) => r.productid)
            .filter((id): id is string => id != null),
        );
      } catch {
        // Safe fallback if public orders are empty
      }

      if (topProductIds.length < limit) {
        const fallbackLimit = limit - topProductIds.length;
        const fallback = await this.prismaRead.db.product.findMany({
          where: {
            isPublished: true,
            ...(topProductIds.length > 0 ? { id: { notIn: topProductIds } } : {}),
          },
          include: this.buildInclude(),
          take: fallbackLimit,
          orderBy: { createdAt: 'desc' },
        });
        topProductIds.push(...fallback.map((p) => p.id));
      }

      if (topProductIds.length > 0) {
        const products = await this.prismaRead.db.product.findMany({
          where: { id: { in: topProductIds }, isPublished: true },
          include: this.buildInclude(),
        });
        const map = new Map(products.map((p) => [p.id, p]));
        const ordered = topProductIds
          .map((id) => map.get(id))
          .filter((p): p is NonNullable<typeof p> => p != null);

        if (ordered.length > 0) {
          return ordered.map((p) => this.serialize(p));
        }
      }
      return [];
    } catch (err) {
      console.error('Error in _findBestSellers:', err);
      return [];
    }
  }

  async findNew(limit = 8) {
    return this.cache.wrap(
      `products:new:${limit}`,
      async () => {
        try {
          const products = await this.prismaRead.db.product.findMany({
            where: { isPublished: true },
            include: this.buildInclude(),
            take: limit,
            orderBy: { createdAt: 'desc' },
          });
          return products.map((p) => this.serialize(p));
        } catch (err) {
          console.error('Error in findNew:', err);
          return [];
        }
      },
      CacheService.TTL.NEW_ARRIVALS,
    );
  }

  async findRelated(id: string, limit = 6) {
    try {
      const product = await this.prismaRead.db.product.findUnique({
        where: { id },
        select: { categoryId: true, brandId: true },
      });
      if (product) {
        const related = await this.prismaRead.db.product.findMany({
          where: {
            isPublished: true,
            id: { not: id },
            OR: [{ categoryId: product.categoryId }, { brandId: product.brandId }],
          },
          include: this.buildInclude(),
          take: limit,
          orderBy: { createdAt: 'desc' },
        });
        return related.map((p) => this.serialize(p));
      }
      return [];
    } catch (err) {
      console.error('Error in findRelated:', err);
      return [];
    }
  }

  async getFacets(filters: ProductFilters) {
    const cacheKey = `products:facets:${JSON.stringify({ cat: filters.categorySlug, search: filters.search })}`;
    return this.cache.wrap(
      cacheKey,
      () => this._getFacets(filters),
      CacheService.TTL.FACETS,
    );
  }

  private async _getFacets(filters: ProductFilters) {
    const where: Prisma.ProductWhereInput = { isPublished: true };
    const andConditions: Prisma.ProductWhereInput[] = [];

    if (filters.categorySlug) {
      const categoryIds = await this.resolveCategoryIds(filters.categorySlug);
      if (categoryIds.length > 0) {
        where.categoryId = { in: categoryIds };
      }
    }
    if (filters.search) {
      const terms = filters.search.trim().split(/\s+/).filter(Boolean);
      for (const term of terms) {
        const viscMatch = term.replace(/[\s-]/g, '').match(/^(\d+w)(\d+)$/i);
        const viscAlt = viscMatch ? `${viscMatch[1].toUpperCase()}-${viscMatch[2]}` : term;
        andConditions.push({
          OR: [
            { nameFr: { contains: term, mode: 'insensitive' } },
            { nameFr: { contains: viscAlt, mode: 'insensitive' } },
            { brand: { name: { contains: term, mode: 'insensitive' } } },
            { category: { nameFr: { contains: term, mode: 'insensitive' } } },
            { specs: { viscosity: { contains: term, mode: 'insensitive' } } },
            { specs: { viscosity: { contains: viscAlt, mode: 'insensitive' } } },
          ],
        });
      }
    }
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }
    // Brand and viscosity selections are intentionally NOT applied here so the
    // facet lists stay stable while the user multi-selects brands.
    const variantSome: Prisma.ProductVariantWhereInput = {};
    if (filters.inStockOnly) variantSome.stockQty = { gt: 0 };
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      variantSome.price = {
        ...(filters.priceMin !== undefined ? { gte: filters.priceMin } : {}),
        ...(filters.priceMax !== undefined ? { lte: filters.priceMax } : {}),
      };
    }
    if (Object.keys(variantSome).length > 0) {
      where.variants = { some: variantSome };
    }

    const [variantGroups, viscosityGroups, brandGroups, categoryGroups, priceAgg, availableBrands] = await Promise.all([
      this.prismaRead.db.productVariant.groupBy({
        by: ['volume'],
        where: { product: where },
        _count: { volume: true },
      }),
      this.prismaRead.db.productSpecs.groupBy({
        by: ['viscosity'],
        where: { product: where },
        _count: { viscosity: true },
      }),
      this.prismaRead.db.product.groupBy({
        by: ['brandId'],
        where,
        _count: { brandId: true },
      }),
      this.prismaRead.db.product.groupBy({
        by: ['categoryId'],
        where,
        _count: { categoryId: true },
      }),
      this.prismaRead.db.productVariant.aggregate({
        _min: { price: true },
        _max: { price: true },
        where: { product: where },
      }),
      this.prismaRead.db.brand.findMany({
        orderBy: { name: 'asc' },
      })
    ]);
    const volumes = variantGroups
      .filter((v) => v.volume)
      .map((v) => ({
        volume: v.volume,
        count: v._count.volume,
      }))
      .sort((a, b) => {
        const numA = parseFloat(a.volume) || 0;
        const numB = parseFloat(b.volume) || 0;
        return numA - numB;
      });

    const viscosities = viscosityGroups
      .filter((v) => v.viscosity)
      .map((v) => ({
        value: v.viscosity as string,
        count: v._count.viscosity,
      }))
      .sort((a, b) => {
        const numA = parseFloat(a.value) || 0;
        const numB = parseFloat(b.value) || 0;
        return numA - numB || a.value.localeCompare(b.value);
      });

    const brandCounts = new Map(
      brandGroups.map((group) => [group.brandId, group._count.brandId]),
    );

    const seenBrandNames = new Set<string>();
    const brands = availableBrands
      .filter((brand) => {
        const normalizedName = brand.name.trim().toLocaleLowerCase();
        if (
          /^(supplier|unknown|api gl5|api gl-5|générique|generique)\b/i.test(brand.name) ||
          seenBrandNames.has(normalizedName)
        ) {
          return false;
        }
        seenBrandNames.add(normalizedName);
        return true;
      })
      .map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        count: brandCounts.get(brand.id) ?? 0,
      }))
      .filter((b) => b.count > 0)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    // Roll up category counts across category hierarchy
    const allCategories = await this.prismaRead.db.category.findMany({
      select: { id: true, slug: true, parentId: true },
    });
    const directCountMap = new Map<string, number>();
    for (const g of categoryGroups) {
      if (g.categoryId) {
        directCountMap.set(g.categoryId, g._count.categoryId);
      }
    }
    const childrenMap = new Map<string, string[]>();
    for (const c of allCategories) {
      if (c.parentId) {
        if (!childrenMap.has(c.parentId)) childrenMap.set(c.parentId, []);
        childrenMap.get(c.parentId)!.push(c.id);
      }
    }
    function getSubtreeCount(catId: string): number {
      let total = directCountMap.get(catId) || 0;
      const children = childrenMap.get(catId) || [];
      for (const childId of children) {
        total += getSubtreeCount(childId);
      }
      return total;
    }

    const facetAliasGroups: Record<string, string[]> = {
      'moto-huiles': ['moto-huiles', 'huiles-moto-2t-4t', 'moto-huile-moteur', 'karting-huiles'],
      'moto-huile-boite': ['moto-huile-boite'],
      'moto-huile-fourche': ['moto-huile-fourche', 'huiles-fourche'],
      'moto-lubrifiants-chaine': ['moto-lubrifiants-chaine', 'entretien-chaine', 'additifs-moto'],
      'moto-karting': ['moto-karting', 'moto', 'karting', 'huiles-moto-2t-4t', 'entretien-chaine', 'additifs-moto', 'huiles-fourche'],
      'auto-filtres': ['auto-filtres', 'filtres', 'filtres-air', 'filtres-huile', 'filtres-carburant', 'filtres-habitacle'],
      'auto-electricite-eclairage': ['auto-electricite-eclairage', 'batteries', 'essuie-glaces'],
      'additifs': ['additifs', 'additifs-huile', 'additifs-carburant', 'additif-diesel', 'additif-essence', 'additif-huile'],
      'direction-assistee': ['direction-assistee'],
      'liquide-de-frein': ['liquide-de-frein', 'liquide-frein'],
      'liquides-auto': ['liquides-auto', 'antigel-refroidissement', 'adblue', 'refroidissement'],
      'huiles-moteur': ['huiles-moteur', 'huiles-moteur-auto', 'huiles-moteur-specifiques', 'auto-synthese', 'auto-semi', 'auto-minerale'],
      'huile-de-boite': ['huile-de-boite', 'huiles-boite-transmission'],
      'marine': ['marine', 'marine-moteurs', 'marine-hydraulique', 'marine-graisses', 'marine-huiles-lubrifiants'],
    };

    const categoryBySlug = new Map<string, typeof allCategories[0]>();
    for (const c of allCategories) {
      categoryBySlug.set(c.slug, c);
    }

    const categoryCounts = allCategories.map((c) => {
      const aliases = facetAliasGroups[c.slug] || [c.slug];
      let total = 0;
      const seen = new Set<string>();
      for (const a of aliases) {
        const targetCat = categoryBySlug.get(a);
        if (targetCat && !seen.has(targetCat.id)) {
          seen.add(targetCat.id);
          total += getSubtreeCount(targetCat.id);
        }
      }
      return {
        id: c.id,
        slug: c.slug,
        count: Math.max(total, getSubtreeCount(c.id)),
      };
    });

    return {
      volumes,
      brands,
      viscosities,
      categoryCounts,
      priceRange: {
        min: Math.floor(priceAgg._min?.price ?? 0),
        max: Math.ceil(priceAgg._max?.price ?? 0),
      },
    };
  }

  async findOilRecommendations(dto: OilRecommendationsDto) {
    const andConditions: Prisma.ProductSpecsScalarWhereWithAggregatesInput[] =
      [];

    if (dto.cylinders > 0) {
      andConditions.push({
        OR: [{ minCylinders: null }, { minCylinders: { lte: dto.cylinders } }],
      });
      andConditions.push({
        OR: [{ maxCylinders: null }, { maxCylinders: { gte: dto.cylinders } }],
      });
    }

    if (dto.power > 0) {
      andConditions.push({
        OR: [{ minPower: null }, { minPower: { lte: dto.power } }],
      });
      andConditions.push({
        OR: [{ maxPower: null }, { maxPower: { gte: dto.power } }],
      });
    }

    const specsWhere: Prisma.ProductSpecsWhereInput = {
      vehicleTypes: { has: dto.vehicleType },
      fuelTypes: { has: dto.fuelType },
    };

    if (andConditions.length > 0) {
      specsWhere.AND = andConditions;
    }

    const products = await this.prismaRead.db.product.findMany({
      where: {
        isPublished: true,
        specs: specsWhere,
      },
      include: this.buildInclude(),
    });

    const scored = products.map((p) => ({
      product: p,
      specificity: calcSpecificity(p.specs),
    }));

    scored.sort((a, b) => b.specificity - a.specificity);

    const data = scored.map((s) => this.serialize(s.product));
    return { data, total: data.length };
  }

  private buildOrderBy(
    sortBy?: string,
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case 'newest':
        return { createdAt: 'desc' };
      case 'price_asc':
        return { variants: { _count: 'asc' } };
      case 'price_desc':
        return { variants: { _count: 'desc' } };
      default:
        return { createdAt: 'desc' };
    }
  }

  serialize(product: any) {
    if (!product) return null;

    const images = Array.isArray(product.images)
      ? product.images
          .map((img: any) => (typeof img === 'string' ? img : img?.url))
          .filter(Boolean)
      : [];

    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    const rating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
        : 5.0;

    const variants = Array.isArray(product.variants)
      ? product.variants.map((v: any) => ({
          id: v.id,
          productId: v.productId,
          volume: v.volume || '1 Pièce',
          imageUrl: v.imageUrl ?? (images[0] || null),
          priceHT: +(Number(v.price || 0) / 1.19).toFixed(3),
          priceTTC: Number(v.price || 0),
          stock: Number(v.stockQty ?? 0),
          sku: v.skuVariant || v.sku || '',
          status:
            Number(v.stockQty ?? 0) === 0
              ? 'out_of_stock'
              : Number(v.stockQty ?? 0) < 5
                ? 'low_stock'
                : 'in_stock',
        }))
      : [];

    const specs = product.specs
      ? {
          viscosity: product.specs.viscosity || undefined,
          apiSpec: product.specs.apiStandard || undefined,
          aceaSpec: product.specs.aeceaStandard || undefined,
          jasoSpec: product.specs.jasoStandard || undefined,
          oemApprovals: product.specs.OEMApprovals
            ? String(product.specs.OEMApprovals)
                .split(';')
                .map((approval: string) => approval.trim())
                .filter(Boolean)
            : [],
          dpfCompatible: product.specs.DPFCompatible ?? undefined,
          turboCompatible: product.specs.TurboCompatible ?? undefined,
          hybridCompatible: product.specs.HybridCompatible ?? undefined,
          vehicleTypes: Array.isArray(product.specs.vehicleTypes)
            ? product.specs.vehicleTypes.map((t: string) => String(t).toLowerCase())
            : [],
          fuelTypes: Array.isArray(product.specs.fuelTypes)
            ? product.specs.fuelTypes.map((f: string) => String(f).toLowerCase())
            : [],
          minCylinders: product.specs.minCylinders || undefined,
          maxCylinders: product.specs.maxCylinders || undefined,
          minPower: product.specs.minPower || undefined,
          maxPower: product.specs.maxPower || undefined,
          type: product.specs.isFullySynth
            ? 'full_synth'
            : product.specs.isSemiSynth
              ? 'semi_synth'
              : 'mineral',
        }
      : null;

    const compatibility = Array.isArray(product.compatibilities)
      ? product.compatibilities.map((c: any) => ({
          id: c.id,
          productId: c.productId,
          make: c.vehicleModel?.make?.name || '',
          model: c.vehicleModel?.name || '',
          yearFrom: c.yearFrom,
          yearTo: c.yearTo,
          engine: c.engineCode,
        }))
      : [];

    return {
      id: product.id,
      slug: product.slug,
      name: product.nameFr || product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      shortDescription: product.shortDescription
        ? product.shortDescription
        : (product.description ? product.description.replace(/^Description\s*:?\s*/i, '').slice(0, 180).trim() : ''),
      brandId: product.brandId || '',
      brand: product.brand
        ? {
            id: product.brand.id,
            name: product.brand.name,
            slug: product.brand.slug,
            logo: product.brand.logoUrl,
          }
        : null,
      categoryId: product.categoryId || '',
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.nameFr || product.category.name,
            slug: product.category.slug,
          }
        : null,
      images,
      variants,
      specs,
      compatibility,
      isBestSeller: Boolean(product.isFeatured),
      isNew: product.createdAt
        ? Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
        : false,
      isPromo: false,
      isFeatured: Boolean(product.isFeatured),
      rating: Math.round(rating * 10) / 10,
      reviewCount: reviews.length,
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
      tags: [],
    };
  }
}
