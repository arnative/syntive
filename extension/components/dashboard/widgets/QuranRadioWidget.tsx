import * as React from 'react';
import { Radio2, Loader, Play, Pause, VolumeUp, VolumeX } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DotLinearSpectrum } from './DotLinearSpectrum';
import { useTranslation } from '@/lib/i18n';

// 7. Quran Radio Widget (Nama Lengkap dengan Gelar Syaikh + Wireframe Audio Pill & Dot Linear Spectrum)
const QURAN_QARIS = [
  { id: 'afasy', name: 'Syaikh Mishary Rashid Al-Afasy', stream: 'https://backup.qurango.net/radio/mishary_alafasi' },
  { id: 'sudais', name: 'Syaikh Abdul Rahman Al-Sudais', stream: 'https://backup.qurango.net/radio/abdulrahman_alsudaes' },
  { id: 'ghamdi', name: 'Syaikh Saad Al-Ghamdi', stream: 'https://backup.qurango.net/radio/saad_alghamdi' },
  { id: 'maher', name: 'Syaikh Maher Al-Muaiqly', stream: 'https://backup.qurango.net/radio/maher' },
  { id: 'dosari', name: 'Syaikh Yasser Al-Dosari', stream: 'https://backup.qurango.net/radio/yasser_aldosari' },
  { id: 'bin_taleb', name: 'Syaikh Ahmad bin Taleb', stream: 'https://backup.qurango.net/radio/a_binhameed' },
  { id: 'baleela', name: 'Syaikh Bandar Baleela', stream: 'https://backup.qurango.net/radio/bandar_balilah' },
  { id: 'cairo', name: 'Radio Al-Quran Utama 24/7', stream: 'https://backup.qurango.net/radio/mix' },
];

const QURAN_RADIO_STORAGE_KEY = 'syntive.quranRadioQari';

// Persistent Module-Level Audio Singleton for Quran Radio
let globalQuranAudio: HTMLAudioElement | null = null;
let globalQuranIsPlaying = false;
let globalQuranIsLoading = false;
let globalQuranVolume = 0.2;
let globalQuranIsMuted = false;
let globalQuranSelectedId = (() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(QURAN_RADIO_STORAGE_KEY);
    if (saved && QURAN_QARIS.some((q) => q.id === saved)) {
      return saved;
    }
  }
  return 'afasy';
})();

// Exactly one widget instance exists at a time — a single listener slot suffices.
let onQuranChange: (() => void) | null = null;
function notifyQuranSubscribers() {
  onQuranChange?.();
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (globalQuranAudio) {
      globalQuranAudio.pause();
      globalQuranAudio.removeAttribute('src');
      globalQuranAudio.load();
      globalQuranAudio = null;
    }
  });
}

function stopGlobalQuranAudio() {
  if (globalQuranAudio) {
    globalQuranAudio.pause();
    globalQuranAudio.removeAttribute('src');
    globalQuranAudio.load();
    globalQuranAudio = null;
  }
  globalQuranIsPlaying = false;
  globalQuranIsLoading = false;
  notifyQuranSubscribers();
}

function playGlobalQuranStream(streamUrl: string) {
  stopGlobalQuranAudio();
  globalQuranIsLoading = true;
  notifyQuranSubscribers();

  const audio = new Audio(streamUrl);
  globalQuranAudio = audio;
  audio.volume = globalQuranIsMuted ? 0 : globalQuranVolume;

  audio.onerror = (e) => {
    console.warn('Audio stream error:', e);
    globalQuranIsPlaying = false;
    globalQuranIsLoading = false;
    notifyQuranSubscribers();
  };

  audio
    .play()
    .then(() => {
      globalQuranIsPlaying = true;
      globalQuranIsLoading = false;
      notifyQuranSubscribers();
    })
    .catch((err) => {
      console.warn('Playback error:', err);
      globalQuranIsPlaying = false;
      globalQuranIsLoading = false;
      notifyQuranSubscribers();
    });
}

