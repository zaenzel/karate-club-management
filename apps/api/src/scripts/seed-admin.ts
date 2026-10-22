import * as argon2 from 'argon2';
import { createPrismaClient, UserRole } from '@karate/db';

import { loadEnv, loadRootEnvFile } from '../config/env.js';

async function main() {
  loadRootEnvFile();
  const env = loadEnv();

  const email = (env.SUPERADMIN_EMAIL || 'admin@karate.local').toLowerCase().trim();
  const password = env.SUPERADMIN_PASSWORD || 'AdminKarateDev123!';
  const name = env.SUPERADMIN_NAME || 'Super Admin';

  const prisma = createPrismaClient(env.DATABASE_URL);

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`[seed-admin] User ${email} sudah ada, melewati.`);
      return;
    }

    const passwordHash = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: UserRole.SUPERADMIN,
        isActive: true,
      },
    });

    console.log(`[seed-admin] Berhasil membuat Super Admin: ${user.email} (${user.id})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[seed-admin] Gagal:', err);
  process.exit(1);
});
