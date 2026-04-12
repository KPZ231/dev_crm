import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDocuments } from "@/lib/actions/documents";
import { DocumentsTable } from "@/app/components/documents/DocumentsTable";
import { 
    FileText, 
    Plus, 
    Layout, 
    Search
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
  searchParams: { type?: string; status?: string; search?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return null;

  const documents = await getDocuments(membership.workspaceId, {
    type: searchParams.type as DocumentType,
    status: searchParams.status as DocumentStatus,
    search: searchParams.search
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
          <p className="text-[#52525b] text-sm">Zarządzaj ofertami, umowami i briefami w jednym miejscu</p>
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

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-2">
        <div className="flex flex-wrap items-center gap-3">
             <FilterItem label="Wszystkie" active={!searchParams.type} href="/dashboard/documents" />
             <FilterItem label="Oferty" active={searchParams.type === 'OFFER'} href="/dashboard/documents?type=OFFER" />
             <FilterItem label="Umowy" active={searchParams.type === 'CONTRACT'} href="/dashboard/documents?type=CONTRACT" />
             <FilterItem label="Briefy" active={searchParams.type === 'BRIEF'} href="/dashboard/documents?type=BRIEF" />
        </div>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
            <input 
                placeholder="Szukaj dokumentu..."
                className="bg-[#0c0c0f] border border-[#27272a] rounded-xl pl-10 pr-4 py-2 text-xs text-[#fafafa] focus:border-[#a78bfa] transition-all outline-none"
            />
        </div>
      </div>

      <DocumentsTable documents={documents} />
    </div>
  );
}

function FilterItem({ label, active, href }: { label: string; active: boolean; href: string }) {
    return (
        <Link 
            href={href}
            className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest border transition-all ${
                active 
                    ? 'bg-[#a78bfa] border-[#a78bfa] text-[#09090b]' 
                    : 'bg-[#0c0c0f] border-[#27272a] text-[#52525b] hover:text-[#a1a1aa]'
            }`}
        >
            {label}
        </Link>
    );
}
