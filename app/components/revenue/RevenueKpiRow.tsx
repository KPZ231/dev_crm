"use client";

import { RevenueKPIs } from "@/lib/types/revenue";
import { 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { motion } from "motion/react";

interface RevenueKpiRowProps {
  kpis: RevenueKPIs;
}

export function RevenueKpiRow({ kpis }: RevenueKpiRowProps) {
  const cards = [
    {
      label: "Monthly Recurring Revenue",
      value: `${kpis.mrr.toLocaleString()} PLN`,
      icon: <TrendingUp className="w-5 h-5 text-[#a78bfa]" />,
      description: "Szacowany przychód miesięczny",
      trend: kpis.growth,
    },
    {
      label: "Revenue This Month",
      value: `${kpis.currentMonthRevenue.toLocaleString()} PLN`,
      icon: <DollarSign className="w-5 h-5 text-[#34d399]" />,
      description: `Względem poprzedniego miesiąca`,
    },
    {
      label: "Overdue Invoices",
      value: `${kpis.overdueInvoicesAmount.toLocaleString()} PLN`,
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      description: "Wymagające natychmiastowej uwagi",
      isAlert: kpis.overdueInvoicesAmount > 0,
    },
    {
      label: "Paid YTD",
      value: `${kpis.paidYtd.toLocaleString()} PLN`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      description: "Całkowity przychód w tym roku",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-[#0c0c0f] border border-[#27272a] p-6 rounded-2xl shadow-sm hover:border-[#a78bfa]/20 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#52525b] text-[10px] font-bold uppercase tracking-widest">{card.label}</span>
            <div className={`p-2 bg-[#141416] rounded-xl border border-[#27272a] group-hover:bg-[#a78bfa]/10 transition-colors`}>
              {card.icon}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold text-[#fafafa] tracking-tight">{card.value}</h3>
                {card.trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${card.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {card.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(card.trend).toFixed(1)}%
                    </div>
                )}
            </div>
            <p className={`text-xs mt-2 ${card.isAlert ? 'text-red-400/80' : 'text-[#52525b]'}`}>
                {card.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
