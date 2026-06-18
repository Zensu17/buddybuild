import React, { useState } from 'react';
import { Plus, Trash2, BookOpen, ChevronLeft, ChevronRight, RotateCw, Save, X, Layers, Sparkles, Loader2, Pencil } from 'lucide-react';
import { FlashcardSet, Flashcard } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { buddybuildApi } from '../services/buddybuildApi';

interface FlashcardsProps {
  sets: FlashcardSet[];
  onAdd: (set: Omit<FlashcardSet, 'id' | 'uid' | 'createdAt'>) => void;
  onUpdate: (id: string, set: Partial<FlashcardSet>) => void;
  onDelete: (id: string) => void;
}

export const Flashcards = ({ sets, onAdd, onUpdate, onDelete }: FlashcardsProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [activeSet, setActiveSet] = useState<FlashcardSet | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newCards, setNewCards] = useState<Flashcard[]>([]);

  // AI Generator state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCourse, setAiCourse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic || !aiCourse) return;
    setIsAiLoading(true);
    setAiError('');
    try {
      const resData = await buddybuildApi.generateFlashcards(aiTopic, aiCourse);
      if (resData.success && resData.data) {
        onAdd({
          title: resData.data.title,
          course: resData.data.course,
          cards: resData.data.cards.map((c: any) => ({
            id: crypto.randomUUID(),
            front: c.front,
            back: c.back
          }))
        });
        setIsGeneratingAI(false);
        setAiTopic('');
        setAiCourse('');
      } else {
        setAiError(resData.error || 'Gagal menghasilkan flashcard via AI.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddCard = () => {
    setNewCards([...newCards, { id: crypto.randomUUID(), front: '', back: '' }]);
  };

  const handleUpdateCard = (id: string, field: 'front' | 'back', value: string) => {
    setNewCards(newCards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleRemoveCard = (id: string) => {
    setNewCards(newCards.filter(c => c.id !== id));
  };

  const handleSaveSet = () => {
    if (!newTitle || !newCourse || newCards.length === 0) return;
    if (activeSet) {
      onUpdate(activeSet.id, { title: newTitle, course: newCourse, cards: newCards });
    } else {
      onAdd({ title: newTitle, course: newCourse, cards: newCards });
    }
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setActiveSet(null);
    setNewTitle('');
    setNewCourse('');
    setNewCards([]);
  };

  const startStudy = (set: FlashcardSet) => {
    setActiveSet(set);
    setStudyMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const editSet = (set: FlashcardSet) => {
    setActiveSet(set);
    setNewTitle(set.title);
    setNewCourse(set.course);
    setNewCards(set.cards);
    setIsAdding(true);
  };

  if (studyMode && activeSet) {
    const currentCard = activeSet.cards[currentCardIndex];
    return (
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between"
        >
          <button 
            onClick={() => setStudyMode(false)}
            className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors font-bold group"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-brand-50 transition-colors">
              <ChevronLeft size={18} />
            </div>
            Back to Sets
          </button>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 italic">
            Card {currentCardIndex + 1} <span className="mx-1 opacity-30">/</span> {activeSet.cards.length}
          </div>
        </motion.div>

        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentCardIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative h-80 perspective-1000 cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ 
                  duration: 0.6, 
                  type: 'spring', 
                  stiffness: 260, 
                  damping: 20 
                }}
                className="w-full h-full relative preserve-3d"
              >
                {/* Front */}
                <div 
                  className="absolute inset-0 backface-hidden glass rounded-[3rem] border-2 border-brand-100 flex flex-col items-center justify-center p-8 text-center shadow-lg overflow-hidden bg-white"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span 
                    className="absolute top-8 left-8 text-[10px] font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100"
                  >
                    Question
                  </span>
                  <h3 className="text-2xl md:text-3xl font-display font-extrabold text-slate-800 relative z-10 leading-tight">{currentCard.front}</h3>
                  <div className="absolute bottom-6 flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                    <RotateCw size={14} className="text-brand-500" />
                    Tap to reveal
                  </div>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 backface-hidden glass rounded-[3rem] border-2 border-brand-500 bg-brand-50/20 flex flex-col items-center justify-center p-8 text-center shadow-lg overflow-hidden"
                  style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                  <span className="absolute top-8 left-8 text-[10px] font-bold text-white uppercase tracking-widest bg-brand-600 px-3 py-1.5 rounded-full shadow-lg shadow-brand-200">Answer</span>
                  <p className="text-xl md:text-2xl font-display font-bold text-slate-800 leading-relaxed relative z-10">{currentCard.back}</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-6 mt-12">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={currentCardIndex === 0}
              onClick={() => {
                setCurrentCardIndex(prev => prev - 1);
                setIsFlipped(false);
              }}
              className="w-14 h-14 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md group"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={currentCardIndex === activeSet.cards.length - 1}
              onClick={() => {
                setCurrentCardIndex(prev => prev + 1);
                setIsFlipped(false);
              }}
              className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-brand-200 group"
            >
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Flashcards</h2>
          <p className="text-slate-500">Kuasai materi kuliah Anda dengan metode active recall & AI.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            type="button"
            onClick={() => setIsGeneratingAI(true)}
            className="bg-purple-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-150 flex items-center gap-2 cursor-pointer text-sm"
          >
            <Sparkles size={16} className="text-purple-100" />
            Buat via AI
          </button>
          <button 
            type="button"
            onClick={() => setIsAdding(true)}
            className="bg-brand-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-150 flex items-center gap-2 cursor-pointer text-sm"
          >
            <Plus size={16} />
            Manual Set
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isGeneratingAI && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
            >
              <form onSubmit={handleGenerateAI} className="flex flex-col">
                <div className="p-8 bg-purple-600 text-white">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                    <Sparkles size={20} className="text-purple-100" />
                  </div>
                  <h3 className="text-xl font-bold font-display leading-tight">Buat Set Flashcard via AI</h3>
                  <p className="text-purple-100 text-xs mt-1">Sistem AI akan otomatis merumuskan 6 kartu pertanyaan & jawaban relevan berdasarkan topik belajar yang Anda ketik.</p>
                </div>

                <div className="p-8 space-y-4">
                  {aiError && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold">
                      ⚠️ {aiError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Topik Belajar / Bahasan</label>
                    <input 
                      type="text" 
                      required
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Contoh: Reaksi Kimia Organik, Teori Komunikasi Massa, Hukum Agraria"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-300 text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Nama / Kode Mata Kuliah</label>
                    <input 
                      type="text" 
                      required
                      value={aiCourse}
                      onChange={(e) => setAiCourse(e.target.value)}
                      placeholder="Contoh: BIO101, Pengantar Sosiologi, Kimia Dasar"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-300 text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <button 
                    type="button"
                    disabled={isAiLoading}
                    onClick={() => {
                      setIsGeneratingAI(false);
                      setAiError('');
                    }}
                    className="flex-1 py-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 hover:bg-slate-100 transition-all text-xs cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isAiLoading || !aiTopic || !aiCourse}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-150 disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Merumuskan...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Buat Set AI
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-brand-600 text-white">
                <div>
                  <h3 className="text-2xl font-display font-bold">{activeSet ? 'Edit Flashcard Set' : 'Create New Set'}</h3>
                  <p className="text-brand-100 text-sm">Add questions and answers to study later.</p>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Set Title</label>
                    <input 
                      type="text" 
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Biology Midterm"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course</label>
                    <input 
                      type="text" 
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      placeholder="e.g. BIO101"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800">Cards ({newCards.length})</h4>
                    <button 
                      onClick={handleAddCard}
                      className="text-brand-600 text-sm font-bold flex items-center gap-1 hover:underline"
                    >
                      <Plus size={16} />
                      Add Card
                    </button>
                  </div>

                  <div className="space-y-4">
                    {newCards.map((card, idx) => (
                      <div key={card.id} className="p-4 bg-slate-50 rounded-2xl space-y-4 relative group">
                        <button 
                          onClick={() => handleRemoveCard(card.id)}
                          className="absolute -right-2 -top-2 w-8 h-8 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Front (Question)</label>
                            <textarea 
                              value={card.front}
                              onChange={(e) => handleUpdateCard(card.id, 'front', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none h-20"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Back (Answer)</label>
                            <textarea 
                              value={card.back}
                              onChange={(e) => handleUpdateCard(card.id, 'back', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none h-20"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                <button 
                  onClick={resetForm}
                  className="flex-1 py-4 bg-white text-slate-600 rounded-2xl font-bold border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSet}
                  disabled={!newTitle || !newCourse || newCards.length === 0}
                  className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 disabled:opacity-50"
                >
                  <Save size={20} className="inline mr-2" />
                  {activeSet ? 'Update Set' : 'Create Set'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sets.length === 0 ? (
        <div className="text-center py-20 glass rounded-[3rem] border-dashed border-2 border-slate-200">
          <Layers size={64} className="mx-auto mb-4 text-brand-200" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Flashcard Sets Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">Create sets to help you memorize key concepts and ace your exams.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => (
            <div key={set.id} className="glass p-6 rounded-[2rem] border-2 border-brand-100 space-y-4 group relative card-hover">
              <div className="flex justify-between items-start">
                <div className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {set.course}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => editSet(set)}
                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                    title="Edit Set"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(set.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{set.title}</h3>
                <p className="text-sm text-slate-500">{set.cards.length} cards</p>
              </div>
              <button 
                onClick={() => startStudy(set)}
                className="w-full py-3 bg-white border border-slate-100 text-brand-600 rounded-xl text-sm font-bold hover:bg-brand-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <BookOpen size={18} />
                Study Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
