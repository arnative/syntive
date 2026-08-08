import { Folder, Refresh, CheckCircle } from 'reicon-react';

type ScanState = 'notScanned' | 'scanning' | 'empty';

// Shared empty/scanning/not-scanned row for the four Bookmark Management tabs.
// Each tab renders this as its only <tr> when there is no data to list.
export function ScanTableState({
  state,
  language,
  subtitleId,
  subtitleEn,
  emptyId,
  emptyEn,
}: {
  state: ScanState;
  language: string;
  subtitleId: string;
  subtitleEn: string;
  emptyId: string;
  emptyEn: string;
}) {
  const isId = language === 'id';

  if (state === 'scanning') {
    return (
      <tr key="scanning">
        <td colSpan={5} className="py-14 px-4 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Refresh className="h-4 w-4 animate-spin text-primary" />
            <span>{isId ? 'Memindai...' : 'Scanning...'}</span>
          </div>
        </td>
      </tr>
    );
  }

  if (state === 'empty') {
    return (
      <tr key="empty">
        <td colSpan={5} className="py-14 px-4 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <CheckCircle className="h-6 w-6 text-success" />
            <p className="font-semibold text-foreground">
              {isId ? emptyId : emptyEn}
            </p>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr key="not-scanned">
      <td colSpan={5} className="py-14 px-4 text-center text-xs text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Folder className="h-6 w-6 tint-text/40" />
          <p className="font-semibold text-foreground">
            {isId ? 'Belum Ada Data Pemindaian' : 'No Scan Data Yet'}
          </p>
          <p className="text-[11px] tint-text max-w-xs">
            {isId ? subtitleId : subtitleEn}
          </p>
        </div>
      </td>
    </tr>
  );
}

/**
 * Shared 3-state guard for the four Bookmark Management scan tabs.
 * Returns a <ScanTableState> row when the tab should show a placeholder
 * (not-scanned / scanning / empty), or `null` when data is ready to render.
 */
export function useScanTableState(
  hasScanned: boolean,
  isScanning: boolean,
  itemsLength: number,
  language: string,
  labels: { subtitleId: string; subtitleEn: string; emptyId: string; emptyEn: string },
) {
  if (!hasScanned && !isScanning) {
    return <ScanTableState state="notScanned" language={language} {...labels} />;
  }
  if (isScanning) {
    return <ScanTableState state="scanning" language={language} subtitleId="" subtitleEn="" emptyId="" emptyEn="" />;
  }
  if (hasScanned && itemsLength === 0) {
    return <ScanTableState state="empty" language={language} subtitleId="" subtitleEn="" emptyId={labels.emptyId} emptyEn={labels.emptyEn} />;
  }
  return null;
}

