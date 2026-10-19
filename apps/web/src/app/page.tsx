import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">{siteConfig.name}</h1>
      <p className="max-w-xl text-muted-foreground">
        Sistem manajemen klub karate. Contoh fitur Produk masih dipertahankan sebagai referensi pola
        kode (komponen → hook → fungsi API → api-client) sampai fitur pertama selesai dibuat.
      </p>
      <div>
        <Link href="/products" className={buttonVariants()}>
          Lihat contoh fitur (referensi)
        </Link>
      </div>
    </section>
  );
}
