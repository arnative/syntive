import { defineBackground } from 'wxt/utils/define-background';
import { syncNow, getStatus, setDirty, isSuppressed } from '@/lib/sync';
import { loadSession } from '@/lib/storage';

const ALARM = 'syntive-sync';
const INTERVAL_KEY = 'syntive.syncInterval';
const DEFAULT_INTERVAL_MIN = 15;

async function setupAlarm(force = false) {
  const data = await browser.storage.local.get(INTERVAL_KEY);
  const interval = data[INTERVAL_KEY] !== undefined ? (data[INTERVAL_KEY] as number) : DEFAULT_INTERVAL_MIN;
  if (interval <= 0) {
    await browser.alarms.clear(ALARM);
  } else {
    const existing = await browser.alarms.get(ALARM);
    if (!existing || force) {
      await browser.alarms.create(ALARM, { periodInMinutes: interval });
    }
  }
}

export default defineBackground(() => {
  // Ensure the alarm is created or maintained when the service worker wakes up/loads.
  setupAlarm(false);

  // On install: open the Syntive new-tab page for onboarding.
  browser.runtime.onInstalled.addListener(async (details: Browser.runtime.InstalledDetails) => {
    if (details.reason === 'install') {
      await browser.tabs.create({ url: browser.runtime.getURL('/newtab.html') });
    }
    await setupAlarm(true);
  });

  // Ensure the alarm exists even after browser restart without an install event.
  browser.runtime.onStartup.addListener(async () => {
    await setupAlarm(true);
    const session = await loadSession();
    if (session) void syncNow();
  });

  // Re-register alarms when the sync interval changes
  browser.storage.onChanged.addListener(async (changes) => {
    if (changes[INTERVAL_KEY]) {
      await setupAlarm(true);
    }
  });

  // Periodic + on-alarm sync.
  browser.alarms.onAlarm.addListener(async (alarm: Browser.alarms.Alarm) => {
    if (alarm.name !== ALARM) return;
    const session = await loadSession();
    if (session) void syncNow();
  });

  // Mark the local tree dirty on any bookmark change so the next sync pushes.
  const markDirty = async () => {
    if (isSuppressed()) return; // ignore events from our own restore
    await setDirty(true);
  };
  browser.bookmarks.onCreated.addListener(markDirty);
  browser.bookmarks.onRemoved.addListener(markDirty);
  browser.bookmarks.onMoved.addListener(markDirty);
  browser.bookmarks.onChanged.addListener(markDirty);
  if (browser.bookmarks.onChildrenReordered) {
    browser.bookmarks.onChildrenReordered.addListener(markDirty);
  }

  // Message bridge for popup / newtab UI.
  browser.runtime.onMessage.addListener((msg: any, _sender: any, sendResponse: (r: any) => void) => {
    (async () => {
      switch (msg?.type) {
        case 'sync': {
          sendResponse(await syncNow());
          break;
        }
        case 'status': {
          sendResponse(await getStatus());
          break;
        }
        default:
          sendResponse({ error: 'unknown' });
      }
    })();
    return true; // async response
  });
});
