// Syntive sync engine — last-write-wins per device.
//
// Model: the browser's bookmark *toolbar* subtree is serialized to a plain tree,
// encrypted (AES-GCM) and pushed as a single blob. The server only stores the
// latest version. On pull we wipe the toolbar and rebuild from the decrypted tree.
//
// Conflict policy (user-approved): whichever device pushes last wins; unpushed
// local edits on a device that then pulls are overwritten. Tracked via a "dirty"
// flag set by bookmark change listeners.
// Single blob per account, not per-item merge. Upgrade to granular
// merge if multi-user concurrent editing is ever needed.

import { encryptJSON, decryptJSON } from './crypto';
import { getVault, putVault, upsertDevice, ConflictError, UnauthorizedError } from './api';
import { getDeviceId, getDeviceLabel } from './device';
import { loadSession, clearSession, getVersion, setVersion, setLastSync, KEYS } from './storage';
import { getTrashItems, saveTrashItems, type TrashItem } from './trash';
import type { SyncStatus } from './types';
import { EMPTY_STATUS } from './types';

// Track last-written device label to avoid redundant D1 writes.
// Device label only changes on OS/browser upgrade — not every sync.
const LAST_LABEL_KEY = 'syntive.lastDeviceLabel';

export interface TreeNode {
  title: string;
  url?: string;       // present => leaf bookmark; absent => folder
  children?: TreeNode[];
}

const DIRTY_KEY = 'syntive.dirty';

async function isDirty(): Promise<boolean> {
  const data = await browser.storage.local.get(DIRTY_KEY);
  return data[DIRTY_KEY] === true;
}
export async function setDirty(v: boolean): Promise<void> {
  await browser.storage.local.set({ [DIRTY_KEY]: v });
}

// Suppress bookmark events fired by our own programmatic restore.
let suppress = false;
export function isSuppressed(): boolean { return suppress; }

function toolbarId(): string {
  // Chrome/Edge: "1". Firefox: "toolbar_____". WXT exposes BROWSER at build time.
  const b = (import.meta as any).env?.BROWSER ?? 'chrome';
  return b === 'firefox' ? 'toolbar_____' : '1';
}
export { toolbarId };

export async function serializeNode(node: Browser.bookmarks.BookmarkTreeNode): Promise<TreeNode> {
  const out: TreeNode = node.url
    ? { title: node.title ?? '', url: node.url }
    : { title: node.title ?? '', children: [] };
  if (!node.url) {
    const kids = node.children ?? (await browser.bookmarks.getChildren(node.id));
    out.children = [];
    for (const k of kids) out.children.push(await serializeNode(k));
  }
  return out;
}

async function serializeToolbar(): Promise<TreeNode> {
  const id = toolbarId();
  const nodes = await browser.bookmarks.getSubTree(id);
  const root = nodes[0];
  return serializeNode(root);
}

async function clearToolbar(): Promise<void> {
  const id = toolbarId();
  const children = await browser.bookmarks.getChildren(id);
  await Promise.all(children.map((c) => browser.bookmarks.removeTree(c.id).catch(() => browser.bookmarks.remove(c.id).catch(() => {}))));
}

export async function restoreTree(parentId: string, nodes: TreeNode[]): Promise<void> {
  for (const node of nodes) {
    const created = await browser.bookmarks.create({
      parentId,
      title: node.title,
      ...(node.url ? { url: node.url } : {}),
    });
    if (!node.url && node.children?.length) {
      await restoreTree(created.id, node.children);
    }
  }
}

function countBookmarks(node: TreeNode): number {
  if (node.url) return 1;
  return (node.children ?? []).reduce((n, c) => n + countBookmarks(c), 0);
}

async function countLocalBookmarks(): Promise<number> {
  try {
    const tree = await serializeToolbar();
    return countBookmarks(tree);
  } catch {
    return 0;
  }
}

