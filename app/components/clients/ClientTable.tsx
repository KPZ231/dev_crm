"use client";

import { ClientWithStats } from "@/lib/types/client";
import { 
  Building2, 
  ArrowUpRight, 
  Mail, 
  Briefcase,
} from "lucide-react";
import Link from "next/link";

interface ClientTableProps {
  clients: ClientWithStats[];
}

export function ClientTable({ clients }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-[#0c0c0f] border border-[#27272a] rounded-xl border-dashed">
        <Building2 className="w-12 h-12 text-[#52525b] mb-4" />
        <p className="text-[#a1a1aa]">Nie znaleziono klientów.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272a] text-[#a1a1aa] text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Klient</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-center">Projekty</th>
              <th className="px-6 py-4 font-medium text-right">Revenue</th>
              <th className="px-6 py-4 font-medium text-right">Faktury</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1c]">
            {clients.map((client) => (
              <tr key={client.id} className="group hover:bg-[#141416] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#141416] border border-[#27272a] flex items-center justify-center font-bold text-[#fafafa] group-hover:border-[#a78bfa]/50 transition-colors">
                      {client.companyName.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[#fafafa] font-medium text-sm">{client.companyName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#52525b] uppercase tracking-wide">{client.industry || "Brak branży"}</span>
                        {client.email && (
                          <>
                            <span className="text-[#27272a]">•</span>
                            <span className="text-[10px] text-[#52525b] flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5" /> {client.email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyles(client.status)}`}>
                        {client.status}
                      </span>
                      {client.isProjectFinished && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          UKOŃCZONY
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentStatusStyles(client.paymentStatus)}`}>
                      {client.paymentStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#141416] border border-[#27272a] rounded text-xs text-[#fafafa]">
                    <Briefcase className="w-3 h-3 text-[#a78bfa]" />
                    {client.activeProjectsCount}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-semibold text-[#fafafa]">
                    {client.totalRevenue?.toLocaleString()} PLN
                  </div>
                  <div className="text-[10px] text-[#52525b]">Total Billed</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`text-sm font-medium ${client.outstandingInvoicesCount ? 'text-orange-400' : 'text-[#52525b]'}`}>
                    {client.outstandingInvoicesCount} zaległe
                  </div>
                  <div className="text-[10px] text-[#52525b]">z {client._count.invoices} faktur</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/dashboard/clients/${client.id}`}
                      className="p-2 text-[#52525b] hover:text-[#a78bfa] hover:bg-[#a78bfa]/10 rounded-lg transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case "ACTIVE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "INACTIVE": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "LEAD": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "ARCHIVED": return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

function getPaymentStatusStyles(status: string) {
  switch (status) {
    case "PAID":
    case "UP_TO_DATE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "OVERDUE": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "AT_RISK": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}
