import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTemplates } from "@/lib/actions/documents";
import { DocumentNewWizard } from "./DocumentNewWizard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NewDocumentPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return null;

  const templates = await getTemplates(membership.workspaceId);
  const clients = await prisma.client.findMany({ where: { workspaceId: membership.workspaceId }, select: { id: true, companyName: true } });
  const leads = await prisma.lead.findMany({ where: { workspaceId: membership.workspaceId }, select: { id: true, companyName: true } });

  return (
    <div className="p-8 lg:p-12 space-y-10">
      <div className="flex items-center gap-4 text-[#52525b]">
        <Link href="/dashboard/documents" className="flex items-center gap-1 hover:text-[#a78bfa] transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" /> Anuluj
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#fafafa] mb-8">Nowy Dokument</h1>
        <DocumentNewWizard 
            templates={templates} 
            clients={clients} 
            leads={leads} 
            workspaceId={membership.workspaceId}
            userRole={membership.role}
        />
      </div>
    </div>
  );
}
