/**
 * Run this script to downgrade a Google OAuth user from ADMIN to CUSTOMER.
 * Usage: node frontend/scripts/fix-user-role.mjs kmarrouraa@gmail.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const email = process.argv[2]
if (!email) {
  console.error('Usage: node fix-user-role.mjs <email>')
  process.exit(1)
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`No user found with email: ${email}`)
    process.exit(1)
  }

  console.log(`Found user: ${user.name} (${user.email}), current role: ${user.role}`)

  if (user.role === 'CUSTOMER') {
    console.log('User is already CUSTOMER — nothing to do.')
    process.exit(0)
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'CUSTOMER' },
  })

  console.log(`✅ Role updated: ${user.role} → ${updated.role}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
