'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Layers, TrendingUp, Activity, Wallet, BarChart3 } from 'lucide-react';
import { ComplexityPanel } from './components/ComplexityPanel';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { SearchSpaceVisualization } from './components/SearchSpaceVisualization';
import { CorrelationHeatmap } from './components/CorrelationHeatmap';
import { SidePanel } from './components/SidePanel';
import { MobileMenu } from './components/MobileMenu';

export default function MedallionAlgorithm() {
  const [parameters, setParameters] = useState({
    n: 50,
    k: 10,
    s: 1,  // 步长从0.1开始（显示为0.1）
    w: 10, // 权重精度（每个因子的权重有10个可能值）
  });

  const [isAnimating] = useState(false);
  const [activeAlgorithm, setActiveAlgorithm] = useState('genetic');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const updateParameters = useCallback((newParams: Partial<typeof parameters>) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  }, []);

  const startDemo = useCallback(() => {
    setIsSidePanelOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#151932] text-gray-200">
      {/* Enhanced Header */}
      <header className="border-b border-gray-800 bg-black/20 backdrop-blur-sm sticky top-0 z-30">
        <div className="px-6 lg:px-10 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                MEDALLION ALGORITHM
              </h1>
              <p className="text-gray-400 text-sm mt-1 hidden sm:block">量化因子组合优化可视化平台</p>
            </div>
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/trading" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" />
                交易流程
              </Link>
              <Link href="/backtest-analysis" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <BarChart3 className="w-4 h-4" />
                回测分析
              </Link>
              <Link href="/factor-analysis" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <Layers className="w-4 h-4" />
                因子分析
              </Link>
              <Link href="/temporal-analysis" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <Activity className="w-4 h-4" />
                时序分析
              </Link>
              <Link href="/fund-management" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <Wallet className="w-4 h-4" />
                资金管理
              </Link>
              <button
                onClick={startDemo}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <Activity className="w-4 h-4" />
                算法演示
              </button>
            </nav>
            <MobileMenu onOpenDemo={startDemo} />
          </div>
        </div>
      </header>

      {/* Main Content with Better Grid Layout */}
      <div className={`
        transition-all duration-300 px-6 lg:px-10 py-6
        ${isSidePanelOpen ? 'lg:mr-[480px] xl:mr-[560px]' : ''}
      `}>
        <div>
        {/* Key Metrics Cards - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-400/30 rounded-xl p-4 lg:p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs lg:text-sm">组合空间</span>
              <Layers className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">10^16</div>
            <div className="text-xs text-gray-400 mt-1">可能的因子组合</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-400/30 rounded-xl p-4 lg:p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs lg:text-sm">效率提升</span>
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">10^13×</div>
            <div className="text-xs text-gray-400 mt-1">vs 穷举搜索</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-400/30 rounded-xl p-4 lg:p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs lg:text-sm">搜索覆盖率</span>
              <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">99.9%</div>
            <div className="text-xs text-gray-400 mt-1">最优解置信度</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl p-4 lg:p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs lg:text-sm">实时应用</span>
              <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">24/7</div>
            <div className="text-xs text-gray-400 mt-1">持续优化</div>
          </div>
        </div>

        {/* Main Content Area - Adaptive Layout */}
        <div className={`
          grid gap-4 lg:gap-6
          ${isSidePanelOpen ? 'grid-cols-1 2xl:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3'}
        `}>
          {/* Left Column - Main Visualizations */}
          <div className={`space-y-4 lg:space-y-6 ${!isSidePanelOpen ? 'lg:col-span-1 2xl:col-span-2' : ''}`}>
            {/* Complexity Panel */}
            <ComplexityPanel 
              parameters={parameters}
              onParametersChange={updateParameters}
            />

            {/* Search Space Visualization */}
            <SearchSpaceVisualization 
              isAnimating={isAnimating}
              parameters={parameters}
            />
          </div>

          {/* Right Column - Secondary Content */}
          <div className="space-y-4 lg:space-y-6">
            {/* Algorithm Comparison */}
            <AlgorithmComparison 
              activeAlgorithm={activeAlgorithm}
              onAlgorithmChange={setActiveAlgorithm}
            />

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-400/30 rounded-xl p-4 lg:p-5">
              <h3 className="text-base lg:text-lg font-bold text-blue-400 mb-3">快速操作</h3>
              <div className="space-y-2">
                <button
                  onClick={startDemo}
                  className="w-full px-3 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm lg:text-base font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4 lg:w-5 lg:h-5" />
                  开始算法演示
                </button>
                <button
                  onClick={() => setParameters({ n: 50, k: 10, s: 1, w: 10 })}
                  className="w-full px-3 py-2.5 bg-gray-700/50 text-white text-sm lg:text-base font-semibold rounded-lg hover:bg-gray-600/50 transition-all"
                >
                  重置参数
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Correlation Heatmap - Full Width */}
        <div className="mt-4 lg:mt-6">
          <CorrelationHeatmap />
        </div>
        </div>
      </div>

      {/* Side Panel */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        activeAlgorithm={activeAlgorithm}
        parameters={parameters}
        onParametersChange={updateParameters}
        onAlgorithmChange={setActiveAlgorithm}
      />
    </div>
  );
}