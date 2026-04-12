"use client";

import { CategoryBreakdown } from "@/lib/types/cost";
import { motion } from "motion/react";

interface CostsChartProps {
  breakdown: CategoryBreakdown[];
}

export function CostsChart({ breakdown }: CostsChartProps) {
  const categories = {
    DEV: "#a78bfa",
    DESIGN: "#34d399",
    MARKETING: "#fb923c",
    TOOLS: "#f87171",
    INFRASTRUCTURE: "#38bdf8",
    OUTSOURCING: "#f472b6",
    OTHER: "#52525b"
  };

  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-bold text-[#fafafa]">Podział kosztów</h3>
            <p className="text-xs text-[#52525b]">Według kategorii w wybranym okresie</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Visual Bar */}
        <div className="w-full h-12 flex rounded-2xl overflow-hidden shadow-2xl bg-[#141416]">
          {breakdown.map((item, idx) => (
            <motion.div
              key={item.category}
              initial={{ width: 0 }}
              animate={{ width: `${item.percentage}%` }}
              transition={{ duration: 1, delay: idx * 0.1, ease: "circOut" }}
              style={{ backgroundColor: categories[item.category as keyof typeof categories] }}
              className="h-full relative group"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          {breakdown.map((item) => (
            <div key={item.category} className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: categories[item.category as keyof typeof categories] }} 
              />
              <div className="min-w-0">
                <span className="text-[10px] text-[#fafafa] font-bold block uppercase tracking-wider truncate">{item.category}</span>
                <span className="text-[10px] text-[#52525b]">{item.amount.toLocaleString()} PLN ({item.percentage.toFixed(0)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
