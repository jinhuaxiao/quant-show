'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, TrendingUp, Activity, Home, Wallet, BarChart3, Layers, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  onOpenDemo: () => void;
}

export function MobileMenu({ onOpenDemo }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: '首页', href: '/' },
    { icon: TrendingUp, label: '交易流程', href: '/trading' },
    { icon: BarChart3, label: '回测分析', href: '/backtest-analysis' },
    { icon: Layers, label: '因子分析', href: '/factor-analysis' },
    { icon: Clock, label: '时序分析', href: '/temporal-analysis' },
    { icon: Wallet, label: '资金管理', href: '/fund-management' },
    { icon: Activity, label: '算法演示', action: () => { onOpenDemo(); setIsOpen(false); } },
  ];

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-[#0f1629] border-b border-gray-800 shadow-xl"
          >
            <nav className="p-4 space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                
                if (item.href) {
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-200">{item.label}</span>
                    </Link>
                  );
                }
                
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}