import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function SortableWidgetWrapper({
  id,
  isOver,
  children,
}: {
  id: string;
  isOver?: boolean;
  children: (props: { attributes: any; listeners: any }) => React.ReactNode;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `widget:${id}`, data: { type: 'widget', widgetId: id } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border-2 border-dashed border-primary/70 bg-primary/5 rounded-2xl min-h-58.5 h-full w-full flex items-center justify-center p-6 transition-all duration-200"
      >
        <div className="flex flex-col items-center gap-1.5 text-center select-none">
          <span className="text-xs font-mono text-primary font-semibold tracking-wide uppercase">
            {t('dragHere')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'h-full flex flex-col justify-between rounded-2xl transition-shadow transition-colors relative group',
        isOver && 'ring-2 ring-primary border-2 border-primary/60'
      )}
    >
      {children({ attributes, listeners })}
    </div>
  );
}