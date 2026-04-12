'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useInView, useAnimation, Variants } from 'motion/react';
import { ArrowUpRight, Users, Activity, TrendingUp } from 'lucide-react';

const MetricsOverview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Mock data for the line chart (MRR)
  const lineChartData = [20, 35, 30, 50, 45, 65, 60, 80, 75, 95];
  const maxLineVal = Math.max(...lineChartData);

  const smoothLinePath = `M 0,${100 - (lineChartData[0] / maxLineVal) * 100} ` + 
    lineChartData.slice(1).map((val, idx) => {
      const x = ((idx + 1) / (lineChartData.length - 1)) * 100;
      const y = 100 - (val / maxLineVal) * 100;
      return `L ${x},${y}`;
    }).join(" "); // Using simple lines for a precise technical vibe

  return (
    <section className="w-full py-24 bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center">
      <div className="container mx-auto px-6 max-w-6xl">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Przegląd <span className="text-[#a78bfa]">Metryk</span>
          </h2>
          <p className="text-[#a1a1aa] text-lg leading-relaxed">
            
          </p>
        </header>

        <motion.div 
          ref={containerRef}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Chart 1: Revenue Line Chart */}
          <motion.div variants={itemVariants} className="bg-[#0c0c0f] border border-[#27272a] rounded-xl p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[#a1a1aa] text-sm font-medium mb-1">Miesięczny Przychód Powtarzalny</p>
                <div className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  184,250 PLN
                  <span className="text-[#34d399] text-sm font-medium flex items-center bg-[#34d399]/10 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    12.5%
                  </span>
                </div>
              </div>
              <div className="p-2 bg-[#18181b] border border-[#27272a] rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#a78bfa]" />
              </div>
            </div>

            <div className="h-32 w-full mt-4 flex items-end">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gradientViolet" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={`${smoothLinePath} L 100,100 L 0,100 Z`}
                  fill="url(#gradientViolet)"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                <motion.path
                  d={smoothLinePath}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                />
              </svg>
            </div>
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-transparent to-[#a78bfa]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>

          {/* Chart 2: Task Distribution Bars */}
          <motion.div variants={itemVariants} className="bg-[#0c0c0f] border border-[#27272a] rounded-xl p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[#a1a1aa] text-sm font-medium mb-1">Obciążenie Projektami</p>
                <div className="text-3xl font-bold tracking-tight">
                  12
                  <span className="text-[#a1a1aa] text-base font-normal ml-2">projektów</span>
                </div>
              </div>
              <div className="p-2 bg-[#18181b] border border-[#27272a] rounded-lg">
                <Activity className="w-5 h-5 text-[#34d399]" />
              </div>
            </div>

            <div className="h-32 w-full mt-4 flex items-end justify-between gap-2 px-1">
              {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
                <div key={i} className="w-full bg-[#18181b] rounded-t-sm overflow-hidden h-full flex flex-col justify-end relative">
                  <motion.div 
                    className="w-full bg-[#34d399] rounded-t-sm"
                    initial={{ height: "0%" }}
                    animate={isInView ? { height: `${height}%` } : { height: "0%" }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 * i + 0.3 }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chart 3: Conversion Gauge */}
          <motion.div variants={itemVariants} className="bg-[#0c0c0f] border border-[#27272a] rounded-xl p-6 relative overflow-hidden group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[#a1a1aa] text-sm font-medium mb-1">Konwersja Leadów</p>
              </div>
              <div className="p-2 bg-[#18181b] border border-[#27272a] rounded-lg">
                <Users className="w-5 h-5 text-[#fafafa]" />
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative mt-2">
              <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#18181b" 
                  strokeWidth="12" 
                />
                <motion.circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#a78bfa" 
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="251.2" // 2 * pi * 40
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={isInView ? { strokeDashoffset: 251.2 - (251.2 * 0.68) } : { strokeDashoffset: 251.2 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <motion.span 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  68%
                </motion.span>
              </div>
            </div>
            <p className="text-xs text-center text-[#a1a1aa] mt-4">
              Najlepsze 10% wyników w tym miesiącu
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default MetricsOverview;
