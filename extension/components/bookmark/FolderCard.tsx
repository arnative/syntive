import * as React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pen, Trash2, Folder as FolderIcon, FolderBookmark, Check, Menu4 } from 'reicon-react';
import { DeleteAction } from '@/components/ui/delete-action';
import type { Bm } from './useBookmarks';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Marquee } from '@/components/ui/marquee';
import { Pagination } from './Pagination';
import { FaviconImage } from '@/components/ui/FaviconImage';
import { cn, domainOf } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const PER_PAGE = 5;

export function FolderCard({
  folder,
  onRename,
  onDeleteChild,
  onDeleteFolder,
  onNavigate,
  isOver,
  activeId,
  overId,
  isShiftPressed,
}: {
  folder: Bm;
  onRename: (id: string, title: string) => Promise<void>;
  onDeleteChild: (id: string) => Promise<void>;
  onDeleteFolder?: (id: string) => Promise<void>;
  onNavigate?: (id: string) => void;
  isOver: boolean;
  activeId: string | null;
  overId: string | null;
  isShiftPressed?: boolean;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `folder:${folder.id}`,
    data: { type: 'folder', folderId: folder.id },
  });

  const [children, setChildren] = React.useState<Bm[]>([]);
  const [page, setPage] = React.useState(1);
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(folder.title);

  const reloadChildren = React.useCallback(() => {
    browser.bookmarks.getChildren(folder.id).then(setChildren).catch(() => {});
  }, [folder.id]);

  React.useEffect(() => {
    reloadChildren();
    browser.bookmarks.onCreated.addListener(reloadChildren);
    browser.bookmarks.onRemoved.addListener(reloadChildren);
    browser.bookmarks.onMoved.addListener(reloadChildren);
    browser.bookmarks.onChanged.addListener(reloadChildren);
    return () => {
      browser.bookmarks.onCreated.removeListener(reloadChildren);
      browser.bookmarks.onRemoved.removeListener(reloadChildren);
      browser.bookmarks.onMoved.removeListener(reloadChildren);
      browser.bookmarks.onChanged.removeListener(reloadChildren);
    };
  }, [reloadChildren]);

  React.useEffect(() => setTitle(folder.title), [folder.title]);

  const hasSubfolders = children.some((c) => !c.url);
  const pageCount = Math.max(1, Math.ceil(children.length / PER_PAGE));

  React.useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    }
  }, [children.length, page, pageCount]);

  const view = children.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const save = async () => {
    try { await onRename(folder.id, title.trim() || folder.title); setEditing(false); } catch {}
  };

  const handleDeleteFolder = async () => {
    const ok = window.confirm(t('deleteFolderConfirm', { title: folder.title }));
    if (ok) {
      try {
        if (onDeleteFolder) {
          await onDeleteFolder(folder.id);
        } else {
          await onDeleteChild(folder.id);
        }
      } catch (err) {
        console.error('Failed to delete folder', err);
      }
    }
  };

  const isFolderDragging = activeId?.startsWith('folder:');

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className="border-2 border-dashed border-primary/70 bg-primary/5 rounded-2xl h-58.5 w-full flex items-center justify-center p-6 transition-all duration-200"
      >
        <div className="flex flex-col items-center gap-1.5 text-center select-none">
          <span className="text-xs font-mono text-primary font-semibold tracking-wide">
            {t('dragHere')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className="h-58.5 w-full relative group"
    >
      {isOver && isFolderDragging && (
        <div
          className={cn(
            'absolute inset-0 rounded-2xl z-30 flex flex-col items-center justify-center p-4 backdrop-blur-sm transition-all duration-150 pointer-events-none select-none text-center',
            isShiftPressed
              ? 'bg-primary/20 border-2 border-dashed border-primary'
              : 'bg-card/80 border-2 border-primary/60'
          )}
        >
          <FolderIcon className={cn('h-7 w-7 text-primary mb-1', isShiftPressed && 'animate-bounce')} />
          {isShiftPressed ? (
            <span className="text-xs font-medium text-primary font-mono">
              {t('dragDropToFolder', { title: folder.title })}
            </span>
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-medium text-foreground">{t('dragSwapGrid')}</span>
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md mt-1 border border-primary/30">
                {t('dragHoldShiftInfo')}
              </span>
            </div>
          )}
        </div>
      )}

      <DashboardCard
        title={
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {editing ? (
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') save();
                  if (e.key === 'Escape') {
                    setEditing(false);
                    setTitle(folder.title);
                  }
                }}
                className="h-6 text-xs"
              />
            ) : hasSubfolders ? (
              <button
                className="text-left hover:text-foreground transition-colors min-w-0 truncate cursor-pointer"
                onClick={() => onNavigate?.(folder.id)}
              >
                <Marquee text={folder.title || t('untitledFolder')} className="section-label uppercase" />
              </button>
            ) : (
              <div className="text-left min-w-0 truncate cursor-default">
                <Marquee text={folder.title || t('untitledFolder')} className="section-label uppercase" />
              </div>
            )}
          </div>
        }
        icon={<FolderBookmark className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors animate-fade-in" weight="Filled" />}
        headerAction={
          <div className="flex items-center gap-1.5 shrink-0">
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            {editing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:bg-destructive/10 animate-fade-in"
                  onClick={handleDeleteFolder}
                  title={t('deleteFolder')}
                >
                  <Trash2 className="h-3 w-3" weight="Filled" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 animate-fade-in"
                  onClick={save}
                  title={t('save')}
                >
                  <Check className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary hover:bg-accent/60 transition-colors"
                onClick={() => setEditing(true)}
                title={t('renameFolder')}
              >
                <Pen className="h-3 w-3" />
              </Button>
            )}
            <button
              {...attributes}
              {...listeners}
              className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/60 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
              title={t('dragFolderTooltip')}
            >
              <Menu4 weight="Filled" className="h-3.5 w-3.5" />
            </button>
          </div>
        }
        className={cn('group h-full flex flex-col justify-between', isOver && 'ring-2 ring-primary')}
        minHeight="h-full"
      >
        <div className="pt-0 flex flex-col">
          <div>
            {view.length > 0 ? (
              <SortableContext items={view.map((c) => `bm:${c.id}`)} strategy={verticalListSortingStrategy}>
                <div className="card-inner-box divide-y divide-border overflow-hidden select-none">
                  {view.map((c) => (
                    <FolderBookmarkRow
                      key={c.id}
                      c={c}
                      onDeleteChild={onDeleteChild}
                      parentFolderId={folder.id}
                      activeId={activeId}
                      overId={overId}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </SortableContext>
            ) : (
              <div className="card-inner-box py-4 flex items-center justify-center p-4 select-none">
                <p className="text-center text-xs tint-text">{t('emptyFolder')}</p>
              </div>
            )}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}

export function FolderCardStatic({ folder }: { folder: Bm }) {
  const { t } = useTranslation();
  const [children, setChildren] = React.useState<Bm[]>([]);

  React.useEffect(() => {
    browser.bookmarks.getChildren(folder.id).then(setChildren).catch(() => {});
  }, [folder.id]);

  const view = children.slice(0, PER_PAGE);

  return (
    <div className="h-58.5 w-full">
      <DashboardCard
        title={
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <div className="text-left min-w-0 truncate cursor-default">
              <Marquee text={folder.title || t('untitledFolder')} className="section-label uppercase" />
            </div>
          </div>
        }
        icon={<FolderBookmark className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" weight="Filled" />}
        headerAction={
          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground">
              <Pen className="h-3 w-3" />
            </Button>
            <div className="p-1 rounded-md text-muted-foreground">
              <Menu4 weight="Filled" className="h-3.5 w-3.5" />
            </div>
          </div>
        }
        className="group h-full flex flex-col justify-between"
        minHeight="h-full"
      >
        <div className="pt-0 flex flex-col">
          <div>
            {view.length > 0 ? (
              <div className="card-inner-box divide-y divide-border overflow-hidden select-none">
                {view.map((c) => {
                  const isSubfolder = !c.url;
                  return (
                    <div key={c.id} className="flex items-center justify-between gap-2 py-2 px-3 text-xs h-8.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isSubfolder ? (
                          <FolderIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <FaviconImage url={c.url} className="h-3.5 w-3.5 shrink-0 rounded-sm" />
                        )}
                        <span
                          className={cn(
                            'truncate min-w-0 flex-1',
                            isSubfolder ? 'font-medium text-foreground' : 'font-normal'
                          )}
                        >
                          {c.title || domainOf(c.url) || t('untitled')}
                        </span>
                      </div>
                      <Menu4 weight="Filled" className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-30" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card-inner-box py-4 flex items-center justify-center p-4">
                <p className="text-center text-xs tint-text">{t('emptyFolder')}</p>
              </div>
            )}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}

export function FolderBookmarkRow({
  c, onDeleteChild, parentFolderId, activeId, overId, onNavigate,
}: {
  c: Bm;
  onDeleteChild: (id: string) => Promise<void>;
  parentFolderId?: string;
  activeId: string | null;
  overId: string | null;
  onNavigate?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `bm:${c.id}`,
    data: { type: 'bookmark', bookmarkId: c.id, bookmark: c, parentFolderId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.3 : 1,
  };

  const showDividerTop = overId === `bm:${c.id}` && activeId !== `bm:${c.id}`;
  const isSubfolder = !c.url;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/item flex items-center justify-between gap-2 py-2 px-3 hover:bg-accent/30 relative text-xs h-8.5 select-none",
        isDragging && "opacity-40 bg-muted"
      )}
    >
      {showDividerTop && (
        <span className="absolute -top-px left-0 right-0 h-0.5 bg-primary z-10" />
      )}
      {isSubfolder ? (
        <button
          className="flex min-w-0 flex-1 items-center gap-2 text-xs py-0.5 text-left font-medium"
          onClick={(e) => { e.stopPropagation(); onNavigate?.(c.id); }}
          draggable="false"
        >
          <FolderIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <Marquee text={c.title} className="font-medium text-foreground" />
        </button>
      ) : (
        <a
          href={c.url ?? '#'}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 flex-1 items-center gap-2 text-xs py-0.5 min-w-0"
          onClick={(e) => { if (!c.url) e.preventDefault(); }}
          draggable="false"
        >
          <FaviconImage url={c.url} className="h-3.5 w-3.5 shrink-0 rounded-sm" />
          <Marquee text={c.title || domainOf(c.url) || t('untitled')} className="font-normal text-foreground" />
        </a>
      )}

      {/* Action buttons: DnD Drag Handle + Delete Button on the right */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shrink-0 hover:bg-accent hover:text-primary flex items-center justify-center"
          title={t('dragBookmarkTooltip')}
        >
          <Menu4 weight="Filled" className="h-3.5 w-3.5" />
        </button>
        <DeleteAction onClick={(e) => { e.stopPropagation(); onDeleteChild(c.id); }} title={t('deleteBookmarkTooltip')} iconSize="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
