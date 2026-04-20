"use client";

import { InvoiceWithClient } from "@/lib/types/revenue";
import { 
  Receipt, 
  ArrowUpRight, 
  Download,
  Search,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface InvoiceTableProps {
  invoices: InvoiceWithClient[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const handleExportCSV = () => {
    const headers = ["Client", "Invoice Number", "Amount", "Status", "Issue Date", "Due Date"].join(",");
    const rows = invoices.map(inv => [
      inv.client.companyName,
      inv.number,
      inv.amount,
      inv.status,
      format(new Date(inv.createdAt), "yyyy-MM-dd"),
      format(new Date(inv.dueDate), "yyyy-MM-dd")
    ].join(","));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoices_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#fafafa]">Lista faktur</h3>
            <span className="px-2 py-0.5 rounded-lg bg-[#141416] border border-[#27272a] text-[10px] text-[#52525b] font-bold">
                {invoices.length} TOTAL
            </span>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
                <input 
                    placeholder="Szukaj faktur..." 
                    className="bg-[#141416] border border-[#27272a] rounded-xl pl-9 pr-4 py-2 text-xs text-[#fafafa] placeholder-[#52525b] focus:border-[#a78bfa] transition-all outline-none"
                />
            </div>
            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-[#141416] border border-[#27272a] hover:bg-[#18181b] text-[#a1a1aa] hover:text-[#fafafa] px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
                <Download className="w-4 h-4" /> Export CSV
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272a] text-[#52525b] text-[10px] uppercase font-bold tracking-widest">
              <th className="px-6 py-4 font-medium">Klient / Numer</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Data wystawienia</th>
              <th className="px-6 py-4 font-medium">Termin płatności</th>
              <th className="px-6 py-4 font-medium text-right">Kwota</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1c]">
            {invoices.map((inv) => (
              <tr key={inv.id} className="group hover:bg-[#141416] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#fafafa] group-hover:text-[#a78bfa] transition-colors">{inv.client.companyName}</span>
                    <span className="text-[10px] text-[#52525b] font-mono tracking-tight">{inv.number}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyles(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-[#a1a1aa]">
                   {format(new Date(inv.createdAt), "dd MMM yyyy", { locale: pl })}
                </td>
                <td className="px-6 py-4 text-xs text-[#a1a1aa]">
                   {format(new Date(inv.dueDate), "dd MMM yyyy", { locale: pl })}
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-[#fafafa]">{inv.amount.toLocaleString()} PLN</div>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <Link 
                            href={`/dashboard/clients/${inv.clientId}`}
                            className="p-2 text-[#52525b] hover:text-[#a78bfa] bg-[#141416] border border-[#27272a] rounded-lg transition-all"
                        >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                        <Receipt className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
                        <p className="text-[#52525b] text-sm">Nie znaleziono żadnych faktur spełniających kryteria.</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case "PAID": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "DRAFT": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "SENT": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "OVERDUE": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "CANCELLED": return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}
