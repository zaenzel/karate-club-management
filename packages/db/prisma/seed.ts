import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';

// Urutan warna sabuk klub. Rentang kyu per warna tidak ditentukan (dipilih manual saat ujian).
const BELTS = [
  { order: 1, name: 'Putih', colorHex: '#FFFFFF' },
  { order: 2, name: 'Kuning', colorHex: '#FACC15' },
  { order: 3, name: 'Hijau', colorHex: '#16A34A' },
  { order: 4, name: 'Biru', colorHex: '#2563EB' },
  { order: 5, name: 'Cokelat', colorHex: '#92400E' },
  { order: 6, name: 'Hitam', colorHex: '#111111' },
] as const;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL belum di-set. Salin .env.example ke .env di root repo.');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  for (const belt of BELTS) {
    await prisma.belt.upsert({
      where: { order: belt.order },
      update: { name: belt.name, colorHex: belt.colorHex },
      create: belt,
    });
  }
  console.warn(`Seed selesai: ${BELTS.length} warna sabuk.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
