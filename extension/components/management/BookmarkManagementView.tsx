import * as React from 'react';
import {
  ClipboardCheck,
  FolderAdd,
  FolderOpen3,
  FolderMinus3,
  Refresh,
  Search4,
  Sparkles,
  Trash2,
} from 'reicon-react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { FilterBtn } from '@/components/ui/filter-btn';
import { SuccessNotice } from '@/components/ui/notice-banner';
import { Pagination } from '@/components/bookmark/Pagination';
import { moveToTrash } from '@/lib/trash';
import {
  scanDuplicateFolders,
  mergeDuplicateFolderGroup,
  scanFoldersForSplitting,
  scanEmptyFolders,
  walkBookmarkTree,
  type DuplicateFolderGroup,
  type SplitFolderCandidate,
  type EmptyFolderItem,
} from '@/lib/bookmarkManagement';

import { DuplicateLinksTab, type DuplicateGroup } from './DuplicateLinksTab';
import { MergeFoldersTab } from './MergeFoldersTab';
import { DomainGroupingTab } from './DomainGroupingTab';
import { EmptyFoldersTab } from './EmptyFoldersTab';

const ITEMS_PER_PAGE = 8;

// Checkbox tri-state: none / some / all selected.
function triState(selected: number, total: number): boolean | 'indeterminate' {
  if (total === 0 || selected === 0) return false;
  return selected === total ? true : 'indeterminate';
}

// Canonical URL key for duplicate matching. `new URL` lowercases the host and
// splits off hash/query natively; locale prefixes and index files stay regex.
function normalizeUrl(rawUrl: string, strategy: 'strict' | 'normalized' | 'smart'): string {
  if (strategy === 'strict') return rawUrl.trim();
  let u: string;
  try {
    const parsed = new URL(rawUrl.trim());
    u = parsed.hostname.replace(/^www\./, '') + parsed.pathname.toLowerCase();
  } catch {
    return rawUrl.trim();
  }
  if (strategy === 'smart') {
    u = u.replace(/\/(en-us|id-id|en|id|zh-cn|ja|de|fr|es)(\/|$)/g, '/');
  }
  u = u.replace(/\/index\.(html?|php|aspx?)$/, '');
  return u.length > 1 && u.endsWith('/') ? u.slice(0, -1) : u;
}

// Auto-select the duplicates to remove (keep the oldest bookmark of each group).
function autoSelectSet(groups: DuplicateGroup[]): Set<string> {
  const ids = new Set<string>();
  groups.forEach((g) => g.items.slice(1).forEach((item) => ids.add(item.id)));
  return ids;
}

