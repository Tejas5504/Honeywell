import React, { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const LoginHeatmap = ({ data = [] }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        No heatmap data available.
      </div>
    );
  }

  // Helper to find data for a specific day and hour
  const getCellData = (day, hour) => {
    return data.find(d => d.day === day && d.hour === hour) || { count: 0 };
  };

  // Find max count to normalize colors
  const maxCount = Math.max(...data.map(d => d.count), 1);

  // Get color intensity based on count
  const getCellColor = (count) => {
    if (count === 0) return 'bg-navy-800';
    
    const intensity = count / maxCount;
    if (intensity < 0.2) return 'bg-accent-blue/20';
    if (intensity < 0.4) return 'bg-accent-blue/40';
    if (intensity < 0.6) return 'bg-accent-blue/60';
    if (intensity < 0.8) return 'bg-accent-blue/80';
    return 'bg-accent-cyan';
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 flex overflow-x-auto pb-4">
        <div className="flex flex-col gap-1 pr-2 pt-6 shrink-0">
          {DAYS.map(day => (
            <div key={day} className="h-6 text-xs text-gray-500 flex items-center justify-end font-medium">
              {day}
            </div>
          ))}
        </div>
        
        <div className="flex-1 min-w-[600px]">
          <div className="flex gap-1 mb-2 ml-1">
            {HOURS.map(hour => (
              <div key={hour} className="flex-1 text-center text-xs text-gray-500">
                {hour % 3 === 0 ? `${hour}h` : ''}
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-1 ml-1">
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex gap-1 h-6">
                {HOURS.map(hour => {
                  const cellData = getCellData(dayIndex, hour);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`flex-1 rounded-sm transition-colors duration-200 cursor-pointer ${getCellColor(cellData.count)} hover:ring-1 hover:ring-white`}
                      onMouseEnter={() => setHoveredCell({ day, hour, count: cellData.count })}
                      onMouseLeave={() => setHoveredCell(null)}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {hoveredCell && (
        <div className="absolute top-0 right-0 glass-card px-3 py-2 text-xs z-10 pointer-events-none">
          <span className="text-gray-300">{hoveredCell.day}, {hoveredCell.hour}:00 - </span>
          <span className="text-white font-bold">{hoveredCell.count} logins</span>
        </div>
      )}
      
      <div className="flex items-center justify-end gap-2 text-xs text-gray-500 mt-2">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-navy-800"></div>
          <div className="w-3 h-3 rounded-sm bg-accent-blue/20"></div>
          <div className="w-3 h-3 rounded-sm bg-accent-blue/40"></div>
          <div className="w-3 h-3 rounded-sm bg-accent-blue/60"></div>
          <div className="w-3 h-3 rounded-sm bg-accent-blue/80"></div>
          <div className="w-3 h-3 rounded-sm bg-accent-cyan"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default LoginHeatmap;
