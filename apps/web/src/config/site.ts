import { env } from './env';

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description:
    'Sistem manajemen klub karate: cabang, member, ujian kenaikan sabuk, dan sertifikat.',
  nav: [
    { label: 'Beranda', href: '/' },
    { label: 'Produk', href: '/products' },
  ],
} as const;
