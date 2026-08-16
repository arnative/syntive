import type * as React from 'react';
import { Folder, Refresh, CheckCircle } from 'reicon-react';
import { useTranslation, type TranslationKey } from '@/lib/i18n';

function ScanRow({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <tr>
      <td colSpan={5} className="py-14 px-4 text-center text-xs text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-1.5">
          {icon}
          <p className="font-semibold text-foreground">{title}</p>
          {subtitle && <p className="text-[11px] tint-text max-w-xs">{subtitle}</p>}
        </div>
      </td>
    </tr>
  );
}

/**
 * Shared 3-state guard for the four Bookmark Management scan tabs.
 * Returns a placeholder row (not-scanned / scanning / empty) or `null`
 * when data is ready to render.
 */
export function useScanTableState(
  hasScanned: boolean,
  isScanning: boolean,
  itemsLength: number,
  subtitleKey: TranslationKey,
  emptyKey: TranslationKey,
) {
  const { t } = useTranslation();

  if (!hasScanned && !isScanning) {
    return (
      <ScanRow
        icon={<Folder className="h-6 w-6 tint-text/40" />}
        title={t('noScanDataTitle')}
        subtitle={t(subtitleKey)}
      />
    );
  }
  if (isScanning) {
    return <ScanRow icon={<Refresh className="h-4 w-4 animate-spin text-primary" />} title={t('mgmtScanning')} />;
  }
  if (itemsLength === 0) {
    return <ScanRow icon={<CheckCircle className="h-6 w-6 text-success" />} title={t(emptyKey)} />;
  }
  return null;
}
