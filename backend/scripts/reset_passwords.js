const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');
const p = new PrismaClient();

async function resetPasswords() {
  // New strong passwords
  const adminPassword = 'SpecPartAdmin@2026!';
  const achrefPassword = 'SpecPartAchref@2026!';

  const adminHash = await bcryptjs.hash(adminPassword, 12);
  const achrefHash = await bcryptjs.hash(achrefPassword, 12);

  await p.user.update({
    where: { email: 'admin@specpart.tn' },
    data: { passwordHash: adminHash },
  });

  await p.user.update({
    where: { email: 'achref@specpart.tn' },
    data: { passwordHash: achrefHash },
  });

  console.log('✅ Passwords reset successfully!\n');
  console.log('admin@specpart.tn   →  SpecPartAdmin@2026!');
  console.log('achref@specpart.tn  →  SpecPartAchref@2026!\n');
  console.log('Log in now and change your password at /fr/compte/securite');

  await p.$disconnect();
}

resetPasswords().catch(console.error);
