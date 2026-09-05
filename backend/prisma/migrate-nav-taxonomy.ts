// backend/prisma/migrate-nav-taxonomy.ts
// ---------------------------------------------------------------------------
// One-off, reviewable navigation-taxonomy migration. NEVER run silently:
//
//   npx tsx prisma/migrate-nav-taxonomy.ts          # dump + dry-run plan (no writes)
//   npx tsx prisma/migrate-nav-taxonomy.ts --apply  # dump + pre-state snapshot + apply (single transaction)
//   npx tsx prisma/migrate-nav-taxonomy.ts --apply --purge-orphans
//                                                   # also purge the 323 empty ap-cat-* orphan categories
//
// Canonical target tree (agreed store taxonomy, French labels):
//
//   Automobile (automobile)
//     Pièces de Rechange / D'origine (auto-pieces-rechange)
//       Filtres                (auto-filtres)               ← filtres merged in
//       Freinage               (auto-freinage)              ← frein merged in
//       Suspension & Direction (auto-suspension-direction)  ← suspension-direction merged in, label fixed
//       Boîte de Vitesse       (transmission)               ← auto-transmission-embrayage merged in
//       Autres pièces auto     (auto-autres-pieces)         ← reparented from pieces-auto; the 5 remaining
//                                                              auto-parts-* groups merged into it (catch-all)
//     Huiles & Lubrifiants Moteur (auto-huiles-lubrifiants)
//       Huile Moteur (huiles-moteur)   ← auto-synthese / auto-semi / auto-minerale reparented from automobile
//       Liquides     (liquides-auto)   ← direction-assistee, refroidissement reparented
//       Additifs     (additifs)
//       Produits d'entretien (entretien-auto) ← adblue reparented
//   Moto (moto-karting)
//     Pièces & Consommables (moto-pieces-consommables) ← moto-huile-moteur / moto-huile-boite /
//                                                          moto-huile-fourche reparented; root product moved
//     Équipements & Entretien (moto-equipements-entretien)
//   Karting (karting) — already correct, only label polish
//   Marine (marine)
//     Huiles & Lubrifiants Marine (marine-huiles-lubrifiants)
//       Huiles moteurs marins (marine-moteurs) ← marine-huile-moteur merged in
//       Graisses et additifs  (marine-graisses) ← marine-additifs merged in
//       Hydraulique           (marine-hydraulique) reparented (kept, not part of menu taxonomy)
//     Entretien & Accessoires (marine-entretien-accessoires)
//
// Rules enforced by this script:
//   • Dry-run by default — every step prints planned numbers; no writes.
//   • --apply performs a full pre-state snapshot (categories + product→category map) and
//     executes ALL steps inside a single transaction (120s timeout); any failure rolls everything back.
//   • A category is only deleted after its products AND children have been moved away (asserted).
//   • Total product count is asserted unchanged before/after.
//   • Idempotent: steps whose source slugs are already gone are skipped, so re-running
//     after a successful --apply is safe (needed to run --purge-orphans later).
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const APPLY = process.argv.includes('--apply')
const PURGE_ORPHANS = process.argv.includes('--purge-orphans')

const DUMPS_DIR = path.join(__dirname, 'dumps')

// ── Plan (ordered) ─────────────────────────────────────────────────────────

type Step =
  | { kind: 'merge'; loser: string; winner: string; renameWinnerTo?: string; note?: string }
  | { kind: 'reparentChild'; slug: string; to: string; note?: string }
  | { kind: 'reparentProducts'; slug: string; to: string; note?: string }
  | { kind: 'rename'; slug: string; nameFr: string; note?: string }
  | { kind: 'deleteEmpty'; slug: string; note?: string }

