import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Bm } from './useBookmarks';
import { FolderBookmarkRow } from './FolderCard';
import { useTranslation } from '@/lib/i18n';

export function BookmarkList({
  bookmarks, onDelete, activeId, overId, onNavigate,
}: {
  bookmarks: Bm[];
  onDelete: (id: string) => Promise<void>;
  activeId: string | null;
  overId: string | null;
  onNavigate?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const ids = bookmarks.map((b) => `bm:${b.id}`);

  if (bookmarks.length === 0) {
    return (
      <div className="card-inner-box py-8 text-center text-xs tint-text">
        {t('noBookmarksToolbar')}
      </div>
    );
  }

  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div className="card-inner-box divide-y divide-border overflow-hidden select-none">
        {bookmarks.map((b) => (
          <FolderBookmarkRow
            key={b.id}
            c={b}
            onDeleteChild={onDelete}
            activeId={activeId}
            overId={overId}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </SortableContext>
  );
}
