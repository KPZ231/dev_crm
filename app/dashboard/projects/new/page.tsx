import { ProjectForm } from "@/components/projects/ProjectForm";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "New Project | CRM",
};

import { Suspense } from "react";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!member) return null;

  const clients = await prisma.client.findMany({
    where: { workspaceId: member.workspaceId },
    select: { id: true, companyName: true }
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <div className="p-8 border-b border-[#27272a] bg-[#0c0c0f]/30">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link href="/dashboard/projects" className="flex items-center gap-1 text-[#52525b] hover:text-[#a78bfa] transition-colors text-sm w-fit">
            <ChevronLeft className="w-4 h-4" /> Powrót do projektów
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#fafafa] tracking-tight">Nowy Projekt</h1>
            <p className="text-[#a1a1aa] text-sm mt-1">Zdefiniuj parametry projektu i przypisz go do klienta</p>
          </div>
        </div>
      </div>

      <div className="p-8 pb-20">
        <div className="max-w-4xl mx-auto bg-[#0c0c0f] border border-[#27272a] rounded-2xl p-8 shadow-2xl">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#a78bfa] border-t-transparent rounded-full animate-spin" /></div>}>
            <ProjectForm clients={clients} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
