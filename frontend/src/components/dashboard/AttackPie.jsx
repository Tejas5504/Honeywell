import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CHART_PALETTE, CHART_TOOLTIP_STYLE, ATTACK_TYPES } from '../../utils/constants';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 shadow-xl">
        <p className="text-white font-medium text-sm mb-1">{ATTACK_TYPES[payload[0].name] || payload[0].name}</p>
        <p className="text-gray-300 text-xs">Count: <span className="font-bold text-white">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

const renderLegendText = (value) => {
  return <span className="text-xs text-gray-400">{ATTACK_TYPES[value] || value}</span>;
};

const AttackPie = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center text-gray-500">
        No attack data available.
      </div>
    );
  }
  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="w-full h-72 relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
        <span className="text-3xl font-bold text-white">{total}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={renderLegendText}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttackPie;
