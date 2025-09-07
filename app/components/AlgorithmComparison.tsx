'use client';

interface AlgorithmComparisonProps {
  activeAlgorithm: string;
  onAlgorithmChange: (algorithm: string) => void;
}

const algorithms = [
  {
    id: 'greedy',
    name: '贪婪算法',
    complexity: 'O(N²)',
    time: '秒级',
    description: '逐步添加最优因子\n简单快速但可能陷入局部最优',
    searchCapability: '局部',
    optimality: '局部最优',
    actualTime: '秒级',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'lasso',
    name: 'LASSO回归',
    complexity: 'O(N×K×T)',
    time: '分钟级',
    description: 'L1正则化自动筛选\n数学优雅，自动权重收缩',
    searchCapability: '凸优化',
    optimality: '凸问题最优',
    actualTime: '分钟级',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'genetic',
    name: '遗传算法',
    complexity: 'O(G×P×F)',
    time: '分钟级',
    description: '模拟自然进化\n全局搜索能力强',
    searchCapability: '全局',
    optimality: '近似最优',
    actualTime: '分钟级',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'pso',
    name: '粒子群优化',
    complexity: 'O(I×N×D)',
    time: '分钟级',
    description: '群体智能搜索\n收敛速度快',
    searchCapability: '全局',
    optimality: '近似最优',
    actualTime: '分钟级',
    color: 'from-yellow-500 to-yellow-600'
  }
];

const comparisonData = [
  {
    algorithm: '穷举搜索',
    timeComplexity: 'O(N^K × S^K)',
    spaceComplexity: 'O(1)',
    searchCapability: '完全',
    optimality: '全局最优',
    actualTime: '数百年',
    timeColor: 'text-red-400',
    actualTimeColor: 'text-red-400'
  },
  {
    algorithm: '贪婪算法',
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(N)',
    searchCapability: '局部',
    optimality: '局部最优',
    actualTime: '秒级',
    timeColor: 'text-green-400',
    actualTimeColor: 'text-green-400'
  },
  {
    algorithm: 'LASSO',
    timeComplexity: 'O(N×K×T)',
    spaceComplexity: 'O(N×K)',
    searchCapability: '凸优化',
    optimality: '凸问题最优',
    actualTime: '分钟级',
    timeColor: 'text-green-400',
    actualTimeColor: 'text-green-400'
  },
  {
    algorithm: '遗传算法',
    timeComplexity: 'O(G×P×F)',
    spaceComplexity: 'O(P×N)',
    searchCapability: '全局',
    optimality: '近似最优',
    actualTime: '分钟级',
    timeColor: 'text-yellow-400',
    actualTimeColor: 'text-yellow-400'
  },
  {
    algorithm: '粒子群',
    timeComplexity: 'O(I×N×D)',
    spaceComplexity: 'O(N×D)',
    searchCapability: '全局',
    optimality: '近似最优',
    actualTime: '分钟级',
    timeColor: 'text-yellow-400',
    actualTimeColor: 'text-yellow-400'
  }
];

export function AlgorithmComparison({ activeAlgorithm, onAlgorithmChange }: AlgorithmComparisonProps) {
  return (
    <section className="bg-card-bg border-2 border-[var(--color-border)] rounded-xl p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 uppercase tracking-wider">
        🧬 智能算法解决方案
      </h2>
      
      {/* Algorithm Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {algorithms.map((algo) => (
          <div
            key={algo.id}
            className={`bg-white/5 border border-white/10 rounded-lg p-4 lg:p-6 relative overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-500/30 hover:bg-white/10 ${
              activeAlgorithm === algo.id ? 'border-blue-400 bg-blue-400/10' : ''
            }`}
            onClick={() => onAlgorithmChange(algo.id)}
          >
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-3 text-blue-400">{algo.name}</h3>
              <div className="text-sm text-green-400 mb-2">复杂度: {algo.complexity}</div>
              <div className="text-sm text-yellow-400 mb-3">耗时: {algo.time}</div>
              <div className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                {algo.description}
              </div>
            </div>
            
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${algo.color} opacity-5`}></div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-400/20">
              <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide border-b border-white/20">算法</th>
              <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide border-b border-white/20">时间复杂度</th>
              <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide border-b border-white/20">空间复杂度</th>
              <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide border-b border-white/20">搜索能力</th>
              <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide border-b border-white/20">最优性保证</th>
              <th className="p-3 text-left text-sm font-semibold uppercase tracking-wide border-b border-white/20">实际耗时</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <tr key={index} className="hover:bg-white/5 transition-colors border-b border-white/10">
                <td className="p-3 text-sm font-medium">{row.algorithm}</td>
                <td className={`p-3 text-sm font-mono ${row.timeColor}`}>{row.timeComplexity}</td>
                <td className="p-3 text-sm font-mono">{row.spaceComplexity}</td>
                <td className="p-3 text-sm">{row.searchCapability}</td>
                <td className="p-3 text-sm">{row.optimality}</td>
                <td className={`p-3 text-sm font-semibold ${row.actualTimeColor}`}>{row.actualTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}