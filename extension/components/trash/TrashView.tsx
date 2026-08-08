import * as React from 'react';
import {
  Trash2,
  RotateLeft,
Search4,
  Folder,
  Clock,
  ArrowUpRight,
  CheckCircle,
  Refresh,
} from 'reicon-react';
import {
  getTrashItems,
  restoreFromTrash,
  deletePermanently,
  emptyTrash,
  type TrashItem,
} from '@/lib/trash';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FaviconImage } from '@/components/ui/FaviconImage';
import { Pagination } from '@/components/bookmark/Pagination';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 12;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function TrashView({ onTrashChange }: { onTrashChange?: () => void }) {
  const { t } = useTranslation();
  const [items, setItems] = React.useState<TrashItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'folders' | 'links'>('all');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(1);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTrashItems();
      setItems(data);
      if (onTrashChange) onTrashChange();
    } finally {
      setLoading(false);
    }
  }, [onTrashChange]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleRestore = async (id: string) => {
    await restoreFromTrash(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setNotice(t('itemRestored'));
    await reload();
  };

  const handleDeletePermanent = async (item: TrashItem) => {
    if (window.confirm(t('deletePermanentConfirm', { title: item.title }))) {
      await deletePermanently(item.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      await reload();
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsRestoring(true);
    const count = selectedIds.size;
    try {
      for (const id of Array.from(selectedIds)) {
        await restoreFromTrash(id);
      }
      setSelectedIds(new Set());
      setNotice(t('restoreSuccessNotice', { count }));
      await reload();
    } catch (err) {
      console.error('Failed to restore selected items:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteSelectedPermanent = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (window.confirm(t('deleteSelectedPermanentConfirm', { count }))) {
      setIsDeleting(true);
      try {
        for (const id of Array.from(selectedIds)) {
          await deletePermanently(id);
        }
        setSelectedIds(new Set());
        setNotice(t('deletePermanentSuccessNotice', { count }));
        await reload();
      } catch (err) {
        console.error('Failed to permanently delete selected items:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm(t('emptyTrashConfirm'))) {
      await emptyTrash();
      setSelectedIds(new Set());
      await reload();
    }
  };

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.url && item.url.toLowerCase().includes(query.toLowerCase()));
      if (!matchesQuery) return false;
      if (filter === 'folders') return !item.url;
      if (filter === 'links') return !!item.url;
      return true;
    });
  }, [items, query, filter]);

  const pageCount = React.useMemo(() => {
    return Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  }, [filteredItems.length]);

  const paginatedItems = React.useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, page]);

  // Handle selection state
  const isAllChecked = React.useMemo(() => {
    return filteredItems.length > 0 && filteredItems.every((item) => selectedIds.has(item.id));
  }, [filteredItems, selectedIds]);

  const handleSelectAll = () => {
    const allSet = new Set(selectedIds);
    filteredItems.forEach((item) => allSet.add(item.id));
    setSelectedIds(allSet);
  };

  const handleDeselectAll = () => {
    const nextSet = new Set(selectedIds);
    filteredItems.forEach((item) => nextSet.delete(item.id));
    setSelectedIds(nextSet);
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const now = Date.now();

  return (
    <div className="flex-1 w-full min-w-0 h-full overflow-y-auto px-8 pt-22.25 pb-8 select-none">
      <div className="w-full space-y-3">
        {/* Notice Banner (Success notification) */}
        {notice && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* 30-Day Auto Cleanup InfoCircle Alert Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-primary/20 bg-primary/5 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-medium text-foreground">{t('trashNoticeTitle')}</span>
              <span className="tint-text ml-2 truncate block sm:inline">
                {t('trashNoticeDesc')}
              </span>
            </div>
          </div>
          {items.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEmptyTrash}
              className="rounded-xl h-7 px-3 text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t('emptyTrashBtn')}</span>
            </Button>
          )}
        </div>

        {/* Clean, Borderless Toolbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          {/* Left: Search, Filter Controls & Batch Actions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search Input */}
            <div className="relative w-56 shrink-0">
              <Search4 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 tint-text" />
              <Input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t('searchTrashPlaceholder')}
                className="pl-8 pr-3 h-8 text-xs rounded-xl bg-card border-border text-foreground placeholder:text-tint-foreground"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center rounded-xl border border-border p-1 bg-card/60 shrink-0 gap-1 select-none">
              <button
                type="button"
                onClick={() => {
                  setFilter('all');
                  setPage(1);
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 h-6 text-xs font-medium transition-all select-none cursor-pointer',
                  filter === 'all'
                    ? 'bg-accent text-primary font-semibold border border-border'
                    : 'tint-text hover:text-foreground hover:bg-accent/30'
                )}
              >
                <span>{t('filterAll')} ({items.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilter('folders');
                  setPage(1);
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 h-6 text-xs font-medium transition-all select-none cursor-pointer',
                  filter === 'folders'
                    ? 'bg-accent text-primary font-semibold border border-border'
                    : 'tint-text hover:text-foreground hover:bg-accent/30'
                )}
              >
                <span>{t('filterFolders')} ({items.filter((i) => !i.url).length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilter('links');
                  setPage(1);
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 h-6 text-xs font-medium transition-all select-none cursor-pointer',
                  filter === 'links'
                    ? 'bg-accent text-primary font-semibold border border-border'
                    : 'tint-text hover:text-foreground hover:bg-accent/30'
                )}
              >
                <span>{t('filterLinks')} ({items.filter((i) => !!i.url).length})</span>
              </button>
            </div>

            {/* Batch Action Buttons */}
            {selectedIds.size > 0 && (
              <>
                <Button
                  onClick={handleRestoreSelected}
                  disabled={isRestoring}
                  className="flex items-center gap-1.5 h-8 px-3 text-xs rounded-xl bg-success hover:opacity-90 text-white font-semibold cursor-pointer active:scale-95 transition-all"
                >
                  {isRestoring ? (
                    <Refresh className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateLeft className="h-3.5 w-3.5" />
                  )}
                  <span>{t('restoreSelected', { count: selectedIds.size })}</span>
                </Button>

                <Button
                  onClick={handleDeleteSelectedPermanent}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 h-8 px-3 bg-destructive hover:opacity-90 text-white font-semibold text-xs rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  {isDeleting ? (
                    <Refresh className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>{t('deletePermanentSelected', { count: selectedIds.size })}</span>
                </Button>
              </>
            )}
          </div>

          {/* Right Summary Status & Pagination */}
          <div className="flex items-center gap-3 text-xs font-semibold text-foreground shrink-0">
            {filteredItems.length > 0 && (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium tint-text">
                  Total {filteredItems.length} item
                </span>
                {pageCount > 1 && <Pagination page={page} pageCount={pageCount} onChange={setPage} />}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Table Layout Container */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="border-b border-border bg-background/60 tint-text font-medium select-none">
                  <th className="py-2.5 px-4 w-12 text-center">
                    <Checkbox
                      checked={isAllChecked}
                      disabled={filteredItems.length === 0}
                      onCheckedChange={(c) => (c ? handleSelectAll() : handleDeselectAll())}
                    />
                  </th>
                  <th className="py-2.5 px-4">{t('colTitleUrl')}</th>
                  <th className="py-2.5 px-4 w-20 text-center">{t('colItemType')}</th>
                  <th className="py-2.5 px-4 w-36 text-center">{t('colStatus')}</th>
                  <th className="py-2.5 px-4 w-32 text-center">{t('colDateAdded')}</th>
                  <th className="py-2.5 px-4 w-28 text-center">{t('colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {/* State 1: Loading */}
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-14 px-4 text-center text-xs text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Refresh className="h-4 w-4 animate-spin text-primary" />
                        <span>{t('githubLoading')}</span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* State 2: Empty Trash / No Search Results */}
                {!loading && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-14 px-4 text-center text-xs text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 rounded-full bg-accent tint-text">
                          <Trash2 className="h-6 w-6" />
                        </div>
                        <p className="font-semibold text-foreground">{t('trashEmptyTitle')}</p>
                        <p className="text-[11px] tint-text max-w-xs">
                          {t('trashEmptyDesc')}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* State 3: Items List */}
                {!loading &&
                  paginatedItems.map((item) => {
                    const isChecked = selectedIds.has(item.id);
                    const daysLeft = Math.max(
                      0,
                      Math.ceil((THIRTY_DAYS_MS - (now - item.deletedAt)) / (24 * 60 * 60 * 1000))
                    );

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-(--color-destructive)/5 hover:bg-(--color-destructive)/10'
                            : 'hover:bg-(--color-accent)/20'
                        }`}
                      >
                        <td className="py-2.5 px-4 text-center select-none" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggleItem(item.id)}
                          />
                        </td>
                        <td className="py-2.5 px-4 min-w-0">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-accent shrink-0 border border-border flex items-center justify-center h-8 w-8">
                              {item.url ? (
                                <FaviconImage url={item.url} className="h-4 w-4 object-contain" />
                              ) : (
                                <Folder className="h-4 w-4 text-warning" />
                              )}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-semibold text-foreground truncate" title={item.title}>
                                {item.title}
                              </div>
                              {item.url ? (
                                <div className="text-[11px] font-mono tint-text truncate" title={item.url}>
                                  {item.url}
                                </div>
                              ) : (
                                <div className="text-[11px] font-mono tint-text">
                                  {item.children?.length ?? 0} items inside
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 w-20 text-center">
                          {item.url ? (
                            <Badge color="accent" compact className="text-[10px]">
                              Link
                            </Badge>
                          ) : (
                            <Badge color="sky" compact className="text-[10px]">
                              Folder
                            </Badge>
                          )}
                        </td>
                        <td className="py-2.5 px-4 w-36 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-warning/10 text-warning font-mono text-[10px] font-semibold whitespace-nowrap">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{t('daysLeft', { days: daysLeft })}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-4 w-32 text-center text-[11px] font-mono tint-text">
                          {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2.5 px-4 w-28 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(item.id)}
                              className="h-7 w-7 p-0 rounded-lg bg-background hover:bg-accent border-border text-foreground flex items-center justify-center cursor-pointer"
                              title={t('restoreBtn')}
                            >
                              <RotateLeft className="h-3.5 w-3.5 text-success" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePermanent(item)}
                              className="h-7 w-7 p-0 rounded-lg tint-text hover:text-destructive hover:bg-destructive/10 flex items-center justify-center cursor-pointer"
                              title={t('deletePermanentBtn')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>

                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex p-1.5 rounded-lg tint-text hover:text-foreground hover:bg-accent transition-colors"
                                title="Buka URL di tab baru"
                              >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Pagination InfoCircle */}
        {!loading && pageCount > 1 && (
          <div className="flex items-center justify-between px-2 py-1 text-xs tint-text">
            <div>
              {t('showingTrashPageText', { page, pageCount, totalItems: filteredItems.length })}
            </div>
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
