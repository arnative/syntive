import { Trash2, Plus } from 'reicon-react';
import { FaviconImage } from '@/components/ui/FaviconImage';
import { domainOf } from '@/lib/utils';

export interface SiteTileItem {
  id?: string;
  url: string;
  title: string;
}

export interface SiteTileProps {
  site: SiteTileItem;
  onRemove?: () => void;
  removeTooltip?: string;
}

export function getCleanSiteTitle(title: string, url: string): string {
  if (!title || title.toLowerCase().includes('just a moment')) {
    return domainOf(url);
  }
  const clean = title.split(/[-|•:]/)[0].trim();
  return clean || domainOf(url);
}

/**
 * Reusable clean & minimal Site Tile component.
 * Encapsulates inner-card tile styling, favicon loading, and item-scoped remove action.
 */
export function SiteTile({ site, onRemove, removeTooltip }: SiteTileProps) {
  const displayTitle = getCleanSiteTitle(site.title, site.url);

  return (
    <div className="card-inner-tile relative flex flex-col items-center justify-center w-full h-full p-0 group/item select-none rounded-xl min-h-0">
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 h-4.5 w-4.5 rounded-full bg-card/90 border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer z-10"
          title={removeTooltip}
        >
          <Trash2 className="h-2.5 w-2.5" weight="Filled" />
        </button>
      )}

      <a
        href={site.url}
        className="flex flex-col items-center justify-center w-full h-full gap-2.5 p-0 min-h-0 text-none"
        title={site.title || site.url}
      >
        <FaviconImage url={site.url} className="h-6 w-6 object-contain shrink-0" />
        <span className="w-full text-center text-[11px] font-normal leading-tight text-foreground whitespace-nowrap overflow-hidden px-1">
          {displayTitle}
        </span>
      </a>
    </div>
  );
}

export interface AddSiteTileProps {
  onClick: () => void;
  label: string;
  tooltip?: string;
}

export function AddSiteTile({ onClick, label, tooltip }: AddSiteTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className="card-inner-tile flex flex-col items-center justify-center w-full h-full gap-2.5 p-0 group/item select-none rounded-xl cursor-pointer hover:bg-accent/40 transition-colors min-h-0 text-none"
    >
      <div className="h-6 w-6 rounded-full bg-accent border border-border flex items-center justify-center text-muted-foreground group-hover/item:text-foreground group-hover/item:border-primary/60 transition-colors shrink-0">
        <Plus className="h-3.5 w-3.5" />
      </div>
      <span className="w-full text-center text-[11px] font-normal leading-tight text-muted-foreground group-hover/item:text-foreground whitespace-nowrap overflow-hidden px-1">
        {label}
      </span>
    </button>
  );
}
