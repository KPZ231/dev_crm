"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LeadWithAssignee } from "@/lib/types/lead";
import { LeadTable } from "@/app/components/leads/LeadTable";
import { LeadFilters } from "@/app/components/leads/LeadFilters";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadsListPageClientProps {
  leads: LeadWithAssignee[];
  showFinancials: boolean;
  searchParams: {
    search?: string;
    status?: string;
  };
}

export function LeadsListPageClient({ leads, showFinancials, searchParams }: LeadsListPageClientProps) {
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
      <LeadFilters 
        initialSearch={searchParams.search} 
        initialStatus={searchParams.status}
        isPending={isPending}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <div className={cn(
          "p-8 grow overflow-auto custom-scrollbar transition-all duration-300",
          isPending && "opacity-40 grayscale-[0.5] pointer-events-none"
      )}>
        {isPending && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#09090b]/10 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#0c0c0f] border border-[#27272a] shadow-2xl">
                    <Loader2 className="w-8 h-8 text-[#a78bfa] animate-spin" />
                    <span className="text-xs font-bold text-[#fafafa] uppercase tracking-widest">Aktualizacja leada...</span>
                </div>
            </div>
        )}

        <LeadTable leads={leads} showFinancials={showFinancials} />
      </div>
    </div>
  );
}
