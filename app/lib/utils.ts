import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 样式合并工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 数字格式化工具
export const formatNumber = (num: number, options?: {
  precision?: number;
  suffix?: string;
  prefix?: string;
}): string => {
  const { precision = 2, suffix = '', prefix = '' } = options || {};
  
  if (num >= 1e15) {
    return `${prefix}${(num / 1e15).toFixed(precision)}×10¹⁵${suffix}`;
  }
  if (num >= 1e12) {
    return `${prefix}${(num / 1e12).toFixed(precision)}T${suffix}`;
  }
  if (num >= 1e9) {
    return `${prefix}${(num / 1e9).toFixed(precision)}B${suffix}`;
  }
  if (num >= 1e6) {
    return `${prefix}${(num / 1e6).toFixed(precision)}M${suffix}`;
  }
  if (num >= 1e3) {
    return `${prefix}${(num / 1e3).toFixed(precision)}K${suffix}`;
  }
  return `${prefix}${num.toFixed(precision)}${suffix}`;
};

// 百分比格式化
export const formatPercent = (num: number, precision = 1): string => {
  return `${(num * 100).toFixed(precision)}%`;
};

// 时间格式化
export const formatTime = (seconds: number): string => {
  if (seconds >= 31536000) return `${(seconds / 31536000).toFixed(0)}年`;
  if (seconds >= 86400) return `${(seconds / 86400).toFixed(0)}天`;
  if (seconds >= 3600) return `${(seconds / 3600).toFixed(0)}小时`;
  if (seconds >= 60) return `${(seconds / 60).toFixed(0)}分钟`;
  return `${seconds.toFixed(0)}秒`;
};

// 颜色工具函数
export const getFactorStatusColor = (status: string): string => {
  switch (status) {
    case 'screening':
      return 'bg-yellow-400/20 border-yellow-400 text-yellow-300';
    case 'selected':
      return 'bg-green-400/20 border-green-400 text-green-300';
    case 'rejected':
      return 'bg-red-400/20 border-red-400 text-red-300 opacity-50';
    case 'correlated':
      return 'bg-orange-400/20 border-orange-400 text-orange-300';
    default:
      return 'bg-gray-400/10 border-gray-600 text-gray-400';
  }
};

export const getSignalColor = (signal: 'buy' | 'sell' | 'hold'): string => {
  switch (signal) {
    case 'buy':
      return 'bg-green-400/20 border-green-400 text-green-300';
    case 'sell':
      return 'bg-red-400/20 border-red-400 text-red-300';
    case 'hold':
      return 'bg-yellow-400/20 border-yellow-400 text-yellow-300';
    default:
      return 'bg-gray-400/10 border-gray-600 text-gray-400';
  }
};

// 相关性颜色映射
export const getCorrelationColor = (correlation: number): string => {
  if (correlation > 0.7) {
    return `rgba(248, 113, 113, ${0.4 + correlation * 0.6})`;
  } else if (correlation > 0.5) {
    return `rgba(251, 191, 36, ${0.3 + correlation * 0.5})`;
  } else {
    return `rgba(74, 222, 128, ${0.2 + correlation * 0.4})`;
  }
};

// 延迟函数
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 生成唯一ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// 时间戳格式化
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('zh-CN');
};

// 数组随机排序
export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 数值约束
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// 线性插值
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

// 响应式断点检查
export const getBreakpoint = (width: number): 'mobile' | 'tablet' | 'desktop' | 'large' => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1536) return 'desktop';
  return 'large';
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 计算组合数 (使用对数避免溢出)
export const calculateCombination = (n: number, k: number): number => {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  
  let result = 0;
  for (let i = 0; i < k; i++) {
    result += Math.log(n - i) - Math.log(i + 1);
  }
  return Math.exp(result);
};