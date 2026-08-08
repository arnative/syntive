import * as React from 'react';
import { Globe, Settings2, Search4 } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLocalStorageState } from '@/lib/hooks';
import { useTranslation } from '@/lib/i18n';

interface WorldCity {
  city: string;
  country: string;
  timezone: string;
  flag: string;
}

const AVAILABLE_WORLD_CITIES: WorldCity[] = [
  // Asia & Pasifik
  { city: 'Jakarta', country: 'Indonesia (WIB)', timezone: 'Asia/Jakarta', flag: 'id' },
  { city: 'Makassar', country: 'Indonesia (WITA)', timezone: 'Asia/Makassar', flag: 'id' },
  { city: 'Jayapura', country: 'Indonesia (WIT)', timezone: 'Asia/Jayapura', flag: 'id' },
  { city: 'Singapura', country: 'Singapura', timezone: 'Asia/Singapore', flag: 'sg' },
  { city: 'Kuala Lumpur', country: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', flag: 'my' },
  { city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', flag: 'th' },
  { city: 'Manila', country: 'Filipina', timezone: 'Asia/Manila', flag: 'ph' },
  { city: 'Hanoi', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', flag: 'vn' },
  { city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', flag: 'cn' },
  { city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: 'hk' },
  { city: 'Taipei', country: 'Taiwan', timezone: 'Asia/Taipei', flag: 'tw' },
  { city: 'Tokyo', country: 'Jepang', timezone: 'Asia/Tokyo', flag: 'jp' },
  { city: 'Seoul', country: 'Korea Selatan', timezone: 'Asia/Seoul', flag: 'kr' },
  { city: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata', flag: 'in' },
  { city: 'Dubai', country: 'UEA', timezone: 'Asia/Dubai', flag: 'ae' },
  { city: 'Riyadh', country: 'Arab Saudi', timezone: 'Asia/Riyadh', flag: 'sa' },
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: 'au' },
  { city: 'Auckland', country: 'Selandia Baru', timezone: 'Pacific/Auckland', flag: 'nz' },

  // Eropa
  { city: 'London', country: 'Inggris / UK', timezone: 'Europe/London', flag: 'gb' },
  { city: 'Paris', country: 'Prancis', timezone: 'Europe/Paris', flag: 'fr' },
  { city: 'Berlin', country: 'Jerman', timezone: 'Europe/Berlin', flag: 'de' },
  { city: 'Amsterdam', country: 'Belanda', timezone: 'Europe/Amsterdam', flag: 'nl' },
  { city: 'Zurich', country: 'Swiss', timezone: 'Europe/Zurich', flag: 'ch' },
  { city: 'Vienna', country: 'Austria', timezone: 'Europe/Vienna', flag: 'at' },
  { city: 'Stockholm', country: 'Swedia', timezone: 'Europe/Stockholm', flag: 'se' },
  { city: 'Rome', country: 'Italia', timezone: 'Europe/Rome', flag: 'it' },
  { city: 'Madrid', country: 'Spanyol', timezone: 'Europe/Madrid', flag: 'es' },
  { city: 'Istanbul', country: 'Turki', timezone: 'Europe/Istanbul', flag: 'tr' },
  { city: 'Moscow', country: 'Rusia', timezone: 'Europe/Moscow', flag: 'ru' },

  // Amerika
  { city: 'New York', country: 'Amerika Serikat (EST)', timezone: 'America/New_York', flag: 'us' },
  { city: 'Chicago', country: 'Amerika Serikat (CST)', timezone: 'America/Chicago', flag: 'us' },
  { city: 'Denver', country: 'Amerika Serikat (MST)', timezone: 'America/Denver', flag: 'us' },
  { city: 'Los Angeles', country: 'Amerika Serikat (PST)', timezone: 'America/Los_Angeles', flag: 'us' },
  { city: 'Toronto', country: 'Kanada', timezone: 'America/Toronto', flag: 'ca' },
  { city: 'Vancouver', country: 'Kanada', timezone: 'America/Vancouver', flag: 'ca' },
  { city: 'Mexico City', country: 'Meksiko', timezone: 'America/Mexico_City', flag: 'mx' },
  { city: 'Sao Paulo', country: 'Brasil', timezone: 'America/Sao_Paulo', flag: 'br' },
  { city: 'Buenos Aires', country: 'Argentina', timezone: 'America/Buenos_Aires', flag: 'ar' },

  // Afrika
  { city: 'Cairo', country: 'Mesir', timezone: 'Africa/Cairo', flag: 'eg' },
  { city: 'Johannesburg', country: 'Afrika Selatan', timezone: 'Africa/Johannesburg', flag: 'za' },
];

function FlagImage({ code }: { code: string }) {
  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={code}
      loading="lazy"
      className="h-3.5 w-5 shrink-0 object-cover rounded-[1.5px]"
    />
  );
}

export function WorldClockWidget({ dragHandle }: { dragHandle: React.ReactNode }) {
  const { t, language } = useTranslation();
  const isId = language === 'id';
  const [selectedZones, setSelectedZones] = useLocalStorageState<string[]>(
    'syntive.worldClockZones',
    ['Asia/Jakarta', 'America/New_York', 'Europe/London'],
  );

  const [now, setNow] = React.useState(new Date());
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleZone = (tz: string) => {
    setSelectedZones((prev) => {
      if (prev.includes(tz)) {
        if (prev.length <= 1) return prev;
        return prev.filter((z) => z !== tz);
      }
      if (prev.length >= 3) return prev;
      return [...prev, tz];
    });
  };

  const getCityTime = (tz: string) => {
    try {
      return now.toLocaleTimeString([], {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  };

  const getCityDate = (tz: string) => {
    try {
      return now.toLocaleDateString(isId ? 'id-ID' : 'en-US', {
        timeZone: tz,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return '';
    }
  };

  const filteredCities = React.useMemo(() => {
    let cities = AVAILABLE_WORLD_CITIES;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      cities = cities.filter(
        (c) =>
          c.city.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.timezone.toLowerCase().includes(q)
      );
    }

    // Sort: Checked/Selected cities move to the very top, unchecked return to original order
    return [...cities].sort((a, b) => {
      const aSelected = selectedZones.includes(a.timezone);
      const bSelected = selectedZones.includes(b.timezone);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [searchQuery, selectedZones]);

  return (
    <DashboardCard
      title={t('widgetWorldClockTitle')}
      icon={<Globe className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerAction={
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1 rounded-md tint-text hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            title={t('editLocations')}
          >
            <Settings2 className="h-3 w-3" />
          </button>
          {dragHandle}
        </div>
      }
      minHeight="h-[234px]"
    >
      <div className="flex-1 flex flex-col justify-between pt-0 h-full">
        {/* Symmetrical 4-side inner card box container */}
        <div className="card-inner-box divide-y divide-border overflow-hidden flex-1 flex flex-col justify-evenly">
          {selectedZones.map((tz) => {
            const cityObj = AVAILABLE_WORLD_CITIES.find((c) => c.timezone === tz) || {
              city: tz.split('/')[1] || tz,
              country: '',
              timezone: tz,
              flag: '',
            };
            const flagCode = cityObj.flag;
            const timeStr = getCityTime(tz);
            const dateStr = getCityDate(tz);

            return (
              <div
                key={tz}
                className="flex items-center justify-between px-3.5 py-2 text-xs select-none hover:bg-accent/30 transition-colors flex-1"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {flagCode ? (
                    <FlagImage code={flagCode} />
                  ) : (
                    <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {cityObj.city}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate font-normal">
                      {dateStr}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground tracking-tight shrink-0 ml-2 font-normal">
                  {timeStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Locations Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground p-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{t('editLocations')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 text-xs">
            <p className="text-muted-foreground text-[11px]">
              {t('selectCity')} (Max 3):
            </p>

            <div className="relative">
              <Search4 className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kota atau negara (misal: Beijing, China, London…)"
                className="pl-8 h-8 text-xs bg-background border-border focus:border-ring rounded-xl"
              />
            </div>

            <div className="card-inner-box divide-y divide-border overflow-hidden max-h-60 overflow-y-auto">
              {filteredCities.length === 0 ? (
                <p className="text-[11px] text-muted-foreground text-center py-6">
                  Kota / negara tidak ditemukan.
                </p>
              ) : (
                filteredCities.map((c) => {
                  const isSelected = selectedZones.includes(c.timezone);
                  return (
                    <label
                      key={`${c.city}-${c.timezone}`}
                      className={`flex items-center justify-between px-3.5 py-2 hover:bg-accent/40 transition-colors cursor-pointer text-xs select-none ${
                        isSelected ? 'bg-accent/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {c.flag ? (
                          <FlagImage code={c.flag} />
                        ) : (
                          <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {c.city}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {c.country}
                          </span>
                        </div>
                      </div>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleZone(c.timezone)}
                      />
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardCard>
  );
}
