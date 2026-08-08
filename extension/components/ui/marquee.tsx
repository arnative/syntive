import * as React from 'react';
import { cn } from '@/lib/utils';

// Renders text in a horizontal scroll-on-hover marquee when it overflows its
// container. Short titles stay static. The fade at both edges is a CSS mask
// gradient.
export function Marquee({ text, className }: { text: string; className?: string }) {
  const outerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = React.useState(false);
  const [scrollDist, setScrollDist] = React.useState(0);

  const measure = React.useCallback(() => {
    const o = outerRef.current, i = innerRef.current;
    if (!o || !i) return;
    const isOverflowing = i.scrollWidth > o.clientWidth;
    setOverflow(isOverflowing);
    if (isOverflowing) {
      // scrollDist is negative (e.g. -150px) to move the text left
      setScrollDist(o.clientWidth - i.scrollWidth);
    } else {
      setScrollDist(0);
    }
  }, []);

  React.useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, [measure, text]);

  const duration = overflow ? Math.max(3, Math.ceil(Math.abs(scrollDist) / 45)) : 0;

  return (
    <div
      ref={outerRef}
      className={cn(
        'marquee relative block overflow-hidden select-none',
        overflow && 'has-overflow',
        className
      )}
      title={text}
      style={{
        '--scroll-dist': `${scrollDist}px`,
        '--marquee-duration': `${duration}s`,
      } as React.CSSProperties}
    >
      <span
        ref={innerRef}
        className={cn(
          'marquee-inner',
          overflow && 'marquee-animate'
        )}
      >
        {text}
      </span>
    </div>
  );
}
