import * as React from 'react';
import { Globe } from 'reicon-react';
import { cn, domainOf } from '@/lib/utils';

export interface FaviconImageProps {
  url?: string | null;
  alt?: string;
  className?: string;
  fallbackSize?: string;
}

// Localhost / loopback / bare IP hosts have no public favicon — don't hit
// remote favicon services for them (avoids noisy 404s and wasted requests).
const LOCAL_OR_IP = /^(localhost|::1|(?:0\.)?0\.0\.0\.0|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;

// Remember domains that exhausted every provider so re-renders skip
// straight to the fallback icon instead of re-firing the failed requests.
const failedDomains = new Set<string>();

/**
 * Smart Favicon component with multi-tier auto-fallback.
 * Tries Google Favicon API -> IconHorse -> DuckDuckGo -> Favicon.im -> Globe Icon.
 */
export function FaviconImage({
  url,
  alt = '',
  className = 'h-4 w-4 object-contain shrink-0',
}: FaviconImageProps) {
  const domain = React.useMemo(() => domainOf(url), [url]);

  const providerUrl = React.useMemo(() => {
    if (!domain) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128&default_icon=none`;
  }, [domain]);

  const [hasError, setHasError] = React.useState(() => (domain ? failedDomains.has(domain) : false));

  React.useEffect(() => {
    setHasError(domain ? failedDomains.has(domain) : false);
  }, [domain]);

  const handleError = () => {
    if (domain) failedDomains.add(domain);
    setHasError(true);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Google S2 API returns a 16x16 default icon when a domain has no public favicon.
    // Since sz=128 was requested, naturalWidth <= 16 indicates no favicon -> fallback to Globe.
    if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
      if (domain) failedDomains.add(domain);
      setHasError(true);
    }
  };

  if (hasError || !domain || !providerUrl || LOCAL_OR_IP.test(domain)) {
    return <Globe className={cn('text-muted-foreground shrink-0', className)} />;
  }

  return (
    <img
      src={providerUrl}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
    />
  );
}
