import { Eye, EyeOff, Copy, Check, ShieldAlert, CheckCircle, Download } from 'reicon-react';
import { Button } from '@/components/ui/button';
import { AlertBox } from '@/components/ui/alert-box';
import { SettingField } from '../SettingField';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface SettingsSecurityTabProps {
  mnemonic: string;
  showing: boolean;
  onToggleShow: () => void;
  copied: boolean;
  downloaded: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

export function SettingsSecurityTab({
  mnemonic,
  showing,
  onToggleShow,
  copied,
  downloaded,
  onCopy,
  onDownload,
}: SettingsSecurityTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <SettingField label={t('secretKeyLabel')}>
        <div className="relative flex items-center bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-mono select-none break-all pr-24 min-h-10">
          <span className={showing ? 'text-(--color-foreground) font-medium select-text' : 'text-(--color-muted-foreground)/40 tracking-wider font-sans select-none'}>
            {showing ? mnemonic : '•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••'}
          </span>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent/30 rounded-lg cursor-pointer"
              onClick={onToggleShow}
              title={showing ? t('hide') : t('show')}
            >
              {showing ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 rounded-lg transition-colors cursor-pointer',
                copied
                  ? 'text-success hover:text-success/80 bg-success/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
              )}
              onClick={onCopy}
              title={t('copyKey')}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </SettingField>

      {/* Warning Alert Box */}
      <AlertBox icon={<ShieldAlert className="h-5 w-5 text-destructive" />}>
        <strong className="text-destructive block mb-0.5 font-medium uppercase tracking-wider text-[9px]">{t('importantAlertTitle')}</strong>
        {t('importantAlertDesc')}
      </AlertBox>

      {/* Download Secret Key Button */}
      <div className="pt-1">
        <Button
          type="button"
          onClick={onDownload}
          className={cn(
            'w-full h-9 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2',
            downloaded
              ? 'bg-success/10 text-success border-success/30'
              : 'bg-background hover:bg-accent text-foreground border-border'
          )}
        >
          {downloaded ? <CheckCircle className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          <span>{downloaded ? t('downloadedKeyBtn') : t('downloadKeyBtn')}</span>
        </Button>
      </div>
    </div>
  );
}