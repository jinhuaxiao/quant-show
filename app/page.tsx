'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ComplexityPanel } from './components/ComplexityPanel';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { SearchSpaceVisualization } from './components/SearchSpaceVisualization';
import { CorrelationHeatmap } from './components/CorrelationHeatmap';
import { ControlPanel } from './components/ControlPanel';

export default function MedallionAlgorithm() {
  const [parameters, setParameters] = useState({
    n: 50, // 因子池大小
    k: 10, // 选择因子数
    s: 5,  // 步长选项
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [activeAlgorithm, setActiveAlgorithm] = useState('genetic');

  const updateParameters = useCallback((newParams: Partial<typeof parameters>) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  }, []);

  const startDemo = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 10000);
  }, []);

  const compareAlgorithms = useCallback(() => {
    alert('算法对比演示：\n\n' +
          '穷举搜索: 需要357年\n' +
          '贪婪算法: 2秒完成，但可能错过最优解\n' +
          'LASSO: 30秒完成，数学优雅\n' +
          '遗传算法: 2分钟完成，全局搜索\n' +
          '粒子群: 1分钟完成，快速收敛\n\n' +
          '效率提升: 10^13倍！');
  }, []);

  const resetDemo = useCallback(() => {
    setParameters({ n: 50, k: 10, s: 5 });
    setIsAnimating(false);
    setActiveAlgorithm('genetic');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#151932] text-gray-200">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <header className="text-center py-8 border-b-2 border-gray-700 mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            MEDALLION ALGORITHM
          </h1>
          <p className="text-gray-400 text-lg">
            量化因子组合优化复杂性与算法解决方案可视化
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Complexity Panel */}
          <ComplexityPanel 
            parameters={parameters}
            onParametersChange={updateParameters}
          />

          {/* Algorithm Comparison */}
          <AlgorithmComparison 
            activeAlgorithm={activeAlgorithm}
            onAlgorithmChange={setActiveAlgorithm}
          />

          {/* Search Space Visualization */}
          <SearchSpaceVisualization 
            isAnimating={isAnimating}
            parameters={parameters}
          />

          {/* Correlation Heatmap */}
          <CorrelationHeatmap />

          {/* Control Panel */}
          <ControlPanel 
            onStartDemo={startDemo}
            onCompareAlgorithms={compareAlgorithms}
            onReset={resetDemo}
            isAnimating={isAnimating}
          />

          {/* Navigation to Trading Flow */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-400/30 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">
                完整量化交易流程
              </h3>
              <p className="text-gray-300 mb-6">
                体验从因子筛选到自动交易的完整量化流程，包含实时可视化和智能决策
              </p>
              <Link 
                href="/trading" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30"
              >
                开启交易流程 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}