export function BookmarkManagementView() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = React.useState<'duplicates' | 'merge' | 'split' | 'empty'>('duplicates');

  // Common UI states
  const [isScanning, setIsScanning] = React.useState(false);
  const [hasScanned, setHasScanned] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  // Sub-tab 1: Duplicate Link Scanner state
  const [matchStrategy, setMatchStrategy] = React.useState<'strict' | 'normalized' | 'smart'>('smart');
  const [dupLinkGroups, setDupLinkGroups] = React.useState<DuplicateGroup[]>([]);
  const [selectedLinkIds, setSelectedLinkIds] = React.useState<Set<string>>(new Set());
  const [expandedLinkGroupKeys, setExpandedLinkGroupKeys] = React.useState<Set<string>>(new Set());

  const toggleExpandLinkGroup = React.useCallback((key: string) => {
    setExpandedLinkGroupKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Sub-tab 2: Merge Duplicate Folders state
  const [duplicateGroups, setDuplicateGroups] = React.useState<DuplicateFolderGroup[]>([]);
  const [selectedGroupKeys, setSelectedGroupKeys] = React.useState<Set<string>>(new Set());
  const [expandedGroupKeys, setExpandedGroupKeys] = React.useState<Set<string>>(new Set());

  const toggleExpandGroup = React.useCallback((key: string) => {
    setExpandedGroupKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Sub-tab 3: Group Folders state
  const [splitCandidates, setSplitCandidates] = React.useState<SplitFolderCandidate[]>([]);

  // Sub-tab 4: Empty Folders state
  const [emptyFolders, setEmptyFolders] = React.useState<EmptyFolderItem[]>([]);
  const [selectedEmptyFolderIds, setSelectedEmptyFolderIds] = React.useState<Set<string>>(new Set());

  // Shared scan wrapper: loading state + notice reset + page reset.
  const runScan = React.useCallback(async (loader: () => Promise<void>) => {
    setIsScanning(true);
    setNotice(null);
    try {
      await loader();
      setHasScanned(true);
      setPage(1);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleScanDuplicateLinks = React.useCallback(
    () =>
      runScan(async () => {
        const map = new Map<string, Array<{ id: string; title: string; url: string; folderPath: string; dateAdded?: number }>>();

        await walkBookmarkTree((node, currentPath) => {
          if (!node.url) return;
          const key = normalizeUrl(node.url, matchStrategy);
          const item = {
            id: node.id,
            title: node.title || node.url,
            url: node.url,
            folderPath: currentPath.join(' > ') || 'Root',
            dateAdded: node.dateAdded,
          };
          const existing = map.get(key) || [];
          existing.push(item);
          map.set(key, existing);
        });

        const dupGroups: DuplicateGroup[] = [];
        map.forEach((items, key) => {
          if (items.length > 1) {
            const sorted = [...items].sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));
            dupGroups.push({ key, displayUrl: sorted[0].url, items: sorted });
          }
        });

        dupGroups.sort((a, b) => b.items.length - a.items.length);
        setDupLinkGroups(dupGroups);
        setSelectedLinkIds(autoSelectSet(dupGroups));
      }),
    [matchStrategy, runScan]
  );

  const handleScanMerge = React.useCallback(
    () =>
      runScan(async () => {
        const groups = await scanDuplicateFolders();
        setDuplicateGroups(groups);
        setSelectedGroupKeys(new Set(groups.map((g) => g.key)));
      }),
    [runScan]
  );

  const handleScanSplit = React.useCallback(
    () =>
      runScan(async () => {
        setSplitCandidates(await scanFoldersForSplitting());
      }),
    [runScan]
  );

  const handleScanEmpty = React.useCallback(
    () =>
      runScan(async () => {
        const folders = await scanEmptyFolders();
        setEmptyFolders(folders);
        setSelectedEmptyFolderIds(new Set(folders.map((f) => f.id)));
      }),
    [runScan]
  );

  // Trigger scan when subtab or matchStrategy changes
  React.useEffect(() => {
    setNotice(null);
    if (activeSubTab === 'duplicates') handleScanDuplicateLinks();
    else if (activeSubTab === 'merge') handleScanMerge();
    else if (activeSubTab === 'split') handleScanSplit();
    else if (activeSubTab === 'empty') handleScanEmpty();
  }, [activeSubTab, matchStrategy, handleScanDuplicateLinks, handleScanMerge, handleScanSplit, handleScanEmpty]);

  const rescan = () => {
    if (activeSubTab === 'duplicates') return handleScanDuplicateLinks();
    if (activeSubTab === 'merge') return handleScanMerge();
    if (activeSubTab === 'split') return handleScanSplit();
    return handleScanEmpty();
  };

  // Shared batch-action wrapper: run work (returns the notice text), then rescan.
  const runAction = async (rescanFn: () => Promise<void> | void, work: () => Promise<string>) => {
    setIsProcessing(true);
    setNotice(null);
    try {
      setNotice(await work());
      await rescanFn();
    } catch (err) {
      console.error('Management action failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDuplicateLinks = () => {
    if (selectedLinkIds.size === 0) return;
    runAction(handleScanDuplicateLinks, async () => {
      const ids = Array.from(selectedLinkIds);
      for (const id of ids) {
        await moveToTrash(id);
      }
      return t('deleteSuccessNotice', { count: ids.length });
    });
  };

  const handleMergeSelected = () => {
    if (selectedGroupKeys.size === 0) return;
    runAction(handleScanMerge, async () => {
      let totalMergedFolders = 0;
      let totalMovedBookmarks = 0;
      let totalTrashedDuplicates = 0;

      const groupsToMerge = duplicateGroups.filter((g) => selectedGroupKeys.has(g.key));
      for (const group of groupsToMerge) {
        const result = await mergeDuplicateFolderGroup(group);
        totalMergedFolders += group.folders.length - 1;
        totalMovedBookmarks += result.movedBookmarksCount;
        totalTrashedDuplicates += result.trashedDuplicatesCount;
      }
      return t('mergedFoldersNotice', {
        folders: totalMergedFolders,
        moved: totalMovedBookmarks,
        trashed: totalTrashedDuplicates,
      });
    });
  };

  const handleDeleteEmptyFolders = () => {
    if (selectedEmptyFolderIds.size === 0) return;
    runAction(handleScanEmpty, async () => {
      const ids = Array.from(selectedEmptyFolderIds);
      for (const id of ids) {
        await moveToTrash(id);
      }
      return t('movedEmptyFoldersNotice', { count: ids.length });
    });
  };

  // Compute total items and pages
  const currentTotalItems = React.useMemo(() => {
    if (activeSubTab === 'duplicates') return dupLinkGroups.reduce((acc, g) => acc + g.items.length, 0);
    if (activeSubTab === 'merge') return duplicateGroups.length;
    if (activeSubTab === 'split') return splitCandidates.length;
    return emptyFolders.length;
  }, [activeSubTab, dupLinkGroups, duplicateGroups.length, splitCandidates.length, emptyFolders.length]);

  const pageCount = React.useMemo(() => {
    if (activeSubTab === 'duplicates') return Math.max(1, Math.ceil(dupLinkGroups.length / ITEMS_PER_PAGE));
    return Math.max(1, Math.ceil(currentTotalItems / ITEMS_PER_PAGE));
  }, [activeSubTab, dupLinkGroups.length, currentTotalItems]);

  const getCurrentPageData = <T,>(items: T[]): T[] => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const matchOptions = React.useMemo(
    () => [
      { value: 'smart', label: t('matchSmart') },
      { value: 'normalized', label: t('matchNormalized') },
      { value: 'strict', label: t('matchStrict') },
    ],
    [t]
  );

  const handleAutoSelectDuplicates = React.useCallback(() => {
    setSelectedLinkIds(autoSelectSet(dupLinkGroups));
  }, [dupLinkGroups]);

  const allDupItemIds = React.useMemo(() => {
    const ids: string[] = [];
    dupLinkGroups.forEach((g) => g.items.forEach((item) => ids.push(item.id)));
    return ids;
  }, [dupLinkGroups]);

  const dupHeaderCheckedState = triState(selectedLinkIds.size, allDupItemIds.length);
  const mergeHeaderCheckedState = triState(selectedGroupKeys.size, duplicateGroups.length);
  const emptyHeaderCheckedState = triState(selectedEmptyFolderIds.size, emptyFolders.length);

  const subTabs = [
    { id: 'duplicates', label: t('subTabDuplicates'), icon: <ClipboardCheck className="h-3.5 w-3.5 text-current" weight="Filled" /> },
    { id: 'merge', label: t('subTabMerge'), icon: <FolderAdd className="h-3.5 w-3.5 text-current" weight="Filled" /> },
    { id: 'split', label: t('subTabSplit'), icon: <FolderOpen3 className="h-3.5 w-3.5 text-current" weight="Filled" /> },
    { id: 'empty', label: t('subTabEmpty'), icon: <FolderMinus3 className="h-3.5 w-3.5 text-current" weight="Filled" /> },
  ] as const;

  return (
    <div className="flex-1 w-full min-w-0 h-full overflow-y-auto px-8 pt-22.25 pb-8 select-none">
      <div className="w-full space-y-3">
        {/* Notice Banner */}
        {notice && <SuccessNotice>{notice}</SuccessNotice>}

        {/* Clean, Borderless Toolbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          {/* Left Side: Sub-tab Pills & Sub-filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Sub-Tab Navigation Pill Container */}
            <div className="flex items-center rounded-xl border border-border p-1 bg-card/60 shrink-0 gap-1 select-none">
              {subTabs.map((tab) => (
                <FilterBtn
                  key={tab.id}
                  active={activeSubTab === tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  icon={tab.icon}
                  label={tab.label}
                />
              ))}
            </div>

            {/* Match Strategy Dropdown (When on Duplicates tab) */}
            {activeSubTab === 'duplicates' && (
              <div className="w-56 shrink-0">
                <Select
                  value={matchStrategy}
                  onValueChange={(val) => setMatchStrategy(val as 'strict' | 'normalized' | 'smart')}
                  options={matchOptions}
                  className="h-8 text-xs rounded-xl bg-card border-border text-foreground"
                />
              </div>
            )}

            {/* Scan / Rescan Button */}
            <Button
              onClick={rescan}
              disabled={isScanning}
              className="flex items-center gap-1.5 h-8 px-3.5 text-xs rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-semibold cursor-pointer active:scale-95 transition-all"
            >
              {isScanning ? (
                <Refresh className="h-3.5 w-3.5 animate-spin text-current" />
              ) : (
                <Search4 className="h-3.5 w-3.5 text-current" />
              )}
              <span>{hasScanned ? t('rescanButton') : t('scanBtn')}</span>
            </Button>

            {/* Batch Action Buttons */}
            {activeSubTab === 'duplicates' && hasScanned && dupLinkGroups.length > 0 && (
              <>
                <Button
                  onClick={handleAutoSelectDuplicates}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex items-center gap-1.5 h-8 px-3.5 bg-card text-foreground hover:bg-accent font-semibold text-xs rounded-xl border border-border transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-current" />
                  <span>{t('autoSelectShort')}</span>
                </Button>

                <Button
                  onClick={handleDeleteDuplicateLinks}
                  disabled={selectedLinkIds.size === 0 || isProcessing}
                  className="flex items-center gap-1.5 h-8 px-3.5 bg-destructive hover:opacity-90 text-white font-semibold text-xs rounded-xl disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
                >
                  {isProcessing ? (
                    <Refresh className="h-3.5 w-3.5 animate-spin text-white" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  )}
                  <span>{t('deleteSelected', { count: selectedLinkIds.size })}</span>
                </Button>
              </>
            )}

            {activeSubTab === 'merge' && hasScanned && duplicateGroups.length > 0 && (
              <Button
                onClick={handleMergeSelected}
                disabled={selectedGroupKeys.size === 0 || isProcessing}
                className="flex items-center gap-1.5 h-8 px-3.5 bg-primary text-primary-foreground hover:opacity-90 font-semibold text-xs rounded-xl disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
              >
                {isProcessing ? (
                  <Refresh className="h-3.5 w-3.5 animate-spin text-current" />
                ) : (
                  <FolderAdd className="h-3.5 w-3.5 text-current" weight="Filled" />
                )}
                <span>{t('mergeAllSelected', { count: selectedGroupKeys.size })}</span>
              </Button>
            )}

            {activeSubTab === 'empty' && hasScanned && emptyFolders.length > 0 && (
              <Button
                onClick={handleDeleteEmptyFolders}
                disabled={selectedEmptyFolderIds.size === 0 || isProcessing}
                className="flex items-center gap-1.5 h-8 px-3.5 bg-destructive hover:opacity-90 text-white font-semibold text-xs rounded-xl disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
              >
                {isProcessing ? (
                  <Refresh className="h-3.5 w-3.5 animate-spin text-white" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                )}
                <span>{t('deleteSelected', { count: selectedEmptyFolderIds.size })}</span>
              </Button>
            )}
          </div>

          {/* Right Side: Summary & Pagination */}
          <div className="flex items-center gap-3 text-xs font-semibold text-foreground shrink-0">
            {isScanning ? (
              <span className="flex items-center gap-2 tint-text">
                <Refresh className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>{t('mgmtScanning')}</span>
              </span>
            ) : !hasScanned ? (
              <span className="tint-text font-medium">{t('clickScanToStart')}</span>
            ) : currentTotalItems > 0 ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium tint-text">
                  {t('itemsFound', { count: currentTotalItems })}
                </span>
                {pageCount > 1 && <Pagination page={page} pageCount={pageCount} onChange={setPage} />}
              </div>
            ) : (
              <span className="tint-text font-medium">{t('noItemsFound')}</span>
            )}
          </div>
        </div>

        {/* Fixed Table Layout Container (Strict 1-Word Column Headers) */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="border-b border-border bg-background/60 tint-text font-medium select-none">
                  {activeSubTab === 'duplicates' ? (
                    <>
                      <th className="py-2.5 px-4 w-12 text-center">
                        <Checkbox
                          checked={dupHeaderCheckedState}
                          disabled={!hasScanned || dupLinkGroups.length === 0}
                          onCheckedChange={(c) => {
                            if (c) setSelectedLinkIds(new Set(allDupItemIds));
                            else setSelectedLinkIds(new Set());
                          }}
                        />
                      </th>
                      <th className="py-2.5 px-4 w-72">Link</th>
                      <th className="py-2.5 px-4">{t('colLocation')}</th>
                      <th className="py-2.5 px-4 w-32 text-center">{t('colStatus')}</th>
                      <th className="py-2.5 px-4 w-32 text-center">{t('colAction')}</th>
                    </>
                  ) : activeSubTab === 'merge' ? (
                    <>
                      <th className="py-2.5 px-4 w-12 text-center">
                        <Checkbox
                          checked={mergeHeaderCheckedState}
                          disabled={!hasScanned || duplicateGroups.length === 0}
                          onCheckedChange={(c) => {
                            if (c) setSelectedGroupKeys(new Set(duplicateGroups.map((g) => g.key)));
                            else setSelectedGroupKeys(new Set());
                          }}
                        />
                      </th>
                      <th className="py-2.5 px-4 w-72">{t('colFolder')}</th>
                      <th className="py-2.5 px-4">{t('colTarget')}</th>
                      <th className="py-2.5 px-4 w-32 text-center">{t('colCount')}</th>
                      <th className="py-2.5 px-4 w-32 text-center">{t('colAction')}</th>
                    </>
                  ) : activeSubTab === 'empty' ? (
                    <>
                      <th className="py-2.5 px-4 w-12 text-center">
                        <Checkbox
                          checked={emptyHeaderCheckedState}
                          disabled={!hasScanned || emptyFolders.length === 0}
                          onCheckedChange={(c) => {
                            if (c) setSelectedEmptyFolderIds(new Set(emptyFolders.map((f) => f.id)));
                            else setSelectedEmptyFolderIds(new Set());
                          }}
                        />
                      </th>
                      <th className="py-2.5 px-4 w-72">{t('colFolder')}</th>
                      <th className="py-2.5 px-4">{t('colLocation')}</th>
                      <th className="py-2.5 px-4 w-32 text-center">{t('colStatus')}</th>
                      <th className="py-2.5 px-4 w-32 text-center">{t('colAction')}</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4 w-72">{t('colFolder')}</th>
                      <th className="py-2.5 px-4">{t('colDomains')}</th>
                      <th className="py-2.5 px-4 w-32 text-center">{t('colCount')}</th>
                      <th className="py-2.5 px-4 w-32 text-center">{t('colAction')}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {activeSubTab === 'duplicates' && (
                  <DuplicateLinksTab
                    dupLinkGroups={dupLinkGroups}
                    selectedLinkIds={selectedLinkIds}
                    setSelectedLinkIds={setSelectedLinkIds}
                    expandedLinkGroupKeys={expandedLinkGroupKeys}
                    toggleExpandLinkGroup={toggleExpandLinkGroup}
                    pageData={getCurrentPageData(dupLinkGroups)}
                    rowOffset={(page - 1) * ITEMS_PER_PAGE}
                    hasScanned={hasScanned}
                    isScanning={isScanning}
                    handleScanDuplicateLinks={handleScanDuplicateLinks}
                  />
                )}

                {activeSubTab === 'merge' && (
                  <MergeFoldersTab
                    duplicateGroups={duplicateGroups}
                    selectedGroupKeys={selectedGroupKeys}
                    setSelectedGroupKeys={setSelectedGroupKeys}
                    expandedGroupKeys={expandedGroupKeys}
                    toggleExpandGroup={toggleExpandGroup}
                    pageData={getCurrentPageData(duplicateGroups)}
                    hasScanned={hasScanned}
                    isScanning={isScanning}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    setNotice={setNotice}
                    handleScanMerge={handleScanMerge}
                  />
                )}

                {activeSubTab === 'split' && (
                  <DomainGroupingTab
                    splitCandidates={splitCandidates}
                    pageData={getCurrentPageData(splitCandidates)}
                    rowOffset={(page - 1) * ITEMS_PER_PAGE}
                    hasScanned={hasScanned}
                    isScanning={isScanning}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    setNotice={setNotice}
                    handleScanSplit={handleScanSplit}
                  />
                )}

                {activeSubTab === 'empty' && (
                  <EmptyFoldersTab
                    emptyFolders={emptyFolders}
                    selectedEmptyFolderIds={selectedEmptyFolderIds}
                    setSelectedEmptyFolderIds={setSelectedEmptyFolderIds}
                    pageData={getCurrentPageData(emptyFolders)}
                    hasScanned={hasScanned}
                    isScanning={isScanning}
                    handleScanEmpty={handleScanEmpty}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
