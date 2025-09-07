'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SystemControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  progress: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function SystemControls({
  isRunning,
  isPaused,
  progress,
  onStart,
  onPause,
  onReset
}: SystemControlsProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center space-x-2">
          <span>系统控制</span>
          {isRunning && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={onStart}
            disabled={isRunning}
            className="w-full justify-start"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            {isRunning ? '运行中...' : isPaused ? '继续执行' : '开始完整流程'}
          </Button>
          
          <Button 
            onClick={onPause}
            disabled={!isRunning}
            variant="secondary"
            className="w-full justify-start"
            size="lg"
          >
            <Pause className="w-5 h-5 mr-2" />
            暂停
          </Button>
          
          <Button 
            onClick={onReset}
            variant="outline"
            className="w-full justify-start"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            重置系统
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">总体进度</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">效率提升</div>
            <div className="text-lg font-bold text-green-400">10¹³x</div>
            <div className="text-xs text-muted-foreground">vs 穷举搜索</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">搜索覆盖率</div>
            <div className="text-lg font-bold text-yellow-400">99.9%</div>
            <div className="text-xs text-muted-foreground">最优解概率</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">实际应用</div>
            <div className="text-lg font-bold text-blue-400">24/7</div>
            <div className="text-xs text-muted-foreground">持续优化</div>
          </div>
        </div>

        {/* Status Indicator */}
        {isRunning && (
          <div className="flex items-center justify-center space-x-3 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-400 text-sm font-medium">搜索算法执行中...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}