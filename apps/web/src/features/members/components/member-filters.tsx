'use client';

import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

import { MEMBER_TYPE_LABELS, type Belt, type BranchOption } from '../types/member';

export type MemberFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  branchId: string;
  type: string;
  beltId: string;
  onFilterChange: (key: 'branchId' | 'type' | 'beltId', value: string) => void;
  branchOptions?: BranchOption[];
  belts?: Belt[];
};

export function MemberFilters({
  search,
  onSearchChange,
  branchId,
  type,
  beltId,
  onFilterChange,
  branchOptions = [],
  belts = [],
}: MemberFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari berdasarkan nama atau no. anggota…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Cari member"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {/* Branch Filter */}
        <select
          value={branchId}
          onChange={(e) => onFilterChange('branchId', e.target.value)}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Filter cabang"
        >
          <option value="">Semua Cabang</option>
          {branchOptions.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={type}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Filter tipe member"
        >
          <option value="">Semua Tipe</option>
          <option value="COACH">{MEMBER_TYPE_LABELS.COACH}</option>
          <option value="STUDENT">{MEMBER_TYPE_LABELS.STUDENT}</option>
        </select>

        {/* Belt Filter */}
        <select
          value={beltId}
          onChange={(e) => onFilterChange('beltId', e.target.value)}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Filter warna sabuk"
        >
          <option value="">Semua Sabuk</option>
          {belts.map((b) => (
            <option key={b.id} value={b.id}>
              Sabuk {b.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
