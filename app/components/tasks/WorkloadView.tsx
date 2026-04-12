"use client";

import { WorkloadPoint } from "@/lib/types/task";
import { User, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface WorkloadViewProps {
  workload: WorkloadPoint[];
}

export function WorkloadView({ workload }: WorkloadViewProps) {
  const maxTasks = Math.max(...workload.map(w => w.taskCount), 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {workload.map((point, idx) => {
        const loadPercentage = (point.taskCount / maxTasks) * 100;
        const isOverloaded = point.taskCount > 5;

        return (
          <motion.div 
            key={point.userId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-6 space-y-6 hover:border-[#a78bfa]/20 transition-all"
          >
            <div className="flex items-center gap-4">
                {point.userImage ? (
                    <img src={point.userImage} className="w-12 h-12 rounded-2xl border border-[#27272a]" alt="" />
                ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#141416] border border-[#27272a] flex items-center justify-center">
                        <User className="w-6 h-6 text-[#52525b]" />
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-[#fafafa]">{point.userName}</h3>
                    <p className="text-[10px] text-[#52525b] uppercase font-bold tracking-widest">Team Member</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-xs text-[#a1a1aa] font-medium">Obciążenie (Aktywne taski)</span>
                    <span className={`text-lg font-bold ${isOverloaded ? 'text-orange-400' : 'text-[#fafafa]'}`}>
                        {point.taskCount}
                    </span>
                </div>
                <div className="w-full h-2 bg-[#141416] rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${loadPercentage}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${isOverloaded ? 'bg-orange-500' : 'bg-[#a78bfa]'}`}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#141416]/50 border border-[#27272a]">
                    <div className="text-red-400 mb-1"><AlertTriangle className="w-4 h-4" /></div>
                    <div className="text-xl font-bold text-[#fafafa]">{point.highPriorityCount}</div>
                    <div className="text-[10px] text-[#52525b] uppercase font-bold">High Priority</div>
                </div>
                <div className="p-4 rounded-xl bg-[#141416]/50 border border-[#27272a]">
                    <div className="text-[#34d399] mb-1"><CheckCircle2 className="w-4 h-4" /></div>
                    <div className="text-xl font-bold text-[#fafafa]">{point.taskCount - point.highPriorityCount}</div>
                    <div className="text-[10px] text-[#52525b] uppercase font-bold">Standard</div>
                </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
