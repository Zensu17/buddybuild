import React, { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { askStudyBuddy } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const StudyBuddy = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am your AI Study Buddy. How can I help you with your studies today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await askStudyBuddy(userMsg);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] glass rounded-2xl overflow-hidden border border-slate-200">
      <div className="p-4 bg-brand-600 text-white flex items-center gap-2">
        <Bot size={20} />
        <h3 className="font-display font-medium">AI Study Buddy</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-brand-100 text-brand-600" : "bg-white border border-slate-200 text-slate-600"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-brand-600 text-white rounded-tr-none" 
                  : "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about your courses..."
            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-brand-500 transition-all outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
