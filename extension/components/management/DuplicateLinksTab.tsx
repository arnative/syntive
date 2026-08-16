import * as React from 'react';
import { ArrowUpRight, Trash2, AngleDown, AngleRight } from 'reicon-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { moveToTrash } from '@/lib/trash';
import { useTranslation } from '@/lib/i18n';
import { useScanTableState } from './ScanTableState';

interface DuplicateBookmarkItem {
  id: string;
  title: string;
  url: string;
  dateAdded?: number;
  folderPath: string;
}

export interface DuplicateGroup {
  key: string;
  displayUrl: string;
  items: DuplicateBookmarkItem[];
}

interface DuplicateLinksTabProps {
  dupLinkGroups: DuplicateGroup[];
  selectedLinkIds: Set<string>;
  setSelectedLinkIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedLinkGroupKeys: Set<string>;
  toggleExpandLinkGroup: (key: string) => void;
  pageData: DuplicateGroup[];
  rowOffset: number;
  hasScanned: boolean;
  isScanning: boolean;
  handleScanDuplicateLinks: () => void;
}

export function DuplicateLinksTab({
  dupLinkGroups,
  selectedLinkIds,
  setSelectedLinkIds,
  expandedLinkGroupKeys,
  toggleExpandLinkGroup,
  pageData,
  rowOffset,
  hasScanned,
  isScanning,
  handleScanDuplicateLinks,
}: DuplicateLinksTabProps) {
  const { t } = useTranslation();
  const placeholder = useScanTableState(hasScanned, isScanning, dupLinkGroups.length, 'scanSubDuplicates', 'emptyDuplicatesTitle');
  if (placeholder) return placeholder;

  return (
    <>
      {pageData.map((group, groupIdx) => {
        const isGroupExpanded = expandedLinkGroupKeys.has(group.key);
        const groupItemIds = group.items.map((i) => i.id);
        const groupSelectedCount = groupItemIds.filter((id) => selectedLinkIds.has(id)).length;
        const groupCheckedState: boolean | 'indeterminate' =
          groupSelectedCount === 0
            ? false
            : groupSelectedCount === groupItemIds.length
            ? true
            : 'indeterminate';

        return (
          <React.Fragment key={group.key + groupIdx}>
            {/* Duplicate Group Header Row */}
            <tr className="bg-accent/30 hover:bg-accent/50 transition-colors">
              <td className="py-2.5 px-4 text-center">
                <Checkbox
                  checked={groupCheckedState}
                  onCheckedChange={(c) => {
                    setSelectedLinkIds((prev) => {
                      const next = new Set(prev);
                      if (c) {
                        groupItemIds.forEach((id) => next.add(id));
                      } else {
                        groupItemIds.forEach((id) => next.delete(id));
                      }
                      return next;
                    });
                  }}
                />
              </td>
              <td colSpan={4} className="py-2.5 px-4">
                <div className="flex items-center justify-between font-mono font-semibold text-foreground">
                  <div className="flex items-center gap-2 min-w-0 pr-4">
                    <button
                      type="button"
                      onClick={() => toggleExpandLinkGroup(group.key)}
                      className="p-0.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={isGroupExpanded ? t('hideDetails') : t('showDetails')}
                    >
                      {isGroupExpanded ? (
                        <AngleDown className="h-4 w-4 text-current shrink-0" />
                      ) : (
                        <AngleRight className="h-4 w-4 text-current shrink-0" />
                      )}
                    </button>
                    <span className="tint-text font-medium text-xs shrink-0">
                      #{rowOffset + groupIdx + 1}
                    </span>
                    <span
                      className="truncate text-xs cursor-pointer hover:underline"
                      title={group.displayUrl}
                      onClick={() => toggleExpandLinkGroup(group.key)}
                    >
                      {group.displayUrl}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-border bg-card text-foreground shrink-0 ml-2">
                    {t('dupCountBadge', { count: group.items.length })}
                  </Badge>
                </div>
              </td>
            </tr>

            {/* Duplicate Link Items (Rendered ONLY when expanded) */}
            {isGroupExpanded &&
              group.items.map((item, idx) => {
                const isSelected = selectedLinkIds.has(item.id);
                const isOriginal = idx === 0;

                return (
                  <tr key={item.id} className="bg-card/40 hover:bg-accent/20 transition-colors animate-in fade-in duration-150">
                    <td className="py-2.5 px-4 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(c) => {
                          setSelectedLinkIds((prev) => {
                            const next = new Set(prev);
                            if (c) next.add(item.id);
                            else next.delete(item.id);
                            return next;
                          });
                        }}
                      />
                    </td>
                    <td className="py-2.5 px-4 min-w-0">
                      <div className="flex flex-col min-w-0 pl-6">
                        <span className="font-semibold text-foreground truncate" title={item.title}>
                          {item.title}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-muted-foreground hover:text-foreground font-mono truncate flex items-center gap-1 mt-0.5"
                        >
                          <span>{item.url}</span>
                          <ArrowUpRight className="h-3 w-3 shrink-0 text-current" />
                        </a>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 tint-text font-mono text-[11px] truncate" title={item.folderPath}>
                      {item.folderPath}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {isOriginal ? (
                        <Badge className="bg-primary text-primary-foreground text-[9px] uppercase font-medium px-1.5 py-0.5 rounded-md">
                          {t('tagKeep')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] uppercase font-medium text-destructive border-destructive/30 bg-destructive/10 rounded-md">
                          {t('duplicateTag')}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await moveToTrash(item.id);
                          handleScanDuplicateLinks();
                        }}
                        className="h-7 w-7 p-0 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
                        title={t('moveToTrashTooltip')}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-current" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
          </React.Fragment>
        );
      })}
    </>
  );
}
