'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Gauge, Wallet, RefreshCcw, LineChart as LineChartIcon, TrendingUp, Brain, Info, ClipboardList, Download, Play, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, ReferenceDot } from "recharts";
import { useToast } from "@/hooks/use-toast";

function invert2x2(m: number[][]) {
  const [[a, b], [c, d]] = m;
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-8) return [[0, 0], [0, 0]];
  return [
    [d / det, -b / det],
    [-c / det, a / det],
  ];
}

function multiplyMatrixVector(m: number[][], v: number[]): number[] {
  return m.map((row) => row.reduce((acc, x, i) => acc + x * v[i], 0));
}

function normalize(v: number[]): number[] {
  const s = v.reduce((a, b) => a + Math.max(b, 0), 0);
  if (s <= 0) return v.map(() => 0.5 / v.length);
  return v.map((x) => Math.max(x, 0) / s);
}

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function pct(x: number, digits = 0) {
  return `${(x * 100).toFixed(digits)}%`;
}

function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const card = "rounded-2xl bg-white/10 backdrop-blur border border-slate-700/50 shadow-lg p-5";
const kpiNum = "text-2xl font-semibold tabular-nums text-gray-200";

export default function FundManagementPage() {
  const { toast } = useToast();

  // 全局参数
  const [totalCapital, setTotalCapital] = useState(30_000_000);
  const [cashBufferPct, setCashBufferPct] = useState(0.25);
  const [volTarget, setVolTarget] = useState(0.10);
  const [kellyAlpha, setKellyAlpha] = useState(0.3);
  const [futMarginRate, setFutMarginRate] = useState(0.10);
  const [crossCorr, setCrossCorr] = useState(0.2);

  // 调仓规则参数
  const [minAdjustUnit, setMinAdjustUnit] = useState(100_000);
  const [maxDailyGapPct, setMaxDailyGapPct] = useState(0.20);
  const [maxDailyDeployPct, setMaxDailyDeployPct] = useState(0.05);

  // 历史回放天数
  const [historyDays, setHistoryDays] = useState(30);

  // 策略示例
  const [strategies, setStrategies] = useState([
    {
      code: "S1-Stock-A",
      type: "stock" as const,
      sigma: 0.10,
      sigmaReal: 0.10,
      sharpe: 0.8,
      drawdown: 0.04,
      paused: false,
      currentNotional: 1_000_000,
      impactBps: 10,
    },
    {
      code: "S2-Futures-B",
      type: "futures" as const,
      sigma: 0.15,
      sigmaReal: 0.15,
      sharpe: 1.1,
      drawdown: 0.06,
      paused: false,
      currentNotional: 5_000_000,
      impactBps: 12,
    },
  ]);

  // 相关性矩阵
  const corr = [
    [1, crossCorr],
    [crossCorr, 1],
  ];

  // 派生计算
  const calc = useMemo(() => {
    const deployable = totalCapital * (1 - cashBufferPct);

    const sig = strategies.map((s) => s.sigmaReal);
    const cov: number[][] = sig.map((si, i) => sig.map((sj, j) => si * sj * corr[i][j]));

    // μ（简化）
    const mu = strategies.map((s) => s.sharpe * s.sigmaReal);

    // 基线：风险平价（1/σ）
    const invVol = sig.map((s) => (s > 1e-6 ? 1 / s : 0));
    const baseW = normalize(invVol);

    // Kelly：w* ∝ inv(Σ)·μ
    const invCov = invert2x2(cov);
    const kellyRaw = multiplyMatrixVector(invCov, mu);
    const kellyW = normalize(kellyRaw);

    // α-Kelly 混合 -> Vol Targeting -> 暂停掩码
    const blended = normalize(baseW.map((b, i) => (1 - kellyAlpha) * b + kellyAlpha * kellyW[i]));
    const scaled = normalize(
      blended.map((w, i) => w * Math.min(1, volTarget / Math.max(sig[i], 1e-6)))
    );
    const pausedMask = strategies.map((s) => (s.paused ? 0 : 1));
    const weights = normalize(scaled.map((w, i) => w * pausedMask[i]));

    // 名义与保证金
    const notionals = weights.map((w) => w * deployable);
    const futIdx = strategies.findIndex((s) => s.type === "futures");
    const futNotional = futIdx >= 0 ? notionals[futIdx] : 0;
    const marginNeed = futNotional * futMarginRate;
    const cashBuffer = totalCapital * cashBufferPct;
    const marginBufferMultiple = marginNeed > 0 ? cashBuffer / (3 * marginNeed) : Infinity;

    // 风险贡献 & 组合波动
    const covW = multiplyMatrixVector(cov, weights);
    const rcRaw = weights.map((w, i) => w * covW[i]);
    const rcSum = rcRaw.reduce((a, b) => a + b, 0) || 1;
    const rcShare = rcRaw.map((x) => x / rcSum);
    const portVar = weights.reduce((acc, wi, i) => acc + wi * covW[i], 0);
    const portVol = Math.sqrt(Math.max(portVar, 0));

    // 平均相关性
    const avgCorr = strategies.map((_, i) => {
      const row = corr[i];
      const others = row.filter((_, j) => j !== i);
      return others.reduce((a, b) => a + b, 0) / Math.max(others.length, 1);
    });

    return {
      deployable,
      baseW,
      kellyW,
      weights,
      notionals,
      rcShare,
      cashBuffer,
      marginNeed,
      marginBufferMultiple,
      portVol,
      avgCorr,
    };
  }, [strategies, corr, totalCapital, cashBufferPct, volTarget, kellyAlpha, futMarginRate]);

  // 决策引擎
  type Decision = {
    action: "加资金" | "减资金" | "持有";
    color: string;
    addReasons: string[];
    reduceReasons: string[];
    holdReasons: string[];
    recommendedStep: number;
  };

  function decideFor(i: number): Decision {
    const s = strategies[i];
    const target = calc.notionals[i] || 0;
    const current = s.currentNotional || 0;
    const gap = target - current;
    const avgCorr = calc.avgCorr[i] ?? 0;
    const marginOk = calc.marginBufferMultiple >= 1;

    const addReasons: string[] = [];
    if (s.sharpe > 1.0) addReasons.push("60d Sharpe > 1.0");
    if (s.sigmaReal < volTarget * 0.9) addReasons.push("实际波动 < 0.9×目标");
    if (avgCorr < 0.4) addReasons.push("与组合相关性低（分散化）");
    if ((s.impactBps ?? 0) <= 25) addReasons.push("冲击成本 ≤ 25bps");

    const reduceReasons: string[] = [];
    if (s.sharpe < 0) reduceReasons.push("60d Sharpe < 0");
    if (s.sigmaReal > volTarget * 1.5) reduceReasons.push("实际波动 > 1.5×目标");
    if (s.drawdown >= 0.10) reduceReasons.push("回撤 ≥ 10%");
    if (avgCorr > 0.8) reduceReasons.push("相关性聚集");
    if (s.type === "futures" && !marginOk) reduceReasons.push("保证金缓冲不足");

    const holdReasons: string[] = [];

    const yellowFreeze = s.drawdown >= 0.05 && s.drawdown < 0.10;
    if (yellowFreeze) holdReasons.push("黄灯：回撤 5%–10% 冻结加仓");
    if (s.paused) holdReasons.push("策略已暂停");

    const dailyCapFromGap = Math.abs(gap) * maxDailyGapPct;
    const dailyCapFromDeploy = calc.deployable * maxDailyDeployPct;
    const adjCap = Math.min(dailyCapFromGap, dailyCapFromDeploy);
    if (adjCap < minAdjustUnit) holdReasons.push(`步长控制：小于最小调整单元 ￥${fmtMoney(minAdjustUnit)}`);

    let action: Decision["action"]; let color = "";
    if (reduceReasons.length > 0) { action = "减资金"; color = "bg-red-500"; }
    else if (addReasons.length >= 2 && !s.paused && !yellowFreeze && (s.impactBps ?? 0) <= 25 && marginOk) { action = "加资金"; color = "bg-emerald-500"; }
    else { action = "持有"; color = "bg-slate-400"; }

    let step = 0;
    if (action === "加资金") {
      step = Math.min(Math.max(gap, 0), adjCap);
      if (!marginOk) { holdReasons.push("保证金缓冲不足（<3×）"); step = 0; action = "持有"; color = "bg-slate-400"; }
      if (step < minAdjustUnit) { holdReasons.push("加仓幅度低于最小调整单元"); step = 0; action = "持有"; color = "bg-slate-400"; }
    } else if (action === "减资金") {
      const reduceBase = Math.max(Math.max(-gap, 0), current * 0.10);
      const cap = Math.max(adjCap, current * 0.20);
      step = -Math.min(reduceBase, cap);
      if (Math.abs(step) < minAdjustUnit) { holdReasons.push("触发减仓但低于最小调整单元"); step = 0; action = "持有"; color = "bg-slate-400"; }
    } else {
      if (addReasons.length < 2) holdReasons.push(`加仓条件不足（仅满足 ${addReasons.length} 条）`);
      if (reduceReasons.length === 0) holdReasons.push("未命中减仓条件");
    }

    return { action, color, addReasons, reduceReasons, holdReasons, recommendedStep: step };
  }

  const decisions = strategies.map((_, i) => decideFor(i));
  const marginOk = calc.marginBufferMultiple >= 1;

  // 汇总
  const totalAdd = decisions.filter(d => d.recommendedStep > 0).reduce((a, b) => a + b.recommendedStep, 0);
  const totalReduce = decisions.filter(d => d.recommendedStep < 0).reduce((a, b) => a + b.recommendedStep, 0);

  // 历史回放数据
  function seedRand(seed: number) { return Math.abs(Math.sin(seed * 12.9898 + 78.233)) % 1; }
  const historySeries = useMemo(() => {
    const arr: any[] = [];
    let baseVol = calc.portVol;
    for (let d = historyDays - 1; d >= 0; d--) {
      const t = d + 1;
      const noise = (seedRand(t) - 0.5) * 0.03;
      const seasonal = 0.02 * Math.sin(t / 4);
      const realized = Math.max(0.01, baseVol * (1 + noise + seasonal));
      const rawSignal = (volTarget - realized) * 10 + (seedRand(t + 100) - 0.5);
      const decision = rawSignal > 0.3 ? 1 : rawSignal < -0.3 ? -1 : 0;
      arr.push({ day: historyDays - d, target: volTarget * 100, realized: realized * 100, decision });
    }
    return arr;
  }, [historyDays, calc.portVol, volTarget]);

  // 导出功能
  function buildTodayRows() {
    return strategies.map((s, i) => {
      const d = decisions[i];
      const gap = (calc.notionals[i] || 0) - (s.currentNotional || 0);
      const coreReasons = d.action === "加资金" ? d.addReasons.slice(0,2) : d.action === "减资金" ? d.reduceReasons.slice(0,2) : d.holdReasons.slice(0,2);
      return {
        date: new Date().toISOString().slice(0,10),
        strategy: s.code,
        action: d.action,
        amount: Math.round(d.recommendedStep),
        reasons: coreReasons.join("; "),
        targetNotional: Math.round(calc.notionals[i] || 0),
        currentNotional: Math.round(s.currentNotional || 0),
        gap: Math.round(gap),
        impactBps: s.impactBps,
      };
    });
  }

  function toCSV(rows: any[]) {
    const headers = ["date","strategy","action","amount","reasons","targetNotional","currentNotional","gap","impactBps"];
    const lines = [headers.join(",")].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(",")));
    return lines.join("\n");
  }

  function exportCSV() { 
    const csv = toCSV(buildTodayRows()); 
    downloadTextFile(`today_decisions_${Date.now()}.csv`, csv); 
    toast({
      title: "导出成功",
      description: "决策数据已导出为CSV文件",
    });
  }

  function exportJSON() { 
    const json = JSON.stringify(buildTodayRows(), null, 2); 
    downloadTextFile(`today_decisions_${Date.now()}.json`, json); 
    toast({
      title: "导出成功", 
      description: "决策数据已导出为JSON文件",
    });
  }

  // 一键按建议步长调整
  type Order = { strategy: string; side: "BUY" | "SELL"; amount: number; newNotional: number };
  const [orderPreview, setOrderPreview] = useState<Order[] | null>(null);

  function applySuggestedOnce() {
    const orders: Order[] = [];
    setStrategies(prev => prev.map((s, i) => {
      const step = Math.round(decisions[i].recommendedStep);
      if (step === 0) return s;
      const side = step > 0 ? "BUY" : "SELL";
      const newNotional = Math.max(0, (s.currentNotional || 0) + step);
      orders.push({ strategy: s.code, side, amount: Math.abs(step), newNotional });
      return { ...s, currentNotional: newNotional };
    }));
    setOrderPreview(orders);
    toast({
      title: "调整完成",
      description: `已按建议调整策略配置，生成 ${orders.length} 个执行单`,
    });
  }

  // 可视化数据
  const weightData = strategies.map((s, i) => ({ 
    name: s.code, 
    权重: Number((calc.weights[i] * 100).toFixed(2)), 
    资金等价: Math.round(calc.notionals[i]) 
  }));

  function lightOf(s: any) {
    if (s.drawdown > 0.2) return { label: "红", color: "bg-red-500" };
    if (s.drawdown > 0.1) return { label: "橙", color: "bg-orange-500" };
    if (s.drawdown > 0.05) return { label: "黄", color: "bg-yellow-400" };
    if (s.sigmaReal > volTarget * 1.5) return { label: "黄", color: "bg-yellow-400" };
    return { label: "绿", color: "bg-emerald-500" };
  }

  const handleRiskReduction = () => {
    setVolTarget((v) => Math.max(0.02, v * 0.7));
    toast({
      title: "风险降低",
      description: "目标波动已降低30%",
    });
  };

  const handleReset = () => {
    setTotalCapital(30_000_000);
    setCashBufferPct(0.25);
    setVolTarget(0.10);
    setKellyAlpha(0.3);
    setFutMarginRate(0.10);
    setCrossCorr(0.2);
    setMinAdjustUnit(100_000);
    setMaxDailyGapPct(0.20);
    setMaxDailyDeployPct(0.05);
    setHistoryDays(30);
    setStrategies((prev) => prev.map((s, idx) => ({
      ...s,
      paused: false,
      sigmaReal: s.sigma,
      drawdown: idx === 0 ? 0.04 : 0.06,
      sharpe: idx === 0 ? 0.8 : 1.1,
      impactBps: idx === 0 ? 10 : 12,
      currentNotional: idx === 0 ? 1_000_000 : 5_000_000,
    })));
    setOrderPreview(null);
    toast({
      title: "重置完成",
      description: "所有参数已重置为默认值",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#151932] text-gray-200">
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* 顶部标题 */}
        <header className="py-6 border-b border-gray-700 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回主页</span>
              </Link>
              <div className="h-6 border-l border-gray-700" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  资金管理系统
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  3000万资金统一管理 · 风险预算 · 目标波动 · α-Kelly · 决策引擎
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                onClick={handleRiskReduction}
                title="一键降风险：目标波动 -30%"
              >
                <Shield size={18} /> 一键降风险
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-white/10 border border-slate-700 hover:bg-white/20 flex items-center gap-2 transition-colors"
                onClick={handleReset}
              >
                <RefreshCcw size={18} /> 重置
              </button>
            </div>
          </div>
        </header>

        {/* KPI 区 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className={card}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">总资金</span><Wallet size={18} className="text-blue-400" /></div>
            <div className={kpiNum}>￥{fmtMoney(totalCapital)}</div>
          </div>
          <div className={card}>
            <div className="text-sm text-slate-400">可分配资金</div>
            <div className={kpiNum}>￥{fmtMoney(calc.deployable)}</div>
            <div className="text-xs text-slate-400">现金缓冲：{pct(cashBufferPct)}</div>
          </div>
          <div className={card}>
            <div className="text-sm text-slate-400">期货保证金需求</div>
            <div className={kpiNum}>￥{fmtMoney(calc.marginNeed)}</div>
            <div className={`mt-1 inline-flex items-center gap-2 text-xs ${marginOk ? "text-emerald-400" : "text-red-400"}`}>
              <Gauge size={16} /> 缓冲≥3×？ {marginOk ? "是" : "否"}（倍数 {calc.marginBufferMultiple === Infinity ? "∞" : calc.marginBufferMultiple.toFixed(2)}）
            </div>
          </div>
          <div className={card}>
            <div className="text-sm text-slate-400">目标年化波动</div>
            <div className={kpiNum}>{pct(volTarget, 1)}</div>
            <div className="text-xs text-slate-400">实际：{pct(calc.portVol, 1)}</div>
          </div>
          <div className={card}>
            <div className="flex items-center gap-2 text-sm text-slate-400"><Brain size={16} className="text-purple-400"/> 决策引擎</div>
            <div className="text-xs text-slate-400">今日加总：<span className="text-emerald-400">+￥{fmtMoney(totalAdd)}</span>，减总：<span className="text-red-400">￥{fmtMoney(Math.abs(totalReduce))}</span></div>
          </div>
        </div>

        {/* 图表区：权重 & 风险贡献 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={card + " lg:col-span-2"}>
            <div className="flex items-center justify-between mb-2"><div className="font-semibold flex items-center gap-2 text-gray-200"><TrendingUp size={18} className="text-blue-400"/> 权重 / 资金等价</div><span className="text-xs text-slate-400">单位：% / RMB</span></div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weightData}>
                  <CartesianGrid vertical={false} stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12, fill: '#9CA3AF' }} domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip 
                    formatter={(v: any, name: any) => (name === "权重" ? `${v}%` : `￥${fmtMoney(Number(v))}`)}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Bar yAxisId="left" dataKey="权重" radius={[6, 6, 0, 0]} fill="#3B82F6" />
                  <Bar yAxisId="right" dataKey="资金等价" radius={[6, 6, 0, 0]} fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={card}>
            <div className="font-semibold mb-2 flex items-center gap-2 text-gray-200"><LineChartIcon size={18} className="text-green-400"/> 风险贡献占比</div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strategies.map((s, i) => ({ name: s.code, 风险贡献: Number((calc.rcShare[i] * 100).toFixed(2)) }))}>
                  <CartesianGrid vertical={false} stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} domain={[0, 100]} />
                  <Tooltip 
                    formatter={(v: any) => `${v}%`}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Bar dataKey="风险贡献" radius={[6, 6, 0, 0]} fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 历史回放：目标 vs 实际波动 + 决策轨迹 */}
        <div className={card}>
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-gray-200">历史回放：目标 vs 实际波动 & 决策轨迹</div>
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <span>天数：{historyDays}</span>
              <input 
                type="range" 
                min={10} 
                max={120} 
                step={1} 
                value={historyDays} 
                onChange={(e) => setHistoryDays(Number(e.target.value))} 
                className="accent-blue-500"
              />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historySeries}>
                <CartesianGrid stroke="#374151" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  formatter={(v: any, name: any, props: any) => name === "target" || name === "realized" ? `${Number(v).toFixed(1)}%` : v}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Line type="monotone" dataKey="target" strokeWidth={2} dot={false} name="目标波动" stroke="#F59E0B" />
                <Line
                  type="monotone"
                  dataKey="realized"
                  strokeWidth={2}
                  name="实际波动"
                  stroke="#3B82F6"
                  dot={(p: any) => {
                    const { cx, cy, payload } = p;
                    const color = payload.decision > 0 ? "#10b981" : payload.decision < 0 ? "#ef4444" : "#94a3b8";
                    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={1} />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-400 mt-2">轨迹点含义：<span className="text-emerald-400">绿=净加仓</span>，<span className="text-red-400">红=净减仓</span>，<span className="text-slate-400">灰=持有</span>（演示用合成数据）。</div>
        </div>

        {/* 策略卡片 + 决策 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map((s, i) => {
            const d = decisions[i];
            const light = lightOf(s);
            return (
              <div key={s.code} className={card}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${light.color}`} />
                    <div>
                      <div className="font-semibold text-gray-200">{s.code} <span className="text-xs text-slate-400">({s.type === "stock" ? "股票" : "期货"})</span></div>
                      <div className="text-xs text-slate-400">回撤：{pct(s.drawdown, 1)} · 实际波动：{pct(s.sigmaReal, 1)} · Sharpe：{s.sharpe.toFixed(2)}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs text-white ${d.color}`}>{d.action}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-slate-400">目标权重</div>
                    <div className="text-lg font-semibold text-gray-200">{(calc.weights[i] * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-slate-400">目标资金等价</div>
                    <div className="text-lg font-semibold text-gray-200">￥{fmtMoney(calc.notionals[i])}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-slate-400">当前名义</div>
                    <div className="text-lg font-semibold text-gray-200">￥{fmtMoney(s.currentNotional)}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-slate-400">风险贡献</div>
                    <div className="text-lg font-semibold text-gray-200">{(calc.rcShare[i] * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-slate-400">建议当日调整</div>
                    <div className="text-lg font-semibold text-gray-200">{d.recommendedStep === 0 ? "—" : `${d.recommendedStep > 0 ? "+" : ""}￥${fmtMoney(Math.abs(d.recommendedStep))}`}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-slate-400">冲击成本估计</div>
                    <div className="text-lg font-semibold text-gray-200">{s.impactBps} bps</div>
                  </div>
                </div>

                {/* 决策理由 */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                    <div className="text-xs font-medium text-emerald-400 mb-1">加资金理由（≥2 条有效）</div>
                    <ul className="text-xs text-emerald-300 list-disc ml-4 space-y-1 min-h-[3rem]">
                      {d.addReasons.length ? d.addReasons.map((r, idx) => <li key={idx}>{r}</li>) : <li className="opacity-60">暂无触发</li>}
                    </ul>
                  </div>
                  <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                    <div className="text-xs font-medium text-red-400 mb-1">减资金理由（任一生效）</div>
                    <ul className="text-xs text-red-300 list-disc ml-4 space-y-1 min-h-[3rem]">
                      {d.reduceReasons.length ? d.reduceReasons.map((r, idx) => <li key={idx}>{r}</li>) : <li className="opacity-60">暂无触发</li>}
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-slate-600">
                    <div className="text-xs font-medium text-slate-300 mb-1">持有（不变）理由</div>
                    <ul className="text-xs text-slate-300 list-disc ml-4 space-y-1 min-h-[3rem]">
                      {d.holdReasons?.length ? d.holdReasons.map((r, idx) => <li key={idx}>{r}</li>) : <li className="opacity-60">若出现"持有"，会在此解释原因</li>}
                    </ul>
                  </div>
                </div>

                {/* 策略级参数可调 */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">模拟实际波动（σ_real）</label>
                    <input 
                      type="range" 
                      min={0.05} 
                      max={0.30} 
                      step={0.005} 
                      value={s.sigmaReal} 
                      onChange={(e) => setStrategies((prev) => prev.map((x, k) => (k === i ? { ...x, sigmaReal: Number(e.target.value) } : x)))} 
                      className="w-full accent-blue-500" 
                    />
                    <div className="text-xs text-gray-300">{pct(s.sigmaReal, 1)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">模拟回撤</label>
                    <input 
                      type="range" 
                      min={0} 
                      max={0.30} 
                      step={0.005} 
                      value={s.drawdown} 
                      onChange={(e) => setStrategies((prev) => prev.map((x, k) => (k === i ? { ...x, drawdown: Number(e.target.value) } : x)))} 
                      className="w-full accent-blue-500" 
                    />
                    <div className="text-xs text-gray-300">{pct(s.drawdown, 1)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">预估冲击成本（bps）</label>
                    <input 
                      type="range" 
                      min={0} 
                      max={60} 
                      step={1} 
                      value={s.impactBps} 
                      onChange={(e) => setStrategies((prev) => prev.map((x, k) => (k === i ? { ...x, impactBps: Number(e.target.value) } : x)))} 
                      className="w-full accent-blue-500" 
                    />
                    <div className="text-xs text-gray-300">{s.impactBps} bps</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">当前名义（用于缺口/gap）</label>
                    <input 
                      type="range" 
                      min={0} 
                      max={20_000_000} 
                      step={100_000} 
                      value={s.currentNotional} 
                      onChange={(e) => setStrategies((prev) => prev.map((x, k) => (k === i ? { ...x, currentNotional: Number(e.target.value) } : x)))} 
                      className="w-full accent-blue-500" 
                    />
                    <div className="text-xs text-gray-300">￥{fmtMoney(s.currentNotional)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 参数控制区（风控/执行） */}
        <div className={card}>
          <div className="font-semibold mb-4 text-gray-200">参数与风控设置</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-slate-400 mb-1">目标年化波动</div>
              <input 
                type="range" 
                min={0.05} 
                max={0.20} 
                step={0.005} 
                value={volTarget} 
                onChange={(e) => setVolTarget(Number(e.target.value))} 
                className="w-full accent-blue-500" 
              />
              <div className="text-sm text-gray-300">{pct(volTarget, 1)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">α-Kelly（业绩偏置强度）</div>
              <input 
                type="range" 
                min={0} 
                max={0.5} 
                step={0.01} 
                value={kellyAlpha} 
                onChange={(e) => setKellyAlpha(Number(e.target.value))} 
                className="w-full accent-blue-500" 
              />
              <div className="text-sm text-gray-300">{(kellyAlpha * 100).toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">现金缓冲占比</div>
              <input 
                type="range" 
                min={0.1} 
                max={0.5} 
                step={0.01} 
                value={cashBufferPct} 
                onChange={(e) => setCashBufferPct(Number(e.target.value))} 
                className="w-full accent-blue-500" 
              />
              <div className="text-sm text-gray-300">{pct(cashBufferPct)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">期货保证金率</div>
              <input 
                type="range" 
                min={0.05} 
                max={0.2} 
                step={0.005} 
                value={futMarginRate} 
                onChange={(e) => setFutMarginRate(Number(e.target.value))} 
                className="w-full accent-blue-500" 
              />
              <div className="text-sm text-gray-300">{pct(futMarginRate, 1)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">最小调整单元</div>
              <input 
                type="range" 
                min={10_000} 
                max={1_000_000} 
                step={10_000} 
                value={minAdjustUnit} 
                onChange={(e) => setMinAdjustUnit(Number(e.target.value))} 
                className="w-full accent-blue-500" 
              />
              <div className="text-sm text-gray-300">￥{fmtMoney(minAdjustUnit)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">日内最大缺口比例</div>
              <input 
                type="range" 
                min={0.05} 
                max={0.5} 
                step={0.01} 
                value={maxDailyGapPct} 
                onChange={(e) => setMaxDailyGapPct(Number(e.target.value))} 
                className="w-full accent-blue-500" 
              />
              <div className="text-sm text-gray-300">{pct(maxDailyGapPct)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">日内最大可分配比例</div>
              <input 
                type="range" 
                min={0.01} 
                max={0.2} 
                step={0.005} 
                value={maxDailyDeployPct} 
                onChange={(e) => setMaxDailyDeployPct(Number(e.target.value))} 
                className="w-full accent-blue-500" 
              />
              <div className="text-sm text-gray-300">{pct(maxDailyDeployPct)}</div>
            </div>
          </div>
          {!marginOk && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle size={16} /> 保证金缓冲不足（需≥3×初始保证金）。请提高现金缓冲或降低期货名义敞口。
            </div>
          )}
        </div>

        {/* 今日决策汇总 + 导出 + 一键调整 */}
        <div className={card}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-semibold text-gray-200"><ClipboardList size={18} className="text-yellow-400"/> 今日决策汇总</div>
            <div className="flex items-center gap-2">
              <button 
                className="px-3 py-1.5 rounded-lg border border-slate-600 text-sm bg-white/10 hover:bg-white/20 flex items-center gap-1 transition-colors" 
                onClick={exportCSV}
              >
                <Download size={16}/> 导出 CSV
              </button>
              <button 
                className="px-3 py-1.5 rounded-lg border border-slate-600 text-sm bg-white/10 hover:bg-white/20 flex items-center gap-1 transition-colors" 
                onClick={exportJSON}
              >
                <Download size={16}/> 导出 JSON
              </button>
              <button 
                className="px-3 py-1.5 rounded-lg border border-slate-600 text-sm bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1 transition-colors" 
                onClick={applySuggestedOnce}
              >
                <Play size={16}/> 一键按建议步长调整
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="py-2 pr-4">策略</th>
                  <th className="py-2 pr-4">操作</th>
                  <th className="py-2 pr-4">金额</th>
                  <th className="py-2 pr-4">核心理由</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map((s, i) => {
                  const d = decisions[i];
                  const reasons = d.action === "加资金" ? d.addReasons.slice(0, 2) : d.action === "减资金" ? d.reduceReasons.slice(0, 2) : d.holdReasons.slice(0, 2);
                  return (
                    <tr key={s.code} className="border-t border-slate-700">
                      <td className="py-2 pr-4 text-gray-300">{s.code}</td>
                      <td className="py-2 pr-4 text-gray-300">{d.action}</td>
                      <td className="py-2 pr-4 text-gray-300">{d.recommendedStep === 0 ? "—" : `${d.recommendedStep > 0 ? "+" : ""}￥${fmtMoney(Math.abs(d.recommendedStep))}`}</td>
                      <td className="py-2 pr-4 text-slate-400">{reasons.length ? reasons.join("；") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-slate-400 mt-2">说明：金额受"最小调整单元 / 日内最大缺口比例 / 日内最大可分配比例 / 保证金缓冲"等多约束同时限制。</div>
        </div>

        {/* 执行单预览 */}
        {orderPreview && (
          <div className={card}>
            <div className="font-semibold mb-2 text-gray-200">执行单预览（模拟）</div>
            {orderPreview.length === 0 ? (
              <div className="text-sm text-slate-400">无可执行项：建议金额为 0。</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="py-2 pr-4">策略</th>
                      <th className="py-2 pr-4">方向</th>
                      <th className="py-2 pr-4">金额</th>
                      <th className="py-2 pr-4">调整后名义</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderPreview.map((o, idx) => (
                      <tr key={idx} className="border-t border-slate-700">
                        <td className="py-2 pr-4 text-gray-300">{o.strategy}</td>
                        <td className={`py-2 pr-4 ${o.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{o.side}</td>
                        <td className="py-2 pr-4 text-gray-300">￥{fmtMoney(o.amount)}</td>
                        <td className="py-2 pr-4 text-gray-300">￥{fmtMoney(o.newNotional)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="text-xs text-slate-400 mt-2">提示：这里只是交互模拟。生产环境应由后端生成指令，并接管风控/撮合/确认流。</div>
          </div>
        )}

        {/* 解释卡：决策规则 */}
        <div className={card}>
          <div className="flex items-center gap-2 font-semibold mb-2 text-gray-200"><Info size={18} className="text-cyan-400"/> 决策规则解释（可在后端固化为参数）</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <div className="font-medium mb-1 text-emerald-400">加资金（需满足≥2条）</div>
              <ul className="list-disc ml-5 space-y-1 text-slate-400">
                <li>60d 滚动 Sharpe <span className="font-medium text-gray-300">&gt; 1.0</span></li>
                <li>实际年化波动 <span className="font-medium text-gray-300">&lt; 0.9×</span> 策略目标</li>
                <li>与组合平均相关性 <span className="font-medium text-gray-300">&lt; 0.4</span>（分散化）</li>
                <li>预估冲击成本 <span className="font-medium text-gray-300">≤ 25 bps</span></li>
                <li>（黄灯冻结：回撤 5%–10% 时不加仓）</li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-1 text-red-400">减资金（任一命中）</div>
              <ul className="list-disc ml-5 space-y-1 text-slate-400">
                <li>60d 滚动 Sharpe <span className="font-medium text-gray-300">&lt; 0</span></li>
                <li>实际年化波动 <span className="font-medium text-gray-300">&gt; 1.5×</span> 策略目标</li>
                <li>回撤 <span className="font-medium text-gray-300">≥ 10%</span></li>
                <li>与组合平均相关性 <span className="font-medium text-gray-300">&gt; 0.8</span></li>
                <li>（期货）保证金缓冲 <span className="font-medium text-gray-300">&lt; 3×</span> 初始保证金</li>
              </ul>
              <div className="text-xs text-slate-400 mt-2">步长控制：当日最大调整不超过 <b>{pct(maxDailyGapPct)}</b> 的缺口，且不超过可分配资金的 <b>{pct(maxDailyDeployPct)}</b>；同时满足最小调整单元 <b>￥{fmtMoney(minAdjustUnit)}</b>。</div>
            </div>
          </div>
        </div>

        {/* 页脚 */}
        <div className="text-xs text-slate-500 text-center pb-6">
          本原型用于演示"历史回放、导出、执行单预览"与"可解释决策"的整合。生产落地建议由后端输出当日/历史决策对象，前端负责可视化与交互。
        </div>
      </div>
    </div>
  );
}