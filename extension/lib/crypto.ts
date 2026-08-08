// Zero-knowledge crypto for Syntive. Web Crypto only — no deps.
//
// Secret Key (12-word Indonesian mnemonic)
//   └─ PBKDF2-SHA512(mnemonic, salt="syntive/v1", 210k iters, 64 bytes) = seed
//        ├─ seed[0:32]  -> authId (hex) sent to the server as identity/bearer
//        └─ seed[32:64] -> AES-GCM key (encrypts the bookmark tree locally)
//
// The server only ever sees authId + the encrypted blob. The mnemonic never
// leaves the device. Losing the mnemonic = losing access (no recovery).

const PBKDF2_SALT = 'syntive/v1';
const PBKDF2_ITERS = 210_000;

const encoder = new TextEncoder();

export interface DerivedKeys {
  authId: string; // 64 hex chars — account identity / bearer
  encKey: CryptoKey; // AES-GCM
}

export async function deriveKeys(mnemonic: string): Promise<DerivedKeys> {
  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
  const baseKey = await crypto.subtle.importKey(
    'raw', encoder.encode(normalized), 'PBKDF2', false, ['deriveBits'],
  );
  const seed = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(PBKDF2_SALT), iterations: PBKDF2_ITERS, hash: 'SHA-512' },
    baseKey, 512, // 64 bytes
  );
  const seedBytes = new Uint8Array(seed);
  const authBytes = seedBytes.slice(0, 32);
  const encBytes = seedBytes.slice(32, 64);
  const authId = bytesToHex(authBytes);
  const encKey = await crypto.subtle.importKey('raw', encBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  return { authId, encKey };
}

export async function encryptJSON(data: unknown, encKey: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = encoder.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encKey, plaintext);
  // Prepend IV (12 bytes) to ciphertext so decryption can split it back out.
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bytesToBase64(combined);
}

export async function decryptJSON<T>(blob: string, encKey: CryptoKey): Promise<T> {
  const combined = base64ToBytes(blob);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, encKey, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
