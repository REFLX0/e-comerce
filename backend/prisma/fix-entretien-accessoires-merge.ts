// backend/prisma/fix-entretien-accessoires-merge.ts
// ---------------------------------------------------------------------------
// Fusionne l'ancienne catégorie racine "Entretien & Accessoires"
// (entretien-accessoires) dans "Accessoires Auto" (accessoires-auto),
// qui elle est bien rattachée à "Automobile".
//
// Problème corrigé : "entretien-accessoires" était une catégorie RACINE
// (sœur de "Automobile"), absente du menu de navigation du site
// (frontend/lib/navigation/taxonomy.ts). Les produits/sous-catégories
// enregistrés dessous (Lavage/Carrosserie & Detailing, Nettoyage & Entretien
// Intérieur, Produits divers & Maintenance, ...) étaient donc introuvables
// en naviguant sur le site sous Automobile.
//
// Cette migration :
//   1. Prend un snapshot complet (catégories + rattachement produits) avant
//      toute écriture.
//   2. Déplace toutes les sous-catégories de "entretien-accessoires" sous
//      "accessoires-auto".
//   3. Déplace les produits rattachés directement à "entretien-accessoires"
//      (s'il y en a) vers "accessoires-auto".
//   4. Supprime "entretien-accessoires" une fois vidée (0 enfant, 0 produit).
//   5. Vérifie qu'aucun produit n'a été perdu.
//
// Usage :
//   npx tsx prisma/fix-entretien-accessoires-merge.ts            # DRY-RUN
//   npx tsx prisma/fix-entretien-accessoires-merge.ts --apply    # APPLIQUE
//   npx tsx prisma/fix-entretien-accessoires-merge.ts --rollback # RESTAURE le dernier snapshot
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const APPLY = process.argv.includes('--apply')
const ROLLBACK = process.argv.includes('--rollback')

const SOURCE_SLUG = 'entretien-accessoires'
const TARGET_SLUG = 'accessoires-auto'

const DUMPS_DIR = path.join(__dirname, 'dumps')
if (!fs.existsSync(DUMPS_DIR)) {
  fs.mkdirSync(DUMPS_DIR, { recursive: true })
}

async function runRollback() {
  const files = fs
    .readdirSync(DUMPS_DIR)
    .filter((f) => f.startsWith('entretien-accessoires-merge-backup-'))
    .sort()
    .reverse()
  if (files.length === 0) {
    throw new Error('Aucun fichier de backup trouvé dans ' + DUMPS_DIR)
  }
  const latestBackup = path.join(DUMPS_DIR, files[0])
  console.log(`Restauration depuis le snapshot : ${latestBackup}`)
  const raw = JSON.parse(fs.readFileSync(latestBackup, 'utf8'))
  const categories = raw.categories as any[]
  const productMappings = raw.productMappings as { productId: string; categoryId: string | null }[]

  await prisma.$transaction(
    async (tx) => {
      for (const c of categories) {
        await tx.category.upsert({
          where: { id: c.id },
          create: {
            id: c.id,
            nameFr: c.nameFr,
            slug: c.slug,
            imageUrl: c.imageUrl,
            sortOrder: c.sortOrder,
            parentId: c.parentId,
          },
          update: {
            nameFr: c.nameFr,
            slug: c.slug,
            imageUrl: c.imageUrl,
            sortOrder: c.sortOrder,
            parentId: c.parentId,
          },
        })
      }
      for (const pm of productMappings) {
        await tx.product.update({
          where: { id: pm.productId },
          data: { categoryId: pm.categoryId },
        })
      }
    },
    { timeout: 180_000 },
  )

  console.log('Rollback terminé avec succès.')
}

