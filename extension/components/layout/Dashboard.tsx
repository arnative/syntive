import * as React from 'react';
import {
  Home,
  Bookmark,
  Trash2,
  Sun,
  Moon,
  Laptop,
  Settings,
  Refresh,
  Sidebar2,
  Library,
  Heart,
} from 'reicon-react';
import { toolbarId } from '@/components/bookmark/useBookmarks';
import { computeBookmarkStats } from '@/lib/bookmarkStats';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { SettingSectionTitle } from '@/components/modals/SettingField';
import { SupportModal } from '@/components/modals/SupportModal';
import { Header } from './Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { BookmarkView } from '@/components/bookmark/BookmarkView';
import { BookmarkManagementView } from '@/components/management/BookmarkManagementView';
import { TrashView } from '@/components/trash/TrashView';
import { getTrashItems } from '@/lib/trash';
import type { SyncStatus } from '@/lib/types';
import { EMPTY_STATUS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { clearSession } from '@/lib/storage';
import { getDeviceLabel } from '@/lib/device';
import { cn, formatSyncAgo } from '@/lib/utils';
import { loadThemeConfig, saveThemeConfig, applyThemeConfig } from '@/lib/theme';
import { LanguageProvider, useTranslation } from '@/lib/i18n';

import { IconButton } from '@/components/ui/icon-button';
import logo from '@/assets/logo.svg';
import logoIcon from '@/assets/logo-icon.svg';

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  collapsed?: boolean;
  badge?: React.ReactNode;
  title?: string;
  className?: string;
}

function SidebarNavItem({
  icon,
  label,
  isActive = false,
  onClick,
  collapsed = false,
  badge,
  title,
  className,
}: SidebarNavItemProps) {
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

  // Render outline + filled stacked and crossfade between them so the
  // weight change animates smoothly (path swap alone isn't CSS-animatable).
  const displayIcon = React.isValidElement(icon) ? (
    <span className={cn('relative inline-flex items-center justify-center', iconClassName)}>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out',
          isActive ? 'opacity-0 scale-100' : 'opacity-100 scale-100'
        )}
        aria-hidden
      >
        {renderIcon('Outline')}
      </span>
      <span
        className={cn(
          'flex items-center justify-center transition-all duration-200 ease-out',
          isActive ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
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
      onClick={onClick}
      title={title || label}
      className={cn(
        'relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer select-none border',
        collapsed ? 'justify-center h-10 w-10' : 'w-full justify-between px-3.5 py-2.5',
        isActive
          ? 'bg-accent text-primary border-border'
          : 'tint-text hover:text-foreground hover:bg-accent/50 border-transparent',
        className
      )}
    >
      <div className={cn('flex items-center min-w-0 truncate', collapsed ? 'justify-center' : 'gap-3')}>
        <span className={cn('shrink-0 self-center flex items-center justify-center', isActive && 'text-primary')}>
          {displayIcon}
        </span>
        {!collapsed && <span className="truncate leading-tight self-center">{label}</span>}
      </div>
      {badge && (collapsed ? badge : <span className="shrink-0 ml-2">{badge}</span>)}
    </button>
  );
}

function SidebarHeader({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex pt-1', collapsed ? 'flex-col items-center gap-3' : 'items-center justify-between px-1')}>
      {!collapsed && (
        <img src={logo} alt="Syntive" className="h-6 w-auto select-none shrink-0" />
      )}
      <IconButton
        variant={collapsed ? 'outline' : 'ghost'}
        size={collapsed ? 'md' : 'sm'}
        onClick={onToggleCollapse}
        title={collapsed ? t('expandSidebar') : t('collapseSidebar')}
      >
        {collapsed ? (
          <img src={logoIcon} alt="Syntive" className="h-5 w-5 shrink-0 select-none" />
        ) : (
          <Sidebar2 className="h-4 w-4" />
        )}
      </IconButton>
    </div>
  );
}

