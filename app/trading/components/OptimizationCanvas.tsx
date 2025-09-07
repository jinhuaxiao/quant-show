'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SearchPoint } from '@/app/types/trading';

interface OptimizationCanvasProps {
  searchHistory: SearchPoint[];
  iteration: number;
  maxIterations: number;
  currentStep: number;
}

export function OptimizationCanvas({ 
  searchHistory, 
  iteration, 
  maxIterations, 
  currentStep 
}: OptimizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置canvas尺寸
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // 清空画布
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // 绘制网格
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x <= rect.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y <= rect.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }
    
    // 绘制搜索路径
    if (searchHistory.length > 1) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      searchHistory.forEach((point, index) => {
        const x = (point.x * rect.width) / 100;
        const y = (point.y * rect.height) / 100;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
    
    // 绘制搜索点
    searchHistory.forEach((point, index) => {
      const x = (point.x * rect.width) / 100;
      const y = (point.y * rect.height) / 100;
      const radius = index === searchHistory.length - 1 ? 8 : 4;
      
      // 根据fitness值确定颜色
      const intensity = Math.min(point.fitness / 100, 1);
      const red = Math.floor(255 * (1 - intensity));
      const green = Math.floor(255 * intensity);
      
      ctx.fillStyle = `rgba(${red}, ${green}, 100, 0.8)`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // 当前点添加脉冲效果
      if (index === searchHistory.length - 1 && currentStep === 3) {
        ctx.strokeStyle = `rgba(${red}, ${green}, 100, 0.6)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
    
    // 绘制梯度场（模拟）
    if (currentStep === 3) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      const centerX = rect.width * 0.7;
      const centerY = rect.height * 0.3;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
    
  }, [searchHistory, currentStep, iteration]);
  
  const bestPoint = searchHistory.reduce((best, current) => 
    current.fitness > best.fitness ? current : best, 
    searchHistory[0] || { fitness: 0, x: 0, y: 0 }
  );
  
  const averageFitness = searchHistory.length > 0 
    ? searchHistory.reduce((sum, point) => sum + point.fitness, 0) / searchHistory.length 
    : 0;

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center justify-between">
          <span>优化搜索空间</span>
          <div className="flex space-x-2">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              第 {iteration}/{maxIterations} 代
            </Badge>
            {currentStep === 3 && (
              <Badge className="bg-green-500/20 text-green-400 animate-pulse">
                搜索中
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 画布 */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-64 bg-gray-900/50 rounded-lg border border-border"
            style={{ width: '100%', height: '256px' }}
          />
          
          {/* 坐标轴标签 */}
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
            风险 →
          </div>
          <div className="absolute top-2 left-2 text-xs text-muted-foreground transform -rotate-90 origin-left">
            收益 ↑
          </div>
          
          {/* 最优点标记 */}
          {searchHistory.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 bg-green-500/20 border border-green-500/30 rounded-lg p-2"
            >
              <div className="text-xs text-green-400">最优点</div>
              <div className="text-xs text-muted-foreground">
                ({bestPoint.x.toFixed(1)}, {bestPoint.y.toFixed(1)})
              </div>
            </motion.div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">搜索点数</div>
            <div className="text-lg font-bold text-blue-400">
              {searchHistory.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">最优适应度</div>
            <div className="text-lg font-bold text-green-400">
              {bestPoint ? bestPoint.fitness.toFixed(2) : '0.00'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">平均适应度</div>
            <div className="text-lg font-bold text-yellow-400">
              {averageFitness.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">收敛进度</div>
            <div className="text-lg font-bold text-purple-400">
              {((iteration / maxIterations) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* 算法说明 */}
        <div className="border-t border-border pt-4">
          <div className="text-sm text-muted-foreground mb-2">优化算法：改进粒子群算法 (IPSO)</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="text-blue-400">
              自适应惯性权重
            </Badge>
            <Badge variant="outline" className="text-green-400">
              动态邻域拓扑
            </Badge>
            <Badge variant="outline" className="text-purple-400">
              多目标优化
            </Badge>
            <Badge variant="outline" className="text-yellow-400">
              约束处理
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}