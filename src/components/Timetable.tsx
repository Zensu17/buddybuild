import React from 'react';
import { Calendar, MapPin, Clock, Trash2 } from 'lucide-react';
import { ClassSession } from '../types';
import { cn } from '../lib/utils';

interface TimetableProps {
  schedule: ClassSession[];
  onDelete?: (id: string) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const Timetable = ({ schedule, onDelete }: TimetableProps) => {
  const today = new Date().getDay();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS.map((day, idx) => {
          const dayClasses = (schedule || []).filter(s => s.day === idx).sort((a, b) => a.startTime.localeCompare(b.startTime));
          const isToday = today === idx;

          return (
            <div key={day} className={cn(
              "flex flex-col gap-3",
              !isToday && "hidden md:flex"
            )}>
              <div className={cn(
                "text-xs font-bold uppercase tracking-wider mb-1 px-2",
                isToday ? "text-brand-600" : "text-slate-400"
              )}>
                {day}
              </div>
              
              <div className="space-y-3">
                {dayClasses.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No classes
                  </div>
                ) : (
                  dayClasses.map((session) => (
                    <div
                      key={session.id}
                      style={{ borderLeftColor: session.color }}
                      className="p-3 bg-white border border-slate-200 border-l-4 rounded-xl shadow-sm hover:shadow-md transition-all group relative"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="font-semibold text-sm text-slate-800 truncate flex-1">{session.name}</h5>
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(session.id)}
                            className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Clock size={12} />
                          {session.startTime} - {session.endTime}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <MapPin size={12} />
                          {session.room}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
