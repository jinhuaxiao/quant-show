'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProcessFlowIndicatorProps {
  currentStep: number;
  isRunning: boolean;
}

const steps = [
  { id: 1, name: '因子筛选', description: 'Factor Screening' },
  { id: 2, name: '相关性过滤', description: 'Correlation Filter' },
  { id: 3, name: '权重优化', description: 'Weight Optimization' },
  { id: 4, name: '收敛判断', description: 'Convergence Check' },
  { id: 5, name: '股票选择', description: 'Stock Selection' },
  { id: 6, name: '交易执行', description: 'Trade Execution' },
];

export function ProcessFlowIndicator({ currentStep, isRunning }: ProcessFlowIndicatorProps) {
  return (
    <div className="mb-8 bg-card/50 border border-border rounded-xl p-6">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full" />
        
        {/* Active Progress Bar */}
        <motion.div
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${Math.min(((currentStep - 1) / (steps.length - 1)) * 100, 100)}%` 
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Steps Container */}
        <div className="relative flex justify-between items-start">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className="flex flex-col items-center flex-1"
            >
              {/* Step Circle */}
              <motion.div
                className={cn(
                  'w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm z-10 bg-background',
                  currentStep === step.id && isRunning
                    ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/50 animate-pulse'
                    : currentStep > step.id
                    ? 'border-green-500 bg-green-500 text-white'
                    : currentStep === step.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground bg-muted text-muted-foreground'
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: currentStep === step.id && isRunning ? 1.1 : 1,
                  opacity: 1
                }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.1
                }}
              >
                {currentStep > step.id ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    ✓
                  </motion.span>
                ) : (
                  step.id
                )}
              </motion.div>

              {/* Step Label */}
              <motion.div 
                className="mt-3 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <div className={cn(
                  'text-xs lg:text-sm font-medium whitespace-nowrap',
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.name}
                </div>
                <div className="text-xs text-muted-foreground hidden lg:block mt-1">
                  {step.description}
                </div>
              </motion.div>

              {/* Connector Line (visible on mobile) */}
              {index < steps.length - 1 && (
                <div className="absolute top-6 left-1/2 w-full h-0.5 -z-10 lg:hidden">
                  <div className={cn(
                    'h-full transition-colors duration-300',
                    currentStep > step.id ? 'bg-green-500' : 'bg-muted'
                  )} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Status Labels */}
        <div className="mt-6 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">已完成:</span>
            <span className="text-green-500 font-bold">{Math.max(0, currentStep - 1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">当前:</span>
            <span className="text-primary font-bold">
              {currentStep <= steps.length ? steps[currentStep - 1]?.name || '待开始' : '已完成'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">剩余:</span>
            <span className="text-yellow-500 font-bold">{Math.max(0, steps.length - currentStep)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}