const PLAN: Step[] = [
  // ── Phase 1 · Dedupe under "Pièces de Rechange / D'origine" ──────────────
  { kind: 'merge', loser: 'filtres', winner: 'auto-filtres', note: 'duplicate leaf (1 product)' },
  { kind: 'merge', loser: 'frein', winner: 'auto-freinage', note: 'duplicate leaf (0 products)' },
  {
    kind: 'merge',
    loser: 'suspension-direction',
    winner: 'auto-suspension-direction',
    renameWinnerTo: 'Suspension & Direction',
    note: 'duplicate leaf; taxonomy label fix on winner',
  },
  {
    kind: 'merge',
    loser: 'auto-transmission-embrayage',
    winner: 'transmission',
    note: 'Transmission & embrayage (4317 products) folded into taxonomy bucket "Boîte de Vitesse"',
  },

  // ── Phase 2 · Pièces Auto merge → Automobile ─────────────────────────────
  // Note: the 5 auto-parts-* groups stay SEPARATE subcategories of
  // auto-pieces-rechange (user decision — real product counts + clean
  // identities). Only labels are normalized below.
  {
    kind: 'reparentChild',
    slug: 'auto-autres-pieces',
    to: 'auto-pieces-rechange',
    note: 'merge of "Pièces Auto" (pieces-auto) into Automobile',
  },
  { kind: 'rename', slug: 'auto-autres-pieces', nameFr: 'Autres pièces auto', note: 'accent fix' },
  { kind: 'rename', slug: 'auto-moteur-distribution', nameFr: 'Moteur & Distribution', note: 'label per review (kept separate)' },
  { kind: 'rename', slug: 'auto-refroidissement-climatisation', nameFr: 'Refroidissement & Climatisation', note: 'label per review (kept separate)' },
  { kind: 'rename', slug: 'auto-electricite-eclairage', nameFr: 'Électricité & Éclairage', note: 'label per review (kept separate)' },
  { kind: 'rename', slug: 'auto-carrosserie-habitacle', nameFr: 'Carrosserie & Habitacle', note: 'label per review (kept separate)' },
  { kind: 'rename', slug: 'auto-echappement', nameFr: 'Échappement', note: 'label per review (kept separate)' },
  { kind: 'deleteEmpty', slug: 'pieces-auto', note: 'old "Pièces Auto" root, empty after merge' },

  // ── Phase 3 · Automobile strays → canonical groups ───────────────────────
  { kind: 'reparentChild', slug: 'auto-synthese', to: 'huiles-moteur', note: '100% Synthèse under Huile Moteur' },
  { kind: 'reparentChild', slug: 'auto-semi', to: 'huiles-moteur', note: 'Semi-Synthèse under Huile Moteur' },
  { kind: 'reparentChild', slug: 'auto-minerale', to: 'huiles-moteur', note: 'Minérale under Huile Moteur' },
  { kind: 'reparentChild', slug: 'direction-assistee', to: 'liquides-auto', note: 'Huile de direction under Liquides' },
  { kind: 'reparentChild', slug: 'refroidissement', to: 'liquides-auto', note: 'Liquide de refroidissement under Liquides' },
  { kind: 'reparentChild', slug: 'adblue', to: 'entretien-auto', note: 'AdBlue under Produits d\'entretien' },
  { kind: 'rename', slug: 'adblue', nameFr: 'AdBlue', note: 'label per taxonomy' },

  // ── Phase 4 · Moto strays under "Pièces & Consommables" ──────────────────
  { kind: 'reparentChild', slug: 'moto-huile-moteur', to: 'moto-pieces-consommables', note: 'consommable' },
  { kind: 'reparentChild', slug: 'moto-huile-boite', to: 'moto-pieces-consommables', note: 'consommable' },
  { kind: 'reparentChild', slug: 'moto-huile-fourche', to: 'moto-pieces-consommables', note: 'consommable' },
  { kind: 'reparentProducts', slug: 'moto-karting', to: 'moto-pieces-consommables', note: '1 product on root → group' },
  { kind: 'rename', slug: 'moto-lubrifiants-chaine', nameFr: 'Lubrifiants de chaîne et additifs', note: 'label per taxonomy' },

  // ── Phase 5 · Marine strays → canonical groups ───────────────────────────
  { kind: 'merge', loser: 'marine-huile-moteur', winner: 'marine-moteurs', note: '0 products, same bucket' },
  { kind: 'merge', loser: 'marine-additifs', winner: 'marine-graisses', note: '0 products, "Graisses et additifs"' },
  { kind: 'reparentChild', slug: 'marine-hydraulique', to: 'marine-huiles-lubrifiants', note: 'kept under fluids group' },
  { kind: 'rename', slug: 'karting-huiles', nameFr: 'Huiles & lubrifiants haute performance', note: 'label per taxonomy' },
  { kind: 'rename', slug: 'karting-additifs', nameFr: 'Additifs & graisses compétition', note: 'label per taxonomy' },

  // ── Phase 6 · Empty legacy shells (part of --apply) ──────────────────────
  { kind: 'deleteEmpty', slug: 'lubrifiants', note: 'legacy empty root (superseded by automobile tree)' },
  { kind: 'deleteEmpty', slug: 'poids-lourd-agricole', note: 'empty shell, not in taxonomy' },
  { kind: 'deleteEmpty', slug: 'hydraulique', note: 'empty shell, not in taxonomy' },
  { kind: 'deleteEmpty', slug: 'graisses', note: 'empty shell, not in taxonomy' },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function slugMap(categories: { id: string; slug: string }[]) {
  return new Map(categories.map((c) => [c.slug, c.id]))
}

async function dumpTree(toPath: string) {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
  const counts = await prisma.product.groupBy({ by: ['categoryId'], _count: { _all: true } })
  const byCat = new Map(counts.map((r) => [r.categoryId, r._count._all]))
  const byId = new Map(cats.map((c) => [c.id, c]))
  const childrenOf = new Map<string, (typeof cats)[number][]>()
  const roots: (typeof cats)[number][] = []
  for (const c of cats) {
    if (c.parentId && byId.has(c.parentId)) {
      const arr = childrenOf.get(c.parentId) ?? []
      arr.push(c)
      childrenOf.set(c.parentId, arr)
    } else {
      roots.push(c)
    }
  }
  const lines: string[] = ['NAVIGATION TAXONOMY TREE DUMP', '============================', '']
  const walk = (c: (typeof cats)[number], depth: number) => {
    const pad = '  '.repeat(depth)
    lines.push(
      `${pad}- ${c.nameFr}  [slug=${c.slug}]  (products=${byCat.get(c.id) ?? 0}, children=${
        (childrenOf.get(c.id) ?? []).length
      })`,
    )
    for (const ch of childrenOf.get(c.id) ?? []) walk(ch, depth + 1)
  }
  for (const r of roots) walk(r, 0)
  lines.push('', `TOTAL categories: ${cats.length}`)
  fs.mkdirSync(DUMPS_DIR, { recursive: true })
  fs.writeFileSync(toPath, lines.join('\n'), 'utf8')
  console.log(`Tree dump written to: ${toPath}`)
}

async function snapshotPreState(toPath: string) {
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
    JSON.stringify(
      { exportedAt: new Date().toISOString(), categories: cats, productIdsByCategoryId: byCategory },
      null,
      2,
    ),
    'utf8',
  )
  console.log(`Pre-state snapshot written to: ${toPath}`)
}

