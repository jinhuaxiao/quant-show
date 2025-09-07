'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Factor } from '@/app/types/trading';

interface CorrelationMatrixProps {
  factors: Factor[];
  correlationMatrix: number[][];
  currentStep: number;
}

export function CorrelationMatrix({ factors, correlationMatrix, currentStep }: CorrelationMatrixProps) {
  const selectedFactors = factors.filter(f => f.status === 'selected');
  
  // 生成相关性矩阵数据（如果没有提供）
  const generateCorrelationMatrix = () => {
    const size = selectedFactors.length;
    if (size === 0) return [];
    
    const matrix = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        if (i === j) {
          row.push(1); // 对角线为1
        } else {
          // 使用因子ID生成固定的相关性值
          const seed = selectedFactors[i].id * 1000 + selectedFactors[j].id;
          const x = Math.sin(seed) * 10000;
          const correlation = (x - Math.floor(x) - 0.5) * 1.6; // -0.8 到 0.8
          row.push(Math.max(-0.9, Math.min(0.9, correlation)));
        }
      }
      matrix.push(row);
    }
    return matrix;
  };

  const matrix = correlationMatrix.length > 0 ? correlationMatrix : generateCorrelationMatrix();

  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return value > 0 ? 'bg-red-500' : 'bg-blue-500';
    if (absValue > 0.5) return value > 0 ? 'bg-red-400' : 'bg-blue-400';
    if (absValue > 0.3) return value > 0 ? 'bg-red-300' : 'bg-blue-300';
    return 'bg-gray-500';
  };

  const getTextColor = (value: number) => {
    const absValue = Math.abs(value);
    return absValue > 0.5 ? 'text-white' : 'text-gray-800';
  };

  if (selectedFactors.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-400">相关性矩阵</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 border-2 border-dashed border-border rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 border border-border rounded"></div>
            </div>
            <p>请先选择因子以生成相关性矩阵</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center justify-between">
          <span>相关性矩阵</span>
          <div className="text-sm font-normal text-muted-foreground">
            {selectedFactors.length}×{selectedFactors.length}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 色彩图例 */}
          <div className="flex items-center justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>负相关</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>弱相关</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>正相关</span>
            </div>
          </div>

          {/* 矩阵 */}
          <div className="overflow-auto max-w-full">
            <div className="min-w-fit">
              {/* 列标题 */}
              <div className="flex mb-1">
                <div className="w-20"></div>
                {selectedFactors.map((factor, index) => (
                  <motion.div
                    key={factor.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-16 text-xs text-center p-1 truncate"
                    title={factor.name}
                  >
                    {factor.name.substring(0, 6)}
                  </motion.div>
                ))}
              </div>

              {/* 矩阵行 */}
              {selectedFactors.map((rowFactor, i) => (
                <motion.div
                  key={rowFactor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center mb-1"
                >
                  {/* 行标题 */}
                  <div className="w-20 text-xs text-right pr-2 truncate" title={rowFactor.name}>
                    {rowFactor.name.substring(0, 8)}
                  </div>
                  
                  {/* 相关性值 */}
                  {selectedFactors.map((colFactor, j) => {
                    const value = matrix[i]?.[j] || 0;
                    return (
                      <motion.div
                        key={`${i}-${j}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: (i + j) * 0.05 }}
                        className={`w-16 h-8 flex items-center justify-center text-xs font-medium rounded ${getCorrelationColor(value)} ${getTextColor(value)} mx-0.5`}
                        title={`${rowFactor.name} vs ${colFactor.name}: ${value.toFixed(3)}`}
                      >
                        {value.toFixed(2)}
                      </motion.div>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border text-center">
            <div>
              <div className="text-sm text-muted-foreground">平均相关性</div>
              <div className="text-lg font-bold text-blue-400">
                {matrix.length > 0 ? (
                  matrix.flat().filter((_, i) => i % (matrix.length + 1) !== 0)
                    .reduce((sum, val) => sum + Math.abs(val), 0) / 
                  (matrix.length * (matrix.length - 1))
                ).toFixed(3) : '0.000'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">高相关对</div>
              <div className="text-lg font-bold text-red-400">
                {matrix.flat().filter(val => Math.abs(val) > 0.7 && Math.abs(val) < 1).length}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">独立因子</div>
              <div className="text-lg font-bold text-green-400">
                {selectedFactors.filter((_, i) => 
                  matrix[i]?.every((val, j) => i === j || Math.abs(val) < 0.3)
                ).length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}