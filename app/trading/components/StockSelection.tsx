'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import type { Stock } from '@/app/types/trading';

interface StockSelectionProps {
  stocks: Stock[];
  selectedStocks: Stock[];
  currentStep: number;
  onSelectStock: (stock: Stock) => void;
}

const getSignalColor = (signal: string) => {
  switch (signal) {
    case 'buy': return 'text-green-400 bg-green-500/20 border-green-500/30';
    case 'sell': return 'text-red-400 bg-red-500/20 border-red-500/30';
    default: return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  }
};

const getSignalIcon = (signal: string) => {
  switch (signal) {
    case 'buy': return <TrendingUp className="w-4 h-4" />;
    case 'sell': return <TrendingDown className="w-4 h-4" />;
    default: return <Minus className="w-4 h-4" />;
  }
};

const getSectorColor = (sector: string) => {
  const colors = {
    '科技': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    '金融': 'bg-green-500/20 text-green-400 border-green-500/30',
    '消费': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    '医药': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    '新能源': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    '制造': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    '地产': 'bg-red-500/20 text-red-400 border-red-500/30',
    '传媒': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };
  return colors[sector as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

export function StockSelection({ 
  stocks, 
  selectedStocks, 
  currentStep, 
  onSelectStock 
}: StockSelectionProps) {
  // 按得分排序的股票列表
  const sortedStocks = [...stocks].sort((a, b) => b.score - a.score);
  
  // 获取前20名用于显示
  const topStocks = sortedStocks.slice(0, 20);
  
  // 按行业分组统计
  const sectorStats = stocks.reduce((acc, stock) => {
    if (!acc[stock.sector]) {
      acc[stock.sector] = { count: 0, avgScore: 0, totalScore: 0 };
    }
    acc[stock.sector].count++;
    acc[stock.sector].totalScore += stock.score;
    acc[stock.sector].avgScore = acc[stock.sector].totalScore / acc[stock.sector].count;
    return acc;
  }, {} as Record<string, { count: number; avgScore: number; totalScore: number }>);

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center justify-between">
          <span>股票选择池</span>
          <div className="flex space-x-2">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              候选: {topStocks.length}
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              已选: {selectedStocks.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 行业分布统计 */}
        <div className="border-b border-border pb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">行业分布</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(sectorStats)
              .sort(([,a], [,b]) => b.avgScore - a.avgScore)
              .slice(0, 8)
              .map(([sector, stats]) => (
              <div key={sector} className="text-center">
                <Badge className={getSectorColor(sector)}>
                  {sector}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.count}只 · {stats.avgScore.toFixed(1)}分
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 股票列表 */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {topStocks.map((stock, index) => {
              const isSelected = selectedStocks.some(s => s.id === stock.id);
              const rank = index + 1;
              
              return (
                <motion.div
                  key={stock.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-lg p-4 transition-all duration-300 ${
                    isSelected 
                      ? 'border-green-500/30 bg-green-500/10' 
                      : 'border-border bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {/* 排名 */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        rank <= 3 
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {rank}
                      </div>
                      
                      {/* 股票信息 */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{stock.ticker}</span>
                          <Badge className={getSectorColor(stock.sector)}>
                            {stock.sector}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                    
                    {/* 交易信号 */}
                    <div className="flex items-center space-x-3">
                      <Badge className={getSignalColor(stock.signal)}>
                        {getSignalIcon(stock.signal)}
                        <span className="ml-1 uppercase">{stock.signal}</span>
                      </Badge>
                      
                      {!isSelected && currentStep === 5 && (
                        <Button
                          onClick={() => onSelectStock(stock)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          选择
                        </Button>
                      )}
                      
                      {isSelected && (
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                          已选择
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* 详细指标 */}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">综合得分</div>
                      <div className={`font-bold ${
                        stock.score >= 80 ? 'text-green-400' :
                        stock.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {stock.score.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">现价</div>
                      <div className="font-medium">
                        ¥{stock.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">成交量</div>
                      <div className="font-medium text-blue-400">
                        {(stock.volume / 10000).toFixed(1)}万
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">P&L</div>
                      <div className={`font-bold ${
                        stock.pnl > 0 ? 'text-green-400' : 
                        stock.pnl < 0 ? 'text-red-400' : 'text-muted-foreground'
                      }`}>
                        {stock.pnl > 0 ? '+' : ''}{stock.pnl.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 选择摘要 */}
        {selectedStocks.length > 0 && (
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-green-400 mb-3">投资组合预览</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">总投资</div>
                <div className="text-lg font-bold text-blue-400">
                  ¥{(selectedStocks.length * 100000).toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">平均得分</div>
                <div className="text-lg font-bold text-green-400">
                  {(selectedStocks.reduce((sum, s) => sum + s.score, 0) / selectedStocks.length).toFixed(1)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">预期收益</div>
                <div className="text-lg font-bold text-yellow-400">
                  {(selectedStocks.reduce((sum, s) => sum + s.pnl, 0) / selectedStocks.length).toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">风险分散</div>
                <div className="text-lg font-bold text-purple-400">
                  {new Set(selectedStocks.map(s => s.sector)).size}行业
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedStocks.map((stock) => (
                <Badge
                  key={stock.id}
                  className="bg-green-500/20 text-green-400 border border-green-500/30"
                >
                  {stock.ticker} ({stock.score.toFixed(0)})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}