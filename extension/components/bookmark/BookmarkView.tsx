import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  useDroppable,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { ArrowLeft, Folder as FolderIcon, FolderBookmark, Link2, Search4, Filter } from 'reicon-react';
import { useBookmarks, toolbarId, type Bm } from './useBookmarks';
import { FolderCard, FolderCardStatic } from './FolderCard';
import { BookmarkList } from './BookmarkList';
import { Pagination } from './Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaviconImage } from '@/components/ui/FaviconImage';
import { cn, domainOf } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import logoIcon from '@/assets/logo-icon.svg';

/**
 * 2D Grid Collision Detection for Folder Cards:
 * Uses pointerWithin with closestCenter fallback (NOT rectIntersection).
 * Guarantees the target card highlighted by the white border is ALWAYS the closest column card under the cursor.
 */
const folderGridCollision: CollisionDetection = (args) => {
  const aType = args.active.data.current?.type;

  if (aType === 'folder') {
    const folderContainers = args.droppableContainers.filter((c) => {
      return c.data.current?.type === 'folder' && c.id !== args.active.id;
    });

    const pointerCollisions = pointerWithin({
      ...args,
      droppableContainers: folderContainers,
    });
    if (pointerCollisions.length > 0) return pointerCollisions;

    return closestCenter({
      ...args,
      droppableContainers: folderContainers,
    });
  }

  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCenter(args);
};

