import * as React from 'react';
import { History, Star } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { FaviconImage } from '@/components/ui/FaviconImage';
import { SiteTile, AddSiteTile } from '@/components/ui/site-tile';
import { Pagination } from '@/components/bookmark/Pagination';
import { domainOf } from '@/lib/utils';
import { useLocalStorageState } from '@/lib/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';

interface SiteItem {
  id?: string;
  url: string;
  title: string;
}

const DEFAULT_PINNED_SITES: SiteItem[] = [
  { id: '1', title: 'YouTube', url: 'https://www.youtube.com' },
  { id: '2', title: 'GitHub', url: 'https://github.com' },
  { id: '3', title: 'Reddit', url: 'https://www.reddit.com' },
  { id: '4', title: 'Gmail', url: 'https://mail.google.com' },
  { id: '5', title: 'X', url: 'https://x.com' },
];

const FALLBACK_TOP_SITES: SiteItem[] = [
  { title: 'YouTube', url: 'https://www.youtube.com' },
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'Reddit', url: 'https://www.reddit.com' },
  { title: 'Gmail', url: 'https://mail.google.com' },
  { title: 'X', url: 'https://x.com' },
];

function getCleanTitle(title: string, url: string) {
  if (!title || title.toLowerCase().includes('just a moment')) {
    return domainOf(url);
  }
  const clean = title.split(/[-|•:]/)[0].trim();
  return clean || domainOf(url);
}

// 1. Top Sites Widget (Sering Diakses)
export function TopSitesWidget({ dragHandle }: { dragHandle?: React.ReactNode }) {
  const { t } = useTranslation();
  const [topSites, setTopSites] = React.useState<SiteItem[]>([]);
  const [loadingTop, setLoadingTop] = React.useState(true);

  React.useEffect(() => {
    const fetchTopSites = async () => {
      try {
        if (typeof browser !== 'undefined' && browser.topSites?.get) {
          const sites = await browser.topSites.get();
          if (sites && sites.length > 0) {
            setTopSites(sites.slice(0, 5));
            setLoadingTop(false);
            return;
          }
        } else if (typeof chrome !== 'undefined' && chrome.topSites?.get) {
          chrome.topSites.get((sites) => {
            if (sites && sites.length > 0) {
              setTopSites(sites.slice(0, 5));
            } else {
              setTopSites(FALLBACK_TOP_SITES);
            }
            setLoadingTop(false);
          });
          return;
        }
      } catch (err) {
        console.warn('Failed to get top sites:', err);
      }
      setTopSites(FALLBACK_TOP_SITES);
      setLoadingTop(false);
    };

    fetchTopSites();
  }, []);

  return (
    <DashboardCard
      title={t('topSitesTitle')}
      icon={<History className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerBadge={t('topSitesBadge')}
      headerAction={dragHandle}
      minHeight="h-[234px]"
    >
      <div className="pt-0 flex flex-col justify-between h-full">
        {loadingTop ? (
          <div className="space-y-2 py-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 rounded-md bg-background/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="card-inner-box divide-y divide-border overflow-hidden">
            {topSites.map((site, index) => {
              const displayTitle = getCleanTitle(site.title, site.url);
              const domain = domainOf(site.url);

              return (
                <a
                  key={index}
                  href={site.url}
                  className="flex items-center justify-between px-3 py-2 hover:bg-accent/40 transition-colors group/item text-xs select-none"
                  title={site.title || site.url}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <FaviconImage url={site.url} className="h-4 w-4 object-contain shrink-0" />
                    <span className="font-medium text-foreground truncate text-xs">
                      {displayTitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground group-hover/item:text-primary transition-colors shrink-0 ml-2">
                    {domain}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

// 2. Favorite Sites Widget (Situs Favorit - 4 Kolom, 8 Items Per Page, Page Navigation)
export function FavoriteSitesWidget({ dragHandle }: { dragHandle?: React.ReactNode }) {
  const { t } = useTranslation();
  const [pinnedSites, setPinnedSites] = useLocalStorageState<SiteItem[]>(
    'syntive.pinnedSites',
    DEFAULT_PINNED_SITES,
  );

  const [page, setPage] = React.useState(1);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');

  const ITEMS_PER_PAGE = 8;
  // Total pages: includes room for the "+ Tambah" tile at the end
  const totalSlots = pinnedSites.length + 1;
  const pageCount = Math.max(1, Math.ceil(totalSlots / ITEMS_PER_PAGE));

  React.useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const handleAddPinned = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newItem: SiteItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url,
    };

    setPinnedSites((prev) => [...prev, newItem]);
    setNewTitle('');
    setNewUrl('');
    setShowAddModal(false);
  };

  const handleRemovePinned = (id?: string, url?: string) => {
    setPinnedSites((prev) => prev.filter((item) => (id ? item.id !== id : item.url !== url)));
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const pageSites = pinnedSites.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const showAddTileOnThisPage = pageSites.length < ITEMS_PER_PAGE;

  return (
    <DashboardCard
      title={t('favoriteSitesTitle')}
      icon={<Star className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerAction={
        <div className="flex items-center gap-1.5 shrink-0">
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          {dragHandle}
        </div>
      }
      minHeight="h-[234px]"
    >
      <div className="p-0 flex-1 flex flex-col h-full min-h-0">
        {/* 4 Columns Full Grid Layout (2 Rows x 4 Cols) */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 w-full h-full flex-1">
          {pageSites.map((site) => (
            <SiteTile
              key={site.id || site.url}
              site={site}
              onRemove={() => handleRemovePinned(site.id, site.url)}
              removeTooltip={t('removeFavoriteTooltip')}
            />
          ))}

          {showAddTileOnThisPage && (
            <AddSiteTile
              onClick={() => setShowAddModal(true)}
              label={t('addFavoriteBtn', { count: '' }).split(' ')[0]}
              tooltip={t('addFavoriteTooltip')}
            />
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{t('addFavoriteModalTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              className="text-xs"
            />
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={t('urlPlaceholder')}
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              {t('cancel')}
            </Button>
            <Button size="sm" onClick={handleAddPinned}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardCard>
  );
}

