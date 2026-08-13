import * as React from 'react';
import { cn } from '@/lib/utils';

interface HoverActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
}

/** Absolute action button revealed on item hover without reserving layout space. */
export const HoverAction = React.forwardRef<HTMLButtonElement, HoverActionProps>(
  ({ icon, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'absolute top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 group-hover/item:opacity-100 hover:opacity-100 focus-visible:opacity-100 transition-opacity p-0.5 shrink-0 cursor-pointer',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  )
);
HoverAction.displayName = 'HoverAction';
