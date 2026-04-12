"use client";

import { TaskWithRelations } from "@/lib/types/task";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreVertical,
  User,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface TaskListTableProps {
  tasks: TaskWithRelations[];
}

export function TaskListTable({ tasks }: TaskListTableProps) {
  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272a] text-[#52525b] text-[10px] uppercase font-bold tracking-widest">
              <th className="px-6 py-4">Zadanie / Projekt</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priorytet</th>
              <th className="px-6 py-4">Przypisany</th>
              <th className="px-6 py-4">Termin</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1c]">
            {tasks.map((task) => (
              <tr key={task.id} className="group hover:bg-[#141416] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#fafafa] group-hover:text-[#a78bfa] transition-colors">{task.title}</span>
                    <span className="text-[10px] text-[#52525b] font-bold uppercase tracking-widest">{task.project?.name || "General"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                    <StatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4">
                    <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {task.assignee?.image ? (
                        <img src={task.assignee.image} className="w-5 h-5 rounded-full" alt="" />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                            <User className="w-3 h-3 text-[#52525b]" />
                        </div>
                    )}
                    <span className="text-xs text-[#a1a1aa]">{task.assignee?.name || "Unassigned"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-[#52525b]">
                  {task.dueDate ? format(new Date(task.dueDate), "dd.MM.yyyy", { locale: pl }) : "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-[#52525b] hover:text-[#fafafa] bg-[#141416] border border-[#27272a] rounded-lg transition-all">
                      <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-[#52525b] italic text-sm">
                        Brak zadań w tej kategorii.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    BACKLOG: "bg-zinc-800/50 text-zinc-400 border-zinc-700",
    TODO: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    IN_PROGRESS: "bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/20",
    REVIEW: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    BLOCKED: "bg-red-500/10 text-red-400 border-red-500/20",
    DONE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  }[status] || "bg-zinc-800 text-zinc-400";

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
    const styles = {
        URGENT: "text-red-400 font-black",
        HIGH: "text-orange-400",
        MEDIUM: "text-[#a1a1aa]",
        LOW: "text-[#52525b]",
    }[priority] || "text-[#52525b]";

    return (
        <span className={`text-[10px] font-bold tracking-widest uppercase ${styles}`}>
            {priority}
        </span>
    );
}
