"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LeadStatus } from "@prisma/client";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadFiltersProps {
  initialSearch?: string;
  initialStatus?: string;
  isPending: boolean;
  onFilterChange: (name: string, value: string | null) => void;
  onClear: () => void;
}

export function LeadFilters({ 
    initialSearch = "", 
    initialStatus = "",
    isPending,
    onFilterChange,
    onClear
}: LeadFiltersProps) {
  const [searchValue, setSearchValue] = useState(initialSearch);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (initialSearch || "")) {
        onFilterChange("search", searchValue);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Sync internal state with external prop (e.g. on clear)
  useEffect(() => {
      setSearchValue(initialSearch);
  }, [initialSearch]);

  return (
    <div className={cn(
        "sticky top-0 z-10 bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a] p-4 flex flex-col sm:flex-row gap-4 items-center justify-between transition-all",
        isPending && "opacity-80"
    )}>
      <div className="relative w-full sm:w-96 group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isPending ? (
                <Loader2 className="w-4 h-4 text-[#a78bfa] animate-spin" />
            ) : (
                <Search className="w-4 h-4 text-[#a1a1aa] group-focus-within:text-[#a78bfa] transition-colors" />
            )}
        </div>
        <input
          type="text"
          placeholder="Szukaj leadów..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-xl pl-10 pr-4 py-2.5 text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-all text-sm"
        />
        {searchValue && !isPending && (
            <button 
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#fafafa]"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        )}
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        <select
          value={initialStatus}
          onChange={(e) => onFilterChange("status", e.target.value)}
          disabled={isPending}
          className="bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-xs text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-all cursor-pointer hover:border-[#3f3f46] disabled:opacity-50"
        >
          <option value="">Wszystkie statusy</option>
          {Object.values(LeadStatus).map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </select>

        {(initialSearch || initialStatus) && (
          <button
            onClick={onClear}
            disabled={isPending}
            className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] transition-all text-xs px-3 py-2 rounded-lg border border-[#27272a]/50 hover:border-[#27272a] disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Wyczyść
          </button>
        )}
      </div>
    </div>
  );
}


