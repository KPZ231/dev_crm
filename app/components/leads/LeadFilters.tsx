"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LeadStatus } from "@prisma/client";
import { Search, X } from "lucide-react";

interface LeadFiltersProps {
  initialSearch?: string;
  initialStatus?: string;
}

export function LeadFilters({ initialSearch, initialStatus }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleStatusChange(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
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
    <div className="sticky top-0 z-10 bg-[#09090b] border-b border-[#27272a] p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
        <input
          type="text"
          placeholder="Szukaj leadów..."
          defaultValue={initialSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-[#0c0c0f] border border-[#27272a] rounded-lg pl-10 pr-4 py-2 text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-all"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <select
          value={initialStatus || ""}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-[#0c0c0f] border border-[#27272a] rounded-lg px-4 py-2 text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#a78bfa] transition-all cursor-pointer"
        >
          <option value="">Wszystkie statusy</option>
          {Object.values(LeadStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {(initialSearch || initialStatus) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors text-sm px-2"
          >
            <X className="w-4 h-4" />
            Wyczyść
          </button>
        )}
      </div>
    </div>
  );
}
