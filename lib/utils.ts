import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

// 延迟函数
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 生成唯一ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
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