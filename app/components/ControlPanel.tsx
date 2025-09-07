'use client';

interface ControlPanelProps {
  onStartDemo: () => void;
  onCompareAlgorithms: () => void;
  onReset: () => void;
  isAnimating: boolean;
}

export function ControlPanel({ 
  onStartDemo, 
  onCompareAlgorithms, 
  onReset, 
  isAnimating 
}: ControlPanelProps) {
  return (
    <section className="bg-card-bg border-2 border-[var(--color-border)] rounded-xl p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-6">
        <button
          onClick={onStartDemo}
          disabled={isAnimating}
          className="px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm lg:text-base uppercase tracking-wider rounded-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isAnimating ? '演示中...' : '开始演示'}
        </button>
        
        <button
          onClick={onCompareAlgorithms}
          className="px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm lg:text-base uppercase tracking-wider rounded-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-700 hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30"
        >
          算法对比
        </button>
        
        <button
          onClick={onReset}
          className="px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-sm lg:text-base uppercase tracking-wider rounded-lg transition-all duration-300 hover:from-gray-700 hover:to-gray-800 hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-500/30"
        >
          重置
        </button>
      </div>
      
      {/* Status Indicator */}
      {isAnimating && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center space-x-3 px-4 py-2 bg-blue-400/10 border border-blue-400/30 rounded-full">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-400 text-sm font-medium">搜索算法演示进行中...</span>
          </div>
        </div>
      )}
      
      {/* Performance Metrics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-black/30 p-4 rounded-lg border border-white/10 text-center">
          <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide">效率提升</div>
          <div className="text-2xl lg:text-3xl font-bold text-green-400">10¹³x</div>
          <div className="text-xs text-gray-500 mt-1">vs 穷举搜索</div>
        </div>
        
        <div className="bg-black/30 p-4 rounded-lg border border-white/10 text-center">
          <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide">搜索覆盖率</div>
          <div className="text-2xl lg:text-3xl font-bold text-yellow-400">99.9%</div>
          <div className="text-xs text-gray-500 mt-1">最优解概率</div>
        </div>
        
        <div className="bg-black/30 p-4 rounded-lg border border-white/10 text-center">
          <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide">实际应用</div>
          <div className="text-2xl lg:text-3xl font-bold text-blue-400">24/7</div>
          <div className="text-xs text-gray-500 mt-1">持续优化</div>
        </div>
      </div>
    </section>
  );
}