export function QuranRadioWidget({ dragHandle }: { dragHandle: React.ReactNode }) {
  const { t } = useTranslation();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const handler = () => forceUpdate();
    onQuranChange = handler;
    return () => {
      if (onQuranChange === handler) onQuranChange = null;
    };
  }, []);

  React.useEffect(() => {
    if (typeof browser !== 'undefined' && browser.storage?.local) {
      browser.storage.local.get(QURAN_RADIO_STORAGE_KEY).then((data) => {
        const val = data[QURAN_RADIO_STORAGE_KEY];
        if (val && QURAN_QARIS.some((q) => q.id === val) && val !== globalQuranSelectedId) {
          globalQuranSelectedId = val as string;
          notifyQuranSubscribers();
        }
      }).catch(() => {});
    }
  }, []);

  const activeQari = QURAN_QARIS.find((q) => q.id === globalQuranSelectedId) || QURAN_QARIS[0];
  const qariOptions = React.useMemo(() => QURAN_QARIS.map((q) => ({ value: q.id, label: q.name })), []);

  const togglePlay = () => {
    if (globalQuranIsPlaying) {
      stopGlobalQuranAudio();
    } else {
      playGlobalQuranStream(activeQari.stream);
    }
  };

  const changeQari = (id: string) => {
    globalQuranSelectedId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem(QURAN_RADIO_STORAGE_KEY, id);
    }
    if (typeof browser !== 'undefined' && browser.storage?.local) {
      browser.storage.local.set({ [QURAN_RADIO_STORAGE_KEY]: id }).catch(() => {});
    }
    const newQari = QURAN_QARIS.find((q) => q.id === id);
    if (!newQari) return;

    if (globalQuranIsPlaying) {
      playGlobalQuranStream(newQari.stream);
    } else {
      stopGlobalQuranAudio();
    }
  };

  const handleVolumeChange = (val: number) => {
    globalQuranVolume = val;
    if (globalQuranIsMuted) globalQuranIsMuted = false;
    if (globalQuranAudio) {
      globalQuranAudio.volume = val;
    }
    notifyQuranSubscribers();
  };

  const toggleMute = () => {
    globalQuranIsMuted = !globalQuranIsMuted;
    if (globalQuranAudio) {
      globalQuranAudio.volume = globalQuranIsMuted ? 0 : globalQuranVolume;
    }
    notifyQuranSubscribers();
  };

  return (
    <DashboardCard
      title={t('widgetQuranRadioTitle')}
      icon={<Radio2 className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerBadge={globalQuranIsPlaying ? <StatusBadge status="primary" showDot pulseDot compact>24/7 LIVE</StatusBadge> : undefined}
      headerAction={dragHandle}
      minHeight="h-[234px]"
    >
      <div className="flex-1 flex flex-col justify-between pt-0 h-full space-y-2.5">
        {/* Top Dropdown: Full Qari Name with Syaikh Prefix */}
        <Select
          options={qariOptions}
          value={globalQuranSelectedId}
          onValueChange={changeQari}
          className="h-9 text-xs font-semibold"
        />

        {/* Middle Audio Pill Box with Play Button & Dot Linear Spectrum (Wireframe Layout) */}
        <div className="card-inner-box p-2.5 flex items-center justify-between gap-3 rounded-2xl border border-border">
          <button
            type="button"
            onClick={togglePlay}
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              globalQuranIsPlaying
                ? 'bg-primary text-primary-foreground hover:opacity-90 ring-2 ring-primary/20'
                : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
            }`}
          >
            {globalQuranIsLoading ? (
              <Loader className="h-4 w-4 animate-spin text-primary" />
            ) : globalQuranIsPlaying ? (
              <Pause weight="Filled" className="h-4 w-4 fill-current" />
            ) : (
              <Play weight="Filled" className="h-4 w-4 fill-current ml-0.5 text-primary" />
            )}
          </button>

          <DotLinearSpectrum isPlaying={globalQuranIsPlaying} />
        </div>

        {/* Bottom Volume Control Slider */}
        <div className="flex items-center gap-2.5 px-1">
          <button
            type="button"
            onClick={toggleMute}
            className="tint-text hover:text-foreground transition-colors cursor-pointer"
          >
            {globalQuranIsMuted || globalQuranVolume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <VolumeUp className="h-3.5 w-3.5" />}
          </button>
          <Slider
            value={globalQuranIsMuted ? 0 : globalQuranVolume}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
      </div>
    </DashboardCard>
  );
}
