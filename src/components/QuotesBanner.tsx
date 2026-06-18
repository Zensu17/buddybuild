import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buddybuildApi, StudyQuote } from '../services/buddybuildApi';

const FALLBACK_QUOTES: StudyQuote[] = [
  {
    text: 'Pendidikan adalah senjata paling mematikan di dunia, karena dengan itu Anda bisa mengubah dunia.',
    author: 'Nelson Mandela',
  },
  {
    text: 'Belajar adalah satu-satunya hal yang tidak pernah membuat pikiran lelah, tidak pernah takut, dan tidak pernah menyesal.',
    author: 'Leonardo da Vinci',
  },
];

export const QuotesBanner = () => {
  const [quotes, setQuotes] = useState<StudyQuote[]>(FALLBACK_QUOTES);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    buddybuildApi.getQuotes()
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setQuotes(res.data);
          setIndex(Math.floor(Math.random() * res.data.length));
        }
      })
      .catch(() => {
        setIndex(Math.floor(Math.random() * FALLBACK_QUOTES.length));
      });
  }, []);

  useEffect(() => {
    if (quotes.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 180000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const shuffleQuote = () => {
    if (quotes.length <= 1) return;
    let nextIndex = Math.floor(Math.random() * quotes.length);
    while (nextIndex === index) {
      nextIndex = Math.floor(Math.random() * quotes.length);
    }
    setIndex(nextIndex);
  };

  const activeQuote = quotes[index] ?? FALLBACK_QUOTES[0];

  return (
    <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 rounded-[2.5rem] p-6 lg:p-8 text-white relative overflow-hidden shadow-xl shadow-brand-100 flex flex-col md:flex-row items-center justify-between gap-6">
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
