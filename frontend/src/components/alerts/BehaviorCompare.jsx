import React from 'react';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi2';

const CompareRow = ({ label, normal, current, isAnomaly }) => (
  <div className={`grid grid-cols-3 gap-4 py-3 border-b border-glass-border/50 ${isAnomaly ? 'bg-red-500/5 -mx-4 px-4' : ''}`}>
    <div className="text-sm text-gray-400 font-medium flex items-center">{label}</div>
    <div className="text-sm text-gray-300 flex items-center">{normal}</div>
    <div className={`text-sm flex items-center font-medium ${isAnomaly ? 'text-accent-red' : 'text-white'}`}>
      {current}
      {isAnomaly ? (
        <HiXCircle className="w-4 h-4 ml-2 text-accent-red" />
      ) : (
        <HiCheckCircle className="w-4 h-4 ml-2 text-accent-emerald" />
      )}
    </div>
  </div>
);

const BehaviorCompare = ({ profile, currentEvent }) => {
  // Mock comparison logic for demonstration
  const comparisons = [
    {
      label: 'Login Time',
      normal: profile.typicalHours || '09:00 - 18:00 EST',
      current: currentEvent.timeStr || '03:14 EST',
      isAnomaly: currentEvent.isTimeAnomaly || true
    },
    {
      label: 'Location',
      normal: profile.frequentLocations?.[0] || 'New York, US',
      current: currentEvent.location || 'Moscow, RU',
      isAnomaly: currentEvent.isLocationAnomaly || true
    },
    {
      label: 'Device / Browser',
      normal: profile.commonDevices?.[0] || 'MacBook Pro / Chrome',
      current: currentEvent.device || 'Windows PC / Tor',
      isAnomaly: currentEvent.isDeviceAnomaly || true
    },
    {
      label: 'IP Address',
      normal: 'Corporate VPN / Known Home IP',
      current: currentEvent.ip || '198.51.100.42 (Datacenter)',
      isAnomaly: currentEvent.isIpAnomaly || true
    },
    {
      label: 'Authentication Method',
      normal: 'MFA (Push Notification)',
      current: currentEvent.authMethod || 'Password Only (Fallback)',
      isAnomaly: currentEvent.isAuthAnomaly || true
    }
  ];

  return (
    <div className="glass-card overflow-hidden">
      <div className="grid grid-cols-3 gap-4 p-4 bg-navy-900 border-b border-glass-border">
        <div className="font-semibold text-gray-300">Attribute</div>
        <div className="font-semibold text-emerald-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          Normal Behavior
        </div>
        <div className="font-semibold text-red-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          Current Event
        </div>
      </div>
      
      <div className="p-4 pt-0">
        {comparisons.map((comp, idx) => (
          <CompareRow key={idx} {...comp} />
        ))}
      </div>
    </div>
  );
};

export default BehaviorCompare;
