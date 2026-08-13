import { Refresh, Trash2 } from 'reicon-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MutedText } from '@/components/ui/muted-text';
import { SettingsTabHeader } from '../SettingField';
import type { DeviceInfo } from '@/lib/types';
import { cn, formatSyncAgo } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface SettingsSessionsTabProps {
  devices: DeviceInfo[];
  currentDeviceId: string;
  loading: boolean;
  onReload: () => void;
  onTerminate: (deviceId: string) => void;
}

export function SettingsSessionsTab({
  devices,
  currentDeviceId,
  loading,
  onReload,
  onTerminate,
}: SettingsSessionsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full min-h-0">
      <SettingsTabHeader
        title={t('deviceSessionsTitle')}
        description={t('deviceSessionsSubtitle')}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={onReload}
            disabled={loading}
            className="h-6 text-[10px] text-muted-foreground hover:text-foreground gap-1 px-2"
          >
            <Refresh className={cn('h-3 w-3', loading && 'animate-spin')} />
            <span>{t('reload')}</span>
          </Button>
        }
      />

      <div className="flex-1 min-h-0 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse table-fixed">
            <thead>
              <tr className="border-b border-border bg-background/60 tint-text font-medium select-none sticky top-0">
                <th className="py-2.5 px-4">{t('deviceNameLabel')}</th>
                <th className="py-2.5 px-4 w-40">{t('colLastSync')}</th>
                <th className="py-2.5 px-4 w-28 text-center">{t('colStatus')}</th>
                <th className="py-2.5 px-4 w-20 text-center">{t('colAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading && (
                <tr>
                  <td colSpan={4} className="py-14 px-4 text-center text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Refresh className="h-4 w-4 animate-spin text-primary" />
                      <span>{t('loadingDevices')}</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && devices.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-14 px-4 text-center text-xs text-muted-foreground">
                    {t('noDevices')}
                  </td>
                </tr>
              )}
              {!loading &&
                devices.map((dev) => {
                  const isCurrent = dev.device_id === currentDeviceId;
                  return (
                    <tr key={dev.device_id} className="transition-colors hover:bg-accent/20">
                      <td className="py-2.5 px-4 min-w-0">
                        <span className="font-semibold text-foreground truncate block">{dev.label}</span>
                      </td>
                      <td className="py-2.5 px-4 w-40">
                        <MutedText size="2xs" as="span" className="font-mono">
                          {t('activeAgo', { time: formatSyncAgo(t, dev.last_sync) })}
                        </MutedText>
                      </td>
                      <td className="py-2.5 px-4 w-28 text-center">
                        {isCurrent ? (
                          <Badge color="emerald" compact className="uppercase tracking-wider font-medium">
                            {t('thisDeviceBadge')}
                          </Badge>
                        ) : (
                          <span className="text-[10px] tint-text">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 w-20 text-center">
                        {!isCurrent && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onTerminate(dev.device_id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                            title={t('terminateSessionTooltip')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
