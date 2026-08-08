import * as React from 'react';
import { AngleDown, AngleRight, Folder } from 'reicon-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DuplicateFolderGroup, mergeDuplicateFolderGroup } from '@/lib/bookmarkManagement';
import { useScanTableState } from './ScanTableState';

interface MergeFoldersTabProps {
  duplicateGroups: DuplicateFolderGroup[];
  selectedGroupKeys: Set<string>;
  setSelectedGroupKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedGroupKeys: Set<string>;
  toggleExpandGroup: (key: string) => void;
  pageData: DuplicateFolderGroup[];
  language: string;
  hasScanned: boolean;
  isScanning: boolean;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  setNotice: (val: string | null) => void;
  handleScanMerge: () => void;
}

export function MergeFoldersTab({
  duplicateGroups,
  selectedGroupKeys,
  setSelectedGroupKeys,
  expandedGroupKeys,
  toggleExpandGroup,
  pageData,
  language,
  hasScanned,
  isScanning,
  isProcessing,
  setIsProcessing,
  setNotice,
  handleScanMerge,
}: MergeFoldersTabProps) {
  const placeholder = useScanTableState(hasScanned, isScanning, duplicateGroups.length, language, {
    subtitleId: 'Klik tombol Pindai untuk menganalisis folder duplikat Anda.',
    subtitleEn: 'Click Scan to analyze your duplicate folders.',
    emptyId: 'Tidak Ada Folder Duplikat!',
    emptyEn: 'No Duplicate Folders Found!',
  });
  if (placeholder) return placeholder;

  const handleMergeSingle = async (group: DuplicateFolderGroup) => {
    setIsProcessing(true);
    setNotice(null);
    try {
      const result = await mergeDuplicateFolderGroup(group);
      setNotice(
        language === 'id'
          ? `Folder "${group.folderName}" berhasil digabungkan (${result.movedBookmarksCount} link dipindahkan).`
          : `Folder "${group.folderName}" merged successfully (${result.movedBookmarksCount} links moved).`
      );
      await handleScanMerge();
    } catch (err) {
      console.error('Merge single failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {pageData.map((group, groupIdx) => {
        const isSelected = selectedGroupKeys.has(group.key);
        const isGroupExpanded = expandedGroupKeys.has(group.key);
        const primaryFolder = group.folders[0];
        const totalItemsInGroup = group.folders.reduce((acc, f) => acc + f.itemCount, 0);

        return (
          <React.Fragment key={group.key + groupIdx}>
            {/* Primary Folder Summary Row */}
            <tr className="hover:bg-accent/40 transition-colors">
              <td className="py-3 px-4 text-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(c) => {
                    setSelectedGroupKeys((prev) => {
                      const next = new Set(prev);
                      if (c) next.add(group.key);
                      else next.delete(group.key);
                      return next;
                    });
                  }}
                />
              </td>
              <td className="py-3 px-4 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleExpandGroup(group.key)}
                    className="p-0.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={
                      isGroupExpanded
                        ? (language === 'id' ? 'Sembunyikan detail' : 'Hide details')
                        : (language === 'id' ? 'Tampilkan detail' : 'Show details')
                    }
                  >
                    {isGroupExpanded ? (
                      <AngleDown className="h-4 w-4 text-current shrink-0" />
                    ) : (
                      <AngleRight className="h-4 w-4 text-current shrink-0" />
                    )}
                  </button>
                  <Folder className="h-4 w-4 text-current shrink-0" />
                  <span className="font-medium text-foreground truncate" title={group.folderName}>
                    {group.folderName}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground shrink-0 ml-1">
                    {group.folders.length} {language === 'id' ? 'folder' : 'folders'}
                  </Badge>
                </div>
              </td>
              <td className="py-3 px-4 font-mono text-[11px] tint-text truncate" title={primaryFolder.folderPath}>
                <span className="font-medium text-foreground">
                  {language === 'id' ? 'Target: ' : 'Target: '}
                </span>
                {primaryFolder.folderPath}
              </td>
              <td className="py-3 px-4 text-center font-mono text-[11px] text-foreground font-medium">
                {totalItemsInGroup} items
              </td>
              <td className="py-3 px-4 text-center">
                <Button
                  size="sm"
                  onClick={() => handleMergeSingle(group)}
                  disabled={isProcessing}
                  className="h-7 px-3 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                >
                  <span>{language === 'id' ? 'Gabungkan' : 'Merge'}</span>
                </Button>
              </td>
            </tr>

            {/* Sub-Folders List (Rendered ONLY when expanded) */}
            {isGroupExpanded &&
              group.folders.map((sec, idx) => (
                <tr key={sec.id + idx} className="bg-card/40 hover:bg-accent/20 transition-colors animate-in fade-in duration-150">
                  <td className="py-2 px-4 text-center font-mono text-[10px] tint-text">
                    {idx === 0 ? 'Target' : `#${idx}`}
                  </td>
                  <td className="py-2 px-4 min-w-0">
                    <div className="flex items-center gap-2 pl-6">
                      <Folder className="h-3.5 w-3.5 tint-text shrink-0" />
                      <span className="font-medium text-foreground text-xs truncate" title={sec.title}>
                        {sec.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-4 tint-text font-mono text-[11px] truncate" title={sec.folderPath}>
                    {sec.folderPath}
                  </td>
                  <td className="py-2 px-4 text-center tint-text font-mono text-[11px]">
                    {sec.itemCount} items
                  </td>
                  <td className="py-2 px-4 text-center">
                    {idx === 0 ? (
                      <Badge className="bg-primary text-primary-foreground text-[9px] uppercase font-medium px-1.5 py-0.5 rounded-md">
                        {language === 'id' ? 'Folder Utama' : 'Primary'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] uppercase font-medium text-destructive border-destructive/30 bg-destructive/10 rounded-md">
                        {language === 'id' ? 'Akan Dibuang' : 'Will Trash'}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
          </React.Fragment>
        );
      })}
    </>
  );
}
