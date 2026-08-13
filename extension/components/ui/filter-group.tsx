import * as React from 'react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterGroupProps {
  options: FilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function FilterGroup({ options, value, onValueChange, className }: FilterGroupProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 p-1 bg-background border border-border rounded-xl', className)}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 h-7 text-xs font-medium transition-all select-none cursor-pointer',
              active
                ? 'bg-accent text-primary font-semibold border border-border shadow-xs'
                : 'tint-text hover:text-foreground hover:bg-accent/30'
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}