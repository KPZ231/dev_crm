import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProjectCostSummary, getCosts } from "@/lib/actions/costs";
import { ProjectCostSummary } from "@/app/components/costs/ProjectCostSummary";
import { CostsTable } from "@/app/components/costs/CostsTable";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft, Target } from "lucide-react";
import Link from "next/link";

export default async function ProjectCostsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership || membership.role === "SALES") {
    redirect("/dashboard");
  }

  const workspaceId = membership.workspaceId;

  const [summary, costs] = await Promise.all([
    getProjectCostSummary(workspaceId, projectId),
    getCosts(workspaceId, { projectId: projectId })
  ]);

  if (!summary) notFound();

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 text-[#52525b]">
        <Link href="/dashboard/costs" className="flex items-center gap-1 hover:text-[#a78bfa] transition-colors text-sm font-bold">
          <ChevronLeft className="w-5 h-5" /> Powrót do ogółu
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-[#a78bfa] text-xs font-bold uppercase tracking-widest mb-2">
            <Target className="w-4 h-4" />
            Project finances
          </div>
          <h1 className="text-4xl font-bold text-[#fafafa] tracking-tight">{summary.projectName}</h1>
          <p className="text-[#52525b] text-sm">Szczegółowa analityka kosztów dla wybranego projektu</p>
        </div>
      </div>

      <ProjectCostSummary summary={summary} />

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#fafafa] px-2">Koszty przypisane do projektu</h2>
        <CostsTable costs={costs} />
      </div>
    </div>
  );
}
