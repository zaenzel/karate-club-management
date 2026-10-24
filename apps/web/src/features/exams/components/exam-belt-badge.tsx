import { cn } from '@/lib/utils';

export interface ExamBeltBadgeProps {
  order: number;
  name: string;
  className?: string;
}

export function ExamBeltBadge({ order, name, className }: ExamBeltBadgeProps) {
  const stylesByOrder: Record<number, string> = {
    1: 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
    2: 'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/80 dark:text-amber-300',
    3: 'border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/80 dark:text-emerald-300',
    4: 'border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-700/60 dark:bg-blue-950/80 dark:text-blue-300',
    5: 'border-amber-800/40 bg-amber-900/15 text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200',
    6: 'border-neutral-700 bg-neutral-900 text-neutral-100 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100',
  };

  const badgeStyle = stylesByOrder[order] ?? 'border-border bg-muted text-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs select-none',
        badgeStyle,
        className,
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full ring-1 ring-black/20 dark:ring-white/30',
          order === 1 && 'bg-slate-300 dark:bg-slate-400',
          order === 2 && 'bg-amber-500',
          order === 3 && 'bg-emerald-500',
          order === 4 && 'bg-blue-500',
          order === 5 && 'bg-amber-800',
          order === 6 && 'bg-neutral-950 dark:bg-neutral-100',
        )}
      />
      <span>{name}</span>
    </span>
  );
}
