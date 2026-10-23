'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import type { Branch } from '../types/branch';

type BranchTableProps = {
  branches: Branch[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onDelete: (branch: Branch) => void;
};

export function BranchTable({
  branches,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  onDelete,
}: BranchTableProps) {
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
          {errorMessage || 'Gagal memuat data cabang'}
        </p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : null}
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="text-sm font-medium text-foreground">Belum ada cabang</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tambahkan cabang pertama untuk mulai mendata anggota dan ujian.
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
                Kode
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Nama Cabang
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Kota
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Telepon
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Anggota
              </th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {branches.map((branch) => (
              <tr key={branch.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3.5 font-mono text-xs font-semibold sm:px-6">
                  <Badge variant="outline">{branch.code}</Badge>
                </td>
                <td className="px-4 py-3.5 font-medium text-foreground sm:px-6">{branch.name}</td>
                <td className="px-4 py-3.5 text-muted-foreground sm:px-6">{branch.city}</td>
                <td className="px-4 py-3.5 text-muted-foreground sm:px-6">{branch.phone || '-'}</td>
                <td className="px-4 py-3.5 sm:px-6">
                  <span className="text-xs text-muted-foreground">
                    {branch.memberCount} anggota
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right sm:px-6">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/branches/${branch.id}/edit`}
                      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                      aria-label={`Ubah cabang ${branch.name}`}
                    >
                      <Pencil className="size-3.5" />
                      <span className="hidden sm:inline">Ubah</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(branch)}
                      aria-label={`Hapus cabang ${branch.name}`}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="hidden sm:inline">Hapus</span>
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
