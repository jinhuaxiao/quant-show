'use client';

import { useEffect, useState } from 'react';

interface SearchSpaceVisualizationProps {
  isAnimating: boolean;
  parameters: {
    n: number;
    k: number;
    s: number;
  };
}

interface SearchNode {
  id: string;
  x: number;
  y: number;
  type: 'explored' | 'evaluating' | 'optimal';
  opacity: number;
}

export function SearchSpaceVisualization({ isAnimating, parameters }: SearchSpaceVisualizationProps) {
  const [bruteForceNodes, setBruteForceNodes] = useState<SearchNode[]>([]);
  const [geneticNodes, setGeneticNodes] = useState<SearchNode[]>([]);

  // Initialize brute force visualization (dense grid)
  useEffect(() => {
    const nodes: SearchNode[] = [];
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        nodes.push({
          id: `brute-${i}-${j}`,
          x: (i * 5) + 2.5,
          y: (j * 5) + 2.5,
          type: 'explored',
          opacity: 0.2
        });
      }
    }
    setBruteForceNodes(nodes);
  }, []);

  // Initialize genetic algorithm visualization
  useEffect(() => {
    const nodes: SearchNode[] = [];
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const radius = 40 - i * 0.7;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      
      nodes.push({
        id: `genetic-${i}`,
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
        type: i < 10 ? 'explored' : i < 40 ? 'evaluating' : 'optimal',
        opacity: i < 10 ? 0.3 : 1
      });
    }
    setGeneticNodes(nodes);
  }, []);

  // Animate genetic algorithm search
  useEffect(() => {
    if (!isAnimating) return;

    let iteration = 0;
    const interval = setInterval(() => {
      if (iteration >= 50) {
        clearInterval(interval);
        return;
      }

      setGeneticNodes(prev => {
        const newNodes = [...prev];
        
        // Add new search point
        const angle = (iteration / 50) * Math.PI * 2;
        const radius = 40 - iteration * 0.7;
        const baseX = 50 + radius * Math.cos(angle);
        const baseY = 50 + radius * Math.sin(angle);
        
        // Add some randomness
        const x = Math.max(5, Math.min(95, baseX + (Math.random() - 0.5) * 10));
        const y = Math.max(5, Math.min(95, baseY + (Math.random() - 0.5) * 10));

        if (iteration < newNodes.length) {
          newNodes[iteration] = {
            ...newNodes[iteration],
            x,
            y,
            type: iteration < 20 ? 'evaluating' : 'optimal',
            opacity: 1
          };
        }

        // Fade older nodes
        newNodes.forEach((node, index) => {
          if (index < iteration - 10) {
            node.type = 'explored';
            node.opacity = 0.2;
          }
        });

        return newNodes;
      });

      iteration++;
    }, 100);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const renderNodes = (nodes: SearchNode[]) => (
    <div className="absolute inset-0">
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`absolute w-1 h-1 rounded-full transition-all duration-500 ${
            node.type === 'explored' ? 'bg-gray-500' :
            node.type === 'evaluating' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-evaluating' :
            'bg-green-400 shadow-lg shadow-green-400/50 w-2 h-2'
          }`}
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            opacity: node.opacity,
            transform: node.type === 'optimal' ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );

  const totalCombinations = Math.exp(
    Array.from({ length: parameters.k }, (_, i) => 
      Math.log(parameters.n - i) - Math.log(i + 1)
    ).reduce((a, b) => a + b, 0)
  ) * Math.pow(parameters.s, parameters.k);

  const geneticEvaluations = Math.min(10000, totalCombinations * 0.0001);

  return (
    <section className="bg-card-bg border-2 border-[var(--color-border)] rounded-xl p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 uppercase tracking-wider">
        🎯 搜索空间可视化对比
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Brute Force Search */}
        <div className="bg-black/50 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-4 text-center">
            穷举搜索 (不可行)
          </h3>
          <div className="relative w-full h-64 lg:h-72 bg-gradient-radial from-blue-400/10 to-transparent rounded-lg overflow-hidden">
            {renderNodes(bruteForceNodes)}
          </div>
          <div className="mt-4 text-center text-sm text-gray-400">
            评估所有 {totalCombinations.toExponential(1)} 种组合
          </div>
        </div>
        
        {/* Genetic Algorithm Search */}
        <div className="bg-black/50 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-4 text-center">
            遗传算法 (高效)
          </h3>
          <div className="relative w-full h-64 lg:h-72 bg-gradient-radial from-blue-400/10 to-transparent rounded-lg overflow-hidden">
            {renderNodes(geneticNodes)}
            
            {/* Search trails */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <path id="searchPath" d="M 50,90 Q 30,50 50,10 Q 70,50 50,90" />
              </defs>
              <path
                d="M 50,90 Q 30,50 50,10 Q 70,50 50,90"
                stroke="rgba(102, 126, 234, 0.3)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="5,5"
                className="animate-dash"
              />
            </svg>
          </div>
          <div className="mt-4 text-center text-sm text-gray-400">
            仅评估 ~{geneticEvaluations.toFixed(0)} 种组合即可收敛
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-400/10 border-l-4 border-blue-400 p-6 rounded-r-lg">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">💡 算法效率对比</h4>
        <p className="text-gray-300 leading-relaxed">
          穷举搜索需要评估所有可能的组合，时间复杂度为指数级。而智能优化算法通过启发式搜索，
          只需评估极小部分组合（约0.00001%）就能找到近似最优解。这就是为什么文艺复兴科技
          能够每天处理海量因子组合，而普通方法却无法实现的原因。
        </p>
      </div>
    </section>
  );
}