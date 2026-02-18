import { Card } from '@/app/components/ui/card';
import { useState } from 'react';
import { Loader2, Activity, Zap, GitCommit, GitMerge, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import type { EnsembleData } from '@/app/services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

interface PredictionEnsembleCardProps {
    data: EnsembleData | null;
    isLoading?: boolean;
    error?: string | null;
    ticker: string;
    onRefresh?: (shock: boolean) => void;
}

export function PredictionEnsembleCard({ data, isLoading = false, error = null, ticker, onRefresh }: PredictionEnsembleCardProps) {

    // Loading st
    if (isLoading) {
        return (
            <Card variant="elevated" className="p-6 border-l-[6px] border-[#F43F5E]/50 shadow-lg shadow-[#F43F5E]/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <GitMerge className="size-24 text-[#F43F5E]" />
                </div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 rounded-lg bg-[#F43F5E]/10">
                        <GitMerge className="size-6 text-[#F43F5E]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-100">Agentic Ensemble</h3>
                        <p className="text-xs text-zinc-500">Fusing Quant, Topology & Sentiment Signals</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="size-10 text-[#F43F5E] animate-spin" />
                    <p className="text-xs text-zinc-500">Orchestrating multi-agent consensus...</p>
                </div>
            </Card>
        );
    }

    if (error || !data) {
        return null; // Or show error state
    }

    // Format Price
    const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

    // Chart Data Preparation
    const chartData = [
        { name: 'Current', price: data.current_price, fill: '#71717a' }, // zinc-500
        { name: 'LSTM Base', price: data.lstm_base_price, fill: '#3b82f6' }, // blue-500
        { name: 'Ensemble', price: data.final_predicted_price, fill: '#10b981' } // emerald-500 (if up) or red (if down)
    ];

    // Dynamic color for Ensemble bar
    const isEnsembleBullish = data.final_predicted_price > data.current_price;
    chartData[2].fill = isEnsembleBullish ? '#10b981' : '#ef4444';

    const [isShocked, setIsShocked] = useState(false);

    const handleShock = () => {
        setIsShocked(true);
        if (onRefresh) onRefresh(true);
        setTimeout(() => setIsShocked(false), 5000); // Reset visual state after 5s or when data loads
    };

    return (
        <Card variant="elevated" className={`p-6 border-l-[6px] ${isShocked ? 'border-red-600 bg-red-900/10' : 'border-[#F43F5E] bg-zinc-900/40'} backdrop-blur-md relative overflow-hidden transition-colors duration-500`}>
            {/* Background Decor */}
            <div className={`absolute top-[-20%] right-[-10%] w-[300px] h-[300px] ${isShocked ? 'bg-red-600/20' : 'bg-[#F43F5E]/5'} rounded-full blur-[100px] pointer-events-none transition-colors duration-500`} />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#F43F5E]/10 border border-[#F43F5E]/20">
                        <GitMerge className="size-6 text-[#F43F5E]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-100">Agentic Ensemble Prediction</h3>
                        <p className="text-xs text-zinc-400">Fused Intelligence for {ticker}</p>
                    </div>
                </div>

                {/* Confidence & Actions */}
                <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Confidence</span>
                        <div className="flex items-center gap-1.5">
                            <Activity className="size-4 text-[#F43F5E]" />
                            <span className="text-xl font-bold text-zinc-100">{data.confidence_score}%</span>
                        </div>
                    </div>

                    <button
                        onClick={handleShock}
                        disabled={isLoading || isShocked}
                        className={`text-[10px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5
                            ${isShocked
                                ? 'bg-red-500/20 text-red-400 border-red-500/50 cursor-not-allowed animate-pulse'
                                : 'bg-zinc-800 hover:bg-red-900/20 text-zinc-400 hover:text-red-400 border-zinc-700 hover:border-red-900/50'
                            }`}
                        title="Simulate a market crash scenario (Stress Test)"
                    >
                        <TrendingDown className="size-3" />
                        {isShocked ? 'Simulating Shock...' : 'Simulate Market Shock'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

                {/* Left: Signal Breakdown */}
                <div className="space-y-6">
                    <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2">Signal Fusion</h4>

                    {/* 1. Quant Signal */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="size-4 text-blue-400" />
                            <span className="text-sm text-zinc-300">Quant LSTM</span>
                        </div>
                        <span className={`text-sm font-mono ${data.factors.quant_forecast_pct >= 0 ? 'text-blue-400' : 'text-blue-400'}`}>
                            {data.factors.quant_forecast_pct > 0 ? '+' : ''}{data.factors.quant_forecast_pct}%
                        </span>
                    </div>

                    {/* 2. Topology Signal */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <GitCommit className="size-4 text-amber-400" />
                            <span className="text-sm text-zinc-300">Network Penalty</span>
                        </div>
                        <span className={`text-sm font-mono ${data.factors.topology_risk_penalty_pct < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {data.factors.topology_risk_penalty_pct > 0 ? '+' : ''}{data.factors.topology_risk_penalty_pct}%
                        </span>
                    </div>

                    {/* 3. Sentiment Signal */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4 text-purple-400" />
                            <span className="text-sm text-zinc-300">Sentiment Multiplier</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-sm font-mono text-purple-400">x{data.factors.sentiment_multiplier}</span>
                            <span className="text-[10px] text-zinc-500 uppercase">{data.factors.sentiment}</span>
                        </div>
                    </div>

                    {/* Final Outcome Box */}
                    <div className="mt-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 flex items-center justify-between">
                        <span className="text-sm text-zinc-400">Predicted Price</span>
                        <span className={`text-xl font-bold ${isEnsembleBullish ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatPrice(data.final_predicted_price)}
                        </span>
                    </div>
                </div>

                {/* Right: Comparative Chart */}
                <div className="lg:col-span-2 h-[200px] w-full">
                    <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 text-center">Outcome Comparison</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12 }}
                                dy={10}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{
                                    backgroundColor: '#18181b',
                                    borderColor: '#27272a',
                                    borderRadius: '8px',
                                    color: '#f4f4f5'
                                }}
                                itemStyle={{ color: '#e4e4e7' }}
                                formatter={(value: any) => [`₹${value}`, 'Price']}
                            />
                            <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </Card>
    );
}
