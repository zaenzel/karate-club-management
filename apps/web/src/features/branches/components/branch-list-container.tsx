'use client';

import { Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useBranches } from '../api/get-branches';
import { useDeleteBranch } from '../api/delete-branch';
import { useBranchListParams } from '../hooks/use-branch-list-params';
import { BranchTable } from './branch-table';
import type { Branch } from '../types/branch';

export function BranchListContainer() {
  const { params, search, setSearch, page, setPage } = useBranchListParams();
  const { data, isLoading, isError, error, refetch } = useBranches(params);
  const deleteMutation = useDeleteBranch();

  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!branchToDelete) return;
    setDeleteError(null);

    try {
      await deleteMutation.mutateAsync(branchToDelete.id);
      setBranchToDelete(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal menghapus cabang. Silakan coba lagi.';
      setDeleteError(message);
    }
  };

  const totalPages = data?.meta.totalPages ?? 1;
  const total = data?.meta.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama, atau kota cabang..."
            className="pl-9"
          />
        </div>
        {data ? (
          <p className="text-xs text-muted-foreground sm:text-right">
            Menampilkan {data.data.length} dari {total} cabang
          </p>
        ) : null}
      </div>

      {/* Table */}
      <BranchTable
        branches={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => void refetch()}
        onDelete={(branch) => {
          setDeleteError(null);
          setBranchToDelete(branch);
        }}
      />

      {/* Pagination Controls */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
          <p className="text-xs">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="size-4" />
              <span>Sebelumnya</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || isLoading}
            >
              <span>Berikutnya</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {branchToDelete ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <h2 id="delete-dialog-title" className="text-base font-semibold text-foreground">
                  Hapus Cabang {branchToDelete.name}?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Apakah Anda yakin ingin menghapus cabang{' '}
                  <span className="font-semibold text-foreground">{branchToDelete.code}</span>?
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            {deleteError ? (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {deleteError}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBranchToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleteMutation.isPending}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Menghapus…' : 'Hapus Cabang'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
