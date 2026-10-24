'use client';

import Link from 'next/link';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { formatGradeSummary } from '../types/grade';
import { MEMBER_TYPE_LABELS, type Member } from '../types/member';
import { BeltBadge } from './belt-badge';

export type MemberTableProps = {
  members: Member[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onDelete: (member: Member) => void;
};

export function MemberTable({
  members,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  onDelete,
}: MemberTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center"
      >
        <p className="text-sm font-medium text-destructive">
          {errorMessage || 'Gagal memuat data member'}
        </p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : null}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="text-sm font-medium text-foreground">Belum ada data member</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Silakan tambah data atlet atau pelatih baru untuk klub karate Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6">
                No. Anggota
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Nama
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Tipe
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Cabang
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Sabuk
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Tingkatan
              </th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3.5 font-mono text-xs font-semibold sm:px-6">
                  <Link href={`/members/${member.id}`} className="text-primary hover:underline">
                    {member.memberNumber}
                  </Link>
                </td>
                <td className="px-4 py-3.5 font-medium text-foreground sm:px-6">
                  <Link href={`/members/${member.id}`} className="hover:underline">
                    {member.name}
                  </Link>
                </td>
                <td className="px-4 py-3.5 sm:px-6">
                  <Badge
                    variant={member.type === 'COACH' ? 'default' : 'secondary'}
                    className="text-[11px]"
                  >
                    {MEMBER_TYPE_LABELS[member.type]}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground sm:px-6">
                  {member.branch?.name || '-'}
                </td>
                <td className="px-4 py-3.5 sm:px-6">
                  <BeltBadge order={member.belt.order} name={member.belt.name} />
                </td>
                <td className="px-4 py-3.5 text-xs font-medium text-foreground sm:px-6">
                  {formatGradeSummary(member.belt.name, member.kyu, member.dan)}
                </td>
                <td className="px-4 py-3.5 text-right sm:px-6">
                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                    <Link
                      href={`/members/${member.id}`}
                      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                      aria-label={`Lihat detail ${member.name}`}
                      title="Detail"
                    >
                      <Eye className="size-3.5" />
                      <span className="hidden lg:inline">Detail</span>
                    </Link>
                    <Link
                      href={`/members/${member.id}/edit`}
                      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                      aria-label={`Ubah member ${member.name}`}
                      title="Ubah"
                    >
                      <Pencil className="size-3.5" />
                      <span className="hidden lg:inline">Ubah</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(member)}
                      aria-label={`Hapus member ${member.name}`}
                      title="Hapus"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="hidden lg:inline">Hapus</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
