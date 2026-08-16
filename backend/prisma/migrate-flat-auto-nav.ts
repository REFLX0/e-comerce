// backend/prisma/migrate-flat-auto-nav.ts
// ---------------------------------------------------------------------------
// One-off migration: flatten the Automobile nav tree to the agreed 5-item
// structure (Huile moteur · Liquide de frein · Liquide de direction ·
// Huile de boîte · Additifs) and rebrand the Karting section header.
//
// NOTE: karting was already merged under "Moto & Karting" by manual DB edits
// (moto-huiles deleted, products redistributed) — this script does NOT touch
// those; it only:
//   1. reparents huiles-moteur, additifs, direction-assistee → automobile (flat)
//   2. sets the flat 5 sort order (0..4) + pushes the two legacy wrappers to 5/6
//   3. renames "Huiles moteur" → "Huile moteur" (agreed flat label)
//   4. renames karting-pieces-consommables → "Karting" (section header under Moto)
//
//   npx tsx prisma/migrate-flat-auto-nav.ts          # dry-run plan (no writes)
//   npx tsx prisma/migrate-flat-auto-nav.ts --apply  # apply in ONE transaction
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const APPLY = process.argv.includes('--apply')

const AUTOMOBILE_SLUG = 'automobile'

// slug → { parentSlug?, sortOrder?, nameFr? }
const PLAN: Record<string, { parentSlug?: string; sortOrder?: number; nameFr?: string }> = {
  'huiles-moteur': { parentSlug: AUTOMOBILE_SLUG, sortOrder: 0, nameFr: 'Huile moteur' },
  'liquide-de-frein': { sortOrder: 1 },
  'direction-assistee': { parentSlug: AUTOMOBILE_SLUG, sortOrder: 2 },
  'huile-de-boite': { sortOrder: 3 },
  additifs: { parentSlug: AUTOMOBILE_SLUG, sortOrder: 4 },
  'auto-pieces-rechange': { sortOrder: 5 },
  'auto-huiles-lubrifiants': { sortOrder: 6 },
  'karting-pieces-consommables': { nameFr: 'Karting' },
}

const EXPECTED_ROOTS = ['automobile', 'moto-karting', 'marine']

async function main() {
  const categories = await prisma.category.findMany()
  const bySlug = new Map(categories.map((c) => [c.slug, c]))

  const automobile = bySlug.get(AUTOMOBILE_SLUG)
  if (!automobile) throw new Error(`Missing root category "${AUTOMOBILE_SLUG}"`)

  for (const [slug, change] of Object.entries(PLAN)) {
    const cat = bySlug.get(slug)
    if (!cat) throw new Error(`Missing category "${slug}"`)
    const next = {
      parentId: change.parentSlug ? (change.parentSlug === AUTOMOBILE_SLUG ? automobile.id : bySlug.get(change.parentSlug)?.id) : undefined,
      sortOrder: change.sortOrder,
      nameFr: change.nameFr,
    }
    console.log(
      `UPDATE ${slug}  parent: ${cat.parentId ?? 'ROOT'}→${next.parentId ?? '(unchanged)'}  sort: ${cat.sortOrder}→${next.sortOrder ?? '(unchanged)'}  name: ${cat.nameFr}→${next.nameFr ?? '(unchanged)'}`,
    )
  }

  if (!APPLY) {
    console.log('\nPLAN  ready — re-run with --apply to execute')
    return
  }

  const productCountBefore = await prisma.product.count()
  const categoryCountBefore = await prisma.category.count()

  await prisma.$transaction(
    async (tx) => {
      for (const [slug, change] of Object.entries(PLAN)) {
        const data: { parentId?: string; sortOrder?: number; nameFr?: string } = {}
        if (change.parentSlug) data.parentId = automobile.id
        if (change.sortOrder !== undefined) data.sortOrder = change.sortOrder
        if (change.nameFr) data.nameFr = change.nameFr
        await tx.category.update({ where: { slug }, data })
        console.log(`✔ ${slug} updated`)
      }
    },
    { timeout: 120_000 },
  )

  // ── Assertions ────────────────────────────────────────────────────
  const productCountAfter = await prisma.product.count()
  if (productCountBefore !== productCountAfter) {
    throw new Error(`ASSERTION FAILED: product count changed ${productCountBefore} → ${productCountAfter}`)
  }
  const categoryCountAfter = await prisma.category.count()
  if (categoryCountBefore !== categoryCountAfter) {
    throw new Error(`ASSERTION FAILED: category count changed ${categoryCountBefore} → ${categoryCountAfter}`)
  }
  const roots = await prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: 'asc' } })
  const rootSlugs = roots.map((r) => r.slug)
  if (JSON.stringify(rootSlugs) !== JSON.stringify(EXPECTED_ROOTS)) {
    throw new Error(`ASSERTION FAILED: roots are [${rootSlugs.join(', ')}], expected [${EXPECTED_ROOTS.join(', ')}]`)
  }

  console.log('')
  console.log(`APPLIED ✅ · Products ${productCountBefore} → ${productCountAfter} (unchanged ✓) · Categories ${categoryCountBefore} → ${categoryCountAfter} (unchanged ✓) · Roots: ${rootSlugs.join(' | ')}`)
}

main()
  .catch((err) => {
    console.error('FATAL:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())