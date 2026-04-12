"use client";

import { CostsKPIs } from "@/lib/types/cost";
import { 
  CreditCard, 
  BarChart, 
  PieChart, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion } from "motion/react";

interface CostsKpiRowProps {
  kpis: CostsKPIs;
}

export function CostsKpiRow({ kpis }: CostsKpiRowProps) {
  const cards = [
    {
      label: "Fixed Monthly",
      value: `${kpis.fixedMonthlyCosts.toLocaleString()} PLN`,
      icon: <CreditCard className="w-5 h-5 text-[#a78bfa]" />,
      description: "Koszty stałe (biuro, narzędzia)",
    },
    {
      label: "Variable YTD",
      value: `${kpis.variableYtd.toLocaleString()} PLN`,
      icon: <BarChart className="w-5 h-5 text-[#34d399]" />,
      description: "Koszty zmienne od początku roku",
    },
    {
      label: "Total vs Revenue",
      value: `${kpis.totalCosts.toLocaleString()} / ${kpis.totalRevenue.toLocaleString()}`,
      icon: <PieChart className="w-5 h-5 text-orange-400" />,
      description: "Całkowite wydatki vs przychody",
    },
    {
      label: "Gross Margin",
      value: `${kpis.grossMargin.toFixed(1)}%`,
      icon: <TrendingDown className="w-5 h-5 text-emerald-400" />,
      description: "Marża brutto (YTD)",
      trend: kpis.grossMargin > 50 ? 1 : -1
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-[#0c0c0f] border border-[#27272a] p-6 rounded-2xl group hover:border-[#a78bfa]/20 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#52525b] text-[10px] font-bold uppercase tracking-widest">{card.label}</span>
            <div className="p-2 bg-[#141416] rounded-xl border border-[#27272a] group-hover:text-[#a78bfa] transition-colors">
              {card.icon}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-xl font-bold text-[#fafafa] tracking-tight truncate">{card.value}</h3>
            {card.trend && (
              <div className={`flex items-center gap-1 text-[10px] font-bold ${card.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {card.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            )}
          </div>
          <p className="text-xs text-[#52525b] mt-2 line-clamp-1">{card.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
