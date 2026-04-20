import { Metadata } from "next";
import { getCachedLeads } from "@/lib/data/leads";
import { LeadsListPageClient } from "./LeadsListPageClient";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import { canManageLeads, canViewFinancials } from "@/lib/permissions";
import { LeadWithAssignee } from "@/lib/types/lead";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Leads | CRM",
  description: "Zarządzaj swoimi leadami",
};

export default async function LeadsPage(props: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id) return null;

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { role: true }
  });

  if (!member) return null;

  const { leads } = await getCachedLeads({
    search: searchParams.search,
    status: searchParams.status,
    page: searchParams.page ? parseInt(searchParams.page) : 1
  });
  
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

      <LeadsListPageClient 
        leads={leads as LeadWithAssignee[]} 
        showFinancials={showFinancials} 
        searchParams={searchParams}
      />
    </div>
  );
}

