'use client';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/common/confirm-dialog';

import { useCreateAchievement } from '../api/create-achievement';
import { useDeleteAchievement } from '../api/delete-achievement';
import { useAchievements } from '../api/get-achievements';
import { useUpdateAchievement } from '../api/update-achievement';
import type { AchievementFormValues } from '../schemas/achievement-schema';
import { AchievementList } from './achievement-list';

export function MemberAchievementsContainer({ memberId }: { memberId: string }) {
  const { data: achievements = [], isLoading } = useAchievements(memberId);
  const createMutation = useCreateAchievement(memberId);
  const updateMutation = useUpdateAchievement(memberId);
  const deleteMutation = useDeleteAchievement(memberId);
  const [achievementToDelete, setAchievementToDelete] = useState<string | null>(null);

  const handleAdd = (values: AchievementFormValues) => createMutation.mutateAsync(values);
  const handleUpdate = (id: string, values: AchievementFormValues) =>
    updateMutation.mutateAsync({ id, payload: values });
  const handleDelete = (id: string) => {
    setAchievementToDelete(id);
    return Promise.resolve();
  };

  const handleConfirmDelete = async () => {
    if (!achievementToDelete) return;
    await deleteMutation.mutateAsync(achievementToDelete);
    setAchievementToDelete(null);
  };

  return (
    <>
      <AchievementList
        achievements={achievements}
        isLoading={isLoading}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isSubmitting={
          createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
        }
      />

      <ConfirmDialog
        isOpen={Boolean(achievementToDelete)}
        onClose={() => setAchievementToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Catatan Prestasi"
        description="Apakah Anda yakin ingin menghapus catatan prestasi ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Prestasi"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
