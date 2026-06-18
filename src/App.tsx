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
  Sparkles,
  Layers,
  Trophy,
  Pencil,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from './hooks/useAppState';
import { ClassSession, Task, Exam } from './types';
import { TaskList } from './components/TaskList';
import { Timetable } from './components/Timetable';
import { GPACalculator } from './components/GPACalculator';
import { Flashcards } from './components/Flashcards';
import { StudyBuddy } from './components/StudyBuddy';
import { UrgentCountdown } from './components/UrgentCountdown';
import { ZenSoundPlayer } from './components/ZenSoundPlayer';
import { DashboardStats } from './components/DashboardStats';
import { QuotesBanner } from './components/QuotesBanner';
import { AnnouncementBoard } from './components/AnnouncementBoard';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { ReminderForm } from './components/ReminderForm';
import { ScheduleForm } from './components/ScheduleForm';
import { AdminDashboard } from './components/AdminDashboard';
import { useAuth } from './contexts/AuthContext';
import canvasConfetti from 'canvas-confetti';
import { loginWithGoogle, logout, loginWithEmail, registerWithEmail } from './firebase';

const STUDY_QUOTES = [
  { text: "Hasil tertinggi dari pendidikan adalah toleransi dan pemahaman mendalam.", author: "Helen Keller" },
  { text: "Jika Anda tidak bisa menjelaskannya dengan sederhana, Anda belum memahaminya dengan cukup baik.", author: "Richard Feynman" },
  { text: "Keberhasilan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.", author: "Colin Powell" },
  { text: "Investasi dalam pengetahuan selalu memberikan bunga terbaik.", author: "Benjamin Franklin" },
  { text: "Bukan karena hal itu sulit kita tidak berani, namun karena kita tidak berani maka hal itu menjadi sulit.", author: "Seneca" }
];

const ADMIN_EMAILS = [
  'sitorusalbert27@gmail.com',
  'admin@buddybuild.com',
  'admin@buddybuild.ac.id'
];

