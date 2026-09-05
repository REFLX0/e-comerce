// backend/prisma/migrate-taxonomy-v4.ts
// ---------------------------------------------------------------------------
// Refonte intégrale et réconciliation de l'arbre de catégories (Taxonomie V4).
//
// Usage:
//   npx -y tsx prisma/migrate-taxonomy-v4.ts            # DRY-RUN (affiche le plan et l'impact sans modifier)
//   npx -y tsx prisma/migrate-taxonomy-v4.ts --apply    # APPLIQUE les modifications dans une transaction sécurisée
//   npx -y tsx prisma/migrate-taxonomy-v4.ts --rollback # RESTAURE le snapshot de sauvegarde
//
// Règles strictes :
//   - Snapshot JSON complet créé avant toute écriture.
//   - ZÉRO perte de produit : le nombre total de produits est vérifié avant et après.
//   - Réconciliation existant / cible sans doublons.
// ---------------------------------------------------------------------------

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const APPLY = process.argv.includes('--apply')
const ROLLBACK = process.argv.includes('--rollback')

const DUMPS_DIR = path.join(__dirname, 'dumps')
if (!fs.existsSync(DUMPS_DIR)) {
  fs.mkdirSync(DUMPS_DIR, { recursive: true })
}

interface TargetCategoryDef {
  slug: string
  nameFr: string
  parentSlug: string | null
  sortOrder: number
  imageUrl?: string
}

