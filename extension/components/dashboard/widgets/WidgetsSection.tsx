import * as React from 'react';
import { Search4, X, Menu4, AngleDown } from 'reicon-react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLocalStorageState } from '@/lib/hooks';
import type { SyncStatus } from '@/lib/types';
import { useTranslation, type TranslationKey } from '@/lib/i18n';
import { TopSitesWidget, FavoriteSitesWidget } from './TopAndFavoriteSites';
import { HijriCalendarWidget } from './HijriCalendarWidget';
import { SortableWidgetWrapper } from './SortableWidgetWrapper';
import { ClockWidget } from './ClockWidget';
import { NotesWidget } from './NotesWidget';
import { StatsWidget } from './StatsWidget';
import { TodoWidget } from './TodoWidget';
import { QuoteWidget, IslamicQuoteWidget } from './QuoteWidget';
import { QuranRadioWidget } from './QuranRadioWidget';
import { NatureRadioWidget } from './NatureRadioWidget';
import { PomodoroWidget } from './PomodoroWidget';
import { WorldClockWidget } from './WorldClockWidget';

interface WidgetConfig {
  id: string;
  nameKey: TranslationKey;
  enabled: boolean;
}

const DEFAULT_WIDGET_CONFIGS: WidgetConfig[] = [
  { id: 'topSites', nameKey: 'widgetTopSitesTitle', enabled: true },
  { id: 'favoriteSites', nameKey: 'widgetFavoriteSitesTitle', enabled: true },
  { id: 'clock', nameKey: 'widgetClockTitle', enabled: true },
  { id: 'stats', nameKey: 'widgetStatsTitle', enabled: true },
  { id: 'notes', nameKey: 'widgetNotesTitle', enabled: false },
  { id: 'todo', nameKey: 'widgetTodoTitle', enabled: false },
  { id: 'quote', nameKey: 'widgetQuoteTitle', enabled: false },
  { id: 'islamicQuote', nameKey: 'widgetIslamicQuoteTitle', enabled: false },
  { id: 'quranRadio', nameKey: 'widgetQuranRadioTitle', enabled: false },
  { id: 'natureRadio', nameKey: 'widgetNatureRadioTitle', enabled: false },
  { id: 'pomodoro', nameKey: 'widgetPomodoroTitle', enabled: false },
  { id: 'worldClock', nameKey: 'widgetWorldClockTitle', enabled: false },
  { id: 'hijriCalendar', nameKey: 'widgetHijriCalendarTitle', enabled: false },
];

const DEFAULT_ORDER = DEFAULT_WIDGET_CONFIGS.map((w) => w.id);
const DEFAULT_NAME_KEYS = new Map(DEFAULT_WIDGET_CONFIGS.map((w) => [w.id, w.nameKey]));

type WidgetCategoryId = 'timeProductivity' | 'sitesNavigation' | 'islamicInspiration';

interface WidgetCategoryDef {
  id: WidgetCategoryId;
  titleKey: TranslationKey;
  widgetIds: string[];
}

const WIDGET_CATEGORIES: WidgetCategoryDef[] = [
  {
    id: 'timeProductivity',
    titleKey: 'catTimeProductivity',
    widgetIds: ['clock', 'worldClock', 'pomodoro', 'todo', 'notes'],
  },
  {
    id: 'sitesNavigation',
    titleKey: 'catSitesNavigation',
    widgetIds: ['topSites', 'favoriteSites', 'stats'],
  },
  {
    id: 'islamicInspiration',
    titleKey: 'catIslamicInspiration',
    widgetIds: ['hijriCalendar', 'islamicQuote', 'quranRadio', 'quote', 'natureRadio'],
  },
];

