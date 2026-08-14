import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to create or get a category
async function ensureCategory(slug: string, nameFr: string, parentId: string | null, sortOrder: number) {
  let cat = await prisma.category.findUnique({ where: { slug } })
  if (!cat) {
    cat = await prisma.category.create({
      data: {
        id: `nav-${slug}`,
        nameFr,
        slug,
        parentId,
        sortOrder,
      }
    })
  } else {
    cat = await prisma.category.update({
      where: { slug },
      data: { nameFr, parentId, sortOrder }
    })
  }
  return cat
}

async function main() {
  console.log('Starting V3 Taxonomy restructure...')

  // ─── 1. AUTOMOBILE ──────────────────────────────────────────────
  const auto = await ensureCategory('automobile', 'Automobile', null, 1)

  // L2: Pièces de Rechange
  const autoRechange = await ensureCategory('auto-pieces-rechange', 'Pièces de Rechange / D\'origine', auto.id, 1)
  await ensureCategory('filtres', 'Filtres', autoRechange.id, 1)
  await ensureCategory('frein', 'Freinage', autoRechange.id, 2)
  await ensureCategory('suspension-direction', 'Suspension & Direction', autoRechange.id, 3)
  await ensureCategory('transmission', 'Boîte de Vitesse', autoRechange.id, 4)

  // L2: Huiles & Lubrifiants
  const autoLubrifiants = await ensureCategory('auto-huiles-lubrifiants', 'Huiles & Lubrifiants Moteur', auto.id, 2)
  await ensureCategory('huiles-moteur', 'Huile Moteur', autoLubrifiants.id, 1)
  await ensureCategory('liquides-auto', 'Liquides', autoLubrifiants.id, 2)
  await ensureCategory('additifs', 'Additifs', autoLubrifiants.id, 3)
  await ensureCategory('entretien-auto', 'Produits d\'entretien', autoLubrifiants.id, 4)


  // ─── 2. MOTO ───────────────────────────────────────────────────
  const moto = await ensureCategory('moto-karting', 'Moto', null, 2)

  // L2: Pièces & Consommables
  const motoPieces = await ensureCategory('moto-pieces-consommables', 'Pièces & Consommables', moto.id, 1)
  await ensureCategory('moto-huiles', 'Huiles moteur spécifiques', motoPieces.id, 1)
  await ensureCategory('moto-lubrifiants-chaine', 'Lubrifiants de chaîne', motoPieces.id, 2)

  // L2: Équipements & Entretien
  const motoEquip = await ensureCategory('moto-equipements-entretien', 'Équipements & Entretien', moto.id, 2)
  await ensureCategory('moto-nettoyage', 'Produits de nettoyage', motoEquip.id, 1)
  await ensureCategory('moto-eclairage', 'Éclairage', motoEquip.id, 2)


  // ─── 3. KARTING ────────────────────────────────────────────────
  const karting = await ensureCategory('karting', 'Karting', null, 3)

  // L2: Pièces & Consommables
  const kartPieces = await ensureCategory('karting-pieces-consommables', 'Pièces & Consommables', karting.id, 1)
  await ensureCategory('karting-huiles', 'Huiles et lubrifiants', kartPieces.id, 1)
  await ensureCategory('karting-additifs', 'Additifs et graisses', kartPieces.id, 2)


  // ─── 4. MARINE ─────────────────────────────────────────────────
  const marine = await ensureCategory('marine', 'Marine', null, 4)

  // L2: Huiles & Lubrifiants Marine
  const marineHuiles = await ensureCategory('marine-huiles-lubrifiants', 'Huiles & Lubrifiants Marine', marine.id, 1)
  await ensureCategory('marine-moteurs', 'Huiles moteurs marins', marineHuiles.id, 1)
  await ensureCategory('marine-graisses', 'Graisses et additifs', marineHuiles.id, 2)

  // L2: Entretien & Accessoires
  const marineEntretien = await ensureCategory('marine-entretien-accessoires', 'Entretien & Accessoires', marine.id, 2)
  await ensureCategory('marine-hivernage', 'Produits d\'hivernage et maintenance', marineEntretien.id, 1)

  console.log('V3 Taxonomy restructure complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
