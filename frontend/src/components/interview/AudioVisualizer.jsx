import React, { useRef, useEffect } from 'react';

export default function AudioVisualizer({ level = 0, isActive = false, color = 'indigo', barCount = 18 }) {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 py-2">
      {bars.map((bar) => {
        // Compute pseudo-random natural sound variation based on audio level
        const multiplier = Math.sin((bar / barCount) * Math.PI);
        const dynamicHeight = isActive
          ? Math.max(12, Math.min(100, (level * 100 * multiplier) + (Math.random() * 20)))
          : 8;

        const colorClasses = {
          indigo: 'bg-indigo-500 shadow-indigo-500/50',
          emerald: 'bg-emerald-500 shadow-emerald-500/50',
          violet: 'bg-violet-500 shadow-violet-500/50',
          amber: 'bg-amber-500 shadow-amber-500/50',
          rose: 'bg-rose-500 shadow-rose-500/50'
        }[color] || 'bg-indigo-500 shadow-indigo-500/50';

        return (
          <div
            key={bar}
            className={`w-1.5 rounded-full transition-all duration-75 shadow-xs ${colorClasses}`}
            style={{
              height: `${dynamicHeight}%`,
              opacity: isActive ? 0.9 : 0.3
            }}
          />
        );
      })}
    </div>
  );
}
