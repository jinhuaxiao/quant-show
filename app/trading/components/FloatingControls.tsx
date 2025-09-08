'use client';

import { useState } from 'react';
import { Play, Pause, RotateCcw, Settings, ChevronLeft, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  progress: number;
  currentStep: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function FloatingControls({
  isRunning,
  isPaused,
  progress,
  currentStep,
  onStart,
  onPause,
  onReset
}: FloatingControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });

  return (
    <motion.div
      drag={!isExpanded}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: 0,
        right: typeof window !== 'undefined' ? window.innerWidth - (isExpanded ? 320 : 80) : 1000,
        top: 80,
        bottom: typeof window !== 'undefined' ? window.innerHeight - 200 : 600
      }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 50
      }}
      animate={{
        width: isExpanded ? 320 : 64,
        height: isExpanded ? 'auto' : 64
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`
        ${isExpanded ? 'bg-[#0f1629]/95' : 'bg-[#0f1629]/90'}
        backdrop-blur-md rounded-xl border border-gray-700 
        shadow-2xl ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        setPosition({ x: info.point.x, y: info.point.y });
      }}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">系统控制</h3>
                {isRunning && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Control Buttons */}
            <div className="space-y-2 mb-4">
              <Button 
                onClick={onStart}
                disabled={isRunning}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? '运行中...' : isPaused ? '继续' : '开始完整流程'}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={onPause}
                  disabled={!isRunning}
                  variant="secondary"
                  size="sm"
                  className="bg-gray-700/50 hover:bg-gray-600/50"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  暂停
                </Button>
                
                <Button 
                  onClick={onReset}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-gray-700/50"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  重置
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">总体进度</span>
                <span className="text-white font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            {/* Current Step */}
            <div className="text-xs text-gray-400 mb-3">
              当前步骤: <span className="text-blue-400 font-medium">
                {currentStep === 0 ? '待开始' :
                 currentStep === 1 ? '因子筛选' :
                 currentStep === 2 ? '相关性过滤' :
                 currentStep === 3 ? '权重优化' :
                 currentStep === 4 ? '收敛判断' :
                 currentStep === 5 ? '股票选择' :
                 currentStep === 6 ? '交易执行' : '已完成'}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700">
              <div className="text-center">
                <div className="text-xs text-gray-500">效率</div>
                <div className="text-sm font-bold text-green-400">10¹³x</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">覆盖率</div>
                <div className="text-sm font-bold text-yellow-400">99.9%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">运行</div>
                <div className="text-sm font-bold text-blue-400">24/7</div>
              </div>
            </div>

            {/* Status Indicator */}
            {isRunning && (
              <div className="mt-3 flex items-center space-x-2 px-2 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
                <span className="text-blue-400 text-xs">算法执行中...</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="w-full h-full flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors"
          >
            <div className="relative">
              <Settings className="w-6 h-6 text-blue-400" />
              {isRunning && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}