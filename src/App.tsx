import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  GraduationCap, 
  MessageSquare, 
  Settings,
  Bell,
  Search,
  Plus,
  ChevronRight,
  TrendingUp,
  X,
  LogOut,
  User as UserIcon,
  Trash2,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Quote,
  StickyNote,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from './hooks/useAppState';
import { TaskList } from './components/TaskList';
import { Timetable } from './components/Timetable';
import { GPACalculator } from './components/GPACalculator';
import { StudyBuddy } from './components/StudyBuddy';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { ReminderForm } from './components/ReminderForm';
import { ScheduleForm } from './components/ScheduleForm';
import { useAuth } from './contexts/AuthContext';
import { loginWithGoogle, logout } from './firebase';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { 
    state, 
    toggleTask, 
    deleteTask, 
    addTask, 
    addGrade, 
    deleteGrade, 
    addExam, 
    toggleExam, 
    deleteExam, 
    clearNotification,
    addClass,
    deleteClass
  } = useAppState();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pomodoro State
  const [timerTime, setTimerTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  
  // Notes State
  const [notes, setNotes] = useState<string>(() => localStorage.getItem('buddybuild_notes') || '');

  useEffect(() => {
    localStorage.setItem('buddybuild_notes', notes);
  }, [notes]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime((prev) => prev - 1);
      }, 1000);
    } else if (timerTime === 0) {
      setIsTimerRunning(false);
      const nextMode = timerMode === 'work' ? 'break' : 'work';
      setTimerMode(nextMode);
      setTimerTime(nextMode === 'work' ? 25 * 60 : 5 * 60);
      alert(nextMode === 'work' ? "Break's over! Time to focus." : "Great job! Take a short break.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTime, timerMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">BuddyBuild</h1>
          <p className="text-slate-500">Your ultimate university companion. Organize your tasks, schedule, and grades in one place.</p>
          <button 
            onClick={loginWithGoogle}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-3"
          >
            <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" className="w-6 h-6" referrerPolicy="no-referrer" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'tasks', label: 'Reminders', icon: CheckSquare },
    { id: 'gpa', label: 'GPA Tracker', icon: GraduationCap },
    { id: 'ai', label: 'Study Buddy', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const allReminders = [...(state.tasks || []), ...(state.exams || [])];
  
  const filteredReminders = allReminders.filter(item => 
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.course || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingReminders = filteredReminders
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const todayClasses = (state.schedule || [])
    .filter(s => s.day === new Date().getDay())
    .filter(s => 
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.room || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const filteredSchedule = (state.schedule || []).filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.room || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-full min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300">
      {/* Notifications Overlay */}
      <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {(state.notifications || []).map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-l-4 border-brand-600 p-4 rounded-xl shadow-xl w-80 pointer-events-auto flex justify-between items-start gap-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{notif.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{format(new Date(notif.timestamp), 'HH:mm')}</p>
              </div>
              <button 
                onClick={() => clearNotification(notif.id)}
                className="text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showReminderForm && (
        <ReminderForm 
          onAddTask={addTask} 
          onAddExam={addExam} 
          onClose={() => setShowReminderForm(false)} 
        />
      )}

      {showScheduleForm && (
        <ScheduleForm 
          onAdd={addClass} 
          onClose={() => setShowScheduleForm(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen transition-colors">
        <div className="p-6">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 text-brand-600 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-200">BB</div>
            <h1 className="text-xl font-display font-bold text-slate-900">BuddyBuild</h1>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.id 
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold overflow-hidden border-2 border-white shadow-sm">
              {user.photoURL ? <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" /> : user.displayName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.displayName || 'Student'}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 lg:px-8 py-4 transition-colors">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="lg:hidden flex items-center gap-2 text-brand-600 cursor-pointer"
            >
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            </div>

            <div className="flex flex-1 md:flex-none items-center bg-slate-100 rounded-full px-4 py-2 max-w-md transition-colors mx-4">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('tasks')}
                className={cn(
                  "p-2 rounded-full transition-all relative",
                  activeTab === 'tasks' ? "bg-brand-50 text-brand-600" : "text-slate-400 hover:bg-slate-100"
                )}
              >
                <Bell size={20} />
                {(state.notifications || []).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user.displayName || 'Student'}</p>
                  <p className="text-xs text-slate-500">Academic Profile</p>
                </div>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold overflow-hidden border-2 border-transparent hover:border-brand-500 transition-all"
                >
                  {user.photoURL ? <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" /> : user.displayName?.charAt(0) || 'U'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-slate-900">Welcome back, {user.displayName?.split(' ')[0] || 'Student'}!</h2>
                      <p className="text-slate-500">Here's what's happening on campus today.</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowScheduleForm(true)}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Calendar size={18} />
                        Add Class
                      </button>
                      <button 
                        onClick={() => setShowReminderForm(true)}
                        className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center gap-2"
                      >
                        <Plus size={18} />
                        New Reminder
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Today's Classes */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Calendar size={20} className="text-brand-500" />
                          Today's Classes
                        </h3>
                        <span className="text-xs font-medium text-slate-400">{format(new Date(), 'EEEE, MMMM d')}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {todayClasses.length > 0 ? (
                          todayClasses.map(session => (
                            <div key={session.id} className="glass p-5 rounded-3xl card-hover border-l-4 relative group" style={{ borderLeftColor: session.color }}>
                              <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{session.startTime} - {session.endTime}</span>
                                <div className="flex items-center gap-2">
                                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-full font-bold uppercase">{session.room}</span>
                                  <button 
                                    onClick={() => deleteClass(session.id)}
                                    className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <h4 className="text-lg font-bold text-slate-800 mb-1">{session.name}</h4>
                              <p className="text-sm text-slate-500">Main Campus • Building B</p>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full p-12 glass rounded-3xl text-center text-slate-400 italic flex flex-col items-center gap-3">
                            <Sparkles size={32} className="opacity-20" />
                            <p>{searchQuery ? "No classes match your search." : "No classes scheduled for today. Enjoy your break!"}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CheckSquare size={20} className="text-brand-500" />
                            Upcoming Deadlines
                          </h3>
                          <button onClick={() => setActiveTab('tasks')} className="text-brand-600 text-sm font-medium hover:underline flex items-center gap-1">
                            View all <ChevronRight size={16} />
                          </button>
                        </div>
                        <TaskList 
                          tasks={upcomingReminders} 
                          onToggle={(id) => {
                            const item = allReminders.find(r => r.id === id);
                            if (item?.type === 'task') toggleTask(id);
                            else toggleExam(id);
                          }} 
                          onDelete={(id) => {
                            const item = allReminders.find(r => r.id === id);
                            if (item?.type === 'task') deleteTask(id);
                            else deleteExam(id);
                          }} 
                        />
                      </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <div className="space-y-8">
                      {/* Pomodoro Timer */}
                      <div className="glass rounded-[2rem] p-6 text-center space-y-4 border-2 border-brand-100">
                        <div className="flex items-center justify-center gap-2 text-brand-600 mb-2">
                          <Timer size={20} />
                          <span className="text-xs font-bold uppercase tracking-widest">{timerMode === 'work' ? 'Focus Session' : 'Short Break'}</span>
                        </div>
                        <div className="text-5xl font-display font-bold text-slate-900 tabular-nums">
                          {formatTime(timerTime)}
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                          >
                            {isTimerRunning ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                          </button>
                          <button 
                            onClick={() => {
                              setIsTimerRunning(false);
                              setTimerTime(timerMode === 'work' ? 25 * 60 : 5 * 60);
                            }}
                            className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all"
                          >
                            <RotateCcw size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Daily Motivation */}
                      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-[2rem] p-6 text-white shadow-xl shadow-brand-100 relative overflow-hidden">
                        <Quote size={48} className="absolute -left-2 -top-2 text-white/10" />
                        <div className="relative z-10">
                          <h4 className="text-brand-100 text-[10px] font-bold uppercase tracking-widest mb-3">Daily Motivation</h4>
                          <p className="text-sm font-medium leading-relaxed italic mb-4">
                            "The expert in anything was once a beginner."
                          </p>
                          <div className="flex items-center gap-2 text-[10px] bg-white/10 w-fit px-2 py-1 rounded-full">
                            <Sparkles size={12} />
                            <span>Stay Focused</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Notes */}
                      <div className="glass rounded-[2rem] p-6 flex flex-col min-h-[250px]">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <StickyNote size={18} className="text-brand-500" />
                          Quick Notes
                        </h4>
                        <textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Jot down quick thoughts..."
                          className="flex-1 w-full bg-slate-50/50 border-none rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-slate-900">Weekly Schedule</h2>
                      <p className="text-slate-500">Manage your classes and lecture halls.</p>
                    </div>
                    <button 
                      onClick={() => setShowScheduleForm(true)}
                      className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add Class
                    </button>
                  </div>
                  <Timetable schedule={filteredSchedule} onDelete={deleteClass} />
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-slate-900">Reminders & Deadlines</h2>
                      <p className="text-slate-500">Keep track of your academic deadlines and exams.</p>
                    </div>
                    <button 
                      onClick={() => setShowReminderForm(true)}
                      className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add New
                    </button>
                  </div>

                  {/* Notification History */}
                  {(state.notifications || []).length > 0 && (
                    <div className="bg-brand-50 border border-brand-100 rounded-3xl p-6 mb-8">
                      <h3 className="text-sm font-bold text-brand-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Bell size={16} />
                        Recent Notifications
                      </h3>
                      <div className="space-y-2">
                        {state.notifications.map(notif => (
                          <div key={notif.id} className="bg-white p-3 rounded-xl border border-brand-100 flex justify-between items-center shadow-sm">
                            <p className="text-sm text-slate-700">{notif.message}</p>
                            <button onClick={() => clearNotification(notif.id)} className="text-slate-300 hover:text-red-500">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <TaskList 
                    tasks={filteredReminders} 
                    onToggle={(id) => {
                      const item = allReminders.find(r => r.id === id);
                      if (item?.type === 'task') toggleTask(id);
                      else toggleExam(id);
                    }} 
                    onDelete={(id) => {
                      const item = allReminders.find(r => r.id === id);
                      if (item?.type === 'task') deleteTask(id);
                      else deleteExam(id);
                    }} 
                  />
                </div>
              )}

              {activeTab === 'gpa' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-slate-900">GPA Tracker</h2>
                      <p className="text-slate-500">Monitor your academic performance.</p>
                    </div>
                  </div>
                  <GPACalculator grades={state.grades} onAdd={addGrade} onDelete={deleteGrade} />
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-slate-900">AI Study Buddy</h2>
                      <p className="text-slate-500">Your intelligent academic assistant powered by Gemini.</p>
                    </div>
                  </div>
                  <div className="max-w-4xl mx-auto">
                    <StudyBuddy />
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Settings</h2>
                    <p className="text-slate-500">Manage your account and app preferences.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                      <h3 className="text-xl font-bold text-slate-900">Profile Information</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-3xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-white shadow-sm">
                          {user.photoURL ? <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" /> : user.displayName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-slate-900">{user.displayName || 'Student'}</p>
                          <p className="text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-50">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Account Status</p>
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">Verified Account</span>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                      <h3 className="text-xl font-bold text-slate-900">App Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <div>
                            <p className="font-bold text-slate-900">Push Notifications</p>
                            <p className="text-xs text-slate-500">Receive alerts for upcoming deadlines</p>
                          </div>
                          <div className="w-12 h-6 bg-brand-600 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
                      <p className="text-red-600/70">Sign out of your account or manage data deletion.</p>
                    </div>
                    <button 
                      onClick={logout}
                      className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center z-50 transition-colors shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              activeTab === item.id ? "text-brand-600" : "text-slate-400"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AppContent />
  );
}
