"use client";

import { useState } from "react";
import { KanbanData, TaskWithRelations } from "@/lib/types/task";
import { TaskStatus } from "@prisma/client";
import { moveTask } from "@/lib/actions/tasks";
import { Plus, Clock } from "lucide-react";
import Image from "next/image";
import { TaskCreateModal } from "./TaskCreateModal";

interface KanbanBoardProps {
  initialData: KanbanData;
  workspaceId: string;
}

export function KanbanBoard({ initialData, workspaceId }: KanbanBoardProps) {
  const [data, setData] = useState<KanbanData>(initialData);
  const [createModalStatus, setCreateModalStatus] = useState<TaskStatus | null>(null);

  const statuses: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "BLOCKED", "DONE"];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceStatus = e.dataTransfer.getData("sourceStatus") as TaskStatus;

    if (!taskId || sourceStatus === targetStatus) return;

    // Optimistic Update
    const task = data[sourceStatus].find(t => t.id === taskId);
    if (!task) return;

    const newData = { ...data };
    newData[sourceStatus] = newData[sourceStatus].filter(t => t.id !== taskId);
    
    // Find approximate position (tail for now)
    const newPosition = newData[targetStatus].length > 0 
        ? newData[targetStatus][newData[targetStatus].length - 1].position + 1000 
        : 1000;

    const updatedTask = { ...task, status: targetStatus, position: newPosition };
    newData[targetStatus].push(updatedTask);

    setData(newData);

    try {
        await moveTask(workspaceId, taskId, targetStatus, newPosition);
    } catch (error) {
        console.error(error);
        alert("Błąd podczas przesuwania zadania.");
        setData(initialData); // Rollback
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-[calc(100vh-250px)] px-2">
      {statuses.map((status) => (
        <div 
            key={status} 
            className="flex-shrink-0 w-80 space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
        >
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                    <h3 className="text-[10px] font-bold text-[#fafafa] uppercase tracking-widest">{status}</h3>
                    <span className="text-[10px] text-[#52525b] font-bold bg-[#141416] px-2 py-0.5 rounded-md border border-[#27272a]">
                        {data[status].length}
                    </span>
                </div>
                <button onClick={() => setCreateModalStatus(status)} className="p-1.5 text-[#52525b] hover:text-[#a78bfa] transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3 min-h-[400px]">
                {data[status].map((task) => (
                    <KanbanCard key={task.id} task={task} />
                ))}
            </div>
        </div>
      ))}
      <TaskCreateModal 
          workspaceId={workspaceId} 
          isOpen={createModalStatus !== null} 
          onClose={() => setCreateModalStatus(null)} 
          defaultStatus={createModalStatus || "TODO"} 
      />
    </div>
  );
}

function KanbanCard({ task }: { task: TaskWithRelations }) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.setData("sourceStatus", task.status);
    };

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            className="group bg-[#0c0c0f] border border-[#27272a] rounded-xl p-4 shadow-sm hover:border-[#a78bfa]/30 transition-all cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-[#a78bfa]/5"
        >
            <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#141416] border border-[#27272a] ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>
                {task.assignee?.image && (
                    <Image 
                        src={task.assignee.image} 
                        width={20} 
                        height={20} 
                        className="w-5 h-5 rounded-full ring-2 ring-[#0c0c0f] object-cover" 
                        alt={task.assignee.name || "Assignee"} 
                    />
                )}
            </div>

            <h4 className="text-sm font-semibold text-[#fafafa] leading-tight mb-3 group-hover:text-[#a78bfa] transition-colors">
                {task.title}
            </h4>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                    <span className="text-[10px] text-[#52525b] font-bold uppercase tracking-widest truncate max-w-[100px]">
                        {task.project?.name || "General"}
                    </span>
                </div>
                {task.dueDate && (
                    <div className="text-[9px] font-bold text-[#52525b] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                )}
            </div>
        </div>
    );
}

function getStatusColor(status: TaskStatus) {
    switch (status) {
        case "BACKLOG": return "bg-zinc-600";
        case "TODO": return "bg-sky-500";
        case "IN_PROGRESS": return "bg-[#a78bfa]";
        case "REVIEW": return "bg-orange-500";
        case "BLOCKED": return "bg-red-500";
        case "DONE": return "bg-emerald-500";
        default: return "bg-zinc-600";
    }
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case "URGENT": return "text-red-400 border-red-500/20";
        case "HIGH": return "text-orange-400 border-orange-500/20";
        case "MEDIUM": return "text-[#a1a1aa] border-[#27272a]";
        case "LOW": return "text-[#52525b] border-[#27272a]";
        default: return "text-[#a1a1aa]";
    }
}
