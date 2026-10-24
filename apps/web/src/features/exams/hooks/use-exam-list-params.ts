'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDebounce } from '@/hooks/use-debounce';

import type { ExamListParams, ExamStatus, ExamType } from '../types/exam';

export function useExamListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qFromUrl = searchParams.get('q') ?? '';
  const pageFromUrl = Number(searchParams.get('page')) || 1;
  const statusFromUrl = (searchParams.get('status') as ExamStatus) || '';
  const typeFromUrl = (searchParams.get('type') as ExamType) || '';
  const branchIdFromUrl = searchParams.get('branchId') ?? '';

  const [prevQ, setPrevQ] = useState(qFromUrl);
  const [search, setSearch] = useState(qFromUrl);

  if (prevQ !== qFromUrl) {
    setPrevQ(qFromUrl);
    setSearch(qFromUrl);
  }

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch !== qFromUrl) {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (debouncedSearch.trim()) {
        nextParams.set('q', debouncedSearch.trim());
      } else {
        nextParams.delete('q');
      }
      nextParams.set('page', '1');
      router.replace(`${pathname}?${nextParams.toString()}`);
    }
  }, [debouncedSearch, qFromUrl, pathname, router, searchParams]);

  const setPage = useCallback(
    (page: number) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set('page', String(page));
      router.push(`${pathname}?${nextParams.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const setFilter = useCallback(
    (key: 'status' | 'type' | 'branchId', value: string) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
      nextParams.set('page', '1');
      router.push(`${pathname}?${nextParams.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const params: ExamListParams = useMemo(
    () => ({
      page: pageFromUrl,
      pageSize: 10,
      q: qFromUrl || undefined,
      status: (statusFromUrl as ExamStatus) || undefined,
      type: (typeFromUrl as ExamType) || undefined,
      branchId: branchIdFromUrl || undefined,
    }),
    [pageFromUrl, qFromUrl, statusFromUrl, typeFromUrl, branchIdFromUrl],
  );

  return {
    params,
    search,
    setSearch,
    page: pageFromUrl,
    setPage,
    status: statusFromUrl,
    type: typeFromUrl,
    branchId: branchIdFromUrl,
    setFilter,
  };
}
