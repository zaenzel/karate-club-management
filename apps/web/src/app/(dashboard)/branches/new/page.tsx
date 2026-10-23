import type { Metadata } from 'next';

import { PageHeader } from '@/components/common/page-header';
import { CreateBranchContainer } from '@/features/branches';

export const metadata: Metadata = { title: 'Tambah Cabang' };

export default function NewBranchPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tambah Cabang"
        description="Daftarkan cabang atau dojo baru ke dalam sistem."
      />
      <CreateBranchContainer />
    </div>
  );
}
