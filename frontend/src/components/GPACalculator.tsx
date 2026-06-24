import React, { useState, useRef } from 'react';
import { Plus, Calculator, Trash2, TrendingUp, GraduationCap, Pencil, X } from 'lucide-react';
import { CourseGrade } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface GPACalculatorProps {
  grades: CourseGrade[];
  onAdd: (grade: Omit<CourseGrade, 'id' | 'uid'>) => void;
  onUpdate?: (id: string, grade: Partial<CourseGrade>) => void;
  onDelete: (id: string) => void;
}

export const GPACalculator = ({ grades, onAdd, onUpdate, onDelete }: GPACalculatorProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('');
  const [semester, setSemester] = useState('1');
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalCredits = grades.reduce((acc, curr) => acc + curr.credits, 0);
  const totalPoints = grades.reduce((acc, curr) => acc + (curr.grade * curr.credits), 0);
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  // Group grades by semester for structured visual hierarchy
  const gradesBySemester: { [key: number]: CourseGrade[] } = {};
  grades.forEach(g => {
    const sem = g.semester || 1;
    if (!gradesBySemester[sem]) {
      gradesBySemester[sem] = [];
    }
    gradesBySemester[sem].push(g);
  });

  const sortedSemesters = Object.keys(gradesBySemester)
    .map(Number)
    .sort((a, b) => a - b);

  const startEdit = (courseGrade: CourseGrade) => {
    setEditingId(courseGrade.id);
    setName(courseGrade.name);
    setCredits(String(courseGrade.credits));
    setGrade(String(courseGrade.grade));
    setSemester(String(courseGrade.semester || 1));

    // Auto scroll & focus directly so user doesn't have to look for it
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInputRef.current?.focus();
    }, 100);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setCredits('');
    setGrade('');
    setSemester('1');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !credits || !grade) return;
    
    const floatCredits = parseFloat(credits);
    const floatGrade = parseFloat(grade);
    const intSemester = parseInt(semester) || 1;

    if (editingId) {
      onUpdate?.(editingId, {
        name,
        credits: floatCredits,
        grade: floatGrade,
        semester: intSemester
      });
      setEditingId(null);
    } else {
      onAdd({
        name,
        credits: floatCredits,
        grade: floatGrade,
        semester: intSemester
      });
    }
    setName('');
    setCredits('');
    setGrade('');
    setSemester('1');
  };

  const chartData = [
    { name: 'Achieved', value: parseFloat(gpa) },
    { name: 'Remaining', value: 4.0 - parseFloat(gpa) }
  ];

  const COLORS = ['#0ea5e9', '#f1f5f9'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <form 
          ref={formRef}
          onSubmit={handleSubmit} 
          className="glass p-8 rounded-[2rem] border-2 border-brand-100 flex flex-col md:flex-row gap-4 items-end"
        >
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Mata Kuliah</label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Calculus, Algoritma"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
            />
          </div>
          <div className="w-full md:w-20">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">SKS</label>
            <input
              type="number"
              step="0.5"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="3.0"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="w-full md:w-20">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nilai</label>
            <input
              type="number"
              step="0.1"
              max="4"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="4.0"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="w-full md:w-28">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all text-slate-700 text-xs font-bold uppercase tracking-wide cursor-pointer"
              style={{ width: '120px' }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="submit"
              className="bg-brand-600 text-white flex-1 md:flex-none px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {editingId ? <Calculator size={20} /> : <Plus size={20} />}
              {editingId ? 'Simpan' : 'Tambah'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-slate-200 text-slate-700 p-3 rounded-xl hover:bg-slate-300 transition-all"
                title="Batal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </form>

        <div className="space-y-6">
          {sortedSemesters.map((sem) => {
            const semGrades = gradesBySemester[sem];
            const semCredits = semGrades.reduce((acc, curr) => acc + curr.credits, 0);
            const semPoints = semGrades.reduce((acc, curr) => acc + (curr.grade * curr.credits), 0);
            const semGpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';

            return (
              <div key={sem} className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-[2rem]">
                <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl shadow-xs border border-slate-100">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-brand-600" />
                    <h3 className="font-extrabold text-slate-800 text-sm">Semester {sem}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">{semCredits} SKS</span>
                    <span className="bg-brand-600 text-white px-2.5 py-1 rounded-lg shadow-sm font-mono font-bold">IPS: {semGpa}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {semGrades.sort((a, b) => a.name.localeCompare(b.name)).map((g) => (
                      <motion.div 
                        key={g.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-xs card-hover group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center font-black text-sm">
                            {g.grade.toFixed(1)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{g.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">SKS: {g.credits} • Nilai Akademis</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(g)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => onDelete(g.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}

          {grades.length === 0 && (
            <div className="text-center py-12 glass rounded-[2rem] border-dashed border-2 border-slate-100">
              <TrendingUp size={48} className="mx-auto mb-3 text-slate-100" />
              <p className="text-slate-400 font-medium italic">Belum ada nilai terekam. Masukkan mata kuliah Anda untuk mulai memantau perkembangan!</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-8 rounded-[2rem] text-center flex flex-col items-center justify-center min-h-[400px] border-2 border-brand-100">
          <div className="relative w-56 h-56 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-display font-bold text-slate-900">{gpa}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Current GPA</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
              <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-1">Total Credits</p>
              <p className="text-2xl font-bold text-brand-900">{totalCredits}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Status</p>
              <p className="text-sm font-bold text-emerald-900 mt-1">
                {parseFloat(gpa) >= 3.5 ? 'Excellent' : parseFloat(gpa) >= 3.0 ? 'Good' : 'Keep it up'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
