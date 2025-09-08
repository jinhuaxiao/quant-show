'use client';

import { useState, useCallback } from 'react';
import type { Factor, Stock, TradingSystemState, LogEntry, SearchPoint, ConvergencePoint } from '@/app/types/trading';
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
  for (let i = 0; i < Math.min(50, tickers.length); i++) {
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

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  // 启动系统  
  const startSystem = useCallback(async () => {
    setState(prev => ({ ...prev, isRunning: true, isPaused: false, currentStep: 1, progress: 0 }));
    addLog('===== 开始量化交易流程 =====', 'info', true);
    
    // 自动执行流程
    setTimeout(() => executeAutomatedFlow(), 100);
  }, [addLog]);

  // 自动化流程执行
  const executeAutomatedFlow = async () => {
    // Step 1: 因子筛选
    setState(prev => ({ ...prev, currentStep: 1, progress: 0 }));
    addLog('【步骤1】开始因子筛选...', 'info', true);
    
    // 模拟因子筛选过程
    const factors = state.factors;
    for (let i = 0; i < Math.min(20, factors.length); i++) {
      await delay(200);
      const factor = factors[i];
      const isGood = factor.ic > 0.02 || factor.ir > 1.5;
      
      if (isGood && state.selectedFactors.length < 10) {
        selectFactor(factor);
        setState(prev => ({ 
          ...prev, 
          progress: Math.min(((i + 1) / 20) * 100, 100)
        }));
      } else {
        rejectFactor(factor);
      }
    }
    
    await delay(500);
    addLog(`✓ 因子筛选完成，选中 ${state.selectedFactors.length} 个因子`, 'success');
    
    // Step 2: 相关性过滤
    setState(prev => ({ ...prev, currentStep: 2, progress: 0 }));
    addLog('【步骤2】开始相关性过滤...', 'info', true);
    
    // 生成相关性矩阵
    const correlationMatrix: number[][] = [];
    const selectedFactors = state.selectedFactors;
    for (let i = 0; i < selectedFactors.length; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < selectedFactors.length; j++) {
        await delay(50);
        const seed = (i * selectedFactors.length + j) * 1337;
        correlationMatrix[i][j] = i === j ? 1 : (seed % 1000) / 1000 - 0.5;
        setState(prev => ({ 
          ...prev, 
          correlationMatrix,
          progress: Math.min(((i * selectedFactors.length + j + 1) / (selectedFactors.length * selectedFactors.length)) * 100, 100)
        }));
      }
    }
    
    await delay(500);
    addLog('✓ 相关性过滤完成，低相关因子已保留', 'success');
    
    // Step 3: 权重优化
    setState(prev => ({ ...prev, currentStep: 3, progress: 0, iteration: 0 }));
    addLog('【步骤3】开始权重优化...', 'info', true);
    
    // 模拟优化过程
    const maxIterations = 50;
    for (let iter = 0; iter < maxIterations; iter++) {
      await delay(100);
      
      // 添加搜索点
      const x = (iter % 10) * 10;
      const y = Math.floor(iter / 10) * 20;
      const fitness = 0.5 + (iter / maxIterations) * 0.4 + (Math.sin(iter * 0.5) * 0.1);
      
      addSearchPoint({
        x,
        y,
        fitness,
        algorithm: 'genetic'
      });
      
      setState(prev => ({ 
        ...prev, 
        iteration: iter + 1,
        progress: Math.min(((iter + 1) / maxIterations) * 100, 100)
      }));
      
      if (iter % 10 === 0) {
        addLog(`优化进度: ${iter + 1}/${maxIterations} 迭代`, 'info');
      }
    }
    
    await delay(500);
    addLog('✓ 权重优化完成，找到最优权重组合', 'success');
    
    // Step 4: 收敛判断
    setState(prev => ({ ...prev, currentStep: 4, progress: 0 }));
    addLog('【步骤4】检查收敛性...', 'info', true);
    
    // 生成收敛曲线
    const convergenceHistory: ConvergencePoint[] = [];
    for (let i = 0; i < 30; i++) {
      await delay(50);
      const fitness = 0.3 + (1 - Math.exp(-i * 0.2)) * 0.6 + (Math.sin(i * 0.5) * 0.05);
      convergenceHistory.push({
        iteration: i + 1,
        fitness,
        timestamp: Date.now()
      });
      setState(prev => ({ 
        ...prev, 
        convergenceHistory,
        progress: Math.min(((i + 1) / 30) * 100, 100)
      }));
    }
    
    await delay(500);
    addLog('✓ 收敛判断完成，模型已收敛', 'success');
    
    // Step 5: 股票选择
    setState(prev => ({ ...prev, currentStep: 5, progress: 0 }));
    addLog('【步骤5】开始股票选择...', 'info', true);
    
    // 计算股票得分并选择
    const stocks = state.stocks.map((stock, index) => ({
      ...stock,
      score: 50 + (Math.sin(index * 0.7) * 40)
    }));
    
    // 排序并选择前20只
    const sortedStocks = [...stocks].sort((a, b) => b.score - a.score);
    for (let i = 0; i < Math.min(20, sortedStocks.length); i++) {
      await delay(150);
      const stock = sortedStocks[i];
      selectStock(stock);
      setState(prev => ({ 
        ...prev,
        progress: Math.min(((i + 1) / 20) * 100, 100)
      }));
    }
    
    await delay(500);
    addLog(`✓ 股票选择完成，选中 ${state.selectedStocks.length} 只股票`, 'success');
    
    // Step 6: 交易执行
    setState(prev => ({ ...prev, currentStep: 6, progress: 0 }));
    addLog('【步骤6】开始交易执行...', 'info', true);
    
    // 模拟交易执行
    for (let i = 0; i <= 10; i++) {
      await delay(200);
      setState(prev => ({ 
        ...prev,
        progress: Math.min((i / 10) * 100, 100)
      }));
      
      if (i % 3 === 0) {
        addLog(`执行交易订单 ${i + 1}/10...`, 'info');
      }
    }
    
    // 更新性能指标
    updatePerformance({
      totalReturn: 12.5,
      annualizedReturn: 25.3,
      sharpeRatio: 2.1,
      maxDrawdown: -5.2,
      winRate: 65.8,
      volatility: 12.1
    });
    
    await delay(500);
    addLog('✓ 交易执行完成，持仓已更新', 'success');
    addLog('===== 量化交易流程完成 =====', 'info', true);
    
    // 完成
    setState(prev => ({ 
      ...prev, 
      isRunning: false,
      currentStep: 7,
      progress: 100
    }));
  };

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