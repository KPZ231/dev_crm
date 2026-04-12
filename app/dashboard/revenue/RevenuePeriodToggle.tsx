"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PeriodType } from "@/lib/types/revenue";
import { cn } from "@/lib/utils";

interface RevenuePeriodToggleProps {
  currentPeriod: PeriodType;
}

export function RevenuePeriodToggle({ currentPeriod }: RevenuePeriodToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const periods: { id: PeriodType; label: string }[] = [
    { id: "monthly", label: "Monthly" },
    { id: "quarterly", label: "Quarterly" },
    { id: "yearly", label: "Yearly" },
  ];

  const handleToggle = (period: PeriodType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex p-1 bg-[#0c0c0f] border border-[#27272a] rounded-xl">
      {periods.map((p) => (
        <button
          key={p.id}
          onClick={() => handleToggle(p.id)}
          className={cn(
            "px-6 py-2 rounded-lg text-xs font-bold transition-all",
            currentPeriod === p.id 
              ? "bg-[#18181b] text-[#a78bfa] shadow-inner" 
              : "text-[#52525b] hover:text-[#a1a1aa]"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
