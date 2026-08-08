import * as React from 'react';
import { cn } from '@/lib/utils';

interface NavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
}

/**
 * Sidebar navigation button with active/inactive states. Used in SettingsModal
 * sidebar. Replaces the repeated inline pattern with consistent styling.
 */
export function NavItem({ active = false, icon, children, className, ...props }: NavItemProps) {
  const iconClassName = (icon as React.ReactElement<{ className?: string }> | null)?.props?.className;

  const renderIcon = React.useCallback(
    (weight: 'Filled' | 'Outline') => {
      if (!React.isValidElement(icon)) return icon;
      return React.cloneElement(icon as React.ReactElement<{ weight?: string; className?: string }>, {
        weight,
      });
    },
    [icon]
  );

  const displayIcon = React.isValidElement(icon) ? (
    <span className={cn('relative inline-flex items-center justify-center', iconClassName)}>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out',
          active ? 'opacity-0 scale-100' : 'opacity-100 scale-100'
        )}
        aria-hidden
      >
        {renderIcon('Outline')}
      </span>
      <span
        className={cn(
          'flex items-center justify-center transition-all duration-200 ease-out',
          active ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
        )}
      >
        {renderIcon('Filled')}
      </span>
    </span>
  ) : (
    icon
  );

  return (
    <button
      type="button"
      className={cn(
        'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer select-none text-left border',
        active
          ? 'bg-accent text-primary font-semibold border-border'
          : 'tint-text hover:text-foreground hover:bg-accent/50 border-transparent',
        className
      )}
      {...props}
    >
      {icon && (
        <span className={cn('h-4 w-4 shrink-0 flex items-center justify-center', active && 'text-primary')}>
          {displayIcon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </button>
  );
}
