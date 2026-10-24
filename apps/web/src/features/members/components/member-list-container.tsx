'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { PageHeader } from '@/components/common/page-header';
import { Button, buttonVariants } from '@/components/ui/button';

import { useBelts } from '../api/get-belts';
import { useBranchOptions } from '../api/get-branch-options';
import { useDeleteMember } from '../api/delete-member';
import { useMembers } from '../api/get-members';
import { useMemberListParams } from '../hooks/use-member-list-params';
import type { Member } from '../types/member';
import { MemberFilters } from './member-filters';
import { MemberTable } from './member-table';

export function MemberListContainer() {
  const { params, search, setSearch, page, setPage, branchId, type, beltId, setFilter } =
    useMemberListParams();

  const { data, isLoading, isError, error, refetch } = useMembers(params);
  const { data: branchOptions = [] } = useBranchOptions();
  const { data: belts = [] } = useBelts();
  const deleteMutation = useDeleteMember();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const handleDelete = (member: Member) => {
    setMemberToDelete(member);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      setDeleteError(null);
      await deleteMutation.mutateAsync(memberToDelete.id);
      setMemberToDelete(null);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus member');
    }
  };

  const members = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member & Pelatih"
        description="Kelola data atlet, pelatih (coach), riwayat sabuk dan tingkatan dojo."
        actions={
          <Link href="/members/new" className={buttonVariants({ size: 'sm' })}>
            <Plus className="size-4" />
            <span>Tambah Member</span>
          </Link>
        }
      />

      {deleteError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {deleteError}
        </div>
      ) : null}

      <MemberFilters
        search={search}
        onSearchChange={setSearch}
        branchId={branchId}
        type={type}
        beltId={beltId}
        onFilterChange={setFilter}
        branchOptions={branchOptions}
        belts={belts}
      />

      <MemberTable
        members={members}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={refetch}
        onDelete={handleDelete}
      />

      {/* Pagination Controls */}
      {meta && meta.total > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="font-medium text-foreground">{members.length}</span> dari{' '}
            <span className="font-medium text-foreground">{meta.total}</span> data member
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </Button>
            <span className="px-2 text-xs font-medium text-foreground">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              aria-label="Halaman berikutnya"
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Member"
        description={`Apakah Anda yakin ingin menghapus member ${memberToDelete?.name} (${memberToDelete?.memberNumber})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Member"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
