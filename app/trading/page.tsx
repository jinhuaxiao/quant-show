'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTradingSystem } from '@/hooks/use-trading-system';
import { useToast } from '@/hooks/use-toast';

// 组件导入
import { ProcessFlowIndicator } from './components/ProcessFlowIndicator';
import { FloatingControls } from './components/FloatingControls';
import { FactorPool } from './components/FactorPool';
import { CorrelationMatrix } from './components/CorrelationMatrix';
import { OptimizationCanvas } from './components/OptimizationCanvas';
import { ConvergenceChart } from './components/ConvergenceChart';
import { StockSelection } from './components/StockSelection';
import { SystemLogs } from './components/SystemLogs';
import { PerformanceDashboard } from './components/PerformanceDashboard';

export default function TradingSystemPage() {
  const { state, actions } = useTradingSystem();
  const { toast } = useToast();

  const handleStartSystem = async () => {
    try {
      await actions.startSystem();
      toast({
        title: "系统启动成功",
        description: "量化交易流程已开始执行",
      });
    } catch {
      toast({
        title: "系统启动失败",
        description: "请检查系统状态后重试",
        variant: "destructive",
      });
    }
  };

  const handlePauseSystem = () => {
    actions.pauseSystem();
    toast({
      title: "系统已暂停",
      description: "可以随时恢复执行",
    });
  };

  const handleResetSystem = () => {
    actions.resetSystem();
    toast({
      title: "系统已重置",
      description: "所有数据已清空，可以重新开始",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#151932] text-gray-200">
      <div className="w-full px-4 lg:px-8">
        {/* Header */}
        <header className="py-6 border-b border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">返回主页</span>
              </Link>
              <div className="h-6 border-l border-gray-700" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  MEDALLION ALGORITHM SYSTEM
                </h1>
                <p className="text-gray-400 text-sm mt-1 hidden sm:block">
                  量化交易完整流程可视化 - 从因子筛选到股票选择
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Process Flow Indicator */}
        <ProcessFlowIndicator 
          currentStep={state.currentStep}
          isRunning={state.isRunning}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6">
          {/* Factor Pool */}
          <div className="lg:col-span-1">
            <FactorPool 
              factors={state.factors}
              onSelectFactor={actions.selectFactor}
              onRejectFactor={actions.rejectFactor}
            />
          </div>

          {/* Correlation Matrix */}
          <div className="lg:col-span-1">
            <CorrelationMatrix 
              factors={state.selectedFactors}
              correlationMatrix={state.correlationMatrix}
              currentStep={state.currentStep}
            />
          </div>

          {/* Optimization Canvas */}
          <div className="lg:col-span-1">
            <OptimizationCanvas 
              searchHistory={state.searchHistory}
              iteration={state.iteration}
              maxIterations={state.maxIterations}
              currentStep={state.currentStep}
            />
          </div>
        </div>

        {/* Second Row - Convergence and Stock Selection */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6">
          {/* Convergence Chart */}
          <div className="lg:col-span-1">
            <ConvergenceChart 
              convergenceHistory={state.convergenceHistory}
              currentStep={state.currentStep}
              iteration={state.iteration}
            />
          </div>

          {/* Stock Selection */}
          <div className="lg:col-span-2">
            <StockSelection 
              stocks={state.stocks}
              selectedStocks={state.selectedStocks}
              currentStep={state.currentStep}
              onSelectStock={actions.selectStock}
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <PerformanceDashboard 
          performance={state.performance}
          currentStep={state.currentStep}
        />

        {/* System Logs - Full Width */}
        <div className="mt-6">
          <SystemLogs 
            logs={state.logs}
          />
        </div>
        
        {/* Floating Controls Panel */}
        <FloatingControls 
          isRunning={state.isRunning}
          isPaused={state.isPaused}
          progress={state.progress}
          currentStep={state.currentStep}
          onStart={handleStartSystem}
          onPause={handlePauseSystem}
          onReset={handleResetSystem}
        />
      </div>
    </div>
  );
}