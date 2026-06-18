import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudyQuote {
  text: string;
  author: string;
}

const STUDY_QUOTES: StudyQuote[] = [
  {
    text: "Pendidikan adalah senjata paling mematikan di dunia, karena dengan itu Anda bisa mengubah dunia.",
    author: "Nelson Mandela"
  },
  {
    text: "Jangan biarkan apa yang tidak bisa Anda lakukan menghalangi apa yang bisa Anda lakukan.",
    author: "John Wooden"
  },
  {
    text: "Masa depan adalah milik mereka yang percaya pada keindahan impian mereka.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "Kesuksesan bukanlah kebetulan. Ia adalah kerja keras, ketekunan, belajar, berkorban, dan cinta akan apa yang sedang kamu lakukan.",
    author: "Pelé"
  },
  {
    text: "Investasi terbaik dalam hidup adalah investasi pada otak, pengetahuan, dan kebiasaan hebat.",
    author: "Benjamin Franklin"
  },
  {
    text: "Belajar memang melelahkan, tapi akan jauh lebih melelahkan jika saat ini dan di masa depan kamu tidak memiliki ilmu.",
    author: "Dr. H. Moh. Hatta"
  },
  {
    text: "Orang-orang yang berhenti belajar akan menjadi pemilik masa lalu. Orang-orang yang masih terus belajar, akan menjadi pemilik masa depan.",
    author: "Mario Teguh"
  },
  {
    text: "Fokuslah pada proses, bukan hanya pada hasil. Setiap detik fokus yang kamu tabung hari ini adalah pilar kesuksesanmu esok.",
    author: "Inspirator Belajar"
  },
  {
    text: "Bila kamu tidak tahan penatnya belajar, maka kamu harus menanggung perihnya kebodohan.",
    author: "Imam Syafi'i"
  },
  {
    text: "Disiplin adalah jembatan penghubung antara cita-cita besar dan pencapaian luar biasa.",
    author: "Jim Rohn"
  },
  {
    text: "Kunci meraih kesuksesan akademik bukanlah kepintaran mutlak, melainkan konsistensi kecil yang dilakukan secara terus menerus tanpa menyerah.",
    author: "Ki Hajar Dewantara"
  },
  {
    text: "Setiap kegagalan dalam memahami bab pelajaran hari ini adalah satu langkah maju mendekati pemahaman sejati di hari esok. Lanjutkan langkahmu!",
    author: "Fokus Karir"
  },
  {
    text: "Mimpi tidak akan pernah menjadi kenyataan jika kita hanya berdiam diri tanpa belajar dan berusaha keras.",
    author: "B.J. Habibie"
  },
  {
    text: "Belajar adalah satu-satunya hal yang tidak pernah membuat pikiran lelah, tidak pernah takut, dan tidak pernah menyesal.",
    author: "Leonardo da Vinci"
  },
  {
    text: "Pendidikan bukanlah proses mengisi wadah yang kosong, melainkan proses menyalakan api pikiran agar terus membara.",
    author: "William Butler Yeats"
  },
  {
    text: "Hiduplah seolah-olah kamu akan mati besok. Belajarlah seolah-olah kamu akan hidup selamanya.",
    author: "Mahatma Gandhi"
  },
  {
    text: "Jangan takut salah saat belajar. Setiap kesalahan mengajarkan kita satu cara baru untuk melakukan sesuatu dengan lebih baik.",
    author: "Thomas Alva Edison"
  },
  {
    text: "Kesuksesan adalah totalitas dari usaha-usaha kecil yang diulang dan konsisten ditekuni hari demi hari tanpa kenal lelah.",
    author: "Robert Collier"
  },
  {
    text: "Pendidikan dasar terbaik adalah membaca buku bermutu, berdiskusi dengan orang bijak, dan membiasakan diri menulis gagasan.",
    author: "Tan Malaka"
  }
];

export const QuotesBanner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Pick random quote initially
    const rand = Math.floor(Math.random() * STUDY_QUOTES.length);
    setIndex(rand);

    // Auto rotate every 3 minutes
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % STUDY_QUOTES.length);
    }, 180000);

    return () => clearInterval(interval);
  }, []);

  const shuffleQuote = () => {
    let nextIndex = Math.floor(Math.random() * STUDY_QUOTES.length);
    while (nextIndex === index && STUDY_QUOTES.length > 1) {
      nextIndex = Math.floor(Math.random() * STUDY_QUOTES.length);
    }
    setIndex(nextIndex);
  };

  const activeQuote = STUDY_QUOTES[index];

  return (
    <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 rounded-[2.5rem] p-6 lg:p-8 text-white relative overflow-hidden shadow-xl shadow-brand-100 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Decorative vectors */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Quote size={130} className="transform rotate-180" />
      </div>
      
      <div className="flex-1 space-y-3 z-10 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 bg-white/12 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
          <Sparkles size={11} className="text-amber-300 fill-current animate-pulse" />
          Kata Inspirasi Belajar
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-2"
          >
            <p className="text-sm sm:text-base font-extrabold max-w-4xl leading-relaxed italic">
              "{activeQuote.text}"
            </p>
            <p className="text-[11px] font-bold text-brand-100 uppercase tracking-widest">
              — {activeQuote.author}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={shuffleQuote}
        className="px-4 py-2.5 bg-white/15 h-11 shrink-0 rounded-2xl hover:bg-white/20 transition-all font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 cursor-pointer z-10"
        title="Ganti Inspirasi"
      >
        <RefreshCw size={14} className="animate-spin-slow" />
        <span>Ganti Quotes</span>
      </button>
    </div>
  );
};
