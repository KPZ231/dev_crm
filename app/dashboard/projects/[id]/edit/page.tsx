import { getProjectById } from "@/lib/actions/projects";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Edit Project | CRM",
};

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!member) return null;

  const [projectResult, clients] = await Promise.all([
    getProjectById(params.id),
    prisma.client.findMany({
      where: { workspaceId: member.workspaceId },
      select: { id: true, companyName: true }
    })
  ]);

  if (!projectResult.success || !projectResult.project) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b] overflow-auto">
      <div className="p-6 border-b border-[#27272a]">
        <Link 
          href={`/dashboard/projects/${params.id}`}
          className="inline-flex items-center text-sm text-[#a1a1aa] hover:text-[#fafafa] mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Project
        </Link>
        <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Edit Project</h1>
        <p className="text-[#a1a1aa] text-sm mt-1">Update details for {projectResult.project.name}.</p>
      </div>

      <div className="p-6 max-w-4xl">
        <ProjectForm initialData={projectResult.project as any} clients={clients} />
      </div>
    </div>
  );
}
