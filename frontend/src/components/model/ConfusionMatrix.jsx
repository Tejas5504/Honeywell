import React from 'react';

const ConfusionMatrix = ({ data }) => {
  // data format: { tp: 150, fp: 12, fn: 8, tn: 980 }
  const { tp = 0, fp = 0, fn = 0, tn = 0 } = data || {};
  const total = tp + fp + fn + tn;
  
  if (total === 0) return <div className="p-4 text-center text-gray-500">No data available</div>;

  // Calculate intensity for cell background (max 100)
  const getIntensity = (val, maxVal) => {
    const minOpacity = 0.1;
    const maxOpacity = 0.8;
    return minOpacity + (val / maxVal) * (maxOpacity - minOpacity);
  };

  const maxActualPos = Math.max(tp, fn);
  const maxActualNeg = Math.max(fp, tn);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex w-full max-w-md">
        {/* Y Axis Label */}
        <div className="flex flex-col justify-center pr-4">
          <div className="transform -rotate-90 text-sm font-semibold text-gray-400 tracking-wider w-6">
            ACTUAL
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Top Labels */}
          <div className="flex mb-2">
            <div className="w-12"></div> {/* spacer */}
            <div className="flex-1 text-center text-sm text-gray-400">Anomaly (Pos)</div>
            <div className="flex-1 text-center text-sm text-gray-400">Normal (Neg)</div>
          </div>

          <div className="flex">
            {/* Side Labels */}
            <div className="w-12 flex flex-col justify-around text-xs text-gray-400 text-right pr-2">
              <div>Anomaly<br/>(Pos)</div>
              <div>Normal<br/>(Neg)</div>
            </div>

            {/* Matrix Cells */}
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 bg-glass-border p-1 rounded-lg">
              {/* True Positive */}
              <div 
                className="aspect-square flex flex-col items-center justify-center rounded-md relative group transition-colors"
                style={{ backgroundColor: `rgba(16, 185, 129, ${getIntensity(tp, Math.max(tp, fp, fn, tn))})` }}
              >
                <span className="text-2xl font-bold text-white z-10">{tp}</span>
                <span className="text-xs text-white/70 z-10">True Pos</span>
                <div className="absolute inset-0 border-2 border-emerald-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* False Positive */}
              <div 
                className="aspect-square flex flex-col items-center justify-center rounded-md relative group transition-colors"
                style={{ backgroundColor: `rgba(239, 68, 68, ${getIntensity(fp, Math.max(tp, fp, fn, tn))})` }}
              >
                <span className="text-2xl font-bold text-white z-10">{fp}</span>
                <span className="text-xs text-white/70 z-10">False Pos</span>
                <div className="absolute inset-0 border-2 border-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* False Negative */}
              <div 
                className="aspect-square flex flex-col items-center justify-center rounded-md relative group transition-colors"
                style={{ backgroundColor: `rgba(239, 68, 68, ${getIntensity(fn, Math.max(tp, fp, fn, tn))})` }}
              >
                <span className="text-2xl font-bold text-white z-10">{fn}</span>
                <span className="text-xs text-white/70 z-10">False Neg</span>
                <div className="absolute inset-0 border-2 border-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* True Negative */}
              <div 
                className="aspect-square flex flex-col items-center justify-center rounded-md relative group transition-colors"
                style={{ backgroundColor: `rgba(16, 185, 129, ${getIntensity(tn, Math.max(tp, fp, fn, tn))})` }}
              >
                <span className="text-2xl font-bold text-white z-10">{tn}</span>
                <span className="text-xs text-white/70 z-10">True Neg</span>
                <div className="absolute inset-0 border-2 border-emerald-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* X Axis Label */}
      <div className="mt-4 text-sm font-semibold text-gray-400 tracking-wider text-center pl-16">
        PREDICTED
      </div>
    </div>
  );
};

export default ConfusionMatrix;