export function BookmarkView({
  query,
  setQuery,
  filter,
  setFilter,
}: {
  query: string;
  setQuery: (q: string) => void;
  filter: 'all' | 'folders' | 'bookmarks';
  setFilter: (f: 'all' | 'folders' | 'bookmarks') => void;
}) {
  const { t } = useTranslation();
  const [currentFolderId, setCurrentFolderId] = React.useState<string>(toolbarId());
  const [currentFolder, setCurrentFolder] = React.useState<Bm | null>(null);
  const [breadcrumbs, setBreadcrumbs] = React.useState<{ id: string; title: string }[]>([]);
  const { folders, bookmarks, loading, renameFolder, deleteNode, moveNode } =
    useBookmarks(currentFolderId);

  // Local optimistic state for folder cards drag & drop
  const [localFolders, setLocalFolders] = React.useState<Bm[]>(folders);

  React.useEffect(() => {
    setLocalFolders(folders);
  }, [folders]);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [bookmarkPage, setBookmarkPage] = React.useState(1);

  const BOOKMARKS_PER_PAGE = 15;

  React.useEffect(() => {
    if (currentFolderId === toolbarId()) {
      setCurrentFolder(null);
    } else {
      browser.bookmarks
        .get(currentFolderId)
        .then(([node]) => setCurrentFolder(node))
        .catch(() => setCurrentFolder(null));
    }
    setBookmarkPage(1);
  }, [currentFolderId]);

  React.useEffect(() => {
    const buildPath = async () => {
      if (currentFolderId === toolbarId()) {
        setBreadcrumbs([]);
      } else {
        const path: { id: string; title: string }[] = [];
        let currId = currentFolderId;
        while (currId && currId !== toolbarId()) {
          try {
            const [node] = await browser.bookmarks.get(currId);
            path.unshift({ id: node.id, title: node.title });
            currId = node.parentId || '';
          } catch {
            break;
          }
        }
        setBreadcrumbs(path);
      }
    };
    buildPath();
  }, [currentFolderId]);

  React.useEffect(() => {
    setBookmarkPage(1);
  }, [filter]);

  const handleGoBack = () => {
    if (currentFolder && currentFolder.parentId) {
      setCurrentFolderId(currentFolder.parentId);
    } else {
      setCurrentFolderId(toolbarId());
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const q = query.trim().toLowerCase();
  const match = (t: string, u?: string) =>
    !q || t.toLowerCase().includes(q) || (u?.toLowerCase().includes(q) ?? false);
  const shownFolders = localFolders.filter((f) => match(f.title));
  const shownBookmarks = bookmarks.filter((b) => match(b.title, b.url));
  const bookmarkPageCount = Math.max(1, Math.ceil(shownBookmarks.length / BOOKMARKS_PER_PAGE));
  const bookmarksView = shownBookmarks.slice(
    (bookmarkPage - 1) * BOOKMARKS_PER_PAGE,
    bookmarkPage * BOOKMARKS_PER_PAGE
  );

  const [activeBookmark, setActiveBookmark] = React.useState<Bm | null>(null);
  const [isShiftPressed, setIsShiftPressed] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const activeFolder = activeId?.startsWith('folder:')
    ? localFolders.find((f) => `folder:${f.id}` === activeId)
    : null;

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
    if (e.active.data.current?.bookmark) {
      setActiveBookmark(e.active.data.current.bookmark as Bm);
    } else if (String(e.active.id).startsWith('bm:')) {
      const bId = String(e.active.id).replace('bm:', '');
      const found = bookmarks.find((b) => b.id === bId);
      if (found) setActiveBookmark(found);
    }
  };

  const onDragOver = (e: DragOverEvent) => {
    const { over } = e;
    setOverId(over ? String(over.id) : null);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    setOverId(null);
    setActiveBookmark(null);
    if (!active || !over || active.id === over.id) return;

    const aType = active.data.current?.type;
    const oType = over?.data.current?.type;

    try {
      if (aType === 'folder') {
        const activeFolderId = active.data.current!.folderId as string;
        let targetFolderId: string | undefined;

        if (oType === 'folder') {
          targetFolderId = over.data.current!.folderId as string;
        } else if (oType === 'bookmark' && over.data.current!.parentFolderId) {
          targetFolderId = over.data.current!.parentFolderId as string;
        }

        if (activeFolderId && targetFolderId && activeFolderId !== targetFolderId) {
          const isShift = isShiftPressed || (e.activatorEvent as MouseEvent)?.shiftKey;
          if (isShift) {
            await moveNode(activeFolderId, targetFolderId);
            return;
          }

          const oldIndex = localFolders.findIndex((f) => f.id === activeFolderId);
          const newIndex = localFolders.findIndex((f) => f.id === targetFolderId);

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            setLocalFolders((prev) => arrayMove(prev, oldIndex, newIndex));
            const targetFolder = folders.find((f) => f.id === targetFolderId);
            if (targetFolder && targetFolder.index !== undefined) {
              const destinationIndex = oldIndex < newIndex ? targetFolder.index + 1 : targetFolder.index;
              await moveNode(activeFolderId, currentFolderId, destinationIndex);
            }
          }
        }
        return;
      }

      if (aType === 'bookmark') {
        const activeNodeId = active.data.current!.bookmarkId as string;

        if (oType === 'folder') {
          const targetFolderId = over!.data.current!.folderId as string;
          if (targetFolderId && targetFolderId !== active.data.current?.parentFolderId) {
            await moveNode(activeNodeId, targetFolderId);
          }
          return;
        }

        if (oType === 'bookmark') {
          const overNodeId = over!.data.current!.bookmarkId as string;
          if (activeNodeId && overNodeId && activeNodeId !== overNodeId) {
            const [activeNode] = await browser.bookmarks.get(activeNodeId);
            const [overNode] = await browser.bookmarks.get(overNodeId);
            if (activeNode && overNode && overNode.parentId) {
              const isSameParent = activeNode.parentId === overNode.parentId;
              const isMovingForward =
                isSameParent &&
                activeNode.index !== undefined &&
                overNode.index !== undefined &&
                activeNode.index < overNode.index;
              const destinationIndex = isMovingForward ? overNode.index! + 1 : overNode.index;
              await moveNode(activeNodeId, overNode.parentId, destinationIndex);
            }
          }
          return;
        }

        if (
          oType === 'root-grid' ||
          oType === 'root-links' ||
          over.id === 'folder-grid-root' ||
          over.id === 'root-links-dropzone'
        ) {
          await moveNode(activeNodeId, currentFolderId);
          return;
        }
      }
    } catch (err) {
      console.error('drag failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <img src={logoIcon} alt="" className="h-10 w-10 animate-pulse" />
      </div>
    );
  }

  const showFolders = filter === 'all' || filter === 'folders';
  const showBookmarks = filter === 'all' || filter === 'bookmarks';

  return (
    <div className="flex-1 overflow-y-auto px-8 pt-22.25 pb-8 w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={folderGridCollision}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="w-full space-y-6">
          {/* Top Search & Filter Control Bar */}
          <div className="flex flex-wrap items-center gap-3 select-none">
            {/* Search Input */}
            <div className="relative w-64 sm:w-72">
              <Search4 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 tint-text" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchBookmarkPlaceholder')}
                className="pl-9 h-8 text-xs rounded-xl border-border bg-card focus:border-ring"
              />
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center rounded-xl border border-border p-1 bg-card/60 shrink-0 gap-1">
              <FilterBtn
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                icon={<Filter className="h-3.5 w-3.5 text-current" weight="Filled" />}
                label={t('filterAll')}
              />
              <FilterBtn
                active={filter === 'folders'}
                onClick={() => setFilter('folders')}
                icon={<FolderBookmark className="h-3.5 w-3.5 text-current" weight="Filled" />}
                label={t('filterFolders')}
              />
              <FilterBtn
                active={filter === 'bookmarks'}
                onClick={() => setFilter('bookmarks')}
                icon={<Link2 className="h-3.5 w-3.5 text-current" weight="Filled" />}
                label={t('filterLinks')}
              />
            </div>
          </div>

          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                className="h-7 text-xs gap-1.5 bg-card/50 border-border text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('back')}
              </Button>
              <div className="flex items-center gap-1.5 tint-text font-mono text-[11px] overflow-hidden truncate">
                <button
                  onClick={() => setCurrentFolderId(toolbarId())}
                  className="hover:underline text-foreground"
                >
                  {t('rootFolder')}
                </button>
                {breadcrumbs.map((b, idx) => (
                  <React.Fragment key={b.id}>
                    <span>/</span>
                    <button
                      onClick={() => setCurrentFolderId(b.id)}
                      className={cn(
                        'hover:underline truncate max-w-37.5',
                        idx === breadcrumbs.length - 1
                          ? 'text-primary font-semibold'
                          : 'text-foreground'
                      )}
                    >
                      {b.title}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start w-full relative">
            {showFolders && (
              <div className="lg:col-span-3 space-y-3 w-full relative">
                <RootGridDropZone>
                  <div className="space-y-3 w-full relative">
                    <div className="h-7 flex items-center justify-between px-1">
                      <span className="section-label flex items-center gap-2">
                        <FolderIcon className="h-3.5 w-3.5 tint-text" />
                        {t('sectionFolder')}
                      </span>
                    </div>

                    {shownFolders.length > 0 ? (
                      <SortableContext
                        items={shownFolders.map((f) => `folder:${f.id}`)}
                        strategy={rectSortingStrategy}
                      >
                        {/* 2D Responsive Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start w-full">
                          {shownFolders.map((f) => (
                            <FolderCard
                              key={f.id}
                              folder={f}
                              onRename={renameFolder}
                              onDeleteChild={deleteNode}
                              onDeleteFolder={deleteNode}
                              onNavigate={(id) => setCurrentFolderId(id)}
                              isOver={overId === `folder:${f.id}`}
                              activeId={activeId}
                              overId={overId}
                              isShiftPressed={isShiftPressed}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs tint-text">
                        {t('noFoldersFound')}
                      </div>
                    )}
                  </div>
                </RootGridDropZone>
              </div>
            )}

            {showBookmarks && (
              <div className={cn('space-y-3 w-full lg:col-span-1', !showFolders && 'lg:col-span-4')}>
                <RootLinksDropZone>
                  <div className="space-y-3 w-full">
                    <div className="h-7 flex items-center justify-between px-1">
                      <span className="section-label flex items-center gap-2">
                        <Link2 className="h-3.5 w-3.5 tint-text" />
                        {t('sectionLinks')}
                      </span>
                      {bookmarkPageCount > 1 && (
                        <Pagination
                          page={bookmarkPage}
                          pageCount={bookmarkPageCount}
                          onChange={setBookmarkPage}
                        />
                      )}
                    </div>

                    <div className="w-full space-y-3">
                      {bookmarksView.length > 0 ? (
                        <BookmarkList
                          bookmarks={bookmarksView}
                          onDelete={deleteNode}
                          activeId={activeId}
                          overId={overId}
                          onNavigate={(id) => setCurrentFolderId(id)}
                        />
                      ) : (
                        <div className="card-inner-box py-8 text-center text-xs tint-text">
                          {t('noLinksFound')}
                        </div>
                      )}
                    </div>
                  </div>
                </RootLinksDropZone>
              </div>
            )}
          </div>
        </div>

        {typeof window !== 'undefined'
          ? createPortal(
              <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {activeFolder ? (
                  <div className="w-90 max-w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-3 scale-105 pointer-events-none opacity-95 ring-2 ring-primary rounded-2xl overflow-hidden backdrop-blur-md bg-card transition-transform duration-100">
                    <FolderCardStatic folder={activeFolder} />
                  </div>
                ) : activeBookmark ? (
                  <div className="flex items-center gap-2.5 rounded-xl border-2 border-primary bg-card/90 backdrop-blur-xl px-4 py-2.5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] scale-110 rotate-3 pointer-events-none text-xs z-50 transition-transform duration-100">
                    {!activeBookmark.url ? (
                      <FolderIcon className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <FaviconImage url={activeBookmark.url} className="h-4 w-4 shrink-0 rounded-sm" />
                    )}
                    <span className="font-semibold text-foreground max-w-55 truncate">
                      {activeBookmark.title || domainOf(activeBookmark.url) || t('untitled')}
                    </span>
                  </div>
                ) : null}
              </DragOverlay>,
              document.body
            )
          : null}
      </DndContext>
    </div>
  );
}

function RootGridDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: 'folder-grid-root',
    data: { type: 'root-grid' },
  });
  return (
    <div ref={setNodeRef} className="w-full">
      {children}
    </div>
  );
}

function RootLinksDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: 'root-links-dropzone',
    data: { type: 'root-links' },
  });
  return (
    <div ref={setNodeRef} className="w-full">
      {children}
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-3 h-6 text-xs font-medium transition-all select-none cursor-pointer',
        active
          ? 'bg-accent text-primary font-semibold border border-border'
          : 'tint-text hover:text-foreground hover:bg-accent/30'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