const TARGET_TREE: TargetCategoryDef[] = [
  // ── I. Automobile ────────────────────────────────────────────────────────
  { slug: 'automobile', nameFr: 'Automobile', parentSlug: null, sortOrder: 1 },
  { slug: 'huiles-moteur', nameFr: 'Huile Moteur', parentSlug: 'automobile', sortOrder: 1 },
  { slug: 'auto-synthese', nameFr: '100% Synthétique', parentSlug: 'huiles-moteur', sortOrder: 1 },
  { slug: 'auto-semi', nameFr: 'Semi Synthétique', parentSlug: 'huiles-moteur', sortOrder: 2 },
  { slug: 'auto-minerale', nameFr: 'Minérale', parentSlug: 'huiles-moteur', sortOrder: 3 },
  { slug: 'liquide-de-frein', nameFr: 'Liquide de Frein', parentSlug: 'automobile', sortOrder: 2 },
  { slug: 'liquide-frein-dot3', nameFr: 'DOT 3', parentSlug: 'liquide-de-frein', sortOrder: 1 },
  { slug: 'liquide-frein-dot4', nameFr: 'DOT 4', parentSlug: 'liquide-de-frein', sortOrder: 2 },
  { slug: 'liquide-frein-dot5-1', nameFr: 'DOT 5.1', parentSlug: 'liquide-de-frein', sortOrder: 3 },
  { slug: 'direction-assistee', nameFr: 'Liquide de Direction', parentSlug: 'automobile', sortOrder: 3 },
  { slug: 'additifs', nameFr: 'Additifs', parentSlug: 'automobile', sortOrder: 4 },
  { slug: 'additif-essence', nameFr: 'Additif Essence', parentSlug: 'additifs', sortOrder: 1 },
  { slug: 'additif-diesel', nameFr: 'Additif Diesel', parentSlug: 'additifs', sortOrder: 2 },
  { slug: 'additif-huile', nameFr: 'Additif Huile', parentSlug: 'additifs', sortOrder: 3 },
  { slug: 'additif-boite-pont', nameFr: 'Additif Boîte et Pont', parentSlug: 'additifs', sortOrder: 4 },
  { slug: 'huile-de-boite', nameFr: 'Liquide de Transmission', parentSlug: 'automobile', sortOrder: 5 },
  { slug: 'autres-liquides-entretien', nameFr: 'Autres Liquides et Entretien', parentSlug: 'automobile', sortOrder: 6 },
  { slug: 'antigel-ldr', nameFr: 'Antigel / LDR', parentSlug: 'autres-liquides-entretien', sortOrder: 1 },
  { slug: 'adblue', nameFr: 'AdBlue', parentSlug: 'autres-liquides-entretien', sortOrder: 2 },
  { slug: 'produits-entretien', nameFr: "Produits d'entretien", parentSlug: 'autres-liquides-entretien', sortOrder: 3 },
  { slug: 'accessoires-auto', nameFr: 'Accessoires Auto', parentSlug: 'automobile', sortOrder: 7 },

  // ── II. Pièces de Rechange ───────────────────────────────────────────────
  { slug: 'auto-pieces-rechange', nameFr: 'Pièces de Rechange', parentSlug: null, sortOrder: 2 },
  { slug: 'auto-filtres', nameFr: 'Filtres', parentSlug: 'auto-pieces-rechange', sortOrder: 1 },
  { slug: 'filtre-a-air', nameFr: 'Filtre à air', parentSlug: 'auto-filtres', sortOrder: 1 },
  { slug: 'filtre-a-huile', nameFr: 'Filtre à huile', parentSlug: 'auto-filtres', sortOrder: 2 },
  { slug: 'filtre-a-carburant', nameFr: 'Filtre à carburant', parentSlug: 'auto-filtres', sortOrder: 3 },
  { slug: 'filtre-habitacle', nameFr: 'Filtre habitacle', parentSlug: 'auto-filtres', sortOrder: 4 },
  { slug: 'filtre-hydraulique', nameFr: 'Filtre hydraulique', parentSlug: 'auto-filtres', sortOrder: 5 },
  { slug: 'auto-freinage', nameFr: 'Freinage', parentSlug: 'auto-pieces-rechange', sortOrder: 2 },
  { slug: 'batteries', nameFr: 'Batteries', parentSlug: 'auto-pieces-rechange', sortOrder: 3 }, // Cas spécial : pas de sous-catégories, filtre facet batteryType
  { slug: 'auto-suspension-direction', nameFr: 'Suspension et Direction', parentSlug: 'auto-pieces-rechange', sortOrder: 4 },
  { slug: 'transmission', nameFr: 'Boîte de Vitesses, Embrayage', parentSlug: 'auto-pieces-rechange', sortOrder: 5 },
  { slug: 'auto-moteur-distribution', nameFr: 'Moteur et Distribution', parentSlug: 'auto-pieces-rechange', sortOrder: 6 },
  { slug: 'auto-refroidissement-climatisation', nameFr: 'Refroidissement et Climatisation', parentSlug: 'auto-pieces-rechange', sortOrder: 7 },
  { slug: 'auto-electricite-eclairage', nameFr: 'Électricité et Éclairage', parentSlug: 'auto-pieces-rechange', sortOrder: 8 },
  { slug: 'auto-carrosserie-habitacle', nameFr: 'Carrosserie et Habitacle', parentSlug: 'auto-pieces-rechange', sortOrder: 9 },
  { slug: 'auto-autres-pieces', nameFr: 'Échappement et Autres Pièces', parentSlug: 'auto-pieces-rechange', sortOrder: 10 },

  // ── III. Moto et Karting ─────────────────────────────────────────────────
  { slug: 'moto-karting', nameFr: 'Moto et Karting', parentSlug: null, sortOrder: 3 },
  { slug: 'moto-huiles', nameFr: 'Huile Moteur', parentSlug: 'moto-karting', sortOrder: 1 },
  { slug: 'moto-huile-boite', nameFr: 'Huile de Boîte', parentSlug: 'moto-karting', sortOrder: 2 },
  { slug: 'moto-huile-fourche', nameFr: 'Huile de Fourche', parentSlug: 'moto-karting', sortOrder: 3 },
  { slug: 'moto-lubrifiants-chaine', nameFr: 'Lubrifiants Chaîne et Additifs', parentSlug: 'moto-karting', sortOrder: 4 },
  { slug: 'accessoires-moto', nameFr: 'Accessoires Moto', parentSlug: 'moto-karting', sortOrder: 5 },

  // ── IV. Marine ───────────────────────────────────────────────────────────
  { slug: 'marine', nameFr: 'Marine', parentSlug: null, sortOrder: 4 },
  { slug: 'marine-moteurs', nameFr: 'Huile Moteur', parentSlug: 'marine', sortOrder: 1 },
  { slug: 'marine-hydraulique', nameFr: 'Huile Hydraulique', parentSlug: 'marine', sortOrder: 2 },
  { slug: 'marine-graisses', nameFr: 'Graisse et Additifs', parentSlug: 'marine', sortOrder: 3 },
]

