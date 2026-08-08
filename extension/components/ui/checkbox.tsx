import * as React from 'react';
import { Minus } from 'reicon-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
}: CheckboxProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onCheckedChange) {
      onCheckedChange(checked === false);
    }
  };

  const isChecked = checked === true;
  const isIndeterminate = checked === 'indeterminate';
  const isActive = isChecked || isIndeterminate;

  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={isIndeterminate ? 'mixed' : isChecked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'h-4.5 w-4.5 rounded-md flex items-center justify-center shrink-0 transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-primary text-primary-foreground border border-primary scale-100'
          : 'bg-background/80 hover:bg-accent border border-border text-transparent hover:border-primary/60',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isIndeterminate ? (
        <Minus className="h-3.5 w-3.5 stroke-3 transition-transform duration-150 scale-100 opacity-100" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'h-3 w-3 transition-transform duration-150',
            isChecked ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          )}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}
