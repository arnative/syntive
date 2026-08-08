// One runnable check that computeBookmarkStats counts correctly.
// Run via: npx tsx lib/bookmarkStats.selfcheck.ts  (or `bun lib/bookmarkStats.selfcheck.ts`)
import { fileURLToPath } from 'node:url';
import { computeBookmarkStats } from './bookmarkStats';

interface FakeNode {
  id: string;
  parentId?: string;
  url?: string;
  children?: FakeNode[];
}

const mk = (id: string, parentId: string, url?: string, children?: FakeNode[]): FakeNode => ({
  id,
  parentId,
  ...(url ? { url } : {}),
  children,
});

const root: FakeNode = mk('root', '', undefined, [
  mk('a', 'root', 'https://a'), // direct link
  mk('b', 'root', undefined, [
    mk('b1', 'b', 'https://b1'),
    mk('b2', 'b', undefined, [mk('b21', 'b2', 'https://b21')]),
  ]),
  mk('c', 'root', 'https://c'), // direct link
]);

const run = () => {
  const s = computeBookmarkStats(root as unknown as Browser.bookmarks.BookmarkTreeNode);
  console.assert(s.bookmarks === 4, `expected 4 bookmarks, got ${s.bookmarks}`);
  console.assert(s.folders === 2, `expected 2 folders, got ${s.folders}`);
  console.assert(s.directLinks === 2, `expected 2 direct links, got ${s.directLinks}`);
  console.log('bookmarkStats self-check OK');
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}