import { cn } from '@/lib/utils';

export interface SliderProps {
  value: number; // 0 to 1
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 1,
  step = 0.01,
  disabled = false,
  className,
}: SliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('group relative flex w-full touch-none select-none items-center py-1.5 cursor-pointer', disabled && 'opacity-50 pointer-events-none', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      {/* Track Background */}
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-accent/80 border border-border/70">
        {/* Active Fill Portion (Primary Theme Accent) */}
        <div
          className="h-full bg-primary transition-all duration-75 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Interactive Thumb */}
      <div
        className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-primary bg-card shadow-sm transition-transform duration-100 group-hover:scale-110 group-active:scale-125 pointer-events-none -translate-x-1/2"
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
}
