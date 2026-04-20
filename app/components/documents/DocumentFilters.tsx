"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DocumentFiltersProps {
  initialSearch?: string;
  initialType?: string;
}

export function DocumentFilters({ initialSearch, initialType }: DocumentFiltersProps) {
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

  const activeType = currentSearchParams.get('type') || null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 p-2 relative">
      <div className="flex flex-wrap items-center gap-3">
        <FilterItem 
          label="Wszystkie" 
          active={!activeType} 
          onClick={() => handleFilterChange('type', null)} 
          isPending={isPending}
        />
        <FilterItem 
          label="Oferty" 
          active={activeType === 'OFFER'} 
          onClick={() => handleFilterChange('type', 'OFFER')} 
          isPending={isPending}
        />
        <FilterItem 
          label="Umowy" 
          active={activeType === 'CONTRACT'} 
          onClick={() => handleFilterChange('type', 'CONTRACT')} 
          isPending={isPending}
        />
        <FilterItem 
          label="Briefy" 
          active={activeType === 'BRIEF'} 
          onClick={() => handleFilterChange('type', 'BRIEF')} 
          isPending={isPending}
        />
        <FilterItem 
          label="Protokoły" 
          active={activeType === 'PROTOCOL'} 
          onClick={() => handleFilterChange('type', 'PROTOCOL')} 
          isPending={isPending}
        />
        <FilterItem 
          label="Podsumowania" 
          active={activeType === 'SUMMARY'} 
          onClick={() => handleFilterChange('type', 'SUMMARY')} 
          isPending={isPending}
        />
      </div>

      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-[#52525b]" />
        <input 
          defaultValue={initialSearch}
          onChange={(e) => {
            const val = e.target.value;
            // Debounce would be nice, but simple timeout works
            setTimeout(() => {
              handleFilterChange('search', val || null);
            }, 300);
          }}
          placeholder="Szukaj dokumentu..."
          className="bg-[#0c0c0f] border border-[#27272a] rounded-xl pl-10 pr-4 py-2 text-xs text-[#fafafa] focus:border-[#a78bfa] transition-all outline-none w-[200px] disabled:opacity-50"
          disabled={isPending}
        />
        {isPending && (
          <div className="absolute right-3">
            <Loader2 className="w-3 h-3 animate-spin text-[#a78bfa]" />
          </div>
        )}
      </div>
    </div>
  );
}

function FilterItem({ label, active, onClick, isPending }: { label: string; active: boolean; onClick: () => void; isPending: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest border transition-all disabled:opacity-50",
        active 
          ? 'bg-[#a78bfa] border-[#a78bfa] text-[#09090b]' 
          : 'bg-[#0c0c0f] border-[#27272a] text-[#52525b] hover:text-[#a1a1aa]'
      )}
    >
      {label}
    </button>
  );
}
