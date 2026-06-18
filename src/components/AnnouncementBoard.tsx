import React, { useState, useEffect } from 'react';
import { Megaphone, Trash2, ShieldAlert, Sparkles, Plus, Calendar, BellRing, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, ClassSession } from '../types';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'akademik' | 'event' | 'darurat' | 'tips';
  date: string;
  author: string;
}

interface AnnouncementBoardProps {
  isAdmin: boolean;
  adminName?: string;
  onAddAdminTask: (task: { title: string; course: string; dueDate: string; priority: 'low' | 'medium' | 'high' }) => void;
  onAddAdminSchedule: (session: { name: string; day: number; startTime: string; endTime: string }) => void;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Pengumuman Jadwal UTS Genap 2026',
    content: 'Ujian Tengah Semester genap akan dilaksanakan mulai tanggal 22 Juni 2026 secara offline. Silakan pastikan kehadiran minimal 75%.',
    category: 'akademik',
    date: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    author: 'BAA Administrasi'
  },
  {
    id: '2',
    title: 'Pendaftaran Kompetisi Hackathon Kampus',
    content: 'Telah dibuka registrasi "Campus Innovation Hackathon 2026". Dapatkan pendanaan inkubasi dan sertifikat konversi SKS gratis!',
    category: 'event',
    date: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    author: 'KEMAHASISWAAN'
  },
  {
    id: '3',
    title: 'TIPS: Menjaga Fokus Dengan Pomodoro',
    content: 'Gunakan tab "Reminders / Pomodoro Timer" di sebelah kiri untuk menerapkan metode 25 menit fokus dan 5 menit istirahat demi efisiensi belajar selagi mendengarkan Lofi!',
    category: 'tips',
    date: new Date().toISOString(),
    author: 'Konselor Akademik'
  }
];

