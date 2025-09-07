'use client';

interface CombinationCalculatorProps {
  parameters: {
    n: number;
    k: number;
    s: number;
  };
  onParametersChange: (params: Partial<{ n: number; k: number; s: number }>) => void;
}

export function CombinationCalculator({ parameters, onParametersChange }: CombinationCalculatorProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
      {/* N Parameter */}
      <div className="bg-black/50 p-4 lg:p-6 rounded-lg border border-white/10 text-center">
        <div className="text-sm text-gray-400 mb-3">因子池大小 (N)</div>
        <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-4">{parameters.n}</div>
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
      <div className="bg-black/50 p-4 lg:p-6 rounded-lg border border-white/10 text-center">
        <div className="text-sm text-gray-400 mb-3">选择因子数 (K)</div>
        <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-4">{parameters.k}</div>
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
      <div className="bg-black/50 p-4 lg:p-6 rounded-lg border border-white/10 text-center">
        <div className="text-sm text-gray-400 mb-3">步长选项 (S)</div>
        <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-4">{parameters.s}</div>
        <input
          type="range"
          min="1"
          max="10"
          value={parameters.s}
          onChange={(e) => onParametersChange({ s: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>1</span>
          <span>10</span>
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