async function main() {
  console.log('============================================================================')
  console.log(' FUSION "Entretien & Accessoires" -> "Accessoires Auto" (sous Automobile)')
  console.log(` Mode : ${APPLY ? 'APPLICATION REELLE' : 'SIMULATION (DRY-RUN)'}`)
  console.log('============================================================================\n')

  if (ROLLBACK) {
    await runRollback()
    return
  }

  const source = await prisma.category.findUnique({
    where: { slug: SOURCE_SLUG },
    include: { children: true, _count: { select: { products: true } } },
  })
  const target = await prisma.category.findUnique({
    where: { slug: TARGET_SLUG },
    include: { _count: { select: { products: true } } },
  })

  if (!target) {
    throw new Error(`Catégorie cible "${TARGET_SLUG}" introuvable. Rien à faire.`)
  }
  if (!source) {
    console.log(`Catégorie source "${SOURCE_SLUG}" introuvable — déjà fusionnée ou jamais créée. Rien à faire.`)
    return
  }

  console.log(`Source : "${source.nameFr}" (${SOURCE_SLUG}) — ${source._count.products} produit(s) direct(s), ${source.children.length} sous-catégorie(s)`)
  source.children.forEach((c) => console.log(`   - ${c.nameFr} (${c.slug})`))
  console.log(`Cible  : "${target.nameFr}" (${TARGET_SLUG}) — ${target._count.products} produit(s) direct(s)\n`)

  const totalProducts = await prisma.product.count()
  console.log(`Nombre total de produits en catalogue (avant) : ${totalProducts}\n`)

  if (!APPLY) {
    console.log('Plan :')
    console.log(`  - Rattacher les ${source.children.length} sous-catégorie(s) ci-dessus à "${target.nameFr}" (${TARGET_SLUG})`)
    if (source._count.products > 0) {
      console.log(`  - Déplacer les ${source._count.products} produit(s) rattachés directement à "${source.nameFr}" vers "${target.nameFr}"`)
    }
    console.log(`  - Supprimer la catégorie racine "${source.nameFr}" (${SOURCE_SLUG}) une fois vidée`)
    console.log('\nSimulation terminée. Aucun changement écrit. Relancez avec --apply pour exécuter.')
    return
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const snapshotFile = path.join(DUMPS_DIR, `entretien-accessoires-merge-backup-${timestamp}.json`)
  const allCategories = await prisma.category.findMany()
  const allProductMappings = await prisma.product.findMany({ select: { id: true, categoryId: true } })
  fs.writeFileSync(
    snapshotFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        categories: allCategories,
        productMappings: allProductMappings.map((p) => ({ productId: p.id, categoryId: p.categoryId })),
      },
      null,
      2,
    ),
  )
  console.log(`Snapshot créé : ${snapshotFile}\n`)

  await prisma.$transaction(
    async (tx) => {
      // 1. Rattacher les sous-catégories de la source à la cible.
      await tx.category.updateMany({
        where: { parentId: source.id },
        data: { parentId: target.id },
      })

      // 2. Déplacer les produits rattachés directement à la source.
      const moved = await tx.product.updateMany({
        where: { categoryId: source.id },
        data: { categoryId: target.id },
      })
      if (moved.count > 0) {
        console.log(`  -> ${moved.count} produit(s) déplacé(s) directement vers "${target.nameFr}".`)
      }

      // 3. Supprimer la catégorie source, désormais vide.
      await tx.category.delete({ where: { id: source.id } })
    },
    { timeout: 180_000 },
  )

  const postProductCount = await prisma.product.count()
  console.log(`\nProduits avant : ${totalProducts}`)
  console.log(`Produits après : ${postProductCount}`)
  if (postProductCount !== totalProducts) {
    throw new Error(`ALERTE : incohérence de produit (${totalProducts} -> ${postProductCount}). Utilisez --rollback.`)
  }
  console.log('Aucune perte de produit.\n')

  const finalTarget = await prisma.category.findUnique({
    where: { slug: TARGET_SLUG },
    include: { children: true, _count: { select: { products: true } } },
  })
  console.log(`"${TARGET_SLUG}" contient maintenant ${finalTarget?.children.length ?? 0} sous-catégorie(s) et ${finalTarget?._count.products ?? 0} produit(s) direct(s) :`)
  finalTarget?.children.forEach((c) => console.log(`   - ${c.nameFr} (${c.slug})`))
  console.log('\nMIGRATION APPLIQUÉE AVEC SUCCÈS.')
  console.log('N\'oubliez pas de déployer la mise à jour de frontend/lib/navigation/taxonomy.ts pour que le menu du site affiche ces sous-catégories.')
}

main()
  .catch((e) => {
    console.error('FATAL:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
