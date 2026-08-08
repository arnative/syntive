import { setDirty, toolbarId, serializeNode, restoreTree, type TreeNode } from './sync';

export interface TrashItem {
  id: string;
  title: string;
  url?: string;
  children?: TreeNode[];
  deletedAt: number; // timestamp in ms when deleted
  originalParentId?: string;
}

const TRASH_STORAGE_KEY = 'syntive.trash';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getTrashItems(): Promise<TrashItem[]> {
  try {
    const data = (await browser.storage.local.get(TRASH_STORAGE_KEY)) as Record<string, any>;
    const items: TrashItem[] = data[TRASH_STORAGE_KEY] ?? [];
    
    // Auto purge items older than 30 days
    const now = Date.now();
    const validItems = items.filter((item) => now - item.deletedAt < THIRTY_DAYS_MS);
    
    if (validItems.length !== items.length) {
      await saveTrashItems(validItems);
    }
    return validItems;
  } catch (err) {
    console.error('Failed to get trash items:', err);
    return [];
  }
}

export async function saveTrashItems(items: TrashItem[]): Promise<void> {
  await browser.storage.local.set({ [TRASH_STORAGE_KEY]: items });
}

export async function moveToTrash(id: string): Promise<void> {
  try {
    // 1. Fetch current node details before deleting
    const nodes = await browser.bookmarks.get(id);
    if (!nodes || nodes.length === 0) return;
    const node = nodes[0];

    // Build serialized structure for folder/children if folder
    let children: TreeNode[] | undefined = undefined;
    if (!node.url) {
      const fullSubtree = await browser.bookmarks.getSubTree(id).catch(() => []);
      if (fullSubtree[0] && fullSubtree[0].children) {
        children = [];
        for (const k of fullSubtree[0].children) {
          children.push(await serializeNode(k));
        }
      }
    }

    const newItem: TrashItem = {
      id: `trash_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: node.title || (node.url ? 'Untitled Link' : 'Untitled Folder'),
      ...(node.url ? { url: node.url } : {}),
      ...(children ? { children } : {}),
      deletedAt: Date.now(),
      originalParentId: node.parentId,
    };

    // 2. Add to trash items list
    const currentTrash = await getTrashItems();
    currentTrash.unshift(newItem);
    await saveTrashItems(currentTrash);

    // 3. Remove node from browser bookmarks
    try {
      await browser.bookmarks.removeTree(id);
    } catch {
      await browser.bookmarks.remove(id).catch(() => {});
    }

    // 4. Mark dirty for DB sync
    await setDirty(true);
  } catch (err) {
    console.error('Failed to move item to trash:', err);
  }
}

export async function restoreFromTrash(trashId: string): Promise<void> {
  try {
    const currentTrash = await getTrashItems();
    const targetItem = currentTrash.find((item) => item.id === trashId);
    if (!targetItem) return;

    // Determine target parent folder id (fallback to toolbarId if original parent doesn't exist)
    let parentId = toolbarId();
    if (targetItem.originalParentId) {
      try {
        const parentCheck = await browser.bookmarks.get(targetItem.originalParentId);
        if (parentCheck && parentCheck.length > 0) {
          parentId = targetItem.originalParentId;
        }
      } catch {
        parentId = toolbarId();
      }
    }

    // Create restored bookmark / folder in browser bookmarks
    const created = await browser.bookmarks.create({
      parentId,
      title: targetItem.title,
      ...(targetItem.url ? { url: targetItem.url } : {}),
    });

    if (!targetItem.url && targetItem.children?.length) {
      await restoreTree(created.id, targetItem.children);
    }

    // Remove from trash list
    const updatedTrash = currentTrash.filter((item) => item.id !== trashId);
    await saveTrashItems(updatedTrash);

    // Mark dirty for DB sync
    await setDirty(true);
  } catch (err) {
    console.error('Failed to restore item from trash:', err);
  }
}

export async function deletePermanently(trashId: string): Promise<void> {
  try {
    const currentTrash = await getTrashItems();
    const updatedTrash = currentTrash.filter((item) => item.id !== trashId);
    await saveTrashItems(updatedTrash);
    await setDirty(true);
  } catch (err) {
    console.error('Failed to permanently delete trash item:', err);
  }
}

export async function emptyTrash(): Promise<void> {
  try {
    await saveTrashItems([]);
    await setDirty(true);
  } catch (err) {
    console.error('Failed to empty trash:', err);
  }
}

