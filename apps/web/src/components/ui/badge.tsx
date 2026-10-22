import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'border border-primary/20 bg-primary/10 text-primary',
        secondary: 'border border-accent-foreground/10 bg-accent text-accent-foreground',
        outline: 'border border-border bg-background text-foreground',
        muted: 'border border-border/50 bg-muted text-muted-foreground',
        success: 'border border-success/20 bg-success/12 text-success',
        destructive: 'border border-destructive/20 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
