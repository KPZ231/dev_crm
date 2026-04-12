"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ClientStatus, PaymentStatus } from "@prisma/client";
import { Search, Filter, X, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientFiltersProps {
  initialSearch?: string;
  initialStatus?: string;
  initialPaymentStatus?: string;
  view: "table" | "card";
  onViewChange: (view: "table" | "card") => void;
}

export function ClientFilters({ 
  initialSearch, 
  initialStatus, 
  initialPaymentStatus,
  view,
  onViewChange 
}: ClientFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function updateQuery(name: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <div className="sticky top-0 z-10 bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a] p-4 flex flex-col xl:flex-row gap-4 items-center justify-between">
      <div className="relative w-full xl:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
        <input
          type="text"
          placeholder="Szukaj klientów (nazwa, NIP, email)..."
          defaultValue={initialSearch}
          onChange={(e) => updateQuery("search", e.target.value)}
          className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-xl pl-10 pr-4 py-2.5 text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-all text-sm transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        <select
          value={initialStatus || ""}
          onChange={(e) => updateQuery("status", e.target.value)}
          className="bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-xs text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-all cursor-pointer"
        >
          <option value="">Status relacji</option>
          {Object.values(ClientStatus).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={initialPaymentStatus || ""}
          onChange={(e) => updateQuery("paymentStatus", e.target.value)}
          className="bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-xs text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-all cursor-pointer"
        >
          <option value="">Status płatności</option>
          {Object.values(PaymentStatus).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {(initialSearch || initialStatus || initialPaymentStatus) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors text-xs px-2"
          >
            <X className="w-3.5 h-3.5" />
            Wyczyść
          </button>
        )}

        <div className="h-6 w-px bg-[#27272a] mx-2 hidden sm:block" />

        <div className="flex items-center bg-[#0c0c0f] border border-[#27272a] rounded-lg p-1">
          <button
            onClick={() => onViewChange("table")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              view === "table" ? "bg-[#18181b] text-[#a78bfa]" : "text-[#52525b] hover:text-[#a1a1aa]"
            )}
            title="Widok tabeli"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange("card")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              view === "card" ? "bg-[#18181b] text-[#a78bfa]" : "text-[#52525b] hover:text-[#a1a1aa]"
            )}
            title="Widok kart"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
