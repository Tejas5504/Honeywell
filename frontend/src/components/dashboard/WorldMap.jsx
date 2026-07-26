import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";
import { motion } from 'framer-motion';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WorldMap = ({ data = [] }) => {
  const [tooltip, setTooltip] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeData = Array.isArray(data) ? data : [];
  const maxLogins = safeData.length > 0 ? Math.max(...safeData.map(d => d?.count || 0), 1) : 1;

  const getMarkerSize = (count) => {
    const minSize = 3;
    const maxSize = 15;
    return minSize + (count / maxLogins) * (maxSize - minSize);
  };

  const getMarkerColor = (count) => {
    const ratio = count / maxLogins;
    if (ratio > 0.8) return "#ef4444"; // red
    if (ratio > 0.4) return "#f59e0b"; // amber
    return "#10b981"; // green
  };

  return (
    <div className="w-full h-[400px] relative bg-navy-900 rounded-xl overflow-hidden border border-glass-border">
      <ComposableMap projectionConfig={{ scale: 140 }} className="w-full h-full">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            (geographies || []).map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#151b30"
                stroke="#1c2541"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#1c2541", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        
        {mounted && safeData.map(({ id, country, coordinates, count }) => (
          <Marker 
            key={id || country || Math.random()} 
            coordinates={Array.isArray(coordinates) && coordinates.length === 2 ? coordinates : [0, 0]}
            onMouseEnter={() => setTooltip({ country, count })}
            onMouseLeave={() => setTooltip(null)}
          >
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
              r={getMarkerSize(count || 0)}
              fill={getMarkerColor(count || 0)}
              stroke="#050816"
              strokeWidth={1}
              className="cursor-pointer"
            />
            {/* Pulse effect for high counts */}
            {(count || 0) / maxLogins > 0.8 && (
              <circle
                r={getMarkerSize(count || 0)}
                fill="none"
                stroke={getMarkerColor(count || 0)}
                strokeWidth={2}
                className="animate-ping opacity-75 origin-center"
              />
            )}
          </Marker>
        ))}
      </ComposableMap>

      {tooltip && (
        <div className="absolute top-4 right-4 glass-card px-4 py-2 pointer-events-none">
          <p className="text-white font-medium text-sm">{tooltip.country}</p>
          <p className="text-gray-400 text-xs">{tooltip.count} logins</p>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
