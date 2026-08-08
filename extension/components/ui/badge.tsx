import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-(--color-primary) text-(--color-primary-foreground)',
        secondary: 'border-transparent bg-(--color-secondary) text-(--color-secondary-foreground)',
        outline: 'border-(--color-border) text-(--color-foreground)',
        success: 'border-transparent bg-(--color-success) text-black',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

/** Predefined color schemes for colored status pills. */
const colorStyles: Record<string, string> = {
  emerald: 'bg-(--color-success)/10 text-(--color-success) border-(--color-success)/20',
  sky: 'bg-(--color-info)/10 text-(--color-info) border-(--color-info)/20',
  rose: 'bg-(--color-destructive)/10 text-(--color-destructive) border-(--color-destructive)/20',
  accent: 'bg-(--color-accent) text-(--color-foreground) border-(--color-border)',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Named color scheme. Overrides `variant` styling when set. */
  color?: 'emerald' | 'sky' | 'rose' | 'accent';
  /** Smaller text size for compact badges (9px). */
  compact?: boolean;
}

export function Badge({ className, variant, color, compact, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        color ? cn('inline-flex items-center rounded-full border px-2 py-0.5 font-semibold transition-colors', colorStyles[color]) : badgeVariants({ variant }),
        compact && 'text-[9px] px-2 py-0.5',
        className
      )}
      {...props}
    />
  );
}
