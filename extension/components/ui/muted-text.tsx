import * as React from 'react';
import { cn } from '@/lib/utils';

interface MutedTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** 'xs' = 11px, '2xs' = 10px. Default: 'xs'. */
  size?: 'xs' | '2xs';
  as?: 'p' | 'span';
}

const sizeStyles = {
  xs: 'text-[11px]',
  '2xs': 'text-[10px]',
};

/**
 * Muted description text used throughout modals, panels, and settings.
 * Replaces the 14+ inline occurrences of `text-[10/11px] text-(--color-muted-foreground) leading-relaxed`.
 */
export function MutedText({ size = 'xs', as: Tag = 'p', className, children, ...props }: MutedTextProps) {
  return (
    <Tag
      className={cn(sizeStyles[size], 'text-muted-foreground leading-relaxed', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
