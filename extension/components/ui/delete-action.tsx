import * as React from 'react';
import { Trash2 } from 'reicon-react';
import { cn } from '@/lib/utils';

interface DeleteActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconSize?: string;
}

/**
 * Reusable hover-to-show delete button. Appears on group-hover with a
 * tint-foreground default that turns destructive on hover.
 * Used by FolderBookmarkRow, TodoList, and any inner-card delete actions.
 */
export const DeleteAction = React.forwardRef<HTMLButtonElement, DeleteActionProps>(
  ({ iconSize = 'h-3.5 w-3.5', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 hover:opacity-100 transition-opacity p-0.5 ml-1 shrink-0 cursor-pointer',
          className
        )}
        {...props}
      >
        <Trash2 className={iconSize} weight="Filled" />
      </button>
    );
  }
);
DeleteAction.displayName = 'DeleteAction';
