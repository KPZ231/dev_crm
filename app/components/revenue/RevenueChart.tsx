"use client";

import { RevenueDataPoint } from "@/lib/types/revenue";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface RevenueChartProps {
  data: RevenueDataPoint[];
  period: string;
}

export function RevenueChart({ data, period }: RevenueChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const maxValue = Math.max(...data.map(d => d.revenue), 1000); // at least 1000 for scale
  
  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h3 className="text-lg font-bold text-[#fafafa]">Przychody operacyjne</h3>
           <p className="text-xs text-[#52525b]">Podsumowanie okresowe ({period})</p>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#a78bfa]" />
                <span className="text-[10px] text-[#a1a1aa] uppercase font-bold tracking-wider">Revenue</span>
            </div>
        </div>
      </div>

      <div className="relative h-[300px] w-full flex items-end gap-2 px-2">
        {/* Y-Axis lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div key={percent} className="w-full flex items-center gap-4">
              <span className="text-[10px] text-[#27272a] w-10 text-right">
                {percent === 0 ? 0 : `${((maxValue * percent) / 100).toLocaleString()}`}
              </span>
              <div className="flex-grow h-px bg-[#27272a]/30" />
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="flex-grow h-full flex items-end justify-between gap-1 sm:gap-4 relative z-10 pt-4">
          {data.map((point, idx) => {
            const height = (point.revenue / maxValue) * 100;
            return (
              <div 
                key={idx} 
                className="flex-grow flex flex-col items-center group relative h-full justify-end"
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05, ease: "circOut" }}
                  className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 relative ${
                    hoveredBar === idx ? 'bg-[#a78bfa] shadow-[0_0_20px_rgba(167,139,250,0.3)]' : 'bg-[#a78bfa]/20 border-t-2 border-[#a78bfa]/40'
                  }`}
                />
                
                <span className={`text-[10px] mt-3 font-medium transition-colors ${
                  hoveredBar === idx ? 'text-[#fafafa]' : 'text-[#52525b]'
                }`}>
                  {point.label}
                </span>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredBar === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-4 z-50 bg-[#141416] border border-[#a78bfa]/50 rounded-xl p-4 shadow-2xl min-w-[140px] pointer-events-none"
                    >
                      <div className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest mb-1">
                        {period === "monthly" ? format(point.date, "MMMM yyyy", { locale: pl }) : point.label}
                      </div>
                      <div className="text-lg font-bold text-[#fafafa]">
                        {point.revenue.toLocaleString()} PLN
                      </div>
                      <div className="text-[10px] text-[#a1a1aa] mt-0.5">
                        {point.count} faktur
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
