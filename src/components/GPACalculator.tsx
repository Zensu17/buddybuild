import React, { useState } from 'react';
import { Plus, Calculator, Trash2, TrendingUp } from 'lucide-react';
import { CourseGrade } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

  const COLORS = ['#0ea5e9', '#334155'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Course Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Calculus"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Credits</label>
            <input
              type="number"
              step="0.5"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="3.0"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Grade (0-4.0)</label>
            <input
              type="number"
              step="0.1"
              max="4"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="4.0"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </form>

        <div className="space-y-3">
          {grades.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white">{g.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{g.credits} Credits</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{g.grade.toFixed(1)}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Grade</p>
                </div>
                <button
                  onClick={() => onDelete(g.id)}
                  className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-8 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-slate-800 dark:text-white">{gpa}</span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current GPA</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl">
              <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase">Total Credits</p>
              <p className="text-xl font-bold text-brand-900 dark:text-brand-100">{totalCredits}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Status</p>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                {parseFloat(gpa) >= 3.5 ? 'Excellent' : parseFloat(gpa) >= 3.0 ? 'Good' : 'Keep it up'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
