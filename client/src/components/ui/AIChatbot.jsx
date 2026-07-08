// src/components/ui/AIChatbot.jsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Brain, Loader2 } from 'lucide-react';
import api from '../../utils/api';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! I am CivicSense AI assistant. Ask me anything about constituency grievances, resolution progress, or guidelines for reporting local civic issues.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: userText });
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'Sorry, I am facing server connectivity errors. Please try again shortly.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            className="w-80 sm:w-96 h-[440px] bg-[#122438] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col mb-4 text-left"
          >
            {/* Header */}
            <div className="bg-[#0F2A44] px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E0A030] flex items-center justify-center">
                  <Brain size={14} className="text-[#0F2A44]" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs tracking-wide">CivicSense Assistant</h4>
                  <span className="text-[9px] text-[#E0A030] font-bold uppercase tracking-wider">AI Advisor</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white p-1 rounded transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Message Pane */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0B0F19]/40"
            >
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#E0A030] text-[#0F2A44] font-semibold rounded-br-none'
                      : 'bg-[#1D2E44] border border-white/5 text-[#E2E8F0] rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#1D2E44] border border-white/5 text-[#E2E8F0] p-3 rounded-lg rounded-bl-none flex items-center gap-2 text-xs">
                    <Loader2 size={13} className="animate-spin text-[#E0A030]" />
                    <span>Analyzing constituency matrix...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleSend}
              className="p-3 bg-[#0F2A44] border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 px-3 py-2 bg-[#0B0F19] border border-white/10 rounded text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#E0A030] transition-colors"
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 rounded bg-[#E0A030] disabled:bg-[#E0A030]/20 hover:bg-[#F0B040] text-[#0F2A44] transition-colors cursor-pointer"
              >
                <Send size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#E0A030] hover:bg-[#F0B040] text-[#0F2A44] shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer z-50"
        title="CivicSense AI Assistant"
      >
        <Sparkles size={20} />
      </button>
    </div>
  );
}
