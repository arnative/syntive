import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Badge } from '@/components/ui/badge';
import { Panel } from '@/components/ui/panel';
import { PanelHeader } from '@/components/ui/panel-header';
import { MutedText } from '@/components/ui/muted-text';
import { Heart, Qr, Globe, Copy, Check } from 'reicon-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WORKER_ENDPOINT = 'https://syntive-resonance-c21f.byztma.workers.dev/';

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const { t } = useTranslation();
  const [copiedPaypal, setCopiedPaypal] = React.useState(false);
  const [qrisImgSrc, setQrisImgSrc] = React.useState('https://ik.imagekit.io/byzt/BISMA/QRIS.webp');
  const [paypalUrl, setPaypalUrl] = React.useState('https://paypal.me/bismawy');

  React.useEffect(() => {
    if (!open) return;

    fetch(WORKER_ENDPOINT)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.qrisImageUrl) setQrisImgSrc(data.qrisImageUrl);
        if (data.paypalUrl) setPaypalUrl(data.paypalUrl);
      })
      .catch((err) => {
        console.warn('Worker config fetch failed, using CDN fallback:', err);
      });
  }, [open]);

  const handleCopyPaypal = async () => {
    await navigator.clipboard.writeText(paypalUrl);
    setCopiedPaypal(true);
    setTimeout(() => setCopiedPaypal(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120 w-[95vw] bg-card border-border text-foreground rounded-2xl p-5 flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-base font-medium tracking-tight text-foreground flex items-center gap-2">
            <Heart className="h-4.5 w-4.5 text-destructive fill-destructive animate-pulse" />
            <span>{t('supportModalTitle')}</span>
          </DialogTitle>
          <MutedText className="pt-1">{t('supportModalDesc')}</MutedText>
        </DialogHeader>

        <div className="space-y-3 text-xs">
          {/* Option 1: Indonesia (QRIS) */}
          <Panel hoverable>
            <PanelHeader
              icon={<Qr className="h-4 w-4 text-success" />}
              title={t('indonesiaQris')}
              action={<Badge color="emerald" compact>{t('indonesiaBadge')}</Badge>}
            />

            <MutedText>{t('qrisDesc')}</MutedText>

            <div className="bg-card border border-border rounded-xl p-3.5 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-2 bg-white rounded-xl shadow-sm flex items-center justify-center min-h-48 h-48 w-48 shrink-0">
                <img
                  src={qrisImgSrc}
                  alt="QRIS Donasi Bisma"
                  width={176}
                  height={176}
                  onError={() => setQrisImgSrc('https://ik.imagekit.io/byzt/BISMA/QRIS.webp')}
                  className="h-44 w-44 object-contain rounded-lg shrink-0"
                />
              </div>
              <MutedText size="2xs" as="span" className="font-mono">{t('qrisFooter')}</MutedText>
            </div>
          </Panel>

          {/* Option 2: Global (PayPal) */}
          <Panel hoverable>
            <PanelHeader
              icon={<Globe className="h-4 w-4 text-info" />}
              title={t('globalPaypal')}
              action={<Badge color="sky" compact>{t('globalBadge')}</Badge>}
            />

            <MutedText>{t('paypalDesc')}</MutedText>

            <div className="flex items-center gap-2 pt-1">
              <Button asChild className="flex-1 bg-info hover:opacity-90 text-white rounded-xl shadow-xs">
                <a href={paypalUrl} target="_blank" rel="noreferrer">
                  {t('openPaypalBtn')}
                </a>
              </Button>

              <IconButton
                variant="outline"
                size="md"
                onClick={handleCopyPaypal}
                className={cn(
                  'rounded-xl bg-background',
                  copiedPaypal && 'text-success border-success/30 bg-success/10'
                )}
                title={t('copyPaypalTooltip')}
                aria-label={t('copyPaypalTooltip')}
              >
                {copiedPaypal ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </IconButton>
            </div>
          </Panel>
        </div>
      </DialogContent>
    </Dialog>
  );
}
