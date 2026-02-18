import { Card } from '@/app/components/ui/card';
import { Loader2, TrendingUp, AlertTriangle, ShieldAlert, Award, BrainCircuit, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { AgenticThesisData } from '@/app/services/api';

interface AgenticThesisCardProps {
    data: AgenticThesisData | null;
    isLoading?: boolean;
    error?: string | null;
}

export function AgenticThesisCard({ data, isLoading = false, error = null }: AgenticThesisCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (isLoading) {
        return (
            <Card variant="elevated" className="p-6 border-l-[6px] border-[#8B5CF6]/50 shadow-lg shadow-[#8B5CF6]/5">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-[#8B5CF6]/10">
                        <BrainCircuit className="size-6 text-[#8B5CF6]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-100">Agentic Debate</h3>
                        <p className="text-xs text-zinc-500">Synthesizing multiple AI viewpoints...</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="size-10 text-[#8B5CF6] animate-spin" />
                    <div className="text-center">
                        <p className="text-sm text-zinc-300 font-medium">Orchestrating Agents</p>
                        <p className="text-xs text-zinc-500 mt-1">Researcher • Bear Analyst • Bull Analyst</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card variant="elevated" className="p-6 border-l-[6px] border-red-500/50">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="size-5 text-red-400" />
                    <h3 className="text-lg font-bold text-zinc-100">Analysis Failed</h3>
                </div>
                <p className="text-sm text-red-400/80">{error}</p>
            </Card>
        )
    }

    if (!data) return null;

    // Configuration based on final sentiment
    const isBullish = data.sentiment === 'Bullish';
    const isBearish = data.sentiment === 'Bearish';

    const sentimentColor = isBullish ? 'text-emerald-400' : isBearish ? 'text-red-400' : 'text-amber-400';
    const sentimentBg = isBullish ? 'bg-emerald-500/10' : isBearish ? 'bg-red-500/10' : 'bg-amber-500/10';
    const sentimentBorder = isBullish ? 'border-emerald-500/20' : isBearish ? 'border-red-500/20' : 'border-amber-500/20';

    return (
        <Card variant="elevated" className="relative overflow-hidden border-0 bg-zinc-900/40 backdrop-blur-md">
            {/* Top Border Gradient */}
            <div className={`absolute top-0 left-0 w-[6px] h-full ${isBullish ? 'bg-emerald-500' : isBearish ? 'bg-red-500' : 'bg-amber-500'}`} />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                            <BrainCircuit className="size-6 text-[#8B5CF6]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                Consensus Verdict
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${sentimentBg} ${sentimentColor} ${sentimentBorder}`}>
                                    {data.sentiment.toUpperCase()}
                                </span>
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                <Award className="size-3.5 text-amber-500" />
                                <span>Confidence Score: <span className="text-zinc-300">{data.confidence_score}%</span></span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        {isExpanded ? <ChevronUp className="size-5 text-zinc-400" /> : <ChevronDown className="size-5 text-zinc-400" />}
                    </button>
                </div>

                {/* Executive Summary */}
                <div className="mb-6 bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/50">
                    <p className="text-sm text-zinc-300 leading-relaxed italic">
                        "{data.reasoning}"
                    </p>
                </div>

                {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 fade-in duration-300">

                        {/* The Bear's View */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                                <ShieldAlert className="size-4 text-red-400" />
                                <h4 className="text-sm font-semibold text-red-400/90 uppercase tracking-wider">The Bear Case</h4>
                            </div>
                            <ul className="space-y-3">
                                {data.bear_view.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400/90 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                                        <span className="text-red-500/60 mt-0.5">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* The Bull's View */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                                <TrendingUp className="size-4 text-emerald-400" />
                                <h4 className="text-sm font-semibold text-emerald-400/90 uppercase tracking-wider">The Bull Case</h4>
                            </div>
                            <ul className="space-y-3">
                                {data.bull_view.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400/90 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                                        <span className="text-emerald-500/60 mt-0.5">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                )}
            </div>
        </Card>
    );
}
