import * as React from 'react';
import { ShieldCheck, Cloud, Lock } from 'reicon-react';
import { Badge } from '@/components/ui/badge';
import { Panel } from '@/components/ui/panel';
import { MutedText } from '@/components/ui/muted-text';
import { useTranslation } from '@/lib/i18n';
import logoIcon from '@/assets/logo-icon.svg';

export function SettingsAboutTab() {
  const { t } = useTranslation();

  // App Version (dynamically synced from extension manifest/package.json)
  const appVersion = React.useMemo(() => {
    try {
      return browser.runtime.getManifest()?.version ?? '1.0.0';
    } catch {
      return '1.0.0';
    }
  }, []);

  return (
    <div className="space-y-3">
      {/* Header Branding with Logo */}
      <div className="flex items-center gap-3.5 pb-3">
        <div className="h-11 w-11 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 p-2">
          <img
            src={logoIcon}
            alt="Syntive Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium tracking-tight text-foreground">Syntive</h3>
            <Badge color="accent" compact className="font-mono font-medium">v{appVersion}</Badge>
          </div>
          <p className="text-[10px] tint-text mt-0.5">
            End-to-End Encrypted Bookmark Synchronization
          </p>
        </div>
      </div>

      {/* Technical Architecture Highlights */}
      <div className="grid grid-cols-3 gap-2">
        <Panel className="flex flex-col items-center justify-center p-2.5 text-center">
          <ShieldCheck className="h-4 w-4 text-primary mb-1" />
          <span className="text-[10px] font-semibold text-foreground">AES-GCM 256</span>
          <span className="text-[9px] tint-text">E2E Encrypted</span>
        </Panel>
        <Panel className="flex flex-col items-center justify-center p-2.5 text-center">
          <Cloud className="h-4 w-4 text-primary mb-1" />
          <span className="text-[10px] font-semibold text-foreground">Cloudflare</span>
          <span className="text-[9px] tint-text">Database Server</span>
        </Panel>
        <Panel className="flex flex-col items-center justify-center p-2.5 text-center">
          <Lock className="h-4 w-4 text-primary mb-1" />
          <span className="text-[10px] font-semibold text-foreground">Zero-Knowledge</span>
          <span className="text-[9px] tint-text">Client-Side Privacy</span>
        </Panel>
      </div>

      {/* Explanation */}
      <Panel className="space-y-1.5">
        <span className="font-semibold text-[11px] text-foreground block">{t('aboutAppDescTitle')}</span>
        <MutedText className="text-[11px] leading-relaxed">{t('aboutAppDesc')}</MutedText>
      </Panel>

      {/* Developer, Database & License Info */}
      <div className="border-t border-border pt-3.5 text-[10px] tint-text space-y-2 font-mono">
        <div className="flex justify-between items-center">
          <span>{t('developerLabel')}</span>
          <a
            href="https://github.com/arnative"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-foreground hover:text-primary hover:underline flex items-center gap-1"
          >
            <span>Arnative</span>
          </a>
        </div>
        <div className="flex justify-between items-center">
          <span>{t('databaseServerLabel')}</span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Cloud className="h-3 w-3 text-primary" />
              <span>Cloudflare</span>
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span>{t('licenseLabel')}</span>
          <span className="font-semibold text-foreground">Apache-2.0 Open Source</span>
        </div>
        <div className="flex justify-between items-center">
          <span>{t('repoLabel')}</span>
          <a
            href="https://github.com/arnative/syntive"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>github.com/arnative/syntive</span>
          </a>
        </div>
      </div>
    </div>
  );
}