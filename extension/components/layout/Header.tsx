import { Language, Check, Grid } from 'reicon-react';
import { useTranslation } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { IconButton } from '@/components/ui/icon-button';

export function Header({
  activeTab,
  onOpenWidgetSettings,
}: {
  activeTab: 'dashboard' | 'bookmark' | 'organize' | 'trash';
  onOpenWidgetSettings?: () => void;
}) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <header className="absolute top-0 left-0 right-0 z-30 h-14.25 shrink-0 border-b border-border bg-card/60 backdrop-blur-md backdrop-saturate-150 px-8 flex items-center justify-between gap-4 select-none">
      {/* Left Section: Page Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center h-8 gap-2">
          <span className="section-label uppercase font-mono tracking-wider font-medium">
            {activeTab === 'bookmark'
              ? t('headerBookmark')
              : activeTab === 'organize'
              ? t('headerOrganize')
              : activeTab === 'trash'
              ? t('headerTrash')
              : t('headerDashboard')}
          </span>
        </div>
      </div>

      {/* Right Section: Edit Widgets & Language Selector */}
      <div className="flex items-center gap-2.5 text-xs shrink-0 select-none">
        {/* Edit Widgets Icon Button (only visible in Dashboard tab) */}
        {activeTab === 'dashboard' && onOpenWidgetSettings && (
          <IconButton
            size="sm"
            onClick={onOpenWidgetSettings}
            title={t('editWidgetsTooltip')}
          >
            <Grid className="h-3.5 w-3.5" />
          </IconButton>
        )}

        {/* Language Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-accent border border-border text-foreground transition-all cursor-pointer active:scale-95 text-xs font-semibold"
              title="Pilih Bahasa / Change Language"
            >
              <Language className="h-3.5 w-3.5 tint-text" />
              <span className="uppercase font-mono font-semibold text-xs">
                {language === 'id' ? 'ID' : 'EN'}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-36 bg-card border-border text-foreground rounded-xl p-1"
          >
            <DropdownMenuItem
              onClick={() => setLanguage('id')}
              className="flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer hover:bg-accent focus:bg-accent text-foreground"
            >
              <span className="font-medium">Bahasa Indonesia</span>
              {language === 'id' && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setLanguage('en')}
              className="flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer hover:bg-accent focus:bg-accent text-foreground"
            >
              <span className="font-medium">English</span>
              {language === 'en' && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