// Guard against concurrent syncNow() calls (alarm + popup click firing together).
let syncing = false;

export async function syncNow(): Promise<SyncStatus> {
  if (syncing) return getStatus();
  const session = await loadSession();
  if (!session) return { ...EMPTY_STATUS, error: 'not-onboarded' };

  syncing = true;
  try {
    const authId = session.authId;
    const localKnown = await getVersion();
    
    // On first sync/onboarding, proactively register this device before checking vault
    // to ensure the D1 backend knows it exists and doesn't block it with a 401.
    if (localKnown === 0) {
      const label = getDeviceLabel();
      await upsertDevice(authId, await getDeviceId(), label);
      await browser.storage.local.set({ [LAST_LABEL_KEY]: label });
    }

    const server = await getVault(authId);
    const dirty = await isDirty();

    let tree = await serializeToolbar();
    let trashItems = await getTrashItems();

    if (server.version > localKnown) {
      // Server is newer → pull vault from database and replace local toolbar.
      if (server.blob) {
        const doc = await decryptJSON<{ tree: TreeNode; trash?: TrashItem[] }>(server.blob, session.encKey);
        
        // Merge or update trash items
        if (doc.trash) {
          const remoteTrashMap = new Map(doc.trash.map((t) => [t.id, t]));
          for (const localT of trashItems) {
            if (!remoteTrashMap.has(localT.id)) {
              remoteTrashMap.set(localT.id, localT);
            }
          }
          const mergedTrash = Array.from(remoteTrashMap.values());
          await saveTrashItems(mergedTrash);
          trashItems = mergedTrash;
        }

        // Pull server tree: overwrite local toolbar
        suppress = true;
        try {
          await clearToolbar();
          await restoreTree(toolbarId(), doc.tree.children ?? []);
        } finally {
          suppress = false;
        }
        tree = await serializeToolbar();
        await setVersion(server.version);
      } else {
        await setVersion(server.version);
      }
      await setDirty(false);
    } else if (dirty || server.version === 0) {
      // Local has changes (or first ever push) → push with optimistic lock.
      // Server controls version increment; we send what we read as expectedVersion.
      try {
        const blob = await encryptJSON({ tree, trash: trashItems }, session.encKey);
        const res = await putVault(authId, blob, server.version);
        await setVersion(res.version);
        await setDirty(false);
      } catch (err) {
        if (err instanceof ConflictError) {
          // Another device pushed first. Leave dirty=true and don't update
          // version — next sync will see server is ahead and pull (LWW).
          // Local unpushed changes will be overwritten by the pull. This is
          // the approved last-write-wins behavior.
        } else {
          throw err;
        }
      }
    }

    const now = Date.now();
    await setLastSync(now);

    // Register device only on first sync or when label changes (rare).
    // Saves ~95% of device-table writes vs writing on every sync.
    const label = getDeviceLabel();
    const stored = await browser.storage.local.get(LAST_LABEL_KEY);
    if (server.version === 0 || stored[LAST_LABEL_KEY] !== label) {
      await upsertDevice(authId, await getDeviceId(), label);
      await browser.storage.local.set({ [LAST_LABEL_KEY]: label });
    }

    return {
      lastSync: now,
      totalBookmarks: countBookmarks(tree),
      syncing: false,
      error: null,
      version: await getVersion(),
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      await clearSession();
    }
    return { ...EMPTY_STATUS, error: String(err) };
  } finally {
    syncing = false;
  }
}

export async function getStatus(): Promise<SyncStatus> {
  const session = await loadSession();
  if (!session) return { ...EMPTY_STATUS };
  const data = await browser.storage.local.get([KEYS.lastSync, KEYS.version]);
  return {
    lastSync: (data[KEYS.lastSync] as number) ?? null,
    totalBookmarks: await countLocalBookmarks(),
    syncing: false,
    error: null,
    version: (data[KEYS.version] as number) ?? 0,
  };
}
