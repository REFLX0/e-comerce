// prisma/dedupe-moto-category.ts
// One-off: merges the duplicate 'moto' root category into the canonical
// 'moto-karting' category, then deletes the loser.
//
// Run with: npx tsx prisma/dedupe-moto-category.ts
// (or ts-node, matching whatever the other seed scripts in this repo use)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LOSER_SLUG = 'moto'
const SURVIVOR_SLUG = 'moto-karting'

async function main() {
  const [loser, survivor] = await Promise.all([
    prisma.category.findUnique({ where: { slug: LOSER_SLUG } }),
    prisma.category.findUnique({ where: { slug: SURVIVOR_SLUG } }),
  ])

  if (!loser) {
    console.log(`No category with slug "${LOSER_SLUG}" found — nothing to do.`)
    return
  }
  if (!survivor) {
    throw new Error(
      `Canonical category "${SURVIVOR_SLUG}" not found. Run update-taxonomy-v3 first.`,
    )
  }
  if (loser.id === survivor.id) {
    console.log('Loser and survivor are already the same category — nothing to do.')
    return
  }

  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: loser.id } }),
    prisma.category.count({ where: { parentId: loser.id } }),
  ])
  console.log(
    `Merging "${LOSER_SLUG}" (${loser.id}) → "${SURVIVOR_SLUG}" (${survivor.id}): ` +
      `${productCount} product(s), ${childCount} child categor(y/ies).`,
  )

  await prisma.$transaction([
    // Repoint products
    prisma.product.updateMany({
      where: { categoryId: loser.id },
      data: { categoryId: survivor.id },
    }),
    // Repoint any child categories (in case 'moto' had subcategories of its own)
    prisma.category.updateMany({
      where: { parentId: loser.id },
      data: { parentId: survivor.id },
    }),
    // Delete the loser
    prisma.category.delete({ where: { id: loser.id } }),
  ])

  console.log('Done. "moto" removed, everything now points at "moto-karting".')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())