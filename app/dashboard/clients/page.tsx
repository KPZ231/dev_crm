import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClients } from "@/lib/actions/clients";
import { canManageClients } from "@/lib/permissions";
import { ClientsListPageClient } from "./ClientsListPageClient";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { ClientStatus, PaymentStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Klienci | CRM",
  description: "Zarządzaj bazą klientów i relacjami",
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { 
    search?: string; 
    status?: string; 
    paymentStatus?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Get active workspace for the user
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true }
  });

  if (!membership) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6 bg-[#09090b]">
        <div className="w-20 h-20 bg-[#0c0c0f] border border-[#27272a] rounded-2xl flex items-center justify-center">
            <Building2 className="w-10 h-10 text-[#52525b]" />
        </div>
        <div className="space-y-2 max-w-md">
            <h1 className="text-2xl font-bold text-[#fafafa]">Brak dostępu</h1>
            <p className="text-[#a1a1aa]">Nie przypisano Cię do żadnego workspace&apos;u. Skontaktuj się z administratorem.</p>
        </div>
      </div>
    );
  }

  const workspaceId = membership.workspaceId;
  const clients = await getClients(workspaceId, {
    search: searchParams.search,
    status: searchParams.status as ClientStatus,
    paymentStatus: searchParams.paymentStatus as PaymentStatus,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder as "asc" | "desc",
  });

  const canCreate = canManageClients(membership.role);

  return (
    <div className="flex flex-col h-full bg-[#09090b] min-h-screen">
      <div className="p-8 border-b border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0c0c0f]/30">
        <div>
          <h1 className="text-3xl font-bold text-[#fafafa] tracking-tight">Klienci</h1>
          <p className="text-[#a1a1aa] text-sm mt-1">
            Zarządzaj bazą firm ({clients.length}), kontraktami i płatnościami w {membership.workspace.name}
          </p>
        </div>
        
        {canCreate && (
          <Link
            href="/dashboard/clients/new"
            className="flex items-center justify-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-[#a78bfa]/10"
          >
            <Plus className="w-4 h-4" />
            Dodaj Klienta
          </Link>
        )}
      </div>

      <ClientsListPageClient 
        clients={clients} 
        searchParams={searchParams} 
      />
    </div>
  );
}
