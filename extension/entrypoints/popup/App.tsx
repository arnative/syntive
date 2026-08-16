import * as React from 'react';
import { Refresh, ArrowUpRight, BookmarkCheck, Clock, MonitorPhone } from 'reicon-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDeviceLabel } from '@/lib/device';
import type { SyncStatus } from '@/lib/types';
import { EMPTY_STATUS } from '@/lib/types';

import logoIcon from '@/assets/logo-icon.svg';

// Relative "last sync" label for the popup (popup UI copy is Indonesian-only).
function formatTime(ts: number | null): string {
  if (!ts) return 'Belum pernah';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Baru saja';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} menit lalu`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} jam lalu`;
  return new Date(ts).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function send<T>(type: string): Promise<T> {
  return browser.runtime.sendMessage({ type });
}

import { initThemeListeners } from '@/lib/theme';

export default function App() {
  const [status, setStatus] = React.useState<SyncStatus>(EMPTY_STATUS);
  const [syncing, setSyncing] = React.useState(false);
  const [label] = React.useState(getDeviceLabel());

  React.useEffect(() => {
    const cleanupTheme = initThemeListeners();
    send<SyncStatus>('status').then(setStatus).catch(() => {});
    return () => cleanupTheme();
  }, []);

  const onSync = async () => {
    setSyncing(true);
    try {
      const res = await send<SyncStatus>('sync');
      setStatus(res);
    } finally {
      setSyncing(false);
    }
  };

  const openDashboard = () => browser.tabs.create({ url: browser.runtime.getURL('/newtab.html') });

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center gap-2">
        <img
          src={logoIcon}
          alt=""
          className="h-7 w-7"
        />
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Syntive</div>
          <div className="text-[11px] tint-text">Bookmark sync</div>
        </div>
      </div>

      <Card>
        <CardContent className="p-3 space-y-2.5">
          <Row icon={<Clock className="h-4 w-4" />} label="Sinkron terakhir">
            <span className="text-xs">{formatTime(status.lastSync)}</span>
          </Row>
          <Row icon={<BookmarkCheck className="h-4 w-4" />} label="Total bookmark">
            <Badge variant="secondary">{status.totalBookmarks}</Badge>
          </Row>
          <Row icon={<MonitorPhone className="h-4 w-4" />} label="Perangkat ini">
            <span className="text-xs">{label}</span>
          </Row>
        </CardContent>
      </Card>

      {status.error && (
        <p className="mt-2 rounded-md bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
          Galat: {status.error}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <Button className="flex-1" onClick={onSync} disabled={syncing}>
          <Refresh className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Menyinkronkan…' : 'Sinkron sekarang'}
        </Button>
        <Button variant="outline" size="icon" onClick={openDashboard} title="Buka dashboard">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-2 text-center text-[10px] tint-text">
        Sinkron otomatis tiap 15 menit
      </p>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="tint-text">{icon}</span>
      <span className="flex-1 text-xs tint-text">{label}</span>
      {children}
    </div>
  );
}
