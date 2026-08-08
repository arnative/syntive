import * as React from 'react';
import { QuoteUp as QuoteIcon, BookOpen, Copy, Check, Refresh } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { useTranslation, type Language } from '@/lib/i18n';

const MOTIVATIONAL_QUOTES: Record<Language, { text: string; author: string }[]> = {
  id: [
    { text: 'Cara terbaik untuk memprediksi masa depan adalah dengan menciptakannya.', author: 'Peter Drucker' },
    { text: 'Kreativitas adalah kecerdasan yang sedang bersenang-senang.', author: 'Albert Einstein' },
    { text: 'Kesederhanaan adalah kunci dari segala keanggunan sejati.', author: 'Coco Chanel' },
    { text: 'Fokus pada proses, bukan sekadar hasil akhir.', author: 'Anonim' },
    { text: 'Rahasia untuk maju adalah dengan memulai.', author: 'Mark Twain' },
    { text: 'Setiap perjalanan ribuan mil selalu dimulai dengan satu langkah pertama.', author: 'Lao Tzu' },
    { text: 'Kegagalan adalah satu-satunya kesempatan untuk memulai lagi dengan lebih cerdas.', author: 'Henry Ford' },
    { text: 'Investasi terbaik yang bisa kamu lakukan adalah investasi pada dirimu sendiri.', author: 'Warren Buffett' },
    { text: 'Jangan menunggu kesempatan, ciptakanlah kesempatan itu.', author: 'George Bernard Shaw' },
  ],
  en: [
    { text: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
    { text: 'Creativity is intelligence having fun.', author: 'Albert Einstein' },
    { text: 'Simplicity is the keynote of all true elegance.', author: 'Coco Chanel' },
    { text: 'Focus on the process, not just the outcome.', author: 'Anonymous' },
    { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
    { text: 'A journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
    { text: 'Failure is simply the opportunity to begin again, this time more intelligently.', author: 'Henry Ford' },
    { text: 'The best investment you can make is an investment in yourself.', author: 'Warren Buffett' },
    { text: 'Do not wait for opportunity, create it.', author: 'George Bernard Shaw' },
  ],
};

async function fetchMotivationalQuoteApi(lang: Language): Promise<{ text: string; author: string } | null> {
  if (lang === 'id') {
    try {
      const url = `https://quotes.liupurnomo.com/api/quotes/random?_t=${Date.now()}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2200) });

      if (!res.ok) return null;
      const json = await res.json();
      if (json.status === 'SUCCESS' && json.data?.text && json.data?.author) {
        return {
          text: json.data.text,
          author: json.data.author,
        };
      }
    } catch {
      // fallback
    }
  }
  return null;
}

// 6. Islamic Wisdom Widget
const ISLAMIC_QUOTES: Record<Language, { text: string; author: string; source: string }[]> = {
  id: [
    {
      text: 'Barangsiapa menempuh jalan untuk menuntut ilmu, maka Allah akan mudahkan baginya jalan menuju surga.',
      author: 'Rasulullah ﷺ',
      source: 'HR. Muslim no. 2699',
    },
    {
      text: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.',
      author: 'Rasulullah ﷺ',
      source: 'HR. Thabrani, Shahihul Jami’ no. 3289',
    },
    {
      text: 'Senyummu di hadapan saudaramu adalah sedekah bagimu.',
      author: 'Rasulullah ﷺ',
      source: 'HR. Tirmidzi no. 1956',
    },
    {
      text: 'Perbaikilah rahasiamu (hatimu), niscaya Allah akan memperbaiki terang-teranganmu (amalan lahiriahmu).',
      author: 'Umar bin Khattab RA',
      source: 'Hilyatul Auliya 1/54',
    },
    {
      text: 'Ilmu itu lebih baik daripada harta. Ilmu menjagamu, sedangkan engkau menjaga harta.',
      author: 'Ali bin Abi Thalib RA',
      source: 'Jami’ Bayanul ‘Ilmi 1/61',
    },
    {
      text: 'Jika engkau merasa hatimu keras, maka beri makanlah orang miskin dan usaplah kepala anak yatim.',
      author: 'Hasan al-Basri',
      source: 'Al-Zuhd karya Ahmad no. 1530',
    },
    {
      text: 'Barangsiapa yang menginginkan dunia hendaklah dengan ilmu, dan barangsiapa menginginkan akhirat hendaklah dengan ilmu.',
      author: 'Imam Syafi’i',
      source: 'Diwan Asy-Syafi’i',
    },
    {
      text: 'Waktu yang paling sia-sia adalah waktu yang tidak digunakan untuk mengingat Allah atau menuntut ilmu.',
      author: 'Ibnul Qayyim Al-Jauziyyah',
      source: 'Al-Fawaid hal. 44',
    },
  ],
  en: [
    {
      text: 'Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise.',
      author: 'Prophet Muhammad ﷺ',
      source: 'Sahih Muslim no. 2699',
    },
    {
      text: 'The best of people are those who are most beneficial to others.',
      author: 'Prophet Muhammad ﷺ',
      source: 'Narrated by At-Tabarani',
    },
    {
      text: 'Your smile for your brother is charity for you.',
      author: 'Prophet Muhammad ﷺ',
      source: 'Sunan at-Tirmidhi no. 1956',
    },
    {
      text: 'Purify your private life, and Allah will purify your public life.',
      author: 'Umar bin Al-Khattab',
      source: 'Hilyatul Auliya 1/54',
    },
    {
      text: 'Knowledge is better than wealth. Knowledge protects you, while you protect wealth.',
      author: 'Ali bin Abi Talib',
      source: 'Jami’ Bayanul ‘Ilmi 1/61',
    },
    {
      text: 'If you feel your heart is hard, feed the poor and stroke the head of an orphan.',
      author: 'Hasan al-Basri',
      source: 'Al-Zuhd by Ahmad no. 1530',
    },
    {
      text: 'Whoever desires this world must seek knowledge, and whoever desires the hereafter must seek knowledge.',
      author: 'Imam Ash-Shafi’i',
      source: 'Diwan Ash-Shafi’i',
    },
    {
      text: 'The most wasted time is that which is not spent in remembering Allah or seeking knowledge.',
      author: 'Ibn al-Qayyim',
      source: 'Al-Fawaid p. 44',
    },
  ],
};

async function fetchShortHadithApi(lang: Language): Promise<{ text: string; author: string; source: string } | null> {
  if (lang !== 'id') return null;

  const MAX_ATTEMPTS = 3;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const url = `https://api.myquran.com/v3/hadis/enc/random?_t=${Date.now()}_${attempt}`;

      const res = await fetch(url, { signal: AbortSignal.timeout(2200) });

      if (!res.ok) continue;
      const json = await res.json();
      const item = json?.data;
      const rawText = item?.text?.id;
      if (!rawText) continue;

      let cleanText = rawText
        .replace(/\[.*?\]/g, '')
        .replace(/^[;\s:,"'\-\.\u201c\u201d\u2018\u2019]+/g, '')
        .replace(/[;\s,"'\-\.\u201c\u201d\u2018\u2019]+$/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanText.length > 0) {
        cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
      }

      if (cleanText.length >= 15) {
        let takhrij = item?.takhrij || 'Hadits Riwayat';
        takhrij = takhrij
          .replace(/^رواه\s*/i, 'HR. ')
          .replace(/Diriwayatkan oleh\s*/gi, 'HR. ')
          .replace(/\s*dengan\s+(dua\s+)?riwayatnya.*/gi, '')
          .replace(/\s*dan\s+lafaz.*$/gi, '')
          .replace(/\s*-\s*HR\.\s*/gi, ', ')
          .replace(/\s*-\s*/g, ', ')
          .replace(/HR\.\s*HR\./g, 'HR.')
          .trim();

        return {
          text: cleanText,
          author: 'Rasulullah ﷺ',
          source: takhrij,
        };
      }
    } catch {
      // fallback
    }
  }
  return null;
}

// Shared Base QuoteUp Widget Component (Center-aligned layout for Quotes & Hadiths)
interface BaseQuoteWidgetProps {
  title: React.ReactNode;
  icon: React.ReactNode;
  dragHandle: React.ReactNode;
  onRefresh: () => void;
  isLoading: boolean;
  text: string;
  author: string;
  source?: string;
  category?: string;
  showQuotes?: boolean;
}

function BaseQuoteWidget({
  title,
  icon,
  dragHandle,
  onRefresh,
  isLoading,
  text,
  author,
  source,
  category,
  showQuotes = false,
}: BaseQuoteWidgetProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const fullText = showQuotes
      ? `"${text}" — ${author}${source ? ` | ${source}` : ''}`
      : `${text} — ${author}${source ? ` | ${source}` : ''}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardCard
      title={title}
      icon={icon}
      headerAction={
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopy}
            className="p-1 rounded-md tint-text hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            title="Salin Teks"
          >
            {copied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1 rounded-md tint-text hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            title={t('nextQuote')}
          >
            <Refresh className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {dragHandle}
        </div>
      }
      minHeight="h-[234px]"
      contentClassName="p-3.5 pt-2 flex flex-col justify-between h-full min-h-0 relative"
    >
      {/* Quote Container inside Card Inner Box */}
      <div className="card-inner-box flex-1 flex flex-col justify-between p-3.5 min-h-0 relative w-full overflow-hidden">
        {/* Quote Content - Proper scrolling without top clipping */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-2.5 animate-pulse w-full py-4">
            <div className="h-3 bg-muted-foreground/15 rounded-full w-11/12"></div>
            <div className="h-3 bg-muted-foreground/15 rounded-full w-9/12"></div>
            <div className="h-3 bg-muted-foreground/15 rounded-full w-7/12"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto w-full px-2 py-1.5 custom-scrollbar min-h-0">
            <p className="text-[12.5px] text-foreground leading-relaxed select-text text-center font-normal tracking-wide">
              {showQuotes ? `"${text}"` : text}
            </p>
          </div>
        )}

        {/* Footer Meta Bar - Filled bg-border/40 with top border, single-line no wrap */}
        <div className="-mx-3.5 -mb-3.5 mt-2 px-3 py-1.5 bg-border/40 border-t border-border flex items-center justify-center gap-1.5 shrink-0 text-xs select-none whitespace-nowrap overflow-hidden rounded-b-[calc(var(--radius-md,0.375rem)-1px)]">
          <span className="text-[11px] font-semibold text-foreground shrink-0">
            {author}
          </span>

          {category && (
            <>
              <span className="text-[10px] text-muted-foreground/60 shrink-0">|</span>
              <span className="text-[9.5px] text-muted-foreground font-mono bg-background/60 border border-border/50 px-1.5 py-0.5 rounded capitalize shrink-0">
                {category}
              </span>
            </>
          )}

          {source && (
            <>
              <span className="text-[10px] text-muted-foreground/60 shrink-0">|</span>
              <span className="text-[10px] text-muted-foreground font-mono truncate max-w-44" title={source}>
                {source}
              </span>
            </>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}

// Shared quote-loading hook: try the live API, fall back to a random local quote.
// Auto-loads on mount and refreshes every 5 minutes.
function useRandomQuote<T>(fetcher: (lang: Language) => Promise<T | null>, list: T[], language: Language) {
  const [current, setCurrent] = React.useState<T>(() => list[Math.floor(Math.random() * list.length)]);
  const [loading, setLoading] = React.useState(false);

  const loadNext = React.useCallback(async () => {
    setLoading(true);
    const apiQuote = await fetcher(language);
    setCurrent(apiQuote ?? list[Math.floor(Math.random() * list.length)]);
    setLoading(false);
  }, [fetcher, language, list]);

  React.useEffect(() => {
    loadNext();
  }, [loadNext]);

  React.useEffect(() => {
    const timer = setInterval(loadNext, 300000); // 5 minutes
    return () => clearInterval(timer);
  }, [loadNext]);

  return { current, loading, loadNext };
}

export function QuoteWidget({ dragHandle }: { dragHandle: React.ReactNode }) {
  const { t, language } = useTranslation();
  const fallbackList = MOTIVATIONAL_QUOTES[language] || MOTIVATIONAL_QUOTES.id;
  const { current, loading, loadNext } = useRandomQuote(fetchMotivationalQuoteApi, fallbackList, language);

  return (
    <BaseQuoteWidget
      title={t('widgetQuoteTitle')}
      icon={<QuoteIcon className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      dragHandle={dragHandle}
      onRefresh={loadNext}
      isLoading={loading}
      text={current.text}
      author={current.author}
      category={(current as { category?: string }).category}
      showQuotes={true}
    />
  );
}

export function IslamicQuoteWidget({ dragHandle }: { dragHandle: React.ReactNode }) {
  const { t, language } = useTranslation();
  const fallbackList = ISLAMIC_QUOTES[language] || ISLAMIC_QUOTES.id;
  const { current, loading, loadNext } = useRandomQuote(fetchShortHadithApi, fallbackList, language);

  return (
    <BaseQuoteWidget
      title={t('widgetIslamicQuoteTitle')}
      icon={<BookOpen className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      dragHandle={dragHandle}
      onRefresh={loadNext}
      isLoading={loading}
      text={current.text}
      author={current.author}
      source={current.source}
      showQuotes={false}
    />
  );
}
