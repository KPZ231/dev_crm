"use client";

import Link from "next/link";
import { LeadStatus } from "@prisma/client";
import { LeadWithAssignee } from "@/lib/types/lead";
import { 
  Building2, 
  ArrowUpRight, 
  Mail, 
  Phone, 
  User as UserIcon,
  MoreHorizontal
} from "lucide-react";
import Image from "next/image";

interface LeadTableProps {
  leads: LeadWithAssignee[];
  showFinancials: boolean;
}

export function LeadTable({ leads, showFinancials }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-[#0c0c0f] border border-[#27272a] rounded-xl border-dashed">
        <Building2 className="w-12 h-12 text-[#52525b] mb-4" />
        <p className="text-[#a1a1aa]">Nie znaleziono żadnych leadów.</p>
        <p className="text-sm text-[#52525b]">Zmień filtry lub dodaj nowego leada.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0f] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272a] text-[#a1a1aa] text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Firma / Osoba</th>
              <th className="px-6 py-4 font-medium">Kontakt</th>
              <th className="px-6 py-4 font-medium">Status</th>
              {showFinancials && <th className="px-6 py-4 font-medium text-right">Potencjał</th>}
              <th className="px-6 py-4 font-medium">Przypisany</th>
              <th className="px-6 py-4 font-medium text-right">Dodano</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1c]">
            {leads.map((lead) => (
              <tr key={lead.id} className="group hover:bg-[#141416] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#141416] border border-[#27272a] flex items-center justify-center font-bold text-[#fafafa] group-hover:border-[#a78bfa]/50 transition-colors">
                      {lead.companyName.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[#fafafa] font-medium text-sm">{lead.companyName}</div>
                      <div className="text-[10px] text-[#52525b] uppercase tracking-wide">{lead.contactPerson}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    {lead.email && (
                      <div className="text-[#fafafa] text-sm flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[#a78bfa]" />
                        {lead.email}
                      </div>
                    )}
                    {lead.phone && (
                      <div className="text-xs text-[#a1a1aa] flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#52525b]" />
                        {lead.phone}
                      </div>
                    )}
                    {!lead.email && !lead.phone && <span className="text-[#52525b] text-xs">Brak kontaktu</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                {showFinancials && (
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-semibold text-[#34d399]">
                      {lead.potentialValue ? `${lead.potentialValue.toLocaleString()} PLN` : "-"}
                    </div>
                  </td>
                )}
                <td className="px-6 py-4">
                  {lead.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-[#27272a] overflow-hidden flex items-center justify-center bg-[#1a1a1c]">
                        {lead.assignee.image ? (
                          <Image src={lead.assignee.image} width={24} height={24} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <UserIcon className="w-3 h-3 text-[#52525b]" />
                        )}
                      </div>
                      <span className="text-[#fafafa] text-xs font-medium">{lead.assignee.name || lead.assignee.email.split('@')[0]}</span>
                    </div>
                  ) : (
                    <span className="text-[#52525b] text-xs italic">Nieprzypisany</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-[#52525b] text-xs">
                  {new Date(lead.createdAt).toLocaleDateString("pl-PL")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/dashboard/leads/${lead.id}`}
                      className="p-2 text-[#52525b] hover:text-[#a78bfa] hover:bg-[#a78bfa]/10 rounded-lg transition-all"
                      title="Szczegóły & Edycja"
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

function StatusBadge({ status }: { status: LeadStatus }) {
  const styles: Record<LeadStatus, string> = {
    NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    CONTACTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    QUALIFIED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    PROPOSAL_SENT: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    WON: "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20",
    LOST: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
}

