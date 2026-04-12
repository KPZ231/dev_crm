import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDocumentById } from "@/lib/actions/documents";
import { notFound } from "next/navigation";
import { DocumentDetailClient } from "./DocumentDetailClient";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return null;

  const document = await getDocumentById(membership.workspaceId, id);

  if (!document) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen bg-[#09090b]">
      {/* Header Bar */}
      <div className="bg-[#0c0c0f] border-b border-[#27272a] p-4 lg:px-8 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <Link href="/dashboard/documents" className="p-2 bg-[#141416] border border-[#27272a] rounded-lg text-[#52525b] hover:text-[#fafafa] transition-all">
                <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
                <h1 className="text-sm font-bold text-[#fafafa]">{document.name}</h1>
                <p className="text-[10px] text-[#52525b] uppercase tracking-widest">{document.type} • {document.status}</p>
            </div>
         </div>
      </div>

      {/* Editor/Client Component */}
      <div className="flex-grow overflow-hidden">
        <DocumentDetailClient document={document} workspaceId={membership.workspaceId} />
      </div>
    </div>
  );
}
