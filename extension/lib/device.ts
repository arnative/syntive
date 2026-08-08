// Detects a human-friendly device label like "Chrome - Windows" or "Firefox - Linux",
// and a stable per-install device id persisted in storage.local.

const DEVICE_ID_KEY = 'syntive.deviceId';
const CUSTOM_LABEL_KEY = 'syntive.customDeviceLabel';

function detectLabel(): string {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if ((navigator as any).brave) {
    browser = 'Brave';
  } else if (/OPR|Opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/Edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/Firefox/i.test(ua)) {
    browser = 'Firefox';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/Chrome/i.test(ua)) {
    browser = 'Chrome';
  }

  let os = 'OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return `${browser} - ${os}`;
}

let cachedLabel: string | null = null;

export function getDeviceLabel(): string {
  return cachedLabel || detectLabel();
}

// Load and listen for custom device label updates asynchronously
if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
  browser.storage.local.get(CUSTOM_LABEL_KEY).then((data) => {
    const custom = data[CUSTOM_LABEL_KEY] as string | undefined;
    if (custom) cachedLabel = custom;
  });

  browser.storage.onChanged.addListener((changes) => {
    if (changes[CUSTOM_LABEL_KEY]) {
      cachedLabel = (changes[CUSTOM_LABEL_KEY].newValue as string) || null;
    }
  });
}

export async function getDeviceId(): Promise<string> {
  const stored = await browser.storage.local.get(DEVICE_ID_KEY);
  const existing = stored[DEVICE_ID_KEY] as string | undefined;
  if (existing) return existing;
  // 16 random bytes as hex is plenty for a device id.
  const id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  await browser.storage.local.set({ [DEVICE_ID_KEY]: id });
  return id;
}
