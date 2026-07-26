import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  HiOutlineCircleStack, HiOutlinePlay, HiOutlineServerStack,
  HiOutlineShieldExclamation, HiOutlineUsers, HiOutlineBolt
} from 'react-icons/hi2';
import { generatorAPI } from '../api/client';
import { useApi } from '../hooks/useApi';
import { SkeletonCard } from '../components/shared/Skeleton';
import { ATTACK_TYPES } from '../utils/constants';

export default function DataGeneratorPage() {
  const [recordCount, setRecordCount] = useState(5000);
  const [selectedAttacks, setSelectedAttacks] = useState(
    Object.keys(ATTACK_TYPES).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );
  const [injecting, setInjecting] = useState(null);

  const { data: statusData, loading: statusLoading, refresh: refreshStatus } = useApi(generatorAPI.getStatus, true);
  const { data: generateResult, loading: generating, execute: generateData } = useApi(generatorAPI.generateData, false);

  const handleToggleAttack = (type) => {
    setSelectedAttacks(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleGenerate = async () => {
    const activeAttacks = Object.keys(selectedAttacks).filter(k => selectedAttacks[k]);
    if (activeAttacks.length === 0) {
      toast.error('Please select at least one attack type to generate');
      return;
    }
    
    try {
      await generateData({ count: recordCount, attack_types: activeAttacks });
      toast.success('Synthetic data generation completed successfully!');
      refreshStatus();
    } catch (err) {
      toast.error(err.message || 'Data generation failed');
    }
  };

  const handleInjectScenario = async (scenarioKey, label) => {
    setInjecting(scenarioKey);
    try {
      const res = await generatorAPI.injectScenario(scenarioKey);
      toast.success(`Live Attack Injected: ${label}! Alerts created.`);
      refreshStatus();
    } catch (err) {
      toast.error('Scenario injection failed');
    } finally {
      setInjecting(null);
    }
  };

  const LIVE_SCENARIOS = [
    { key: 'brute_force', label: 'Brute Force Campaign', icon: '💥', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
    { key: 'impossible_travel', label: 'Impossible Travel Intrusion', icon: '✈️', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    { key: 'lateral_movement', label: 'Lateral Movement Probe', icon: '🧭', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
    { key: 'low_and_slow', label: 'Low & Slow Exfiltration', icon: '🕵️', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Synthetic Data Generator & Live Attack Simulator</h1>
        <p className="text-gray-400 mt-1">Generate realistic SOC behavioral logs, inject AI-driven anomalies, or trigger 1-click live attack scenarios.</p>
      </div>

      {/* 1-Click Live Attack Simulator Bar */}
      <div className="glass-card p-6 rounded-xl border border-accent-cyan/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineBolt className="w-6 h-6 text-accent-cyan animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-white">1-Click Live Attack Injector (Judge Live Demo)</h2>
              <p className="text-xs text-gray-400">Instantly trigger an attack scenario and watch alerts pop up live on the Dashboard</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30">
            Real-Time Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {LIVE_SCENARIOS.map((sc) => (
            <motion.button
              key={sc.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={injecting !== null}
              onClick={() => handleInjectScenario(sc.key, sc.label)}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left ${sc.color} ${
                injecting === sc.key ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              <span className="text-xl">{sc.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-xs truncate flex items-center justify-between">
                  {sc.label}
                  {injecting === sc.key && <span className="animate-spin text-xs">⏳</span>}
                </div>
                <span className="text-[10px] text-gray-400">Click to inject live</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusLoading ? (
          <>
            <SkeletonCard height="100px" />
            <SkeletonCard height="100px" />
            <SkeletonCard height="100px" />
          </>
        ) : (
          <>
            <div className="glass-card p-6 rounded-xl border border-white/10 flex items-center gap-4">
              <div className="p-4 bg-accent-blue/20 text-accent-blue rounded-full">
                <HiOutlineServerStack className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Access Logs</p>
                <p className="text-2xl font-bold text-white">{statusData?.access_logs_count?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="glass-card p-6 rounded-xl border border-white/10 flex items-center gap-4">
              <div className="p-4 bg-accent-red/20 text-accent-red rounded-full">
                <HiOutlineShieldExclamation className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Anomalies/Alerts</p>
                <p className="text-2xl font-bold text-white">{statusData?.alerts_count?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="glass-card p-6 rounded-xl border border-white/10 flex items-center gap-4">
              <div className="p-4 bg-accent-emerald/20 text-accent-emerald rounded-full">
                <HiOutlineUsers className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tracked Entities</p>
                <p className="text-2xl font-bold text-white">{statusData?.entities_count?.toLocaleString() || 0}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-8">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <HiOutlineCircleStack className="w-6 h-6 text-accent-blue" />
            Generator Configuration
          </h2>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-300">Volume (Records to generate)</label>
            <div className="flex gap-4">
              {[1000, 5000, 10000, 50000].map((count) => (
                <button
                  key={count}
                  onClick={() => setRecordCount(count)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    recordCount === count
                      ? 'border-accent-blue bg-accent-blue/10 text-white'
                      : 'border-white/10 bg-navy-900/50 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {count.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-300">Injected Attack Taxonomy</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(ATTACK_TYPES).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedAttacks[key]
                      ? 'border-accent-blue/50 bg-navy-900/80 text-white'
                      : 'border-white/5 bg-navy-950/40 text-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedAttacks[key]}
                    onChange={() => handleToggleAttack(key)}
                    className="rounded border-gray-700 bg-navy-900 text-accent-blue focus:ring-accent-blue"
                  />
                  <span className="text-xs font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              generating
                ? 'bg-accent-blue/50 text-white/50 cursor-not-allowed'
                : 'bg-accent-blue text-white hover:bg-blue-600 shadow-lg shadow-accent-blue/20'
            }`}
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Generating Access Logs...
              </>
            ) : (
              <>
                <HiOutlinePlay className="w-5 h-5" />
                Generate Dataset & Ingest
              </>
            )}
          </button>
        </div>

        {/* Current Dataset Attack Breakdown */}
        <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Current Dataset Attack Distribution</h2>
          
          {statusData?.attack_breakdown && Object.keys(statusData.attack_breakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(statusData.attack_breakdown).map(([attackKey, count]) => (
                <div key={attackKey} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-300">{ATTACK_TYPES[attackKey] || attackKey}</span>
                    <span className="text-accent-cyan font-mono">{count.toLocaleString()} logs</span>
                  </div>
                  <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-blue to-accent-cyan rounded-full"
                      style={{
                        width: `${Math.min(100, (count / (statusData.access_logs_count || 1)) * 100 * 10)}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 text-sm">
              No attack breakdown data available. Generate dataset first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
