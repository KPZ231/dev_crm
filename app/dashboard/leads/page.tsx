import { Metadata } from "next";
import { getLeads } from "@/lib/actions/leads";
import { LeadTable } from "@/app/components/leads/LeadTable";
import { LeadFilters } from "@/app/components/leads/LeadFilters";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { canManageLeads, canViewFinancials } from "@/lib/permissions";
import { LeadWithAssignee } from "@/lib/types/lead";

export const metadata: Metadata = {
  title: "Leads | CRM",
  description: "Zarządzaj swoimi leadami",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!member) return null;

  const leads = await getLeads(searchParams);
  const showFinancials = canViewFinancials(member.role);
  const canCreate = canManageLeads(member.role);

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Leads</h1>
          <p className="text-[#a1a1aa] text-sm">Przeglądaj i zarządzaj potencjalnymi klientami</p>
        </div>
        
        {canCreate && (
          <Link
            href="/dashboard/leads/new"
            className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-semibold px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Nowy Lead
          </Link>
        )}
      </div>

      <LeadFilters 
        initialSearch={searchParams.search} 
        initialStatus={searchParams.status} 
      />

      <div className="flex-grow overflow-auto">
        <LeadTable leads={leads as LeadWithAssignee[]} showFinancials={showFinancials} />
      </div>
    </div>
  );
}
