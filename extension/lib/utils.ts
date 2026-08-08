import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TranslationKey } from './i18n';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

// Relative "last sync" label, e.g. "Sinkron 5m lalu". Shared by dashboard, settings, stats widget.
export function formatSyncAgo(t: Translate, n: number | null): string {
  if (!n) return t('syncStatusNotSynced');
  const d = Date.now() - n;
  if (d < 60_000) return t('syncStatusSyncedJustNow');
  if (d < 3_600_000) return t('syncStatusSyncedAgo', { time: `${Math.floor(d / 60_000)}m` });
  if (d < 86_400_000) return t('syncStatusSyncedAgo', { time: `${Math.floor(d / 3_600_000)}h` });
  return t('syncStatusSyncedAgo', { time: `${Math.floor(d / 86_400_000)}d` });
}

export function formatTime(ts: number | null): string {
  if (!ts) return 'Belum pernah';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Baru saja';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} menit lalu`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} jam lalu`;
  return new Date(ts).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// Extract hostname without leading www. Returns '' on invalid URL.
// try/catch needed: bookmark URLs may be malformed (legacy entries, paste typos).
export function domainOf(url?: string | null): string {
  if (!url) return '';
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}
