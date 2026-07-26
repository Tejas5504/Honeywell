import React from 'react';
import { SEVERITY_COLORS, STATUS_COLORS } from '../../utils/constants';

const Badge = ({ children, variant = 'low', type = 'severity', className = '' }) => {
  const safeVariant = (variant || 'low').toString();
  const getColors = () => {
    if (type === 'severity') {
      return SEVERITY_COLORS[safeVariant.toLowerCase()] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
    if (type === 'status') {
      return STATUS_COLORS[safeVariant.toLowerCase().replace(' ', '_')] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
    return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColors()} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
