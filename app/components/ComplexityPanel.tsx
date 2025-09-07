'use client';

import { useMemo } from 'react';
import { CombinationCalculator } from './CombinationCalculator';
import { ExplosionChart } from './ExplosionChart';

interface ComplexityPanelProps {
  parameters: {
    n: number;
    k: number;
    s: number;
  };
  onParametersChange: (params: Partial<{ n: number; k: number; s: number }>) => void;
}

export function ComplexityPanel({ parameters, onParametersChange }: ComplexityPanelProps) {
  const calculations = useMemo(() => {
    const { n, k, s } = parameters;
    
    // Calculate combinations using logarithms to prevent overflow
    const logCombination = (n: number, k: number) => {
      if (k > n || k < 0) return -Infinity;
      if (k === 0 || k === n) return 0;
      
      let result = 0;
      for (let i = 0; i < k; i++) {
        result += Math.log(n - i) - Math.log(i + 1);
      }
      return result;
    };

    const logBasicCombo = logCombination(n, k);
    const basicCombo = Math.exp(logBasicCombo);
    const totalCombo = basicCombo * Math.pow(s, k);

    // Format numbers
    const formatNumber = (num: number) => {
      if (num > 1e15) return `${(num / 1e15).toFixed(1)}×10¹⁵`;
      if (num > 1e12) return `${(num / 1e12).toFixed(1)}×10¹²`;
      if (num > 1e9) return `${(num / 1e9).toFixed(1)}B`;
      if (num > 1e6) return `${(num / 1e6).toFixed(1)}M`;
      if (num > 1e3) return `${(num / 1e3).toFixed(1)}K`;
      return Math.round(num).toString();
    };

    // Calculate execution times
    const flopsPerEval = 10000;
    const pcFlops = 1e9; // 1GHz
    const gpuFlops = 1e12; // 1TFlops

    const pcSeconds = (totalCombo * flopsPerEval) / pcFlops;
    const gpuSeconds = (totalCombo * flopsPerEval) / gpuFlops;

    const formatTime = (seconds: number) => {
      if (seconds > 31536000) return `${(seconds / 31536000).toFixed(0)}年`;
      if (seconds > 86400) return `${(seconds / 86400).toFixed(0)}天`;
      if (seconds > 3600) return `${(seconds / 3600).toFixed(0)}小时`;
      if (seconds > 60) return `${(seconds / 60).toFixed(0)}分钟`;
      return `${seconds.toFixed(0)}秒`;
    };

    return {
      basicCombo: formatNumber(basicCombo),
      totalCombo: formatNumber(totalCombo),
      pcTime: formatTime(pcSeconds),
      gpuTime: formatTime(gpuSeconds),
      rawTotalCombo: totalCombo
    };
  }, [parameters]);

  return (
    <section className="bg-card-bg border-2 border-[var(--color-border)] rounded-xl p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 uppercase tracking-wider">
        🔥 组合爆炸问题 (Combinatorial Explosion)
      </h2>
      
      {/* Parameter Controls */}
      <CombinationCalculator 
        parameters={parameters}
        onParametersChange={onParametersChange}
      />

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-black/50 p-4 lg:p-6 rounded-lg border border-white/10 text-center">
          <div className="text-xs text-gray-400 mb-2 uppercase">基础组合数 C(N,K)</div>
          <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-2">{calculations.basicCombo}</div>
          <div className="text-xs text-gray-500">不考虑步长</div>
        </div>
        
        <div className="bg-black/50 p-4 lg:p-6 rounded-lg border border-white/10 text-center">
          <div className="text-xs text-gray-400 mb-2 uppercase">总组合数 C(N,K)×S^K</div>
          <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-2">{calculations.totalCombo}</div>
          <div className="text-xs text-gray-500">包含步长参数</div>
        </div>
        
        <div className="bg-black/50 p-4 lg:p-6 rounded-lg border border-white/10 text-center">
          <div className="text-xs text-gray-400 mb-2 uppercase">穷举时间 (普通PC)</div>
          <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-2">{calculations.pcTime}</div>
          <div className="text-xs text-gray-500">1GHz CPU</div>
        </div>
        
        <div className="bg-black/50 p-4 lg:p-6 rounded-lg border border-white/10 text-center">
          <div className="text-xs text-gray-400 mb-2 uppercase">GPU集群时间</div>
          <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-2">{calculations.gpuTime}</div>
          <div className="text-xs text-gray-500">1TFlops</div>
        </div>
      </div>

      {/* Explosion Chart */}
      <ExplosionChart 
        parameters={parameters}
      />
    </section>
  );
}