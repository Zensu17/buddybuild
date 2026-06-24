import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar, 
  CheckSquare, 
  Bell, 
  AlertTriangle, 
  Sparkles,
  Search,
  BookOpen,
  CheckCircle,
  Database,
  Clock,
  Layers,
  GraduationCap,
  TrendingUp,
  Lightbulb,
  Activity,
  Sliders,
  HelpCircle,
  MapPin,
  Check
} from 'lucide-react';
import { ClassSession, Task, Exam, AuditLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  schedule: ClassSession[];
  tasks: Task[];
  exams: Exam[];
  grades: any[];
  flashcardSets: any[];
  auditLogs?: AuditLog[];
  onAddSchedule: () => void;
  onEditSchedule: (session: ClassSession) => void;
  onDeleteSchedule: (id: string) => void;
  onAddReminder: () => void;
  onEditReminder: (item: any) => void;
  onDeleteReminder: (id: string, type: 'task' | 'exam') => void;
  onToggleReminder: (id: string, type: 'task' | 'exam') => void;
  onBulkAddPack?: (type: 'akademik' | 'remedial') => void;
  onClearCompletedTasks?: () => void;
  onAddAuditLog?: (log: Omit<AuditLog, 'id' | 'timestamp'>) => Promise<void>;
  currentAdminName?: string;
}

