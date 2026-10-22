import { env } from './env';

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description:
    'Sistem manajemen klub karate: cabang, member, ujian kenaikan sabuk, dan sertifikat.',
  nav: [
    { label: 'Beranda', href: '/' },
    { label: 'Cabang', href: '/branches' },
    { label: 'Member', href: '/members' },
    { label: 'Ujian', href: '/exams' },
    { label: 'Sertifikat', href: '/certificates' },
    { label: 'Template Sertifikat', href: '/certificate-templates' },
    { label: 'Produk', href: '/products' },
  ],
} as const;
