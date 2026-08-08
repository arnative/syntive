import { AngleDown, Check } from 'reicon-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Pilih opsi…',
  className,
  disabled = false,
}: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none transition-all hover:bg-accent/30 focus:ring-1 focus:ring-primary cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none',
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : <span className="tint-text">{placeholder}</span>}
          </span>
          <AngleDown className="h-3.5 w-3.5 tint-text opacity-70 shrink-0 ml-1.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-40 p-0 overflow-hidden bg-card border border-border rounded-2xl z-100"
      >
        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onValueChange(opt.value)}
                className={cn(
                  'flex items-center justify-between text-xs rounded-xl px-2.5 py-2 cursor-pointer transition-colors focus:bg-accent focus:text-accent-foreground font-medium',
                  isSelected && 'text-primary bg-accent/50'
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

