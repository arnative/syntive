import { getDeviceId } from './device';
import type { DeviceInfo, ServerVault } from './types';

declare const __API_BASE__: string;

const BASE = __API_BASE__;

export class UnauthorizedError extends Error {
  constructor() { super('unauthorized'); this.name = 'UnauthorizedError'; }
}

export class ConflictError extends Error {
  constructor() { super('conflict'); this.name = 'ConflictError'; }
}

async function req(path: string, authId: string, init: RequestInit = {}): Promise<Response> {
  const deviceId = await getDeviceId();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Id': authId,
      'X-Device-Id': deviceId,
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 401) throw new UnauthorizedError();
  return res;
}

export async function getVault(authId: string): Promise<ServerVault> {
  const res = await req('/vault', authId);
  if (res.status === 404) return { blob: null, version: 0, updatedAt: 0 };
  if (!res.ok) throw new Error(`vault GET failed: ${res.status}`);
  return res.json();
}

export async function putVault(authId: string, blob: string, expectedVersion: number): Promise<{ version: number; updatedAt: number }> {
  const res = await req('/vault', authId, { method: 'PUT', body: JSON.stringify({ blob, expectedVersion }) });
  if (res.status === 409) throw new ConflictError();
  if (!res.ok) throw new Error(`vault PUT failed: ${res.status}`);
  return res.json();
}

export async function listDevices(authId: string): Promise<DeviceInfo[]> {
  const res = await req('/devices', authId);
  if (!res.ok) return [];
  const data = await res.json();
  return data.devices ?? [];
}

export async function upsertDevice(authId: string, deviceId: string, label: string): Promise<void> {
  await req('/device', authId, { method: 'POST', body: JSON.stringify({ device_id: deviceId, label }) });
}

export async function removeDevice(authId: string, deviceId: string): Promise<void> {
  await req(`/device?device_id=${encodeURIComponent(deviceId)}`, authId, { method: 'DELETE' });
}
