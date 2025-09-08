'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import type { Factor } from '@/app/types/trading';

interface FactorPoolProps {
  factors: Factor[];
  onSelectFactor: (factor: Factor) => void;
  onRejectFactor: (factor: Factor) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'momentum': return <TrendingUp className="w-4 h-4" />;
    case 'reversal': return <TrendingDown className="w-4 h-4" />;
    default: return <BarChart3 className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: string) => {
  const colors = {
    momentum: 'bg-green-500/20 text-green-400 border-green-500/30',
    reversal: 'bg-red-500/20 text-red-400 border-red-500/30',
    volatility: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    value: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    growth: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    quality: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    liquidity: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    sentiment: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };
  return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

export function FactorPool({ factors, onSelectFactor, onRejectFactor }: FactorPoolProps) {
  const pendingFactors = factors.filter(f => f.status === 'pending');
  const evaluatingFactors = factors.filter(f => f.status === 'evaluating');
  const selectedFactors = factors.filter(f => f.status === 'selected');
  const rejectedFactors = factors.filter(f => f.status === 'rejected');

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center justify-between">
          <span>因子池 ({factors.length} 个因子)</span>
          <div className="flex space-x-2 text-sm">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              已选择: {selectedFactors.length}
            </Badge>
            <Badge variant="secondary" className="bg-red-500/20 text-red-400">
              已拒绝: {rejectedFactors.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 正在评估的因子 */}
        <AnimatePresence>
          {evaluatingFactors.map((factor) => (
            <motion.div
              key={factor.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                  <span className="font-medium text-blue-400">{factor.name}</span>
                  <Badge className={getCategoryColor(factor.category)}>
                    {getCategoryIcon(factor.category)}
                    <span className="ml-1">{factor.category}</span>
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {factor.timeframe}日
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">IC值</div>
                  <div className={`text-lg font-bold ${factor.ic > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {factor.ic.toFixed(3)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">IR值</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {factor.ir.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => onSelectFactor(factor)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-2" />
                  选择
                </Button>
                <Button
                  onClick={() => onRejectFactor(factor)}
                  variant="outline"
                  className="flex-1 border-red-500/30 hover:bg-red-500/20"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  拒绝
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 待评估的因子 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {pendingFactors.slice(0, 9).map((factor, index) => (
            <motion.div
              key={factor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-border rounded-lg p-3 bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate">{factor.name}</span>
                <Badge size="sm" className={getCategoryColor(factor.category)}>
                  {factor.category}
                </Badge>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>IC: {factor.ic.toFixed(3)}</span>
                <span>IR: {factor.ir.toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 已选择的因子摘要 */}
        {selectedFactors.length > 0 && (
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-green-400 mb-2">已选择因子</h4>
            <div className="flex flex-wrap gap-2">
              {selectedFactors.map((factor) => (
                <Badge
                  key={factor.id}
                  className="bg-green-500/20 text-green-400 border border-green-500/30"
                >
                  {factor.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}