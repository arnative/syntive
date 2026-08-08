import * as React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface DashboardCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  headerBadge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  contentClassName?: string;
}

export function DashboardCard({
  title,
  icon,
  headerAction,
  headerBadge,
  children,
  className,
  minHeight = 'h-[240px]',
  contentClassName,
  ...props
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        'group flex flex-col min-w-0 overflow-hidden h-full rounded-2xl border border-border bg-card hover:border-ring/40 transition-all duration-200 w-full',
        minHeight,
        className
      )}
      {...props}
    >
      {(title || headerAction || headerBadge) && (
        <CardHeader className="h-10.5 px-4 py-0 flex flex-row items-center justify-between shrink-0 select-none space-y-0">
          {title && (
            <div className="section-label text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-2 truncate">
              {icon}
              <span className="truncate">{title}</span>
            </div>
          )}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {headerBadge && (
              typeof headerBadge === 'string' ? (
                <span className="text-[10px] tint-text font-mono">
                  {headerBadge}
                </span>
              ) : (
                headerBadge
              )
            )}
            {headerAction}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn('flex-1 p-4 pt-1 flex flex-col justify-between min-h-0', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
