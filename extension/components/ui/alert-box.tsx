import * as React from 'react';
import { cn } from '@/lib/utils';

interface AlertBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  variant?: 'warning' | 'info';
}

const variantStyles = {
  warning: 'border-(--color-destructive)/20 bg-(--color-destructive)/5',
  info: 'border-(--color-primary)/20 bg-(--color-primary)/5',
};

/**
 * Colored alert/warning callout box. Replaces the inline:
 * `flex gap-3 rounded-xl border border-(--color-destructive)/20 bg-(--color-destructive)/5 p-3.5 text-[11px]`
 */
export function AlertBox({ icon, variant = 'warning', className, children, ...props }: AlertBoxProps) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-3.5 text-[11px] leading-relaxed text-muted-foreground',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
      <div>{children}</div>
    </div>
  );
}
