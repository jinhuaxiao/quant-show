'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, BarChart3, Calendar, DollarSign, Percent, AlertTriangle, Download, Play, Pause, RotateCcw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// 生成模拟回测数据
const generateBacktestData = () => {
  const data = [];
  let portfolio = 1000000; // 初始资金 100万
  let benchmark = 1000000;
  const startDate = new Date('2023-01-01');
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // 策略收益（更高的波动和收益）
    const dailyReturn = (Math.random() - 0.48) * 0.03; // -1.44% 到 +1.56% 日收益
    portfolio = portfolio * (1 + dailyReturn);
    
    // 基准收益（较低的波动）
    const benchmarkReturn = (Math.random() - 0.49) * 0.015; // -0.735% 到 +0.765% 日收益
    benchmark = benchmark * (1 + benchmarkReturn);
    
    // 计算回撤
    const drawdown = Math.min(0, (portfolio - Math.max(...data.map(d => d.portfolio).concat(portfolio))) / Math.max(...data.map(d => d.portfolio).concat(portfolio)) * 100);
    
    data.push({
      date: date.toISOString().split('T')[0],
      portfolio: Math.round(portfolio),
      benchmark: Math.round(benchmark),
      dailyReturn: dailyReturn * 100,
      drawdown: drawdown,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      trades: Math.floor(Math.random() * 50) + 10
    });
  }
  
  return data;
};

// 计算性能指标
const calculateMetrics = (data: any[]) => {
  if (data.length === 0) return null;
  
  const returns = data.map(d => d.dailyReturn / 100);
  const totalReturn = ((data[data.length - 1].portfolio - data[0].portfolio) / data[0].portfolio) * 100;
  const annualizedReturn = totalReturn * (365 / data.length);
  const volatility = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - returns.reduce((a, b) => a + b, 0) / returns.length, 2), 0) / returns.length) * Math.sqrt(252) * 100;
  const sharpeRatio = (annualizedReturn - 2) / volatility; // 假设无风险利率为2%
  const maxDrawdown = Math.min(...data.map(d => d.drawdown));
  const winRate = (returns.filter(r => r > 0).length / returns.length) * 100;
  
  return {
    totalReturn,
    annualizedReturn,
    volatility,
    sharpeRatio,
    maxDrawdown,
    winRate,
    totalTrades: data.reduce((sum, d) => sum + d.trades, 0),
    averageTrades: Math.round(data.reduce((sum, d) => sum + d.trades, 0) / data.length)
  };
};

export default function BacktestAnalysisPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backtestData, setBacktestData] = useState(generateBacktestData());
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  
  const metrics = calculateMetrics(backtestData);

  const runBacktest = () => {
    setIsRunning(true);
    setProgress(0);
    
    // 模拟回测进度
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setBacktestData(generateBacktestData());
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const resetBacktest = () => {
    setProgress(0);
    setIsRunning(false);
    setBacktestData(generateBacktestData());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#151932] text-gray-200">
      <div className="w-full px-4 lg:px-8">
        {/* Header */}
        <header className="py-6 border-b border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">返回主页</span>
              </Link>
              <div className="h-6 border-l border-gray-700" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  策略回测分析
                </h1>
                <p className="text-gray-400 text-sm mt-1 hidden sm:block">
                  历史数据验证 - 策略性能评估与风险分析
                </p>
              </div>
            </div>
            
            {/* Period Selector */}
            <div className="flex items-center space-x-2">
              {['1M', '3M', '6M', '1Y'].map(period => (
                <Button
                  key={period}
                  size="sm"
                  variant={selectedPeriod === period ? "default" : "outline"}
                  onClick={() => setSelectedPeriod(period)}
                  className={selectedPeriod === period ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* Control Panel */}
        <div className="mb-6">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center justify-between">
                <span>回测控制面板</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    2023-01-01 至 2023-12-31
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    365 交易日
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">回测进度</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={runBacktest}
                    disabled={isRunning}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        运行中...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        开始回测
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetBacktest}
                    variant="outline"
                    disabled={isRunning}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重置
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="hidden lg:flex"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出报告
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-400/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400">
                {metrics.totalReturn.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400">总收益率</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-400/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {metrics.annualizedReturn.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400">年化收益</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-400/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {metrics.volatility.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400">波动率</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {metrics.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">夏普比率</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-400/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400">
                {metrics.maxDrawdown.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400">最大回撤</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-400/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Percent className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {metrics.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">胜率</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-400/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {metrics.totalTrades}
              </div>
              <div className="text-xs text-gray-400">总交易次数</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-400/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-2xl font-bold text-pink-400">
                {metrics.averageTrades}
              </div>
              <div className="text-xs text-gray-400">日均交易</div>
            </motion.div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Portfolio Value Chart */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-4">资产净值曲线</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={backtestData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `¥${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: any) => [`¥${(value / 1000).toFixed(0)}K`, '']}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="portfolio" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      name="策略净值"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="#F59E0B" 
                      fill="#F59E0B" 
                      fillOpacity={0.1}
                      name="基准净值"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily Returns Distribution */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-4">每日收益分布</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={backtestData.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: any) => [`${value.toFixed(2)}%`, '日收益']}
                    />
                    <ReferenceLine y={0} stroke="#6B7280" />
                    <Bar 
                      dataKey="dailyReturn" 
                      name="日收益率"
                      fill={(data: any) => data.dailyReturn > 0 ? '#10B981' : '#EF4444'}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Drawdown Chart */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-4">回撤分析</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={backtestData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: any) => [`${value.toFixed(2)}%`, '回撤']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="drawdown" 
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.3}
                      name="回撤"
                      strokeWidth={2}
                    />
                    <ReferenceLine y={-5} stroke="#F59E0B" strokeDasharray="5 5" label="5% 警戒线" />
                    <ReferenceLine y={-10} stroke="#EF4444" strokeDasharray="5 5" label="10% 止损线" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trading Volume */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-4">交易量分析</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={backtestData.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#8B5CF6" 
                      name="交易量"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="trades" 
                      stroke="#10B981" 
                      name="交易次数"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-400 flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5" />
            <span>风险分析报告</span>
          </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">风险等级评估</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" />
                  </div>
                  <span className="text-sm font-bold text-yellow-400">中高</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">VAR (95%)</h4>
                <div className="text-2xl font-bold text-orange-400">-2.8%</div>
                <p className="text-xs text-gray-500">日风险价值</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">最长连亏</h4>
                <div className="text-2xl font-bold text-red-400">7天</div>
                <p className="text-xs text-gray-500">历史最长连续亏损</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">盈亏比</h4>
                <div className="text-2xl font-bold text-green-400">1.8:1</div>
                <p className="text-xs text-gray-500">平均盈利/平均亏损</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Summary */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-4">策略回测总结</h3>
            <div className="prose prose-invert max-w-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-green-400 mb-3">策略优势</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      年化收益率超过基准15个百分点
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      夏普比率达到2.0以上，风险调整后收益优秀
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      最大回撤控制在10%以内，风险可控
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      胜率稳定在55%以上，具有统计优势
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-yellow-400 mb-3">改进建议</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">!</span>
                      考虑加入动态止损机制，进一步降低回撤
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">!</span>
                      优化仓位管理，在高波动期降低杠杆
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">!</span>
                      增加市场状态识别，适应不同市场环境
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">!</span>
                      考虑交易成本和滑点的影响
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}