const AppContent = () => {
  const { user, loading } = useAuth();
  const { 
    state, 
    toggleTask, 
    deleteTask, 
    addTask, 
    updateTask,
    addGrade, 
    updateGrade,
    deleteGrade, 
    addExam, 
    updateExam,
    toggleExam, 
    deleteExam, 
    clearNotification,
    addClass,
    updateClass,
    deleteClass,
    addFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    updateSettings,
    plantSeed,
    waterPlant,
    harvestActivePlant,
    addDroplets,
    isAuthReady,
    addAuditLog
  } = useAppState();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth Local State
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'google'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Pomodoro State
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timerTime, setTimerTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  
  // Toast Notification State
  interface ToastConfig {
    id: string;
    message: string;
    onUndo?: () => void;
    type: 'success' | 'info' | 'error' | 'delete';
  }
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = (message: string, onUndo?: () => void, type: 'success' | 'info' | 'error' | 'delete' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, onUndo, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const handleDeleteClass = async (id: string) => {
    const session = state.schedule?.find(s => s.id === id);
    if (!session) return;
    try {
      await deleteClass(id);
      showToast(
        `Jadwal kuliah "${session.name}" dihapus.`,
        async () => {
          await addClass({
            name: session.name,
            room: session.room,
            day: session.day,
            startTime: session.startTime,
            endTime: session.endTime,
            color: session.color
          });
        },
        'delete'
      );
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const task = state.tasks?.find(t => t.id === id);
    if (!task) return;
    try {
      await deleteTask(id);
      showToast(
        `Tugas "${task.title}" dihapus.`,
        async () => {
          await addTask({
            title: task.title,
            course: task.course,
            dueDate: task.dueDate,
            reminderTime: task.reminderTime,
            priority: task.priority
          });
        },
        'delete'
      );
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDeleteExam = async (id: string) => {
    const exam = state.exams?.find(e => e.id === id);
    if (!exam) return;
    try {
      await deleteExam(id);
      showToast(
        `Ujian "${exam.title}" dihapus.`,
        async () => {
          await addExam({
            title: exam.title,
            course: exam.course,
            dueDate: exam.dueDate,
            reminderTime: exam.reminderTime,
            priority: exam.priority,
            location: exam.location || ""
          });
        },
        'delete'
      );
    } catch (error) {
      console.error("Error deleting exam:", error);
    }
  };

  const handleDeleteReminder = async (id: string, type: 'task' | 'exam') => {
    if (type === 'task') {
      await handleDeleteTask(id);
    } else {
      await handleDeleteExam(id);
    }
  };

  const handleAddClass = async (session: Omit<ClassSession, 'id' | 'uid'>) => {
    try {
      await addClass(session);
      if (isAdmin) {
        const adminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Utama';
        await addAuditLog({
          action: 'add',
          targetName: session.name,
          targetType: 'jadwal',
          adminName
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateClass = async (id: string, updates: Partial<ClassSession>) => {
    try {
      await updateClass(id, updates);
      if (isAdmin) {
        const adminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Utama';
        await addAuditLog({
          action: 'edit',
          targetName: updates.name || state.schedule?.find(s => s.id === id)?.name || 'Jadwal',
          targetType: 'jadwal',
          adminName
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (task: Omit<Task, 'id' | 'completed' | 'type' | 'uid'>) => {
    try {
      await addTask(task);
      if (isAdmin) {
        const adminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Utama';
        await addAuditLog({
          action: 'add',
          targetName: task.title,
          targetType: 'tugas',
          adminName
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates);
      if (isAdmin) {
        const adminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Utama';
        await addAuditLog({
          action: 'edit',
          targetName: updates.title || state.tasks?.find(t => t.id === id)?.title || 'Tugas',
          targetType: 'tugas',
          adminName
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddExam = async (exam: Omit<Exam, 'id' | 'completed' | 'type' | 'uid'>) => {
    try {
      await addExam(exam);
      if (isAdmin) {
        const adminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Utama';
        await addAuditLog({
          action: 'add',
          targetName: exam.title,
          targetType: 'ujian',
          adminName
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateExam = async (id: string, updates: Partial<Exam>) => {
    try {
      await updateExam(id, updates);
      if (isAdmin) {
        const adminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Utama';
        await addAuditLog({
          action: 'edit',
          targetName: updates.title || state.exams?.find(e => e.id === id)?.title || 'Ujian',
          targetType: 'ujian',
          adminName
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkAddPack = async (packType: 'akademik' | 'remedial') => {
    try {
      const adminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Utama';
      if (packType === 'akademik') {
        const dummyClasses = [
          { name: 'Kalkulus Multi-Variabel', day: 1, startTime: '08:30', endTime: '10:30', room: 'Ruang A-301', color: '#3b82f6' },
          { name: 'Pemrograman Web Kontemporer', day: 2, startTime: '10:00', endTime: '12:00', room: 'Lab Komputer B', color: '#10b981' },
          { name: 'Kecerdasan Artifisial Pratis', day: 3, startTime: '13:30', endTime: '15:30', room: 'Lab Riset AI', color: '#8b5cf6' },
          { name: 'Etika Profesi IPTEK', day: 4, startTime: '09:00', endTime: '11:00', room: 'Aula Gedung C', color: '#f59e0b' }
        ];
        for (const cls of dummyClasses) {
          await addClass(cls);
        }
        await addAuditLog({
          action: 'add',
          targetName: 'Paket Jadwal Akademik Contoh',
          targetType: 'jadwal',
          adminName
        });
      } else {
        const dummyReminders: { title: string; course: string; dueDate: string; priority: 'low' | 'medium' | 'high'; reminderTime: number }[] = [
          { title: 'Tugas Mandiri Ke-4: Struktur Data', course: 'Struktur Data', dueDate: new Date(Date.now() + 3600000 * 48).toISOString(), priority: 'high', reminderTime: 30 },
          { title: 'Persiapan Kuis UTS: Fisika Dasar', course: 'Fisika Dasar', dueDate: new Date(Date.now() + 3600000 * 72).toISOString(), priority: 'medium', reminderTime: 60 }
        ];
        for (const task of dummyReminders) {
          await addTask(task);
        }
        await addAuditLog({
          action: 'add',
          targetName: 'Paket Penugasan Remedial Contoh',
          targetType: 'tugas',
          adminName
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearCompletedTasks = async () => {
    try {
      const completed = state.tasks?.filter(t => t.completed) || [];
      for (const t of completed) {
        await deleteTask(t.id);
      }
      const adminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Utama';
      await addAuditLog({
        action: 'delete',
        targetName: `Pembersihan ${completed.length} Tugas Selesai`,
        targetType: 'tugas',
        adminName
      });
    } catch (e) {
      console.error(e);
    }
  };
  
  // State untuk Kutipan & Habits
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [habits, setHabits] = useState(() => {
    const cached = localStorage.getItem('buddybuild_habits');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return [
      { id: '1', title: 'Sesi Fokus Pomodoro', completed: false },
      { id: '2', title: 'Tinjau Rencana Jadwal Kuliah', completed: false },
      { id: '3', title: 'Latihan Kuis / Kerjakan Flashcard', completed: false },
      { id: '4', title: 'Konsumsi Air Putih & Istirahat', completed: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('buddybuild_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (state.role === 'admin') {
      setIsAdmin(localStorage.getItem('buddybuild_custom_admin') !== 'false');
    } else {
      setIsAdmin(false);
    }
  }, [state.role]);

  // Browser Push & Local Alarm system for Class sessions 15-min before
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const classNotifiedSet = useRef<string[]>([]);

  useEffect(() => {
    const checkScheduleAlarm = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0-6
      
      state.schedule?.forEach(session => {
        if (session.day !== currentDay) return;
        
        const [hours, minutes] = session.startTime.split(':').map(Number);
        const classDate = new Date();
        classDate.setHours(hours, minutes, 0, 0);
        
        const diffMs = classDate.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / (60 * 1000));
        
        if (diffMins === 15) {
          const key = `${session.id}-${classDate.toDateString()}`;
          if (classNotifiedSet.current.includes(key)) return;
          classNotifiedSet.current.push(key);
          
          const alertMessage = `🌸 Peringatan Manis: Sesi kuliah "${session.name}" di "${session.room}" akan dimulai dalam 15 menit (${session.startTime}). Bersiap-siap ya!`;
          
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification("BuddyBuild Kampus 🏫", {
                body: alertMessage,
                icon: "/favicon.ico",
              });
            } catch (error) {
              console.error("Browser notification failed", error);
            }
          }
          
          showToast(alertMessage, undefined, 'info');
          
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            const nowTime = audioCtx.currentTime;
            
            osc.frequency.setValueAtTime(523.25, nowTime); // C5
            osc.frequency.setValueAtTime(659.25, nowTime + 0.15); // E5
            osc.frequency.setValueAtTime(783.99, nowTime + 0.3); // G5
            
            gain.gain.setValueAtTime(0.15, nowTime);
            gain.gain.exponentialRampToValueAtTime(0.001, nowTime + 0.8);
            
            osc.start(nowTime);
            osc.stop(nowTime + 0.8);
          } catch (e) {
            console.warn("Audio chime could not play due to user gesture requirement.", e);
          }
        }
      });
    };

    checkScheduleAlarm();
    const intervalId = setInterval(checkScheduleAlarm, 30000);
    return () => clearInterval(intervalId);
  }, [state.schedule]);

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const nextState = !h.completed;
        if (nextState) {
          canvasConfetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.8 }
          });
        }
        return { ...h, completed: nextState };
      }
      return h;
    }));
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 11) return 'Selamat pagi 🌤️';
    if (hours < 15) return 'Selamat siang ☀️';
    if (hours < 19) return 'Selamat sore 🌅';
    return 'Selamat malam 🌙';
  };

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
      if (timerMode === 'work') {
        addDroplets(20);
        canvasConfetti({ particleCount: 100, spread: 70 });
      }
      setTimerMode(nextMode);
      setTimerTime(nextMode === 'work' ? workDuration * 60 : breakDuration * 60);
      // Removed blocking alert for better performance and iframe compatibility
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
    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      setIsAuthLoading(true);
      try {
        if (authMode === 'login') {
          await loginWithEmail(email, password);
        } else if (authMode === 'signup') {
          if (!name) throw new Error("Name is required");
          await registerWithEmail(email, password, name);
        }
      } catch (err: any) {
        console.error("Auth Error details:", err);
        const errorCode = err.code || "";
        
        if (errorCode === 'auth/operation-not-allowed') {
          setAuthError(
            "⚠️ Metode Masuk Email & Sandi belum diaktifkan di Firebase Console Anda! Silakan masuk ke Firebase Console -> Authentication -> tab Sign-in Method -> aktifkan opsi 'Email/Password' agar fitur ini berfungsi dengan benar."
          );
        } else if (errorCode === 'auth/email-already-in-use') {
          setAuthError("Email ini sudah digunakan oleh akun lain. Silakan masuk menggunakan akun tersebut.");
        } else if (errorCode === 'auth/weak-password') {
          setAuthError("Kata sandi terlalu pendek. Masukkan minimal 6 karakter.");
        } else if (errorCode === 'auth/invalid-email') {
          setAuthError("Format alamat email tidak valid.");
        } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
          setAuthError("Email atau Kata Sandi yang dimasukkan salah.");
        } else {
          setAuthError(err.message || "Gagal melakukan autentikasi");
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-md w-full text-center space-y-6 border border-slate-100"
        >
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-3xl flex items-center justify-center mx-auto">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">BuddyBuild</h1>
            <p className="text-slate-500 text-sm mt-1">Your ultimate study companion.</p>
          </div>

          <AnimatePresence mode="wait">
            {authMode === 'google' ? (
              <motion.div 
                key="google"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <button 
                  onClick={loginWithGoogle}
                  className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-3 group"
                >
                  <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                  Sign in with Google
                </button>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or</span></div>
                </div>
                <button 
                  onClick={() => setAuthMode('login')}
                  className="text-sm font-bold text-brand-600 hover:underline"
                >
                  Use Email & Password
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="email"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleAuth}
                className="space-y-4 text-left"
              >
                {authError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium animate-shake">
                    {authError}
                  </div>
                )}
                
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
                    />
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 disabled:opacity-50"
                >
                  {isAuthLoading ? "Processing..." : authMode === 'login' ? "Sign In" : "Create Account"}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button 
                    type="button"
                    onClick={() => setAuthMode('google')}
                    className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    Back to Google
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    {authMode === 'login' ? "Need an account?" : "Already have an account?"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    ...(isAdmin ? [{ id: 'admin-dashboard', label: '🛡️ Admin Center', icon: ShieldAlert }] : []),
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stats', label: 'Statistik Belajar', icon: TrendingUp },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'tasks', label: 'Reminders', icon: CheckSquare },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'gpa', label: 'GPA Tracker', icon: GraduationCap },
    { id: 'studybuddy', label: 'Study Buddy', icon: MessageSquare },
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
          onAddTask={handleAddTask} 
          onAddExam={handleAddExam} 
          onUpdateTask={handleUpdateTask}
          onUpdateExam={handleUpdateExam}
          editingItem={editingReminder}
          onClose={() => {
            setShowReminderForm(false);
            setEditingReminder(null);
          }} 
        />
      )}

      {showScheduleForm && (
        <ScheduleForm 
          onAdd={handleAddClass} 
          onUpdate={handleUpdateClass}
          editingSession={editingSession}
          onClose={() => {
            setShowScheduleForm(false);
            setEditingSession(null);
          }} 
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
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  activeTab === item.id 
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-100" 
                    : "text-slate-500 hover:bg-brand-50 hover:text-brand-600"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-transform duration-300",
                  activeTab === item.id ? "scale-110" : "group-hover:scale-110"
                )} />
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Interactive Affirmation Sidebar */}
          <div className="mt-8 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-colors">
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Sparkles size={60} />
            </div>
            <div className="relative z-10">
              <span className="text-[9px] font-bold text-brand-600 uppercase tracking-widest block mb-2">Soul Focus</span>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium italic">"Progress is not in enhancing what is, but in advancing toward what will be."</p>
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold overflow-hidden border-2 border-white shadow-sm">
              {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : user.displayName?.charAt(0) || 'U'}
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
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
            </div>

            <div className="flex flex-1 md:flex-none items-center bg-slate-100 rounded-full px-3 md:px-4 py-2 max-w-[160px] md:max-w-md transition-all mx-2 md:mx-4">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-xs md:text-sm ml-1 md:ml-2 w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Mode Admin Switch */}
              {state.role === 'admin' && (
                <button
                  onClick={() => {
                    if (isAdmin) {
                      setIsAdmin(false);
                      localStorage.setItem('buddybuild_custom_admin', 'false');
                      setActiveTab('dashboard');
                      canvasConfetti({
                        particleCount: 15,
                        spread: 30,
                        origin: { y: 0.1, x: 0.8 }
                      });
                    } else {
                      setIsAdmin(true);
                      localStorage.setItem('buddybuild_custom_admin', 'true');
                      setActiveTab('admin-dashboard');
                      canvasConfetti({
                        particleCount: 30,
                        spread: 40,
                        origin: { y: 0.1, x: 0.8 }
                      });
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 border cursor-pointer",
                    isAdmin 
                      ? "bg-slate-900 border-slate-950 text-amber-400 hover:bg-slate-900" 
                      : "bg-slate-105 border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  )}
                  title="Klik untuk berpindah ke Fitur Admin / Siswa"
                >
                  <span>{isAdmin ? '🛡️ Mode Admin ON' : '🎓 Mode Siswa'}</span>
                </button>
              )}

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
                  {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : user.displayName?.charAt(0) || 'U'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'admin-dashboard' && isAdmin && (
                <AdminDashboard 
                  schedule={state.schedule || []}
                  tasks={state.tasks || []}
                  exams={state.exams || []}
                  grades={state.grades || []}
                  flashcardSets={state.flashcardSets || []}
                  auditLogs={state.auditLogs || []}
                  onAddAuditLog={addAuditLog}
                  currentAdminName={user?.displayName || user?.email?.split('@')[0] || 'Admin Utama'}
                  onAddSchedule={() => {
                    setEditingSession(null);
                    setShowScheduleForm(true);
                  }}
                  onEditSchedule={(session) => {
                    setEditingSession(session);
                    setShowScheduleForm(true);
                  }}
                  onDeleteSchedule={(id) => handleDeleteClass(id)}
                  onAddReminder={() => {
                    setEditingReminder(null);
                    setShowReminderForm(true);
                  }}
                  onEditReminder={(item) => {
                    setEditingReminder(item);
                    setShowReminderForm(true);
                  }}
                  onDeleteReminder={(id, type) => {
                    handleDeleteReminder(id, type);
                  }}
                  onToggleReminder={async (id, type) => {
                    if (type === 'task') {
                      await toggleTask(id);
                      if (isAdmin) {
                        const taskItem = state.tasks?.find(t => t.id === id);
                        const adminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Utama';
                        await addAuditLog({
                          action: 'toggle',
                          targetName: taskItem?.title || 'Tugas',
                          targetType: 'tugas',
                          adminName
                        });
                      }
                    } else {
                      await toggleExam(id);
                      if (isAdmin) {
                        const examItem = state.exams?.find(e => e.id === id);
                        const adminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Utama';
                        await addAuditLog({
                          action: 'toggle',
                          targetName: examItem?.title || 'Ujian',
                          targetType: 'ujian',
                          adminName
                        });
                      }
                    }
                  }}
                  onBulkAddPack={handleBulkAddPack}
                  onClearCompletedTasks={handleClearCompletedTasks}
                />
              )}

              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Quotes Inspirasi Belajar */}
                  <QuotesBanner />

                  {/* Countdown Tenggat Terdekat */}
                  <UrgentCountdown 
                    tasks={state.tasks || []} 
                    exams={state.exams || []} 
                    onToggleComplete={(id, type) => {
                      if (type === 'task') toggleTask(id);
                      else toggleExam(id);
                    }}
                    onEdit={isAdmin ? (id, type) => {
                      const item = allReminders.find(r => r.id === id);
                      if (item) {
                        setEditingReminder(item);
                        setShowReminderForm(true);
                      }
                    } : undefined}
                  />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 leading-tight">
                        {getGreeting()}, {user.displayName?.split(' ')[0] || 'Teman Belajar'}!
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Sesi produktif siap dimulai. Mari kita raih hari kuliah terbaik hari ini!</p>
                    </div>
                    <div className="flex gap-3">
                      {isAdmin ? (
                        <>
                          <button 
                            onClick={() => setShowScheduleForm(true)}
                            className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                          >
                            <Calendar size={16} />
                            Tambah Jadwal Kuliah
                          </button>
                          <button 
                            onClick={() => setShowReminderForm(true)}
                            className="bg-slate-950 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 cursor-pointer bg-slate-900"
                          >
                            <Plus size={16} />
                            Tugas Baru
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => setActiveTab('studybuddy')}
                            className="bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-purple-100 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                          >
                            🤖 Tanya Study Buddy AI
                          </button>
                          <button 
                            onClick={() => setActiveTab('flashcards')}
                            className="bg-brand-50 text-brand-700 border border-brand-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-100 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                          >
                            🧠 Latihan Flashcards
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Today's Classes */}
                    <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                      <div className="space-y-6">
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
                              <motion.div 
                                key={session.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.01, y: -2 }}
                                className="glass p-5 rounded-3xl card-hover border-l-4 relative group cursor-pointer shadow-sm transition-all duration-200" 
                                style={{ borderLeftColor: session.color }}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{session.startTime} - {session.endTime}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-full font-bold uppercase">{session.room}</span>
                                    {isAdmin && (
                                      <>
                                        <button 
                                          onClick={() => {
                                            setEditingSession(session);
                                            setShowScheduleForm(true);
                                          }}
                                          className="p-1 text-slate-350 hover:text-brand-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity cursor-pointer"
                                          title="Edit Kelas"
                                        >
                                          <Pencil size={14} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteClass(session.id)}
                                          className="p-1 text-slate-305 hover:text-red-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity cursor-pointer"
                                          title="Hapus Kelas"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">{session.name}</h4>
                                <p className="text-sm text-slate-500">Main Campus • Building B</p>
                              </motion.div>
                            ))
                          ) : (
                            <div className="col-span-full p-12 glass rounded-3xl text-center text-slate-400 italic flex flex-col items-center gap-3">
                              <Sparkles size={32} className="opacity-20" />
                              <p>{searchQuery ? "No classes match your search." : "No classes scheduled for today. Enjoy your break!"}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
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
                            if (item?.type === 'task') {
                              handleDeleteTask(id);
                            } else {
                              handleDeleteExam(id);
                            }
                          }} 
                          onEdit={(item) => {
                            setEditingReminder(item);
                            setShowReminderForm(true);
                          }}
                        />
                      </div>

                      {/* Papan Pengumuman Digital Kelas */}
                      <AnnouncementBoard 
                        isAdmin={isAdmin}
                        adminName={user?.displayName || user?.email?.split('@')[0] || 'Admin Utama'}
                        onAddAdminTask={(task) => {
                          handleAddTask({
                            title: task.title,
                            course: task.course,
                            dueDate: task.dueDate,
                            reminderTime: 60,
                            priority: task.priority
                          });
                        }}
                        onAddAdminSchedule={(session) => {
                          handleAddClass({
                            name: session.name,
                            room: 'Ruang A-101 (Admin)',
                            day: session.day,
                            startTime: session.startTime,
                            endTime: session.endTime,
                            color: '#e11d48' // rose notification color
                          });
                        }}
                      />
                    </div>

                    {/* Sidebar Widgets */}
                    <div className="space-y-8 order-1 lg:order-2">
                      {/* Pomodoro Timer */}
                      <div className="glass rounded-[2rem] p-6 text-center space-y-4 border-2 border-brand-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-brand-600">
                            <Timer size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">{timerMode === 'work' ? 'Focus Session' : 'Short Break'}</span>
                          </div>
                          <button 
                            onClick={() => setShowTimerSettings(!showTimerSettings)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          >
                            <Settings size={16} />
                          </button>
                        </div>

                        <AnimatePresence mode="wait">
                          {showTimerSettings ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-4 py-2"
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Work (min)</label>
                                  <input 
                                    type="number" 
                                    value={workDuration}
                                    onChange={(e) => {
                                      const val = Math.max(1, parseInt(e.target.value) || 1);
                                      setWorkDuration(val);
                                      if (timerMode === 'work' && !isTimerRunning) setTimerTime(val * 60);
                                    }}
                                    className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-center focus:ring-2 focus:ring-brand-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Break (min)</label>
                                  <input 
                                    type="number" 
                                    value={breakDuration}
                                    onChange={(e) => {
                                      const val = Math.max(1, parseInt(e.target.value) || 1);
                                      setBreakDuration(val);
                                      if (timerMode === 'break' && !isTimerRunning) setTimerTime(val * 60);
                                    }}
                                    className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-center focus:ring-2 focus:ring-brand-500"
                                  />
                                </div>
                              </div>
                              <button 
                                onClick={() => setShowTimerSettings(false)}
                                className="w-full py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all"
                              >
                                Save Settings
                              </button>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                            >
                              <div className="text-5xl font-display font-bold text-slate-900 tabular-nums mb-4">
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
                                    setTimerTime(timerMode === 'work' ? workDuration * 60 : breakDuration * 60);
                                  }}
                                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all"
                                >
                                  <RotateCcw size={18} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Lofi & Ambient Sound Player */}
                      <ZenSoundPlayer />

                      {/* Daily Study Habits Checklist */}
                      <div className="bg-white rounded-[2rem] p-6 border border-slate-150 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-slate-800">
                            <CheckSquare size={18} className="text-brand-500" />
                            Kebiasaan Belajar Harian
                          </h4>
                          <span className="text-[10px] font-bold bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                            {habits.filter(h => h.completed).length} / {habits.length}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Selesaikan kebiasaan mikro di bawah ini secara disiplin setiap hari untuk menjaga produktivitas:
                        </p>

                        <div className="space-y-2.5">
                          {habits.map((habit) => (
                            <button
                              key={habit.id}
                              onClick={() => toggleHabit(habit.id)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all",
                                habit.completed
                                  ? "bg-slate-50 border-slate-100 opacity-60 text-slate-400 line-through font-medium"
                                  : "bg-white border-slate-100 hover:border-slate-200 text-slate-700 shadow-sm font-semibold"
                              )}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0",
                                habit.completed
                                  ? "bg-brand-500 border-brand-500 text-white"
                                  : "border-slate-200 bg-slate-50 text-transparent"
                              )}>
                                <CheckCircle2 size={12} className="stroke-white" />
                              </div>
                              <span className="text-xs tracking-tight">{habit.title}</span>
                            </button>
                          ))}
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

                      {/* Flashcard Quick Access */}
                      {state.flashcardSets.length > 0 && (
                        <div className="glass rounded-[2rem] p-6 space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Layers size={18} className="text-brand-500" />
                            Flashcard Sets
                          </h4>
                          <div className="space-y-2">
                            {state.flashcardSets.slice(0, 2).map(set => (
                              <button 
                                key={set.id}
                                onClick={() => setActiveTab('flashcards')}
                                className="w-full p-3 bg-white border border-slate-100 rounded-2xl text-left hover:bg-brand-50 transition-all group"
                              >
                                <p className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{set.title}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{set.course}</p>
                              </button>
                            ))}
                            <button 
                              onClick={() => setActiveTab('flashcards')}
                              className="w-full py-2 text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:underline"
                            >
                              View all sets
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-display font-[800] text-slate-900 tracking-tight">Statistik Belajar Anda</h2>
                    <p className="text-slate-500 text-sm mt-1">Pantau grafik tren IPK (Sem-ke-Sem), pembagian waktu fokus, dan kepatuhan penyelesaian tugas akademis Anda.</p>
                  </div>
                  
                  <DashboardStats 
                    grades={state.grades || []} 
                    tasks={state.tasks || []} 
                    exams={state.exams || []} 
                  />
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-3xl font-display font-bold text-slate-900">Jadwal Kuliah Mingguan</h2>
                        {isAdmin ? (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            🛡️ Pengelola (Admin)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            🔒 Siswa (Baca Saja)
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mt-1">Daftar jam masuk kuliah dan informasi ruang kelas Anda yang resmi.</p>
                    </div>
                    {isAdmin ? (
                      <button 
                        onClick={() => setShowScheduleForm(true)}
                        className="bg-brand-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center gap-2 cursor-pointer bg-slate-900"
                      >
                        <Plus size={18} />
                        Tambah Jadwal Kuliah
                      </button>
                    ) : (
                      <div className="text-right text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 max-w-xs leading-relaxed">
                        ⚠️ Hubungi Admin jika terdapat ketidaksesuaian kelas.
                      </div>
                    )}
                  </div>
                  <Timetable 
                    schedule={filteredSchedule} 
                    onDelete={handleDeleteClass} 
                    isAdmin={isAdmin}
                    onEdit={(session) => {
                      setEditingSession(session);
                      setShowScheduleForm(true);
                    }}
                  />
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-3xl font-display font-bold text-slate-900">Tenggat & Penugasan Akademik</h2>
                        {isAdmin ? (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            🛡️ Pengelola (Admin)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            🔒 Siswa (Baca Saja)
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mt-1">Pantau rincian tugas kuliah, ujian, dan pengumuman tenggat waktu resmi kampus.</p>
                    </div>
                    {isAdmin ? (
                      <button 
                        onClick={() => setShowReminderForm(true)}
                        className="bg-brand-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center gap-2 cursor-pointer bg-slate-900"
                      >
                        <Plus size={18} />
                        Tambah Penugasan Baru
                      </button>
                    ) : (
                      <div className="text-right text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 max-w-xs leading-relaxed">
                        💡 Centang tugas selesai untuk tracking pribadi Anda.
                      </div>
                    )}
                  </div>

                  {/* Notification History */}
                  {(state.notifications || []).length > 0 && (
                    <div className="bg-brand-50 border border-brand-100 rounded-3xl p-6 mb-8">
                      <h3 className="text-sm font-bold text-brand-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Bell size={16} />
                        Notifikasi Terkini
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
                    isAdmin={isAdmin}
                    onToggle={(id) => {
                      const item = allReminders.find(r => r.id === id);
                      if (item?.type === 'task') toggleTask(id);
                      else toggleExam(id);
                    }} 
                    onDelete={(id) => {
                      const item = allReminders.find(r => r.id === id);
                      if (item?.type === 'task') {
                        handleDeleteTask(id);
                      } else {
                        handleDeleteExam(id);
                      }
                    }} 
                    onEdit={(item) => {
                      setEditingReminder(item);
                      setShowReminderForm(true);
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
                  <GPACalculator grades={state.grades} onAdd={addGrade} onUpdate={updateGrade} onDelete={deleteGrade} />
                </div>
              )}

              {activeTab === 'flashcards' && (
                <Flashcards 
                  sets={state.flashcardSets} 
                  onAdd={addFlashcardSet} 
                  onUpdate={updateFlashcardSet} 
                  onDelete={deleteFlashcardSet} 
                />
              )}

              {activeTab === 'studybuddy' && (
                <StudyBuddy />
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
                          {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : user.displayName?.charAt(0) || 'U'}
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
                            <p className="font-bold text-slate-900">Study Notifications</p>
                            <p className="text-xs text-slate-500">Receive alerts for upcoming deadlines</p>
                          </div>
                          <button 
                            onClick={() => updateSettings({ notificationsEnabled: !state.settings.notificationsEnabled })}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-colors duration-300",
                              state.settings.notificationsEnabled ? "bg-brand-600" : "bg-slate-300"
                            )}
                          >
                            <motion.div 
                              animate={{ x: state.settings.notificationsEnabled ? 24 : 4 }}
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </button>
                        </div>

                        {/* Custom Class Alarm Controller Widget */}
                        <div className="flex flex-col p-4 bg-slate-50 rounded-2xl gap-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-900">Notifikasi Alarm Kelas 🔔</p>
                              <p className="text-xs text-slate-500">Dapatkan peringatan manis s.d 15 menit sebelum perkuliahan</p>
                            </div>
                            <button 
                              onClick={() => {
                                if (typeof window !== 'undefined' && 'Notification' in window) {
                                  Notification.requestPermission().then(() => {
                                    showToast("Izin notifikasi peramban berhasil diaktifkan! 🔔", undefined, 'success');
                                  });
                                }
                              }}
                              className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-[10px] uppercase rounded-lg transition-all cursor-pointer"
                            >
                              {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' ? 'DIiZINKAN ✓' : 'MINTA IZIN'}
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-slate-200/50 pt-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uji Coba Alarm Suara</span>
                            <button
                              onClick={() => {
                                try {
                                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                  const osc = audioCtx.createOscillator();
                                  const gain = audioCtx.createGain();
                                  osc.connect(gain);
                                  gain.connect(audioCtx.destination);
                                  
                                  osc.type = 'sine';
                                  const nowTime = audioCtx.currentTime;
                                  
                                  osc.frequency.setValueAtTime(523.25, nowTime); // C5
                                  osc.frequency.setValueAtTime(659.25, nowTime + 0.15); // E5
                                  osc.frequency.setValueAtTime(783.99, nowTime + 0.3); // G5
                                  
                                  gain.gain.setValueAtTime(0.15, nowTime);
                                  gain.gain.exponentialRampToValueAtTime(0.001, nowTime + 0.8);
                                  
                                  osc.start(nowTime);
                                  osc.stop(nowTime + 0.8);
                                  
                                  showToast("Chime alarm manis berbunyi! 🎵 Bersiap perkuliahan.", undefined, 'success');
                                } catch (e) {
                                  showToast("Interaksi audio dibatasi peramban. Klik layar dahulu sebelum menguji.", undefined, 'error');
                                }
                              }}
                              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                            >
                              Test Alarm 🔔
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl opacity-50 cursor-not-allowed">
                          <div>
                            <p className="font-bold text-slate-900 font-display">Dark Mode</p>
                            <p className="text-xs text-slate-500">Coming soon in next update</p>
                          </div>
                          <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
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



      {/* Toast Notifications */}
      <div className="fixed bottom-24 md:bottom-6 right-0 md:right-6 left-0 md:left-auto px-4 md:px-0 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.15 } }}
              className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex items-center justify-between gap-4 pointer-events-auto w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Trash2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-100">{toast.message}</p>
                </div>
              </div>
              
              {toast.onUndo && (
                <button
                  onClick={() => {
                    toast.onUndo?.();
                    setToasts(prev => prev.filter(t => t.id !== toast.id));
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all shadow-sm active:scale-95 shrink-0"
                >
                  <RotateCcw size={12} className="stroke-[3px]" />
                  Batal Hapus
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-1 py-2 grid grid-cols-7 items-center z-50 transition-colors shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-1 rounded-xl transition-all",
              activeTab === item.id ? "text-brand-600" : "text-slate-400"
            )}
          >
            {item.id === 'settings' ? (
              <div className={cn(
                "w-6 h-6 rounded-full overflow-hidden border-2 transition-all",
                activeTab === 'settings' ? "border-brand-600 scale-110" : "border-slate-200"
              )}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-brand-100 text-brand-600 flex items-center justify-center text-[10px] font-bold">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            ) : (
              <item.icon size={20} />
            )}
            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
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
