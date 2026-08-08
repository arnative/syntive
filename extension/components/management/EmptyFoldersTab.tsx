import * as React from 'react';
import { Folder, Trash2 } from 'reicon-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyFolderItem } from '@/lib/bookmarkManagement';
import { useScanTableState } from './ScanTableState';
import { moveToTrash } from '@/lib/trash';

interface EmptyFoldersTabProps {
  emptyFolders: EmptyFolderItem[];
  selectedEmptyFolderIds: Set<string>;
  setSelectedEmptyFolderIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  pageData: EmptyFolderItem[];
  language: string;
  hasScanned: boolean;
  isScanning: boolean;
  handleScanEmpty: () => void;
}

export function EmptyFoldersTab({
  emptyFolders,
  selectedEmptyFolderIds,
  setSelectedEmptyFolderIds,
  pageData,
  language,
  hasScanned,
  isScanning,
  handleScanEmpty,
}: EmptyFoldersTabProps) {
  const placeholder = useScanTableState(hasScanned, isScanning, emptyFolders.length, language, {
    subtitleId: 'Klik tombol Pindai untuk menganalisis folder kosong Anda.',
    subtitleEn: 'Click Scan to analyze your empty folders.',
    emptyId: 'Tidak Ada Folder Kosong Ditemukan!',
    emptyEn: 'No Empty Folders Found!',
  });
  if (placeholder) return placeholder;

  return (
    <>
      {pageData.map((item) => {
        const isSelected = selectedEmptyFolderIds.has(item.id);

        return (
          <tr key={item.id} className="hover:bg-accent/40 transition-colors">
            <td className="py-2.5 px-4 text-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(c) => {
                  setSelectedEmptyFolderIds((prev) => {
                    const next = new Set(prev);
                    if (c) next.add(item.id);
                    else next.delete(item.id);
                    return next;
                  });
                }}
              />
            </td>
            <td className="py-2.5 px-4 min-w-0">
              <div className="flex items-center gap-2 font-medium text-foreground truncate" title={item.folderName}>
                <Folder className="h-4 w-4 tint-text shrink-0" />
                <span className="truncate">{item.folderName}</span>
              </div>
            </td>
            <td className="py-2.5 px-4 tint-text font-mono text-[11px] truncate" title={item.folderPath}>
              {item.folderPath}
            </td>
            <td className="py-2.5 px-4 text-center">
              <Badge variant="outline" className="text-[9px] uppercase font-medium text-destructive border-destructive/30 bg-destructive/10 rounded-md">
                {language === 'id' ? 'Kosong' : 'Empty'}
              </Badge>
            </td>
            <td className="py-2.5 px-4 text-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await moveToTrash(item.id);
                  handleScanEmpty();
                }}
                className="h-7 w-7 p-0 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
                title="Buang ke Tong Sampah"
              >
                <Trash2 className="h-3.5 w-3.5 text-current" />
              </Button>
            </td>
          </tr>
        );
      })}
    </>
  );
}
