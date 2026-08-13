import * as React from 'react';
import { cn } from '@/lib/utils';
import { MutedText } from '@/components/ui/muted-text';

interface SettingFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingField({ label, description, children, className }: SettingFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-0.5">
        <label className="text-xs font-semibold text-foreground block tracking-wide">
          {label}
        </label>
        {description && (
          <p className="text-[10px] tint-text leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="pt-0.5">{children}</div>
    </div>
  );
}

export function SettingSectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={cn('font-medium text-muted-foreground uppercase tracking-wider text-[10px] pb-1', className)}>
      {children}
    </h4>
  );
}

export function SettingsTabHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('pb-3 shrink-0 flex items-end justify-between gap-2', className)}>
      <div className="min-w-0">
        <h3 className="text-xs font-medium text-foreground">{title}</h3>
        {description && (
          <MutedText size="2xs" className="mt-0.5">
            {description}
          </MutedText>
        )}
      </div>
      {action}
    </div>
  );
}
