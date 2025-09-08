'use client';

import { useMemo } from 'react';

interface HeatmapCell {
  id: number;
  correlation: number;
  color: string;
  tooltip: string;
}

export function CorrelationHeatmap() {
  const heatmapData = useMemo(() => {
    const cells: HeatmapCell[] = [];
    
    // Generate 15x15 grid (225 cells) with correlation data
    for (let i = 0; i < 225; i++) {
      // Use deterministic pseudo-random based on index
      const seed = i * 2654435761 % 2147483647;
      const correlation = (seed % 1000) / 1000;
      let color: string;
      
      // Determine color based on correlation strength
      if (correlation > 0.7) {
        color = `rgba(248, 113, 113, ${0.4 + correlation * 0.6})`;
      } else if (correlation > 0.5) {
        color = `rgba(251, 191, 36, ${0.3 + correlation * 0.5})`;
      } else {
        color = `rgba(74, 222, 128, ${0.2 + correlation * 0.4})`;
      }
      
      cells.push({
        id: i,
        correlation,
        color,
        tooltip: `相关系数: ${correlation.toFixed(3)}`
      });
    }
    
    return cells;
  }, []);

  const getCorrelationStats = () => {
    const high = heatmapData.filter(cell => cell.correlation > 0.7).length;
    const medium = heatmapData.filter(cell => cell.correlation > 0.5 && cell.correlation <= 0.7).length;
    const low = heatmapData.filter(cell => cell.correlation <= 0.5).length;
    
    return { high, medium, low };
  };

  const stats = getCorrelationStats();

  return (
    <section className="bg-card-bg border-2 border-[var(--color-border)] rounded-xl p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 uppercase tracking-wider">
        🔗 因子相关性热图
      </h2>
      
      {/* Heatmap Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-15 gap-1 max-w-2xl mx-auto">
          {heatmapData.map((cell) => (
            <div
              key={cell.id}
              className="aspect-square rounded-sm cursor-pointer transition-all duration-200 hover:scale-125 hover:z-10 relative"
              style={{ backgroundColor: cell.color }}
              title={cell.tooltip}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-8 mb-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-400/80 rounded"></div>
          <span className="text-gray-300">高相关 (&gt;0.7)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400/80 rounded"></div>
          <span className="text-gray-300">中等相关 (0.5-0.7)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-400/80 rounded"></div>
          <span className="text-gray-300">低相关 (&lt;0.5)</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.high}</div>
          <div className="text-sm text-gray-300">高相关因子对</div>
          <div className="text-xs text-gray-400 mt-1">需要过滤</div>
        </div>
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
          <div className="text-sm text-gray-300">中等相关因子对</div>
          <div className="text-xs text-gray-400 mt-1">谨慎使用</div>
        </div>
        <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.low}</div>
          <div className="text-sm text-gray-300">低相关因子对</div>
          <div className="text-xs text-gray-400 mt-1">优选组合</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-400/10 border-l-4 border-blue-400 p-6 rounded-r-lg">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">相关性过滤原理</h4>
        <div className="text-gray-300 leading-relaxed space-y-2">
          <p>
            高相关因子（&gt;0.7）会被自动过滤，保留信息比率(IR)更高的因子。
            红色表示高相关性，绿色表示低相关性。
          </p>
          <p>
            通过这种方式，50个因子可以减少到15-20个有效因子，大幅降低组合复杂度：
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
            <li>原始复杂度：C(50,10) ≈ 10¹⁰ 种组合</li>
            <li>过滤后复杂度：C(20,10) ≈ 18万种组合</li>
            <li>效率提升：约5万倍</li>
          </ul>
        </div>
      </div>

    </section>
  );
}