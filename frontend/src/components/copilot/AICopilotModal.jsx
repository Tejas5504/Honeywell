import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSparkles,
  HiXMark,
  HiPaperAirplane,
  HiOutlineShieldCheck,
  HiOutlineCpuChip
} from 'react-icons/hi2';
import { copilotAPI } from '../../api/client';

const QUICK_PROMPTS = [
  'Summarize top threats today',
  'How to contain brute force?',
  'Explain impossible travel',
  'How is risk score computed?'
];

const AICopilotModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'copilot',
      text: '### 👋 **CyberShield SOC AI Assistant**\n\nI am your AI Security Copilot. I analyze threat metrics, risk scores, and attack vectors in real-time.\n\nHow can I assist your investigation today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await copilotAPI.chat(query);
      const copilotMsg = { sender: 'copilot', text: res.response };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'copilot', text: '⚠️ **Error**: Failed to connect to AI Security Assistant service.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-accent-blue to-accent-cyan text-white px-4 py-3 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2.5 font-bold text-sm border border-white/20 hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all"
      >
        <HiOutlineSparkles className="w-5 h-5 animate-pulse text-amber-300" />
        AI Security Copilot
      </motion.button>

      {/* Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-20 right-6 z-50 w-96 md:w-[420px] h-[580px] glass-card rounded-2xl border border-accent-cyan/40 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-navy-950/90 border-b border-glass-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
                  <HiOutlineCpuChip className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    CyberShield Copilot
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </h3>
                  <p className="text-[11px] text-gray-400">SOC Assistant • Active Threat Context</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="p-3 bg-navy-900/50 border-b border-glass-border flex gap-1.5 overflow-x-auto scrollbar-none">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-full bg-navy-800 text-[11px] text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/10 whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 ${
                      msg.sender === 'user'
                        ? 'bg-accent-blue text-white rounded-br-none'
                        : 'bg-navy-900/90 text-gray-200 border border-glass-border rounded-bl-none shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-navy-900 p-3 rounded-2xl border border-glass-border flex items-center gap-2 text-gray-400 text-xs">
                    <HiOutlineSparkles className="w-4 h-4 animate-spin text-accent-cyan" />
                    Analyzing Threat Intelligence...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-3 bg-navy-950/90 border-t border-glass-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask CyberShield Copilot..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-navy-900 border border-glass-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 bg-accent-blue text-white rounded-xl hover:bg-accent-blue/80 disabled:opacity-40 transition-colors"
                >
                  <HiPaperAirplane className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilotModal;
