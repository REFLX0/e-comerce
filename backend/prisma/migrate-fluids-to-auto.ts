// backend/prisma/migrate-fluids-to-auto.ts
// ---------------------------------------------------------------------------
// One-off migration: create the two flat fluid categories under Automobile
// and move the user-confirmed genuine fluid products into them.
//
//   npx tsx prisma/migrate-fluids-to-auto.ts          # dry-run plan (no writes)
//   npx tsx prisma/migrate-fluids-to-auto.ts --apply  # apply in ONE transaction
//
// Confirmed move list (user-approved, 2026-08-16):
//   → "Liquide de frein" (liquide-de-frein) [NEW, flat under automobile]
//     - Liquide de frein Schnieder DOT-4          (from auto-freinage)
//     - MANNOL Liquide de frein Dot 3             (from huiles-moteur)
//   → "Huile de boîte" (huile-de-boite) [NEW, flat under automobile]
//     - MANNOL ATF AG60                           (from additifs)
//     - MANNOL Huile boîte auto ATF SP-III 1L     (from additifs)
//     - MANNOL Huile de Boîte automatique ATF Dexron 3 1L (from additifs)
//     - MANNOL Huile de boîte auto Toyota ATF WS  (from additifs)
//     - MANNOL huile de boite MTF-3 75W 1L        (from additifs)
//     - liqui-moly Top Tec ATF 1800               (from liquides-auto)
//     - Huile; boîte de vitesses à double embrayage (DSG) FEBI BILSTEIN 39070/39071,
//       ROWE 25067-0010-99                        (from transmission)
//     - MANNOL DCT Fluid 8202, CVT NS-3 1L, Huile pour engrenages Maxpower 75w-140,
//       Hypoid 80W-90 GL-4/GL-5 LS, huile de boîte de vitesse manuelle FWD 75W-85
//                                                 (from additifs)
//   → "Liquide de direction" (direction-assistee) [EXISTS — product only]
//     - Huile pour direction assistée BENZOL ATF DEX-III (from auto-suspension-direction)
//
// HELD (duplicate investigation, NOT moved by this run):
//   - mannol-huile-de-boite-auto-atf-ws (MAN8217)  — suspected dup of Toyota ATF WS
//   - mannol-huile-de-boite-manuelle-mtf-3-75w-1l (MAN8115) — suspected dup of MTF-3 75W
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const APPLY = process.argv.includes('--apply')

const DUMPS_DIR = path.join(__dirname, 'dumps')

const AUTOMOBILE_SLUG = 'automobile'

const NEW_CATEGORIES = [
  { slug: 'liquide-de-frein', nameFr: 'Liquide de frein' },
  { slug: 'huile-de-boite', nameFr: 'Huile de boîte' },
] as const

// target category slug → product ids
const MOVES: Record<string, string[]> = {
  'liquide-de-frein': [
    'd6f76ffc-a89a-49ae-9ce2-5b547a7f8f98', // Liquide de frein Schnieder DOT-4
    'cmssfg6aj00d3mgi8x6j8pgvn', // MANNOL Liquide de frein Dot 3
  ],
  'huile-de-boite': [
    'cmssfg68t00cbmgi8o949qdgd', // MANNOL ATF AG60
    'cmssfg69a00cjmgi8l6f0m5oc', // MANNOL Huile boîte auto ATF SP-III 1L
    'cmssfk5k40046mgk7ffoi0ktb', // MANNOL Huile de Boîte automatique ATF Dexron 3 1L
    'cmssfk5iz003umgk77odi7inl', // MANNOL Huile de boîte auto Toyota ATF WS
    'cmssfk5jb003ymgk7yfsfjs7b', // MANNOL huile de boite MTF-3 75W 1L
    'cmssfg5jy003mmgi8a35izdqk', // liqui-moly Top Tec ATF 1800
    'c6a25ee5-3f39-4d57-b138-1601a0f0e91a', // DSG FEBI BILSTEIN 39070
    '94997e05-75ac-4a69-acad-aa7347154fa1', // DSG FEBI BILSTEIN 39071
    '33c57354-14a8-4562-8a7b-0c356f24f66d', // DSG ROWE 25067-0010-99
    'cmssfg69l00cnmgi8smujnr9q', // MANNOL DCT Fluid 8202
    'cmssfk5js0042mgk700trr840', // MANNOL Huile de boîte automatique CVT NS-3 1L
    'cmssfg5z8008fmgi86z9z10sh', // MANNOL Huile pour engrenages Maxpower 75w-140 4*4 1L
    'cmssfg6a900czmgi8qq0rh1bg', // MANNOL Hypoid 80W-90 GL-4/GL-5 LS 4 Litres
    'cmssfg68a00c3mgi8w4b3janv', // MANNOL huile de boîte de vitesse manuelle FWD 75W-85 GL-4
  ],
  'direction-assistee': [
    'b52b3d9d-64cf-49ce-865e-f07e9244dbd9', // Huile pour direction assistée BENZOL ATF DEX-III
  ],
}

