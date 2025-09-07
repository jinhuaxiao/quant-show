'use client';

import { useState, useCallback } from 'react';
import type { Factor, Stock, TradingSystemState, LogEntry, SearchPoint } from '@/app/types/trading';
import { generateId } from '@/lib/utils';

// 初始状态
const initialState: TradingSystemState = {
  currentStep: 0,
  isRunning: false,
  isPaused: false,
  progress: 0,
  factors: [],
  selectedFactors: [],
  stocks: [],
  selectedStocks: [],
  correlationMatrix: [],
  iteration: 0,
  maxIterations: 100,
  searchHistory: [],
  convergenceHistory: [],
  performance: {
    totalReturn: 0,
    annualizedReturn: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    volatility: 0,
  },
  logs: [],
};

// 生成因子数据 (使用固定种子避免 hydration 问题)
const generateFactors = (): Factor[] => {
  const categories = ['momentum', 'reversal', 'volatility', 'value', 'growth', 'quality', 'liquidity', 'sentiment'] as const;
  const timeframes = [5, 10, 20, 30, 60] as const;
  
  // 使用固定的伪随机数生成器避免 hydration 问题
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const factors: Factor[] = [];
  for (let i = 0; i < 50; i++) {
    factors.push({
      id: i,
      name: `${categories[i % 8]}_${timeframes[i % 5]}D`,
      category: categories[i % 8],
      timeframe: timeframes[i % 5],
      ic: (seededRandom(i * 2) - 0.5) * 0.2, // -0.1 到 0.1
      ir: 0.5 + seededRandom(i * 3) * 2, // 0.5 到 2.5
      weight: 0,
      status: 'pending',
      correlation: []
    });
  }
  return factors;
};

// 生成股票数据 (使用固定种子避免 hydration 问题)
const generateStocks = (): Stock[] => {
  const sectors = ['科技', '金融', '消费', '医药', '新能源', '制造', '地产', '传媒'];
  const tickers = [
    '贵州茅台', '宁德时代', '比亚迪', '隆基绿能', '药明康德', '招商银行', '中国平安', '美的集团',
    '海天味业', '迈瑞医疗', '恒瑞医药', '京东方A', '长江电力', '中国中免', '山东黄金', '紫光国微',
    '汇川技术', '三一重工', '格力电器', '万科A', '片仔癀', '爱尔眼科', '通威股份', '东方财富',
    '海尔智家', '伊利股份', '五粮液', '中国建筑', '牧原股份', '顺丰控股', '立讯精密', '长城汽车',
    '智飞生物', '阳光电源', '韦尔股份', '恩捷股份', '亿纬锂能', '璞泰来', '先导智能', '赣锋锂业',
    '华友钴业', '天齐锂业', '国轩高科', '欣旺达', '德方纳米', '容百科技', '当升科技', '中科电气',
    '天赐材料', '新宙邦'
  ];

  // 使用固定的伪随机数生成器避免 hydration 问题
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const stocks: Stock[] = [];
  for (let i = 0; i < 50; i++) {
    stocks.push({
      id: `stock-${i}`, // 使用固定ID避免随机生成
      ticker: tickers[i],
      name: tickers[i],
      sector: sectors[i % 8],
      score: 0,
      signal: 'hold',
      position: 0,
      pnl: 0,
      price: 10 + seededRandom(i * 5) * 200,
      volume: Math.floor(seededRandom(i * 7) * 1000000),
      selected: false
    });
  }
  return stocks;
};

export const useTradingSystem = () => {
  const [state, setState] = useState<TradingSystemState>({
    ...initialState,
    factors: generateFactors(),
    stocks: generateStocks(),
  });

  // 添加日志
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', important = false) => {
    const log: LogEntry = {
      id: generateId(),
      timestamp: Date.now(),
      message,
      type,
      important
    };
    
    setState(prev => ({
      ...prev,
      logs: [log, ...prev.logs].slice(0, 100) // 保留最新100条日志
    }));
  }, []);

  // 启动系统
  const startSystem = useCallback(async () => {
    setState(prev => ({ ...prev, isRunning: true, isPaused: false, currentStep: 1, progress: 0 }));
    addLog('===== 开始量化交易流程 =====', 'info', true);
  }, [addLog]);

  // 暂停系统
  const pauseSystem = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true, isRunning: false }));
    addLog('系统已暂停', 'warning');
  }, [addLog]);

  // 重置系统
  const resetSystem = useCallback(() => {
    setState({
      ...initialState,
      factors: generateFactors(),
      stocks: generateStocks(),
    });
    addLog('系统已重置', 'info');
  }, [addLog]);

  // 更新因子状态
  const updateFactorStatus = useCallback((factorId: number, status: Factor['status']) => {
    setState(prev => ({
      ...prev,
      factors: prev.factors.map(factor =>
        factor.id === factorId ? { ...factor, status } : factor
      )
    }));
  }, []);

  // 选择因子
  const selectFactor = useCallback((factor: Factor) => {
    setState(prev => {
      const newSelectedFactors = [...prev.selectedFactors, factor];
      return {
        ...prev,
        selectedFactors: newSelectedFactors,
        factors: prev.factors.map(f =>
          f.id === factor.id ? { ...f, status: 'selected' } : f
        )
      };
    });
    addLog(`✓ 选中因子: ${factor.name} (IC=${factor.ic.toFixed(3)}, IR=${factor.ir.toFixed(2)})`, 'success');
  }, [addLog]);

  // 拒绝因子
  const rejectFactor = useCallback((factor: Factor) => {
    setState(prev => ({
      ...prev,
      factors: prev.factors.map(f =>
        f.id === factor.id ? { ...f, status: 'rejected' } : f
      )
    }));
  }, []);

  // 添加搜索点
  const addSearchPoint = useCallback((point: Omit<SearchPoint, 'id' | 'timestamp'>) => {
    const searchPoint: SearchPoint = {
      ...point,
      id: generateId(),
      timestamp: Date.now()
    };
    
    setState(prev => ({
      ...prev,
      searchHistory: [...prev.searchHistory, searchPoint].slice(-100) // 保留最新100个点
    }));
  }, []);

  // 更新进度
  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress: Math.min(Math.max(progress, 0), 100) }));
  }, []);

  // 更新当前步骤
  const updateCurrentStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  // 更新迭代次数
  const updateIteration = useCallback((iteration: number) => {
    setState(prev => ({ ...prev, iteration }));
  }, []);

  // 选择股票
  const selectStock = useCallback((stock: Stock) => {
    setState(prev => {
      const newSelectedStocks = [...prev.selectedStocks, stock];
      return {
        ...prev,
        selectedStocks: newSelectedStocks,
        stocks: prev.stocks.map(s =>
          s.id === stock.id ? { ...s, selected: true } : s
        )
      };
    });
    addLog(`✓ 选中股票: ${stock.ticker} (得分=${stock.score.toFixed(2)})`, 'success');
  }, [addLog]);

  // 更新性能指标
  const updatePerformance = useCallback((metrics: Partial<typeof state.performance>) => {
    setState(prev => ({
      ...prev,
      performance: { ...prev.performance, ...metrics }
    }));
  }, []);

  return {
    state,
    actions: {
      startSystem,
      pauseSystem,
      resetSystem,
      updateFactorStatus,
      selectFactor,
      rejectFactor,
      addSearchPoint,
      updateProgress,
      updateCurrentStep,
      updateIteration,
      selectStock,
      updatePerformance,
      addLog
    }
  };
};