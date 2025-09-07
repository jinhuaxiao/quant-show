// 交易系统相关类型定义

export interface Factor {
  id: number;
  name: string;
  category: 'momentum' | 'reversal' | 'volatility' | 'value' | 'growth' | 'quality' | 'liquidity' | 'sentiment';
  timeframe: 5 | 10 | 20 | 30 | 60; // 时间周期（天）
  ic: number; // 信息系数 Information Coefficient
  ir: number; // 信息比率 Information Ratio
  weight: number; // 权重
  status: 'pending' | 'evaluating' | 'selected' | 'rejected';
  correlation?: number[]; // 与其他因子的相关性
}

export interface Stock {
  id: string;
  ticker: string; // 股票代码
  name: string; // 股票名称
  sector: string; // 行业板块
  score: number; // 综合评分
  signal: 'buy' | 'sell' | 'hold'; // 交易信号
  position: number; // 建议仓位
  pnl: number; // 盈亏
  price: number; // 当前价格
  volume: number; // 成交量
  selected: boolean;
}

export interface PerformanceMetrics {
  totalReturn: number; // 总收益率
  annualizedReturn: number; // 年化收益率
  sharpeRatio: number; // 夏普比率
  maxDrawdown: number; // 最大回撤
  winRate: number; // 胜率
  volatility: number; // 波动率
}

export interface TradingSystemState {
  // 系统状态
  currentStep: number; // 当前执行步骤 (1-6)
  isRunning: boolean; // 是否运行中
  isPaused: boolean; // 是否暂停
  progress: number; // 总体进度 (0-100)
  
  // 数据
  factors: Factor[];
  selectedFactors: Factor[];
  stocks: Stock[];
  selectedStocks: Stock[];
  correlationMatrix: number[][];
  
  // 优化相关
  iteration: number; // 当前迭代次数
  maxIterations: number; // 最大迭代次数
  searchHistory: SearchPoint[];
  convergenceHistory: ConvergencePoint[];
  
  // 性能指标
  performance: PerformanceMetrics;
  
  // 日志
  logs: LogEntry[];
}

export interface SearchPoint {
  id: string;
  x: number;
  y: number;
  fitness: number; // 适应度值/目标函数值
  timestamp: number;
}

export interface ConvergencePoint {
  iteration: number;
  fitness: number;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  important: boolean;
}

export interface ProcessStep {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
}