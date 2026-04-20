"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFiltersProps {
    isPending: boolean;
    onFilterChange: (name: string, value: string | null) => void;
    onClear: () => void;
}

export function TaskFilters({ isPending, onFilterChange, onClear }: TaskFiltersProps) {
    const searchParams = useSearchParams();

    const hasFilters = searchParams.get("status") || searchParams.get("priority") || searchParams.get("search");

    return (
        <div className={cn(
            "flex flex-wrap items-center gap-6 p-4 mb-8 bg-[#0c0c0f]/50 border border-[#27272a] rounded-xl transition-all",
            isPending && "opacity-70 pointer-events-none"
        )}>
            <div className="flex items-center gap-2 min-w-[40px]">
                {isPending ? (
                    <Loader2 className="w-4 h-4 text-[#a78bfa] animate-spin" />
                ) : (
                    <div className="w-4 h-4 rounded-full border border-[#27272a]" />
                )}
            </div>

            <FilterSelect 
                label="Status" 
                value={searchParams.get("status") || ""} 
                options={["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "BLOCKED", "DONE"]}
                onChange={(v) => onFilterChange("status", v)}
            />
             <FilterSelect 
                label="Priorytet" 
                value={searchParams.get("priority") || ""} 
                options={["LOW", "MEDIUM", "HIGH", "URGENT"]}
                onChange={(v) => onFilterChange("priority", v)}
            />

            {hasFilters && (
                <button
                    onClick={onClear}
                    disabled={isPending}
                    className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] transition-all text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-[#27272a] disabled:opacity-50"
                >
                    <X className="w-3 h-3" />
                    Wyczyść
                </button>
            )}
        </div>
    );
}


interface FilterSelectProps {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">{label}</span>
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="bg-[#09090b] border border-[#27272a] rounded-lg text-xs text-[#fafafa] px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#a78bfa] hover:border-[#3f3f46] transition-all cursor-pointer"
            >
                <option value="">Wszystkie</option>
                {options.map((o: string) => (
                    <option key={o} value={o}>
                        {o.replace("_", " ")}
                    </option>
                ))}
            </select>
        </div>
    );
}

