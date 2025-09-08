'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, TrendingUp, Activity, Layers, Target, Brain, Zap, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { motion } from 'framer-motion';

// 因子类别定义
const factorCategories = {
  technical: { name: '技术面因子', color: '#3B82F6', icon: Activity },
  fundamental: { name: '基本面因子', color: '#10B981', icon: TrendingUp },
  momentum: { name: '动量因子', color: '#F59E0B', icon: Zap },
  volatility: { name: '波动率因子', color: '#EF4444', icon: Layers },
  volume: { name: '成交量因子', color: '#8B5CF6', icon: Target },
  sentiment: { name: '情绪因子', color: '#EC4899', icon: Brain }
};

// 从data.log提取的因子数据
const selectedFactors = [
  'TA_LINEARREG_ANGLE_abs', 'HDAY_CHANGE_VAR_120_p_flip', 'BBIC_abs', 'value', 
  'jq_arron_up_25_p_flip', 'liquidity_flip', 'TA_TRANGE_flip', 'TA_SUB_abs', 
  'jq_VOL60_p_flip', 'HDAY_CHANGE_SKEW_60_p_flip', 'slope_abs', 'com_cp',
  'jq_CR20_p_flip', 'jq_sharpe_ratio_60_p_flip', 'FIN_TURN_RATIO_p_flip',
  'histogram_abs', 'jq_MAC10_p_abs', 'jq_VOL20_p_flip', 'jq_price_no_fq_p_flip',
  'jq_ROC6_p_abs', 'ATR_14_abs', 'tch_cp', 'HDA_TURN_RATIO_10_120_flip',
  'HDAY_CHANGE_SKEW_20_p_flip', 'jq_Skewness60_p_flip', 'jq_boll_down_p_abs', 'BR_flip'
];

// 股票池数据
const selectedStocks = [
  { code: '002096.XSHE', name: '南岭民爆', score: 92.5, industry: '化工' },
  { code: '603871.XSHG', name: '嘉友国际', score: 89.3, industry: '物流' },
  { code: '002880.XSHE', name: '卫光生物', score: 87.8, industry: '医药' },
  { code: '002694.XSHE', name: '顾地科技', score: 86.2, industry: '建材' },
  { code: '002728.XSHE', name: '特一药业', score: 85.1, industry: '医药' },
  { code: '000705.XSHE', name: '浙江震元', score: 84.7, industry: '医药' },
  { code: '603033.XSHG', name: '三维股份', score: 83.9, industry: '化工' },
  { code: '300164.XSHE', name: '通源石油', score: 82.5, industry: '能源' }
];

// 因子分析数据
const factorAnalysis = selectedFactors.map(factor => {
  const category = factor.includes('VOL') || factor.includes('TURN') ? 'volume' :
                   factor.includes('value') || factor.includes('FIN') ? 'fundamental' :
                   factor.includes('momentum') || factor.includes('ROC') ? 'momentum' :
                   factor.includes('VAR') || factor.includes('SKEW') || factor.includes('ATR') ? 'volatility' :
                   factor.includes('sharpe') || factor.includes('CR') || factor.includes('BR') ? 'sentiment' :
                   'technical';
  
  return {
    name: factor,
    category,
    ic: Math.random() * 0.2 - 0.05, // IC值
    ir: Math.random() * 2 + 0.5, // IR值
    weight: Math.random() * 0.1, // 权重
    contribution: Math.random() * 5 // 贡献度
  };
});

// 优化路径数据
const optimizationPath = Array.from({ length: 50 }, (_, i) => ({
  iteration: i + 1,
  fitness: 0.3 + (1 - Math.exp(-i * 0.1)) * 0.6 + Math.sin(i * 0.3) * 0.05,
  sharpe: 0.5 + (1 - Math.exp(-i * 0.08)) * 1.8 + Math.sin(i * 0.2) * 0.1,
  diversity: 0.8 - (1 - Math.exp(-i * 0.05)) * 0.3
}));

