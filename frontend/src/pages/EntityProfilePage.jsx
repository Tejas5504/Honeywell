import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineMapPin, HiOutlineComputerDesktop, HiOutlineClock } from 'react-icons/hi2';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { entitiesAPI } from '../api/client';
import Badge from '../components/shared/Badge';
import { SkeletonCard, SkeletonTable } from '../components/shared/Skeleton';
import { formatDateTime, formatRiskScore } from '../utils/formatters';
import { ATTACK_TYPES } from '../utils/constants';

export default function EntityProfilePage() {
  const { entityId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [riskHistory, setRiskHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profData, alertsData, riskData] = await Promise.all([
          entitiesAPI.getEntity(entityId),
          entitiesAPI.getEntityAlerts(entityId),
          entitiesAPI.getEntityRiskHistory(entityId)
        ]);
        setProfile(profData);
        setAlerts(alertsData);
        setRiskHistory(riskData);
      } catch (err) {
        setError(err.message || 'Failed to load entity data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-32 h-6 bg-white/5 animate-pulse rounded"></div>
        <SkeletonCard height="150px" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard height="300px" />
          <SkeletonCard height="300px" />
        </div>
        <SkeletonTable rows={5} columns={5} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20 text-accent-red">
        Failed to load entity details: {error}
        <br />
        <button onClick={() => navigate(-1)} className="mt-4 text-accent-blue hover:underline">Go Back</button>
      </div>
    );
  }

  // Format normal hours for bar chart
  const normalHoursData = profile.normal_hours 
    ? profile.normal_hours.map((val, idx) => ({ hour: `${idx}:00`, frequency: val }))
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition-colors gap-2">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header Card */}
      <div className="glass-card rounded-xl border border-white/10 p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{profile.entity_id}</h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <span className="capitalize">{profile.entity_type || 'User'}</span>
            <span>Total Logins: <strong className="text-white">{profile.total_logins?.toLocaleString()}</strong></span>
            {profile.last_seen && <span>Last Seen: {formatDateTime(profile.last_seen)}</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 mb-1">Current Risk Score</p>
          <div className={`text-4xl font-bold ${profile.current_risk > 75 ? 'text-accent-red' : profile.current_risk > 50 ? 'text-accent-orange' : 'text-accent-emerald'}`}>
            {formatRiskScore(profile.current_risk || 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Patterns */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Login Time Distribution (Normal)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={normalHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
                <XAxis dataKey="hour" stroke="#4b5563" fontSize={12} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f1425', borderColor: '#1c2541', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#3b82f6' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="frequency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk History */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Risk Score History (30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={12} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f1425', borderColor: '#1c2541', borderRadius: '8px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineComputerDesktop className="text-accent-blue" /> Frequent Devices
          </h2>
          <ul className="space-y-2">
            {profile.common_devices?.map((device, idx) => (
              <li key={idx} className="bg-navy-900/50 p-3 rounded border border-white/5 text-gray-300 text-sm">
                {device}
              </li>
            ))}
            {(!profile.common_devices || profile.common_devices.length === 0) && <li className="text-gray-500 text-sm">No device data available</li>}
          </ul>
        </div>
        
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineMapPin className="text-accent-blue" /> Frequent Locations
          </h2>
          <ul className="space-y-2">
            {profile.frequent_locations?.map((loc, idx) => (
              <li key={idx} className="bg-navy-900/50 p-3 rounded border border-white/5 text-gray-300 text-sm">
                {loc}
              </li>
            ))}
            {(!profile.frequent_locations || profile.frequent_locations.length === 0) && <li className="text-gray-500 text-sm">No location data available</li>}
          </ul>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 text-accent-red flex items-center gap-2">
          Recent Anomalies / Alerts
        </h2>
        {alerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Attack Type</th>
                  <th className="px-4 py-3 font-medium">Risk Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {alerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-gray-300">{formatDateTime(alert.timestamp)}</td>
                    <td className="px-4 py-3"><Badge type="severity" variant={alert.severity}>{ATTACK_TYPES[alert.attack_type] || alert.attack_type}</Badge></td>
                    <td className="px-4 py-3 font-mono text-white">{formatRiskScore(alert.risk_score)}</td>
                    <td className="px-4 py-3"><Badge type="status" variant={alert.status}>{alert.status}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/alerts/${alert.id}`)} className="text-accent-blue hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4">No recent alerts found for this entity.</p>
        )}
      </div>

    </motion.div>
  );
}
