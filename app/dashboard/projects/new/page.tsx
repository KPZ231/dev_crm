import { ProjectForm } from "@/components/projects/ProjectForm";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "New Project | CRM",
};

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
    <div className="flex flex-col h-full bg-[#09090b] overflow-auto">
      <div className="p-6 border-b border-[#27272a]">
        <Link 
          href="/dashboard/projects"
          className="inline-flex items-center text-sm text-[#a1a1aa] hover:text-[#fafafa] mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Create New Project</h1>
        <p className="text-[#a1a1aa] text-sm mt-1">Add a new project to your workspace.</p>
      </div>

      <div className="p-6 max-w-4xl">
        <ProjectForm clients={clients} />
      </div>
    </div>
  );
}
