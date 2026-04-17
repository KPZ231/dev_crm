"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TaskWithRelations } from "@/lib/types/task";
import { TaskListTable } from "@/app/components/tasks/TaskListTable";
import { TaskHeader } from "@/app/components/tasks/TaskHeader";
import { TaskFilters } from "@/app/components/tasks/TaskFilters";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TasksListPageClientProps {
  tasks: TaskWithRelations[];
  workspaceId: string;
}

export function TasksListPageClient({ tasks, workspaceId }: TasksListPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const handleFilterChange = (name: string, value: string | null) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);

    startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    startTransition(() => {
        router.push(pathname);
    });
  };

  return (
    <div className="flex flex-col grow relative">
      <TaskHeader 
        workspaceId={workspaceId} 
        isPending={isPending}
        onSearchChange={(val) => handleFilterChange("search", val)}
      />

      <div className="space-y-8">
        <TaskFilters 
            isPending={isPending}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
        />
        
        <div className={cn(
            "space-y-6 transition-all duration-300",
            isPending && "opacity-40 grayscale-[0.5] pointer-events-none"
        )}>
            {isPending && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#09090b]/10 backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#0c0c0f] border border-[#27272a] shadow-2xl">
                        <Loader2 className="w-8 h-8 text-[#a78bfa] animate-spin" />
                        <span className="text-xs font-bold text-[#fafafa] uppercase tracking-widest">Aktualizacja zadań...</span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-bold text-[#fafafa] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]" />
                    Wyniki ({tasks.length})
                </h2>
            </div>
            <TaskListTable tasks={tasks} workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}
