'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDebounce } from '@/hooks/use-debounce';

import type { BranchListParams } from '../types/branch';

export function useBranchListParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qFromUrl = searchParams.get('q') ?? '';
  const pageFromUrl = Number(searchParams.get('page')) || 1;

  const [prevQ, setPrevQ] = useState(qFromUrl);
  const [search, setSearch] = useState(qFromUrl);

  if (prevQ !== qFromUrl) {
    setPrevQ(qFromUrl);
    setSearch(qFromUrl);
  }

  const debouncedSearch = useDebounce(search, 300);

  // Sync debounced search to URL search params
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

  const params: BranchListParams = useMemo(
    () => ({
      page: pageFromUrl,
      pageSize: 10,
      q: qFromUrl || undefined,
    }),
    [pageFromUrl, qFromUrl],
  );

  return {
    params,
    search,
    setSearch,
    page: pageFromUrl,
    setPage,
  };
}
