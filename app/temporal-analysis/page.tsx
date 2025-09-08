'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, RefreshCw, Activity, Layers, Target, Brain, Clock, BarChart3, GitBranch, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

// 时间维度数据 - 模拟从2019年9月到2024年的月度数据
const timePoints = [
  '2019-09', '2019-12', '2020-03', '2020-06', '2020-09', '2020-12',
  '2021-03', '2021-06', '2021-09', '2021-12', '2022-03', '2022-06',
  '2022-09', '2022-12', '2023-03', '2023-06', '2023-09', '2023-12',
  '2024-03', '2024-06'
];

// 因子池演化数据
const factorEvolution = timePoints.map((date, index) => {
  const baseFactors = [
    'TA_LINEARREG_ANGLE_abs', 'HDAY_CHANGE_VAR_120_p_flip', 'BBIC_abs', 'value',
    'jq_arron_up_25_p_flip', 'liquidity_flip', 'TA_TRANGE_flip', 'TA_SUB_abs'
  ];
  
  // 模拟因子动态调整
  const newFactors = index > 10 ? ['jq_MASS_p_abs', 'jq_VEMA26_p_flip'] : [];
  const droppedFactors = index > 15 ? ['TA_SUB_abs'] : [];
  
  return {
    date,
    totalFactors: 27 + Math.floor(Math.sin(index * 0.3) * 5),
    activeFactors: baseFactors.length + newFactors.length - droppedFactors.length,
    newFactors: newFactors.length,
    droppedFactors: droppedFactors.length,
    avgIC: 0.05 + Math.sin(index * 0.2) * 0.02,
    avgIR: 1.8 + Math.sin(index * 0.15) * 0.3
  };
});

// 因子权重时间序列
const factorWeightTimeSeries = [
  { name: 'value', type: '基本面' },
  { name: 'momentum', type: '动量' },
  { name: 'volatility', type: '波动率' },
  { name: 'liquidity', type: '流动性' },
  { name: 'technical', type: '技术面' }
].map(factor => ({
  ...factor,
  data: timePoints.map((date, i) => ({
    date,
    weight: 0.15 + Math.sin(i * 0.3 + factor.name.charCodeAt(0) * 0.1) * 0.1 + Math.random() * 0.02
  }))
}));

// 自适应优化过程数据
const adaptiveOptimization = timePoints.map((date, index) => ({
  date,
  sharpeRatio: 1.5 + index * 0.05 + Math.sin(index * 0.2) * 0.3,
  fitness: 0.6 + index * 0.015 + Math.sin(index * 0.25) * 0.1,
  convergenceSpeed: 50 - index * 1.5 + Math.sin(index * 0.3) * 5,
  populationDiversity: 0.8 - index * 0.02 + Math.sin(index * 0.4) * 0.1,
  adaptiveRate: 0.1 + Math.sin(index * 0.2) * 0.05
}));

// 股票池轮换数据
const stockRotation = timePoints.map((date, index) => {
  const baseStocks = 100;
  const rotation = Math.floor(Math.abs(Math.sin(index * 0.3)) * 30);
  return {
    date,
    totalStocks: baseStocks,
    newStocks: rotation,
    removedStocks: Math.floor(rotation * 0.8),
    retainedStocks: baseStocks - rotation,
    turnoverRate: (rotation / baseStocks * 100).toFixed(1)
  };
});

// 行业配置变化
const sectorAllocation = timePoints.map((date, index) => ({
  date,
  医药: 15 + Math.sin(index * 0.2) * 5,
  科技: 20 + Math.sin(index * 0.3 + 1) * 5,
  金融: 10 + Math.sin(index * 0.25 + 2) * 3,
  消费: 12 + Math.sin(index * 0.35 + 3) * 4,
  制造: 18 + Math.sin(index * 0.15 + 4) * 4,
  其他: 25 - Math.sin(index * 0.2) * 5
}));

