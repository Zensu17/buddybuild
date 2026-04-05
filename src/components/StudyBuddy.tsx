import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, Key, Info } from 'lucide-react';
import { askStudyBuddy } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const StudyBuddy = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am your BuddyBuild AI assistant. How can I help you with your studies today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey || !!process.env.GEMINI_API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await askStudyBuddy(userMsg);
    
    if (response === "ERROR_API_KEY_MISSING" || response === "ERROR_API_KEY_INVALID") {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: "It looks like your Gemini API key is missing or invalid. Please select a valid API key to continue." 
      }]);
      setHasApiKey(false);
    } else if (response === "ERROR_QUOTA_EXCEEDED") {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: "I've reached my limit for now. Please try again in a few minutes." 
      }]);
    } else if (response.startsWith("ERROR:")) {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `I'm having trouble connecting: ${response.replace("ERROR: ", "")}` 
      }]);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] glass rounded-[2.5rem] overflow-hidden border-2 border-brand-100 transition-all">
      <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">BuddyBuild AI</h3>
            <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!hasApiKey && (
            <button 
              onClick={handleOpenKeyDialog}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-amber-100 transition-colors"
            >
              <Key size={12} />
              Select Key
            </button>
          )}
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "ml-auto flex-row-reverse max-w-[85%]" : "mr-auto max-w-[90%]",
                msg.role === 'system' && "mx-auto max-w-full w-full justify-center"
              )}
            >
              {msg.role !== 'system' && (
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
                  msg.role === 'user' ? "bg-brand-100 text-brand-600" : "bg-white border border-slate-100 text-slate-400"
                )}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
              )}
              
              {msg.role === 'system' ? (
                <div className="bg-amber-50 border border-amber-100 text-amber-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-3 shadow-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <div className="flex-1">
                    <p>{msg.content}</p>
                    {(msg.content.includes("API key") || msg.content.includes("invalid")) && (
                      <button 
                        onClick={handleOpenKeyDialog}
                        className="mt-2 flex items-center gap-1.5 font-bold uppercase tracking-widest text-[10px] hover:underline"
                      >
                        <Key size={12} />
                        Click here to select a key
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-brand-600 text-white rounded-tr-none" 
                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                )}>
                  <div className="markdown-body">
                    <Markdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.content}
                    </Markdown>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-brand-500" />
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        {!hasApiKey && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 text-blue-700 text-xs">
            <Info size={16} />
            <p>You may need to select an API key from the platform to use the Study Buddy.</p>
            <button 
              onClick={handleOpenKeyDialog}
              className="ml-auto font-bold uppercase tracking-widest hover:underline"
            >
              Select
            </button>
          </div>
        )}
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your courses..."
            className="w-full pl-5 pr-14 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-all shadow-md shadow-brand-200"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
