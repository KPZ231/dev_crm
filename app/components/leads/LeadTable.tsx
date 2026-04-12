"use client";

import Link from "next/link";
import { LeadStatus } from "@prisma/client";
import { LeadWithAssignee } from "@/lib/types/lead";
import { MoreHorizontal, User as UserIcon } from "lucide-react";

interface LeadTableProps {
  leads: LeadWithAssignee[];
  showFinancials: boolean;
}

export function LeadTable({ leads, showFinancials }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-[#a1a1aa]">
        <p className="text-lg">Nie znaleziono żadnych leadów.</p>
        <p className="text-sm">Zmień filtry lub dodaj nowego leada.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#27272a] text-[#a1a1aa] text-sm uppercase tracking-wider">
            <th className="px-6 py-4 font-medium">Firma / Osoba</th>
            <th className="px-6 py-4 font-medium">Kontakt</th>
            <th className="px-6 py-4 font-medium">Status</th>
            {showFinancials && <th className="px-6 py-4 font-medium text-right">Wartość</th>}
            <th className="px-6 py-4 font-medium">Przypisany</th>
            <th className="px-6 py-4 font-medium text-right">Data</th>
            <th className="px-6 py-4 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a1a1c]">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="group hover:bg-[#0c0c0f] transition-colors cursor-pointer"
            >
              <td className="px-6 py-4">
                <Link href={`/dashboard/leads/${lead.id}`} className="block">
                  <div className="text-[#fafafa] font-medium group-hover:text-[#a78bfa] transition-colors">
                    {lead.companyName}
                  </div>
                  <div className="text-sm text-[#a1a1aa]">{lead.contactPerson}</div>
                </Link>
              </td>
              <td className="px-6 py-4">
                <div className="text-[#fafafa] text-sm">{lead.email || "-"}</div>
                <div className="text-sm text-[#a1a1aa]">{lead.phone || "-"}</div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={lead.status} />
              </td>
              {showFinancials && (
                <td className="px-6 py-4 text-right text-[#34d399] font-medium">
                  {lead.potentialValue ? `${lead.potentialValue.toLocaleString()} PLN` : "-"}
                </td>
              )}
              <td className="px-6 py-4">
                {lead.assignee ? (
                  <div className="flex items-center gap-2">
                    {lead.assignee.image ? (
                      <img src={lead.assignee.image} className="w-6 h-6 rounded-full" alt="" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#1a1a1c] flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-[#a1a1aa]" />
                      </div>
                    )}
                    <span className="text-[#fafafa] text-sm">{lead.assignee.name || lead.assignee.email}</span>
                  </div>
                ) : (
                  <span className="text-[#52525b] text-sm italic">Brak</span>
                )}
              </td>
              <td className="px-6 py-4 text-right text-[#a1a1aa] text-sm">
                {new Date(lead.createdAt).toLocaleDateString("pl-PL")}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 hover:bg-[#1a1a1c] rounded-lg transition-colors text-[#a1a1aa] hover:text-[#fafafa]">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <span className={`px-2 py-1 rounded text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
}
