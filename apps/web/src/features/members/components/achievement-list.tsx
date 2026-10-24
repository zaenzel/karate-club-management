'use client';

import { Award, Calendar, MapPin, Pencil, Plus, Trash2, Trophy } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { AchievementFormValues } from '../schemas/achievement-schema';
import { formatBirthDate } from '../types/grade';
import { ACHIEVEMENT_LEVEL_LABELS, type Achievement } from '../types/achievement';
import { AchievementForm } from './achievement-form';

export type AchievementListProps = {
  achievements: Achievement[];
  isLoading?: boolean;
  onAdd: (values: AchievementFormValues) => Promise<unknown>;
  onUpdate: (id: string, values: AchievementFormValues) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  isSubmitting?: boolean;
};

export function AchievementList({
  achievements,
  isLoading = false,
  onAdd,
  onUpdate,
  onDelete,
  isSubmitting = false,
}: AchievementListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [formError, setFormError] = useState<string | undefined>();

  const handleAddSubmit = async (values: AchievementFormValues) => {
    try {
      setFormError(undefined);
      await onAdd(values);
      setIsAdding(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menambahkan prestasi';
      setFormError(message);
    }
  };

  const handleEditSubmit = async (values: AchievementFormValues) => {
    if (!editingItem) return;
    try {
      setFormError(undefined);
      await onUpdate(editingItem.id, values);
      setEditingItem(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui prestasi';
      setFormError(message);
    }
  };

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Trophy className="size-4.5 text-amber-500" />
            <span>Prestasi & Kejuaraan</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Catatan medali, trofi, dan pencapaian kejuaraan yang diraih oleh anggota.
          </p>
        </div>

        {!isAdding && !editingItem ? (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="size-3.5" />
            <span>Tambah Prestasi</span>
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Form Add */}
        {isAdding ? (
          <AchievementForm
            onSubmit={handleAddSubmit}
            onCancel={() => {
              setIsAdding(false);
              setFormError(undefined);
            }}
            isSubmitting={isSubmitting}
            submitError={formError}
          />
        ) : null}

        {/* Form Edit */}
        {editingItem ? (
          <AchievementForm
            initialData={editingItem}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setEditingItem(null);
              setFormError(undefined);
            }}
            isSubmitting={isSubmitting}
            submitError={formError}
          />
        ) : null}

        {isLoading ? (
          <div className="space-y-3 py-2">
            <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
            <div className="h-16 w-full animate-pulse rounded-lg bg-muted" />
          </div>
        ) : achievements.length === 0 && !isAdding ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Belum ada catatan prestasi untuk anggota ini.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4 shadow-2xs transition-all hover:border-primary/40"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-foreground">{item.championship}</h4>
                      {item.category ? (
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      ) : null}
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {ACHIEVEMENT_LEVEL_LABELS[item.level]}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <Award className="size-3.5" />
                      {item.result}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatBirthDate(item.date)}
                    </span>
                    {item.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {item.location}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-1 border-t border-border/50 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setEditingItem(item);
                      setIsAdding(false);
                      setFormError(undefined);
                    }}
                  >
                    <Pencil className="size-3" />
                    <span>Ubah</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="size-3" />
                    <span>Hapus</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