// ── Plan mode (no writes) ──────────────────────────────────────────────────

async function runPlan(rows: { slug: string; nameFr: string; id: string; parentSlug?: string }[], ids: Map<string, string>) {
  const counts = await prisma.product.groupBy({ by: ['categoryId'], _count: { _all: true } })
  const nProducts = new Map(counts.map((r) => [r.categoryId, r._count._all]))
  // Note: `childrenOf` is the INITIAL snapshot; the plan steps below mutate
  // `virtualChildren` so dry-run checks reflect post-step state (same ordering
  // the transaction in apply mode uses).
  const childrenOf = new Map<string, number>()
  const virtualChildren = new Map<string, number>()
  for (const r of rows) {
    if (r.parentSlug) {
      childrenOf.set(r.parentSlug, (childrenOf.get(r.parentSlug) ?? 0) + 1)
      virtualChildren.set(r.parentSlug, (virtualChildren.get(r.parentSlug) ?? 0) + 1)
    }
  }
  const nameOf = new Map(rows.map((r) => [r.slug, r.nameFr]))
  let productsMoved = 0
  let deleted = 0
  let reparented = 0

  const needs = (s: Step): string[] =>
    s.kind === 'merge'
      ? [s.loser, s.winner]
      : s.kind === 'reparentChild' || s.kind === 'reparentProducts'
        ? [s.slug, s.to]
        : [s.slug]

  for (const s of PLAN) {
    const absent = needs(s).filter((n) => !ids.has(n) && !nameOf.has(n))
    if (absent.length) {
      console.log(`SKIP  ${s.kind} ${s.kind === 'merge' ? s.winner : s.slug} — missing ${absent.join(', ')} (already applied?)`)
      continue
    }
    const L = (slug: string) => `${nameOf.get(slug)} [${slug}]`
    switch (s.kind) {
      case 'merge': {
        const loserId = ids.get(s.loser)!
        const winnerId = ids.get(s.winner)!
        const p = nProducts.get(loserId) ?? 0
        const ch = virtualChildren.get(s.loser) ?? 0
        if (ch > 0) {
          console.error(`ABORT: merge of "${s.loser}" would orphan ${ch} child categor${ch > 1 ? 'ies' : 'y'}.`)
          return false
        }
        productsMoved += p
        deleted += 1
        virtualChildren.delete(s.loser)
        console.log(`MERGE  ${L(s.loser)} (${p} product${p === 1 ? '' : 's'}) → ${L(s.winner)}${s.renameWinnerTo ? `, rename winner to "${s.renameWinnerTo}"` : ''}${s.note ? `  — ${s.note}` : ''}`)
        break
      }
      case 'reparentChild': {
        const ch = childrenOf.get(s.slug) ?? 0
        const fromParent = rows.find((r) => r.id === ids.get(s.slug))?.parentSlug
        reparented += 1
        if (fromParent) {
          virtualChildren.set(fromParent, Math.max(0, (virtualChildren.get(fromParent) ?? 0) - 1))
        }
        virtualChildren.set(s.to, (virtualChildren.get(s.to) ?? 0) + 1)
        console.log(`REPARENT  ${L(s.slug)} → ${L(s.to)} (${ch} descendant categor${ch === 1 ? 'y' : 'ies'} move with it)${s.note ? `  — ${s.note}` : ''}`)
        break
      }
      case 'reparentProducts': {
        const p = nProducts.get(ids.get(s.slug)!) ?? 0
        productsMoved += p
        console.log(`MOVE-PRODUCTS  ${L(s.slug)} (${p} product${p === 1 ? '' : 's'}) → ${L(s.to)}${s.note ? `  — ${s.note}` : ''}`)
        break
      }
      case 'rename': {
        const p = nProducts.get(ids.get(s.slug)!) ?? 0
        const ch = childrenOf.get(s.slug) ?? 0
        console.log(`RENAME  ${L(s.slug)} → "${s.nameFr}" (${p}p, ${ch}c)${s.note ? `  — ${s.note}` : ''}`)
        break
      }
      case 'deleteEmpty': {
        const p = nProducts.get(ids.get(s.slug)!) ?? 0
        const ch = virtualChildren.get(s.slug) ?? 0
        if (p > 0 || ch > 0) {
          console.error(`SKIP  deleteEmpty "${s.slug}" has ${p} products / ${ch} children — NOT deleted.`)
          continue
        }
        deleted += 1
        console.log(`DELETE  ${L(s.slug)} (empty)${s.note ? `  — ${s.note}` : ''}`)
        break
      }
    }
  }

  // Orphan report (phase 6, --purge-orphans)
  const orphans = rows.filter((r) => r.id.startsWith('ap-cat-'))
  const orphanProducts = orphans.reduce((t, o) => t + (nProducts.get(o.id) ?? 0), 0)
  console.log('')
  console.log(`SUMMARY  products moved: ${productsMoved} · categories deleted: ${deleted} · categories reparented: ${reparented}`)
  console.log(
    `ORPHANS  ${orphans.length} ap-cat-* root categor${orphans.length === 1 ? 'y' : 'ies'} (${orphanProducts} products) left untouched${PURGE_ORPHANS ? ' — will be purged by --purge-orphans' : ' — use --purge-orphans to remove them (all empty)'}.`,
  )
  console.log(APPLY ? 'MODE      --apply: plan above will be executed in ONE transaction.' : 'MODE      dry-run: no writes performed. Re-run with --apply to execute.')
  return true
}

