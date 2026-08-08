import * as React from 'react';
import { ChartSquare, Bookmark, Folder, Link2, Refresh } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { formatSyncAgo } from '@/lib/utils';
import type { SyncStatus } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

export function StatsWidget({
  totalBookmarks,
  totalFolders,
  directLinks,
  syncStatus,
  dragHandle,
}: {
  totalBookmarks: number;
  totalFolders: number;
  directLinks: number;
  syncStatus: SyncStatus;
  dragHandle: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <DashboardCard
      title={t('widgetStatsTitle')}
      icon={<ChartSquare className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerAction={dragHandle}
      minHeight="h-[234px]"
    >
      <div className="flex-1 pt-0 flex flex-col justify-between h-full">
        <div className="grid grid-cols-2 gap-2.5 w-full h-full">
          <div className="card-inner-box p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] tint-text">
              <Bookmark className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t('totalLabel')}</span>
            </div>
            <span className="text-xl font-medium text-foreground tracking-tight">
              {totalBookmarks}
            </span>
          </div>

          <div className="card-inner-box p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] tint-text">
              <Folder className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t('foldersLabel')}</span>
            </div>
            <span className="text-xl font-medium text-foreground tracking-tight">
              {totalFolders}
            </span>
          </div>

          <div className="card-inner-box p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] tint-text">
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t('directLinksLabel')}</span>
            </div>
            <span className="text-xl font-medium text-foreground tracking-tight">
              {directLinks}
            </span>
          </div>

          <div className="card-inner-box p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] tint-text">
              <Refresh className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t('syncLabel')}</span>
            </div>
            <span className="text-xs font-semibold text-foreground truncate">
              {syncStatus.lastSync ? formatSyncAgo(t, syncStatus.lastSync) : t('syncNever')}
            </span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}