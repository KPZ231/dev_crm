import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTemplates } from "@/lib/actions/documents";
import { TemplatesManager } from "@/app/components/documents/TemplatesManager";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) return null;

  const templates = await getTemplates(membership.workspaceId);

  return (
    <div className="p-8 lg:p-12 space-y-10">
      <div className="flex items-center gap-4 text-[#52525b]">
        <Link href="/dashboard/documents" className="flex items-center gap-1 hover:text-[#a78bfa] transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" /> Powrót do dokumentów
        </Link>
      </div>

      <TemplatesManager workspaceId={membership.workspaceId} templates={templates} />
    </div>
  );
}