function AvatarInitial({ label, size }: { label: string; size: 'sm' | 'md' }) {
  return (
    <div
      title={label}
      className={cn(
        'rounded-full border border-border bg-accent text-foreground shrink-0 flex items-center justify-center font-medium uppercase select-none',
        size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
      )}
    >
      {label.trim().charAt(0) || 'S'}
    </div>
  );
}

function SidebarProfileCard({
  collapsed,
  deviceLabel,
  lastSyncText,
  syncing,
  onSync,
}: {
  collapsed: boolean;
  deviceLabel: string;
  lastSyncText: string;
  syncing: boolean;
  onSync: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-background/60',
        collapsed ? 'p-2 flex flex-col items-center gap-2 w-full' : 'p-3 space-y-3'
      )}
    >
      <div className={cn('flex items-center', !collapsed && 'gap-3')}>
        <AvatarInitial label={deviceLabel} size={collapsed ? 'sm' : 'md'} />
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-foreground truncate">
              {deviceLabel}
            </span>
            <span className="text-[10px] tint-text font-mono truncate">
              {lastSyncText}
            </span>
          </div>
        )}
      </div>

      {collapsed ? (
        <IconButton
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={syncing}
          title={syncing ? t('syncingButton') : `${t('syncButton')} (${lastSyncText})`}
        >
          <Refresh className={cn('h-3.5 w-3.5 text-primary', syncing && 'animate-spin')} />
        </IconButton>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs font-semibold rounded-xl bg-card hover:bg-accent border-border text-foreground flex items-center justify-center gap-2 cursor-pointer"
          onClick={onSync}
          disabled={syncing}
        >
          <Refresh className={cn('h-3.5 w-3.5 text-primary', syncing && 'animate-spin')} />
          <span>{syncing ? t('syncingButton') : t('syncButton')}</span>
        </Button>
      )}
    </div>
  );
}

function ThemeToggleButton({
  themeMode,
  onToggle,
}: {
  themeMode: 'dark' | 'light' | 'system';
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <IconButton
      variant="ghost"
      size="lg"
      onClick={onToggle}
      title={`${t('themeTitle')}: ${themeMode === 'light' ? t('themeLight') : themeMode === 'dark' ? t('themeDark') : t('themeSystem')}`}
    >
      {themeMode === 'light' ? (
        <Sun className="h-4.5 w-4.5" />
      ) : themeMode === 'dark' ? (
        <Moon className="h-4.5 w-4.5" />
      ) : (
        <Laptop className="h-4.5 w-4.5" />
      )}
    </IconButton>
  );
}

function SidebarFooter({
  collapsed,
  themeMode,
  onOpenSettings,
  onOpenSupport,
  onToggleTheme,
}: {
  collapsed: boolean;
  themeMode: 'dark' | 'light' | 'system';
  onOpenSettings: () => void;
  onOpenSupport: () => void;
  onToggleTheme: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex w-full', collapsed ? 'flex-col items-center gap-2' : 'items-center justify-between gap-1')}>
      <Button
        variant="outline"
        size={collapsed ? 'icon' : 'default'}
        onClick={onOpenSupport}
        title={collapsed ? t('headerSupport') : undefined}
        className={cn('text-destructive', collapsed && 'h-9 w-9')}
      >
        <Heart className="h-4.5 w-4.5 text-destructive fill-destructive/20" />
        {!collapsed && t('headerSupport')}
      </Button>
      <div className="flex items-center gap-1">
        <IconButton
          variant="ghost"
          size="lg"
          onClick={onOpenSettings}
          title={t('navSettings')}
        >
          <Settings className="h-4.5 w-4.5" />
        </IconButton>
        <ThemeToggleButton themeMode={themeMode} onToggle={onToggleTheme} />
      </div>
    </div>
  );
}

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <LanguageProvider>
      <DashboardContent onLogout={onLogout} />
    </LanguageProvider>
  );
}

