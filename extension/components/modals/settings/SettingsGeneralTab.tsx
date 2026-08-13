import { Sun, Moon, Laptop, Palette, Code } from 'reicon-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Panel } from '@/components/ui/panel';
import { FilterGroup } from '@/components/ui/filter-group';
import { SettingField, SettingSectionTitle } from '../SettingField';
import { PRESET_THEMES, type ThemeConfig } from '@/lib/theme';
import { useTranslation } from '@/lib/i18n';

interface SettingsGeneralTabProps {
  deviceName: string;
  onDeviceNameChange: (v: string) => void;
  syncInterval: number;
  onSyncIntervalChange: (v: number) => void;
  themeConfig: ThemeConfig | null;
  onThemeConfigChange: (cfg: ThemeConfig) => void;
  githubLoading: boolean;
  githubError: string | null;
  onImportGitHubAccent: () => void;
}

export function SettingsGeneralTab({
  deviceName,
  onDeviceNameChange,
  syncInterval,
  onSyncIntervalChange,
  themeConfig,
  onThemeConfigChange,
  githubLoading,
  githubError,
  onImportGitHubAccent,
}: SettingsGeneralTabProps) {
  const { t } = useTranslation();

  const intervalOptions = [
    { label: t('interval5m'), value: '5' },
    { label: t('interval15m'), value: '15' },
    { label: t('interval30m'), value: '30' },
    { label: t('interval60m'), value: '60' },
    { label: t('intervalManual'), value: '0' },
  ];

  const presetSelectOptions = PRESET_THEMES.map((preset) => ({
    value: preset.id,
    label: preset.name,
  }));

  return (
    <div className="space-y-6">
      {/* Device Name Section */}
      <SettingField
        label={t('deviceNameLabel')}
        description={t('deviceNameDesc')}
      >
        <Input
          value={deviceName}
          onChange={(e) => onDeviceNameChange(e.target.value)}
          placeholder={t('deviceNamePlaceholder')}
          className="h-9 text-xs bg-background border-border focus-visible:ring-1 focus-visible:ring-primary text-foreground placeholder:text-tint-foreground/60 rounded-xl"
        />
      </SettingField>

      {/* Sync Interval Section */}
      <SettingField
        label={t('syncIntervalLabel')}
        description={t('syncIntervalDesc')}
      >
        <FilterGroup
          options={intervalOptions}
          value={String(syncInterval)}
          onValueChange={(v) => onSyncIntervalChange(Number(v))}
        />
      </SettingField>

      {/* Theme Customization Section */}
      {themeConfig && (
        <div className="border-t border-border pt-5 space-y-5">
          <SettingSectionTitle>{t('themeSectionTitle')}</SettingSectionTitle>

          {/* Mode Selection */}
          <SettingField label={t('themeModeLabel')}>
            <FilterGroup
              options={[
                { value: 'dark', label: t('themeDark'), icon: <Moon className="h-3.5 w-3.5" /> },
                { value: 'light', label: t('themeLight'), icon: <Sun className="h-3.5 w-3.5" /> },
                { value: 'system', label: t('themeSystem'), icon: <Laptop className="h-3.5 w-3.5" /> },
              ]}
              value={themeConfig.mode}
              onValueChange={(v) => onThemeConfigChange({ ...themeConfig, mode: v as ThemeConfig['mode'] })}
            />
          </SettingField>

          {/* Preset Dropdown */}
          <SettingField label={t('themePresetLabel')}>
            <Select
              value={themeConfig.presetId}
              onValueChange={(val) => onThemeConfigChange({ ...themeConfig, presetId: val })}
              options={presetSelectOptions}
              placeholder={t('themePresetLabel')}
            />
          </SettingField>

          {/* Custom Hex / GitHub Accent Import */}
          {themeConfig.presetId === 'custom' && (
            <Panel className="p-3.5">
              <div className="flex items-center gap-3">
                <Palette className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold">{t('customAccentTitle')}</span>
                <div className="ml-auto flex items-center gap-2">
                  <div
                    className="relative h-7 w-7 rounded-full overflow-hidden border border-border shrink-0 cursor-pointer"
                    style={{ backgroundColor: themeConfig.customAccent }}
                    title="Pilih Warna HEX"
                  >
                    <input
                      type="color"
                      value={themeConfig.customAccent}
                      onChange={(e) => onThemeConfigChange({ ...themeConfig, customAccent: e.target.value })}
                      className="absolute inset-0 opacity-0 h-full w-full cursor-pointer"
                    />
                  </div>
                  <Input
                    value={themeConfig.customAccent}
                    onChange={(e) => onThemeConfigChange({ ...themeConfig, customAccent: e.target.value })}
                    placeholder="#6366f1"
                    className="h-7 w-24 text-xs font-mono bg-background border-border rounded-md"
                  />
                </div>
              </div>

              {/* GitHub Import */}
              <div className="space-y-1.5 border-t border-border pt-3">
                <span className="text-[10px] font-semibold tint-text uppercase flex items-center gap-1.5">
                  <Code className="h-3 w-3" />
                  {t('githubImportTitle')}
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    value={themeConfig.githubUrl || ''}
                    onChange={(e) => onThemeConfigChange({ ...themeConfig, githubUrl: e.target.value })}
                    placeholder="https://raw.githubusercontent.com/.../theme.json"
                    className="h-8 text-[11px] bg-background border-border rounded-lg flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={onImportGitHubAccent}
                    disabled={githubLoading || !themeConfig.githubUrl?.trim()}
                    className="h-8 px-3 text-xs bg-accent hover:bg-accent/80 text-foreground border border-border rounded-lg cursor-pointer"
                  >
                    {githubLoading ? t('githubLoading') : t('githubImportBtn')}
                  </Button>
                </div>
                {githubError && <p className="text-[10px] text-destructive">{githubError}</p>}
              </div>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}