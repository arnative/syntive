import * as React from 'react';
import { Download, Copy, Check, ShieldCheck, ArrowLeft, Refresh, Language } from 'reicon-react';
import { Button } from '@/components/ui/button';
import { generateMnemonic, normalizeMnemonic, validateMnemonic, mnemonicToTextFile } from '@/lib/mnemonic';
import { deriveKeys } from '@/lib/crypto';
import { saveSession } from '@/lib/storage';
import { LanguageProvider, useTranslation } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/logo.svg';

type Mode = 'choose' | 'create';

export function Onboarding({ onDone }: { onDone: () => void }) {
  return (
    <LanguageProvider>
      <OnboardingContent onDone={onDone} />
    </LanguageProvider>
  );
}

function OnboardingContent({ onDone }: { onDone: () => void }) {
  const { language, setLanguage, t } = useTranslation();
  const [mode, setMode] = React.useState<Mode>('choose');
  const [mnemonic, setMnemonic] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const generate = () => {
    setMnemonic(generateMnemonic());
    setSaved(false);
    setCopied(false);
  };

  React.useEffect(() => {
    if (mode === 'create' && !mnemonic) generate();
  }, [mode]);

  const finish = async (mnemonicValue: string) => {
    setBusy(true);
    setError(null);
    try {
      const keys = await deriveKeys(mnemonicValue);
      await saveSession(mnemonicValue, keys);
      onDone();
    } catch (e) {
      setError('Gagal menurunkan kunci: ' + String(e));
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const text = mnemonicToTextFile(mnemonic, { createdAt: Date.now(), lang: language });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syntive-secret-key-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const doImport = async () => {
    if (!importText.trim()) {
      setError(t('onboardingEmptyError'));
      return;
    }
    const normalized = normalizeMnemonic(importText);
    const v = validateMnemonic(normalized);
    if (!v.ok) {
      setError(v.reason ?? 'Secret Key tidak valid');
      return;
    }
    await finish(normalized);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 select-none overflow-hidden bg-[#050505] text-white">
      {/* 1. Abstract Blurred Dot Clusters & Glows at Top-Right & Bottom-Left */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-Right Dot Cluster + Success Glow */}
        <div className="absolute -top-16 -right-16 h-110 w-110 opacity-80">
          <div
            className="absolute inset-0 blur-[0.5px]"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.45) 1.25px, transparent 1.25px)',
              backgroundSize: '22px 22px',
              maskImage: 'radial-gradient(circle at 80% 20%, black 25%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(circle at 80% 20%, black 25%, transparent 75%)',
            }}
          />
          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-success/20 blur-[100px]" />
        </div>

        {/* Bottom-Left Dot Cluster + Teal Glow */}
        <div className="absolute -bottom-16 -left-16 h-110 w-110 opacity-80">
          <div
            className="absolute inset-0 blur-[0.5px]"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.45) 1.25px, transparent 1.25px)',
              backgroundSize: '22px 22px',
              maskImage: 'radial-gradient(circle at 20% 80%, black 25%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(circle at 20% 80%, black 25%, transparent 75%)',
            }}
          />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-teal-500/20 blur-[100px]" />
        </div>
      </div>

      {/* Security & Encryption Note at Bottom-Left Corner */}
      <div className="fixed bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 text-[11px] text-zinc-400 font-sans backdrop-blur-xl bg-zinc-950/60 px-3.5 py-1.5 rounded-full border border-white/15 shadow-lg select-none">
        <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
        <span>{t('onboardingSecurityNote')}</span>
      </div>

      {/* Language Switcher in Bottom-Right Corner */}
      <div className="fixed bottom-4 right-4 z-20 flex items-center select-none">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/60 hover:bg-zinc-900/80 border border-white/15 text-zinc-200 transition-all cursor-pointer shadow-lg backdrop-blur-xl active:scale-95 text-xs font-semibold"
              title="Pilih Bahasa / Change Language"
            >
              <Language className="h-3.5 w-3.5 text-zinc-400" />
              <span className="uppercase font-mono font-semibold text-xs">
                {language === 'id' ? 'ID' : 'EN'}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-36 bg-zinc-950/90 border-white/15 text-zinc-100 rounded-2xl shadow-2xl backdrop-blur-2xl p-1 mb-2"
          >
            <DropdownMenuItem
              onClick={() => setLanguage('id')}
              className="flex items-center justify-between px-3 py-2 text-xs rounded-xl cursor-pointer hover:bg-white/10 focus:bg-white/10 text-zinc-100"
            >
              <span className="font-medium">Bahasa Indonesia</span>
              {language === 'id' && <Check className="h-3.5 w-3.5 text-success shrink-0 ml-2" />}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setLanguage('en')}
              className="flex items-center justify-between px-3 py-2 text-xs rounded-xl cursor-pointer hover:bg-white/10 focus:bg-white/10 text-zinc-100"
            >
              <span className="font-medium">English</span>
              {language === 'en' && <Check className="h-3.5 w-3.5 text-success shrink-0 ml-2" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Landing / Login Modal (High-Vibrancy Glassmorphism) */}
      {mode === 'choose' && (
        <div className="relative z-10 w-full max-w-105 rounded-3xl border border-white/20 bg-zinc-950/45 p-8 sm:p-9 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl flex flex-col items-center text-center space-y-6">
          {/* Original Light Logo */}
          <div className="py-1">
            <img
              src={logo}
              alt="Syntive"
              className="h-8 sm:h-9 select-none mx-auto drop-shadow-md"
            />
          </div>

          {/* Secret Key Input */}
          <div className="w-full space-y-1.5 text-left">
            <input
              type="text"
              className="w-full h-14 bg-black/60 border border-white/15 rounded-2xl px-4 text-center font-mono text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-success/60 focus:ring-1 focus:ring-success/60 transition-all shadow-inner backdrop-blur-md"
              placeholder={t('onboardingPlaceholder')}
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') doImport();
              }}
            />
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-xl text-center">
                {error}
              </p>
            )}
          </div>

          {/* Compact Buttons */}
          <div className="flex items-center gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                setMode('create');
              }}
              className="flex-1 border-white/15 bg-white/5 hover:bg-white/15 text-zinc-100 h-9 text-xs font-medium rounded-xl backdrop-blur-md"
            >
              {t('onboardingCreateBtn')}
            </Button>
            <Button
              size="sm"
              onClick={doImport}
              disabled={busy}
              className="flex-1 bg-white text-zinc-950 hover:bg-zinc-200 h-9 text-xs font-semibold rounded-xl shadow-md"
            >
              {busy ? t('onboardingProcessing') : t('onboardingLoginBtn')}
            </Button>
          </div>

          {/* Subtext */}
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            {t('onboardingSubtext')}
          </p>
        </div>
      )}

      {/* Optimized Create Secret Key Card (High-Vibrancy Glassmorphism) */}
      {mode === 'create' && (
        <div className="relative z-10 w-full max-w-135 rounded-3xl border border-white/20 bg-zinc-950/45 p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-success font-semibold text-base sm:text-lg">
              <ShieldCheck className="h-5 w-5" />
              <span>{t('onboardingTitleCreate')}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generate}
              className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <Refresh className="h-3.5 w-3.5 mr-1" />
              <span>{t('onboardingRegenerate')}</span>
            </Button>
          </div>

          {/* 12 Words Grid (Glassmorphism Tiles) */}
          <div className="rounded-2xl border border-white/10 bg-black/50 p-3.5 backdrop-blur-md">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {mnemonic.split(' ').map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-xl bg-white/4 border border-white/10 px-2.5 py-2 font-mono text-xs text-zinc-100 min-w-0 overflow-hidden shadow-inner"
                >
                  <span className="text-[10px] text-zinc-500 shrink-0 font-sans">{i + 1}.</span>
                  <span className="font-medium text-xs text-zinc-100 truncate">{w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={download}
              className="flex-1 border-white/15 bg-white/5 hover:bg-white/15 text-zinc-200 h-9 text-xs font-medium rounded-xl backdrop-blur-md"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>{t('onboardingDownloadTxt')}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copy}
              className="flex-1 border-white/15 bg-white/5 hover:bg-white/15 text-zinc-200 h-9 text-xs font-medium rounded-xl backdrop-blur-md"
            >
              {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-success" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
              <span>{copied ? t('onboardingCopied') : t('onboardingCopy')}</span>
            </Button>
          </div>

          {saved && (
            <p className="flex items-center gap-1.5 text-xs text-success bg-success/10 border border-success/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Check className="h-4 w-4 shrink-0" /> {t('onboardingDownloadedMsg')}
            </p>
          )}

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-xl backdrop-blur-sm">
              {error}
            </p>
          )}

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
                setMode('choose');
              }}
              className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> {t('onboardingBack')}
            </Button>
            <Button
              size="sm"
              onClick={() => finish(mnemonic)}
              disabled={busy}
              className="bg-white text-zinc-950 hover:bg-zinc-200 h-9 text-xs font-semibold px-4 rounded-xl shadow-md"
            >
              {busy ? t('onboardingProcessing') : t('onboardingContinue')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}




