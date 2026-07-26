import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value = 0, icon: Icon, trend, trendValue, color, delay = 0, pulse, suffix }) => {
  // Parse value safely
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const isInteger = Number.isInteger(numericValue);
  const formattedValue = numericValue.toLocaleString(undefined, {
    minimumFractionDigits: isInteger ? 0 : 1,
    maximumFractionDigits: isInteger ? 0 : 1,
  });

  // React components can be functions or objects (React.memo / React.forwardRef)
  const IconComp = Icon && (typeof Icon === 'function' || typeof Icon === 'object') ? Icon : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-5 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color }}></div>

      <div className="flex justify-between items-start mb-4">
        <div className="text-gray-400 text-sm font-medium">{title}</div>
        <div
          className="p-2 rounded-lg bg-opacity-20 backdrop-blur-md"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {IconComp ? (
            <IconComp className="w-5 h-5" />
          ) : (
            <span className="w-5 h-5 block" />
          )}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className={`text-3xl font-bold text-white tracking-tight ${pulse ? 'animate-pulse' : ''}`}>
          <span>{formattedValue}</span>
          {suffix && <span className="text-lg ml-0.5">{suffix}</span>}
        </div>

        {trendValue && (
          <div className={`flex items-center text-xs px-2 py-1 rounded-full font-medium ${
            trend === 'up' ? 'text-accent-red bg-accent-red/10' :
            trend === 'down' ? 'text-accent-emerald bg-accent-emerald/10' :
            'text-gray-400 bg-gray-400/10'
          }`}>
            {trendValue}
          </div>
        )}
      </div>

      {/* Decorative gradient glow on hover */}
      <div
        className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ backgroundColor: color }}
      ></div>
    </motion.div>
  );
};

export default StatCard;
