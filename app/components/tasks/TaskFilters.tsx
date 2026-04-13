"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function TaskFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap items-center gap-4 p-2 mb-8">
            <FilterSelect 
                label="Status" 
                value={searchParams.get("status") || ""} 
                options={["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "BLOCKED", "DONE"]}
                onChange={(v) => updateFilter("status", v)}
            />
             <FilterSelect 
                label="Priority" 
                value={searchParams.get("priority") || ""} 
                options={["LOW", "MEDIUM", "HIGH", "URGENT"]}
                onChange={(v) => updateFilter("priority", v)}
            />
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
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">{label}:</span>
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="bg-[#0c0c0f] border border-[#27272a] rounded-lg text-xs text-[#a1a1aa] px-2 py-1 outline-none focus:border-[#a78bfa] transition-all"
            >
                <option value="">Wszystkie</option>
                {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}
