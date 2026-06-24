import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, ChevronRight, Sparkles, Pencil } from 'lucide-react';
import { Task, Exam } from '../types';
import { motion } from 'motion/react';
import { differenceInSeconds, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface UrgentCountdownProps {
  tasks: Task[];
  exams: Exam[];
  onToggleComplete: (id: string, type: 'task' | 'exam') => void;
  onEdit?: (id: string, type: 'task' | 'exam') => void;
}

export const UrgentCountdown = ({ tasks, exams, onToggleComplete, onEdit }: UrgentCountdownProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Find all uncompleted items
  const activeItems = [
    ...tasks.map(t => ({ ...t, itemType: 'task' as const })),
    ...exams.map(e => ({ ...e, itemType: 'exam' as const }))
  ].filter(item => !item.completed);

  if (activeItems.length === 0) return null;

  // Sort by deadline ascending
  const sortedItems = [...activeItems].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const urgentItem = sortedItems[0];
  const dueDate = new Date(urgentItem.dueDate);
  const diffSecs = differenceInSeconds(dueDate, now);

  // Formatting strings
  const getCountdownString = () => {
    if (diffSecs <= 0) {
      return "⚠️ Sudah melewati tenggat!";
    }
    
    const days = Math.floor(diffSecs / (3600 * 24));
    const hours = Math.floor((diffSecs % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffSecs % 3600) / 60);
    const seconds = diffSecs % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} Hari`);
    if (hours > 0 || days > 0) parts.push(`${hours} Jam`);
    parts.push(`${minutes} Menit`);
    parts.push(`${seconds} Detik`);

    return `Sisa ${parts.join(' ')} lagi!`;
  };

  // Color scheme based on urgency
  let bgClass = "bg-emerald-50 border-emerald-100 text-emerald-900";
  let badgeClass = "bg-emerald-500 text-white";
  let iconColor = "text-emerald-500";
  let secondsRemaining = diffSecs;

  if (secondsRemaining <= 0) {
    bgClass = "bg-rose-50 border-rose-100 text-rose-950";
    badgeClass = "bg-rose-600 text-white animate-pulse";
    iconColor = "text-rose-600 font-bold";
  } else if (secondsRemaining < 24 * 3600) {
    // Less than 24 hours
    bgClass = "bg-red-50 border-red-100 text-red-950 ring-1 ring-red-200/50";
    badgeClass = "bg-red-600 text-white animate-bounce";
    iconColor = "text-red-600";
  } else if (secondsRemaining < 72 * 3600) {
    // Less than 3 days
    bgClass = "bg-amber-50 border-amber-100 text-amber-950";
    badgeClass = "bg-amber-500 text-slate-950 font-bold";
    iconColor = "text-amber-600";
  } else {
    // General upcoming
    bgClass = "bg-brand-50 border-brand-100 text-brand-950";
    badgeClass = "bg-brand-600 text-white";
    iconColor = "text-brand-600";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-[2rem] border ${bgClass} flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/80 backdrop-blur-xs shrink-0 ${iconColor} border border-slate-100 shadow-xs`}>
          {secondsRemaining <= 24 * 3600 ? <AlertTriangle size={22} className="animate-pulse" /> : <Clock size={22} />}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-950 text-white px-2.5 py-0.5 rounded-full font-mono">
              {urgentItem.itemType === 'exam' ? 'Ujian terdekat' : 'Tugas darurat'}
            </span>
            <span className="text-xs font-bold text-slate-500">{urgentItem.course}</span>
          </div>
          <h4 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-1.5 leading-tight">
            {urgentItem.title}
          </h4>
          <span className="text-xs text-slate-500 mt-1 block">
            Tenggat: <span className="font-semibold text-slate-800">{new Date(urgentItem.dueDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span> ({formatDistanceToNow(dueDate, { addSuffix: true, locale: id })})
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto self-end md:self-auto">
        <div className={`px-4 py-2 rounded-xl text-xs font-bold font-mono text-center shadow-xs flex items-center justify-center gap-1.5 ${badgeClass}`}>
          <Clock size={13} />
          {getCountdownString()}
        </div>
        
        {onEdit && (
          <button
            onClick={() => onEdit(urgentItem.id, urgentItem.itemType)}
            className="bg-white text-slate-800 border border-slate-200 hover:bg-slate-55 transition-all font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Edit Item Tenggat"
          >
            <Pencil size={14} />
            Edit
          </button>
        )}

        <button
          onClick={() => onToggleComplete(urgentItem.id, urgentItem.itemType)}
          className="bg-slate-950 text-white hover:bg-slate-800 transition-all font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
        >
          <CheckCircle size={14} />
          Selesaikan
        </button>
      </div>
    </motion.div>
  );
};
