import * as React from 'react';
import { CloudRain, Radio, QuoteUp, BookOpen, Heart, ArrowUpRight } from 'reicon-react';
import { Panel } from '@/components/ui/panel';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';

const CREDITS: { icon: React.ComponentType<{ className?: string }>; titleKey: TranslationKey; sourceKey: TranslationKey; descKey: TranslationKey; href: string }[] = [
  { icon: CloudRain, titleKey: 'creditsNatureRadioTitle', sourceKey: 'creditsNatureRadioSource', descKey: 'creditsNatureRadioDesc', href: 'https://noisekun.com' },
  { icon: Radio, titleKey: 'creditsQuranRadioTitle', sourceKey: 'creditsQuranRadioSource', descKey: 'creditsQuranRadioDesc', href: 'https://qurango.net' },
  { icon: QuoteUp, titleKey: 'creditsMotivationalQuotesTitle', sourceKey: 'creditsMotivationalQuotesSource', descKey: 'creditsMotivationalQuotesDesc', href: 'https://quotes.liupurnomo.com' },
  { icon: BookOpen, titleKey: 'creditsIslamicQuotesTitle', sourceKey: 'creditsIslamicQuotesSource', descKey: 'creditsIslamicQuotesDesc', href: 'https://myquran.com' },
  { icon: Heart, titleKey: 'creditsIconsTitle', sourceKey: 'creditsIconsSource', descKey: 'creditsIconsDesc', href: 'https://reicon.dev' },
];

export function SettingsCreditsTab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-3.5">
      {/* Header Title */}
      <div className="border-b border-border pb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-foreground">
          {t('creditsTitle')}
        </h3>
        <p className="text-[10px] tint-text mt-1 leading-relaxed">
          {t('creditsSubtitle')}
        </p>
      </div>

      {/* Credits Cards List */}
      <div className="space-y-2 max-h-122.5 overflow-y-auto pr-1">
        {CREDITS.map((credit) => {
          const Icon = credit.icon;
          return (
            <Panel key={credit.href} className="p-2.5 space-y-1 flex items-start gap-3 transition-colors hover:border-primary/40">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-foreground">{t(credit.titleKey)}</span>
                  <a
                    href={credit.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>{t(credit.sourceKey)}</span>
                    <ArrowUpRight className="h-2.5 w-2.5 opacity-60" />
                  </a>
                </div>
                <p className="text-[10px] tint-text mt-0.5 leading-relaxed">
                  {t(credit.descKey)}
                </p>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}