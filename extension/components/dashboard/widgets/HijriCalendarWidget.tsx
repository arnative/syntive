import * as React from 'react';
import { Moon, AngleLeft, AngleRight } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { useTranslation } from '@/lib/i18n';

const HIJRI_MONTHS_ID = [
  'Muharram',
  'Safar',
  'Rabi\'ul Awal',
  'Rabi\'ul Akhir',
  'Jumadil Awal',
  'Jumadil Akhir',
  'Rajab',
  'Sya\'ban',
  'Ramadan',
  'Syawal',
  'Dzulqa\'dah',
  'Dzulhijjah',
];

const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  'Rabi\' al-Awwal',
  'Rabi\' al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qi\'dah',
  'Dhu al-Hijjah',
];

const DAYS_SHORT_ID = ['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'];
const DAYS_SHORT_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DAYS_FULL_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAYS_FULL_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface HijriEventDef {
  month: number; // 0-indexed
  day: number;
  titleId: string;
  titleEn: string;
  isHoliday?: boolean;
}

const ISLAMIC_EVENTS: HijriEventDef[] = [
  { month: 0, day: 1, titleId: 'Tahun Baru Hijriyah', titleEn: 'Islamic New Year', isHoliday: true },
  { month: 0, day: 9, titleId: 'Puasa Tasu\'a', titleEn: 'Tasu\'a Fasting' },
  { month: 0, day: 10, titleId: 'Hari & Puasa Asyura', titleEn: 'Ashura Day & Fasting', isHoliday: true },
  { month: 2, day: 12, titleId: 'Maulid Nabi Muhammad ﷺ', titleEn: 'Prophet\'s Birthday', isHoliday: true },
  { month: 6, day: 27, titleId: 'Isra Mi\'raj', titleEn: 'Isra & Mi\'raj', isHoliday: true },
  { month: 7, day: 15, titleId: 'Malam Nisfu Sya\'ban', titleEn: 'Nisfu Sya\'ban Night' },
  { month: 8, day: 1, titleId: 'Awal Ramadan', titleEn: 'Start of Ramadan', isHoliday: true },
  { month: 8, day: 17, titleId: 'Nuzulul Qur\'an', titleEn: 'Nuzulul Qur\'an', isHoliday: true },
  { month: 9, day: 1, titleId: 'Hari Raya Idul Fitri', titleEn: 'Eid al-Fitr', isHoliday: true },
  { month: 11, day: 9, titleId: 'Hari & Puasa Arafah', titleEn: 'Day of Arafah & Fasting' },
  { month: 11, day: 10, titleId: 'Hari Raya Idul Adha', titleEn: 'Eid al-Adha', isHoliday: true },
  { month: 11, day: 11, titleId: 'Hari Tasyrik 1', titleEn: 'Tashreeq Day 1' },
  { month: 11, day: 12, titleId: 'Hari Tasyrik 2', titleEn: 'Tashreeq Day 2' },
  { month: 11, day: 13, titleId: 'Hari Tasyrik 3', titleEn: 'Tashreeq Day 3' },
];

function getTodayHijri() {
  const now = new Date();
  let day = 1;
  let monthIndex = 0;
  let year = 1448;
  const dayOfWeek = now.getDay();

  try {
    const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    parts.forEach((p) => {
      if (p.type === 'day') day = parseInt(p.value, 10);
      if (p.type === 'month') monthIndex = Math.max(0, parseInt(p.value, 10) - 1);
      if (p.type === 'year') year = parseInt(p.value, 10);
    });
  } catch {
    // Intl islamic-umalqura is supported by all targeted browsers; keep defaults if not.
  }

  return { day, monthIndex, year, dayOfWeek };
}

function getDaysInHijriMonth(monthIndex: number, year: number): number {
  if (monthIndex === 8) return 30; // Ramadan
  if (monthIndex === 11) {
    const isLeap = (11 * year + 14) % 30 < 11;
    return isLeap ? 30 : 29;
  }
  return monthIndex % 2 === 0 ? 30 : 29;
}

