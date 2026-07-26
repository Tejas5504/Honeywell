import React, { useState, useEffect } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineBell } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-navy-950/80 backdrop-blur-md border-b border-glass-border sticky top-0 z-10 px-6 flex items-center justify-between">
      <div className="flex items-center w-96 relative">
        <HiOutlineMagnifyingGlass className="absolute left-3 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search entities, IPs, alerts..." 
          className="w-full bg-navy-900 border border-glass-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm text-gray-400 font-mono">
          {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          <span className="mx-2">|</span>
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>

        <div className="relative">
          <button 
            className="relative p-2 rounded-full text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <HiOutlineBell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent-red rounded-full border-2 border-navy-950"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 glass-card rounded-lg shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-glass-border flex justify-between items-center bg-navy-900/50">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  <span className="text-xs text-accent-cyan cursor-pointer">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border-b border-glass-border/50 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-accent-red shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-white mb-1">Critical Anomaly Detected</p>
                          <p className="text-xs text-gray-400">Impossible travel from user_admin_88. Location jump from US to RU.</p>
                          <p className="text-xs text-gray-500 mt-2">Just now</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-glass-border bg-navy-900/50">
                  <span className="text-xs text-accent-blue hover:text-accent-cyan cursor-pointer">View all alerts</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 border-l border-glass-border pl-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-blue to-accent-cyan flex items-center justify-center font-bold text-sm">
            SA
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none mb-1">System Admin</p>
            <p className="text-xs text-gray-400 leading-none">SOC Analyst L3</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
