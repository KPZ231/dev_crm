"use server";

import { prisma } from "@/lib/prisma";
import { requireWorkspacePermission } from "@/core/access/workspace";
import { CostWithProject, CostsKPIs, ProjectCostSummaryData, CategoryBreakdown } from "@/lib/types/cost";
import { costSchema } from "@/lib/schemas/cost";
import { CostCategory, CostType } from "@prisma/client";
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { revalidatePath } from "next/cache";

export async function getCosts(workspaceId: string, filters?: any): Promise<CostWithProject[]> {
  const { role, user } = await requireWorkspacePermission(workspaceId, "read", "cost");

  const costs = await prisma.cost.findMany({
    where: {
      workspaceId,
      ...(role === "DEVELOPER" ? { projectId: { not: null } } : {}),
      ...(filters?.projectId && { projectId: filters.projectId }),
      ...(filters?.category && { category: filters.category })
    },
    include: {
      project: { select: { id: true, name: true } }
    },
    orderBy: { date: "desc" }
  });

  return costs.map(c => ({
    ...c,
    amount: Number(c.amount)
  }));
}

export async function createCost(workspaceId: string, data: any) {
  await requireWorkspacePermission(workspaceId, "create", "cost");
  
  const validated = costSchema.parse(data);

  const cost = await prisma.cost.create({
    data: {
      ...validated,
      workspaceId
    }
  });

  revalidatePath("/dashboard/costs");
  return {
    ...cost,
    amount: Number(cost.amount)
  };
}

export async function getCostsKPIs(workspaceId: string): Promise<CostsKPIs> {
  await requireWorkspacePermission(workspaceId, "read", "cost");

  const now = new Date();
  const [fixedMonthlyResult, yearCostsResult, yearRevenueResult] = await Promise.all([
    // Current month fixed costs
    prisma.cost.aggregate({
      where: { 
        workspaceId, 
        type: "FIXED", 
        date: { gte: startOfMonth(now), lte: endOfMonth(now) } 
      },
      _sum: { amount: true }
    }),
    // All costs this year
    prisma.cost.aggregate({
      where: { 
        workspaceId, 
        date: { gte: startOfYear(now), lte: endOfYear(now) } 
      },
      _sum: { amount: true }
    }),
    // All revenue this year (issued invoices)
    prisma.invoice.aggregate({
      where: { 
        workspaceId, 
        status: { not: "CANCELLED" }, 
        createdAt: { gte: startOfYear(now), lte: endOfYear(now) } 
      },
      _sum: { amount: true }
    })
  ]);

  const monthlyFixed = Number(fixedMonthlyResult._sum.amount || 0);
  const yearTotalCosts = Number(yearCostsResult._sum.amount || 0);
  const yearTotalRevenue = Number(yearRevenueResult._sum.amount || 0);

  return {
    fixedMonthlyCosts: monthlyFixed,
    variableYtd: yearTotalCosts - monthlyFixed,
    totalCosts: yearTotalCosts,
    totalRevenue: yearTotalRevenue,
    grossMargin: yearTotalRevenue === 0 ? 0 : ((yearTotalRevenue - yearTotalCosts) / yearTotalRevenue) * 100
  };
}

export async function getProjectCostSummary(workspaceId: string, projectId: string): Promise<ProjectCostSummaryData> {
  await requireWorkspacePermission(workspaceId, "read", "cost");

  const project = await prisma.project.findUnique({
    where: { id: projectId, workspaceId },
    include: { costs: true }
  });

  if (!project) throw new Error("Project not found");

  const totalCosts = project.costs.reduce((sum, c) => sum + Number(c.amount), 0);
  
  const categories: CostCategory[] = ["DEV", "DESIGN", "MARKETING", "TOOLS", "INFRASTRUCTURE", "OUTSOURCING", "OTHER"];
  const breakdown: CategoryBreakdown[] = categories.map(cat => {
    const amount = project.costs.filter(c => c.category === cat).reduce((sum, c) => sum + Number(c.amount), 0);
    return {
      category: cat,
      amount,
      percentage: totalCosts === 0 ? 0 : (amount / totalCosts) * 100
    };
  });

  const budgetNum = Number(project.budget || 0);

  return {
    projectId,
    projectName: project.name,
    totalBudget: budgetNum,
    totalCosts,
    margin: budgetNum - totalCosts,
    progress: budgetNum > 0 ? (totalCosts / budgetNum) * 100 : 0,
    breakdown
  };
}

export async function getCostBreakdown(workspaceId: string): Promise<CategoryBreakdown[]> {
    await requireWorkspacePermission(workspaceId, "read", "cost");
    
    const costs = await prisma.cost.findMany({ where: { workspaceId } });
    const total = costs.reduce((sum, c) => sum + Number(c.amount), 0);

    const categories: CostCategory[] = ["DEV", "DESIGN", "MARKETING", "TOOLS", "INFRASTRUCTURE", "OUTSOURCING", "OTHER"];
    return categories.map(cat => {
        const amount = costs.filter(c => c.category === cat).reduce((sum, c) => sum + Number(c.amount), 0);
        return {
            category: cat,
            amount,
            percentage: total === 0 ? 0 : (amount / total) * 100
        };
    });
}
