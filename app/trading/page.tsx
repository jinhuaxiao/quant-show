'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTradingSystem } from '@/hooks/use-trading-system';
import { useToast } from '@/hooks/use-toast';

// 组件导入
import { ProcessFlowIndicator } from './components/ProcessFlowIndicator';
import { SystemControls } from './components/SystemControls';
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
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(218_28%_12%)] text-foreground">
      <div className="max-w-[1920px] mx-auto p-4 lg:p-8">
        {/* Header */}
        <header className="flex items-center justify-between py-6 border-b border-border mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回主页</span>
            </Link>
            <div className="h-6 border-l border-border" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                MEDALLION ALGORITHM SYSTEM
              </h1>
              <p className="text-muted-foreground mt-1">
                量化交易完整流程可视化 - 从因子筛选到股票选择
              </p>
            </div>
          </div>
        </header>

        {/* Process Flow Indicator */}
        <ProcessFlowIndicator 
          currentStep={state.currentStep}
          isRunning={state.isRunning}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {/* Factor Pool */}
          <div className="lg:col-span-1">
            <FactorPool 
              factors={state.factors}
              currentStep={state.currentStep}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
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

        {/* System Controls and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* System Controls */}
          <div className="lg:col-span-1">
            <SystemControls 
              isRunning={state.isRunning}
              isPaused={state.isPaused}
              progress={state.progress}
              onStart={handleStartSystem}
              onPause={handlePauseSystem}
              onReset={handleResetSystem}
            />
          </div>

          {/* System Logs */}
          <div className="lg:col-span-2">
            <SystemLogs 
              logs={state.logs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}