import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable hover border highlight (e.g. for interactive panels). */
  hoverable?: boolean;
}

/**
 * Bordered content box — the standard "section container" used inside modals,
 * settings tabs, and card bodies. Replaces the repeated inline pattern:
 * `border border-(--color-border) bg-(--color-background)/60 rounded-xl p-4 space-y-3`
 */
export function Panel({ hoverable = false, className, children, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'border border-border bg-background/60 rounded-xl p-4 space-y-3',
        hoverable && 'transition-all hover:border-primary/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
