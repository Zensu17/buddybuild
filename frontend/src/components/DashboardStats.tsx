import React, { useState, useEffect } from 'react';
import { CourseGrade, Task, Exam } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, CartesianGrid
} from 'recharts';
import { TrendingUp, Clock, BookOpen, CheckSquare, Plus, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buddybuildApi, StudyLog } from '../services/buddybuildApi';

interface DashboardStatsProps {
  grades: CourseGrade[];
  tasks: Task[];
  exams: Exam[];
}

export const DashboardStats = ({ grades, tasks, exams }: DashboardStatsProps) => {
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [manualCourse, setManualCourse] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [showAddLog, setShowAddLog] = useState(false);

  useEffect(() => {
    buddybuildApi.getStudyLogs()
      .then((res) => {
        if (res.success) setStudyLogs(res.data);
      })
      .catch((err) => console.error('Failed to load study logs', err));
  }, []);

  const handleAddStudyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCourse || !manualMinutes) return;

    const mins = parseInt(manualMinutes) || 0;
    if (mins <= 0) return;

    try {
      const res = await buddybuildApi.createStudyLog(manualCourse, mins);
      if (res.success) {
        setStudyLogs((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create study log', err);
    }

    setManualCourse('');
    setManualMinutes('');
    setShowAddLog(false);
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await buddybuildApi.deleteStudyLog(id);
      setStudyLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (err) {
      console.error('Failed to delete study log', err);
    }
  };

  // ==========================================
  // CHART 1: GPA Trend Semester (Sem ke Sem)
  // ==========================================
  const getGpaTrendData = () => {
    // Group grades by semester (1-8)
    const semesterPoints: Record<number, { points: number; credits: number }> = {};
    
    // Seed semesters with 0 to ensure display
    for (let i = 1; i <= 4; i++) {
      semesterPoints[i] = { points: 0, credits: 0 };
    }

    grades.forEach(g => {
      const sem = g.semester || 1;
      if (!semesterPoints[sem]) {
        semesterPoints[sem] = { points: 0, credits: 0 };
      }
      semesterPoints[sem].points += g.grade * g.credits;
      semesterPoints[sem].credits += g.credits;
    });

    const chartData = Object.keys(semesterPoints).map(key => {
      const semNum = parseInt(key);
      const info = semesterPoints[semNum];
      const semesterGpa = info.credits > 0 ? parseFloat((info.points / info.credits).toFixed(2)) : 0;
      return {
        semester: `Sem ${semNum}`,
        gpa: semesterGpa,
        credits: info.credits
      };
    });

    // If all are 0 GPA and no grades are added, inject simple linear progression helper info
    const hasAnyGrades = grades.length > 0;
    if (!hasAnyGrades) {
      return [
        { semester: 'Sem 1', gpa: 3.20, credits: 18 },
        { semester: 'Sem 2', gpa: 3.45, credits: 21 },
        { semester: 'Sem 3', gpa: 3.62, credits: 20 },
        { semester: 'Sem 4', gpa: 3.58, credits: 18 }
      ];
    }

    return chartData.sort((a,b) => a.semester.localeCompare(b.semester));
  };

  // ==========================================
  // CHART 2: Study Allocation Hours (Total Minutes per Course)
  // ==========================================
  const getStudyAllocationData = () => {
    const accum: Record<string, number> = {};
    studyLogs.forEach(log => {
      const name = log.course.trim();
      accum[name] = (accum[name] || 0) + log.minutes;
    });

    const data = Object.keys(accum).map(course => ({
      course,
      hours: parseFloat((accum[course] / 60).toFixed(1)),
      minutes: accum[course]
    }));

    if (data.length === 0) {
      return [
        { course: 'Kalkulus', hours: 3.5, minutes: 210 },
        { course: 'Struktur Data', hours: 4.8, minutes: 288 }
      ];
    }
    return data.sort((a, b) => b.minutes - a.minutes);
  };

  // ==========================================
  // CHART 3: Task & Exam Status Completion compliance
  // ==========================================
  const getTaskComplianceData = () => {
    let completedCount = 0;
    let overdueCount = 0;
    let upcomingCount = 0;

    const allItems = [...tasks, ...exams];

    allItems.forEach(item => {
      if (item.completed) {
        completedCount++;
      } else {
        const isOverdue = new Date(item.dueDate).getTime() < Date.now();
        if (isOverdue) overdueCount++;
        else upcomingCount++;
      }
    });

    // Default simulation data if nothing added
    if (allItems.length === 0) {
      return [
        { name: 'Selesai 🌲', value: 8, color: '#10b981' },
        { name: 'Aktif 📚', value: 4, color: '#0ea5e9' },
        { name: 'Terlambat ⚠️', value: 1, color: '#ef4444' }
      ];
    }

    return [
      { name: 'Selesai 🌲', value: completedCount, color: '#10b981' },
      { name: 'Aktif 📚', value: upcomingCount, color: '#0ea5e9' },
      { name: 'Terlambat ⚠️', value: overdueCount, color: '#ef4444' }
    ].filter(segment => segment.value > 0);
  };

  const gpaData = getGpaTrendData();
  const allocationData = getStudyAllocationData();
  const complianceData = getTaskComplianceData();

  return (
    <div className="space-y-8">
      {/* Upper header statistics overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-[2.2rem] border border-indigo-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Proyeksi IPK Terakhir</span>
            <p className="text-2xl font-extrabold text-indigo-950 mt-0.5">
              {grades.length > 0 
                ? (grades.reduce((a,c) => a + c.grade * c.credits, 0) / (grades.reduce((a,c) => a + c.credits, 0) || 1)).toFixed(2)
                : '3.46 (Estimasi)'
              }
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-[2.2rem] border border-emerald-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-100 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Durasi Belajar Terkumpul</span>
            <p className="text-2xl font-extrabold text-emerald-950 mt-0.5">
              {parseFloat((studyLogs.reduce((a,c) => a + c.minutes, 0) / 60).toFixed(1))} Jam
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-[2.2rem] border border-amber-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-amber-100 shrink-0">
            <CheckSquare size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rasio Penyelesaian Tugas</span>
            <p className="text-2xl font-extrabold text-amber-950 mt-0.5">
              {tasks.length + exams.length > 0
                ? `${Math.round(([...tasks, ...exams].filter(i=>i.completed).length / ([...tasks, ...exams].length || 1)) * 100)}%`
                : '84% (Estimasi)'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: LINE CHART TREND GPA */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-150 shadow-xs flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-500" />
                Tren IPK Sem-ke-Sem
              </h4>
              <p className="text-xs text-slate-400">Kemajuan indeks prestasi kumulatif Anda setiap semester</p>
            </div>
            {grades.length === 0 && (
              <span className="bg-brand-50 text-brand-600 px-2.5 py-1 text-[9px] font-bold rounded-lg tracking-widest uppercase">SIMULASI</span>
            )}
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaData} margin={{ left: -10, top: 10, right: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[2.0, 4.0]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '1rem', border: 'none' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: 11 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="gpa" 
                  name="IPK Smt"
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  dot={{ r: 6, stroke: '#818cf8', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: STUDY TIME ALLOCATION */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-150 shadow-xs flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Clock size={18} className="text-emerald-500" />
                Alokasi Sesi Belajar (Jam)
              </h4>
              <p className="text-xs text-slate-400">Total durasi fokus yang dihabiskan untuk mata kuliah</p>
            </div>
            <button
              onClick={() => setShowAddLog(true)}
              className="bg-brand-50 text-brand-600 hover:bg-brand-100 p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              Log Belajar
            </button>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationData} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="course" type="category" stroke="#94a3b8" fontSize={11} width={80} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '1rem', border: 'none' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="hours" name="Durasi (Jam)" radius={[0, 8, 8, 0]}>
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: TASK COMPLIANCE PIE CHART */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-150 shadow-xs flex flex-col h-[340px]">
          <div>
            <h4 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              <CheckSquare size={18} className="text-amber-500" />
              Kepatuhan Tugas & Ujian
            </h4>
            <p className="text-xs text-slate-400">Rasio penanganan tenggat waktu tugas sekolah</p>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center min-h-0 w-full gap-4 mt-2">
            <div className="w-full sm:w-1/2 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: '#0f172a', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-3 px-4">
              {complianceData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-800 text-sm font-bold">{item.value} Item</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STUDY LOGGER LOGS TABLE LIST */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-150 shadow-xs flex flex-col h-[340px]">
          <h4 className="font-extrabold text-base text-slate-800 flex items-center gap-2 mb-2">
            <BookOpen size={18} className="text-violet-500" />
            Riwayat Sesi Belajar Mandiri
          </h4>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {studyLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between transition-colors shadow-xs group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-50 text-violet-600 border border-violet-100 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 leading-tight">{log.course}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold bg-violet-100 text-violet-800 px-2.5 py-1 rounded-lg">
                    {log.minutes} Menit
                  </span>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {studyLogs.length === 0 && (
              <div className="text-center py-16 text-slate-400 italic text-xs">Riwayat masih kosong. Mulai catat waktu belajar Anda!</div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL / BOTTOM SHEET FOR ADDING MANUAL LOG */}
      <AnimatePresence>
        {showAddLog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm border border-slate-100 shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleAddStudyLog} className="flex flex-col">
                <div className="p-7 bg-brand-600 text-white">
                  <h4 className="text-lg font-bold font-display">Log Sesi Belajar Mandiri</h4>
                  <p className="text-brand-100 text-xs mt-1">Catat berapa menit Anda memfokuskan pikiran pada subjek atau mata kuliah tertentu hari ini.</p>
                </div>

                <div className="p-7 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mata Kuliah / Subjek</label>
                    <input 
                      type="text"
                      required
                      value={manualCourse}
                      onChange={(e) => setManualCourse(e.target.value)}
                      placeholder="Contoh: Kalkulus, Algoritma, UI Desain"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-300 text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Durasi Belajar (Menit)</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      placeholder="Contoh: 45, 60, 120"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-300 text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-7 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddLog(false)}
                    className="flex-1 py-3 bg-white text-slate-600 border border-slate-250 rounded-xl font-bold hover:bg-slate-100 transition-all text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-md shadow-brand-100 text-xs cursor-pointer flex justify-center items-center gap-1"
                  >
                    Simpan Sesi
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
