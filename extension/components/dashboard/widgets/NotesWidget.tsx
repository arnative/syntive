import * as React from 'react';
import { FileText } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { useTranslation } from '@/lib/i18n';

export function NotesWidget({ dragHandle }: { dragHandle: React.ReactNode }) {
  const { t } = useTranslation();
  const [notes, setNotes] = React.useState(() => {
    return localStorage.getItem('syntive.quickNotes') || '';
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem('syntive.quickNotes', val);
  };

  return (
    <DashboardCard
      title={t('widgetNotesTitle')}
      icon={<FileText className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerBadge={t('autoSavedBadge')}
      headerAction={dragHandle}
      minHeight="h-[234px]"
    >
      <div className="flex-1 flex flex-col pt-0 h-full">
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder={t('notesPlaceholder')}
          className="card-inner-box w-full flex-1 p-3 text-xs text-foreground placeholder:text-tint-foreground focus:outline-none focus:border-ring resize-none min-h-35"
        />
      </div>
    </DashboardCard>
  );
}