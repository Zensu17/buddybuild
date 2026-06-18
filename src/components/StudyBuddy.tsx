import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  BrainCircuit,
  RefreshCw,
  Plus,
  Trash2,
  History,
  Zap,
  User,
  HelpCircle,
  MessageCircleQuestion,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useAppState } from '../hooks/useAppState';
import { auth } from '../firebase';
import { ChatSession, ChatMessage } from '../types';

import 'katex/dist/katex.min.css';

const QUICK_PROMPTS = [
  { label: "Jelaskan Teknik Feynman", text: "Tolong jelaskan secara mendalam tentang Teknik Feynman untuk memahami konsep yang rumit, dan berikan contoh penerapannya." },
  { label: "Bantu Ringkas Materi", text: "Saya sedang mempelajari materi kuliah yang padat. Bisakah kamu menjelaskan bagaimana cara meringkas bab buku teks agar cepat dimengerti?" },
  { label: "Buat Soal Latihan", text: "Tolong buatkan 3 soal latihan beserta pembahasannya yang berkaitan dengan statistika probabilitas dasar." },
  { label: "Tips Redupsi Stres Belajar", text: "Saya merasa lelah dan burnout karena tumpukan tugas kuliah. Berikan beberapa tips praktis mindfulness dan penyegaran mental harian." }
];

const TUTOR_MODES = [
  {
    id: "socratic",
    name: "Tutor Sokratis (Metode Tanya Jawab)",
    description: "Sangat baik untuk melatih logika berpikir kritis. AI tidak akan memberi jawaban akhir secara langsung, melainkan mengajukan pertanyaan-pertanyaan progresif untuk menuntun Anda menyimpulkan dan menemukan konsepnya secara mandiri agar ingat lebih lama.",
    prompt: "Gunakan metode sokratis! JANGAN langsung memberi jawaban akhir, tanyakan pertanyaan pemandu satu per satu agar saya bisa menyimpulkannya sendiri secara kritis."
  },
  {
    id: "explainer",
    name: "Penyederhana Materi (ELI5)",
    description: "Sangat cocok untuk materi kuliah atau teori yang terkenal rumit dan membosankan. AI akan memecah teori tersebut menjadi penjelasan sederhana yang ramah pemula menggunakan analogi kehidupan sehari-hari yang sangat mudah dipahami.",
    prompt: "Jelaskan konsep akademis ini sejelas-jelasnya dengan analogi kehidupan sehari-hari yang sangat praktis, sederhana, dan ramah pemula namun tetap akurat secara ilmiah."
  },
  {
    id: "quiz",
    name: "Pembuat Soal & Kuis Latihan",
    description: "Menguji pemahaman Anda secara instan. Cukup masukkan rangkuman materi atau topik kuliah Anda, lalu AI akan merancang soal latihan pilihan ganda interaktif lengkap dengan kunci jawaban serta pembahasan mendalam di akhir.",
    prompt: "Buatkan kuis interaktif singkat (3 soal latihan pilihan ganda) tentang topik yang saya berikan lengkap dengan pilihan A, B, C, D serta kunci jawaban dan penjelasan rincinya secara terstruktur."
  },
  {
    id: "summarizer",
    name: "Pembuat Flashcard & Ringkasan",
    description: "Membagi bahan ujian atau bab buku yang sangat tebal menjadi ringkasan poin-poin krusial serta daftar tanya-jawab praktis berformat Front (Pertanyaan) & Back (Jawaban) agar siap dihafalkan secara efektif.",
    prompt: "Petakan topik ini menjadi rangkuman poin penting yang ringkas dan daftar tanya-jawab berformat Front: [Pertanyaan] dan Back: [Jawaban Inti] untuk mempermudah pembuatan flashcard belajar mandiri."
  }
];

