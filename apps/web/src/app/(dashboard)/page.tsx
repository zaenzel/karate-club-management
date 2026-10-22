import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Award,
  Building2,
  CalendarCheck2,
  ChevronRight,
  FileBadge2,
  LayoutGrid,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Beranda',
  description: 'Dashboard manajemen klub karate.',
};

const modules = [
  {
    title: 'Cabang (Dojo)',
    description: 'Kelola data cabang dojo, kontak pengurus, dan lokasi latihan.',
    href: '/branches',
    icon: Building2,
    tag: 'Fase 1',
  },
  {
    title: 'Member & Pelatih',
    description: 'Database coach dan murid karate, riwayat sabuk, dan status keanggotaan.',
    href: '/members',
    icon: Users,
    tag: 'Fase 1',
  },
  {
    title: 'Ujian Kenaikan Sabuk',
    description: 'Jadwal ujian kyu dan dan, pendaftaran peserta, serta pencatatan kelulusan.',
    href: '/exams',
    icon: CalendarCheck2,
    tag: 'Fase 1',
  },
  {
    title: 'Sertifikat Kelulusan',
    description: 'Penerbitan sertifikat digital resmi dengan QR code dan verifikasi publik.',
    href: '/certificates',
    icon: Award,
    tag: 'Fase 1',
  },
  {
    title: 'Template Sertifikat',
    description: 'Pengaturan format dan template sertifikat kustom untuk setiap tingkatan.',
    href: '/certificate-templates',
    icon: FileBadge2,
    tag: 'Fase 1',
  },
  {
    title: 'Referensi Fitur (Produk)',
    description: 'Contoh pola arsitektur feature-based: Query, Form, Zod, & API client.',
    href: '/products',
    icon: LayoutGrid,
    tag: 'Referensi',
  },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero / Welcome */}
      <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">Dashboard Utama</Badge>
              <span className="text-xs text-muted-foreground">Versi 1.0</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {siteConfig.name}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Sistem terpadu manajemen administrasi klub karate. Pantau data cabang dojo,
              keanggotaan atlet dan pelatih, pelaksanaan ujian kenaikan sabuk, hingga penerbitan
              sertifikat.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/products" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Lihat Contoh Modul
            </Link>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Modul Operasional</h2>
          <p className="text-xs text-muted-foreground">
            Pilih modul untuk mengelola data klub karate Anda
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="group block focus-visible:outline-none"
              >
                <Card className="h-full transition-all duration-150 group-hover:border-primary/40 group-hover:shadow-xs group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-2xs ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="size-4.5" />
                      </span>
                      <Badge
                        variant={mod.tag === 'Referensi' ? 'muted' : 'secondary'}
                        className="text-[10px]"
                      >
                        {mod.tag}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="flex items-center justify-between text-base transition-colors group-hover:text-primary">
                        <span>{mod.title}</span>
                        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary" />
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs leading-relaxed">
                        {mod.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className="text-xs font-medium text-primary group-hover:underline">
                      Buka modul &rarr;
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
