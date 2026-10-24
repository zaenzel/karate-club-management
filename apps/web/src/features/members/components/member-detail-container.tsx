'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ErrorState } from '@/components/common/error-state';

import { useDeleteMember } from '../api/delete-member';
import { useMember } from '../api/get-member';
import { useMemberGradeHistory } from '../api/get-member-grade-history';
import { GradeHistoryList } from './grade-history-list';
import { MemberAchievementsContainer } from './member-achievements-container';
import { MemberDetail } from './member-detail';

export function MemberDetailContainer({ id }: { id: string }) {
  const router = useRouter();
  const { data: member, isLoading, isError, error, refetch } = useMember(id);
  const { data: gradeHistories = [], isLoading: isLoadingHistory } = useMemberGradeHistory(id);
  const deleteMutation = useDeleteMember();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!member) return;
    const confirmed = confirm(
      `Apakah Anda yakin ingin menghapus member ${member.name}? Tindakan ini tidak dapat dibatalkan.`,
    );
    if (!confirmed) return;

    try {
      setDeleteError(null);
      await deleteMutation.mutateAsync(member.id);
      router.push('/members');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus member';
      setDeleteError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="h-40 w-full animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <ErrorState
        message={error?.message || 'Data member tidak dapat dimuat atau telah dihapus.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-8">
      {deleteError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {deleteError}
        </div>
      ) : null}

      {/* Main Profile Info */}
      <MemberDetail member={member} onDelete={handleDelete} isDeleting={deleteMutation.isPending} />

      {/* Grade History Section */}
      <GradeHistoryList histories={gradeHistories} isLoading={isLoadingHistory} />

      {/* Achievements Section */}
      <MemberAchievementsContainer memberId={member.id} />
    </div>
  );
}
