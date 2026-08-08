// Shared domain types for Syntive.

export interface ServerVault {
  blob: string | null;
  version: number;
  updatedAt: number;
}

export interface DeviceInfo {
  device_id: string;
  label: string;
  last_sync: number;
}

export interface SyncStatus {
  lastSync: number | null;
  totalBookmarks: number;
  syncing: boolean;
  error: string | null;
  version: number;
}

export const EMPTY_STATUS: SyncStatus = {
  lastSync: null,
  totalBookmarks: 0,
  syncing: false,
  error: null,
  version: 0,
};
