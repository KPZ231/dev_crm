"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
    Kanban, 
    List, 
    Users, 
    Plus,
    Search,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useTransition, useEffect } from "react";
import { TaskCreateModal } from "./TaskCreateModal";

export function TaskHeader({ 
    workspaceId,
    isPending,
    onSearchChange
}: { 
    workspaceId: string;
    isPending?: boolean;
    onSearchChange?: (val: string) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && searchValue !== (searchParams.get("search") || "")) {
        onSearchChange(searchValue);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange, searchParams]);

  const views = [
    { id: "kanban", label: "Kanban", href: "/dashboard/tasks/kanban", icon: Kanban },
    { id: "list", label: "Lista", href: "/dashboard/tasks", icon: List },
    { id: "workload", label: "Workload", href: "/dashboard/tasks/workload", icon: Users },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
      <div>
        <h1 className="text-3xl font-bold text-[#fafafa] tracking-tight mb-1">Zadania</h1>
        <p className="text-xs text-[#52525b]">Zarządzaj przepływem pracy i obciążeniem zespołu</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* View Switcher */}
        <div className="flex p-1 bg-[#0c0c0f] border border-[#27272a] rounded-xl">
          {views.map((view) => {
            const isActive = pathname === view.href;
            return (
              <Link 
                key={view.id}
                href={view.href}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all",
                  isActive ? "bg-[#18181b] text-[#a78bfa] shadow-inner" : "text-[#52525b] hover:text-[#a1a1aa]"
                )}
              >
                <view.icon className="w-4 h-4" />
                {view.label}
              </Link>
            );
          })}
        </div>

        <div className="h-8 w-px bg-[#27272a] hidden md:block" />

        <div className="flex items-center gap-3">
            <div className="relative group">
                {isPending ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a78bfa] animate-spin" />
                ) : (
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b] group-focus-within:text-[#a78bfa] transition-colors" />
                )}
                <input 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Szukaj zadań..."
                    className="bg-[#0c0c0f] border border-[#27272a] rounded-xl pl-10 pr-4 py-2 text-xs text-[#fafafa] focus:border-[#a78bfa] outline-none transition-all w-full sm:w-64"
                />
            </div>
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-lg whitespace-nowrap"
            >
                <Plus className="w-5 h-5" /> Nowy Task
            </button>
        </div>
      </div>
      <TaskCreateModal 
        workspaceId={workspaceId} 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}


