import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ListItemCardProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Horizontal row card used for device sessions, item lists, etc. Replaces:
 * `flex items-center justify-between bg-(--color-background) border border-(--color-border) rounded-xl p-3 text-xs`
 */
export function ListItemCard({ className, children, ...props }: ListItemCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between bg-background border border-border rounded-xl p-3 text-xs',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
