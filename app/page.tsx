'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Layers, TrendingUp, Activity } from 'lucide-react';
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
    s: 5,
  });

  const [isAnimating, setIsAnimating] = useState(false);
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
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
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
        transition-all duration-300 px-4 lg:px-8 py-8
        ${isSidePanelOpen ? 'lg:mr-[480px] xl:mr-[560px]' : ''}
      `}>
        <div className={`${!isSidePanelOpen ? 'max-w-7xl mx-auto' : ''}`}>
        {/* Key Metrics Cards - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-400/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">组合空间</span>
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">10^16</div>
            <div className="text-xs text-gray-400 mt-1">可能的因子组合</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-400/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">效率提升</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">10^13×</div>
            <div className="text-xs text-gray-400 mt-1">vs 穷举搜索</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-400/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">搜索覆盖率</span>
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">99.9%</div>
            <div className="text-xs text-gray-400 mt-1">最优解置信度</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">实时应用</span>
              <ChevronRight className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">24/7</div>
            <div className="text-xs text-gray-400 mt-1">持续优化</div>
          </div>
        </div>

        {/* Main Content Area - Adaptive Layout */}
        <div className={`
          grid gap-6
          ${isSidePanelOpen ? 'grid-cols-1 2xl:grid-cols-2' : 'grid-cols-1 xl:grid-cols-3'}
        `}>
          {/* Left Column - Main Visualizations */}
          <div className={`space-y-6 ${!isSidePanelOpen ? 'xl:col-span-2' : ''}`}>
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
          <div className="space-y-6">
            {/* Algorithm Comparison */}
            <AlgorithmComparison 
              activeAlgorithm={activeAlgorithm}
              onAlgorithmChange={setActiveAlgorithm}
            />

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-400/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-400 mb-4">快速操作</h3>
              <div className="space-y-3">
                <button
                  onClick={startDemo}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" />
                  开始算法演示
                </button>
                <button
                  onClick={() => setParameters({ n: 50, k: 10, s: 5 })}
                  className="w-full px-4 py-3 bg-gray-700/50 text-white font-semibold rounded-lg hover:bg-gray-600/50 transition-all"
                >
                  重置参数
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Correlation Heatmap - Full Width */}
        <div className="mt-6">
          <CorrelationHeatmap />
        </div>

        {/* Enhanced CTA Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-400/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              完整量化交易流程
            </h3>
            <p className="text-gray-300 mb-6">
              体验从因子筛选到自动交易的完整量化流程
            </p>
            <Link 
              href="/trading" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              开启交易流程
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-400/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-green-400 mb-4">
              相关性过滤原理
            </h3>
            <p className="text-gray-300 mb-6">
              了解如何通过因子筛选降低组合复杂度
            </p>
            <button
              onClick={startDemo}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              查看演示
              <Activity className="w-5 h-5" />
            </button>
          </div>
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