export function WidgetsSection({
  totalBookmarksCount,
  totalFoldersCount = 0,
  directLinksCount = 0,
  syncStatus,
  manageModalOpen = false,
  onManageModalChange,
}: {
  totalBookmarksCount: number;
  totalFoldersCount?: number;
  directLinksCount?: number;
  syncStatus: SyncStatus;
  manageModalOpen?: boolean;
  onManageModalChange?: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [configs, setConfigs] = React.useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('syntive.widgetConfigs');
    if (saved) {
      try {
        const parsed: any[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((w) => w.id));
        const merged = parsed
          .filter((w) => w.id !== 'quicklinks')
          .map((w) => {
            const nameKey = DEFAULT_NAME_KEYS.get(w.id);
            return nameKey ? { ...w, nameKey } : w;
          });

        DEFAULT_WIDGET_CONFIGS.forEach((def) => {
          if (!existingIds.has(def.id)) {
            merged.push(def);
          }
        });
        return merged;
      } catch {
        // fallback
      }
    }
    return DEFAULT_WIDGET_CONFIGS;
  });

  const [widgetOrder, setWidgetOrder] = useLocalStorageState<string[]>('syntive.widgetOrder', DEFAULT_ORDER);

  // Filter out removed 'quicklinks' id and merge any new default ids once on mount.
  React.useEffect(() => {
    setWidgetOrder((prev) => {
      const filtered = prev.filter((id) => id !== 'quicklinks');
      DEFAULT_ORDER.forEach((id) => {
        if (!filtered.includes(id)) filtered.push(id);
      });
      return filtered.length === prev.length && filtered.every((v, i) => v === prev[i]) ? prev : filtered;
    });
  }, []);

  const [localManageModal, setLocalManageModal] = React.useState(false);
  const showManageModal = manageModalOpen || localManageModal;
  const setShowManageModal = (val: boolean) => {
    setLocalManageModal(val);
    onManageModalChange?.(val);
  };

  const [searchQuery, setSearchQuery] = React.useState('');
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>({
    timeProductivity: true,
    sitesNavigation: true,
    islamicInspiration: true,
  });

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  React.useEffect(() => {
    localStorage.setItem('syntive.widgetConfigs', JSON.stringify(configs));
  }, [configs]);

  const toggleWidget = (id: string) => {
    setConfigs((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

const widgetGridCollision: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCenter(args);
};

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const activeWidgetId = activeId?.startsWith('widget:')
    ? activeId.replace('widget:', '')
    : activeId;

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const onDragOver = (e: DragOverEvent) => {
    setOverId(e.over ? String(e.over.id) : null);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    setOverId(null);
    if (!active || !over || active.id === over.id) return;

    const activeWidgetIdStr = String(active.id).replace('widget:', '');
    const targetWidgetIdStr = String(over.id).replace('widget:', '');

    const oldIndex = widgetOrder.indexOf(activeWidgetIdStr);
    const newIndex = widgetOrder.indexOf(targetWidgetIdStr);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      setWidgetOrder((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const onDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  const isEnabled = (id: string) => configs.find((w) => w.id === id)?.enabled ?? false;

  const activeWidgetIds = widgetOrder.filter((id) => isEnabled(id));

  const renderWidgetContent = (
    id: string,
    dragHandleProps: { attributes: any; listeners: any }
  ) => {
    const dragHandle = (
      <button
        {...dragHandleProps.attributes}
        {...dragHandleProps.listeners}
        className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/60 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
        title={t('dragWidgetTooltip')}
      >
        <Menu4 weight="Filled" className="h-3.5 w-3.5" />
      </button>
    );

    switch (id) {
      case 'topSites':
        return <TopSitesWidget dragHandle={dragHandle} />;
      case 'favoriteSites':
        return <FavoriteSitesWidget dragHandle={dragHandle} />;
      case 'clock':
        return <ClockWidget dragHandle={dragHandle} />;
      case 'notes':
        return <NotesWidget dragHandle={dragHandle} />;
      case 'stats':
        return (
          <StatsWidget
            totalBookmarks={totalBookmarksCount}
            totalFolders={totalFoldersCount}
            directLinks={directLinksCount}
            syncStatus={syncStatus}
            dragHandle={dragHandle}
          />
        );
      case 'todo':
        return <TodoWidget dragHandle={dragHandle} />;
      case 'quote':
        return <QuoteWidget dragHandle={dragHandle} />;
      case 'islamicQuote':
        return <IslamicQuoteWidget dragHandle={dragHandle} />;
      case 'quranRadio':
        return <QuranRadioWidget dragHandle={dragHandle} />;
      case 'natureRadio':
        return <NatureRadioWidget dragHandle={dragHandle} />;
      case 'pomodoro':
        return <PomodoroWidget dragHandle={dragHandle} />;
      case 'worldClock':
        return <WorldClockWidget dragHandle={dragHandle} />;
      case 'hijriCalendar':
        return <HijriCalendarWidget dragHandle={dragHandle} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full mt-8 pt-2 mb-2">
      {activeWidgetIds.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={widgetGridCollision}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <SortableContext
            items={activeWidgetIds.map((id) => `widget:${id}`)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 items-stretch">
              {activeWidgetIds.map((id) => (
                <SortableWidgetWrapper key={id} id={id} isOver={overId === `widget:${id}`}>
                  {({ attributes, listeners }) =>
                    renderWidgetContent(id, { attributes, listeners })
                  }
                </SortableWidgetWrapper>
              ))}
            </div>
          </SortableContext>
          {typeof window !== 'undefined'
            ? createPortal(
                <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                  {activeWidgetId ? (
                    <div className="w-80 sm:w-85 max-w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-3 scale-105 pointer-events-none opacity-95 ring-2 ring-primary rounded-2xl overflow-hidden backdrop-blur-md bg-card transition-transform duration-100">
                      {renderWidgetContent(activeWidgetId, { attributes: {}, listeners: {} })}
                    </div>
                  ) : null}
                </DragOverlay>,
                document.body
              )
            : null}
        </DndContext>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs tint-text">
          {t('allWidgetsDisabled')}
        </div>
      )}

      {/* Modal Manage Widgets */}
      <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
        <DialogContent className="sm:max-w-md bg-card border border-border text-foreground p-6 space-y-4 rounded-2xl">
          <DialogHeader className="pb-0 space-y-1">
            <DialogTitle className="text-base font-semibold">{t('widgetSettingsModalTitle')}</DialogTitle>
            <p className="text-[11px] tint-text">
              {t('widgetSettingsModalDesc')}
            </p>
          </DialogHeader>

          {/* Search Box */}
          <div className="relative">
            <Search4 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 tint-text pointer-events-none" />
            <Input
              type="text"
              placeholder={t('searchWidgetsPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 text-xs h-9 bg-(--color-card-inner) border-border focus:ring-1 focus:ring-primary placeholder:text-tint-foreground rounded-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Categorized Widgets Accordion List */}
          <div className="max-h-95 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar py-1">
            {(() => {
              const query = searchQuery.trim().toLowerCase();
              let visibleCategoryCount = 0;

              const categoriesMarkup = WIDGET_CATEGORIES.map((category) => {
                const categoryWidgets = category.widgetIds
                  .map((id) => configs.find((w) => w.id === id))
                  .filter((w): w is WidgetConfig => Boolean(w))
                  .filter((w) => {
                    if (!query) return true;
                    return t(w.nameKey).toLowerCase().includes(query);
                  });

                if (categoryWidgets.length === 0) return null;
                visibleCategoryCount++;

                const isExpanded = query ? true : Boolean(openCategories[category.id]);
                const enabledCount = categoryWidgets.filter((w) => w.enabled).length;

                return (
                  <div
                    key={category.id}
                    className="rounded-xl border border-border bg-(--color-card-inner) overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-(--color-card-inner) hover:bg-accent/40 text-left transition-colors select-none"
                    >
                      <div className="flex items-center gap-2">
                        <AngleDown
                          className={`h-4 w-4 text-(--color-muted-foreground) transition-transform duration-200 ${
                            isExpanded ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-foreground">
                          {t(category.titleKey)}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent tint-text">
                        {enabledCount}/{categoryWidgets.length} aktif
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border divide-y divide-border bg-card/50">
                        {categoryWidgets.map((widget) => (
                          <div
                            key={widget.id}
                            onClick={() => toggleWidget(widget.id)}
                            className="flex items-center justify-between px-4 py-2.5 text-xs select-none hover:bg-accent/30 transition-colors cursor-pointer"
                          >
                            <span className="font-medium text-xs text-foreground tracking-tight">
                              {t(widget.nameKey)}
                            </span>
                            <Checkbox
                              checked={widget.enabled}
                              onCheckedChange={() => toggleWidget(widget.id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });

              if (visibleCategoryCount === 0) {
                return (
                  <div className="p-8 text-center text-xs tint-text border border-dashed border-border rounded-xl">
                    {t('noWidgetsFound')}
                  </div>
                );
              }

              return categoriesMarkup;
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
