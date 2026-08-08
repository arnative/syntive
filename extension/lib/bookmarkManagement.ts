import { moveToTrash } from './trash';
import { domainOf } from './utils';

export interface FolderNodeItem {
  id: string;
  title: string;
  parentId?: string;
  folderPath: string;
  itemCount: number;
  dateAdded?: number;
}

export interface DuplicateFolderGroup {
  key: string;
  folderName: string;
  folders: FolderNodeItem[];
}

export interface SplitFolderCandidate {
  folderId: string;
  folderName: string;
  folderPath: string;
  totalBookmarks: number;
  domainGroups: { domain: string; count: number; bookmarkIds: string[] }[];
}

function extractDomain(url: string): string {
  return domainOf(url) || 'other';
}

/**
 * Walk the entire bookmark tree, invoking `visit` for every node (bookmarks and folders).
 * The visitor receives the current node and the path of ancestor folder titles.
 * Roots (id 0 / root________) are passed to the visitor but excluded from the path.
 */
export async function walkBookmarkTree(
  visit: (node: Browser.bookmarks.BookmarkTreeNode, path: string[]) => void,
): Promise<void> {
  const tree = await browser.bookmarks.getTree();
  const traverse = (node: Browser.bookmarks.BookmarkTreeNode, currentPath: string[]) => {
    visit(node, currentPath);
    if (node.children) {
      const nextPath = node.title ? [...currentPath, node.title] : currentPath;
      for (const child of node.children) {
        traverse(child, nextPath);
      }
    }
  };
  for (const rootNode of tree) {
    traverse(rootNode, []);
  }
}

/**
 * Check if a folder title is ALREADY a domain subfolder
 */
function isDomainFolderName(folderTitle: string, domain: string): boolean {
  const normTitle = folderTitle.trim().toLowerCase();
  const normDomain = domain.trim().toLowerCase();
  if (!normTitle || !normDomain) return false;
  if (normTitle === normDomain) return true;
  if (normTitle.includes(normDomain) || normDomain.includes(normTitle)) return true;
  if (/^[a-z0-9.-]+\.[a-z0-9]{2,}$/i.test(normTitle) || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normTitle)) {
    return true;
  }
  return false;
}

/**
 * Check if ancestorId is an ancestor of (or same as) nodeId
 */
async function isAncestorOrSame(ancestorId: string, nodeId: string): Promise<boolean> {
  if (ancestorId === nodeId) return true;
  let currId: string | undefined = nodeId;
  while (currId && currId !== '0' && currId !== 'root________') {
    if (currId === ancestorId) return true;
    try {
      const nodes: Browser.bookmarks.BookmarkTreeNode[] = await browser.bookmarks.get(currId);
      if (!nodes || nodes.length === 0) break;
      currId = nodes[0].parentId;
    } catch {
      break;
    }
  }
  return false;
}

/**
 * Scan bookmark tree for folders with duplicate names
 */
export async function scanDuplicateFolders(): Promise<DuplicateFolderGroup[]> {
  try {
    const folderMap = new Map<string, FolderNodeItem[]>();

    await walkBookmarkTree((node, currentPath) => {
      if (node.url || node.id === '0' || node.id === 'root________') return;
      const title = (node.title || 'Untitled Folder').trim();
      const key = title.toLowerCase();
      const childrenCount = (node.children ?? []).length;

      const folderItem: FolderNodeItem = {
        id: node.id,
        title,
        parentId: node.parentId,
        folderPath: currentPath.join(' > ') || 'Root',
        itemCount: childrenCount,
        dateAdded: node.dateAdded,
      };

      const existing = folderMap.get(key) || [];
      existing.push(folderItem);
      folderMap.set(key, existing);
    });

    const duplicateGroups: DuplicateFolderGroup[] = [];
    folderMap.forEach((folders, key) => {
      if (folders.length > 1) {
        duplicateGroups.push({
          key,
          folderName: folders[0].title,
          folders,
        });
      }
    });

    return duplicateGroups;
  } catch (err) {
    console.error('Failed to scan duplicate folders:', err);
    return [];
  }
}

/**
 * Robust Merge for a group of duplicate folders into one primary folder.
 * Safely handles nested identical folders (e.g. A > A > A) and prevents
 * "Can't move a folder to itself or its descendant" browser errors.
 */
