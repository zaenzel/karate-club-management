import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

/** Komponen shared: WAJIB dumb. Hanya props in → UI out. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-border/80 bg-card/40 px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground ring-1 ring-primary/20">
        <Inbox className="size-5" />
      </span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
