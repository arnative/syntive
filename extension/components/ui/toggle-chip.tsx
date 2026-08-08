import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToggleChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: React.ReactNode;
}

/**
 * Selectable option pill used for theme modes, sync intervals, and similar
 * multi-option selectors. Replaces the repeated inline pattern:
 * `rounded-xl border text-xs font-medium` with active/inactive states.
 */
export function ToggleChip({ selected = false, icon, children, className, ...props }: ToggleChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer select-none',
        selected
          ? 'bg-accent border-border text-primary font-semibold'
          : 'bg-background border-border tint-text hover:text-foreground hover:bg-accent/30',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
