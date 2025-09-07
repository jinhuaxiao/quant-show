'use client';

import { useMemo } from 'react';

interface ExplosionChartProps {
  parameters: {
    n: number;
    k: number;
    s: number;
  };
}

export function ExplosionChart({ parameters }: ExplosionChartProps) {
  const chartData = useMemo(() => {
    const { n, s } = parameters;
    const data = [];

    // Calculate combinations for different K values
    for (let k = 1; k <= Math.min(30, Math.floor(n / 2)); k += 2) {
      // Calculate combination using logarithms to prevent overflow
      let logCombo = 0;
      for (let i = 0; i < k; i++) {
        logCombo += Math.log(n - i) - Math.log(i + 1);
      }
      
      const combo = Math.exp(logCombo) * Math.pow(s, k);
      const height = Math.min(90, Math.log10(combo + 1) * 5);
      
      let category: 'manageable' | 'challenging' | 'impossible';
      if (combo < 1e6) {
        category = 'manageable';
      } else if (combo < 1e12) {
        category = 'challenging';
      } else {
        category = 'impossible';
      }

      data.push({
        k,
        combo,
        height,
        category,
        tooltip: `K=${k}: ${combo.toExponential(2)} 种组合`
      });
    }

    return data;
  }, [parameters]);

  const getBarColor = (category: string) => {
    switch (category) {
      case 'manageable':
        return 'bg-gradient-to-t from-green-600 to-green-400';
      case 'challenging':
        return 'bg-gradient-to-t from-yellow-600 to-yellow-400';
      case 'impossible':
        return 'bg-gradient-to-t from-red-600 to-red-400';
      default:
        return 'bg-gradient-to-t from-gray-600 to-gray-400';
    }
  };

  return (
    <div className="relative">
      <h3 className="text-lg font-semibold text-blue-300 mb-4">组合爆炸可视化</h3>
      <div className="w-full h-64 lg:h-80 bg-black/80 rounded-lg relative overflow-hidden border border-white/10">
        {chartData.map((bar, index) => (
          <div
            key={bar.k}
            className={`absolute bottom-0 w-6 lg:w-8 rounded-t-sm cursor-pointer transition-all duration-300 hover:brightness-125 ${getBarColor(bar.category)}`}
            style={{
              left: `${(index / chartData.length) * 95 + 2.5}%`,
              height: `${bar.height}%`,
            }}
            title={bar.tooltip}
          >
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
              {bar.k}
            </div>
          </div>
        ))}
        
        {/* Y-axis labels */}
        <div className="absolute left-2 top-2 text-xs text-gray-500">
          高复杂度
        </div>
        <div className="absolute left-2 bottom-8 text-xs text-gray-500">
          低复杂度
        </div>
        
        {/* X-axis label */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          因子数 (K)
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-t from-green-600 to-green-400 rounded"></div>
          <span className="text-gray-300">可管理 (&lt;10⁶)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded"></div>
          <span className="text-gray-300">挑战性 (&lt;10¹²)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gradient-to-t from-red-600 to-red-400 rounded"></div>
          <span className="text-gray-300">不可能 (&gt;10¹²)</span>
        </div>
      </div>
    </div>
  );
}