import Link from 'next/link';

import { EmptyState } from '@/components/common/empty-state';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <EmptyState
        title="Halaman tidak ditemukan"
        description="Periksa kembali URL yang kamu buka."
        action={
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            Kembali ke beranda
          </Link>
        }
      />
    </div>
  );
}
