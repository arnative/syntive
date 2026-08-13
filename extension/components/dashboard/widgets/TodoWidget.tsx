import * as React from 'react';
import { CheckSquare, Plus, Trash2 } from 'reicon-react';
import { DashboardCard } from '../DashboardCard';
import { Checkbox } from '@/components/ui/checkbox';
import { HoverAction } from '@/components/ui/hover-action';
import { Input } from '@/components/ui/input';
import { useLocalStorageState } from '@/lib/hooks';
import { useTranslation } from '@/lib/i18n';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export function TodoWidget({ dragHandle }: { dragHandle: React.ReactNode }) {
  const { t } = useTranslation();
  const [todos, setTodos] = useLocalStorageState<TodoItem[]>('syntive.todoItems', [
    { id: '1', text: 'Periksa bookmark penting', completed: true },
    { id: '2', text: 'Singkronkan perangkat', completed: false },
  ]);
  const [inputText, setInputText] = React.useState('');

  const handleAdd = () => {
    if (!inputText.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now().toString(), text: inputText.trim(), completed: false },
    ]);
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <DashboardCard
      title={t('widgetTodoTitle')}
      icon={<CheckSquare className="h-3.5 w-3.5 tint-text shrink-0" weight="Filled" />}
      headerBadge={`${completedCount}/${todos.length}`}
      headerAction={dragHandle}
      minHeight="h-[234px]"
    >
      <div className="flex-1 flex flex-col justify-between pt-0 h-full space-y-2">
        <div className="flex items-center gap-1.5">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={t('addTaskPlaceholder')}
            className="h-8 text-xs bg-background border-border focus:border-ring placeholder:text-muted-foreground rounded-xl"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="h-8 w-8 rounded-xl bg-accent border border-border hover:bg-accent/80 transition-colors flex items-center justify-center shrink-0 cursor-pointer text-xs font-semibold"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="card-inner-box flex-1 overflow-y-auto max-h-32 p-1.5 divide-y divide-border/40 select-none">
          {todos.length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-6">
              {t('noTasks')}
            </p>
          ) : (
            todos.map((item) => (
              <div
                key={item.id}
                className="group/item relative flex items-center justify-between h-8.5 px-2.5 py-1 rounded-lg hover:bg-accent/40 transition-colors text-xs select-none"
              >
                <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1 group-hover/item:pr-8">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleTodo(item.id)}
                  />
                  <span
                    className={`truncate text-xs ${
                      item.completed
                        ? 'line-through text-muted-foreground opacity-60'
                        : 'text-foreground font-normal'
                    }`}
                  >
                    {item.text}
                  </span>
                </label>
                <HoverAction
                  icon={<Trash2 className="h-3 w-3" />}
                  onClick={() => removeTodo(item.id)}
                  title={t('deleteBookmarkTooltip')}
                  className="right-2 hover:text-destructive"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardCard>
  );
}