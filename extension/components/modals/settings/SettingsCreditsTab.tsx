import * as React from 'react';
import { CloudRain, Radio, QuoteUp, BookOpen, Heart } from 'reicon-react';
import { Panel } from '@/components/ui/panel';
import { Badge } from '@/components/ui/badge';
import { MutedText } from '@/components/ui/muted-text';
import { SettingsTabHeader } from '../SettingField';
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
    <div className="flex flex-col h-full min-h-0">
      {/* Header Title */}
      <SettingsTabHeader
        title={t('creditsTitle')}
        description={t('creditsSubtitle')}
      />

      {/* Credits Cards List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {CREDITS.map((credit) => {
          const Icon = credit.icon;
          return (
            <Panel key={credit.href} hoverable className="p-2.5 space-y-1 flex items-start gap-3">
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
                    className="shrink-0"
                  >
                    <Badge color="accent" compact className="font-mono hover:bg-accent/70">
                      {t(credit.sourceKey)}
                    </Badge>
                  </a>
                </div>
                <MutedText size="2xs" className="mt-0.5">
                  {t(credit.descKey)}
                </MutedText>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}