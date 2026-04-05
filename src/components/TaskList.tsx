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
        <div className="text-center py-12 glass rounded-[2rem] border-dashed border-2 border-slate-200">
          <CheckCircle2 size={48} className="mx-auto mb-3 text-brand-200" />
          <p className="text-slate-400 font-medium italic">No reminders yet. Add one to stay productive!</p>
        </div>
      ) : (
        sortedTasks.map((item) => (
          <div
            key={item.id}
            className={cn(
              "group flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all duration-500 card-hover",
              item.completed 
                ? "bg-slate-50/50 border-slate-100 opacity-60" 
                : "bg-white border-slate-100 shadow-sm"
            )}
          >
            <button
              onClick={() => onToggle(item.id)}
              className={cn(
                "shrink-0 transition-all duration-300 transform hover:scale-110",
                item.completed ? "text-brand-500" : "text-slate-200 hover:text-brand-400"
              )}
            >
              {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {item.type === 'exam' && <GraduationCap size={16} className="text-red-500" />}
                <h4 className={cn(
                  "font-bold text-slate-800 truncate transition-all duration-300",
                  item.completed && "line-through text-slate-400"
                )}>
                  {item.title}
                </h4>
                {item.priority === 'high' && !item.completed && (
                  <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    <AlertCircle size={10} />
                    High
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg">
                  {item.course}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  {format(new Date(item.dueDate), 'MMM d, HH:mm')}
                </span>
                {item.type === 'exam' && (item as Exam).location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    {(item as Exam).location}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onDelete(item.id)}
              className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))
      )}
    </div>
  );
};
