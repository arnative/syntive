import * as React from 'react';
import { SearchEngineBar } from './SearchEngineBar';
import { WidgetsSection } from './widgets/WidgetsSection';
import type { SyncStatus } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

export function DashboardView({
  stats,
  syncStatus,
  manageWidgetModalOpen,
  onManageModalChange,
}: {
  stats: { bookmarks: number; folders: number; directLinks: number };
  syncStatus: SyncStatus;
  manageWidgetModalOpen: boolean;
  onManageModalChange: (open: boolean) => void;
}) {
  const { language, getRandomGreeting } = useTranslation();
  const [searchGreeting, setSearchGreeting] = React.useState('');

  React.useEffect(() => {
    setSearchGreeting(getRandomGreeting());
  }, [language, getRandomGreeting]);

  return (
    <div className="flex-1 overflow-y-auto px-8 pt-22.25 pb-8 flex flex-col items-center w-full">
      {/* Centered Dashboard Container bounded to max 1280px width for 4 columns grid */}
      <div className="w-full max-w-7xl mx-auto space-y-6 my-auto">
        {/* Header Title / Greeting */}
        <div className="text-center space-y-1 pt-2">
          <h1 className="text-2xl md:text-3xl font-medium text-foreground/90 tracking-tight">
            {searchGreeting}
          </h1>
        </div>

        {/* Search Engine Bar */}
        <SearchEngineBar />

        {/* Unified Widgets Section (Grid 4 Columns) */}
        <WidgetsSection
          stats={stats}
          syncStatus={syncStatus}
          manageModalOpen={manageWidgetModalOpen}
          onManageModalChange={onManageModalChange}
        />
      </div>
    </div>
  );
}
