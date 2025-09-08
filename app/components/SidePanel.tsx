'use client';

import { useState } from 'react';
import { X, Play, RotateCcw, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Parameters {
  n: number;
  k: number;
  s: number;
}

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeAlgorithm: string;
  parameters: Parameters;
  onParametersChange: (params: Partial<Parameters>) => void;
  onAlgorithmChange: (algorithm: string) => void;
}

export function SidePanel({ 
  isOpen, 
  onClose, 
  activeAlgorithm, 
  parameters, 
  onParametersChange,
  onAlgorithmChange 
}: SidePanelProps) {
  const [animationStep, setAnimationStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const algorithms = [
    { id: 'greedy', name: '贪婪算法', time: '2秒', color: 'green' },
    { id: 'lasso', name: 'LASSO回归', time: '30秒', color: 'blue' },
    { id: 'genetic', name: '遗传算法', time: '2分钟', color: 'purple' },
    { id: 'pso', name: '粒子群优化', time: '1分钟', color: 'yellow' }
  ];

  const runVisualization = () => {
    setIsRunning(true);
    setAnimationStep(0);
    
    const interval = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const reset = () => {
    setAnimationStep(0);
    setIsRunning(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`
            fixed right-0 top-16 bottom-0 z-40
            ${isMinimized ? 'w-16' : 'w-full sm:w-96 lg:w-[480px] xl:w-[560px]'}
            bg-gradient-to-b from-[#0f1629]/95 to-[#1a1f3a]/95 
            backdrop-blur-md shadow-2xl 
            border-l border-gray-700
            transition-all duration-300
          `}
        >
          {/* Minimize Toggle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full 
                       bg-[#0f1629]/90 backdrop-blur-sm p-2 
                       rounded-l-lg border border-r-0 border-gray-700
                       hover:bg-[#1a1f3a]/90 transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 text-gray-400 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
          </button>

          {!isMinimized && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white">算法可视化演示</h2>
                  <p className="text-gray-400 text-xs lg:text-sm mt-1">实时展示优化算法搜索过程</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-4 lg:p-6 overflow-y-auto h-[calc(100%-80px)]">
                {/* Algorithm Selection */}
                <div className="mb-6">
                  <h3 className="text-base lg:text-lg font-semibold text-blue-400 mb-3 lg:mb-4">选择算法</h3>
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    {algorithms.map(algo => (
                      <button
                        key={algo.id}
                        onClick={() => onAlgorithmChange(algo.id)}
                        className={`p-3 lg:p-4 rounded-lg border transition-all ${
                          activeAlgorithm === algo.id
                            ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-semibold text-white text-sm lg:text-base">{algo.name}</div>
                          <div className="text-xs lg:text-sm text-gray-400 mt-1">耗时: {algo.time}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parameters */}
                <div className="mb-6">
                  <h3 className="text-base lg:text-lg font-semibold text-blue-400 mb-3 lg:mb-4">参数调整</h3>
                  <div className="space-y-3 lg:space-y-4">
                    <div>
                      <label className="text-xs lg:text-sm text-gray-400 block mb-2">
                        因子池大小 (N): {parameters.n}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={parameters.n}
                        onChange={(e) => onParametersChange({ n: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs lg:text-sm text-gray-400 block mb-2">
                        选择因子数 (K): {parameters.k}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={parameters.k}
                        onChange={(e) => onParametersChange({ k: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs lg:text-sm text-gray-400 block mb-2">
                        步长选项 (S): {parameters.s}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={parameters.s}
                        onChange={(e) => onParametersChange({ s: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Visualization Area */}
                <div className="mb-6">
                  <h3 className="text-base lg:text-lg font-semibold text-blue-400 mb-3 lg:mb-4">搜索过程可视化</h3>
                  <div className="bg-black/40 rounded-lg p-4 lg:p-6 min-h-[250px] lg:min-h-[300px] relative overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-4 left-4 right-4">
                      <div className="flex justify-between text-xs lg:text-sm text-gray-400 mb-2">
                        <span>进度</span>
                        <span>{animationStep}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${animationStep}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Visualization Content */}
                    <div className="mt-14 lg:mt-16">
                      <div className="grid grid-cols-8 lg:grid-cols-10 gap-1 lg:gap-2">
                        {Array.from({ length: 40 }, (_, i) => (
                          <motion.div
                            key={i}
                            className={`aspect-square rounded ${
                              i < animationStep / 2.5
                                ? 'bg-green-400/60'
                                : 'bg-gray-600/30'
                            }`}
                            initial={{ scale: 0 }}
                            animate={{ scale: i < animationStep / 2.5 ? 1 : 0.8 }}
                            transition={{ delay: i * 0.01 }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    {animationStep > 0 && (
                      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 lg:gap-4 text-center">
                        <div>
                          <div className="text-lg lg:text-2xl font-bold text-green-400">
                            {Math.floor(animationStep * 1.5)}
                          </div>
                          <div className="text-xs text-gray-400">组合评估</div>
                        </div>
                        <div>
                          <div className="text-lg lg:text-2xl font-bold text-yellow-400">
                            {(animationStep * 0.89).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">置信度</div>
                        </div>
                        <div>
                          <div className="text-lg lg:text-2xl font-bold text-blue-400">
                            {Math.floor(animationStep / 10)}ms
                          </div>
                          <div className="text-xs text-gray-400">耗时</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2 lg:gap-3">
                  <button
                    onClick={runVisualization}
                    disabled={isRunning}
                    className="flex-1 flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 
                               bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold 
                               rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all 
                               disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                  >
                    <Play className="w-4 h-4 lg:w-5 lg:h-5" />
                    {isRunning ? '运行中...' : '开始演示'}
                  </button>
                  <button
                    onClick={reset}
                    className="px-4 lg:px-6 py-2.5 lg:py-3 bg-gray-700 text-white font-semibold 
                               rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>

                {/* Results Summary */}
                {animationStep === 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 lg:mt-6 p-3 lg:p-4 bg-green-500/10 border border-green-400/30 rounded-lg"
                  >
                    <h4 className="font-semibold text-green-400 text-sm lg:text-base mb-2">优化完成！</h4>
                    <p className="text-xs lg:text-sm text-gray-300">
                      {activeAlgorithm === 'genetic' && '遗传算法通过进化选择找到了近似最优解'}
                      {activeAlgorithm === 'greedy' && '贪婪算法快速找到了局部最优解'}
                      {activeAlgorithm === 'lasso' && 'LASSO回归通过正则化选择了最重要的因子'}
                      {activeAlgorithm === 'pso' && '粒子群算法通过群体智能找到了全局最优解'}
                    </p>
                    <div className="mt-2 lg:mt-3 text-xs text-gray-400">
                      效率提升: 10^13倍 | 评估组合: 150 / 10^16
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="transform -rotate-90 whitespace-nowrap text-gray-400 text-sm font-medium">
                算法演示
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}