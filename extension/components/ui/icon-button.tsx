import * as React from 'react';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'accent' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-(--color-primary) text-(--color-primary-foreground) hover:opacity-90',
  outline: 'border border-(--color-border) bg-(--color-card) hover:bg-(--color-accent) text-(--color-foreground)',
  ghost: 'tint-text hover:text-(--color-foreground) hover:bg-(--color-accent)/50',
  accent: 'bg-(--color-accent) text-(--color-foreground) border border-(--color-border) hover:bg-(--color-accent)/80',
  destructive: 'bg-(--color-destructive)/10 text-(--color-destructive) border border-(--color-destructive)/20 hover:bg-(--color-destructive)/20',
};

const sizeStyles = {
  sm: 'h-7 w-7 rounded-lg text-xs',
  md: 'h-9 w-9 rounded-xl text-sm',
  lg: 'h-10 w-10 rounded-xl text-base',
};

/**
 * Reusable IconButton component for icon action triggers with consistent sizing, rounded corners, and micro-animations.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'outline', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex items-center justify-center shrink-0 transition-all cursor-pointer select-none active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
IconButton.displayName = 'IconButton';
