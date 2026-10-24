import { CalendarCheck2, History } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { formatGradeSummary } from '../types/grade';
import type { GradeHistoryItem } from '../types/member';
import { BeltBadge } from './belt-badge';

export type GradeHistoryListProps = {
  histories: GradeHistoryItem[];
  isLoading?: boolean;
};

export function GradeHistoryList({ histories, isLoading = false }: GradeHistoryListProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">Riwayat Tingkatan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <History className="size-4.5 text-primary" />
            <span>Riwayat Tingkatan Sabuk</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Rekam jejak kenaikan sabuk dan kyu/dan anggota sejak awal terdaftar.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {histories.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Belum ada riwayat tingkatan yang tercatat.
          </p>
        ) : (
          <div className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-border/80">
            {histories.map((item) => {
              const isInitial = item.source === 'INITIAL';
              const dateStr = item.occurredAt
                ? new Date(item.occurredAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-';

              return (
                <div key={item.id} className="group relative">
                  {/* Timeline bullet */}
                  <span className="absolute top-1 -left-6 flex size-5 items-center justify-center rounded-full bg-background ring-4 ring-background">
                    {isInitial ? (
                      <span className="size-2.5 rounded-full bg-muted-foreground" />
                    ) : (
                      <span className="size-2.5 rounded-full bg-primary" />
                    )}
                  </span>

                  <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs transition-colors hover:border-primary/40">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        {isInitial ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                            Input Awal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            <CalendarCheck2 className="size-3" />
                            Ujian: {item.exam?.name || 'Kenaikan Sabuk'}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">&bull; {dateStr}</span>
                      </div>

                      {/* Grade pill */}
                      <div className="flex items-center gap-2">
                        {item.fromBelt ? (
                          <>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatGradeSummary(
                                item.fromBelt.name,
                                item.fromKyu ?? 10,
                                item.fromDan,
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">&rarr;</span>
                          </>
                        ) : null}
                        <BeltBadge order={item.toBelt.order} name={item.toBelt.name} />
                        <span className="text-xs font-bold text-foreground">
                          {formatGradeSummary(item.toBelt.name, item.toKyu, item.toDan)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
