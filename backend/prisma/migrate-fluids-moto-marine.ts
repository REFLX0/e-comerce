// backend/prisma/migrate-fluids-moto-marine.ts
// ---------------------------------------------------------------------------
// One-off migration: create the missing flat fluid categories for Moto &
// Karting and Marine, and move the user-confirmed genuine products into them.
// Reconciles deviations from the batch that was already partially applied.
//
//   npx tsx prisma/migrate-fluids-moto-marine.ts          # dry-run plan (no writes)
//   npx tsx prisma/migrate-fluids-moto-marine.ts --apply  # apply in ONE transaction
//
// Confirmed move list (user-approved, 2026-08-16):
//   → "Additifs" (moto-additifs) [NEW, flat under moto-pieces-consommables]
//     - liqui-moly-motorbike-4t-bike-additive            (from moto-lubrifiants-chaine)
//     - liqui-moly-motorbike-additif-huile-2t-et-4t-125ml (from moto-lubrifiants-chaine)
//     - liqui-moly-motorbike-mos2-shooter                (from moto-lubrifiants-chaine)
//   → "Additifs" (marine-additifs) [NEW, flat under marine-huiles-lubrifiants]
//     - liqui-moly-marine-protection-gazole-500ml        (from marine-graisses)
//     - liqui-moly-marine-super-diesel-additiv           (from marine-graisses)
//     - liqui-moly-entretien-circuits-dinjection-marine  (from marine-hivernage)
//     - liqui-moly-marine-multispray                     (from marine-hivernage)
//     - liqui-moly-marine-stabilisateur-dessence         (from marine-hivernage)
//     - liqui-moly-protection-interieure-du-moteur-marine (from marine-hivernage)
//   → "Huile de boîte" (moto-huile-boite) [EXISTS — product only]
//     - liqui-moly-huile-transmission-10w30-1l           (from liquides-auto)
//
// Already applied by earlier batch (verified, NOT re-run):
//   - moto-huile-moteur 15 → 16 (coolant kept per user decision)
//   - moto-huile-fourche 4, moto-lubrifiants-chaine 5+3 packs (kept per user),
//   - marine-moteurs 8, karting → moto-karting merge
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const APPLY = process.argv.includes('--apply')

const DUMPS_DIR = path.join(__dirname, 'dumps')

const NEW_CATEGORIES = [
  { slug: 'moto-additifs', nameFr: 'Additifs', parentSlug: 'moto-pieces-consommables' },
  { slug: 'marine-additifs', nameFr: 'Additifs', parentSlug: 'marine-huiles-lubrifiants' },
] as const

// target category slug → product ids
const MOVES: Record<string, string[]> = {
  'moto-additifs': [
    'cmssfg5ec001pmgi8lx6n4tpc', // liqui-moly-motorbike-4t-bike-additive
    'cmssfk54l000mmgk7cxo5gu5h', // liqui-moly-motorbike-additif-huile-2t-et-4t-125ml
    'cmssfk54u000pmgk7jguamd0s', // liqui-moly-motorbike-mos2-shooter
  ],
  'marine-additifs': [
    'cmssfg5ml004gmgi8dn7u41jd', // liqui-moly-marine-protection-gazole-500ml
    'cmssfg5mv004jmgi8lqx4wzuv', // liqui-moly-marine-super-diesel-additiv
    'cmssfg5nd004pmgi87jwpqffm', // liqui-moly-entretien-circuits-dinjection-marine
    'cmssfg5m9004dmgi81i1q4z13', // liqui-moly-marine-multispray
    'cmssfg5o0004vmgi89slw2757', // liqui-moly-marine-stabilisateur-dessence
    'cmssfk59r001smgk7u0z7qn84', // liqui-moly-protection-interieure-du-moteur-marine
  ],
  'moto-huile-boite': [
    'cmssfg5p90057mgi80f98ewjo', // liqui-moly-huile-transmission-10w30-1l
  ],
}

async function dumpPreState(toPath: string) {
  const cats = await prisma.category.findMany()
  const products = await prisma.product.findMany({ select: { id: true, categoryId: true } })
  const byCategory: Record<string, string[]> = {}
  for (const p of products) {
    const catId = p.categoryId ?? 'uncategorized'
    ;(byCategory[catId] ??= []).push(p.id)
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

  // ── Plan (read-only) ──────────────────────────────────────────────
  for (const nc of NEW_CATEGORIES) {
    if (!bySlug.has(nc.parentSlug)) throw new Error(`Missing parent category "${nc.parentSlug}"`)
    if (bySlug.has(nc.slug)) console.log(`EXISTS  ${nc.slug} (${nc.nameFr}) — no creation needed`)
    else console.log(`CREATE  ${nc.slug} (${nc.nameFr}) — parent: ${nc.parentSlug}`)
  }

  const products = await prisma.product.findMany({
    where: { id: { in: Object.values(MOVES).flat() } },
  })
  const byId = new Map(products.map((p) => [p.id, p]))

  let planned = 0
  for (const [targetSlug, ids] of Object.entries(MOVES)) {
    if (!bySlug.has(targetSlug) && !NEW_CATEGORIES.some((nc) => nc.slug === targetSlug)) {
      console.error(`ABORT: target category "${targetSlug}" does not exist`)
      process.exitCode = 1
      return
    }
    for (const id of ids) {
      const p = byId.get(id)
      if (!p) {
        console.warn(`WARN  product ${id} not found for ${targetSlug}`)
        continue
      }
      const from = categories.find((c) => c.id === p.categoryId)
      planned += 1
      console.log(`MOVE  "${p.nameFr}" → ${targetSlug} (from ${from?.slug ?? '?'})`)
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
            data: { slug: nc.slug, nameFr: nc.nameFr, parentId: bySlug.get(nc.parentSlug)!.id },
          })
          console.log(`✔ created ${nc.slug} (${nc.nameFr}) under ${nc.parentSlug}`)
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
          console.log(`✔ moved "${p.nameFr}" → ${target.nameFr} (from ${from?.slug ?? '?'})`)
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