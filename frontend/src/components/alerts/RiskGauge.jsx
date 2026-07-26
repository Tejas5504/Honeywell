import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RiskGauge = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Simple animation for the score value
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // SVG dimensions and path calculation
  const size = 200;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  
  // Calculate SVG arc for gauge (180 degrees)
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 75) return '#ef4444'; // Critical
    if (s >= 50) return '#f97316'; // High
    if (s >= 25) return '#f59e0b'; // Medium
    return '#10b981'; // Low
  };

  const getLabel = (s) => {
    if (s >= 75) return 'CRITICAL';
    if (s >= 50) return 'HIGH';
    if (s >= 25) return 'MEDIUM';
    return 'LOW';
  };

  const color = getColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size / 2 + 10} className="overflow-visible">
        {/* Background Arc */}
        <path
          d={`M ${strokeWidth/2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${cy}`}
          fill="none"
          stroke="#1c2541"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value Arc (Animated) */}
        <motion.path
          d={`M ${strokeWidth/2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: score >= 75 ? `drop-shadow(0 0 8px ${color}80)` : 'none'
          }}
        />
      </svg>
      
      {/* Score Text inside gauge */}
      <div className="absolute bottom-4 flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {animatedScore}
        </span>
        <span className="text-xs font-semibold tracking-widest mt-1 text-gray-400">
          {getLabel(score)}
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;
