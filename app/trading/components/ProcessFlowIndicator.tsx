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
    <div className="mb-12">
      <div className="flex justify-center items-center max-w-6xl mx-auto">
        <div className="flex items-center space-x-2 lg:space-x-4 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              {/* Step Circle */}
              <div className="relative">
                <motion.div
                  className={cn(
                    'w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300',
                    currentStep === step.id && isRunning
                      ? 'bg-primary border-primary text-primary-foreground animate-pulse'
                      : currentStep > step.id
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-muted border-muted-foreground text-muted-foreground'
                  )}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: currentStep === step.id ? 1.1 : 1,
                    rotate: currentStep === step.id && isRunning ? 360 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep > step.id ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      ✓
                    </motion.div>
                  ) : (
                    step.id
                  )}
                </motion.div>

                {/* Step Label */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center min-w-max">
                  <div className={cn(
                    'text-sm font-medium',
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <motion.div
                  className={cn(
                    'mx-2 lg:mx-4 text-2xl transition-colors duration-300',
                    currentStep > step.id ? 'text-green-500' : 'text-muted-foreground'
                  )}
                  animate={{ 
                    x: currentStep === step.id && isRunning ? [0, 5, 0] : 0 
                  }}
                  transition={{ 
                    repeat: currentStep === step.id && isRunning ? Infinity : 0,
                    duration: 1 
                  }}
                >
                  →
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}