export function HijriCalendarWidget({ dragHandle }: { dragHandle?: React.ReactNode }) {
  const { t, language } = useTranslation();
  const isId = language === 'id';
  const monthNames = isId ? HIJRI_MONTHS_ID : HIJRI_MONTHS_EN;
  const daysShort = isId ? DAYS_SHORT_ID : DAYS_SHORT_EN;
  const daysFull = isId ? DAYS_FULL_ID : DAYS_FULL_EN;

  const today = React.useMemo(() => getTodayHijri(), []);
  const now = React.useMemo(() => new Date(), []);

  const [activeTab, setActiveTab] = React.useState<'today' | 'calendar'>('today');

  // Calendar slider state
  const [viewMonth, setViewMonth] = React.useState(today.monthIndex);
  const [viewYear, setViewYear] = React.useState(today.year);
  const [clickedTooltip, setClickedTooltip] = React.useState<{ day: number; info: string; isHoliday?: boolean } | null>(null);

  const tooltipRef = React.useRef<HTMLDivElement>(null);

  // Auto-close tooltip on outside click
  React.useEffect(() => {
    if (!clickedTooltip) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setClickedTooltip(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clickedTooltip]);

  const prevMonth = () => {
    setViewMonth((prevM) => {
      if (prevM === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prevM - 1;
    });
    setClickedTooltip(null);
  };

  const nextMonth = () => {
    setViewMonth((prevM) => {
      if (prevM === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prevM + 1;
    });
    setClickedTooltip(null);
  };

  // Compute Day 1 dayOfWeek for viewMonth/viewYear
  const firstDayOfWeek = React.useMemo(() => {
    const monthDiff = (viewYear - today.year) * 12 + (viewMonth - today.monthIndex);
    let daysOffset = 0;

    if (monthDiff >= 0) {
      let curM = today.monthIndex;
      let curY = today.year;
      for (let i = 0; i < monthDiff; i++) {
        daysOffset += getDaysInHijriMonth(curM, curY);
        curM++;
        if (curM > 11) {
          curM = 0;
          curY++;
        }
      }
    } else {
      let curM = today.monthIndex - 1;
      let curY = today.year;
      for (let i = 0; i < Math.abs(monthDiff); i++) {
        if (curM < 0) {
          curM = 11;
          curY--;
        }
        daysOffset -= getDaysInHijriMonth(curM, curY);
        curM--;
      }
    }

    const day1Offset = daysOffset - (today.day - 1);
    const day1OfWeek = (today.dayOfWeek + (day1Offset % 7) + 7) % 7;
    return day1OfWeek;
  }, [viewMonth, viewYear, today]);

  const daysInViewMonth = getDaysInHijriMonth(viewMonth, viewYear);

  // Build a fixed 35-cell grid (5 rows x 7 cols). If day 30 spills to row 6 (cell 35), wrap it to row 1 (cell 0).
  const gridCells = React.useMemo(() => {
    const cells: { dayNum: number | null }[] = Array.from({ length: 35 }, () => ({ dayNum: null }));
    for (let d = 1; d <= daysInViewMonth; d++) {
      const rawIdx = firstDayOfWeek + (d - 1);
      const targetIdx = rawIdx % 35;
      cells[targetIdx] = { dayNum: d };
    }
    return cells;
  }, [firstDayOfWeek, daysInViewMonth]);

  // Helper to check non-weekly fasts & events.
  // Named events come from ISLAMIC_EVENTS; only recurring fast rules are computed here.
  const getDayDetails = React.useCallback(
    (d: number, mIndex: number) => {
      const nonWeeklyEvents: string[] = [];
      let isHoliday = false;

      ISLAMIC_EVENTS.forEach((e) => {
        if (e.month === mIndex && e.day === d) {
          nonWeeklyEvents.push(isId ? e.titleId : e.titleEn);
          if (e.isHoliday) isHoliday = true;
        }
      });

      // Days where fasting is forbidden (Eid al-Fitr, Eid al-Adha, Tashreeq).
      const isForbidden = (mIndex === 9 && d === 1) || (mIndex === 11 && d >= 10 && d <= 13);

      if (!isForbidden) {
        if (mIndex === 8) {
          nonWeeklyEvents.push(isId ? 'Puasa Ramadan' : 'Ramadan Fasting');
        } else {
          if ((d === 13 || d === 14 || d === 15) && !(mIndex === 11 && d === 13)) {
            nonWeeklyEvents.push(isId ? 'Puasa Ayyamul Bidh' : 'Ayyamul Bidh Fasting');
          }
          if (mIndex === 11 && d >= 1 && d <= 8) {
            nonWeeklyEvents.push(isId ? 'Puasa Dzulhijjah' : 'Dhu al-Hijjah Fasting');
          }
          if (mIndex === 9 && d >= 2 && d <= 7) {
            nonWeeklyEvents.push(isId ? 'Puasa 6 Hari Syawal' : '6 Days Shawwal Fasting');
          }
        }
      }

      return { nonWeeklyEvents, isHoliday, isForbidden };
    },
    [isId]
  );

  const todayDetails = React.useMemo(() => {
    return getDayDetails(today.day, today.monthIndex);
  }, [today, getDayDetails]);

  // Filter ONLY UPCOMING non-weekly fasts (date >= today.day in current month)
  const upcomingFastsList = React.useMemo(() => {
    const list: { label: string; days: number[] }[] = [];
    const totalDays = getDaysInHijriMonth(today.monthIndex, today.year);
    const ayyamulBidh: number[] = [];

    for (let d = today.day; d <= totalDays; d++) {
      const details = getDayDetails(d, today.monthIndex);
      if (details.isForbidden) continue;

      if ((d === 13 || d === 14 || d === 15) && !(today.monthIndex === 11 && d === 13)) {
        ayyamulBidh.push(d);
      } else {
        details.nonWeeklyEvents.forEach((ev) => {
          let existing = list.find((item) => item.label === ev);
          if (existing) {
            existing.days.push(d);
          } else {
            list.push({ label: ev, days: [d] });
          }
        });
      }
    }

    if (ayyamulBidh.length > 0) {
      list.unshift({
        label: isId ? 'Puasa Ayyamul Bidh' : 'Ayyamul Bidh Fasting',
        days: ayyamulBidh,
      });
    }

    return list;
  }, [today, getDayDetails, isId]);

  return (
    <DashboardCard
      title={t('widgetHijriCalendarTitle')}
      icon={<Moon className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerAction={dragHandle}
      minHeight="h-[234px]"
      contentClassName="p-3.5 pt-0.5 pb-2 flex flex-col justify-between min-h-0"
    >
      <div className="flex-1 flex flex-col justify-between h-full pt-0">
        {/* Timer-Style Tabs */}
        <div className="flex items-center justify-center mb-2 shrink-0">
          <div className="flex items-center gap-1 p-0.5 bg-background border border-border rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`px-3 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-(--color-accent) text-(--color-foreground) border border-(--color-border)'
                  : 'tint-text hover:text-(--color-foreground)'
              }`}
            >
              {isId ? 'Hari Ini' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-(--color-accent) text-(--color-foreground) border border-(--color-border)'
                  : 'tint-text hover:text-(--color-foreground)'
              }`}
            >
              {isId ? 'Kalender' : 'Calendar'}
            </button>
          </div>
        </div>

        {/* Tab 1: Hari Ini - Symmetrical Inner Card */}
        {activeTab === 'today' ? (
          <div className="card-inner-box flex-1 flex flex-col justify-between p-3.5 min-h-0 relative overflow-hidden">
            {/* Top Bar: Hari (text-primary) | Tahun H & Masehi Date */}
            <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2 shrink-0">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="font-semibold text-xs text-primary">
                  {daysFull[today.dayOfWeek]}
                </span>
                <span className="text-muted-foreground/60">|</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {today.year}H
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground bg-accent/50 border border-border/60 px-2 py-0.5 rounded-md">
                {now.toLocaleDateString(isId ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Middle: Hijri Date Display */}
            <div className="flex-1 flex flex-col justify-center items-center py-2 text-center my-auto">
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-sans">
                {today.day} <span className="font-semibold text-foreground">{monthNames[today.monthIndex]}</span>
              </div>
            </div>

            {/* Bottom Bar: Optimal Islamic Event / Fasting Info */}
            <div className="border-t border-border/60 pt-2 flex items-center justify-between text-xs shrink-0 select-none">
              <span className="text-foreground font-normal text-[11px] truncate max-w-[65%]" title={todayDetails.nonWeeklyEvents.length > 0 ? todayDetails.nonWeeklyEvents.join(', ') : upcomingFastsList[0]?.label}>
                {todayDetails.nonWeeklyEvents.length > 0
                  ? todayDetails.nonWeeklyEvents.join(', ')
                  : upcomingFastsList.length > 0
                  ? upcomingFastsList[0].label
                  : isId
                  ? 'Tidak ada puasa mendatang'
                  : 'No upcoming fasts'}
              </span>
              <div className="flex items-center gap-1 font-mono text-[10px] font-semibold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-md shrink-0">
                {todayDetails.nonWeeklyEvents.length > 0 ? (
                  <span>Tgl {today.day}</span>
                ) : upcomingFastsList.length > 0 ? (
                  <span>Tgl {upcomingFastsList[0].days.join(', ')}</span>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Fixed 5-Row Calendar Grid (35 Cells). Day 30 wraps to row 1 if month starts on Sat */
          <div className="flex-1 flex flex-col justify-between min-h-0">
            {/* Month Slider Header */}
            <div className="flex items-center justify-between px-1 mb-1 text-xs">
              <button
                type="button"
                onClick={prevMonth}
                className="p-0.5 rounded tint-text hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                title={isId ? 'Bulan Sebelumnya' : 'Previous Month'}
              >
                <AngleLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-semibold text-[11px] tracking-tight text-foreground">
                {monthNames[viewMonth]} {viewYear} H
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-0.5 rounded tint-text hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                title={isId ? 'Bulan Berikutnya' : 'Next Month'}
              >
                <AngleRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 text-center gap-y-0.5 mb-1">
              {daysShort.map((d, i) => (
                <span key={i} className="text-[9px] font-mono tint-text font-semibold uppercase">
                  {d}
                </span>
              ))}
            </div>

            {/* Fixed 5-Row Calendar Grid */}
            <div className="grid grid-cols-7 gap-x-1 gap-y-1 text-center items-center justify-items-center">
              {gridCells.map((cell, cellIdx) => {
                const dayNum = cell.dayNum;
                const colIndex = cellIdx % 7;

                if (!dayNum) {
                  return <div key={`empty-${cellIdx}`} className="h-4.5 w-5" />;
                }

                const isToday =
                  viewYear === today.year &&
                  viewMonth === today.monthIndex &&
                  dayNum === today.day;

                const details = getDayDetails(dayNum, viewMonth);
                const hasNonWeeklyEvent = details.nonWeeklyEvents.length > 0;
                const isHoliday = details.isHoliday;
                const isColoredDay = isToday || hasNonWeeklyEvent || isHoliday;

                const getTooltipText = () => {
                  const parts: string[] = [];
                  if (isToday) parts.push(isId ? 'Hari Ini' : 'Today');
                  if (hasNonWeeklyEvent) parts.push(details.nonWeeklyEvents.join(', '));
                  return parts.join(' • ');
                };

                const isClicked = clickedTooltip?.day === dayNum;

                // Smart Popup Position based on column index
                let popoverPositionClass = 'left-1/2 -translate-x-1/2';
                if (colIndex <= 1) {
                  popoverPositionClass = 'left-0 translate-x-0';
                } else if (colIndex >= 5) {
                  popoverPositionClass = 'right-0 left-auto translate-x-0';
                }

                // Theme color matching date color (Primary Accent for Today & Events)
                const tooltipThemeClass = isHoliday
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/40'
                  : 'bg-primary/10 text-primary border-primary/30';

                return (
                  <div key={dayNum} className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isColoredDay) {
                          setClickedTooltip(null);
                          return;
                        }
                        if (clickedTooltip?.day === dayNum) {
                          setClickedTooltip(null);
                        } else {
                          setClickedTooltip({
                            day: dayNum,
                            info: getTooltipText(),
                            isHoliday,
                          });
                        }
                      }}
                      className={`relative h-4.5 w-5 text-[10px] font-mono flex flex-col items-center justify-center transition-colors ${
                        isToday
                          ? 'border border-primary text-primary bg-primary/10 font-bold rounded-full h-4.5 w-4.5 cursor-pointer'
                          : isHoliday
                          ? 'text-amber-500 font-semibold hover:text-amber-400 cursor-pointer'
                          : hasNonWeeklyEvent
                          ? 'text-primary font-semibold hover:text-primary/80 cursor-pointer'
                          : 'text-foreground cursor-default'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {(hasNonWeeklyEvent || isHoliday) && !isToday && (
                        <span
                          className={`absolute -bottom-0.5 h-1 w-1 rounded-full ${
                            isHoliday ? 'bg-amber-500' : 'bg-primary'
                          }`}
                        />
                      )}
                    </button>

                    {/* Clean Floating Mini Popover Tooltip */}
                    {isClicked && (
                      <div
                        ref={tooltipRef}
                        className={`absolute bottom-full mb-1.5 z-30 whitespace-nowrap border text-[9.5px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-xs animate-in fade-in zoom-in-95 duration-150 ${popoverPositionClass} ${tooltipThemeClass}`}
                      >
                        <span>{clickedTooltip.info}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
