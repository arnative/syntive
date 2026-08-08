import * as React from 'react';
import { Soundwave, AngleDown, Play, Pause, VolumeUp, VolumeX } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { StatusBadge } from '@/components/ui/status-badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { DotLinearSpectrum } from './DotLinearSpectrum';
import { useTranslation } from '@/lib/i18n';

// 8. Nature Radio Widget (Noisekun Official Audio CDN Streams + Multi-Select Dropdown with Checkbox)
const NOISEKUN_SOUNDS = [
  { id: 'rain', shortName: 'Rain', fullName: '🌧️ Hujan (Rain)', stream: 'https://cdn.noisekun.com/sounds/rain.ogg' },
  { id: 'storm', shortName: 'Storm', fullName: '⚡ Badai Petir (Storm)', stream: 'https://cdn.noisekun.com/sounds/storm.ogg' },
  { id: 'drops', shortName: 'Drops', fullName: '💧 Tetesan Air (Drops)', stream: 'https://cdn.noisekun.com/sounds/drops.ogg' },
  { id: 'wind', shortName: 'Wind', fullName: '💨 Angin (Wind)', stream: 'https://cdn.noisekun.com/sounds/wind.ogg' },
  { id: 'waves', shortName: 'Soundwave', fullName: '🌊 Ombak (Soundwave)', stream: 'https://cdn.noisekun.com/sounds/waves.ogg' },
  { id: 'underwater', shortName: 'Underwater', fullName: '🥽 Bawah Air (Underwater)', stream: 'https://cdn.noisekun.com/sounds/underwater.ogg' },
  { id: 'stream', shortName: 'Stream', fullName: '🏞️ Aliran Sungai (Stream)', stream: 'https://cdn.noisekun.com/sounds/stream-water.ogg' },
  { id: 'waterfall', shortName: 'Waterfall', fullName: '⛲ Air Terjun (Waterfall)', stream: 'https://cdn.noisekun.com/sounds/waterfall.ogg' },
  { id: 'bird', shortName: 'Birds', fullName: '🌲 Kicau Burung (Birds)', stream: 'https://cdn.noisekun.com/sounds/birds-tree.ogg' },
  { id: 'leaves', shortName: 'Leaves', fullName: '🍃 Gugur Daun (Leaves)', stream: 'https://cdn.noisekun.com/sounds/leaves.ogg' },
  { id: 'fire', shortName: 'Fire', fullName: '🔥 Api Unggun (Bonfire)', stream: 'https://cdn.noisekun.com/sounds/fire.ogg' },
  { id: 'cave', shortName: 'Cave', fullName: '🦇 Gua (Cave Drops)', stream: 'https://cdn.noisekun.com/sounds/cave-drops.ogg' },
  { id: 'night', shortName: 'Night', fullName: '🦗 Jangkrik Malam (Night)', stream: 'https://cdn.noisekun.com/sounds/night.ogg' },
  { id: 'cafe', shortName: 'Cafe', fullName: '☕ Atmosphere Kafe (Coffee)', stream: 'https://cdn.noisekun.com/sounds/coffee.ogg' },
  { id: 'train', shortName: 'Train', fullName: '🚂 Kereta Api (Train)', stream: 'https://cdn.noisekun.com/sounds/train.ogg' },
  { id: 'airplane', shortName: 'Airplane', fullName: '✈️ Pesawat (Airplane)', stream: 'https://cdn.noisekun.com/sounds/air-plane.ogg' },
];

// Persistent Module-Level Audio Singleton for Nature Radio
const globalNatureAudioMap = new Map<string, HTMLAudioElement>();
let globalNatureIsPlaying = false;
let globalNatureVolume = 0.2;
let globalNatureIsMuted = false;
let globalNatureActiveSoundIds: string[] = ['storm', 'bird'];

// Exactly one widget instance exists at a time — a single listener slot suffices.
let onNatureChange: (() => void) | null = null;
function notifyNatureSubscribers() {
  onNatureChange?.();
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalNatureAudioMap.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    globalNatureAudioMap.clear();
  });
}

