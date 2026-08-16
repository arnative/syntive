import * as React from 'react';
import { cn } from '@/lib/utils';

// Segmented pill button shared by the Bookmark, Trash, and Management toolbars.
export function FilterBtn({
  active,
  onClick,
  icon,
  label,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-3 h-6 text-xs font-medium transition-all select-none cursor-pointer',
        active
          ? 'bg-accent text-primary font-semibold border border-border'
          : 'tint-text hover:text-foreground hover:bg-accent/30'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
