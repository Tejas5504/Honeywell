import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineRadio, HiOutlineShieldExclamation, HiOutlineCheckCircle } from 'react-icons/hi2';

const MOCK_STREAM_ENTITIES = [
  'alex.morgan', 'sarah.connor', 'david.miller', 'emily.watson',
  'michael.chen', 'service.k8s-ingress', 'admin.sec-ops', 'lisa.taylor'
];

const MOCK_RESOURCES = [
  '/api/v1/dashboard', '/api/v1/user/profile', '/api/v1/finance/payroll',
  '/api/v1/admin/secrets', '/api/v1/reports', '/api/v1/analytics'
];

const LiveEventTicker = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      entity: 'alex.morgan',
      ip: '192.168.1.45',
      resource: '/api/v1/dashboard',
      isAnomaly: false,
      attackType: 'Normal'
    },
    {
      id: 2,
      time: new Date().toLocaleTimeString(),
      entity: 'sarah.connor',
      ip: '185.220.101.5',
      resource: '/api/v1/admin/secrets',
      isAnomaly: true,
      attackType: 'Impossible Travel (RU → US)'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const isAnomaly = Math.random() < 0.25;
      const entity = MOCK_STREAM_ENTITIES[Math.floor(Math.random() * MOCK_STREAM_ENTITIES.length)];
      const resource = MOCK_RESOURCES[Math.floor(Math.random() * MOCK_RESOURCES.length)];
      const attackTypes = ['Brute Force', 'Impossible Travel', 'Lateral Movement', 'Device Spoofing'];
      const attackType = isAnomaly ? attackTypes[Math.floor(Math.random() * attackTypes.length)] : 'Normal';

      const newEvent = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        entity,
        ip: isAnomaly ? `185.220.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : `192.168.1.${Math.floor(Math.random() * 255)}`,
        resource,
        isAnomaly,
        attackType
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 5)]);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-4 rounded-xl border border-glass-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineRadio className="w-5 h-5 text-accent-cyan animate-pulse" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Real-Time Log Ingestion Feed (Live SIEM Stream)
          </h3>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Streaming Active
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-hidden font-mono text-xs">
        <AnimatePresence>
          {events.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-2.5 rounded-lg border flex items-center justify-between ${
                evt.isAnomaly
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : 'bg-navy-950/80 border-glass-border text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {evt.isAnomaly ? (
                  <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                    <HiOutlineShieldExclamation className="w-3.5 h-3.5" />
                    ANOMALY
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    NORMAL
                  </span>
                )}
                <span className="text-gray-400">{evt.time}</span>
                <span className="text-white font-bold">{evt.entity}</span>
                <span className="text-gray-500">[{evt.ip}]</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-accent-cyan truncate max-w-[200px]">{evt.resource}</span>
                {evt.isAnomaly && (
                  <span className="font-bold text-accent-red">{evt.attackType}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveEventTicker;
