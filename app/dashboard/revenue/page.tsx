import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { canViewRevenue } from "@/lib/permissions";
import { getInvoiceList, getRevenueComparison } from "@/lib/actions/revenue";
import { getCachedRevenueData, getCachedRevenueKPIs } from "@/lib/data/revenue";
import { RevenueKpiRow } from "@/app/components/revenue/RevenueKpiRow";
import { RevenueChart } from "@/app/components/revenue/RevenueChart";
import { RevenueComparisonRow } from "@/app/components/revenue/RevenueComparison";
import { InvoiceTable } from "@/app/components/revenue/InvoiceTable";
import { PeriodType } from "@/lib/types/revenue";
import { RevenuePeriodToggle } from "./RevenuePeriodToggle";
import { NewInvoiceButton } from "@/app/components/revenue/NewInvoiceButton";
import { 
  BarChart3, 
  Layers, 
  Calendar as CalendarIcon,
} from "lucide-react";
import { InvoiceStatus } from "@prisma/client";

export const metadata = {
  title: "Revenue Analytics | CRM",
  description: "Analityka finansowa i zestawienia przychodów",
};

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: { period?: string; year?: string; status?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true, role: true }
  });

  if (!membership || !canViewRevenue(membership.role)) {
    redirect("/dashboard");
  }

  const period = (searchParams.period as PeriodType) || "monthly";
  const year = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear();
  const workspaceId = membership.workspaceId;

  // Optimized data fetching using the new data layer and parallel execution
  const [data, kpis, comparison, invoices] = await Promise.all([
    getCachedRevenueData(year),
    getCachedRevenueKPIs(),
    getRevenueComparison(workspaceId, period),
    getInvoiceList(workspaceId, { status: searchParams.status as InvoiceStatus })
  ]);


  return (
    <div className="p-8 lg:p-12 bg-[#09090b] min-h-screen space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#a78bfa] text-xs font-bold uppercase tracking-widest mb-2">
            <BarChart3 className="w-4 h-4" />
            Financial Intelligence
          </div>
          <h1 className="text-4xl font-bold text-[#fafafa] tracking-tight">Revenue Analytics</h1>
          <p className="text-[#52525b] text-sm">Przegląd efektywności finansowej workspace&apos;u w czasie rzeczywistym</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <RevenuePeriodToggle currentPeriod={period} />
          <div className="h-10 w-px bg-[#27272a] hidden sm:block" />
          <button className="flex items-center gap-2 bg-[#141416] border border-[#27272a] hover:border-[#a78bfa]/50 text-[#a1a1aa] hover:text-[#fafafa] px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
            <CalendarIcon className="w-4 h-4" />
            Rok {year}
          </button>
        </div>
      </div>

      {/* KPI Section */}
      {kpis && <RevenueKpiRow kpis={kpis} />}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 gap-12">
        {/* Chart */}
        <RevenueChart data={data} period={period} />

        {/* Comparison Section */}
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <Layers className="w-5 h-5 text-[#a78bfa]" />
                <h2 className="text-xl font-bold text-[#fafafa]">Performance Insights</h2>
            </div>
            <RevenueComparisonRow comparison={comparison} period={period} />
        </div>

        {/* Invoices List */}
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-[#a78bfa]" />
                    <h2 className="text-xl font-bold text-[#fafafa]">Recent Billings</h2>
                </div>
                <NewInvoiceButton workspaceId={workspaceId} />
            </div>
            <InvoiceTable invoices={invoices} />
        </div>
      </div>
    </div>
  );
}
