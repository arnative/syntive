import * as React from 'react';
import { Search4, AngleDown, Settings2 } from 'reicon-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface SearchProvider {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

const DEFAULT_PROVIDERS: SearchProvider[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'brave', name: 'Brave Search', url: 'https://search.brave.com/search?q=' },
  { id: 'startpage', name: 'Startpage', url: 'https://www.startpage.com/sp/search?query=' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=' },
];

export function SearchEngineBar() {
  const { t } = useTranslation();
  const [providerId, setProviderId] = React.useState<string>(() => {
    return localStorage.getItem('syntive.searchProviderId') || 'google';
  });

  const [customUrl, setCustomUrl] = React.useState<string>(() => {
    return localStorage.getItem('syntive.customSearchUrl') || 'https://duckduckgo.com/?q=';
  });

  const [query, setQuery] = React.useState('');
  const [showCustomModal, setShowCustomModal] = React.useState(false);
  const [tempCustomUrl, setTempCustomUrl] = React.useState(customUrl);

  React.useEffect(() => {
    localStorage.setItem('syntive.searchProviderId', providerId);
  }, [providerId]);

  React.useEffect(() => {
    localStorage.setItem('syntive.customSearchUrl', customUrl);
  }, [customUrl]);

  const activeProvider = React.useMemo(() => {
    if (providerId === 'custom') {
      return { id: 'custom', name: t('customProvider').replace('...', ''), url: customUrl };
    }
    return DEFAULT_PROVIDERS.find((p) => p.id === providerId) || DEFAULT_PROVIDERS[0];
  }, [providerId, customUrl, t]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    let searchUrl = activeProvider.url;
    if (!searchUrl.includes('%s') && !searchUrl.endsWith('=')) {
      if (searchUrl.includes('?')) {
        searchUrl += '&q=';
      } else {
        searchUrl += '?q=';
      }
    }

    const finalTarget = searchUrl.includes('%s')
      ? searchUrl.replace('%s', encodeURIComponent(query.trim()))
      : `${searchUrl}${encodeURIComponent(query.trim())}`;

    window.location.href = finalTarget;
  };

  const handleSaveCustom = () => {
    if (tempCustomUrl.trim()) {
      setCustomUrl(tempCustomUrl.trim());
      setProviderId('custom');
    }
    setShowCustomModal(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <form onSubmit={handleSearch} className="w-full relative group">
        <div className="flex items-center w-full bg-card border border-border hover:border-ring/40 focus-within:border-ring rounded-full transition-all p-1.5 pl-3">
          {/* Provider Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/60 hover:bg-accent text-xs font-medium text-foreground transition-colors shrink-0 select-none cursor-pointer border border-border"
              >
                <span>{activeProvider.name}</span>
                <AngleDown className="h-3 w-3 tint-text opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-card border-border">
              {DEFAULT_PROVIDERS.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => setProviderId(p.id)}
                  className={`text-xs cursor-pointer flex items-center justify-between ${
                    providerId === p.id ? 'font-semibold text-(--color-primary) bg-(--color-accent)/50' : ''
                  }`}
                >
                  <span>{p.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => {
                  setTempCustomUrl(customUrl);
                  setShowCustomModal(true);
                }}
                className={`text-xs cursor-pointer flex items-center justify-between ${
                  providerId === 'custom' ? 'font-semibold text-(--color-primary) bg-(--color-accent)/50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="h-3.5 w-3.5" />
                  <span>{t('customProvider')}</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchWith', { provider: activeProvider.name })}
            className="flex-1 bg-transparent border-none outline-none px-4 py-1 text-sm text-foreground placeholder:text-tint-foreground"
          />

          {/* Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center h-9 w-9 rounded-full bg-accent hover:bg-accent/80 text-foreground border border-border transition-all shrink-0 cursor-pointer active:scale-95"
            title={t('searchButton')}
          >
            <Search4 className="h-4 w-4 text-primary" />
          </button>
        </div>
      </form>

      {/* Modal for Custom Provider */}
      <Dialog open={showCustomModal} onOpenChange={setShowCustomModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{t('customEngineTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <p className="tint-text leading-relaxed">
              {t('customEngineDesc')}
            </p>
            <Input
              value={tempCustomUrl}
              onChange={(e) => setTempCustomUrl(e.target.value)}
              placeholder="https://example.com/search?q="
              className="text-xs"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setShowCustomModal(false)}>
              {t('cancel')}
            </Button>
            <Button size="sm" onClick={handleSaveCustom}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
