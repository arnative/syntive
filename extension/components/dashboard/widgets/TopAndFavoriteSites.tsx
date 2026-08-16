import * as React from 'react';
import { History, Star, Eye, EyeOff } from 'reicon-react';
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
import { IconButton } from '@/components/ui/icon-button';
import { HoverAction } from '@/components/ui/hover-action';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';

interface SiteItem {
  id?: string;
  url: string;
  title: string;
}

const DEFAULT_SITES: SiteItem[] = [
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
  const [hiddenTopSites, setHiddenTopSites] = useLocalStorageState<string[]>('syntive.hiddenTopSites', []);
  const [loadingTop, setLoadingTop] = React.useState(true);
  const visibleTopSites = topSites.filter((site) => !hiddenTopSites.includes(site.url)).slice(0, 5);

  React.useEffect(() => {
    const fetchTopSites = async () => {
      try {
        const sites = await browser.topSites.get();
        if (sites && sites.length > 0) {
          setTopSites(sites);
          setLoadingTop(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to get top sites:', err);
      }
      setTopSites(DEFAULT_SITES);
      setLoadingTop(false);
    };

    fetchTopSites();
  }, []);

  return (
    <DashboardCard
      title={t('topSitesTitle')}
      icon={<History className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerBadge={t('topSitesBadge')}
      headerAction={
        <div className="flex items-center gap-1">
          {hiddenTopSites.length > 0 && (
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => setHiddenTopSites([])}
              title={t('show')}
              aria-label={t('show')}
              className="h-6 w-6"
            >
              <Eye className="h-3.5 w-3.5" />
            </IconButton>
          )}
          {dragHandle}
        </div>
      }
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
            {visibleTopSites.length > 0 ? visibleTopSites.map((site) => {
              const displayTitle = getCleanTitle(site.title, site.url);
              const domain = domainOf(site.url);

              return (
                <div key={site.url} className="relative group/item text-xs select-none">
                  <a
                    href={site.url}
                    className="flex w-full min-w-0 items-center justify-between px-3 py-2 transition-colors hover:bg-accent/40 group-hover/item:pr-10"
                    title={site.title || site.url}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FaviconImage url={site.url} className="h-4 w-4 object-contain shrink-0" />
                      <span className="font-medium text-foreground truncate text-xs">
                        {displayTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors shrink-0 ml-2">
                      {domain}
                    </span>
                  </a>
                  <HoverAction
                    icon={<EyeOff className="h-3.5 w-3.5" />}
                    onClick={() => setHiddenTopSites((prev) => [...new Set([...prev, site.url])])}
                    title={t('hide')}
                    aria-label={t('hide')}
                    className="right-1"
                  />
                </div>
              );
            }) : (
              <div className="px-3 py-4 text-center text-[10px] tint-text">
                {t('noTopSites')}
              </div>
            )}
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
    DEFAULT_SITES,
  );

  const [page, setPage] = React.useState(1);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');

  const ITEMS_PER_PAGE = 8;
  // Total pages: includes room for the "+ Tambah" tile at the end
  const pageCount = Math.max(1, Math.ceil((pinnedSites.length + 1) / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);

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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageSites = pinnedSites.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const showAddTileOnThisPage = pageSites.length < ITEMS_PER_PAGE;

  return (
    <DashboardCard
      title={t('favoriteSitesTitle')}
      icon={<Star className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerAction={
        <div className="flex items-center gap-1.5 shrink-0">
          <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
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

