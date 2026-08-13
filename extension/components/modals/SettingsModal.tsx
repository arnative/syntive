import * as React from 'react';
import {
  Sliders,
  ShieldCheck,
  Monitor,
  HardDrive,
  Heart,
  InfoCircle,
  Logout,
} from 'reicon-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/components/ui/nav-item';
import { loadSession } from '@/lib/storage';
import { mnemonicToTextFile } from '@/lib/mnemonic';
import { getDeviceLabel, getDeviceId } from '@/lib/device';
import { listDevices, removeDevice, upsertDevice } from '@/lib/api';
import type { DeviceInfo } from '@/lib/types';
import {
  loadThemeConfig,
  saveThemeConfig,
  applyThemeConfig,
  fetchGitHubAccentColor,
  type ThemeConfig,
} from '@/lib/theme';
import { useTranslation } from '@/lib/i18n';
import { SettingsGeneralTab } from './settings/SettingsGeneralTab';
import { SettingsSecurityTab } from './settings/SettingsSecurityTab';
import { SettingsSessionsTab } from './settings/SettingsSessionsTab';
import { SettingsStorageTab } from './settings/SettingsStorageTab';
import { SettingsCreditsTab } from './settings/SettingsCreditsTab';
import { SettingsAboutTab } from './settings/SettingsAboutTab';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLabelChange: (newLabel: string) => void;
  onLogout?: () => void;
}

type TabType = 'general' | 'security' | 'sessions' | 'storage' | 'credits' | 'about';

