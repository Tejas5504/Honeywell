import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineExclamationTriangle, 
  HiOutlineXCircle, HiOutlineClock, HiOutlineMapPin, HiOutlineComputerDesktop
} from 'react-icons/hi2';
import { alertsAPI } from '../api/client';
import { useApi } from '../hooks/useApi';
import Badge from '../components/shared/Badge';
import RiskGauge from '../components/alerts/RiskGauge';
import BehaviorCompare from '../components/alerts/BehaviorCompare';
import SOARPlaybook from '../components/alerts/SOARPlaybook';
import { SkeletonCard, SkeletonText } from '../components/shared/Skeleton';
import { formatDateTime, getTimeAgo, formatRiskScore } from '../utils/formatters';
import { ATTACK_TYPES } from '../utils/constants';

export default function AlertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: alert, loading, error, refresh } = useApi(() => alertsAPI.getAlertById(id), true);

  const handleStatusUpdate = async (status) => {
    try {
      await alertsAPI.updateAlertStatus(id, status);
      toast.success(`Alert marked as ${status.replace('_', ' ')}`);
      refresh();
    } catch (err) {
      toast.error('Failed to update alert status');
    }
  };

  if (loading && !alert) {
    return (
      <div className="space-y-6">
        <SkeletonText width="150px" height="24px" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard height="300px" />
            <SkeletonCard height="400px" />
          </div>
          <div className="space-y-6">
            <SkeletonCard height="400px" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="text-center py-20 text-accent-red">
        Failed to load alert details. <br />
        <button onClick={() => navigate('/alerts')} className="mt-4 text-accent-blue hover:underline">
          Return to Alerts
        </button>
      </div>
    );
  }

  const {
    entity_id,
    risk_score,
    attack_type,
    status,
    severity,
    timestamp,
    reasons = [],
    geo_location,
    source_ip,
    device_fingerprint,
    resource_accessed,
    current_behavior,
    normal_behavior
  } = alert;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white transition-colors gap-2"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Alert ID: {id}</span>
          <Badge variant={status === 'new' ? 'new' : status === 'investigating' ? 'investigating' : status === 'resolved' ? 'resolved' : 'false_positive'} type="status">
            {status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Entity & Context */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white cursor-pointer hover:text-accent-blue transition-colors" onClick={() => navigate(`/entities/${entity_id}`)}>
                  {entity_id}
                </h2>
                <p className="text-gray-400 flex items-center gap-2 mt-1">
                  <HiOutlineClock className="w-4 h-4" /> {formatDateTime(timestamp)} ({getTimeAgo(timestamp)})
                </p>
              </div>
              <Badge variant={severity} type="severity">
                {severity.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-navy-900/50 p-4 rounded-lg border border-white/5">
                <span className="text-xs text-gray-500 block mb-1">Source IP</span>
                <span className="text-sm font-mono text-white">{source_ip || 'Unknown'}</span>
              </div>
              <div className="bg-navy-900/50 p-4 rounded-lg border border-white/5">
                <span className="text-xs text-gray-500 block mb-1">Location</span>
                <span className="text-sm text-white flex items-center gap-1">
                  <HiOutlineMapPin className="text-accent-blue w-4 h-4" />
                  {geo_location?.city}, {geo_location?.country}
                </span>
              </div>
              <div className="bg-navy-900/50 p-4 rounded-lg border border-white/5">
                <span className="text-xs text-gray-500 block mb-1">Device</span>
                <span className="text-sm text-white flex items-center gap-1">
                  <HiOutlineComputerDesktop className="text-gray-400 w-4 h-4" />
                  {device_fingerprint || 'Unknown'}
                </span>
              </div>
              <div className="bg-navy-900/50 p-4 rounded-lg border border-white/5">
                <span className="text-xs text-gray-500 block mb-1">Resource</span>
                <span className="text-sm text-white">{resource_accessed || 'System'}</span>
              </div>
            </div>
          </div>

          {/* Behavior Comparison */}
          {current_behavior && normal_behavior && (
            <div className="glass-card rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Behavioral Anomaly Analysis</h3>
              <BehaviorCompare currentEvent={current_behavior} profile={normal_behavior} />
            </div>
          )}

          {/* SOAR Automated Response Playbooks */}
          <SOARPlaybook 
            alertId={id} 
            entityId={entity_id} 
            sourceIp={source_ip} 
            soarHistory={alert.soar_history || []} 
            onMitigationComplete={refresh} 
          />
        </div>

        {/* Right Column: AI Analysis & Actions */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl border border-white/10 p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-6 text-left">Risk Assessment</h3>
            <div className="flex justify-center mb-4">
              <RiskGauge score={risk_score} />
            </div>
            
            <div className="mt-6 text-left">
              <h4 className="text-sm font-medium text-gray-400 mb-3">AI Explanation</h4>
              <div className="space-y-2">
                <div className="bg-navy-900/50 p-3 rounded text-sm text-white border-l-4 border-accent-red flex items-center gap-2">
                  <span className="font-semibold text-accent-red">Detected:</span> 
                  {ATTACK_TYPES[attack_type] || attack_type}
                </div>
                {reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-300 py-1">
                    <HiOutlineExclamationTriangle className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleStatusUpdate('investigating')}
                disabled={status === 'investigating'}
                className="w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-accent-amber/20 text-accent-amber hover:bg-accent-amber/30 border border-accent-amber/50"
              >
                <HiOutlineClock className="w-5 h-5" /> Mark as Investigating
              </button>
              
              <button 
                onClick={() => handleStatusUpdate('resolved')}
                disabled={status === 'resolved'}
                className="w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-accent-emerald/20 text-accent-emerald hover:bg-accent-emerald/30 border border-accent-emerald/50"
              >
                <HiOutlineCheckCircle className="w-5 h-5" /> Resolve Threat
              </button>
              
              <button 
                onClick={() => handleStatusUpdate('false_positive')}
                disabled={status === 'false_positive'}
                className="w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-500/50"
              >
                <HiOutlineXCircle className="w-5 h-5" /> Mark False Positive
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
