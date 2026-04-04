import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, Trash2, GraduationCap, MapPin } from 'lucide-react';
import { Task, Exam } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: (Task | Exam)[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskList = ({ tasks, onToggle, onDelete }: TaskListProps) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-3">
      {sortedTasks.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <CheckCircle2 size={48} className="mx-auto mb-2 opacity-20" />
          <p>No reminders yet. Add one to stay productive!</p>
        </div>
      ) : (
        sortedTasks.map((item) => (
          <div
            key={item.id}
            className={cn(
              "group flex items-center gap-4 p-4 rounded-xl border transition-all",
              item.completed 
                ? "bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 shadow-sm"
            )}
          >
            <button
              onClick={() => onToggle(item.id)}
              className={cn(
                "shrink-0 transition-colors",
                item.completed ? "text-brand-500" : "text-slate-300 dark:text-slate-600 hover:text-brand-400 dark:hover:text-brand-500"
              )}
            >
              {item.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {item.type === 'exam' && <GraduationCap size={14} className="text-brand-500" />}
                <h4 className={cn(
                  "font-medium truncate dark:text-white",
                  item.completed && "line-through text-slate-500 dark:text-slate-500"
                )}>
                  {item.title}
                </h4>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">
                  {item.course}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {format(new Date(item.dueDate), 'MMM d, HH:mm')}
                </span>
                {item.type === 'exam' && (item as Exam).location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {(item as Exam).location}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Reminder: {item.reminderTime}m before
                </span>
                {item.priority === 'high' && (
                  <span className="flex items-center gap-1 text-red-500 font-medium">
                    <AlertCircle size={12} />
                    High
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onDelete(item.id)}
              className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))
      )}
    </div>
  );
};
