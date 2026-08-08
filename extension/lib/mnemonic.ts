import { WORDLIST, WORDSET } from './wordlist-id';
import { getDeviceLabel } from './device';

const MNEMONIC_WORDS = 12;

// 12 words, each an independent uniform draw from the 2048-word list.
// 12 × 11 bits = 132 bits of entropy — exceeds the 128-bit target.
// No BIP39 checksum; validation = every word is in the list + count.
export function generateMnemonic(): string {
  const words: string[] = [];
  const buf = new Uint8Array(2);
  for (let i = 0; i < MNEMONIC_WORDS; i++) {
    crypto.getRandomValues(buf);
    // 16-bit draw masked to 11 bits — 2048 = 2^11, so the mask is exact (no modulo bias).
    const idx = ((buf[0] << 8) | buf[1]) & 0x7ff;
    words.push(WORDLIST[idx]);
  }
  return words.join(' ');
}

export function normalizeMnemonic(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function validateMnemonic(input: string): { ok: boolean; reason?: string } {
  const normalized = normalizeMnemonic(input);
  const words = normalized.split(' ').filter(Boolean);
  if (words.length !== MNEMONIC_WORDS) {
    return { ok: false, reason: `Harus ${MNEMONIC_WORDS} kata, ditemukan ${words.length}.` };
  }
  for (const w of words) {
    if (!WORDSET.has(w)) return { ok: false, reason: `Kata tidak dikenal: "${w}".` };
  }
  return { ok: true };
}

interface MnemonicExportOptions {
  createdAt?: number | string | Date;
  deviceName?: string;
  lang?: 'id' | 'en';
}

// Build a downloadable, well-formatted, minimalist .txt backup of the Secret Key.
export function mnemonicToTextFile(mnemonic: string, opts: MnemonicExportOptions = {}): string {
  const isId = opts.lang !== 'en';
  const createdTimestamp = opts.createdAt ? new Date(opts.createdAt) : new Date();

  const createdDateStr = createdTimestamp.toLocaleString(isId ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const words = mnemonic.trim().split(/\s+/).filter(Boolean);

  // Format 12 words into 3 columns (4 rows)
  const col1 = words.slice(0, 4);
  const col2 = words.slice(4, 8);
  const col3 = words.slice(8, 12);

  const wordGridLines: string[] = [];
  for (let i = 0; i < 4; i++) {
    const num1 = (i + 1).toString().padStart(2, '0');
    const num2 = (i + 5).toString().padStart(2, '0');
    const num3 = (i + 9).toString().padStart(2, '0');

    const w1 = col1[i] ? `${num1}. ${col1[i]}`.padEnd(16, ' ') : '';
    const w2 = col2[i] ? `${num2}. ${col2[i]}`.padEnd(16, ' ') : '';
    const w3 = col3[i] ? `${num3}. ${col3[i]}` : '';
    wordGridLines.push(`  ${w1}${w2}${w3}`.trimEnd());
  }

  const deviceStr = opts.deviceName || getDeviceLabel();

  if (isId) {
    return [
      '--------------------------------------------------',
      'SYNTIVE • CADANGAN SECRET KEY',
      '--------------------------------------------------',
      `Dibuat    : ${createdDateStr}`,
      `Perangkat : ${deviceStr}`,
      'Keamanan  : 256-bit AES-GCM (Terenkripsi E2E)',
      '',
      'SECRET KEY (12 KATA):',
      ...wordGridLines,
      '',
      'TEKS REKREASI (DISALIN LANGSUNG):',
      `  ${mnemonic}`,
      '',
      '--------------------------------------------------',
      'PENTING:',
      '• Simpan file ini di tempat yang aman dan rahasia.',
      '• Secret Key tidak pernah disimpan di server kami.',
      '• Tanpa kunci ini, Anda tidak dapat memulihkan akses sinkronisasi bookmark di perangkat baru.',
      '--------------------------------------------------',
    ].join('\n') + '\n';
  }

  return [
    '--------------------------------------------------',
    'SYNTIVE • SECRET KEY BACKUP',
    '--------------------------------------------------',
    `Created   : ${createdDateStr}`,
    `Device    : ${deviceStr}`,
    'Security  : 256-bit AES-GCM (End-to-End Encrypted)',
    '',
    'SECRET KEY (12 WORDS):',
    ...wordGridLines,
    '',
    'RAW MNEMONIC STRING:',
    `  ${mnemonic}`,
    '',
    '--------------------------------------------------',
    'IMPORTANT:',
    '• Store this file in a safe and private location.',
    '• Your Secret Key is never saved on our servers.',
    '• Without this key, you cannot restore bookmark sync access on a new device.',
    '--------------------------------------------------',
  ].join('\n') + '\n';
}

