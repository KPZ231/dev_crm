import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCosts, getCostsKPIs, getCostBreakdown } from "@/lib/actions/costs";
import { CostsKpiRow } from "@/app/components/costs/CostsKpiRow";
import { CostsChart } from "@/app/components/costs/CostsChart";
import { CostsTable } from "@/app/components/costs/CostsTable";
import { CostFormDialog } from "@/app/components/costs/CostFormDialog";
import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";

export const metadata = {
  title: "Costs Management | CRM",
  description: "Zarządzanie kosztami operacyjnymi i projektowymi",
};

export default async function CostsPage({
  searchParams,
}: {
  searchParams: { category?: string; projectId?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership || membership.role === "SALES") {
    redirect("/dashboard");
  }

  const workspaceId = membership.workspaceId;

  // Fetch data in parallel
  const [costs, kpis, breakdown, projects] = await Promise.all([
    getCosts(workspaceId, { category: searchParams.category, projectId: searchParams.projectId }),
    getCostsKPIs(workspaceId),
    getCostBreakdown(workspaceId),
    prisma.project.findMany({ where: { workspaceId }, select: { id: true, name: true } })
  ]);

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-[#a78bfa] text-xs font-bold uppercase tracking-widest mb-2">
            <Wallet className="w-4 h-4" />
            Financial control
          </div>
          <h1 className="text-4xl font-bold text-[#fafafa] tracking-tight">Koszty</h1>
          <p className="text-[#52525b] text-sm">Monitoring wydatków operacyjnych i projektowych</p>
        </div>

        <div>
            <CostFormDialog workspaceId={workspaceId} projects={projects} />
        </div>
      </div>

      <CostsKpiRow kpis={kpis} />

      <div className="grid grid-cols-1 gap-12">
        <CostsChart breakdown={breakdown} />

        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#fafafa] px-2">Historia wydatków</h2>
            <CostsTable costs={costs} />
        </div>
      </div>
    </div>
  );
}