export async function mergeDuplicateFolderGroup(
  group: DuplicateFolderGroup,
  targetPrimaryFolderId?: string
): Promise<{ movedBookmarksCount: number; trashedDuplicatesCount: number }> {
  let movedBookmarksCount = 0;
  let trashedDuplicatesCount = 0;

  if (group.folders.length <= 1) return { movedBookmarksCount, trashedDuplicatesCount };

  try {
    // Sort folders: shallowest depth / non-descendant first, or specified targetPrimaryFolderId
    const sorted = [...group.folders].sort((a, b) => {
      if (targetPrimaryFolderId) {
        if (a.id === targetPrimaryFolderId) return -1;
        if (b.id === targetPrimaryFolderId) return 1;
      }
      const depthA = (a.folderPath.match(/>/g) || []).length;
      const depthB = (b.folderPath.match(/>/g) || []).length;
      if (depthA !== depthB) return depthA - depthB;
      return b.itemCount - a.itemCount;
    });

    const primaryFolder = sorted[0];
    const secondaryFolders = sorted.slice(1);

    const mergeTwoFolders = async (srcFolderId: string, destFolderId: string) => {
      if (srcFolderId === destFolderId) return;
      if (await isAncestorOrSame(srcFolderId, destFolderId)) return;

      const destChildren = await browser.bookmarks.getChildren(destFolderId).catch(() => []);
      const existingUrlsInDest = new Map<string, string>();
      const existingSubfoldersInDest = new Map<string, string>();

      destChildren.forEach((c) => {
        if (c.url) existingUrlsInDest.set(c.url.trim().toLowerCase(), c.id);
        else existingSubfoldersInDest.set((c.title || '').trim().toLowerCase(), c.id);
      });

      const srcChildren = await browser.bookmarks.getChildren(srcFolderId).catch(() => []);
      for (const child of srcChildren) {
        if (child.url) {
          const normUrl = child.url.trim().toLowerCase();
          if (existingUrlsInDest.has(normUrl)) {
            await moveToTrash(child.id);
            trashedDuplicatesCount++;
          } else {
            try {
              await browser.bookmarks.move(child.id, { parentId: destFolderId });
              existingUrlsInDest.set(normUrl, child.id);
              movedBookmarksCount++;
            } catch (err) {
              console.warn('Could not move bookmark:', child.id, err);
            }
          }
        } else {
          // Subfolder
          const subTitle = (child.title || '').trim().toLowerCase();
          const existingDestSubfolderId = existingSubfoldersInDest.get(subTitle);

          if (existingDestSubfolderId && existingDestSubfolderId !== child.id) {
            // Recursively merge subfolder with same name
            await mergeTwoFolders(child.id, existingDestSubfolderId);
            await moveToTrash(child.id);
          } else {
            if (!(await isAncestorOrSame(child.id, destFolderId))) {
              try {
                await browser.bookmarks.move(child.id, { parentId: destFolderId });
                movedBookmarksCount++;
              } catch (err) {
                console.warn('Could not move subfolder:', child.id, err);
              }
            }
          }
        }
      }
    };

    for (const secFolder of secondaryFolders) {
      if (secFolder.id === primaryFolder.id) continue;
      if (await isAncestorOrSame(secFolder.id, primaryFolder.id)) continue;

      await mergeTwoFolders(secFolder.id, primaryFolder.id);
      await moveToTrash(secFolder.id);
    }
  } catch (err) {
    console.error('Failed to merge folder group:', err);
  }

  return { movedBookmarksCount, trashedDuplicatesCount };
}



/**
 * Scan for folders containing 2 or more bookmarks from the SAME domain,
 * excluding folders that are ALREADY domain sub-folders.
 */
export async function scanFoldersForSplitting(): Promise<SplitFolderCandidate[]> {
  try {
    const candidates: SplitFolderCandidate[] = [];

    await walkBookmarkTree((node, currentPath) => {
      if (node.url || !node.children || node.children.length < 2) return;
      const bookmarkChildren = node.children.filter((c) => c.url);
      if (bookmarkChildren.length < 2) return;

      const domainMap = new Map<string, string[]>();
      for (const b of bookmarkChildren) {
        if (b.url) {
          const d = extractDomain(b.url);
          const list = domainMap.get(d) || [];
          list.push(b.id);
          domainMap.set(d, list);
        }
      }

      const domainGroups: { domain: string; count: number; bookmarkIds: string[] }[] = [];
      domainMap.forEach((ids, domain) => {
        if (ids.length >= 2 && domain !== 'other' && !isDomainFolderName(node.title || '', domain)) {
          domainGroups.push({ domain, count: ids.length, bookmarkIds: ids });
        }
      });

      if (domainGroups.length > 0) {
        domainGroups.sort((a, b) => b.count - a.count);
        candidates.push({
          folderId: node.id,
          folderName: node.title || 'Untitled Folder',
          folderPath: currentPath.join(' > ') || 'Root',
          totalBookmarks: bookmarkChildren.length,
          domainGroups,
        });
      }
    });

    return candidates;
  } catch (err) {
    console.error('Failed to scan folders for domain grouping:', err);
    return [];
  }
}

/**
 * Group bookmarks inside a folder into domain subfolders (for domains with >= 2 links)
 */
export async function splitFolderByDomain(candidate: SplitFolderCandidate): Promise<number> {
  let movedCount = 0;
  try {
    for (const group of candidate.domainGroups) {
      if (group.count >= 2) {
        const subfolderName = group.domain.charAt(0).toUpperCase() + group.domain.slice(1);
        const subfolder = await browser.bookmarks.create({
          parentId: candidate.folderId,
          title: subfolderName,
        });

        for (const bId of group.bookmarkIds) {
          await browser.bookmarks.move(bId, { parentId: subfolder.id });
          movedCount++;
        }
      }
    }
  } catch (err) {
    console.error('Failed to group folder by domain:', err);
  }

  return movedCount;
}

export interface EmptyFolderItem {
  id: string;
  folderName: string;
  folderPath: string;
  dateAdded?: number;
}

/**
 * Scan for bookmark folders that contain 0 children (no bookmarks and no sub-folders).
 * System root folders (0, root, toolbar, etc.) are excluded.
 */
export async function scanEmptyFolders(): Promise<EmptyFolderItem[]> {
  try {
    const emptyFolders: EmptyFolderItem[] = [];

    const isSystemFolder = (id: string) => {
      return ['0', 'root________', 'menu________', 'toolbar________', 'unfiled________', 'mobile________'].includes(id);
    };

    await walkBookmarkTree((node, currentPath) => {
      if (node.url || isSystemFolder(node.id)) return;
      const folderName = (node.title || 'Untitled Folder').trim();
      const children = node.children || [];

      if (children.length === 0) {
        emptyFolders.push({
          id: node.id,
          folderName,
          folderPath: currentPath.join(' > ') || 'Root',
          dateAdded: node.dateAdded,
        });
      }
    });

    return emptyFolders;
  } catch (err) {
    console.error('Failed to scan empty folders:', err);
    return [];
  }
}