export const AnnouncementBoard = ({ isAdmin, adminName, onAddAdminTask, onAddAdminSchedule }: AnnouncementBoardProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'akademik' | 'event' | 'darurat' | 'tips'>('akademik');
  const [author, setAuthor] = useState('');
  const [showPostingForm, setShowPostingForm] = useState(false);

  useEffect(() => {
    if (adminName) {
      setAuthor(adminName);
    } else {
      setAuthor('Pengurus Kelas (Admin)');
    }
  }, [adminName]);
  
  // States for Admin quick schedule/task deliver
  const [pushType, setPushType] = useState<'announcement' | 'task' | 'schedule'>('announcement');
  const [itemTitle, setItemTitle] = useState('');
  const [itemCourse, setItemCourse] = useState('');
  const [itemDueDate, setItemDueDate] = useState('');
  const [itemPriority, setItemPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  // State for Schedule push
  const [schedDay, setSchedDay] = useState('1'); // Monday default
  const [schedStart, setSchedStart] = useState('08:00');
  const [schedEnd, setSchedEnd] = useState('10:00');

  // Load / Save Announcements
  useEffect(() => {
    const cached = localStorage.getItem('buddybuild_announcements');
    if (cached) {
      try {
        setAnnouncements(JSON.parse(cached));
      } catch (e) {
        setAnnouncements(DEFAULT_ANNOUNCEMENTS);
      }
    } else {
      setAnnouncements(DEFAULT_ANNOUNCEMENTS);
      localStorage.setItem('buddybuild_announcements', JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    }
  }, []);

  const saveAnnouncements = (list: Announcement[]) => {
    setAnnouncements(list);
    localStorage.setItem('buddybuild_announcements', JSON.stringify(list));
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const finalAuthor = author.trim() || adminName || 'Admin Utama';

    const newAnn: Announcement = {
      id: crypto.randomUUID(),
      title,
      content,
      category,
      date: new Date().toISOString(),
      author: finalAuthor
    };

    saveAnnouncements([newAnn, ...announcements]);
    setTitle('');
    setContent('');
    setAuthor(finalAuthor); // sync input
    setShowPostingForm(false);
  };

  const handlePushTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !itemCourse || !itemDueDate) return;

    onAddAdminTask({
      title: itemTitle,
      course: itemCourse,
      dueDate: itemDueDate,
      priority: itemPriority
    });

    // Also auto-post a small alert announcement notifying students of new task
    const alertAnn: Announcement = {
      id: crypto.randomUUID(),
      title: `Penugasan Baru: ${itemTitle}`,
      content: `Admin telah menambahkan tugas baru di reminders untuk mata kuliah ${itemCourse} dengan tenggat ${new Date(itemDueDate).toLocaleString('id-ID')}. Mohon dikerjakan tepat waktu!`,
      category: 'akademik',
      date: new Date().toISOString(),
      author: author || adminName || 'Admin Kelas'
    };
    saveAnnouncements([alertAnn, ...announcements]);

    setItemTitle('');
    setItemCourse('');
    setItemDueDate('');
    setShowPostingForm(false);
  };

  const handlePushSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !schedStart || !schedEnd) return;

    onAddAdminSchedule({
      name: itemTitle,
      day: parseInt(schedDay),
      startTime: schedStart,
      endTime: schedEnd
    });

    // Also post announcement
    const alertAnn: Announcement = {
      id: crypto.randomUUID(),
      title: `Jadwal Pengganti/Baru: ${itemTitle}`,
      content: `Jadwal perkuliahan baru telah diposting pada kalender belajar Anda: Setiap hari ${['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][parseInt(schedDay)]} pukul ${schedStart} - ${schedEnd}.`,
      category: 'akademik',
      date: new Date().toISOString(),
      author: author || adminName || 'Admin Administrasi'
    };
    saveAnnouncements([alertAnn, ...announcements]);

    setItemTitle('');
    setShowPostingForm(false);
  };

  const handleDeleteAnnouncement = (id: string) => {
    saveAnnouncements(announcements.filter(a => a.id !== id));
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'darurat':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500', label: 'Darurat ⚠️' };
      case 'event':
        return { bg: 'bg-cyan-50 text-cyan-700 border-cyan-100', dot: 'bg-cyan-500', label: 'Kegiatan 🎪' };
      case 'tips':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', label: 'Fokus Tips 💡' };
      default:
        return { bg: 'bg-brand-50 text-brand-700 border-brand-100', dot: 'bg-brand-600', label: 'Akademik 🎓' };
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 lg:p-7 border border-slate-150 shadow-xs flex flex-col space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100 shadow-xs">
            <Megaphone size={20} className="animate-wiggle" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-800 leading-tight">Papan Pengumuman Digital</h4>
            <p className="text-xs text-slate-400">Pemberitahuan terkini, info tugas, dan pengumuman kelas</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setShowPostingForm(!showPostingForm);
              setPushType('announcement');
            }}
            className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus size={14} />
            Post Sesuatu (Admin)
          </button>
        )}
      </div>

      {/* ADMIN POSTING FORM */}
      <AnimatePresence>
        {isAdmin && showPostingForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-50 rounded-3xl p-5 border border-slate-200"
          >
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
              <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                <ShieldAlert size={10} /> FITUR AKSES PENGURUS KELAS/ADMIN
              </span>
              <span className="text-xs font-semibold text-slate-500">Pilih jenis informasi yang ingin dikirimkan:</span>
            </div>

            <div className="flex gap-2 mb-4">
              {(['announcement', 'task', 'schedule'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPushType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pushType === type ? 'bg-brand-600 text-white' : 'bg-white hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {type === 'announcement' ? '📢 Pengumuman' : type === 'task' ? '✏️ Tugas Baru' : '📅 Tambah Jadwal'}
                </button>
              ))}
            </div>

            {/* FORM 1: ANNOUNCEMENT */}
            {pushType === 'announcement' && (
              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Judul Pengumuman</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan judul..."
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-500 outline-none text-slate-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 cursor-pointer"
                    >
                      <option value="akademik">Akademik 🎓</option>
                      <option value="event">Lomba & Kegiatan 🎪</option>
                      <option value="darurat">Darurat ⚠️</option>
                      <option value="tips">Tips Belajar 💡</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Pembuat (Author)</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Anda atau Jabatan..."
                      value={author}
                      onChange={e => setAuthor(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-500 outline-none text-slate-850"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deskripsi Lengkap</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Isi rincian informasi..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-brand-500 outline-none text-slate-800"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostingForm(false)}
                    className="px-3.5 py-1.5 text-xs font-bold bg-white text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Kirim Pengumuman
                  </button>
                </div>
              </form>
            )}

            {/* FORM 2: TASK */}
            {pushType === 'task' && (
              <form onSubmit={handlePushTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Tugas Admin</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama tugas..."
                      value={itemTitle}
                      onChange={e => setItemTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-500 outline-none text-slate-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mata Kuliah</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kalkulus, Fisika"
                      value={itemCourse}
                      onChange={e => setItemCourse(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-500 outline-none text-slate-850"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tenggat Waktu (Due Date)</label>
                    <input
                      type="datetime-local"
                      required
                      value={itemDueDate}
                      onChange={e => setItemDueDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prioritas</label>
                    <select
                      value={itemPriority}
                      onChange={e => setItemPriority(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 cursor-pointer"
                    >
                      <option value="low">Rendah (Hijau)</option>
                      <option value="medium">Sedang (Kuning)</option>
                      <option value="high">Darurat / Penting (Merah)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostingForm(false)}
                    className="px-3.5 py-1.5 text-xs font-bold bg-white text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Masukkan & Kirim Tugas
                  </button>
                </div>
              </form>
            )}

            {/* FORM 3: SCHEDULE */}
            {pushType === 'schedule' && (
              <form onSubmit={handlePushSchedule} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Kelas / Kuliah Baru</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama kelas..."
                      value={itemTitle}
                      onChange={e => setItemTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-500 outline-none text-slate-850"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hari Kuliah</label>
                    <select
                      value={schedDay}
                      onChange={e => setSchedDay(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 cursor-pointer"
                    >
                      <option value="1">Senin</option>
                      <option value="2">Selasa</option>
                      <option value="3">Rabu</option>
                      <option value="4">Kamis</option>
                      <option value="5">Jumat</option>
                      <option value="6">Sabtu</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jam Mulai</label>
                    <input
                      type="time"
                      required
                      value={schedStart}
                      onChange={e => setSchedStart(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-705"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jam Selesai</label>
                    <input
                      type="time"
                      required
                      value={schedEnd}
                      onChange={e => setSchedEnd(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-705"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostingForm(false)}
                    className="px-3.5 py-1.5 text-xs font-bold bg-white text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Sematkan Kelas Baru
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ANNOUNCEMENT FEED LIST */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {announcements.map(ann => {
          const theme = getCategoryTheme(ann.category);
          return (
            <div
              key={ann.id}
              className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl relative transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-lg border uppercase tracking-wider ${theme.bg}`}>
                    {theme.label}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {new Date(ann.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="text-slate-350 hover:text-red-500 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all cursor-pointer p-0.5 rounded-lg"
                    title="Hapus"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <h5 className="font-extrabold text-xs text-slate-800 mt-2 hover:text-brand-600 transition-colors">
                {ann.title}
              </h5>
              
              <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium whitespace-pre-wrap">
                {ann.content}
              </p>

              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-450 mt-2 pl-3 border-l-2 border-slate-200">
                <span>Diposting oleh:</span> 
                <span className="text-slate-600">{ann.author || adminName || 'Admin Utama'}</span>
              </div>
            </div>
          );
        })}

        {announcements.length === 0 && (
          <div className="text-center py-10 text-slate-450 italic text-xs">Belum ada pengumuman hari ini.</div>
        )}
      </div>
    </div>
  );
};
