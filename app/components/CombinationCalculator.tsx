'use client';

interface CombinationCalculatorProps {
  parameters: {
    n: number;
    k: number;
    s: number;
    w?: number;
  };
  onParametersChange: (params: Partial<{ n: number; k: number; s: number; w?: number }>) => void;
}

export function CombinationCalculator({ parameters, onParametersChange }: CombinationCalculatorProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
      {/* N Parameter */}
      <div className="bg-black/50 p-3 lg:p-4 rounded-lg border border-white/10 text-center">
        <div className="text-xs lg:text-sm text-gray-400 mb-2">因子池大小 (N)</div>
        <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-3">{parameters.n}</div>
        <input
          type="range"
          min="10"
          max="100"
          value={parameters.n}
          onChange={(e) => onParametersChange({ n: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>10</span>
          <span>100</span>
        </div>
      </div>

      {/* K Parameter */}
      <div className="bg-black/50 p-3 lg:p-4 rounded-lg border border-white/10 text-center">
        <div className="text-xs lg:text-sm text-gray-400 mb-2">选择因子数 (K)</div>
        <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-3">{parameters.k}</div>
        <input
          type="range"
          min="1"
          max="30"
          value={parameters.k}
          onChange={(e) => onParametersChange({ k: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>1</span>
          <span>30</span>
        </div>
      </div>

      {/* S Parameter */}
      <div className="bg-black/50 p-3 lg:p-4 rounded-lg border border-white/10 text-center">
        <div className="text-xs lg:text-sm text-gray-400 mb-2">步长精度 (S)</div>
        <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-3">0.{parameters.s}</div>
        <input
          type="range"
          min="1"
          max="10"
          value={parameters.s}
          onChange={(e) => onParametersChange({ s: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0.1</span>
          <span>1.0</span>
        </div>
      </div>
      
      {/* W Parameter - 权重精度 */}
      <div className="bg-black/50 p-3 lg:p-4 rounded-lg border border-white/10 text-center">
        <div className="text-xs lg:text-sm text-gray-400 mb-2">权重精度 (W)</div>
        <div className="text-2xl lg:text-3xl font-bold text-green-400 mb-3">{parameters.w || 10}</div>
        <input
          type="range"
          min="5"
          max="20"
          value={parameters.w || 10}
          onChange={(e) => onParametersChange({ w: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>5</span>
          <span>20</span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4ade80;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4ade80;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
        }
      `}</style>
    </div>
  );
}