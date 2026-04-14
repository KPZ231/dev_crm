"use client";

import { ClientWithStats } from "@/lib/types/client";
import { 
  ArrowUpRight, 
  Mail, 
  Phone,
  Briefcase,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface ClientCardProps {
  client: ClientWithStats;
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-xl p-6 hover:border-[#a78bfa]/40 transition-all group flex flex-col h-full shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#141416] border border-[#27272a] flex items-center justify-center font-bold text-xl text-[#fafafa] group-hover:bg-[#a78bfa] group-hover:text-[#09090b] transition-all">
            {client.companyName.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#fafafa] group-hover:text-[#a78bfa] transition-colors line-clamp-1">{client.companyName}</h3>
            <p className="text-[10px] text-[#52525b] uppercase tracking-wider">{client.industry || "Brak branży"}</p>
          </div>
        </div>
        
        <Link 
          href={`/dashboard/clients/${client.id}`}
          className="p-2 text-[#52525b] hover:text-[#fafafa] bg-[#141416] rounded-lg border border-[#27272a] transition-all"
        >
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4 flex-grow">
        <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyles(client.status)}`}>
              {client.status}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentStatusStyles(client.paymentStatus)}`}>
              {client.paymentStatus}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#141416] border border-[#27272a] rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] text-[#52525b] mb-1">
                    <Briefcase className="w-3 h-3 text-[#a78bfa]" />
                    PROJEKTY
                </div>
                <div className="text-sm font-bold text-[#fafafa]">{client.activeProjectsCount} Aktywne</div>
            </div>
            <div className="bg-[#141416] border border-[#27272a] rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] text-[#52525b] mb-1">
                    <TrendingUp className="w-3 h-3 text-[#34d399]" />
                    REVENUE
                </div>
                <div className="text-sm font-bold text-[#fafafa]">{client.totalRevenue?.toLocaleString()} PLN</div>
            </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#27272a] flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-3">
          {client.email && (
            <div className="flex items-center gap-1 text-[#52525b]">
              <Mail className="w-3 h-3" />
              <span className="max-w-[80px] truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-1 text-[#52525b]">
              <Phone className="w-3 h-3" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>
        
        {(client.outstandingInvoicesCount || 0) > 0 && (
          <div className="flex items-center gap-1 text-orange-400 font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>Zaległe</span>
          </div>
        )}
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
