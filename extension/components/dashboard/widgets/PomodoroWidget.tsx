import * as React from 'react';
import { Timer, Play, Pause, Plus, Minus, RotateLeft } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { useLocalStorageState } from '@/lib/hooks';
import { useTranslation } from '@/lib/i18n';

function playChimeSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {}
}

interface PomodoroState {
  mode: 'focus' | 'break';
  endTimestamp: number | null;
  remainingSeconds: number;
  isRunning: boolean;
}

export function PomodoroWidget({ dragHandle }: { dragHandle: React.ReactNode }) {
  const { t } = useTranslation();
  const [focusMins, setFocusMins] = useLocalStorageState<number>('syntive.pomodoroFocusMins', 25);
  const [breakMins, setBreakMins] = useLocalStorageState<number>('syntive.pomodoroBreakMins', 5);

  const [timerState, setTimerState] = React.useState<PomodoroState>(() => {
    const saved = localStorage.getItem('syntive.pomodoroState');
    if (saved) {
      try {
        const parsed: PomodoroState = JSON.parse(saved);
        if (parsed.isRunning && parsed.endTimestamp) {
          const now = Date.now();
          const rem = Math.max(0, Math.ceil((parsed.endTimestamp - now) / 1000));
          return {
            ...parsed,
            remainingSeconds: rem,
            isRunning: rem > 0,
            endTimestamp: rem > 0 ? parsed.endTimestamp : null,
          };
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return { mode: 'focus', endTimestamp: null, remainingSeconds: 25 * 60, isRunning: false };
  });

  const { mode, endTimestamp, remainingSeconds, isRunning } = timerState;

  React.useEffect(() => {
    localStorage.setItem('syntive.pomodoroState', JSON.stringify(timerState));
  }, [timerState]);

  React.useEffect(() => {
    let interval: any = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (!endTimestamp) return;
        const now = Date.now();
        const rem = Math.max(0, Math.ceil((endTimestamp - now) / 1000));

        if (rem <= 0) {
          clearInterval(interval);
          playChimeSound();

          if (mode === 'focus') {
            const nextRemaining = breakMins * 60;
            setTimerState({
              mode: 'break',
              endTimestamp: null,
              remainingSeconds: nextRemaining,
              isRunning: false,
            });
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(t('focusCompletedTitle'), { body: t('focusCompletedBody') });
            }
          } else {
            const nextRemaining = focusMins * 60;
            setTimerState({
              mode: 'focus',
              endTimestamp: null,
              remainingSeconds: nextRemaining,
              isRunning: false,
            });
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(t('breakCompletedTitle'), { body: t('breakCompletedBody') });
            }
          }
        } else {
          setTimerState((prev) => ({ ...prev, remainingSeconds: rem }));
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, endTimestamp, mode, focusMins, breakMins, t]);

  const toggleTimer = () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    if (isRunning) {
      setTimerState((prev) => ({
        ...prev,
        isRunning: false,
        endTimestamp: null,
      }));
    } else {
      const targetEnd = Date.now() + remainingSeconds * 1000;
      setTimerState((prev) => ({
        ...prev,
        isRunning: true,
        endTimestamp: targetEnd,
      }));
    }
  };

  const resetTimer = (newMode = mode) => {
    const duration = (newMode === 'focus' ? focusMins : breakMins) * 60;
    setTimerState({
      mode: newMode,
      endTimestamp: null,
      remainingSeconds: duration,
      isRunning: false,
    });
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    resetTimer(newMode);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <DashboardCard
      title={t('widgetPomodoroTitle')}
      icon={<Timer className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerBadge={mode === 'focus' ? t('focusMode') : t('breakMode')}
      headerAction={dragHandle}
      minHeight="h-[234px]"
    >
      <div className="flex-1 flex flex-col justify-between items-center text-center py-2 h-full w-full">
        {/* Top Control Bar: Mode Selector & Duration Stepper (Matching HijriCalendarWidget tab pill style) */}
        <div className="flex items-center justify-between w-full px-0.5">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-background border border-border rounded-xl">
            <button
              type="button"
              onClick={() => switchMode('focus')}
              className={`px-3 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                mode === 'focus'
                  ? 'bg-accent text-foreground border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('focusMode')}
            </button>
            <button
              type="button"
              onClick={() => switchMode('break')}
              className={`px-3 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                mode === 'break'
                  ? 'bg-accent text-foreground border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('breakMode')}
            </button>
          </div>

          {/* Custom Duration Stepper (Matching Mode Pill height & styling, no 'm' suffix, font-medium) */}
          <div className="flex items-center gap-0.5 p-0.5 bg-background border border-border rounded-xl">
            <button
              type="button"
              onClick={() => {
                if (isRunning) return;
                const current = mode === 'focus' ? focusMins : breakMins;
                const next = Math.max(1, current - 1);
                if (mode === 'focus') {
                  setFocusMins(next);
                  setTimerState((prev) => ({ ...prev, remainingSeconds: next * 60 }));
                } else {
                  setBreakMins(next);
                  setTimerState((prev) => ({ ...prev, remainingSeconds: next * 60 }));
                }
              }}
              disabled={isRunning}
              className="h-5 w-5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors"
              title="Kurangi 1 menit"
            >
              <Minus className="h-3 w-3" />
            </button>

            <span className="text-[10px] font-medium font-mono text-foreground px-1.5 min-w-5 text-center select-none">
              {mode === 'focus' ? focusMins : breakMins}
            </span>

            <button
              type="button"
              onClick={() => {
                if (isRunning) return;
                const current = mode === 'focus' ? focusMins : breakMins;
                const next = Math.min(180, current + 1);
                if (mode === 'focus') {
                  setFocusMins(next);
                  setTimerState((prev) => ({ ...prev, remainingSeconds: next * 60 }));
                } else {
                  setBreakMins(next);
                  setTimerState((prev) => ({ ...prev, remainingSeconds: next * 60 }));
                }
              }}
              disabled={isRunning}
              className="h-5 w-5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors"
              title="Tambah 1 menit"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Center Display: Timer Digits */}
        <h3 className="text-4xl font-extrabold text-foreground tracking-tight my-auto font-sans">
          {formattedTime}
        </h3>

        {/* Bottom Control Bar: Start/Pause & Reset */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTimer}
            className={`h-8 text-xs px-4 gap-1.5 rounded-xl transition-all flex items-center justify-center font-semibold cursor-pointer ${
              isRunning
                ? 'bg-primary text-primary-foreground hover:opacity-90 ring-2 ring-primary/20'
                : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
            }`}
          >
            {isRunning ? <Pause weight="Filled" className="h-3.5 w-3.5" /> : <Play weight="Filled" className="h-3.5 w-3.5 text-primary" />}
            <span>{isRunning ? t('pauseTimer') : t('startTimer')}</span>
          </button>
          <button
            type="button"
            onClick={() => resetTimer()}
            className="h-8 w-8 rounded-xl bg-card hover:bg-accent border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center cursor-pointer"
            title={t('resetTimer')}
          >
            <RotateLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </DashboardCard>
  );
}
