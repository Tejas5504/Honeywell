import React from 'react';

export const SkeletonCard = ({ className = '' }) => (
  <div className={`glass-card p-6 ${className}`}>
    <div className="h-6 w-1/3 bg-gray-700/50 rounded animate-shimmer mb-4"></div>
    <div className="h-10 w-1/2 bg-gray-700/50 rounded animate-shimmer"></div>
  </div>
);

export const SkeletonChart = ({ className = 'h-64' }) => (
  <div className={`glass-card p-6 flex flex-col justify-end ${className}`}>
    <div className="w-full flex items-end gap-2 h-full">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="bg-gray-700/50 rounded-t animate-shimmer flex-1" 
          style={{ height: `${Math.random() * 60 + 20}%` }}
        ></div>
      ))}
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="w-full">
    <div className="h-10 bg-gray-800/50 rounded animate-shimmer mb-4"></div>
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-8 bg-gray-700/50 rounded animate-shimmer w-1/4"></div>
          <div className="h-8 bg-gray-700/50 rounded animate-shimmer w-1/4"></div>
          <div className="h-8 bg-gray-700/50 rounded animate-shimmer w-1/4"></div>
          <div className="h-8 bg-gray-700/50 rounded animate-shimmer w-1/4"></div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div 
        key={i} 
        className="h-4 bg-gray-700/50 rounded animate-shimmer"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      ></div>
    ))}
  </div>
);
