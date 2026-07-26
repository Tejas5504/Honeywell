import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CHART_TOOLTIP_STYLE } from '../../utils/constants';

const RiskDistribution = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        No risk data available.
      </div>
    );
  }
  // Color mapping based on risk score range
  const getColor = (range) => {
    if (range.includes('0-25')) return '#10b981'; // success
    if (range.includes('26-50')) return '#f59e0b'; // warning
    if (range.includes('51-75')) return '#f97316'; // orange
    return '#ef4444'; // danger
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 shadow-xl">
          <p className="text-gray-300 text-xs mb-1">Score Range: <span className="text-white font-medium">{label}</span></p>
          <p className="text-gray-300 text-xs">Events: <span className="font-bold text-white">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
          <XAxis 
            dataKey="range" 
            stroke="#4b5563" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#4b5563" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar 
            dataKey="count" 
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.range)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskDistribution;
