import * as React from 'react';
import { Folder, AngleDown, AngleRight } from 'reicon-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SplitFolderCandidate, splitFolderByDomain } from '@/lib/bookmarkManagement';
import { useTranslation } from '@/lib/i18n';
import { useScanTableState } from './ScanTableState';

interface DomainGroupingTabProps {
  splitCandidates: SplitFolderCandidate[];
  pageData: SplitFolderCandidate[];
  rowOffset: number;
  hasScanned: boolean;
  isScanning: boolean;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  setNotice: (val: string | null) => void;
  handleScanSplit: () => void;
}

export function DomainGroupingTab({
  splitCandidates,
  pageData,
  rowOffset,
  hasScanned,
  isScanning,
  isProcessing,
  setIsProcessing,
  setNotice,
  handleScanSplit,
}: DomainGroupingTabProps) {
  const { t } = useTranslation();
  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(new Set());

  const toggleExpand = (folderId: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleSplitSingle = async (candidate: SplitFolderCandidate) => {
    setIsProcessing(true);
    setNotice(null);
    try {
      const movedCount = await splitFolderByDomain(candidate);
      setNotice(t('splitSuccessNotice', { name: candidate.folderName, count: movedCount }));
      await handleScanSplit();
    } catch (err) {
      console.error('Group failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const placeholder = useScanTableState(hasScanned, isScanning, splitCandidates.length, 'scanSubSplit', 'emptySplitTitle');
  if (placeholder) return placeholder;

  return (
    <>
      {pageData.map((candidate, idx) => {
        const rowNumber = rowOffset + idx + 1;
        const isExpanded = expandedKeys.has(candidate.folderId);
        const totalBookmarksInCandidate = candidate.domainGroups.reduce((acc, g) => acc + g.count, 0);

        return (
          <React.Fragment key={candidate.folderId}>
            {/* Primary Candidate Row */}
            <tr className="hover:bg-accent/40 transition-colors">
              <td className="py-3 px-4 text-center font-mono tint-text font-medium">
                {rowNumber}
              </td>
              <td className="py-3 px-4 min-w-0">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 font-medium text-foreground min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleExpand(candidate.folderId)}
                      className="p-0.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={isExpanded ? t('hideDetails') : t('showDetails')}
                    >
                      {isExpanded ? (
                        <AngleDown className="h-4 w-4 text-current shrink-0" />
                      ) : (
                        <AngleRight className="h-4 w-4 text-current shrink-0" />
                      )}
                    </button>
                    <Folder className="h-4 w-4 text-current shrink-0" />
                    <span className="truncate" title={candidate.folderName}>
                      {candidate.folderName}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground shrink-0 ml-1">
                      {t('domainsCountBadge', { count: candidate.domainGroups.length })}
                    </Badge>
                  </div>
                  {isExpanded && (
                    <span className="text-[11px] tint-text font-mono mt-0.5 pl-6 truncate" title={candidate.folderPath}>
                      {candidate.folderPath}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {candidate.domainGroups.map((g) => (
                    <Badge
                      key={g.domain}
                      variant="outline"
                      className="text-[10px] font-mono px-1.5 py-0.5 bg-accent text-foreground border-border rounded-md"
                    >
                      {g.domain} ({g.count})
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4 text-center font-mono font-medium text-foreground">
                {totalBookmarksInCandidate} items
              </td>
              <td className="py-3 px-4 text-center">
                <Button
                  size="sm"
                  onClick={() => handleSplitSingle(candidate)}
                  disabled={isProcessing}
                  className="h-7 px-3 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                >
                  {t('groupBtnAction')}
                </Button>
              </td>
            </tr>

            {/* Sub-Folders List (Rendered ONLY when expanded) */}
            {isExpanded &&
              candidate.domainGroups.map((g, domainIdx) => (
                <tr key={g.domain + domainIdx} className="bg-card/40 hover:bg-accent/20 transition-colors animate-in fade-in duration-150">
                  <td className="py-2 px-4 text-center font-mono text-[10px] tint-text">
                    #{domainIdx + 1}
                  </td>
                  <td className="py-2 px-4 min-w-0">
                    <div className="flex items-center gap-2 pl-6">
                      <Folder className="h-3.5 w-3.5 tint-text shrink-0" />
                      <span className="font-medium text-foreground text-xs truncate" title={g.domain}>
                        {g.domain}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-4 tint-text font-mono text-[11px] truncate">
                    <span className="tint-text">Sub-folder: </span>
                    <span className="font-medium text-foreground">{g.domain}</span>
                  </td>
                  <td className="py-2 px-4 text-center tint-text font-mono text-[11px]">
                    {g.count} items
                  </td>
                  <td className="py-2 px-4 text-center">
                    <Badge variant="outline" className="text-[9px] uppercase font-medium text-info border-info/30 bg-info/10 rounded-md">
                      {t('tagWillCreate')}
                    </Badge>
                  </td>
                </tr>
              ))}
          </React.Fragment>
        );
      })}
    </>
  );
}
