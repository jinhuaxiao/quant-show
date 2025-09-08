'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { Factor } from '@/app/types/trading';

interface CorrelationMatrixProps {
  factors: Factor[];
  correlationMatrix: number[][];
  currentStep: number;
}

export function CorrelationMatrix({ factors, correlationMatrix, currentStep }: CorrelationMatrixProps) {
  const selectedFactors = factors.filter(f => f.status === 'selected');
  const [animatingCell, setAnimatingCell] = useState<{i: number, j: number} | null>(null);
  const [calculatedCells, setCalculatedCells] = useState<Set<string>>(new Set());
  const [isCalculating, setIsCalculating] = useState(false);
  
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

  // 当进入步骤2时，触发计算动画
  useEffect(() => {
    if (currentStep === 2 && selectedFactors.length > 0) {
      setIsCalculating(true);
      setCalculatedCells(new Set());
      
      // 逐个计算单元格
      let cellIndex = 0;
      const totalCells = selectedFactors.length * selectedFactors.length;
      
      const animateCalculation = () => {
        if (cellIndex < totalCells) {
          const i = Math.floor(cellIndex / selectedFactors.length);
          const j = cellIndex % selectedFactors.length;
          
          setAnimatingCell({ i, j });
          setCalculatedCells(prev => new Set([...prev, `${i}-${j}`]));
          
          cellIndex++;
          setTimeout(animateCalculation, 50);
        } else {
          setAnimatingCell(null);
          setIsCalculating(false);
        }
      };
      
      setTimeout(animateCalculation, 500);
    }
  }, [currentStep, selectedFactors.length]);

  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value);
    if (value === 1) return 'bg-gradient-to-br from-purple-500 to-purple-600';
    if (absValue > 0.7) return value > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-blue-600';
    if (absValue > 0.5) return value > 0 ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 'bg-gradient-to-br from-cyan-400 to-cyan-500';
    if (absValue > 0.3) return value > 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 'bg-gradient-to-br from-teal-400 to-teal-500';
    return 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  const getTextColor = (value: number) => {
    const absValue = Math.abs(value);
    return absValue > 0.3 ? 'text-white' : 'text-gray-300';
  };

  if (selectedFactors.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>相关性矩阵</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-2 border-dashed border-border rounded-lg mx-auto mb-4 flex items-center justify-center"
            >
              <div className="grid grid-cols-2 gap-1">
                <div className="w-3 h-3 bg-blue-500/20 rounded"></div>
                <div className="w-3 h-3 bg-red-500/20 rounded"></div>
                <div className="w-3 h-3 bg-red-500/20 rounded"></div>
                <div className="w-3 h-3 bg-blue-500/20 rounded"></div>
              </div>
            </motion.div>
            <p className="text-sm">请先选择因子以生成相关性矩阵</p>
            <p className="text-xs text-muted-foreground mt-2">相关性用于过滤高度相似的因子</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>相关性矩阵</span>
            {isCalculating && (
              <Badge className="bg-blue-500/20 text-blue-400 animate-pulse">
                计算中...
              </Badge>
            )}
          </div>
          <div className="text-sm font-normal text-muted-foreground">
            {selectedFactors.length}×{selectedFactors.length}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 说明 */}
          <div className="flex items-start space-x-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <Info className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="text-xs text-blue-400">
              <p>相关性矩阵显示因子间的线性相关程度</p>
              <p className="mt-1">值域 [-1, 1]：1表示完全正相关，-1表示完全负相关，0表示无关</p>
            </div>
          </div>

          {/* 色彩图例 */}
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-blue-500" />
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded"></div>
                <span>强负相关</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gradient-to-r from-gray-600 to-gray-500 rounded"></div>
              <span>弱相关</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gradient-to-r from-red-600 to-red-500 rounded"></div>
                <span>强正相关</span>
              </div>
              <TrendingUp className="w-4 h-4 text-red-500" />
            </div>
          </div>

          {/* 矩阵 */}
          <div className="overflow-auto max-w-full">
            <div className="min-w-fit p-2 bg-black/20 rounded-lg">
              {/* 列标题 */}
              <div className="flex mb-2">
                <div className="w-24"></div>
                {selectedFactors.map((factor, index) => (
                  <motion.div
                    key={factor.id}
                    initial={{ opacity: 0, rotateX: -90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    transition={{ delay: index * 0.05, type: "spring" }}
                    className="w-20 text-xs text-center p-1 text-gray-400"
                    title={factor.name}
                  >
                    <div className="truncate">{factor.name.substring(0, 8)}</div>
                    <div className="text-[10px] text-gray-500">{factor.category}</div>
                  </motion.div>
                ))}
              </div>

              {/* 矩阵行 */}
              {selectedFactors.map((rowFactor, i) => (
                <motion.div
                  key={rowFactor.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                  className="flex items-center mb-1"
                >
                  {/* 行标题 */}
                  <div className="w-24 text-xs text-right pr-3 text-gray-400" title={rowFactor.name}>
                    <div className="truncate">{rowFactor.name.substring(0, 10)}</div>
                    <div className="text-[10px] text-gray-500">{rowFactor.category}</div>
                  </div>
                  
                  {/* 相关性值 */}
                  {selectedFactors.map((colFactor, j) => {
                    const value = matrix[i]?.[j] || 0;
                    const isAnimating = animatingCell?.i === i && animatingCell?.j === j;
                    const isCalculated = calculatedCells.has(`${i}-${j}`);
                    
                    return (
                      <motion.div
                        key={`${i}-${j}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: isCalculated ? 1 : 0,
                          opacity: isCalculated ? 1 : 0
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 400,
                          damping: 15
                        }}
                        className="relative w-20 h-12 p-0.5"
                      >
                        <motion.div
                          animate={isAnimating ? {
                            scale: [1, 1.2, 1],
                            boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 20px rgba(59, 130, 246, 0.8)", "0 0 0px rgba(59, 130, 246, 0)"]
                          } : {}}
                          transition={{ duration: 0.3 }}
                          className={`w-full h-full flex items-center justify-center text-xs font-bold rounded-lg ${getCorrelationColor(value)} ${getTextColor(value)} shadow-lg`}
                          title={`${rowFactor.name} vs ${colFactor.name}: ${value.toFixed(3)}`}
                        >
                          {i === j ? (
                            <div className="text-center">
                              <div className="text-sm">1.00</div>
                              <div className="text-[8px] opacity-70">自相关</div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div>{value.toFixed(2)}</div>
                              {Math.abs(value) > 0.7 && (
                                <div className="text-[8px] opacity-70">
                                  {value > 0 ? '高正相关' : '高负相关'}
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                        
                        {/* 计算动画效果 */}
                        {isAnimating && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 0] }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-blue-400/30 rounded-lg pointer-events-none"
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          </div>

          {/* 统计信息 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 pt-4 border-t border-border"
          >
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">平均相关性</div>
              <div className="text-xl font-bold text-blue-400">
                {matrix.length > 0 ? (
                  matrix.flat().filter((_, i) => i % (matrix.length + 1) !== 0)
                    .reduce((sum, val) => sum + Math.abs(val), 0) / 
                  (matrix.length * (matrix.length - 1))
                ).toFixed(3) : '0.000'}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                越低越好
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">高相关对</div>
              <div className="text-xl font-bold text-red-400">
                {matrix.flat().filter(val => Math.abs(val) > 0.7 && Math.abs(val) < 1).length / 2}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                需要过滤
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">独立因子</div>
              <div className="text-xl font-bold text-green-400">
                {selectedFactors.filter((_, i) => 
                  matrix[i]?.every((val, j) => i === j || Math.abs(val) < 0.3)
                ).length}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                保留价值高
              </div>
            </div>
          </motion.div>

          {/* 计算说明 */}
          {currentStep === 2 && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3"
              >
                <p className="font-medium text-blue-400 mb-2">📊 相关性计算原理：</p>
                <ul className="space-y-1 ml-4">
                  <li>• 使用皮尔逊相关系数计算因子间的线性关系</li>
                  <li>• 相关性 = Cov(X,Y) / (σ_X × σ_Y)</li>
                  <li>• 高相关因子（|r| {'>'} 0.7）提供相似信息，需要过滤</li>
                  <li>• 保留独立性强的因子组合，提高模型效率</li>
                </ul>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}