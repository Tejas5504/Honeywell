/**
 * DashboardPage - Main security overview dashboard.
 * Fetches real data from the backend API and displays
 * stat cards, charts, heatmap, world map, MITRE matrix, live event stream, and alerts table.
 * Auto-refreshes every 30 seconds.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlineUsers,
  HiOutlineShieldExclamation,
  HiOutlineSignal,
  HiOutlineExclamationTriangle,
  HiOutlineChartBar,
} from 'react-icons/hi2';

import StatCard from '../components/dashboard/StatCard';
import ThreatTrend from '../components/dashboard/ThreatTrend';
import AttackPie from '../components/dashboard/AttackPie';
import RiskDistribution from '../components/dashboard/RiskDistribution';
import LoginHeatmap from '../components/dashboard/LoginHeatmap';
import WorldMap from '../components/dashboard/WorldMap';
import AlertsTable from '../components/dashboard/AlertsTable';
import MitreMatrix from '../components/dashboard/MitreMatrix';
import LiveEventTicker from '../components/dashboard/LiveEventTicker';
import { SkeletonChart, SkeletonCard, SkeletonTable } from '../components/shared/Skeleton';
import { dashboardAPI, alertsAPI } from '../api/client';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [
        statsRes,
        trendRes,
        pieRes,
        riskRes,
        heatmapRes,
        mapRes,
        alertsRes,
      ] = await Promise.allSettled([
        dashboardAPI.getStats(),
        dashboardAPI.getThreatTrend(),
        dashboardAPI.getAttackDistribution(),
        dashboardAPI.getRiskDistribution(),
        dashboardAPI.getLoginHeatmap(),
        dashboardAPI.getWorldMap(),
        alertsAPI.getAlerts({ page: 1, page_size: 10, min_risk: 50, distinct_entities: true }),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (trendRes.status === 'fulfilled') setTrendData(trendRes.value || []);
      if (pieRes.status === 'fulfilled') setPieData(
        (pieRes.value || []).map(d => ({
          name: d.name || d.attack_type,
          value: d.value ?? d.count ?? 0,
          key: d.attack_type || d.name
        }))
      );
      if (riskRes.status === 'fulfilled') setRiskData(
        (riskRes.value || []).map(d => ({
          range: d.range || d.bucket,
          count: d.count ?? 0
        }))
      );
      if (heatmapRes.status === 'fulfilled') setHeatmapData(heatmapRes.value || []);
      if (mapRes.status === 'fulfilled') setMapData(
        (mapRes.value || []).map(d => ({
          id: d.country,
          country: d.country,
          coordinates: [d.lon, d.lat],
          count: d.count,
        }))
      );
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value?.alerts || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const isLoading = loading && !stats;

  // Compute Attack Breakdown for MITRE matrix
  const attackBreakdown = pieData.reduce((acc, curr) => {
    acc[curr.key || curr.name] = curr.value;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security Operations Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time AI behavioral anomaly monitoring & threat intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            AI Engine Live
          </span>
          <span className="text-xs text-gray-500">Auto-refresh: 30s</span>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={stats?.total_users ?? 0}
              icon={HiOutlineUsers}
              color="#06b6d4"
              delay={0.1}
            />
            <StatCard
              title="Active Sessions"
              value={stats?.active_sessions ?? 0}
              icon={HiOutlineSignal}
              color="#3b82f6"
              delay={0.2}
            />
            <StatCard
              title="Threats Today"
              value={stats?.threats_today ?? 0}
              icon={HiOutlineExclamationTriangle}
              trend={stats?.threats_today > 0 ? 'up' : 'down'}
              trendValue={stats?.threats_today > 0 ? 'Active' : 'Low'}
              color="#f59e0b"
              delay={0.3}
            />
            <StatCard
              title="Critical Alerts"
              value={stats?.critical_alerts ?? 0}
              icon={HiOutlineShieldExclamation}
              trend={stats?.critical_alerts > 0 ? 'up' : 'down'}
              trendValue={stats?.critical_alerts > 0 ? 'Action Needed' : 'Clear'}
              color="#ef4444"
              pulse={stats?.critical_alerts > 0}
              delay={0.4}
            />
            <StatCard
              title="Avg Risk Score"
              value={stats?.avg_risk_score ?? 0}
              suffix="%"
              icon={HiOutlineChartBar}
              color="#8b5cf6"
              delay={0.5}
            />
          </>
        )}
      </div>

      {/* Charts Row 1: Trend + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold mb-4 text-white">30-Day Threat Trend</h2>
          {isLoading ? <SkeletonChart /> : <ThreatTrend data={trendData} />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-5"
        >
          <h2 className="text-lg font-semibold mb-4 text-white">Attack Distribution</h2>
          {isLoading ? <SkeletonChart /> : <AttackPie data={pieData} />}
        </motion.div>
      </div>

      {/* MITRE ATT&CK Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <MitreMatrix attackBreakdown={attackBreakdown} />
      </motion.div>

      {/* Charts Row 2: Risk + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-5"
        >
          <h2 className="text-lg font-semibold mb-4 text-white">Risk Score Distribution</h2>
          {isLoading ? <SkeletonChart /> : <RiskDistribution data={riskData} />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-card p-5"
        >
          <h2 className="text-lg font-semibold mb-4 text-white">Login Heatmap (7 Days)</h2>
          {isLoading ? <SkeletonChart /> : <LoginHeatmap data={heatmapData} />}
        </motion.div>
      </div>

      {/* Map Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="glass-card p-5"
      >
        <h2 className="text-lg font-semibold mb-4 text-white">Global Login Activity</h2>
        {isLoading ? <SkeletonChart className="h-[400px]" /> : <WorldMap data={mapData} />}
      </motion.div>

      {/* Alerts Table Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-5 border-b border-glass-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Recent High-Risk Alerts</h2>
          <Link
            to="/alerts"
            className="text-sm text-accent-cyan hover:text-accent-blue transition-colors"
          >
            View All Alerts →
          </Link>
        </div>
        {isLoading ? (
          <div className="p-5"><SkeletonTable /></div>
        ) : (
          <AlertsTable alerts={alerts} />
        )}
      </motion.div>

      {/* Live Event Stream Ticker */}
      <LiveEventTicker />
    </div>
  );
};

export default DashboardPage;
