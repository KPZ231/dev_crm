"use client";

import { RevenueComparison } from "@/lib/types/revenue";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Zap, 
  AlertTriangle 
} from "lucide-react";
import { motion } from "motion/react";

interface RevenueComparisonProps {
  comparison: RevenueComparison;
  period: string;
}

export function RevenueComparisonRow({ comparison, period }: RevenueComparisonProps) {
  const isPositive = comparison.percentageChange >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Comparison Detail */}
      <div className="lg:col-span-2 bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-10">
        <div className="shrink-0 relative">
            <svg className="w-40 h-40 transform -rotate-90">
                <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-[#141416]"
                />
                <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={440}
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * Math.min(Math.abs(comparison.percentageChange), 100)) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={isPositive ? "text-[#a78bfa]" : "text-red-400"}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${isPositive ? 'text-[#fafafa]' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{comparison.percentageChange.toFixed(1)}%
                </span>
                <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest">Growth</span>
            </div>
        </div>

        <div className="grow space-y-6">
            <div>
                <h4 className="text-[#a1a1aa] text-sm font-medium mb-1">Porównanie z poprzednim okresem</h4>
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[#fafafa]">{comparison.currentPeriodTotal.toLocaleString()} PLN</span>
                    <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {comparison.difference.toLocaleString()} PLN
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#27272a]">
                <div>
                    <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest block mb-1">Poprzedni {period}</span>
                    <span className="text-lg font-bold text-[#fafafa]">{comparison.previousPeriodTotal.toLocaleString()} PLN</span>
                </div>
                <div>
                    <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest block mb-1">Prognoza (Linear)</span>
                    <span className="text-lg font-bold text-[#fafafa]">{Math.round(comparison.currentPeriodTotal * 1.1).toLocaleString()} PLN</span>
                </div>
            </div>
        </div>
      </div>

      {/* Best/Worst Stats */}
      <div className="space-y-6">
        <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-[#34d399]/10 rounded-xl border border-[#34d399]/20 text-[#34d399]">
                <Zap className="w-5 h-5" />
            </div>
            <div>
                <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest">Best Performing Month</span>
                <h5 className="text-[#fafafa] font-bold mt-1">{comparison.bestMonth.label}</h5>
                <p className="text-xs text-[#34d399]">{comparison.bestMonth.value.toLocaleString()} PLN</p>
            </div>
        </div>

        <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-6 flex items-start gap-4 text-orange-400">
            <div className="p-3 bg-orange-400/10 rounded-xl border border-orange-400/20">
                <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
                <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest">Worst Performing Month</span>
                <h5 className="text-[#fafafa] font-bold mt-1">{comparison.worstMonth.label}</h5>
                <p className="text-xs">{comparison.worstMonth.value.toLocaleString()} PLN</p>
            </div>
        </div>

        <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-[#a78bfa]/10 rounded-xl border border-[#a78bfa]/20 text-[#a78bfa]">
                <Target className="w-5 h-5" />
            </div>
            <div>
                <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest">Efficiency Goal</span>
                <h5 className="text-[#fafafa] font-bold mt-1">94% of Yearly Target</h5>
                <div className="w-full h-1 bg-[#141416] rounded-full mt-2 overflow-hidden">
                    <div className="w-[94%] h-full bg-[#a78bfa] rounded-full" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
