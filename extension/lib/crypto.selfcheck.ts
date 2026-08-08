// One runnable check that the round-trip works.
// Run via: npx tsx lib/crypto.selfcheck.ts
import { fileURLToPath } from 'node:url';
import { deriveKeys, encryptJSON, decryptJSON } from './crypto';

const demo = async () => {
  const { authId, encKey } = await deriveKeys('gunung kopi laut bulan hutan api sungai daun batu angin bumi cahaya');
  const blob = await encryptJSON({ hi: 'syntive', n: 42 }, encKey);
  const back = await decryptJSON<{ hi: string; n: number }>(blob, encKey);
  console.assert(authId.length === 64, 'authId should be 64 hex chars');
  console.assert(back.hi === 'syntive' && back.n === 42, 'round-trip mismatch');
  console.log('crypto self-check OK', authId.slice(0, 12) + '…');
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  demo().catch((e) => { console.error(e); process.exit(1); });
}
