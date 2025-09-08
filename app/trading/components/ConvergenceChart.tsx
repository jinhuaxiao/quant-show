'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConvergencePoint {
  iteration: number;
  fitness: number;
  timestamp: number;
}

interface ConvergenceChartProps {
  convergenceHistory: ConvergencePoint[];
  currentStep: number;
  iteration: number;
}

export function ConvergenceChart({ 
  convergenceHistory, 
  currentStep, 
  iteration 
}: ConvergenceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // 清空画布
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    if (convergenceHistory.length === 0) return;
    
    // 计算数据范围
    const maxFitness = Math.max(...convergenceHistory.map(p => p.fitness));
    const minFitness = Math.min(...convergenceHistory.map(p => p.fitness));
    const maxIteration = Math.max(...convergenceHistory.map(p => p.iteration));
    
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    // 绘制网格
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.lineWidth = 1;
    
    // 垂直网格线
    for (let i = 0; i <= 10; i++) {
      const x = padding + (chartWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, rect.height - padding);
      ctx.stroke();
    }
    
    // 水平网格线
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
    }
    
    // 绘制坐标轴
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)';
    ctx.lineWidth = 2;
    
    // X轴
    ctx.beginPath();
    ctx.moveTo(padding, rect.height - padding);
    ctx.lineTo(rect.width - padding, rect.height - padding);
    ctx.stroke();
    
    // Y轴
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.stroke();
    
    // 绘制收敛曲线
    if (convergenceHistory.length > 1) {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      convergenceHistory.forEach((point, index) => {
        const x = padding + (point.iteration / maxIteration) * chartWidth;
        const y = rect.height - padding - ((point.fitness - minFitness) / (maxFitness - minFitness)) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // 绘制数据点
      convergenceHistory.forEach((point, index) => {
        const x = padding + (point.iteration / maxIteration) * chartWidth;
        const y = rect.height - padding - ((point.fitness - minFitness) / (maxFitness - minFitness)) * chartHeight;
        
        // 点的大小随时间递减
        const radius = index === convergenceHistory.length - 1 ? 5 : 3;
        
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // 当前点添加光晕效果
        if (index === convergenceHistory.length - 1) {
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, radius + 3, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });
    }
    
    // 绘制轴标签
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    
    // X轴标签
    for (let i = 0; i <= 5; i++) {
      const x = padding + (chartWidth / 5) * i;
      const value = Math.round((maxIteration / 5) * i);
      ctx.fillText(value.toString(), x, rect.height - 10);
    }
    
    // Y轴标签
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = rect.height - padding - (chartHeight / 5) * i;
      const value = (minFitness + ((maxFitness - minFitness) / 5) * i).toFixed(2);
      ctx.fillText(value, padding - 10, y + 4);
    }
    
  }, [convergenceHistory, currentStep]);
  
  const latestFitness = convergenceHistory.length > 0 
    ? convergenceHistory[convergenceHistory.length - 1].fitness 
    : 0;
  
  const improvementRate = convergenceHistory.length > 1
    ? ((latestFitness - convergenceHistory[0].fitness) / convergenceHistory[0].fitness * 100)
    : 0;
  
  const isConverged = convergenceHistory.length > 5 && 
    convergenceHistory.slice(-5).every(point => 
      Math.abs(point.fitness - latestFitness) < 0.001
    );

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center justify-between">
          <span>收敛曲线</span>
          <div className="flex space-x-2">
            {isConverged && (
              <Badge className="bg-green-500/20 text-green-400">
                已收敛
              </Badge>
            )}
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
              步骤 {currentStep}/6
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 图表 */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-48 bg-gray-900/50 rounded-lg border border-border"
            style={{ width: '100%', height: '192px' }}
          />
          
          {/* 轴标签 */}
          <div className="absolute bottom-2 right-1/2 transform translate-x-1/2 text-xs text-muted-foreground">
            迭代次数
          </div>
          <div className="absolute top-1/2 left-2 text-xs text-muted-foreground transform -rotate-90 origin-center">
            适应度值
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">当前适应度</div>
            <div className="text-lg font-bold text-green-400">
              {latestFitness.toFixed(4)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">改善率</div>
            <div className={`text-lg font-bold ${improvementRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {improvementRate > 0 ? '+' : ''}{improvementRate.toFixed(2)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">迭代数</div>
            <div className="text-lg font-bold text-blue-400">
              {iteration}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">收敛状态</div>
            <div className={`text-lg font-bold ${isConverged ? 'text-green-400' : 'text-yellow-400'}`}>
              {isConverged ? '已收敛' : '优化中'}
            </div>
          </div>
        </div>

        {/* 收敛判断准则 */}
        <div className="border-t border-border pt-4">
          <div className="text-sm text-muted-foreground mb-2">收敛判断准则</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConverged ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              <span>连续5代变化 &lt; 0.1%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                iteration > 50 ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              <span>最小迭代次数: 50</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                latestFitness > 0.8 ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              <span>目标适应度 &gt; 0.8</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}