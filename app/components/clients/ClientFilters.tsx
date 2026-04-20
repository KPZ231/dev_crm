"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ClientStatus, PaymentStatus } from "@prisma/client";
import { Search, X, LayoutGrid, List, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientFiltersProps {
  initialSearch?: string;
  initialStatus?: string;
  initialPaymentStatus?: string;
  view: "table" | "card";
  onViewChange: (view: "table" | "card") => void;
  isPending: boolean;
  onFilterChange: (name: string, value: string | null) => void;
  onClear: () => void;
}

export function ClientFilters({ 
  initialSearch = "", 
  initialStatus = "", 
  initialPaymentStatus = "",
  view,
  onViewChange,
  isPending,
  onFilterChange,
  onClear
}: ClientFiltersProps) {
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
        "sticky top-0 z-10 bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a] p-4 flex flex-col xl:flex-row gap-4 items-center justify-between transition-all",
        isPending && "opacity-80"
    )}>
      <div className="relative w-full xl:w-96 group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isPending ? (
                <Loader2 className="w-4 h-4 text-[#a78bfa] animate-spin" />
            ) : (
                <Search className="w-4 h-4 text-[#a1a1aa] group-focus-within:text-[#a78bfa] transition-colors" />
            )}
        </div>
        <input
          type="text"
          placeholder="Szukaj klientów (nazwa, NIP, email)..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-xl pl-10 pr-4 py-2.5 text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all text-sm shadow-inner"
        />
        {searchValue && (
            <button 
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#fafafa] transition-colors"
                disabled={isPending}
            >
                <X className="w-3.5 h-3.5" />
            </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        <div className="flex items-center gap-2">
            <select
            value={initialStatus}
            onChange={(e) => onFilterChange("status", e.target.value)}
            disabled={isPending}
            className="bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-xs text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-all cursor-pointer hover:border-[#3f3f46] disabled:opacity-50"
            >
            <option value="">Wszystkie Statusy</option>
            {Object.values(ClientStatus).map((status) => (
                <option key={status} value={status}>{status.replace("_", " ")}</option>
            ))}
            </select>

            <select
            value={initialPaymentStatus}
            onChange={(e) => onFilterChange("paymentStatus", e.target.value)}
            disabled={isPending}
            className="bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-xs text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-all cursor-pointer hover:border-[#3f3f46] disabled:opacity-50"
            >
            <option value="">Wszystkie Płatności</option>
            {Object.values(PaymentStatus).map((status) => (
                <option key={status} value={status}>{status.replace("_", " ")}</option>
            ))}
            </select>
        </div>

        {(initialSearch || initialStatus || initialPaymentStatus) && (
          <button
            onClick={onClear}
            disabled={isPending}
            className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] transition-all text-xs px-3 py-2 rounded-lg border border-transparent hover:border-[#27272a] disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Wyczyść
          </button>
        )}

        <div className="h-6 w-px bg-[#27272a] mx-1 hidden sm:block" />

        <div className="flex items-center bg-[#0c0c0f] border border-[#27272a] rounded-lg p-1">
          <button
            onClick={() => onViewChange("table")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              view === "table" ? "bg-[#18181b] text-[#a78bfa] shadow-sm" : "text-[#52525b] hover:text-[#a1a1aa]"
            )}
            disabled={isPending}
            title="Widok tabeli"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange("card")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              view === "card" ? "bg-[#18181b] text-[#a78bfa] shadow-sm" : "text-[#52525b] hover:text-[#a1a1aa]"
            )}
            disabled={isPending}
            title="Widok kart"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