export function NatureRadioWidget({ dragHandle }: { dragHandle: React.ReactNode }) {
  const { t } = useTranslation();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const handler = () => forceUpdate();
    onNatureChange = handler;
    return () => {
      if (onNatureChange === handler) onNatureChange = null;
    };
  }, []);

  const toggleSoundChip = (id: string) => {
    let nextIds: string[];
    if (globalNatureActiveSoundIds.includes(id)) {
      if (globalNatureActiveSoundIds.length <= 1) return;
      nextIds = globalNatureActiveSoundIds.filter((s) => s !== id);
      const existing = globalNatureAudioMap.get(id);
      if (existing) {
        existing.pause();
        existing.src = '';
        globalNatureAudioMap.delete(id);
      }
    } else {
      nextIds = [...globalNatureActiveSoundIds, id];
      if (globalNatureIsPlaying) {
        const item = NOISEKUN_SOUNDS.find((s) => s.id === id);
        if (item) {
          const audio = new Audio(item.stream);
          audio.loop = true;
          audio.volume = globalNatureIsMuted ? 0 : globalNatureVolume;
          audio.play().catch(() => {});
          globalNatureAudioMap.set(id, audio);
        }
      }
    }
    globalNatureActiveSoundIds = nextIds;
    notifyNatureSubscribers();
  };

  const togglePlayMaster = () => {
    if (globalNatureIsPlaying) {
      globalNatureAudioMap.forEach((audio) => audio.pause());
      globalNatureIsPlaying = false;
    } else {
      globalNatureActiveSoundIds.forEach((id) => {
        const item = NOISEKUN_SOUNDS.find((s) => s.id === id);
        if (!item) return;
        let audio = globalNatureAudioMap.get(id);
        if (!audio) {
          audio = new Audio(item.stream);
          audio.loop = true;
          globalNatureAudioMap.set(id, audio);
        }
        audio.volume = globalNatureIsMuted ? 0 : globalNatureVolume;
        audio.play().catch(() => {});
      });
      globalNatureIsPlaying = true;
    }
    notifyNatureSubscribers();
  };

  const handleVolumeChange = (val: number) => {
    globalNatureVolume = val;
    if (globalNatureIsMuted) globalNatureIsMuted = false;
    const currentVol = globalNatureIsMuted ? 0 : val;
    globalNatureAudioMap.forEach((audio) => {
      audio.volume = currentVol;
    });
    notifyNatureSubscribers();
  };

  const toggleMute = () => {
    globalNatureIsMuted = !globalNatureIsMuted;
    const currentVol = globalNatureIsMuted ? 0 : globalNatureVolume;
    globalNatureAudioMap.forEach((audio) => {
      audio.volume = currentVol;
    });
    notifyNatureSubscribers();
  };

  const dropdownLabelText = React.useMemo(() => {
    if (globalNatureActiveSoundIds.length === 0) return 'Pilih Suara Alam…';
    const names = globalNatureActiveSoundIds
      .map((id) => NOISEKUN_SOUNDS.find((s) => s.id === id)?.shortName)
      .filter(Boolean);
    return names.join(' + ');
  }, []);

  return (
    <DashboardCard
      title={t('widgetNatureRadioTitle')}
      icon={<Soundwave className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerBadge={globalNatureIsPlaying ? <StatusBadge status="primary" showDot compact>{globalNatureActiveSoundIds.length} MIX</StatusBadge> : undefined}
      headerAction={dragHandle}
      minHeight="h-[234px]"
    >
      <div className="flex-1 flex flex-col justify-between pt-0 h-full space-y-2.5">
        {/* Top Dropdown: Real-time Audio Combination Label + Multi-Select Checkbox Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none transition-all hover:bg-accent/30 focus:ring-1 focus:ring-primary cursor-pointer select-none"
            >
              <span className="truncate font-medium text-xs text-foreground">
                {dropdownLabelText}
              </span>
              <AngleDown className="h-4 w-4 shrink-0 tint-text opacity-70 ml-2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) max-h-60 overflow-y-auto bg-card border-border rounded-xl p-1 z-100"
          >
            {NOISEKUN_SOUNDS.map((sound) => {
              const isSelected = globalNatureActiveSoundIds.includes(sound.id);
              return (
                <div
                  key={sound.id}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSoundChip(sound.id);
                  }}
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors select-none font-medium ${
                    isSelected
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <span className="truncate">{sound.fullName}</span>
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleSoundChip(sound.id)} />
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Middle Audio Pill Box with Play Button & Dot Linear Spectrum (Wireframe Layout) */}
        <div className="card-inner-box p-2.5 flex items-center justify-between gap-3 rounded-2xl border border-border">
          <button
            type="button"
            onClick={togglePlayMaster}
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              globalNatureIsPlaying
                ? 'bg-primary text-primary-foreground hover:opacity-90 ring-2 ring-primary/20'
                : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
            }`}
          >
            {globalNatureIsPlaying ? (
              <Pause weight="Filled" className="h-4 w-4 fill-current" />
            ) : (
              <Play weight="Filled" className="h-4 w-4 fill-current ml-0.5 text-primary" />
            )}
          </button>

          <DotLinearSpectrum isPlaying={globalNatureIsPlaying} />
        </div>

        {/* Bottom Volume Control Slider */}
        <div className="flex items-center gap-2.5 px-1">
          <button
            type="button"
            onClick={toggleMute}
            className="tint-text hover:text-foreground transition-colors cursor-pointer"
          >
            {globalNatureIsMuted || globalNatureVolume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <VolumeUp className="h-3.5 w-3.5" />}
          </button>
          <Slider
            value={globalNatureIsMuted ? 0 : globalNatureVolume}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
      </div>
    </DashboardCard>
  );
}
