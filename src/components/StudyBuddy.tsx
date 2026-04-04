import React, { useState } from 'react';
import { Plus, Calculator, Trash2, TrendingUp, GraduationCap } from 'lucide-react';
import { CourseGrade } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface GPACalculatorProps {
  grades: CourseGrade[];
  onAdd: (grade: Omit<CourseGrade, 'id' | 'uid'>) => void;
  onDelete: (id: string) => void;
}

export const GPACalculator = ({ grades, onAdd, onDelete }: GPACalculatorProps) => {
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('');
  const [grade, setGrade] = useState('');

  const totalCredits = grades.reduce((acc, curr) => acc + curr.credits, 0);
  const totalPoints = grades.reduce((acc, curr) => acc + (curr.grade * curr.credits), 0);
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !credits || !grade) return;
    onAdd({
      name,
      credits: parseFloat(credits),
      grade: parseFloat(grade)
    });
    setName('');
    setCredits('');
    setGrade('');
  };

  const chartData = [
    { name: 'Achieved', value: parseFloat(gpa) },
    { name: 'Remaining', value: 4.0 - parseFloat(gpa) }
  ];

  const COLORS = ['#0ea5e9', '#f1f5f9'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <form onSubmit={handleSubmit} className="glass p-8 rounded-[2rem] border-2 border-brand-100 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Course Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Calculus"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="w-full md:w-24">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Credits</label>
            <input
              type="number"
              step="0.5"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="3.0"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
          <div className="w-full md:w-24">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Grade</label>
            <input
              type="number"
              step="0.1"
              max="4"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="4.0"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-600 text-white w-full md:w-auto px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </form>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {grades.map((g) => (
              <motion.div 
                key={g.id} 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm card-hover group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center font-bold text-lg">
                    {g.grade.toFixed(1)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{g.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{g.credits} Credits • Academic Record</p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(g.id)}
                  className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {grades.length === 0 && (
            <div className="text-center py-12 glass rounded-[2rem] border-dashed border-2 border-slate-100">
              <TrendingUp size={48} className="mx-auto mb-3 text-slate-100" />
              <p className="text-slate-400 font-medium italic">No grades recorded yet. Start tracking your progress!</p>
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
