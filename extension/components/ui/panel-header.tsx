import * as React from 'react';
import { cn } from '@/lib/utils';

interface PanelHeaderProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  /** Slot rendered on the right side (e.g. badge, action button). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Icon + title row used inside Panel containers. Replaces the repeated inline:
 * `flex items-center gap-2 font-medium text-(--color-foreground) text-xs`
 */
export function PanelHeader({ icon, title, action, className }: PanelHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-2 font-medium text-foreground text-xs">
        {icon}
        <span>{title}</span>
      </div>
      {action}
    </div>
  );
}