function DashboardContent({ onLogout }: { onLogout: () => void }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'bookmark' | 'organize' | 'trash'>('dashboard');
  const [status, setStatus] = React.useState<SyncStatus>(EMPTY_STATUS);
  const [syncing, setSyncing] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showSupportModal, setShowSupportModal] = React.useState(false);
  const [showWidgetSettings, setShowWidgetSettings] = React.useState(false);
  const [deviceLabel, setDeviceLabel] = React.useState(() => getDeviceLabel());
  const [stats, setStats] = React.useState({ bookmarks: 0, folders: 0, directLinks: 0 });
  const [trashCount, setTrashCount] = React.useState<number>(0);
  const [themeMode, setThemeMode] = React.useState<'dark' | 'light' | 'system'>('system');

  // Sidebar collapsed state (persisted in localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState<boolean>(() => {
    return localStorage.getItem('syntive.sidebarCollapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('syntive.sidebarCollapsed', String(next));
      return next;
    });
  };

  React.useEffect(() => {
    const onChange = (changes: Record<string, any>) => {
      if (changes['syntive.customDeviceLabel']) {
        setDeviceLabel(getDeviceLabel());
      }
    };
    browser.storage.onChanged.addListener(onChange);
    return () => browser.storage.onChanged.removeListener(onChange);
  }, []);

  const calculateTotalBookmarks = React.useCallback(async () => {
    try {
      const nodes = await browser.bookmarks.getSubTree(toolbarId());
      const root = nodes?.[0];
      setStats(root ? computeBookmarkStats(root) : { bookmarks: 0, folders: 0, directLinks: 0 });
    } catch (err) {
      console.error('Failed to calculate total bookmarks & folders:', err);
    }
  }, []);

  React.useEffect(() => {
    calculateTotalBookmarks();
    browser.bookmarks.onCreated.addListener(calculateTotalBookmarks);
    browser.bookmarks.onRemoved.addListener(calculateTotalBookmarks);
    browser.bookmarks.onMoved.addListener(calculateTotalBookmarks);
    browser.bookmarks.onChanged.addListener(calculateTotalBookmarks);
    return () => {
      browser.bookmarks.onCreated.removeListener(calculateTotalBookmarks);
      browser.bookmarks.onRemoved.removeListener(calculateTotalBookmarks);
      browser.bookmarks.onMoved.removeListener(calculateTotalBookmarks);
      browser.bookmarks.onChanged.removeListener(calculateTotalBookmarks);
    };
  }, [calculateTotalBookmarks]);

  const reloadTrashCount = React.useCallback(async () => {
    try {
      const items = await getTrashItems();
      setTrashCount(items.length);
    } catch {
      setTrashCount(0);
    }
  }, []);

  React.useEffect(() => {
    reloadTrashCount();
  }, [reloadTrashCount, activeTab]);

  // Load and apply theme config
  React.useEffect(() => {
    loadThemeConfig().then((cfg) => {
      setThemeMode(cfg.mode);
      applyThemeConfig(cfg);
    });
  }, []);

  const handleToggleThemeMode = async () => {
    const nextMode: 'dark' | 'light' | 'system' =
      themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(nextMode);
    const cfg = await loadThemeConfig();
    cfg.mode = nextMode;
    await saveThemeConfig(cfg);
  };

  const send = (type: string) => browser.runtime.sendMessage({ type });

  React.useEffect(() => {
    send('status')
      .then((s: SyncStatus) => setStatus(s))
      .catch(() => {});
  }, []);

  const onSync = async () => {
    setSyncing(true);
    try {
      const res = await send('sync');
      setStatus(res as SyncStatus);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await clearSession();
      onLogout();
    } catch (err) {
      console.error('logout failed', err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Left Sidebar */}
      <aside
        className={cn(
          'border-r border-border bg-card p-3.5 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none transition-all duration-300 z-20',
          sidebarCollapsed ? 'w-17 items-center px-2' : 'w-60'
        )}
      >
        <div className={cn('space-y-6 w-full flex flex-col', sidebarCollapsed && 'items-center')}>
          {/* Sidebar Top: Header Logo & Collapse Toggle */}
          <SidebarHeader
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />

          {/* Group: Utama */}
          <div className={cn('w-full flex flex-col gap-1.5', sidebarCollapsed && 'items-center')}>
            {!sidebarCollapsed && (
              <SettingSectionTitle className="px-3.5 select-none font-semibold">
                {t('navGroupMain')}
              </SettingSectionTitle>
            )}
            <nav className={cn('space-y-1 w-full flex flex-col', sidebarCollapsed && 'items-center')}>
              <SidebarNavItem
                icon={<Home className="h-4.5 w-4.5" />}
                label={t('navDashboard')}
                isActive={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
                collapsed={sidebarCollapsed}
              />
              <SidebarNavItem
                icon={<Bookmark className="h-4.5 w-4.5" />}
                label={t('navBookmark')}
                isActive={activeTab === 'bookmark'}
                onClick={() => setActiveTab('bookmark')}
                collapsed={sidebarCollapsed}
              />
            </nav>
          </div>

          {/* Group: Kelola */}
          <div className={cn('w-full flex flex-col gap-1.5', sidebarCollapsed && 'items-center')}>
            {!sidebarCollapsed && (
              <SettingSectionTitle className="px-3.5 select-none font-semibold">
                {t('navGroupManage')}
              </SettingSectionTitle>
            )}
            <nav className={cn('space-y-1 w-full flex flex-col', sidebarCollapsed && 'items-center')}>
              <SidebarNavItem
                icon={<Library className="h-4.5 w-4.5" />}
                label={t('navOrganize')}
                isActive={activeTab === 'organize'}
                onClick={() => setActiveTab('organize')}
                collapsed={sidebarCollapsed}
              />
              <SidebarNavItem
                icon={<Trash2 className="h-4.5 w-4.5" />}
                label={t('navTrash')}
                isActive={activeTab === 'trash'}
                onClick={() => setActiveTab('trash')}
                collapsed={sidebarCollapsed}
                badge={
                  trashCount > 0 ? (
                    sidebarCollapsed ? (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                        {trashCount > 99 ? '99+' : trashCount}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-[11px] font-mono font-medium">
                        {trashCount}
                      </span>
                    )
                  ) : undefined
                }
              />
            </nav>
          </div>
        </div>

        {/* Sidebar Profile & Sync Box */}
        <div className={cn('w-full flex flex-col', sidebarCollapsed ? 'items-center gap-2' : 'gap-3')}>
          <SidebarProfileCard
            collapsed={sidebarCollapsed}
            deviceLabel={deviceLabel}
            lastSyncText={formatSyncAgo(t, status.lastSync)}
            syncing={syncing}
            onSync={onSync}
          />

          {/* Full-width divider between profile and footer controls */}
          <div className={cn('h-px bg-border/60', sidebarCollapsed ? '-mx-2' : '-mx-3.5')} />

          <SidebarFooter
            collapsed={sidebarCollapsed}
            themeMode={themeMode}
            onOpenSettings={() => setShowSettings(true)}
            onOpenSupport={() => setShowSupportModal(true)}
            onToggleTheme={handleToggleThemeMode}
          />
        </div>
      </aside>

      {/* Main Content Layout Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Single Persistent Header Component Overlay */}
        <Header
          activeTab={activeTab}
          onOpenWidgetSettings={() => setShowWidgetSettings(true)}
        />

        {/* Tab View Container */}
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
          {activeTab === 'dashboard' ? (
            <DashboardView
              stats={stats}
              syncStatus={status}
              manageWidgetModalOpen={showWidgetSettings}
              onManageModalChange={setShowWidgetSettings}
            />
          ) : activeTab === 'bookmark' ? (
            <BookmarkView />
          ) : activeTab === 'organize' ? (
            <BookmarkManagementView />
          ) : (
            <TrashView onTrashChange={reloadTrashCount} />
          )}
        </div>
      </div>

      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        onLabelChange={setDeviceLabel}
        onLogout={handleLogout}
      />
      <SupportModal
        open={showSupportModal}
        onOpenChange={setShowSupportModal}
      />
    </div>
  );
}