export function SettingsModal({ open, onOpenChange, onLabelChange, onLogout }: SettingsModalProps) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<TabType>('general');

  // General tab state
  const [deviceName, setDeviceName] = React.useState('');
  const [syncInterval, setSyncInterval] = React.useState<number>(15);

  // Theme state
  const [themeConfig, setThemeConfig] = React.useState<ThemeConfig | null>(null);
  const [githubLoading, setGithubLoading] = React.useState(false);
  const [githubError, setGithubError] = React.useState<string | null>(null);

  // Security tab state
  const [mnemonic, setMnemonic] = React.useState('');
  const [mnemonicCreatedAt, setMnemonicCreatedAt] = React.useState<number | undefined>(undefined);
  const [showMnemonic, setShowMnemonic] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState(false);

  // Sessions tab state
  const [devices, setDevices] = React.useState<DeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = React.useState<string>('');
  const [loadingDevices, setLoadingDevices] = React.useState(false);

  // Saving state
  const [saving, setSaving] = React.useState(false);

  const fetchDevices = React.useCallback(async () => {
    setLoadingDevices(true);
    try {
      const curId = await getDeviceId();
      setCurrentDeviceId(curId);
      const session = await loadSession();
      if (session) {
        const list = await listDevices(session.authId);
        setDevices(list);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  const handleTerminateDevice = async (targetDeviceId: string) => {
    const session = await loadSession();
    if (!session) return;
    try {
      await removeDevice(session.authId, targetDeviceId);
      await fetchDevices();
    } catch (err) {
      console.error('Failed to remove device:', err);
    }
  };

  const initialThemeRef = React.useRef<ThemeConfig | null>(null);

  // Load existing configurations from storage
  React.useEffect(() => {
    if (!open) {
      if (initialThemeRef.current) {
        applyThemeConfig(initialThemeRef.current);
      }
      return;
    }

    loadSession().then((session) => {
      if (session) {
        setMnemonic(session.mnemonic);
        setMnemonicCreatedAt(session.createdAt);
      }
    });

    browser.storage.local.get(['syntive.customDeviceLabel', 'syntive.syncInterval']).then((data) => {
      const customLabel = data['syntive.customDeviceLabel'] as string | undefined;
      setDeviceName(customLabel || getDeviceLabel());

      const interval = data['syntive.syncInterval'] as number | undefined;
      setSyncInterval(interval !== undefined ? interval : 15);
    });

    loadThemeConfig().then((cfg) => {
      initialThemeRef.current = cfg;
      setThemeConfig(cfg);
      applyThemeConfig(cfg);
    });
    fetchDevices();
  }, [open, fetchDevices]);

  // Real-time live theme preview as user changes preset or accent
  React.useEffect(() => {
    if (open && themeConfig) {
      applyThemeConfig(themeConfig);
    }
  }, [open, themeConfig]);

  const handleCopyMnemonic = async () => {
    if (!mnemonic) return;
    await navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMnemonic = () => {
    if (!mnemonic) return;
    const content = mnemonicToTextFile(mnemonic, {
      createdAt: mnemonicCreatedAt,
      deviceName: deviceName || getDeviceLabel(),
      lang: language === 'en' ? 'en' : 'id',
    });
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syntive-secret-key-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleImportGitHubAccent = async () => {
    if (!themeConfig?.githubUrl?.trim()) return;
    setGithubLoading(true);
    setGithubError(null);
    try {
      const hex = await fetchGitHubAccentColor(themeConfig.githubUrl);
      if (hex) {
        setThemeConfig((prev) => prev ? ({
          ...prev,
          presetId: 'custom',
          customAccent: hex,
        }) : prev);
      } else {
        setGithubError(t('githubImportError'));
      }
    } catch (err) {
      setGithubError(t('githubFetchError'));
    } finally {
      setGithubLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanName = deviceName.trim();

      await browser.storage.local.set({
        'syntive.customDeviceLabel': cleanName,
        'syntive.syncInterval': syncInterval,
      });

      if (themeConfig) {
        initialThemeRef.current = themeConfig;
        await saveThemeConfig(themeConfig);
      }

      const session = await loadSession();
      if (session) {
        const devId = await getDeviceId();
        const finalLabel = cleanName || getDeviceLabel();
        await upsertDevice(session.authId, devId, finalLabel);
        await browser.storage.local.set({ ['syntive.lastDeviceLabel']: finalLabel });
      }

      onLabelChange(cleanName || getDeviceLabel());
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const sidebarNavItems = [
    { id: 'general' as TabType, label: t('tabGeneral'), icon: Sliders },
    { id: 'security' as TabType, label: t('tabSecurity'), icon: ShieldCheck },
    { id: 'sessions' as TabType, label: t('tabSessions'), icon: Monitor },
    { id: 'storage' as TabType, label: t('tabStorage'), icon: HardDrive },
    { id: 'credits' as TabType, label: t('tabCredits'), icon: Heart },
    { id: 'about' as TabType, label: t('tabAbout'), icon: InfoCircle },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-200 w-[95vw] h-155 max-h-[92vh] bg-card border-border text-foreground rounded-2xl p-0 flex flex-col overflow-hidden gap-0">
        {/* Header Bar */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0 bg-background/40">
          <DialogTitle className="text-sm font-medium tracking-wider text-foreground flex items-center gap-2">
            <span>{t('settingsModalTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Main Body: Sidebar + Active Tab Content Area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Sidebar Navigation */}
          <aside className="w-48 sm:w-52 border-r border-border bg-background/30 p-3 space-y-1 shrink-0 flex flex-col">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavItem
                  key={item.id}
                  active={activeTab === item.id}
                  icon={<Icon className="h-4 w-4" />}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.label}
                </NavItem>
              );
            })}
          </aside>

          {/* Right Tab Content View */}
          <main className="flex-1 p-5 overflow-y-auto text-xs space-y-5">
            {activeTab === 'general' && (
              <SettingsGeneralTab
                deviceName={deviceName}
                onDeviceNameChange={setDeviceName}
                syncInterval={syncInterval}
                onSyncIntervalChange={setSyncInterval}
                themeConfig={themeConfig}
                onThemeConfigChange={setThemeConfig}
                githubLoading={githubLoading}
                githubError={githubError}
                onImportGitHubAccent={handleImportGitHubAccent}
              />
            )}
            {activeTab === 'security' && (
              <SettingsSecurityTab
                mnemonic={mnemonic}
                showing={showMnemonic}
                onToggleShow={() => setShowMnemonic((s) => !s)}
                copied={copied}
                downloaded={downloaded}
                onCopy={handleCopyMnemonic}
                onDownload={handleDownloadMnemonic}
              />
            )}
            {activeTab === 'sessions' && (
              <SettingsSessionsTab
                devices={devices}
                currentDeviceId={currentDeviceId}
                loading={loadingDevices}
                onReload={fetchDevices}
                onTerminate={handleTerminateDevice}
              />
            )}
            {activeTab === 'storage' && <SettingsStorageTab />}
            {activeTab === 'credits' && <SettingsCreditsTab />}
            {activeTab === 'about' && <SettingsAboutTab />}
          </main>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-background/40 flex items-center justify-between shrink-0">
          {onLogout ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="h-8 px-3 text-xs font-semibold text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-xl cursor-pointer gap-1.5"
            >
              <Logout className="h-3.5 w-3.5" />
              <span>{t('logoutBtn')}</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 px-4 text-xs font-medium text-muted-foreground hover:bg-accent/40 rounded-xl cursor-pointer"
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="h-8 px-4 text-xs font-semibold bg-foreground text-background hover:opacity-90 rounded-xl cursor-pointer"
            >
              {saving ? t('savingBtn') : t('saveChangesBtn')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}