// Mappings d'anciennes catégories vers les nouvelles
const SLUG_MERGES_AND_RENAMES: Record<string, string> = {
  'liquides-auto': 'autres-liquides-entretien',
  'refroidissement': 'antigel-ldr',
  'entretien-auto': 'produits-entretien',
  'moto-equipements-entretien': 'accessoires-moto',
  'auto-echappement': 'auto-autres-pieces', // Fusion des 81 produits d'échappement vers auto-autres-pieces
}

async function runRollback() {
  const files = fs.readdirSync(DUMPS_DIR).filter(f => f.startsWith('categories-pre-v4-backup-')).sort().reverse()
  if (files.length === 0) {
    throw new Error('Aucun fichier de backup snapshot trouvé dans ' + DUMPS_DIR)
  }
  const latestBackup = path.join(DUMPS_DIR, files[0])
  console.log(`Restauration depuis le snapshot : ${latestBackup}`)
  const raw = JSON.parse(fs.readFileSync(latestBackup, 'utf8'))
  const categories = raw.categories as any[]
  const productMappings = raw.productMappings as { productId: string; categoryId: string | null }[]

  await prisma.$transaction(async (tx) => {
    // 1. Restaurer catégories
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

    // 2. Restaurer associations produits
    for (const pm of productMappings) {
      await tx.product.update({
        where: { id: pm.productId },
        data: { categoryId: pm.categoryId },
      })
    }
  }, { timeout: 180_000 })

  console.log('Rollback terminé avec succès ✅')
}