// 性能指标时间序列
const performanceMetrics = timePoints.map((date, index) => ({
  date,
  return: 8 + index * 0.5 + Math.sin(index * 0.3) * 3,
  volatility: 15 - index * 0.2 + Math.sin(index * 0.4) * 2,
  maxDrawdown: -8 + Math.sin(index * 0.5) * 3,
  winRate: 55 + Math.sin(index * 0.2) * 5
}));

export default function TemporalAnalysisPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedMetric] = useState('factors');
  const [animationKey, setAnimationKey] = useState(0);

  // 触发动画
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [selectedPeriod, selectedMetric]);

  // 过滤数据基于选择的时间段
  const filterDataByPeriod = <T,>(data: T[]): T[] => {
    if (selectedPeriod === 'all') return data;
    const periods = {
      '1Y': 12,
      '6M': 6,
      '3M': 3
    };
    const count = periods[selectedPeriod as keyof typeof periods] || data.length;
    return data.slice(-count);
  };

  // 计算关键变化指标
  const calculateChanges = () => {
    const data = filterDataByPeriod(factorEvolution);
    if (data.length < 2) return { factorChange: 0, icChange: 0, stockChange: 0 };
    
    const first = data[0];
    const last = data[data.length - 1];
    
    return {
      factorChange: ((last.totalFactors - first.totalFactors) / first.totalFactors * 100).toFixed(1),
      icChange: ((last.avgIC - first.avgIC) / first.avgIC * 100).toFixed(1),
      stockChange: filterDataByPeriod(stockRotation).reduce((acc, cur) => acc + cur.newStocks, 0)
    };
  };

  const changes = calculateChanges();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#151932] text-gray-200">
      <div className="w-full px-4 lg:px-8">
        {/* Header */}
        <header className="py-6 border-b border-gray-700 mb-6">
          <div className="flex items-center justify-between">
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
                  时序因子分析 - 自适应优化过程
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  展示因子选择、权重优化和股票轮换的动态演化
                </p>
              </div>
            </div>
            
            {/* Period Selector */}
            <div className="flex gap-2">
              {['3M', '6M', '1Y', 'all'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                  }`}
                >
                  {period === 'all' ? '全部' : period}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <motion.div
            key={`metric-1-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-400/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">调仓周期</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">月度</div>
            <div className="text-xs text-gray-500 mt-1">20个调仓点</div>
          </motion.div>

          <motion.div
            key={`metric-2-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-400/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">因子变化</span>
              <Layers className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">{changes.factorChange}%</div>
            <div className="text-xs text-gray-500 mt-1">因子池调整</div>
          </motion.div>

          <motion.div
            key={`metric-3-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-400/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">IC提升</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400">{changes.icChange}%</div>
            <div className="text-xs text-gray-500 mt-1">预测能力增强</div>
          </motion.div>

          <motion.div
            key={`metric-4-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">股票轮换</span>
              <RefreshCw className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-400">{changes.stockChange}</div>
            <div className="text-xs text-gray-500 mt-1">累计调入股票</div>
          </motion.div>

          <motion.div
            key={`metric-5-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-400/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">自适应率</span>
              <Brain className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-400">动态</div>
            <div className="text-xs text-gray-500 mt-1">市场适应性调整</div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Factor Evolution Chart */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              因子池动态演化
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={filterDataByPeriod(factorEvolution)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="totalFactors" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                  name="总因子数"
                />
                <Area 
                  type="monotone" 
                  dataKey="activeFactors" 
                  stackId="2"
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.4}
                  name="活跃因子"
                />
              </AreaChart>
            </ResponsiveContainer>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-400">新增因子</div>
                <div className="text-green-400 font-bold">+12</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">剔除因子</div>
                <div className="text-red-400 font-bold">-8</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">稳定因子</div>
                <div className="text-blue-400 font-bold">15</div>
              </div>
            </div>
          </div>

          {/* Adaptive Optimization Process */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              自适应优化过程
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filterDataByPeriod(adaptiveOptimization)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sharpeRatio" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="夏普比率"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="fitness" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="适应度"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="adaptiveRate" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="自适应率"
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-2">优化特征</div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                  动态学习率
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  自适应变异
                </span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                  精英保留
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Factor Weight Evolution */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            因子权重时序变化
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filterDataByPeriod(factorWeightTimeSeries[0].data)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                tick={{ fontSize: 11 }}
                domain={[0, 0.3]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
              />
              <Legend />
              {factorWeightTimeSeries.map((factor, index) => (
                <Line
                  key={factor.name}
                  type="monotone"
                  data={filterDataByPeriod(factor.data)}
                  dataKey="weight"
                  stroke={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]}
                  strokeWidth={2}
                  name={factor.type}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
            {factorWeightTimeSeries.map((factor, index) => {
              const data = filterDataByPeriod(factor.data);
              const latest = data[data.length - 1]?.weight || 0;
              const previous = data[data.length - 2]?.weight || 0;
              const change = ((latest - previous) / previous * 100).toFixed(1);
              
              return (
                <div key={factor.name} className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">{factor.type}</div>
                  <div className="text-lg font-bold" style={{ 
                    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index] 
                  }}>
                    {(latest * 100).toFixed(1)}%
                  </div>
                  <div className={`text-xs ${parseFloat(change) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(change) > 0 ? '+' : ''}{change}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stock Rotation Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-yellow-400" />
              股票池轮换分析
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filterDataByPeriod(stockRotation)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                <Bar dataKey="newStocks" stackId="a" fill="#10B981" name="新增" />
                <Bar dataKey="retainedStocks" stackId="a" fill="#3B82F6" name="保留" />
                <Bar dataKey="removedStocks" fill="#EF4444" name="剔除" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <span className="text-gray-400">平均换手率: </span>
                <span className="text-yellow-400 font-bold">15.2%</span>
              </div>
              <div>
                <span className="text-gray-400">稳定持仓: </span>
                <span className="text-blue-400 font-bold">68只</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              行业配置动态
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={filterDataByPeriod(sectorAllocation)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                <Area type="monotone" dataKey="医药" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.8} />
                <Area type="monotone" dataKey="科技" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.8} />
                <Area type="monotone" dataKey="金融" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.8} />
                <Area type="monotone" dataKey="消费" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.8} />
                <Area type="monotone" dataKey="制造" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.8} />
                <Area type="monotone" dataKey="其他" stackId="1" stroke="#6B7280" fill="#6B7280" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Tracking */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            策略性能跟踪
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filterDataByPeriod(performanceMetrics)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Legend />
              <Line type="monotone" dataKey="return" stroke="#10B981" strokeWidth={2} name="收益率%" dot={false} />
              <Line type="monotone" dataKey="volatility" stroke="#F59E0B" strokeWidth={2} name="波动率%" dot={false} />
              <Line type="monotone" dataKey="winRate" stroke="#3B82F6" strokeWidth={2} name="胜率%" dot={false} yAxisId="right" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Adaptive Features */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            自适应特性总结
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                时序调整机制
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  月度因子重评估
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  动态IC/IR阈值调整
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  市场状态识别切换
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  滚动窗口优化
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                因子进化策略
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  新因子在线测试
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  失效因子自动剔除
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  权重动态再平衡
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  相关性实时监控
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                股票池管理
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  分级轮换机制
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  核心池稳定持有
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  卫星池灵活调整
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  行业配置再平衡
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-400/30 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2">核心优势</h4>
            <p className="text-sm text-gray-300">
              通过持续的自适应优化，策略在不同市场环境下保持稳健表现。
              系统自动识别市场状态变化，动态调整因子权重和股票组合，
              实现了从静态模型到动态演化的转变，有效提升了策略的长期稳定性。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}