export const StudyBuddy: React.FC = () => {
  const { state, addChatSession, updateChatSession, deleteChatSession, isAuthReady } = useAppState();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoCreatedRef = useRef(false);

  // Initialize default active session from state or fallback to temp
  useEffect(() => {
    if (isAuthReady) {
      if (state.chatSessions && state.chatSessions.length > 0) {
        if (!activeSessionId) {
          const sorted = [...state.chatSessions].sort((a, b) => 
            new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
          );
          setActiveSessionId(sorted[0].id);
        }
      } else {
        if (!activeSessionId) {
          setActiveSessionId('temp_new_session_id');
        }
      }
    }
  }, [isAuthReady, state.chatSessions, activeSessionId]);

  // Find active session
  const activeSession = state.chatSessions.find(s => s.id === activeSessionId) || {
    id: 'temp_new_session_id',
    title: 'Percakapan Baru',
    messages: [
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Halo! Saya **BuddyBuild AI Study Buddy** Anda. 🎓✨\n\nUntuk setiap topik yang Anda tanyakan, saya akan memberikan **penjelasan langkah-demi-langkah (step-by-step)** yang terstruktur, lengkap dengan **💡 Tips Belajar BuddyBuild** ringkas untuk mendampingi pemahaman Anda!\n\n*Silakan ketik pertanyaan Anda di bawah, atau pilih salah satu metode belajar interaktif di bawah ini untuk memandu sesi belajar kita!*",
        timestamp: new Date().toISOString()
      }
    ],
    tokensUsed: 0
  } as ChatSession;

  const sortedSessions = [...state.chatSessions].sort((a, b) => 
    new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession.messages.length]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading || !activeSessionId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    const isTemp = activeSessionId === 'temp_new_session_id';
    const targetSessionId = isTemp ? crypto.randomUUID() : activeSessionId;
    const currentMessages = [...activeSession.messages, userMsg];

    // Auto-rename session title based on first query if it's currently generic
    let updatedTitle = activeSession.title;
    if (activeSession.title === "Percakapan Baru" || activeSession.title === "Chat Sesi") {
      updatedTitle = textToSend.length > 32 ? textToSend.substring(0, 32) + '...' : textToSend;
    }

    // Save user message immediately to Firestore
    if (isTemp) {
      const freshSession: ChatSession = {
        id: targetSessionId,
        uid: auth.currentUser?.uid || '',
        title: updatedTitle,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        messages: currentMessages,
        tokensUsed: 0
      };
      await addChatSession(freshSession);
      setActiveSessionId(targetSessionId);
    } else {
      await updateChatSession(targetSessionId, {
        messages: currentMessages,
        title: updatedTitle,
        lastActive: new Date().toISOString()
      });
    }

    setInputText('');
    setIsLoading(true);

    // Build context
    let formattedPrompt = textToSend;
    if (selectedMode) {
      const modeObj = TUTOR_MODES.find(m => m.id === selectedMode);
      if (modeObj) {
        formattedPrompt = `[MODE: ${modeObj.name}]\nPedoman Belajar: ${modeObj.prompt}\n\nMateri/Pertanyaan Pengguna: ${textToSend}`;
      }
    }

    try {
      const response = await fetch('/buddybuild/study-buddy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: formattedPrompt,
          context: "Asisten Universitas BuddyBuild"
        })
      });

      const result = await response.json();

      let replyText = "";
      let responseTokens = undefined;

      if (result.success) {
        replyText = result.reply;
        responseTokens = result.tokens;
        
        if (replyText === "ERROR_API_KEY_MISSING" || replyText === "ERROR_API_KEY_INVALID") {
          replyText = "⚠️ **Kunci API Gemini Belum Dikonfigurasi**\n\nAdministrator perlu mengonfigurasi `GEMINI_API_KEY` melalui environment variable dev-server anda. Silakan laporkan ini atau tambahkan kunci di file `.env` proyek Anda agar saya bisa membalas secara cerdas!";
        } else if (replyText === "ERROR_QUOTA_EXCEEDED") {
          replyText = "⚠️ **Kuota API Terlampaui**\n\nLayanan API Gemini saat ini sedang menerima terlalu banyak lalu lintas data. Coba ulangi beberapa saat lagi.";
        }
      } else {
        replyText = `⚠️ **Gagal menghubungkan ke server**: ${result.error || "Akses ditolak"}`;
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toISOString(),
        promptTokens: responseTokens?.promptTokens,
        candidatesTokens: responseTokens?.candidatesTokens,
        totalTokens: responseTokens?.totalTokens
      };

      const finalMessages = [...currentMessages, assistantMsg];
      const sumTokens = finalMessages.reduce((sum, m) => sum + (m.totalTokens || 0), 0);

      await updateChatSession(targetSessionId, {
        messages: finalMessages,
        tokensUsed: sumTokens,
        lastActive: new Date().toISOString()
      });
    } catch (error) {
      console.error("Fetch error:", error);
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: "😭 **Oh tidak, gangguan koneksi jaringan!** Tidak dapat menghubungi server AI. Mohon periksa kembali apakah dev server berjalan lancar.",
        timestamp: new Date().toISOString()
      };
      await updateChatSession(targetSessionId, {
        messages: [...currentMessages, errMsg],
        lastActive: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = () => {
    if (isLoading) return;
    setActiveSessionId('temp_new_session_id');
    setSelectedMode(null);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(id);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 font-sans max-w-7xl mx-auto items-stretch">
      {/* Left Column: Sessions History & Tutor Modes */}
      <div className="xl:col-span-1 flex flex-col gap-6 h-[720px]">
        {/* Sessions History Panel */}
        <div className="bg-white border border-slate-150 p-5 rounded-[2rem] shadow-sm flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <History className="text-brand-600 animate-pulse" size={18} />
              <h3 className="text-sm font-display font-extrabold text-slate-800 tracking-tight">Riwayat Percakapan</h3>
            </div>
            <button
              onClick={handleCreateNewSession}
              disabled={isLoading}
              className="p-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 hover:text-brand-700 rounded-lg transition-all cursor-pointer border border-transparent hover:border-brand-150 disabled:opacity-55"
              title="Mulai Chat Baru"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {sortedSessions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-slate-400 font-medium">Belum ada riwayat chat.</p>
              </div>
            ) : (
              sortedSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (!isLoading) {
                        setActiveSessionId(session.id);
                        setSelectedMode(null);
                      }
                    }}
                    className={`group w-full p-3 rounded-xl flex items-center justify-between text-left cursor-pointer border transition-all ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100/70 border-transparent text-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <span className={`text-xs font-bold leading-tight block truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {session.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-mono ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                          {new Date(session.lastActive).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[8px] opacity-40">•</span>
                        <span className={`text-[9px] font-mono font-medium flex items-center gap-0.5 ${isActive ? 'text-amber-200' : 'text-amber-600'}`}>
                          <Zap size={8} /> {session.tokensUsed || 0} tok
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      disabled={isLoading}
                      className={`p-1.5 rounded-lg transition-all border border-transparent ${
                        isActive
                          ? 'text-slate-400 hover:text-red-400 hover:bg-white/10 hover:border-white/10'
                          : 'text-slate-350 hover:text-red-500 hover:bg-red-50 hover:border-red-100 opacity-0 group-hover:opacity-100'
                      }`}
                      title="Hapus riwayat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tutor Modes Panel */}
        <div className="bg-white border border-slate-150 p-5 rounded-[2rem] shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
            <BrainCircuit className="text-brand-600" size={18} />
            <h3 className="text-sm font-display font-extrabold text-slate-800">Mode Belajar AI</h3>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
            Ganti cara berpikir bimbingan asisten AI secara kreatif dan akademis:
          </p>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {TUTOR_MODES.map((mode) => {
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(isSelected ? null : mode.id)}
                  className={`w-full p-2.5 rounded-xl text-left border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-slate-200 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold block truncate">{mode.name}</span>
                    {isSelected && <Zap size={10} className="text-yellow-300 animate-pulse" />}
                  </div>
                  <p className={`text-[10px] mt-1 leading-relaxed ${isSelected ? 'text-brand-100' : 'text-slate-500'}`}>
                    {mode.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Chat Screen */}
      <div className="xl:col-span-3 bg-white border border-slate-150 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-[720px]">
        {/* Chat Area Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center shadow-xs">
              <Sparkles className="animate-pulse" size={20} />
            </div>
            <div>
              <h2 className="text-md font-display font-extrabold text-slate-900 leading-tight">
                {activeSession.title}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                <span>Partner Belajar Aktif</span>
                {selectedMode && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-brand-600 font-bold bg-brand-50 px-1.5 py-0.5 rounded text-[10px]">
                      {TUTOR_MODES.find(m => m.id === selectedMode)?.name}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Tokens Metric Badge */}
          <div className="flex items-center gap-2">
            <div className="text-[11px] bg-slate-50 border border-slate-150 text-slate-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-mono">
              <Zap size={11} className="text-amber-500" />
              <span>Sesi ini: <b>{activeSession.tokensUsed || 0}</b> token</span>
            </div>
          </div>
        </div>

        {/* Messages List Container */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-5 mb-4 scrollbar-thin">
          <AnimatePresence initial={false}>
            {activeSession.messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 text-white shadow-sm transition-all ${
                    isUser ? 'bg-slate-800' : 'bg-gradient-to-tr from-brand-500 to-brand-600'
                  }`}>
                    {isUser ? <User size={15} /> : <Sparkles size={15} />}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1 max-w-full">
                    <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed border transition-all ${
                      isUser
                        ? 'bg-slate-800 text-white border-slate-800 rounded-tr-none shadow-sm'
                        : 'bg-slate-50 text-slate-800 border-slate-150 rounded-tl-none'
                    }`}>
                      <div className={`markdown-body ${isUser ? 'user-chat text-white' : 'text-slate-850'}`}>
                        <ReactMarkdown 
                          remarkPlugins={[remarkMath]} 
                          rehypePlugins={[rehypeKatex]}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Metadata: Token Usage and Time */}
                    <div className={`flex flex-col gap-0.5 mt-0.5 ${isUser ? 'items-end pr-2' : 'items-start pl-2'}`}>
                      <span className="text-[9px] font-mono text-slate-450">
                        {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {!isUser && msg.totalTokens !== undefined && (
                        <div className="flex items-center gap-1 mt-0.5 text-[8.5px] font-mono text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/50 w-fit">
                          <Zap size={8} className="text-amber-500 animate-pulse" />
                          <span>{msg.totalTokens} token (Prompt: {msg.promptTokens} | Balasan: {msg.candidatesTokens})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mr-auto items-center"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Sparkles size={15} className="animate-spin text-brand-600" />
              </div>
              <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                <span>Asisten Anda sedang merumuskan jawaban terbaik...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions container */}
        {!isLoading && activeSession.messages.length <= 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4 space-y-2"
          >
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 block">
              Rekomendasi Topik Belajar Cepat:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.text)}
                  className="p-3 bg-slate-50 hover:bg-brand-50/50 border border-slate-100 hover:border-brand-100 rounded-xl text-[11px] text-slate-600 hover:text-brand-700 font-medium text-left leading-normal cursor-pointer transition-all flex items-center justify-between"
                >
                  <span>💡 {qp.label}</span>
                  <ChevronRight size={12} className="text-slate-400" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input Area Form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          className="flex items-center gap-2 pt-3 border-t border-slate-100"
        >
          <input
            type="text"
            disabled={isLoading}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isLoading ? "Sedang menanti jawaban asisten..." : "Tanyakan materi kuliah, teori matematika, coding, atau uji pemahaman..."}
            className="flex-1 px-5 py-4 bg-slate-50 border border-slate-150 rounded-2xl outline-none text-sm font-medium transition-all focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer shadow-sm text-sm"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Modal Konfirmasi Hapus Chat */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl p-6 text-center border border-slate-100 transform scale-100 transition-all duration-300">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h4 className="text-md font-bold text-slate-900 font-display mb-1.5">Hapus Riwayat Chat?</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus percakapan ini secara permanen dari riwayat belajar Anda?
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = sessionToDelete;
                  setSessionToDelete(null);
                  if (id !== 'temp_new_session_id') {
                    await deleteChatSession(id);
                  }
                  if (activeSessionId === id) {
                    const remaining = sortedSessions.filter(s => s.id !== id);
                    if (remaining.length > 0) {
                      setActiveSessionId(remaining[0].id);
                    } else {
                      setActiveSessionId('temp_new_session_id');
                    }
                  }
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Yakin, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
