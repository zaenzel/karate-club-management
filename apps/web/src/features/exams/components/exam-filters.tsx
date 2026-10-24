'use client';

import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

import type { BranchOption } from '../api/get-branch-options';
import {
  EXAM_STATUS_LABELS,
  EXAM_TYPE_LABELS,
  type ExamStatus,
  type ExamType,
} from '../types/exam';

export interface ExamFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  type: string;
  branchId: string;
  onFilterChange: (key: 'status' | 'type' | 'branchId', value: string) => void;
  branchOptions: BranchOption[];
}

export function ExamFilters({
  search,
  onSearchChange,
  status,
  type,
  branchId,
  onFilterChange,
  branchOptions,
}: ExamFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 md:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari nama ujian atau lokasi..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Cari ujian"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Filter Status */}
        <select
          value={status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Filter status ujian"
        >
          <option value="">Semua status</option>
          {(Object.keys(EXAM_STATUS_LABELS) as ExamStatus[]).map((st) => (
            <option key={st} value={st}>
              {EXAM_STATUS_LABELS[st]}
            </option>
          ))}
        </select>

        {/* Filter Jenis */}
        <select
          value={type}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Filter jenis ujian"
        >
          <option value="">Semua jenis</option>
          {(Object.keys(EXAM_TYPE_LABELS) as ExamType[]).map((t) => (
            <option key={t} value={t}>
              {EXAM_TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        {/* Filter Cabang */}
        <select
          value={branchId}
          onChange={(e) => onFilterChange('branchId', e.target.value)}
          className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Filter cabang ujian"
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
  );
}
