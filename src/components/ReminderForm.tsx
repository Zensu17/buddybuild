import React, { useState } from 'react';
import { Plus, X, Calendar, Clock, AlertCircle, BookOpen, MapPin } from 'lucide-react';
import { Priority, ItemType, Task, Exam } from '../types';

interface ReminderFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'type' | 'uid'>) => void;
  onAddExam: (exam: Omit<Exam, 'id' | 'completed' | 'type' | 'uid'>) => void;
  onClose: () => void;
}

export const ReminderForm = ({ onAddTask, onAddExam, onClose }: ReminderFormProps) => {
  const [type, setType] = useState<ItemType>('task');
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reminderTime, setReminderTime] = useState('60'); // minutes
  const [priority, setPriority] = useState<Priority>('medium');
  const [location, setLocation] = useState('');

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

    if (type === 'task') {
      onAddTask(data);
    } else {
      onAddExam(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-brand-600 text-white">
          <h3 className="text-xl font-display font-bold">Add New Reminder</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('task')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'task' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
            >
              Task/Assignment
            </button>
            <button
              type="button"
              onClick={() => setType('exam')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'exam' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
            >
              Exam/Quiz
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
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
            Create Reminder
          </button>
        </form>
      </div>
    </div>
  );
};
