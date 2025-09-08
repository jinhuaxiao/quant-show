'use client';

import { useEffect, useState, useRef } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface SearchSpaceVisualizationProps {
  isAnimating?: boolean;
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

export function SearchSpaceVisualization({ isAnimating: externalAnimating, parameters }: SearchSpaceVisualizationProps) {
  const [bruteForceNodes, setBruteForceNodes] = useState<SearchNode[]>([]);
  const [geneticNodes, setGeneticNodes] = useState<SearchNode[]>([]);
  const [internalAnimating, setInternalAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Use either external or internal animation state
  const isAnimating = externalAnimating ?? internalAnimating;

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

  // Initialize genetic algorithm visualization with spiral pattern
  const initializeGeneticNodes = () => {
    const nodes: SearchNode[] = [];
    // Create initial scattered points
    for (let i = 0; i < 30; i++) {
      const seed = i * 2654435761 % 2147483647;
      const x = ((seed % 1000) / 1000) * 90 + 5;
      const y = (((seed * 7) % 1000) / 1000) * 90 + 5;
      
      nodes.push({
        id: `genetic-${i}`,
        x,
        y,
        type: 'explored',
        opacity: 0.1
      });
    }
    setGeneticNodes(nodes);
  };

  useEffect(() => {
    initializeGeneticNodes();
  }, []);

  // Start animation
  const startAnimation = () => {
    setInternalAnimating(true);
    initializeGeneticNodes();
    
    let iteration = 0;
    const totalIterations = 50;
    const centerX = 50;
    const centerY = 50;
    
    const animate = () => {
      if (iteration >= totalIterations) {
        setInternalAnimating(false);
        return;
      }

      setGeneticNodes(prev => {
        const newNodes = [...prev];
        
        // Spiral convergence pattern
        const progress = iteration / totalIterations;
        const angle = progress * Math.PI * 4; // Multiple rotations
        const radius = (1 - progress) * 40; // Decreasing radius
        
        // Add some variation
        const seed1 = (iteration * 2654435761) % 2147483647;
        const seed2 = ((iteration + 1000) * 2654435761) % 2147483647;
        const variation = 5 * (1 - progress); // Less variation as we converge
        const randX = ((seed1 % 1000) / 1000 - 0.5) * variation;
        const randY = ((seed2 % 1000) / 1000 - 0.5) * variation;
        
        const x = centerX + radius * Math.cos(angle) + randX;
        const y = centerY + radius * Math.sin(angle) + randY;
        
        // Add new node or update existing
        const nodeIndex = iteration % newNodes.length;
        newNodes[nodeIndex] = {
          id: `genetic-${nodeIndex}`,
          x: Math.max(5, Math.min(95, x)),
          y: Math.max(5, Math.min(95, y)),
          type: progress > 0.8 ? 'optimal' : progress > 0.4 ? 'evaluating' : 'explored',
          opacity: progress > 0.8 ? 1 : progress > 0.4 ? 0.7 : 0.3
        };
        
        // Update other nodes based on progress
        newNodes.forEach((node, index) => {
          if (index !== nodeIndex) {
            // Gradually converge all nodes toward center
            const convergeRate = 0.05 * progress;
            node.x = node.x + (centerX - node.x) * convergeRate;
            node.y = node.y + (centerY - node.y) * convergeRate;
            
            // Update opacity based on distance from center
            const distance = Math.sqrt(Math.pow(node.x - centerX, 2) + Math.pow(node.y - centerY, 2));
            if (distance < 10 && progress > 0.7) {
              node.type = 'optimal';
              node.opacity = 1;
            } else if (distance < 20 && progress > 0.4) {
              node.type = 'evaluating';
              node.opacity = 0.7;
            }
          }
        });
        
        return newNodes;
      });

      iteration++;
      animationRef.current = setTimeout(animate, 100);
    };

    animate();
  };

  // Reset animation
  const resetAnimation = () => {
    setInternalAnimating(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    initializeGeneticNodes();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const renderNodes = (nodes: SearchNode[]) => (
    <div className="absolute inset-0">
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`absolute rounded-full transition-all duration-500 ${
            node.type === 'explored' ? 'bg-gray-500 w-1 h-1' :
            node.type === 'evaluating' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 w-1.5 h-1.5 animate-pulse' :
            'bg-green-400 shadow-lg shadow-green-400/50 w-2 h-2 animate-pulse'
          }`}
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            opacity: node.opacity,
            transform: 'translate(-50%, -50%)'
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
            
            {/* Convergence indicator */}
            {isAnimating && (
              <div className="absolute top-2 right-2 text-xs text-green-400 animate-pulse">
                收敛中...
              </div>
            )}
            
            {/* Search trails */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <radialGradient id="convergence">
                  <stop offset="0%" stopColor="rgba(34, 197, 94, 0.2)" />
                  <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                </radialGradient>
              </defs>
              {isAnimating && (
                <circle
                  cx="50%"
                  cy="50%"
                  r="20%"
                  fill="url(#convergence)"
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>
          <div className="mt-4 text-center text-sm text-gray-400">
            仅评估 ~{geneticEvaluations.toFixed(0)} 种组合即可收敛
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={startAnimation}
          disabled={internalAnimating}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          {internalAnimating ? '演示中...' : '开始演示'}
        </button>
        <button
          onClick={resetAnimation}
          className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-400/10 border-l-4 border-blue-400 p-6 rounded-r-lg">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">💡 算法效率对比</h4>
        <p className="text-gray-300 leading-relaxed">
          穷举搜索需要评估所有可能的组合，时间复杂度为指数级。而智能优化算法通过启发式搜索，
          只需评估极小部分组合（约0.00001%）就能找到近似最优解。遗传算法通过模拟自然进化过程，
          从分散的搜索点逐渐收敛到最优解区域。
        </p>
      </div>
    </section>
  );
}