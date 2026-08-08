import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: 'primary' | 'online' | 'offline' | 'warning' | 'info' | 'neutral' | 'live';
  showDot?: boolean;
  pulseDot?: boolean;
  compact?: boolean;
}

const statusStyles = {
  primary: 'bg-primary/10 text-primary border-primary/30 font-medium',
  online: 'bg-(--color-success)/10 text-(--color-success) border-(--color-success)/20',
  live: 'bg-(--color-success)/10 text-(--color-success) border-(--color-success)/20 font-medium',
  offline: 'bg-(--color-destructive)/10 text-(--color-destructive) border-(--color-destructive)/20',
  warning: 'bg-(--color-warning)/10 text-(--color-warning) border-(--color-warning)/20',
  info: 'bg-(--color-info)/10 text-(--color-info) border-(--color-info)/20',
  neutral: 'bg-(--color-accent) text-(--color-muted-foreground) border-(--color-border)',
};

const dotStyles = {
  primary: 'bg-primary',
  online: 'bg-(--color-success)',
  live: 'bg-(--color-success)',
  offline: 'bg-(--color-destructive)',
  warning: 'bg-(--color-warning)',
  info: 'bg-(--color-info)',
  neutral: 'bg-(--color-muted-foreground)',
};

/**
 * Reusable StatusBadge component for colored status labels, status dots, and live badges.
 */
export function StatusBadge({
  status = 'neutral',
  showDot = false,
  pulseDot = false,
  compact = false,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors select-none',
        compact && 'text-[10px] px-2 py-0.5',
        statusStyles[status],
        className
      )}
      {...props}
    >
      {showDot && (
        <span className="relative flex h-2 w-2 shrink-0">
          {pulseDot && (
            <span
              className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', dotStyles[status])}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', dotStyles[status])} />
        </span>
      )}
      {children}
    </span>
  );
}