export const AdminDashboard = ({
  schedule,
  tasks,
  exams,
  grades,
  flashcardSets,
  auditLogs = [],
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
  onToggleReminder,
  onBulkAddPack,
  onClearCompletedTasks,
  onAddAuditLog,
  currentAdminName,
}: AdminDashboardProps) => {
  const [subTab, setSubTab] = useState<'schedule' | 'reminders' | 'analytics'>('schedule');

  const [admSearch, setAdmSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const allReminders = [...tasks, ...exams];

  const filteredSchedule = schedule.filter(s => 
    s.name.toLowerCase().includes(admSearch.toLowerCase()) ||
    s.room.toLowerCase().includes(admSearch.toLowerCase())
  );

  const filteredReminders = allReminders.filter(r => 
    r.title.toLowerCase().includes(admSearch.toLowerCase()) ||
    r.course.toLowerCase().includes(admSearch.toLowerCase())
  );

  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // --- ACADEMIC STRESS & LOAD COMPUTATIONS ---
  // Count classes per day to detect heavy days
  const classCountByDay = Array(7).fill(0);
  schedule.forEach(s => {
    if (s.day >= 0 && s.day < 7) {
      classCountByDay[s.day]++;
    }
  });

  const heavyDays = DAYS.filter((day, index) => classCountByDay[index] >= 3);
  
  // Calculate Task Stress Index
  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const highPriorityActiveCount = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const completedTaskCount = tasks.filter(t => t.completed).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedTaskCount / tasks.length) * 100) : 0;
  const finalPercentage = Math.min(completionPercentage, 100);

  let burdenLevel: 'Aman' | 'Sedang' | 'Tinggi' = 'Aman';
  let levelColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (activeTasksCount >= 8 || highPriorityActiveCount >= 3 || heavyDays.length >= 2) {
    burdenLevel = 'Tinggi';
    levelColor = 'text-rose-600 bg-rose-50 border-rose-100';
  } else if (activeTasksCount >= 4 || heavyDays.length >= 1) {
    burdenLevel = 'Sedang';
    levelColor = 'text-amber-600 bg-amber-50 border-amber-100 font-bold';
  }

  const filteredLogs = auditLogs
    .filter(log => {
      const matchSearch = log.targetName.toLowerCase().includes(auditSearch.toLowerCase()) || 
        log.adminName.toLowerCase().includes(auditSearch.toLowerCase());
      const matchAction = actionFilter === 'all' || log.action === actionFilter;
      return matchSearch && matchAction;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Admin Title Block */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pr-10 pointer-events-none">
          <ShieldCheck size={260} className="text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-305 border border-amber-400/30 font-bold text-[10px] uppercase tracking-widest">
            <ShieldCheck size={14} className="text-amber-400 animate-pulse" />
            Konsol Pengurus Kelas (Admin BuddyBuild)
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight leading-off">
            Pengelola Jadwal <span className="text-amber-305">& Tugas Kuliah</span>
          </h1>
          <p className="text-slate-350 text-xs md:text-sm leading-relaxed font-medium">
            Selamat datang di Dashboard Admin BuddyBuild. Di sini, Anda memiliki akses penuh untuk merancang jadwal perkuliahan, mengatur tenggat tugas/kuis, serta menganalisis beban belajar mahasiswa agar semua teman seangkatan tetap selaras dan terinformasi.
          </p>
        </div>
      </div>

      {/* Overview Cards (Row of 5 stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass p-5 rounded-3xl border border-slate-100 flex items-center gap-4 bg-white shadow-2xs hover:border-brand-200 transition-all hover:shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Jadwal</p>
            <p className="text-xl font-extrabold font-display text-slate-900 mt-0.5">{schedule.length}</p>
          </div>
        </div>

        <div className="glass p-5 rounded-3xl border border-slate-100 flex items-center gap-4 bg-white shadow-2xs hover:border-brand-200 transition-all hover:shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tugas Aktif</p>
            <p className="text-xl font-extrabold font-display text-slate-900 mt-0.5">{tasks.length}</p>
          </div>
        </div>

        <div className="glass p-5 rounded-3xl border border-slate-100 flex items-center gap-4 bg-white shadow-2xs hover:border-brand-200 transition-all hover:shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ujian</p>
            <p className="text-xl font-extrabold font-display text-slate-900 mt-0.5">{exams.length}</p>
          </div>
        </div>

        <div className="glass p-5 rounded-3xl border border-slate-100 flex items-center gap-4 bg-white shadow-2xs hover:border-brand-200 transition-all hover:shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Set Flashcard</p>
            <p className="text-xl font-extrabold font-display text-slate-900 mt-0.5">{flashcardSets.length}</p>
          </div>
        </div>

        <div className="glass p-5 rounded-3xl border border-slate-100 col-span-2 lg:col-span-1 flex items-center gap-4 bg-white shadow-2xs hover:border-brand-200 transition-all hover:shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hari Kuliah Padat</p>
            <p className="text-xl font-extrabold font-display text-slate-900 mt-0.5">{heavyDays.length}</p>
          </div>
        </div>
      </div>
      {/* Main Grid: Control Panel + Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Main Control Panel */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-md space-y-6 bg-white">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit flex-wrap gap-1">
              <button
                onClick={() => { setSubTab('schedule'); setAdmSearch(''); }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  subTab === 'schedule' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar size={13} />
                Jadwal Kuliah ({schedule.length})
              </button>
              <button
                onClick={() => { setSubTab('reminders'); setAdmSearch(''); }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  subTab === 'reminders' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckSquare size={13} />
                Tenggat Akademik ({allReminders.length})
              </button>

              <button
                onClick={() => { setSubTab('analytics'); setAdmSearch(''); }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  subTab === 'analytics' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Activity size={13} />
                Analisis & Kapasitas
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
              {/* Search filter for Admin Console */}
              {subTab !== 'analytics' && (
                <div className="relative flex-1 md:w-40">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={admSearch}
                    onChange={(e) => setAdmSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-slate-800"
                  />
                </div>
              )}
              {/* Add buttons based on selected tab */}
              {subTab === 'schedule' ? (
                <button
                  onClick={onAddSchedule}
                  className="bg-slate-950 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                >
                  <Plus size={15} />
                  Tambah Jadwal
                </button>
              ) : subTab === 'reminders' ? (
                <button
                  onClick={onAddReminder}
                  className="bg-slate-950 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                >
                  <Plus size={15} />
                  Tambah Tenggat
                </button>
              ) : null}
            </div>
          </div>

          {/* Tab Views */}
          <div>
            {subTab === 'schedule' && (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mata Kuliah / Kelas</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hari</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jam Masuk - Selesai</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ruangan</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSchedule.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-sm text-slate-400">
                          Tidak ada jadwal perkuliahan yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredSchedule.map((session) => (
                        <tr key={session.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-4 font-bold text-slate-800 text-sm">
                            <div className="flex items-center gap-2.5">
                              <span 
                                className="w-3.5 h-3.5 rounded-full shrink-0 border-2 border-white shadow-sm" 
                                style={{ backgroundColor: session.color }}
                              />
                              {session.name}
                            </div>
                          </td>
                          <td className="p-4 text-xs font-bold text-brand-600">
                            <span className="bg-brand-50 px-2.5 py-1 rounded-lg">
                              {DAYS[session.day] || 'Lainnya'}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-600 font-mono">
                            {session.startTime} - {session.endTime}
                          </td>
                          <td className="p-4 text-xs">
                            <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-md uppercase">
                              {session.room}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEditSchedule(session)}
                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all cursor-pointer"
                                title="Edit Jadwal"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => onDeleteSchedule(session.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                title="Hapus Jadwal"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {subTab === 'reminders' && (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Judul Penugasan / Ujian</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mata Kuliah Kelompok</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Tenggat</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prioritas</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReminders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-sm text-slate-400">
                          Tidak ada penugasan atau ujian yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredReminders.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-4 font-bold text-slate-800 text-sm">
                            {item.title}
                          </td>
                          <td className="p-4 text-xs font-semibold text-slate-600">
                            {item.course}
                          </td>
                          <td className="p-4 text-xs font-bold">
                            {item.type === 'exam' ? (
                              <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">Ujian Akhir/Mid</span>
                            ) : (
                              <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Tugas Rumah</span>
                            )}
                          </td>
                          <td className="p-4 text-xs text-slate-600 font-mono">
                            {new Date(item.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-4 text-xs font-extrabold uppercase">
                            {item.priority === 'high' ? (
                              <span className="text-red-500">Tinggi</span>
                            ) : item.priority === 'medium' ? (
                              <span className="text-amber-500">Sedang</span>
                            ) : (
                              <span className="text-slate-400">Rendah</span>
                            )}
                          </td>
                          <td className="p-4 text-xs">
                            <button
                              onClick={() => onToggleReminder(item.id, item.type)}
                              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[10px] uppercase cursor-pointer ${
                                item.completed
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {item.completed ? 'Selesai ✓' : 'Belum Selesai'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEditReminder(item)}
                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all cursor-pointer"
                                title="Edit Tenggat"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => onDeleteReminder(item.id, item.type)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                title="Hapus Tenggat"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {subTab === 'analytics' && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-[11px] text-slate-500 font-medium">
                  📊 <strong>Laporan Kapasitas & Beban Akademik Terpadu:</strong> Evaluasi penyebaran studi mahasiswa berdasarkan jadwal dan reminders aktif untuk memulihkan kenyamanan belajar.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Distribusi Beban Jadwal Belajar */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Calendar size={14} className="text-brand-600" /> Distribusi Sesi Kuliah harian
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">Grafik Beban berdasarkan Sesi per Hari</p>
                    </div>

                    <div className="space-y-3">
                      {DAYS.map((dayName, dayIndex) => {
                        const count = schedule.filter(s => s.day === dayIndex).length;
                        const percent = Math.min((count / 5) * 100, 100);
                        return (
                          <div key={dayIndex} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span>{dayName}</span>
                              <span className="font-mono text-slate-500">{count} Sesi ({count >= 3 ? 'Padat ⚠️' : 'Normal'})</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${count >= 3 ? 'bg-rose-500' : count > 0 ? 'bg-brand-600' : 'bg-slate-350'}`}
                                style={{ width: count > 0 ? `${percent}%` : '4%' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card 2: Status Beban Tugas Dan Ujian (Pie-Style Ring Meter) */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <CheckSquare size={14} className="text-amber-500" /> Indeks Prioritas Penugasan
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">Visualisasi Klasifikasi Prioritas Tugas Aktif</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-1">
                      {/* SVG Ring Gauge */}
                      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="10" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * activeTasksCount) / 12} className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute text-center space-y-0.5">
                          <p className="text-xl font-extrabold text-slate-800 font-mono leading-none">{activeTasksCount}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">Aktif</p>
                        </div>
                      </div>

                      {/* Legend and stats */}
                      <div className="space-y-2 w-full max-w-xs">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Prioritas Tinggi
                          </span>
                          <span className="font-bold text-slate-900">{tasks.filter(t => !t.completed && t.priority === 'high').length} Tugas</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Prioritas Sedang
                          </span>
                          <span className="font-bold text-slate-900">{tasks.filter(t => !t.completed && t.priority === 'medium').length} Tugas</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Prioritas Rendah
                          </span>
                          <span className="font-bold text-slate-900">{tasks.filter(t => !t.completed && t.priority === 'low').length} Tugas</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/60 pt-3 text-[10px] font-bold text-slate-500">
                      ℹ️ Prioritas Tinggi memerlukan respons penyelesaian dalam 24 jam ke depan.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Audit Logs */}
        <div className="glass-panel p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-md space-y-4 bg-white h-full max-h-[720px] flex flex-col">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat Aktivitas Admin</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Log Audit Akademik</p>
            </div>
          </div>

          {/* Audit Logs Filter and Search */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Cari log audit..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500 font-medium text-slate-800"
              />
            </div>
            
            <div className="flex gap-1 overflow-x-auto py-1">
              {['all', 'add', 'edit', 'delete', 'toggle'].map((act) => (
                <button
                  key={act}
                  onClick={() => setActionFilter(act)}
                  className={`px-2 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider border cursor-pointer shrink-0 transition-colors ${
                    actionFilter === act 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' 
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {act === 'all' ? 'SEMUA' : act === 'add' ? 'TAMBAH' : act === 'edit' ? 'EDIT' : act === 'delete' ? 'HAPUS' : 'STATUS'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center justify-center gap-2 h-full">
                <Clock size={32} className="text-slate-300 stroke-[1.5px] animate-pulse" />
                <p className="font-medium">Tidak ada log pemantauan.</p>
                <p className="text-[10px] text-slate-350 px-4 leading-relaxed">Penyesuaian jadwal & reminders terkonfirmasi dicatat di sini sebagai bagian dari audit independen.</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const date = new Date(log.timestamp);
                const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                
                let actionText = '';
                let badgeStyle = '';
                if (log.action === 'add') {
                  actionText = 'ditambahkan';
                  badgeStyle = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                } else if (log.action === 'edit') {
                  actionText = 'diperbarui';
                  badgeStyle = 'bg-blue-50 text-blue-600 border border-blue-100';
                } else if (log.action === 'delete') {
                  actionText = 'dihapus';
                  badgeStyle = 'bg-rose-50 text-rose-600 border border-rose-100';
                } else if (log.action === 'toggle') {
                  actionText = 'diubah status';
                  badgeStyle = 'bg-purple-50 text-purple-600 border border-purple-100';
                }

                const displayType = log.targetType === 'jadwal' ? 'Mata Kuliah' : log.targetType === 'ujian' ? 'Ujian' : 'Reminders';

                return (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all flex flex-col gap-1.5 rounded-xl shadow-3xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeStyle}`}>
                        {displayType}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {dateStr}, {timeStr}
                      </span>
                    </div>
                    <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                      {displayType} <span className="font-extrabold text-slate-900">"{log.targetName}"</span> {actionText} oleh <span className="font-bold text-slate-900">{log.adminName}</span> pada {timeStr}.
                    </p>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
