import * as React from 'react';
import { loadSession } from '@/lib/storage';
import { Onboarding } from '@/components/onboarding/OnboardingView';
import { Dashboard } from '@/components/layout/Dashboard';
import logoIcon from '@/assets/logo-icon.svg';

import { initThemeListeners } from '@/lib/theme';

export default function App() {
  const [ready, setReady] = React.useState(false);
  const [onboarded, setOnboarded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const cleanupTheme = initThemeListeners();

    const check = () =>
      loadSession()
        .then((s) => { setOnboarded(!!s); setReady(true); })
        .catch((e) => { setError(String(e)); setReady(true); });

    check();

    const onChange = (changes: Record<string, any>) => {
      if (changes['syntive.mnemonic'] || changes['syntive.authId']) {
        check();
      }
    };
    browser.storage.onChanged.addListener(onChange);
    return () => {
      cleanupTheme();
      browser.storage.onChanged.removeListener(onChange);
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-8 text-center text-sm text-destructive">
        <div>
          <p>Gagal memuat sesi</p>
          <p className="mt-1 text-xs tint-text">{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <img src={logoIcon} alt="Syntive" className="h-12 w-12 animate-pulse" />
      </div>
    );
  }
  return onboarded ? (
    <Dashboard onLogout={() => setOnboarded(false)} />
  ) : (
    <Onboarding onDone={() => setOnboarded(true)} />
  );
}
