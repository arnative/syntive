import { deriveKeys, type DerivedKeys } from './crypto';

// Local persisted state keys.
export const KEYS = {
  mnemonic: 'syntive.mnemonic', // the 12-word Secret Key (kept locally only)
  authId: 'syntive.authId',
  version: 'syntive.version', // last-known server vault version
  lastSync: 'syntive.lastSync',
  createdAt: 'syntive.createdAt', // creation timestamp (ms) of secret key
} as const;

interface StoredSession {
  mnemonic: string;
  authId: string;
  encKey: CryptoKey;
  createdAt?: number;
}

// Cache the derived keys in-memory so the background and pages share one derivation.
let sessionCache: (StoredSession & { keys: DerivedKeys }) | null = null;

export async function loadSession(): Promise<StoredSession | null> {
  if (sessionCache) return sessionCache;
  const data = await browser.storage.local.get([KEYS.mnemonic, KEYS.authId, KEYS.createdAt]);
  const mnemonic = data[KEYS.mnemonic] as string | undefined;
  const authId = data[KEYS.authId] as string | undefined;
  const createdAt = data[KEYS.createdAt] as number | undefined;
  if (!mnemonic || !authId) return null;
  const keys = await deriveKeys(mnemonic);
  sessionCache = { mnemonic, authId, encKey: keys.encKey, keys, createdAt };
  return sessionCache;
}

export async function saveSession(mnemonic: string, keys: DerivedKeys, createdAt?: number): Promise<void> {
  const existing = await browser.storage.local.get(KEYS.createdAt);
  const creationTimestamp = createdAt ?? (existing[KEYS.createdAt] as number | undefined) ?? Date.now();
  await browser.storage.local.set({
    [KEYS.mnemonic]: mnemonic,
    [KEYS.authId]: keys.authId,
    [KEYS.createdAt]: creationTimestamp,
  });
  sessionCache = { mnemonic, authId: keys.authId, encKey: keys.encKey, keys, createdAt: creationTimestamp };
}

export async function clearSession(): Promise<void> {
  sessionCache = null;
  await browser.storage.local.remove([KEYS.mnemonic, KEYS.authId, KEYS.version, KEYS.lastSync, KEYS.createdAt]);
}

export async function getVersion(): Promise<number> {
  const data = await browser.storage.local.get(KEYS.version);
  return (data[KEYS.version] as number) ?? 0;
}

export async function setVersion(version: number): Promise<void> {
  await browser.storage.local.set({ [KEYS.version]: version });
}

export async function setLastSync(ts: number): Promise<void> {
  await browser.storage.local.set({ [KEYS.lastSync]: ts });
}
