"use client";

import { CostWithProject } from "@/lib/types/cost";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { 
  CreditCard, 
  Trash2, 
  Repeat,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface CostsTableProps {
  costs: CostWithProject[];
}

export function CostsTable({ costs }: CostsTableProps) {
  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272a] text-[#52525b] text-[10px] uppercase font-bold tracking-widest">
              <th className="px-6 py-4">Koszt / Kategoria</th>
              <th className="px-6 py-4">Projekt</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4 text-right">Kwota</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1c]">
            {costs.map((cost) => (
              <tr key={cost.id} className="group hover:bg-[#141416] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#141416] border border-[#27272a] flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-[#a78bfa]" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-[#fafafa] flex items-center gap-2">
                            {cost.name}
                            {cost.isRecurring && <Repeat className="w-3 h-3 text-[#a78bfa]/60" />}
                        </div>
                        <span className="text-[10px] text-[#52525b] uppercase font-bold tracking-wider">{cost.category}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {cost.project ? (
                    <Link href={`/dashboard/costs/${cost.projectId}`} className="text-xs text-[#a1a1aa] hover:text-[#a78bfa] transition-colors flex items-center gap-1">
                        {cost.project.name}
                        <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-xs text-[#27272a] italic">Ogólne</span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-[#52525b]">
                   {format(new Date(cost.date), "dd MMM yyyy", { locale: pl })}
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-[#fafafa]">{cost.amount.toLocaleString()} PLN</span>
                        <span className="text-[10px] text-[#52525b] uppercase">{cost.type}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-[#27272a] hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {costs.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-[#52525b] italic text-sm">
                        Brak zarejestrowanych kosztów w tym widoku.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
