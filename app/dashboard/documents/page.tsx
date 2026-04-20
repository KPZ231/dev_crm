import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDocuments } from "@/lib/actions/documents";
import { DocumentsTable } from "@/app/components/documents/DocumentsTable";
import { DocumentFilters } from "@/app/components/documents/DocumentFilters";
import { 
    FileText, 
    Plus, 
    Layout, 
} from "lucide-react";
import Link from "next/link";
import { DocumentType, DocumentStatus } from "@prisma/client";

export const metadata = {
  title: "Documents | CRM",
  description: "Zarządzanie ofertami, umowami i dokumentacją",
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currentSearchParams = await searchParams;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return null;

  const documents = await getDocuments(membership.workspaceId, {
    type: currentSearchParams.type as DocumentType,
    status: currentSearchParams.status as DocumentStatus,
    search: currentSearchParams.search
  });

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-[#a78bfa] text-xs font-bold uppercase tracking-widest mb-2">
            <FileText className="w-4 h-4" />
            Workspace Assets
          </div>
          <h1 className="text-4xl font-bold text-[#fafafa] tracking-tight">Dokumenty</h1>
          <p className="text-[#52525b] text-sm">Zarządzaj ofertami, umowami, protokołami i briefami</p>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/documents/templates"
            className="flex items-center gap-2 bg-[#141416] border border-[#27272a] hover:border-[#a78bfa]/40 text-[#a1a1aa] hover:text-[#fafafa] px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <Layout className="w-4 h-4" /> Szablony
          </Link>
          <Link 
             href="/dashboard/documents/new"
             className="flex items-center gap-2 bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#09090b] font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" /> Nowy Dokument
          </Link>
        </div>
      </div>

      <DocumentFilters 
        initialSearch={currentSearchParams.search} 
        initialType={currentSearchParams.type} 
      />

      <DocumentsTable documents={documents} />
    </div>
  );
}
