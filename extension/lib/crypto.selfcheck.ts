// One runnable check that the round-trip works.
// Run via: npx tsx lib/crypto.selfcheck.ts
import { fileURLToPath } from 'node:url';
import { deriveKeys, encryptJSON, decryptJSON } from './crypto';

const demo = async () => {
  const { authId, encKey } = await deriveKeys('gunung kopi laut bulan hutan api sungai daun batu angin bumi cahaya');

  // v1 (compressed) round-trip
  const blob = await encryptJSON({ hi: 'syntive', n: 42 }, encKey);
  const back = await decryptJSON<{ hi: string; n: number }>(blob, encKey);
  console.assert(authId.length === 64, 'authId should be 64 hex chars');
  console.assert(back.hi === 'syntive' && back.n === 42, 'round-trip mismatch');

  // legacy blob (old format: uncompressed, no prefix) must still decrypt
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const legacyPlain = new TextEncoder().encode(JSON.stringify({ hi: 'legacy', n: 7 }));
  const legacyCt = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encKey, legacyPlain);
  const combined = new Uint8Array(12 + legacyCt.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(legacyCt), 12);
  let bin = '';
  for (const b of combined) bin += String.fromCharCode(b);
  const legacyBack = await decryptJSON<{ hi: string; n: number }>(btoa(bin), encKey);
  console.assert(legacyBack.hi === 'legacy' && legacyBack.n === 7, 'legacy blob mismatch');

  console.log('crypto self-check OK', authId.slice(0, 12) + '…');
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  demo().catch((e) => { console.error(e); process.exit(1); });
}
