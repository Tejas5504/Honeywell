import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineShieldExclamation,
  HiOutlineDevicePhoneMobile,
  HiOutlineCommandLine,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import { soarAPI } from '../../api/client';

const SOARPlaybook = ({ alertId, entityId, sourceIp, soarHistory = [], onMitigationComplete }) => {
  const [executing, setExecuting] = useState(null);
  const [logs, setLogs] = useState(soarHistory);

  const PLAYBOOK_ACTIONS = [
    {
      key: 'lock_user',
      label: 'Lock User Account',
      description: `Disable account '${entityId}' in IAM / Active Directory`,
      icon: HiOutlineLockClosed,
      color: 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
    },
    {
      key: 'revoke_tokens',
      label: 'Revoke Active Tokens',
      description: 'Invalidate all current session JWT OAuth tokens',
      icon: HiOutlineKey,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
    },
    {
      key: 'block_ip',
      label: 'Block IP on Firewall',
      description: `Add source IP '${sourceIp || 'Attacker IP'}' to WAF blocklist`,
      icon: HiOutlineShieldExclamation,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30'
    },
    {
      key: 'force_mfa',
      label: 'Enforce MFA Challenge',
      description: 'Prompt mandatory FIDO2 hardware token verification',
      icon: HiOutlineDevicePhoneMobile,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/40 hover:bg-purple-500/30'
    }
  ];

  const handleExecute = async (actionKey) => {
    setExecuting(actionKey);
    try {
      const res = await soarAPI.executePlaybook(alertId, actionKey);
      toast.success(`SOAR Playbook Executed: ${res.title}`);
      
      const newEntry = {
        action: res.action,
        title: res.title,
        detail: res.log,
        executed_at: res.executed_at,
        status: 'success'
      };
      setLogs((prev) => [newEntry, ...prev]);

      if (onMitigationComplete) {
        onMitigationComplete(res.alert);
      }
    } catch (err) {
      toast.error('Failed to execute SOAR playbook');
      console.error(err);
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div className="glass-card p-6 border border-accent-blue/30 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-cyan">
            <HiOutlineCommandLine className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Automated SOAR Response Playbooks</h2>
            <p className="text-xs text-gray-400">1-Click automated mitigation & security containment</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          SOAR Active
        </span>
      </div>

      {/* Playbook Action Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLAYBOOK_ACTIONS.map((act) => (
          <motion.button
            key={act.key}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={executing !== null}
            onClick={() => handleExecute(act.key)}
            className={`p-4 rounded-xl border flex items-start gap-4 transition-all text-left ${act.color} ${
              executing === act.key ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            <div className="p-2 rounded-lg bg-black/20 shrink-0">
              <act.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-sm flex items-center justify-between">
                {act.label}
                {executing === act.key && (
                  <span className="text-xs animate-spin font-mono">⏳</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1 leading-snug">{act.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Audit Log Box */}
      {logs.length > 0 && (
        <div className="bg-navy-950/80 rounded-lg border border-glass-border p-4 space-y-2">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HiOutlineCheckCircle className="text-emerald-400 w-4 h-4" />
            SOAR Playbook Execution Audit Log
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto font-mono text-xs">
            {logs.map((log, idx) => (
              <div key={idx} className="p-2 rounded bg-navy-900 border border-white/5 text-gray-300">
                <span className="text-emerald-400 font-bold">[{log.title}]</span> {log.detail}
                <div className="text-[10px] text-gray-500 mt-1">
                  Timestamp: {new Date(log.executed_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SOARPlaybook;