async function main() {
  console.log('============================================================================')
  console.log(' REFONTE DE L\'ARBRE DE CATÉGORIES (TAXONOMIE V4)')
  console.log(` Mode : ${APPLY ? '🚀 APPLICATION RÉELLE' : '🔍 SIMULATION (DRY-RUN)'}`)
  console.log('============================================================================\n')

  if (ROLLBACK) {
    await runRollback()
    return
  }

  // 1. Lire l'état actuel en base
  const existingCategories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      parent: true,
    },
    orderBy: { sortOrder: 'asc' },
  })

  const totalProducts = await prisma.product.count()
  console.log(`Nombre total de catégories existantes : ${existingCategories.length}`)
  console.log(`Nombre total de produits en catalogue : ${totalProducts}\n`)

  // Snapshot de sauvegarde
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const snapshotFile = path.join(DUMPS_DIR, `categories-pre-v4-backup-${timestamp}.json`)

  if (APPLY) {
    console.log(`Création du snapshot de pré-sauvegarde : ${snapshotFile}...`)
    const productMappings = await prisma.product.findMany({
      select: { id: true, categoryId: true },
    })
    fs.writeFileSync(snapshotFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalCategories: existingCategories.length,
      totalProducts,
      categories: existingCategories,
      productMappings: productMappings.map(p => ({ productId: p.id, categoryId: p.categoryId })),
    }, null, 2))
    console.log('Snapshot créé avec succès ✅\n')
  }

  // Map des catégories par slug
  const catBySlug = new Map<string, typeof existingCategories[0]>()
  existingCategories.forEach(c => catBySlug.set(c.slug, c))

  // 2. Planification des actions
  console.log('--- ÉTAPE 1 : FUSIONS ET RENOMMAGES DE CATÉGORIES EXISTANTES ---')
  for (const [sourceSlug, targetSlug] of Object.entries(SLUG_MERGES_AND_RENAMES)) {
    const src = catBySlug.get(sourceSlug)
    const tgt = catBySlug.get(targetSlug)
    if (src) {
      if (sourceSlug === 'auto-echappement') {
        console.log(`  [FUSION PRODUITS] "${src.nameFr}" (${sourceSlug}, ${src._count.products} prod) -> sera transféré vers "${targetSlug}"`)
      } else {
        console.log(`  [RENOMMAGE/MIGRATION] "${src.nameFr}" (${sourceSlug}) -> deviendra slug "${targetSlug}"`)
      }
    }
  }

  console.log('\n--- ÉTAPE 2 : ARBORESCENCE CIBLE ---')
  const toCreate: TargetCategoryDef[] = []
  const toUpdate: { id: string; nameFr: string; parentSlug: string | null; sortOrder: number }[] = []

  for (const target of TARGET_TREE) {
    const existing = catBySlug.get(target.slug)
    if (existing) {
      toUpdate.push({
        id: existing.id,
        nameFr: target.nameFr,
        parentSlug: target.parentSlug,
        sortOrder: target.sortOrder,
      })
      console.log(`  [EXISTE & MIS À JOUR] ${target.nameFr} (${target.slug}) - ${existing._count.products} produits`)
    } else {
      toCreate.push(target)
      console.log(`  [NOUVELLE CATÉGORIE] ${target.nameFr} (${target.slug}) [parent: ${target.parentSlug || 'RACINE'}]`)
    }
  }

  console.log(`\nRésumé : ${toCreate.length} catégories à créer, ${toUpdate.length} catégories à mettre à jour.`)

  if (!APPLY) {
    console.log('\n⚠️  Simulation terminée. Aucun changement n\'a été écrit en base.')
    console.log('Pour exécuter ces changements, relancez avec le flag : --apply')
    return
  }

  // 3. Exécution réelle dans une transaction Prisma
  console.log('\nExécution de la transaction de migration...')
  await prisma.$transaction(async (tx) => {
    // A. Gérer d'abord les fusions de produits (ex: auto-echappement vers auto-autres-pieces)
    const echappement = catBySlug.get('auto-echappement')
    const autresPieces = catBySlug.get('auto-autres-pieces')
    if (echappement && autresPieces) {
      const moved = await tx.product.updateMany({
        where: { categoryId: echappement.id },
        data: { categoryId: autresPieces.id },
      })
      console.log(`  -> ${moved.count} produits d'échappement transférés vers auto-autres-pieces.`)
      // Supprimer l'ancienne catégorie vide
      await tx.category.delete({ where: { id: echappement.id } })
    }

    // B. Gérer les renommages de slugs existants
    for (const [oldSlug, newSlug] of Object.entries(SLUG_MERGES_AND_RENAMES)) {
      if (oldSlug === 'auto-echappement') continue // déjà traité
      const c = await tx.category.findUnique({ where: { slug: oldSlug } })
      if (c) {
        // Vérifier si newSlug existe déjà
        const alreadyExists = await tx.category.findUnique({ where: { slug: newSlug } })
        if (alreadyExists) {
          // Fusionner produits
          await tx.product.updateMany({
            where: { categoryId: c.id },
            data: { categoryId: alreadyExists.id },
          })
          await tx.category.delete({ where: { id: c.id } })
        } else {
          await tx.category.update({
            where: { id: c.id },
            data: { slug: newSlug },
          })
        }
      }
    }

    // C. Créer ou s'assurer de l'existence des catégories de TARGET_TREE
    // Premier passage : créer les catégories sans parent
    const idBySlug = new Map<string, string>()
    for (const item of TARGET_TREE) {
      const cat = await tx.category.upsert({
        where: { slug: item.slug },
        create: {
          nameFr: item.nameFr,
          slug: item.slug,
          sortOrder: item.sortOrder,
        },
        update: {
          nameFr: item.nameFr,
          sortOrder: item.sortOrder,
        },
      })
      idBySlug.set(item.slug, cat.id)
    }

    // Deuxième passage : relier les parents
    for (const item of TARGET_TREE) {
      const currentId = idBySlug.get(item.slug)
      const parentId = item.parentSlug ? idBySlug.get(item.parentSlug) ?? null : null
      if (currentId) {
        await tx.category.update({
          where: { id: currentId },
          data: { parentId },
        })
      }
    }

    // D. Reclassification automatique des produits vers les catégories cibles & Extraction specs.batteryType
    console.log('  Reclassification automatique des produits...')

    // 1. Batteries
    const batteryCatId = idBySlug.get('batteries')
    if (batteryCatId) {
      const batteryProducts = await tx.product.findMany({
        where: {
          OR: [
            { categoryId: batteryCatId },
            { nameFr: { contains: 'batterie', mode: 'insensitive' } },
            { description: { contains: 'batterie', mode: 'insensitive' } },
            { sku: { startsWith: 'BAT', mode: 'insensitive' } },
          ],
        },
        include: { specs: true },
      })

      console.log(`  -> Traitement de ${batteryProducts.length} produits batteries...`)
      for (const prod of batteryProducts) {
        if (prod.categoryId !== batteryCatId) {
          await tx.product.update({
            where: { id: prod.id },
            data: { categoryId: batteryCatId },
          })
        }

        if (!prod.specs?.batteryType) {
          const combined = `${prod.nameFr} ${prod.description || ''} ${prod.sku}`.toUpperCase()
          let detectedType: string | null = null
          const dinMatch = combined.match(/\b(L[0-6]|HF|AGM|EFB|JIS|TYPE\s+[DM]|XEV)\b/i)
          if (dinMatch) {
            detectedType = dinMatch[1].replace(/\s+/g, ' ').toUpperCase()
          } else if (combined.includes('START-STOP') || combined.includes('START & STOP')) {
            detectedType = combined.includes('EFB') ? 'EFB' : 'AGM'
          }

          if (detectedType) {
            await tx.productSpecs.upsert({
              where: { productId: prod.id },
              create: {
                productId: prod.id,
                batteryType: detectedType,
              },
              update: {
                batteryType: detectedType,
              },
            })
          }
        }
      }
    }

    // 2. Filtres (sous-catégories)
    const autoFiltresId = idBySlug.get('auto-filtres')
    const airId = idBySlug.get('filtre-a-air')
    const huileId = idBySlug.get('filtre-a-huile')
    const carburantId = idBySlug.get('filtre-a-carburant')
    const habitacleId = idBySlug.get('filtre-habitacle')
    const hydrId = idBySlug.get('filtre-hydraulique')

    if (autoFiltresId) {
      if (airId) {
        await tx.product.updateMany({
          where: {
            categoryId: autoFiltresId,
            OR: [
              { nameFr: { contains: 'filtre à air', mode: 'insensitive' } },
              { nameFr: { contains: 'filtre a air', mode: 'insensitive' } },
              { nameFr: { contains: 'air filter', mode: 'insensitive' } },
            ],
          },
          data: { categoryId: airId },
        })
      }
      if (huileId) {
        await tx.product.updateMany({
          where: {
            categoryId: autoFiltresId,
            OR: [
              { nameFr: { contains: 'filtre à huile', mode: 'insensitive' } },
              { nameFr: { contains: 'filtre a huile', mode: 'insensitive' } },
              { nameFr: { contains: 'oil filter', mode: 'insensitive' } },
            ],
          },
          data: { categoryId: huileId },
        })
      }
      if (carburantId) {
        await tx.product.updateMany({
          where: {
            categoryId: autoFiltresId,
            OR: [
              { nameFr: { contains: 'filtre à carburant', mode: 'insensitive' } },
              { nameFr: { contains: 'filtre a carburant', mode: 'insensitive' } },
              { nameFr: { contains: 'filtre carburant', mode: 'insensitive' } },
              { nameFr: { contains: 'filtre à gasoil', mode: 'insensitive' } },
              { nameFr: { contains: 'filtre a gasoil', mode: 'insensitive' } },
              { nameFr: { contains: 'filtre gasoil', mode: 'insensitive' } },
              { nameFr: { contains: 'filtre essence', mode: 'insensitive' } },
              { nameFr: { contains: 'fuel filter', mode: 'insensitive' } },
            ],
          },
          data: { categoryId: carburantId },
        })
      }
      if (habitacleId) {
        await tx.product.updateMany({
          where: {
            categoryId: autoFiltresId,
            OR: [
              { nameFr: { contains: 'habitacle', mode: 'insensitive' } },
              { nameFr: { contains: 'pollen', mode: 'insensitive' } },
              { nameFr: { contains: 'cabin filter', mode: 'insensitive' } },
            ],
          },
          data: { categoryId: habitacleId },
        })
      }
      if (hydrId) {
        await tx.product.updateMany({
          where: {
            categoryId: autoFiltresId,
            nameFr: { contains: 'hydraulique', mode: 'insensitive' },
          },
          data: { categoryId: hydrId },
        })
      }
    }

    // 3. Liquides de Frein (DOT 3, DOT 4, DOT 5.1)
    const liqFreinId = idBySlug.get('liquide-de-frein')
    const dot3Id = idBySlug.get('liquide-frein-dot3')
    const dot4Id = idBySlug.get('liquide-frein-dot4')
    const dot51Id = idBySlug.get('liquide-frein-dot5-1')

    if (liqFreinId) {
      if (dot3Id) {
        await tx.product.updateMany({
          where: {
            categoryId: liqFreinId,
            nameFr: { contains: 'dot 3', mode: 'insensitive' },
          },
          data: { categoryId: dot3Id },
        })
      }
      if (dot4Id) {
        await tx.product.updateMany({
          where: {
            categoryId: liqFreinId,
            nameFr: { contains: 'dot 4', mode: 'insensitive' },
          },
          data: { categoryId: dot4Id },
        })
      }
      if (dot51Id) {
        await tx.product.updateMany({
          where: {
            categoryId: liqFreinId,
            OR: [
              { nameFr: { contains: 'dot 5.1', mode: 'insensitive' } },
              { nameFr: { contains: 'dot 5', mode: 'insensitive' } },
            ],
          },
          data: { categoryId: dot51Id },
        })
      }
    }

    // 4. Additifs (Boîte et Pont)
    const additifsId = idBySlug.get('additifs')
    const additifBoiteId = idBySlug.get('additif-boite-pont')
    if (additifsId && additifBoiteId) {
      await tx.product.updateMany({
        where: {
          categoryId: additifsId,
          OR: [
            { nameFr: { contains: 'boîte', mode: 'insensitive' } },
            { nameFr: { contains: 'boite', mode: 'insensitive' } },
            { nameFr: { contains: 'pont', mode: 'insensitive' } },
          ],
        },
        data: { categoryId: additifBoiteId },
      })
    }
  }, { timeout: 180_000 })

  // 4. Assertions post-migration
  const postProductCount = await prisma.product.count()
  console.log(`\nVérification intégrité du catalogue :`)
  console.log(`  Produits avant : ${totalProducts}`)
  console.log(`  Produits après : ${postProductCount}`)
  if (postProductCount !== totalProducts) {
    throw new Error(`ALERTE FATALE : Incohérence de produit (${totalProducts} -> ${postProductCount})`)
  }
  console.log('✅ ZÉRO perte de produit. Tous les produits sont conservés et rattachés.')

  // Afficher l'arbre final
  const roots = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true,
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: 'asc' },
  })

  console.log('\n============================================================================')
  console.log(' NOUVEL ARBRE DE CATÉGORIES EN BASE DE DONNÉES :')
  console.log('============================================================================')
  roots.forEach(r => {
    console.log(`📂 [${r.sortOrder}] ${r.nameFr} (${r.slug}) [${r._count.products} prod direct]`)
    r.children.forEach(c1 => {
      console.log(`   ├── ${c1.nameFr} (${c1.slug}) [${c1._count.products} prod]`)
      c1.children.forEach(c2 => {
        console.log(`   │    └── ${c2.nameFr} (${c2.slug})`)
      })
    })
  })
  console.log('\nMIGRATION APPLIQUÉE AVEC SUCCÈS ! 🚀')
}

main()
  .catch((e) => {
    console.error('FATAL:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
