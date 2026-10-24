'use client';

import { Search, UserPlus, X, AlertCircle, CheckSquare } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useEligibleMembers } from '../api/get-eligible-members';
import type { BranchOption } from '../api/get-branch-options';
import { ExamBeltBadge } from './exam-belt-badge';
import { formatGrade } from './participant-table';
import type { AddParticipantsResult } from '../types/participant';

export interface AddParticipantsDialogProps {
  examId: string;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memberIds: string[]) => Promise<AddParticipantsResult>;
  branchOptions: BranchOption[];
}

export function AddParticipantsDialog({
  examId,
  isOpen,
  onClose,
  onAdd,
  branchOptions,
}: AddParticipantsDialogProps) {
  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<AddParticipantsResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: eligibleMembers = [], isLoading } = useEligibleMembers(examId, {
    q: search,
    branchId: branchId || undefined,
  });

  if (!isOpen) return null;

  const handleToggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === eligibleMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleMembers.map((m) => m.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await onAdd(selectedIds);
      setSubmitResult(res);
      setSelectedIds([]);
      if (res.rejected.length === 0) {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan peserta';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Tambah Peserta Ujian</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup dialog">
            <X className="size-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="border-b border-border bg-muted/20 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau no. anggota..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Semua cabang</option>
              {branchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Warning / Rejected summary if any */}
        {submitResult && submitResult.rejected.length > 0 && (
          <div className="border-b border-destructive/20 bg-destructive/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertCircle className="size-4" />
              <span>
                {submitResult.addedCount} peserta berhasil ditambahkan, namun{' '}
                {submitResult.rejected.length} peserta ditolak:
              </span>
            </div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-destructive">
              {submitResult.rejected.map((r) => (
                <li key={r.memberId}>
                  <strong>{r.name}</strong>: {r.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {errorMessage && (
          <div className="border-b border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        {/* Member List */}
        <div className="max-h-[400px] flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Memuat member eligible…
            </p>
          ) : eligibleMembers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Tidak ada member eligible yang ditemukan atau seluruh member sudah terdaftar di ujian
              aktif.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 p-2.5">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-foreground select-none">
                  <input
                    type="checkbox"
                    checked={
                      eligibleMembers.length > 0 && selectedIds.length === eligibleMembers.length
                    }
                    onChange={handleSelectAll}
                    className="size-4 rounded accent-primary"
                  />
                  <span>
                    {selectedIds.length === eligibleMembers.length
                      ? 'Semua member tercentang'
                      : 'Centang semua member'}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {selectedIds.length} dari {eligibleMembers.length} dipilih
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 px-2.5 text-xs font-medium"
                  >
                    <CheckSquare className="mr-1 size-3.5" />
                    {selectedIds.length === eligibleMembers.length
                      ? 'Batal Checklist Semua'
                      : 'Checklist Semua'}
                  </Button>
                </div>
              </div>

              {eligibleMembers.map((member) => {
                const isSelected = selectedIds.includes(member.id);
                return (
                  <label
                    key={member.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
                      isSelected
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border bg-card hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleMember(member.id)}
                        className="size-4 rounded accent-primary"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {member.name}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {member.memberNumber}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{member.branch.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ExamBeltBadge order={member.belt.order} name={member.belt.name} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatGrade(member.kyu, member.dan)}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <span className="text-xs text-muted-foreground">{selectedIds.length} member dipilih</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={selectedIds.length === 0 || isSubmitting}>
              {isSubmitting ? 'Mendaftarkan…' : `Daftarkan ${selectedIds.length} Peserta`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