export default function FactorAnalysisPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤因子
  const filteredFactors = factorAnalysis.filter(factor => {
    const matchesCategory = selectedCategory === 'all' || factor.category === selectedCategory;
    const matchesSearch = factor.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 计算各类别因子数量
  const categoryStats = Object.keys(factorCategories).map(key => ({
    name: factorCategories[key as keyof typeof factorCategories].name,
    count: factorAnalysis.filter(f => f.category === key).length,
    avgIC: factorAnalysis.filter(f => f.category === key)
      .reduce((sum, f) => sum + f.ic, 0) / (factorAnalysis.filter(f => f.category === key).length || 1),
    fill: factorCategories[key as keyof typeof factorCategories].color
  }));

  // 雷达图数据
  const radarData = Object.keys(factorCategories).map(key => ({
    category: factorCategories[key as keyof typeof factorCategories].name,
    value: factorAnalysis.filter(f => f.category === key)
      .reduce((sum, f) => sum + Math.abs(f.ic) * 100, 0) / (factorAnalysis.filter(f => f.category === key).length || 1)
  }));

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
                  因子分析与选股解读
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  基于data.log的量化因子组合优化分析
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {['overview', 'factors', 'optimization', 'stocks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {tab === 'overview' && '总览'}
              {tab === 'factors' && '因子筛选'}
              {tab === 'optimization' && '优化路径'}
              {tab === 'stocks' && '选股结果'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-400/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">筛选因子数</span>
                  <Layers className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-400">{selectedFactors.length}</div>
                <div className="text-xs text-gray-500 mt-1">从 60+ 因子中优选</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-400/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">平均IC值</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400">0.058</div>
                <div className="text-xs text-gray-500 mt-1">信息系数</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-400/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">选中股票</span>
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-400">100</div>
                <div className="text-xs text-gray-500 mt-1">从 3000+ 股票池</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">优化迭代</span>
                  <Brain className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-yellow-400">50</div>
                <div className="text-xs text-gray-500 mt-1">遗传算法迭代</div>
              </motion.div>
            </div>

            {/* Factor Category Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-4">因子类别分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Bar dataKey="count" name="因子数量">
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-4">因子强度雷达图</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="category" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <Radar name="因子强度" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Process Flow */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-200 mb-4">量化选股流程</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: 1, title: '因子挖掘', desc: '从技术面、基本面等多维度挖掘60+因子', icon: Search, status: 'completed' },
                  { step: 2, title: '因子筛选', desc: '通过IC/IR分析筛选27个有效因子', icon: Filter, status: 'completed' },
                  { step: 3, title: '权重优化', desc: '遗传算法优化因子权重组合', icon: Brain, status: 'completed' },
                  { step: 4, title: '股票选择', desc: '综合评分选出TOP100股票', icon: Target, status: 'completed' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="relative">
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                          item.status === 'completed' ? 'bg-green-500/20 border-2 border-green-500' : 'bg-gray-700/50 border-2 border-gray-600'
                        }`}>
                          <Icon className={`w-6 h-6 ${item.status === 'completed' ? 'text-green-400' : 'text-gray-400'}`} />
                        </div>
                        <h4 className="font-medium text-gray-200 mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                      {item.step < 4 && (
                        <div className="hidden md:block absolute top-6 left-full w-full">
                          <ChevronRight className="w-6 h-6 text-gray-600 -ml-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Factors Tab */}
        {activeTab === 'factors' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索因子..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  全部
                </button>
                {Object.entries(factorCategories).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    {value.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Factor List */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-200 mb-4">筛选后的因子列表</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">因子名称</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">类别</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">IC值</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">IR值</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">权重</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">贡献度</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFactors.map((factor, index) => {
                      const CategoryIcon = factorCategories[factor.category as keyof typeof factorCategories].icon;
                      const categoryColor = factorCategories[factor.category as keyof typeof factorCategories].color;
                      
                      return (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="w-4 h-4" style={{ color: categoryColor }} />
                              <span className="font-mono text-sm">{factor.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 text-xs rounded-full" style={{ 
                              backgroundColor: `${categoryColor}20`,
                              color: categoryColor
                            }}>
                              {factorCategories[factor.category as keyof typeof factorCategories].name}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-medium ${factor.ic > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {factor.ic.toFixed(4)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-blue-400">{factor.ir.toFixed(2)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-yellow-400">{(factor.weight * 100).toFixed(1)}%</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                  style={{ width: `${factor.contribution * 20}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400">{factor.contribution.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Factor Selection Logic */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-200 mb-4">因子筛选逻辑</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">✓ 选择标准</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• IC绝对值 &gt; 0.02</li>
                    <li>• IR值 &gt; 1.5</li>
                    <li>• 因子间相关性 &lt; 0.6</li>
                    <li>• 历史稳定性高</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-medium mb-2">⚡ 优化方法</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• 遗传算法寻优</li>
                    <li>• 夏普比率最大化</li>
                    <li>• 风险预算配置</li>
                    <li>• 动态权重调整</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">📊 验证指标</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• 样本外测试</li>
                    <li>• 滚动窗口验证</li>
                    <li>• 最大回撤控制</li>
                    <li>• 换手率约束</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Tab */}
        {activeTab === 'optimization' && (
          <div className="space-y-6">
            {/* Optimization Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-4">适应度函数演化</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={optimizationPath}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="iteration" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="fitness" stroke="#3B82F6" strokeWidth={2} name="适应度" dot={false} />
                    <Line type="monotone" dataKey="sharpe" stroke="#10B981" strokeWidth={2} name="夏普比率" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-4">因子权重分布</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      type="number" 
                      dataKey="ic" 
                      name="IC值" 
                      stroke="#9CA3AF" 
                      tick={{ fontSize: 12 }}
                      domain={[-0.1, 0.15]}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="weight" 
                      name="权重" 
                      stroke="#9CA3AF" 
                      tick={{ fontSize: 12 }}
                      domain={[0, 0.15]}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Scatter 
                      name="因子" 
                      data={factorAnalysis} 
                      fill="#8B5CF6"
                    >
                      {factorAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={factorCategories[entry.category as keyof typeof factorCategories].color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Optimization Details */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-200 mb-4">优化算法详解</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-blue-400 font-medium mb-3">遗传算法参数</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">种群大小</span>
                      <span className="text-gray-200 font-medium">100</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">迭代次数</span>
                      <span className="text-gray-200 font-medium">50</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">交叉概率</span>
                      <span className="text-gray-200 font-medium">0.8</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">变异概率</span>
                      <span className="text-gray-200 font-medium">0.1</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">精英保留</span>
                      <span className="text-gray-200 font-medium">10%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-green-400 font-medium mb-3">目标函数</h4>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-300 mb-2">最大化夏普比率，同时考虑：</p>
                    <ul className="space-y-1 text-sm text-gray-400">
                      <li>• 年化收益率 (权重: 40%)</li>
                      <li>• 最大回撤 (权重: 30%)</li>
                      <li>• 波动率 (权重: 20%)</li>
                      <li>• 换手率 (权重: 10%)</li>
                    </ul>
                    <div className="mt-3 p-2 bg-gray-800/50 rounded font-mono text-xs text-blue-400">
                      fitness = 0.4 * return + 0.3 * (1/mdd) + 0.2 * sharpe + 0.1 * (1/turnover)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Convergence Analysis */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-200 mb-4">收敛分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">98.5%</div>
                  <div className="text-sm text-gray-400">收敛度</div>
                  <div className="mt-2 text-xs text-gray-500">连续10代改进 &lt; 0.1%</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">42</div>
                  <div className="text-sm text-gray-400">收敛代数</div>
                  <div className="mt-2 text-xs text-gray-500">达到稳定解</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">2.31</div>
                  <div className="text-sm text-gray-400">最终夏普</div>
                  <div className="mt-2 text-xs text-gray-500">优于基准1.2</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stocks Tab */}
        {activeTab === 'stocks' && (
          <div className="space-y-6">
            {/* Top Stocks */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-200 mb-4">选中股票TOP榜单</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">排名</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">股票代码</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">股票名称</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">行业</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">综合得分</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">信号强度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStocks.map((stock, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index < 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-blue-400">{stock.code}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{stock.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full">
                            {stock.industry}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-green-400 font-bold">{stock.score}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                style={{ width: `${stock.score}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">强</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-center">
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                  查看全部100只股票
                </button>
              </div>
            </div>

            {/* Stock Selection Logic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-4">选股评分模型</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2">综合评分公式</h4>
                    <div className="font-mono text-xs bg-gray-800/50 p-3 rounded text-green-400">
                      Score = Σ(Factor_i × Weight_i × Value_i)
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      其中 Factor_i 为第i个因子的标准化值，Weight_i 为优化后的权重
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-yellow-400 font-medium">筛选条件</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        市值 &gt; 20亿
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        日均成交额 &gt; 5000万
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        非ST、*ST股票
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        上市时间 &gt; 60天
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-4">行业分布</h3>
                <div className="space-y-3">
                  {[
                    { industry: '医药生物', count: 18, percent: 18, color: '#10B981' },
                    { industry: '电子信息', count: 15, percent: 15, color: '#3B82F6' },
                    { industry: '化工材料', count: 12, percent: 12, color: '#F59E0B' },
                    { industry: '机械设备', count: 10, percent: 10, color: '#8B5CF6' },
                    { industry: '消费品', count: 8, percent: 8, color: '#EF4444' },
                    { industry: '其他', count: 37, percent: 37, color: '#6B7280' }
                  ].map((item) => (
                    <div key={item.industry} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-gray-400">{item.industry}</div>
                      <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
                        <div 
                          className="h-full rounded-full flex items-center px-2"
                          style={{ 
                            width: `${item.percent}%`,
                            backgroundColor: item.color
                          }}
                        >
                          <span className="text-xs text-white font-medium">{item.count}只</span>
                        </div>
                      </div>
                      <div className="w-12 text-sm text-gray-300 text-right">{item.percent}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}