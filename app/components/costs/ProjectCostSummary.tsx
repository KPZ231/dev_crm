"use client";

import { ProjectCostSummaryData } from "@/lib/types/cost";
import { motion } from "motion/react";
import { 
  Target, 
  AlertCircle 
} from "lucide-react";

interface ProjectCostSummaryProps {
  summary: ProjectCostSummaryData;
}

export function ProjectCostSummary({ summary }: ProjectCostSummaryProps) {
  const isBudgetExceeded = summary.progress > 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 space-y-8">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-bold text-[#fafafa]">{summary.projectName}</h3>
           <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border ${
               isBudgetExceeded ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/20'
           }`}>
               <Target className="w-3 h-3" />
               Budżet: {summary.totalBudget.toLocaleString()} PLN
           </div>
        </div>

        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <span className="text-xs text-[#52525b] uppercase font-bold tracking-widest">Postęp wydatków</span>
                <span className={`text-lg font-bold ${isBudgetExceeded ? 'text-red-400' : 'text-[#fafafa]'}`}>
                    {summary.progress.toFixed(1)}%
                </span>
            </div>
            <div className="w-full h-4 bg-[#141416] rounded-full overflow-hidden border border-[#27272a]">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(summary.progress, 100)}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className={`h-full rounded-full transition-colors ${
                        isBudgetExceeded ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-[#a78bfa] shadow-[0_0_15px_rgba(167,139,250,0.3)]'
                    }`}
                />
            </div>
            {isBudgetExceeded && (
                <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Uwaga: Budżet projektu został przekroczony o {(summary.totalCosts - summary.totalBudget).toLocaleString()} PLN
                </p>
            )}
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#27272a]">
             <div>
                <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest block mb-1">Suma kosztów</span>
                <span className="text-lg font-bold text-[#fafafa]">{summary.totalCosts.toLocaleString()} PLN</span>
             </div>
             <div>
                <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest block mb-1">Marża (szacunkowa)</span>
                <span className={`text-lg font-bold ${summary.margin >= 0 ? 'text-[#34d399]' : 'text-red-400'}`}>
                    {summary.margin.toLocaleString()} PLN
                </span>
             </div>
        </div>
      </div>

      <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 space-y-6">
        <h3 className="text-sm font-bold text-[#fafafa] uppercase tracking-widest mb-4">Podział kosztów na projekt</h3>
        <div className="space-y-5">
            {summary.breakdown.filter(b => b.amount > 0).map(b => (
                <div key={b.category} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-[#a1a1aa]">{b.category}</span>
                        <span className="text-[#fafafa]">{b.amount.toLocaleString()} PLN</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#141416] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${b.percentage}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="bg-[#34d399] h-full"
                        />
                    </div>
                </div>
            ))}
            {summary.breakdown.every(b => b.amount === 0) && (
                <p className="text-xs text-[#52525b] italic text-center py-10">Brak kosztów przypisanych do tego projektu.</p>
            )}
        </div>
      </div>
    </div>
  );
}