// ── Apply mode ─────────────────────────────────────────────────────────────

async function runApply(ids: Map<string, string>, rows: { id: string; slug: string; nameFr: string }[]) {
  const nameOf = new Map(rows.map((r) => [r.slug, r.nameFr]))

  const productCountBefore = await prisma.product.count()

  const result = await prisma.$transaction(
    async (tx) => {
      const stats = { merged: 0, deleted: 0, reparented: 0, renamed: 0 }
    for (const s of PLAN) {
      const needSlugs =
        s.kind === 'merge'
          ? [s.loser, s.winner]
          : s.kind === 'reparentChild' || s.kind === 'reparentProducts'
            ? [s.slug, s.to]
            : [s.slug]
      const absent = needSlugs.filter((n) => !ids.has(n))
      if (absent.length) {
        console.log(`✘ skip ${s.kind} ${s.kind === 'merge' ? s.winner : s.slug} — missing ${absent.join(', ')} (already applied?)`)
        continue
      }
      const id = (slug: string) => {
        const v = ids.get(slug)
        if (!v) throw new Error(`Missing category slug "${slug}"`)
        return v
      }
      switch (s.kind) {
        case 'merge': {
          const loserId = id(s.loser)
          const winnerId = id(s.winner)
          const [childCount, productCount] = await Promise.all([
            tx.category.count({ where: { parentId: loserId } }),
            tx.product.count({ where: { categoryId: loserId } }),
          ])
          if (childCount > 0) throw new Error(`merge "${s.loser}" would orphan ${childCount} children`)
          if (productCount > 0) {
            await tx.product.updateMany({ where: { categoryId: loserId }, data: { categoryId: winnerId } })
          }
          await tx.category.delete({ where: { id: loserId } })
          if (s.renameWinnerTo) {
            await tx.category.update({ where: { id: winnerId }, data: { nameFr: s.renameWinnerTo } })
          }
          stats.merged += 1
          stats.deleted += 1
          console.log(`✔ merge ${s.loser} → ${s.winner} (${productCount} products moved)`)
          break
        }
        case 'reparentChild': {
          const childId = id(s.slug)
          const parentId = id(s.to)
          if (childId === parentId) throw new Error(`reparent ${s.slug} onto itself`)
          await tx.category.update({ where: { id: childId }, data: { parentId } })
          stats.reparented += 1
          console.log(`✔ reparent ${s.slug} → ${s.to}`)
          break
        }
        case 'reparentProducts': {
          const fromId = id(s.slug)
          const toId = id(s.to)
          const r = await tx.product.updateMany({ where: { categoryId: fromId }, data: { categoryId: toId } })
          stats.reparented += 1
          console.log(`✔ move ${r.count} products from ${s.slug} → ${s.to}`)
          break
        }
        case 'rename': {
          const cid = id(s.slug)
          await tx.category.update({ where: { id: cid }, data: { nameFr: s.nameFr } })
          stats.renamed += 1
          console.log(`✔ rename ${s.slug} → "${s.nameFr}"`)
          break
        }
        case 'deleteEmpty': {
          const cid = id(s.slug)
          const [productCount, childCount] = await Promise.all([
            tx.product.count({ where: { categoryId: cid } }),
            tx.category.count({ where: { parentId: cid } }),
          ])
          if (productCount > 0 || childCount > 0) {
            console.warn(`✘ skip deleteEmpty ${s.slug} (${productCount} products, ${childCount} children)`)
            continue
          }
          await tx.category.delete({ where: { id: cid } })
          stats.deleted += 1
          console.log(`✔ delete empty ${s.slug}`)
          break
        }
      }
    }

    // Phase 6b — optional purge of ap-cat-* orphans
    if (PURGE_ORPHANS) {
      const orphans = await tx.category.findMany({ where: { id: { startsWith: 'ap-cat-' } } })
      for (const o of orphans) {
        const [productCount, childCount] = await Promise.all([
          tx.product.count({ where: { categoryId: o.id } }),
          tx.category.count({ where: { parentId: o.id } }),
        ])
        if (productCount > 0 || childCount > 0) {
          console.warn(`✘ skip orphan ${o.slug} (${productCount} products, ${childCount} children)`)
          continue
        }
        await tx.category.delete({ where: { id: o.id } })
      }
      console.log(`✔ purged remaining empty ap-cat-* orphans`)
    }

    return stats
    },
    { timeout: 120_000 },
  )

  const productCountAfter = await prisma.product.count()
  if (productCountBefore !== productCountAfter) {
    throw new Error(`ASSERTION FAILED: product count changed ${productCountBefore} → ${productCountAfter}`)
  }
  console.log('')
  console.log(`APPLIED  ✅ merged=${result.merged} reparented=${result.reparented} renamed=${result.renamed} deleted=${result.deleted}`)
  console.log(`         Products before=${productCountBefore} after=${productCountAfter} (unchanged ✓)`)
  void nameOf
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  await dumpTree(path.join(DUMPS_DIR, `nav-taxonomy-tree-${ts}.txt`))

  const rows = await prisma.category.findMany({
    select: { id: true, slug: true, nameFr: true, parentId: true },
    orderBy: { sortOrder: 'asc' },
  })
  const parents = new Map(rows.map((r) => [r.id, r]))
  const flat = rows.map((r) => ({ ...r, parentSlug: r.parentId ? parents.get(r.parentId)?.slug : undefined }))
  const ids = slugMap(rows)

  const ok = await runPlan(flat, ids)
  if (!ok) process.exitCode = 1

  if (APPLY) {
    await snapshotPreState(path.join(DUMPS_DIR, `nav-taxonomy-pre-${ts}.json`))
    await runApply(ids, rows)
  }
}

main()
  .catch((err) => {
    console.error('FATAL:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())