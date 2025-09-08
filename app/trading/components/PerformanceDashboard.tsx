'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Zap, Shield, BarChart3 } from 'lucide-react';
import type { TradingSystemState } from '@/app/types/trading';

interface PerformanceDashboardProps {
  performance: TradingSystemState['performance'];
  currentStep: number;
}

const MetricCard = ({ 
  title, 
  value, 
  unit = '', 
  icon: Icon, 
  color, 
  trend 
}: {
  title: string;
  value: number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };

  const formatValue = (val: number) => {
    if (Math.abs(val) >= 1000000) {
      return (val / 1000000).toFixed(2) + 'M';
    }
    if (Math.abs(val) >= 1000) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return val.toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border ${color} bg-opacity-10 hover:bg-opacity-20 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color.includes('green') ? 'text-green-400' : 
                         color.includes('red') ? 'text-red-400' :
                         color.includes('blue') ? 'text-blue-400' :
                         color.includes('yellow') ? 'text-yellow-400' :
                         color.includes('purple') ? 'text-purple-400' : 'text-cyan-400'}`} />
        {getTrendIcon()}
      </div>
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className={`text-lg font-bold ${
          color.includes('green') ? 'text-green-400' : 
          color.includes('red') ? 'text-red-400' :
          color.includes('blue') ? 'text-blue-400' :
          color.includes('yellow') ? 'text-yellow-400' :
          color.includes('purple') ? 'text-purple-400' : 'text-cyan-400'
        }`}>
          {formatValue(value)}{unit}
        </div>
      </div>
    </motion.div>
  );
};

export function PerformanceDashboard({ performance, currentStep }: PerformanceDashboardProps) {
  const isActive = currentStep >= 6;
  
  // 性能等级评估
  const getPerformanceLevel = (sharpe: number) => {
    if (sharpe >= 2.0) return { level: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (sharpe >= 1.5) return { level: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (sharpe >= 1.0) return { level: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'Poor', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const performanceLevel = getPerformanceLevel(performance.sharpeRatio);

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center justify-between">
          <span>实时绩效监控</span>
          <div className="flex space-x-2">
            <Badge className={`${performanceLevel.bg} ${performanceLevel.color}`}>
              {performanceLevel.level}
            </Badge>
            {isActive && (
              <Badge className="bg-green-500/20 text-green-400 animate-pulse">
                实时更新
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 主要指标网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            title="总收益率"
            value={performance.totalReturn}
            unit="%"
            icon={TrendingUp}
            color="bg-green-500/20 border-green-500/30"
            trend={performance.totalReturn > 0 ? 'up' : performance.totalReturn < 0 ? 'down' : 'neutral'}
          />
          
          <MetricCard
            title="年化收益率"
            value={performance.annualizedReturn}
            unit="%"
            icon={Target}
            color="bg-blue-500/20 border-blue-500/30"
            trend={performance.annualizedReturn > 8 ? 'up' : 'neutral'}
          />
          
          <MetricCard
            title="夏普比率"
            value={performance.sharpeRatio}
            icon={Zap}
            color="bg-yellow-500/20 border-yellow-500/30"
            trend={performance.sharpeRatio > 1.5 ? 'up' : 'neutral'}
          />
          
          <MetricCard
            title="最大回撤"
            value={performance.maxDrawdown}
            unit="%"
            icon={Shield}
            color="bg-red-500/20 border-red-500/30"
            trend={Math.abs(performance.maxDrawdown) < 10 ? 'up' : 'down'}
          />
          
          <MetricCard
            title="胜率"
            value={performance.winRate}
            unit="%"
            icon={Target}
            color="bg-purple-500/20 border-purple-500/30"
            trend={performance.winRate > 60 ? 'up' : 'neutral'}
          />
          
          <MetricCard
            title="波动率"
            value={performance.volatility}
            unit="%"
            icon={BarChart3}
            color="bg-cyan-500/20 border-cyan-500/30"
            trend={performance.volatility < 15 ? 'up' : 'down'}
          />
        </div>

        {/* 风险收益分析 */}
        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">风险收益分析</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 收益分布 */}
            <div className="space-y-3">
              <div className="text-sm text-blue-400 font-medium">收益分布</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">预期收益</span>
                  <span className="text-sm font-medium text-green-400">
                    {performance.annualizedReturn.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.max(performance.annualizedReturn * 5, 0), 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>20%</span>
                </div>
              </div>
            </div>

            {/* 风险指标 */}
            <div className="space-y-3">
              <div className="text-sm text-red-400 font-medium">风险控制</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">最大回撤</span>
                  <span className="text-sm font-medium text-red-400">
                    {performance.maxDrawdown.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className="bg-red-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(performance.maxDrawdown) * 5, 100)}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>-20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 策略优势 */}
        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">策略特色</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-xs text-blue-400 font-medium">多因子模型</div>
              <div className="text-lg font-bold text-blue-400">50+</div>
              <div className="text-xs text-muted-foreground">因子库</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-xs text-green-400 font-medium">机器学习</div>
              <div className="text-lg font-bold text-green-400">IPSO</div>
              <div className="text-xs text-muted-foreground">优化算法</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-xs text-purple-400 font-medium">动态调仓</div>
              <div className="text-lg font-bold text-purple-400">T+1</div>
              <div className="text-xs text-muted-foreground">执行频率</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-xs text-yellow-400 font-medium">风控系统</div>
              <div className="text-lg font-bold text-yellow-400">24/7</div>
              <div className="text-xs text-muted-foreground">实时监控</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}