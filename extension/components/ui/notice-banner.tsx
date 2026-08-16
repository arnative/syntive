import * as React from 'react';
import { CheckCircle } from 'reicon-react';

// Green success notice banner shared by the Trash and Management views.
export function SuccessNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold animate-in fade-in duration-200">
      <CheckCircle className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
