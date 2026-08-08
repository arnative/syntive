import * as React from 'react';
import { Clock } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { useTranslation } from '@/lib/i18n';

export function ClockWidget({ dragHandle }: { dragHandle: React.ReactNode }) {
  const { t, language } = useTranslation();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hours = time.getHours();
    if (hours >= 5 && hours < 11) return t('greetingMorning');
    if (hours >= 11 && hours < 15) return t('greetingNoon');
    if (hours >= 15 && hours < 18) return t('greetingAfternoon');
    return t('greetingNight');
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <DashboardCard
      title={t('widgetClockTitle')}
      icon={<Clock className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerAction={dragHandle}
      minHeight="h-[234px]"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center py-2 h-full gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-accent border border-border text-xs font-medium text-foreground">
            {getGreeting()}
          </span>
        </div>
        <h3 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight font-sans leading-tight">
          {formattedTime}
        </h3>
        <p className="text-xs tint-text font-medium truncate leading-tight">
          {formattedDate}
        </p>
      </div>
    </DashboardCard>
  );
}