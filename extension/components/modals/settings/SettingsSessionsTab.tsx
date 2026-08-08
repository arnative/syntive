import { Refresh, Trash2 } from 'reicon-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListItemCard } from '@/components/ui/list-item-card';
import { MutedText } from '@/components/ui/muted-text';
import { SettingSectionTitle } from '../SettingField';
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SettingSectionTitle>{t('deviceSessionsTitle')}</SettingSectionTitle>
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
      </div>

      {loading ? (
        <div className="text-[11px] tint-text py-6 text-center">{t('loadingDevices')}</div>
      ) : devices.length === 0 ? (
        <div className="text-[11px] tint-text py-6 text-center">{t('noDevices')}</div>
      ) : (
        <div className="space-y-2.5 max-h-75 overflow-y-auto pr-1">
          {devices.map((dev) => {
            const isCurrent = dev.device_id === currentDeviceId;
            return (
              <ListItemCard key={dev.device_id}>
                <div className="flex flex-col min-w-0 pr-3">
                  <span className="font-semibold text-foreground truncate">{dev.label}</span>
                  <MutedText size="2xs" as="span" className="leading-none mt-1.5 font-mono">
                    {t('activeAgo', { time: formatSyncAgo(t, dev.last_sync) })}
                  </MutedText>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isCurrent ? (
                    <Badge color="emerald" compact className="uppercase tracking-wider font-medium">
                      {t('thisDeviceBadge')}
                    </Badge>
                  ) : (
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
                </div>
              </ListItemCard>
            );
          })}
        </div>
      )}
    </div>
  );
}