async function dumpPreState(toPath: string) {
  const cats = await prisma.category.findMany()
  const products = await prisma.product.findMany({ select: { id: true, categoryId: true } })
  const byCategory: Record<string, string[]> = {}
  for (const p of products) {
    ;(byCategory[p.categoryId] ??= []).push(p.id)
  }
  fs.mkdirSync(DUMPS_DIR, { recursive: true })
  fs.writeFileSync(
    toPath,
    JSON.stringify({ exportedAt: new Date().toISOString(), categories: cats, productIdsByCategoryId: byCategory }, null, 2),
    'utf8',
  )
  console.log(`Pre-state snapshot written to: ${toPath}`)
}

async function main() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')

  const categories = await prisma.category.findMany()
  const bySlug = new Map(categories.map((c) => [c.slug, c]))
  const automobile = bySlug.get(AUTOMOBILE_SLUG)
  if (!automobile) throw new Error(`Missing root category "${AUTOMOBILE_SLUG}"`)

  // ── Plan (read-only) ──────────────────────────────────────────────
  const products = await prisma.product.findMany({
    where: { id: { in: Object.values(MOVES).flat() } },
  })
  const byId = new Map(products.map((p) => [p.id, p]))

  for (const nc of NEW_CATEGORIES) {
    if (bySlug.has(nc.slug)) console.log(`EXISTS  ${nc.slug} (${nc.nameFr}) — no creation needed`)
    else console.log(`CREATE  ${nc.slug} (${nc.nameFr}) — parent: ${AUTOMOBILE_SLUG}`)
  }

  let planned = 0
  for (const [targetSlug, ids] of Object.entries(MOVES)) {
    for (const id of ids) {
      const p = byId.get(id)
      if (!p) {
        console.warn(`WARN  product ${id} not found for ${targetSlug}`)
        continue
      }
      const from = categories.find((c) => c.id === p.categoryId)
      planned += 1
      console.log(`MOVE  "${p.nameFr}" → ${targetSlug} (from ${from?.nameFr ?? '?'})`)
    }
  }
  console.log(`PLAN   ${planned} products to move — re-run with --apply to execute`)

  if (!APPLY) return

  // ── Apply (single transaction) ────────────────────────────────────
  const productCountBefore = await prisma.product.count()
  await prisma.$transaction(
    async (tx) => {
      for (const nc of NEW_CATEGORIES) {
        if (!(await tx.category.findUnique({ where: { slug: nc.slug } }))) {
          await tx.category.create({
            data: { slug: nc.slug, nameFr: nc.nameFr, parentId: automobile.id },
          })
          console.log(`✔ created ${nc.slug} (${nc.nameFr}) under ${AUTOMOBILE_SLUG}`)
        }
      }
      const cats = await tx.category.findMany()
      const bySlug2 = new Map(cats.map((c) => [c.slug, c]))
      for (const [targetSlug, ids] of Object.entries(MOVES)) {
        const target = bySlug2.get(targetSlug)
        if (!target) throw new Error(`Missing target category "${targetSlug}"`)
        for (const id of ids) {
          const p = await tx.product.findUnique({
            where: { id },
            select: { id: true, nameFr: true, categoryId: true },
          })
          if (!p) {
            console.warn(`✘ product ${id} missing — skipped`)
            continue
          }
          const from = cats.find((c) => c.id === p.categoryId)
          await tx.product.update({ where: { id }, data: { categoryId: target.id } })
          console.log(`✔ moved "${p.nameFr}" → ${target.nameFr} (from ${from?.nameFr ?? '?'})`)
        }
      }
    },
    { timeout: 120_000 },
  )
  const productCountAfter = await prisma.product.count()
  if (productCountBefore !== productCountAfter) {
    throw new Error(`ASSERTION FAILED: product count changed ${productCountBefore} → ${productCountAfter}`)
  }
  console.log('')
  console.log(`APPLIED ✅ ${planned} products moved · Products ${productCountBefore} → ${productCountAfter} (unchanged ✓)`)
}

main()
  .catch((err) => {
    console.error('FATAL:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())