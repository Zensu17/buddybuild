import React, { useState } from 'react';
import { Plus, X, Calendar, Clock, AlertCircle, BookOpen, MapPin } from 'lucide-react';
import { Priority, ItemType, Task, Exam } from '../types';
import { format } from 'date-fns';

interface ReminderFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'type' | 'uid'>) => void;
  onAddExam: (exam: Omit<Exam, 'id' | 'completed' | 'type' | 'uid'>) => void;
  onUpdateTask?: (id: string, task: Partial<Task>) => void;
  onUpdateExam?: (id: string, exam: Partial<Exam>) => void;
  editingItem?: Task | Exam | null;
  onClose: () => void;
}

export const ReminderForm = ({ onAddTask, onAddExam, onUpdateTask, onUpdateExam, editingItem, onClose }: ReminderFormProps) => {
  const [type, setType] = useState<ItemType>(editingItem?.type || 'task');
  const [title, setTitle] = useState(editingItem?.title || '');
  const [course, setCourse] = useState(editingItem?.course || '');
  const [date, setDate] = useState(() => {
    if (editingItem?.dueDate) {
      try {
        return format(new Date(editingItem.dueDate), 'yyyy-MM-dd');
      } catch (e) {
        return '';
      }
    }
    return '';
  });
  const [time, setTime] = useState(() => {
    if (editingItem?.dueDate) {
      try {
        return format(new Date(editingItem.dueDate), 'HH:mm');
      } catch (e) {
        return '';
      }
    }
    return '';
  });
  const [reminderTime, setReminderTime] = useState(editingItem?.reminderTime ? String(editingItem.reminderTime) : '60'); // minutes
  const [priority, setPriority] = useState<Priority>(editingItem?.priority || 'medium');
  const [location, setLocation] = useState(() => {
    if (editingItem && 'location' in editingItem) {
      return (editingItem as Exam).location || '';
    }
    return '';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !course || !date || !time) return;

    const dueDate = new Date(`${date}T${time}`).toISOString();
    const data = {
      title,
      course,
      dueDate,
      reminderTime: parseInt(reminderTime),
      priority,
      ...(type === 'exam' ? { location } : {})
    };

    if (editingItem) {
      if (type === 'task') {
        onUpdateTask?.(editingItem.id, data);
      } else {
        onUpdateExam?.(editingItem.id, data);
      }
    } else {
      if (type === 'task') {
        onAddTask(data);
      } else {
        onAddExam(data);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-brand-600 text-white">
          <h3 className="text-xl font-display font-bold">
            {editingItem ? 'Edit Reminder / Tugas' : 'Tambah Pengingat Baru'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!editingItem && (
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setType('task')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'task' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
              >
                Tugas / Proyek
              </button>
              <button
                type="button"
                onClick={() => setType('exam')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'exam' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
              >
                Ujian / Kuis
              </button>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Final Project Report"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Course</label>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. CS101"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              />
            </div>

            {type === 'exam' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hall A, Room 302"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Deadline Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Reminder (mins before)</label>
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="1440">1 day</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 mt-4"
          >
            {editingItem ? 'Simpan Perubahan' : 'Buat Pengingat'}
          </button>
        </form>
      </div>
    </div>
  );
};
