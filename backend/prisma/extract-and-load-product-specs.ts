/**
 * extract-and-load-product-specs.ts
 *
 * Reads product data from the API export JSONs (all-oil-products.json + p2),
 * maps the API response field names → exact ProductSpecs Prisma model field names,
 * and upserts the result into ProductSpecs via Prisma.
 *
 * Run with:
 *   npx tsx prisma/extract-and-load-product-specs.ts [--apply] [--sample]
 *
 * Without --apply: dry-run only (prints to stdout).
 * With    --apply: writes records to the DB.
 * With    --sample: processes only the first 30 products.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiSpecs {
  viscosity?: string | null;
  apiSpec?: string | null;
  aceaSpec?: string | null;
  jasoSpec?: string | null;
  oemApprovals?: string[] | null;
  dpfCompatible?: boolean | null;
  turboCompatible?: boolean | null;
  hybridCompatible?: boolean | null;
  type?: string | null; // "mineral" | "semi-synthetic" | "fully-synthetic" etc.
}

interface ApiProduct {
  id: string;
  name: string;
  description: string;
  specs: ApiSpecs | null;
}

interface ApiResponse {
  data: ApiProduct[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Output schema (matches ProductSpecs Prisma model EXACTLY) ───────────────

interface ProductSpecsExtracted {
  productId: string;
  // Meta (for review only — not written to DB)
  productName: string;
  confidence: 'verified' | 'inferred' | 'uncertain — needs manual check';
  extractionNotes?: string;
  notAnEngineOil?: boolean;
  // ProductSpecs fields
  viscosity: string | null;
  apiStandard: string | null;
  aeceaStandard: string | null;  // NOTE: intentional "aecea" typo — matches DB schema
  jasoStandard: string | null;
  isFullySynth: boolean;
  isSemiSynth: boolean;
  isMinerale: boolean;
  DPFCompatible: boolean | null;
  TurboCompatible: boolean | null;
  HybridCompatible: boolean | null;
  OEMApprovals: string | null;
}

// ─── Helper: normalize viscosity ──────────────────────────────────────────────

function normalizeViscosity(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const compact = raw.replace(/[\s-]/g, '').toUpperCase();
  const match = compact.match(/^(\d+W)(\d+)$/);
  return match ? `${match[1]}-${match[2]}` : raw.trim();
}

// ─── Helper: normalize API standard ───────────────────────────────────────────

function normalizeApiStandard(raw: string | null | undefined): string | null {
  if (!raw || raw === 'N/A') return null;
  const v = raw.trim();
  // Ensure "API " prefix exists as stated in schema comment
  if (v.toUpperCase().startsWith('API ')) return v;
  return `API ${v}`;
}

// ─── Helper: determine synthesis type from description text ONLY ──────────────
// IMPORTANT: The DB "type" field (e.g. "mineral") is a broken seed default —
// do NOT read from it. Extract exclusively from explicit language in the
// product title/description. If nothing explicit is found, leave all three
// flags as false (fail-open, not fail-to-mineral).

function synthType(_ignoredDbType: string | null | undefined, description: string, name: string): {
  isFullySynth: boolean;
  isSemiSynth: boolean;
  isMinerale: boolean;
  confidence: 'verified' | 'inferred';
  notes?: string;
} {
  // Scan description + name only — strip accents for robust matching
  const normalizeAccents = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const src = normalizeAccents(`${description} ${name}`);

  // ── Fully synthetic ───────────────────────────────────────────────────────
  const fullySynthPatterns = [
    '100% synthetique', '100 % synthetique', '100% synthetic', '100 % synthetic',
    'fully synthetic', 'full synthetic', 'synthese totale', 'synthese 100',
    'fully-synthetic', 'pleinement synthetique',
    'advanced synthetic',          // common in our catalog descriptions
    'synthese avancee',
  ];
  if (fullySynthPatterns.some(p => src.includes(p))) {
    return { isFullySynth: true, isSemiSynth: false, isMinerale: false, confidence: 'inferred',
      notes: 'Inferred: explicit "fully synthetic" / "100% synthetic" language in description' };
  }

  // ── Semi-synthetic ────────────────────────────────────────────────────────
  const semiSynthPatterns = [
    'semi-synthetique', 'semi synthetique', 'semi-synthetic', 'semi synthetic',
    'technosynthetique', 'technosynthese', 'techno-synthese', 'techno synthetique',
    'synthese partielle', 'semi-synth',
  ];
  if (semiSynthPatterns.some(p => src.includes(p))) {
    return { isFullySynth: false, isSemiSynth: true, isMinerale: false, confidence: 'inferred',
      notes: 'Inferred: explicit semi-synthetic language in description' };
  }

  // ── Mineral ───────────────────────────────────────────────────────────────
  // Only flag as mineral if the description explicitly says it — never as a default
  const mineralPatterns = [
    'huile minerale', 'huile 100% minerale', 'mineral oil', 'purely mineral',
  ];
  if (mineralPatterns.some(p => src.includes(p))) {
    return { isFullySynth: false, isSemiSynth: false, isMinerale: true, confidence: 'inferred',
      notes: 'Inferred: explicit mineral language in description' };
  }

  // ── Nothing explicit found — all flags stay false ─────────────────────────
  return {
    isFullySynth: false, isSemiSynth: false, isMinerale: false, confidence: 'inferred',
    notes: 'Synthesis type not explicitly stated in listing — all flags left false',
  };
}

// ─── Helper: detect non-engine-oils ───────────────────────────────────────────

const NON_ENGINE_OIL_PATTERNS = [
  /liquide de frein/i,
  /brake fluid/i,
  /dot[\s-]?[45]/i,
  /liquide refroidissement/i,
  /coolant/i,
  /antigel/i,
  /\batf\b/i,
  /hydraulic/i,
  /direction assistee/i,
  /boite.*vitesse/i,
  /gearbox/i,
  /\btransmission\b/i,
  /graisse/i,
  /grease/i,
  /lubrifiant m-40/i,
  /wd-?40/i,
  /nettoyant/i,
  /cleaner/i,
  /degrippant/i,
  /adblue/i,
];

function isNonEngineOil(name: string, description: string): boolean {
  const text = `${name} ${description}`;
  return NON_ENGINE_OIL_PATTERNS.some(p => p.test(text));
}

// ─── Main extraction logic ────────────────────────────────────────────────────

function extractSpecs(product: ApiProduct): ProductSpecsExtracted {
  const base: ProductSpecsExtracted = {
    productId: product.id,
    productName: product.name,
    confidence: 'verified',
    viscosity: null,
    apiStandard: null,
    aeceaStandard: null,
    jasoStandard: null,
    isFullySynth: false,
    isSemiSynth: false,
    isMinerale: false,
    DPFCompatible: null,
    TurboCompatible: null,
    HybridCompatible: null,
    OEMApprovals: null,
  };

  // Non-engine-oil check
  if (isNonEngineOil(product.name, product.description)) {
    return { ...base, notAnEngineOil: true };
  }

  const s = product.specs;

  // If no specs object at all — attempt inference from title/description only
  if (!s) {
    base.confidence = 'uncertain — needs manual check';
    base.extractionNotes = 'No structured specs object in DB; all fields inferred from title/description only';

    const viscMatch = product.name.match(/(\d+W[\s-]?\d+)/i) ?? product.description.match(/(\d+W[\s-]?\d+)/i);
    if (viscMatch) {
      base.viscosity = normalizeViscosity(viscMatch[1]);
    }

    const synth = synthType(null, product.description, product.name);
    base.isFullySynth = synth.isFullySynth;
    base.isSemiSynth = synth.isSemiSynth;
    base.isMinerale = synth.isMinerale;
    if (synth.notes) base.extractionNotes += `; ${synth.notes}`;

    return base;
  }

  // ── Viscosity ─────────────────────────────────────────────────────────────
  base.viscosity = normalizeViscosity(s.viscosity);

  // ── API Standard ──────────────────────────────────────────────────────────
  base.apiStandard = normalizeApiStandard(s.apiSpec);

  // ── ACEA Standard ─────────────────────────────────────────────────────────
  // DB field is "aeceaStandard" — NOT "aceaStandard"
  if (s.aceaSpec && s.aceaSpec !== 'N/A') {
    const acea = s.aceaSpec.trim();
    base.aeceaStandard = acea.toUpperCase().startsWith('ACEA ') ? acea : `ACEA ${acea}`;
  }

  // ── JASO Standard ─────────────────────────────────────────────────────────
  if (s.jasoSpec) {
    base.jasoStandard = s.jasoSpec.trim();
  }

  // ── Boolean flags ─────────────────────────────────────────────────────────
  base.DPFCompatible = typeof s.dpfCompatible === 'boolean' ? s.dpfCompatible : null;
  base.TurboCompatible = typeof s.turboCompatible === 'boolean' ? s.turboCompatible : null;
  base.HybridCompatible = typeof s.hybridCompatible === 'boolean' ? s.hybridCompatible : null;

  // ── OEM Approvals ─────────────────────────────────────────────────────────
  // Preserve character-for-character — do NOT normalize codes
  if (s.oemApprovals && s.oemApprovals.length > 0) {
    base.OEMApprovals = s.oemApprovals.join('; ');
  }

  // ── Synthesis type ────────────────────────────────────────────────────────
  const synth = synthType(s.type, product.description, product.name);
  base.isFullySynth = synth.isFullySynth;
  base.isSemiSynth = synth.isSemiSynth;
  base.isMinerale = synth.isMinerale;
  base.confidence = synth.confidence;
  if (synth.notes) base.extractionNotes = synth.notes;

  return base;
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  const apply = process.argv.includes('--apply');
  const sampleOnly = process.argv.includes('--sample');

  const dataDir = path.join(__dirname, '..', '..', 'oil-finder-full-dataset');
  const files = ['all-oil-products.json', 'all-oil-products-p2.json'];

  const allProducts: ApiProduct[] = [];
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: Skipping missing file: ${filePath}`);
      continue;
    }
    const raw: ApiResponse = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    allProducts.push(...raw.data);
    console.log(`Loaded ${raw.data.length} products from ${file}`);
  }

  const products = sampleOnly ? allProducts.slice(0, 30) : allProducts;
  console.log(`\nProcessing ${products.length} products (${sampleOnly ? 'SAMPLE MODE' : 'FULL CATALOG'})...\n`);

  const extracted: ProductSpecsExtracted[] = products.map(extractSpecs);

  const nonEngineOils = extracted.filter(e => e.notAnEngineOil);
  const engineOils = extracted.filter(e => !e.notAnEngineOil);
  const noStructuredSpecs = engineOils.filter(e => e.confidence === 'uncertain — needs manual check');
  const withSpecs = engineOils.filter(e => e.confidence !== 'uncertain — needs manual check');

  console.log(`Summary:`);
  console.log(`  Total processed: ${extracted.length}`);
  console.log(`  Non-engine-oils (skipped): ${nonEngineOils.length}`);
  console.log(`  Engine oils with structured specs: ${withSpecs.length}`);
  console.log(`    confidence=verified: ${withSpecs.filter(e => e.confidence === 'verified').length}`);
  console.log(`    confidence=inferred: ${withSpecs.filter(e => e.confidence === 'inferred').length}`);
  console.log(`  Needs manual check (no structured specs): ${noStructuredSpecs.length}`);

  const preview = engineOils.slice(0, 30);
  console.log('\n--- SAMPLE OUTPUT (first 30 engine oils) ---\n');
  console.log(JSON.stringify(preview.map(e => ({
    productId: e.productId,
    productName: e.productName,
    viscosity: e.viscosity,
    apiStandard: e.apiStandard,
    aeceaStandard: e.aeceaStandard,
    jasoStandard: e.jasoStandard,
    isFullySynth: e.isFullySynth,
    isSemiSynth: e.isSemiSynth,
    isMinerale: e.isMinerale,
    DPFCompatible: e.DPFCompatible,
    TurboCompatible: e.TurboCompatible,
    HybridCompatible: e.HybridCompatible,
    OEMApprovals: e.OEMApprovals,
    confidence: e.confidence,
    extractionNotes: e.extractionNotes,
  })), null, 2));

  const outPath = path.join(dataDir, 'product-specs-extracted.json');
  fs.writeFileSync(outPath, JSON.stringify(engineOils, null, 2), 'utf8');
  console.log(`\nFull extracted output written to: ${outPath}`);

  if (nonEngineOils.length > 0) {
    console.log('\nSkipped (not engine oils):');
    nonEngineOils.forEach(p => console.log(`  - [${p.productId}] ${p.productName}`));
  }

  if (noStructuredSpecs.length > 0) {
    console.log('\nNeeds manual check (no structured specs in DB):');
    noStructuredSpecs.forEach(p => console.log(`  - [${p.productId}] ${p.productName} | viscosity=${p.viscosity ?? 'unknown'}`));
  }

  if (!apply) {
    console.log('\nDRY RUN: no changes written to DB. Re-run with --apply to commit.');
    return;
  }

  console.log('\nApplying to DB...');
  const prisma = new PrismaClient();
  let upserted = 0;
  let skippedDb = 0;

  for (const spec of engineOils) {
    if (!spec.viscosity && !spec.apiStandard && !spec.aeceaStandard && !spec.OEMApprovals) {
      skippedDb++;
      continue;
    }

    const product = await prisma.product.findUnique({ where: { id: spec.productId }, select: { id: true } });
    if (!product) {
      console.warn(`  Product not found in DB: ${spec.productId} (${spec.productName})`);
      skippedDb++;
      continue;
    }

    await prisma.productSpecs.upsert({
      where: { productId: spec.productId },
      create: {
        productId: spec.productId,
        viscosity: spec.viscosity,
        apiStandard: spec.apiStandard,
        aeceaStandard: spec.aeceaStandard,
        jasoStandard: spec.jasoStandard,
        isFullySynth: spec.isFullySynth,
        isSemiSynth: spec.isSemiSynth,
        isMinerale: spec.isMinerale,
        DPFCompatible: spec.DPFCompatible,
        TurboCompatible: spec.TurboCompatible,
        HybridCompatible: spec.HybridCompatible,
        OEMApprovals: spec.OEMApprovals,
      },
      update: {
        viscosity: spec.viscosity,
        apiStandard: spec.apiStandard,
        aeceaStandard: spec.aeceaStandard,
        jasoStandard: spec.jasoStandard,
        isFullySynth: spec.isFullySynth,
        isSemiSynth: spec.isSemiSynth,
        isMinerale: spec.isMinerale,
        DPFCompatible: spec.DPFCompatible,
        TurboCompatible: spec.TurboCompatible,
        HybridCompatible: spec.HybridCompatible,
        OEMApprovals: spec.OEMApprovals,
      },
    });
    upserted++;
    process.stdout.write(`\r  Upserted: ${upserted}`);
  }

  await prisma.$disconnect();
  console.log(`\n\nDone! Upserted ${upserted} ProductSpecs rows. Skipped ${skippedDb}.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
