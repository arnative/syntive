// Bookmark toolbar stats: one traversal for bookmark count, folder count,
// and top-level direct links. Used by Dashboard (newtab) sidebar/header counts.

export interface BookmarkStats {
  bookmarks: number;
  folders: number;
  directLinks: number;
}

export function computeBookmarkStats(root: Browser.bookmarks.BookmarkTreeNode): BookmarkStats {
  const rootId = root.id;
  let bookmarks = 0;
  let folders = 0;
  let directLinks = 0;

  const visit = (node: Browser.bookmarks.BookmarkTreeNode): void => {
    if (node.url) {
      bookmarks++;
      if (node.parentId === rootId) directLinks++;
      return;
    }
    if (node.id !== rootId) folders++;
    (node.children ?? []).forEach(visit);
  };

  visit(root);
  return { bookmarks, folders, directLinks };
}