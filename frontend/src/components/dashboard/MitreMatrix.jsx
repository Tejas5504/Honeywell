import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi2';

const MITRE_TACTICS = [
  {
    tactic: 'Credential Access',
    technique: 'T1110 — Brute Force',
    attackKey: 'brute_force',
    description: 'Rapid repeated authentication attempts to guess user passwords.',
    severity: 'High'
  },
  {
    tactic: 'Initial Access',
    technique: 'T1078 — Valid Accounts',
    attackKey: 'impossible_travel',
    description: 'Compromised credentials authenticated from geographically impossible locations.',
    severity: 'Critical'
  },
  {
    tactic: 'Credential Access',
    technique: 'T1056 — Credential Stuffing',
    attackKey: 'credential_stuffing',
    description: 'Automated testing of leaked username/password pairs across entities.',
    severity: 'High'
  },
  {
    tactic: 'Defense Evasion',
    technique: 'T1036 — Masquerading',
    attackKey: 'device_spoofing',
    description: 'Mismatched user agent / OS fingerprint bypassing device verification.',
    severity: 'Medium'
  },
  {
    tactic: 'Lateral Movement',
    technique: 'T1021 — Remote Services',
    attackKey: 'lateral_movement',
    description: 'Probing unauthorized sensitive endpoints across internal network microservices.',
    severity: 'Critical'
  },
  {
    tactic: 'Exfiltration',
    technique: 'T1048 — Alternative Protocol',
    attackKey: 'low_and_slow_exfiltration',
    description: 'Gradual, off-hours resource downloads building up over days/weeks.',
    severity: 'High'
  },
  {
    tactic: 'Persistence',
    technique: 'T1098 — Account Manipulation',
    attackKey: 'insider_drift',
    description: 'Legitimate entity slowly expanding privileges & resource footprint.',
    severity: 'Medium'
  }
];

const MitreMatrix = ({ attackBreakdown = {} }) => {
  return (
    <div className="glass-card p-6 rounded-xl border border-glass-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineShieldCheck className="w-6 h-6 text-accent-cyan" />
          <div>
            <h2 className="text-lg font-bold text-white">MITRE ATT&CK® Threat Matrix Mapping</h2>
            <p className="text-xs text-gray-400">Industry-standard threat tactics & technique classification</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-accent-blue/10 text-accent-cyan border border-accent-cyan/30">
          v14.1 Enterprise Matrix
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MITRE_TACTICS.map((item, idx) => {
          const count = attackBreakdown[item.attackKey] || 0;
          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                count > 0
                  ? 'bg-navy-900/90 border-accent-red/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                  : 'bg-navy-950/60 border-glass-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-accent-blue/10 text-accent-cyan">
                    {item.tactic}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    item.severity === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    {item.severity}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{item.technique}</h4>
                <p className="text-xs text-gray-400 leading-snug">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-glass-border flex items-center justify-between">
                <span className="text-xs text-gray-500">Detected Events</span>
                <span className={`text-base font-bold font-mono ${count > 0 ? 'text-accent-red' : 'text-gray-500'}`}>
                  {count}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MitreMatrix;
