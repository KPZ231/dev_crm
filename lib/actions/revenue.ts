"use server";

import { prisma } from "@/lib/prisma";
import { requireWorkspacePermission } from "@/core/access/workspace";
import { PeriodType, RevenueDataPoint, RevenueKPIs, RevenueComparison, InvoiceWithClient, InvoiceFilters } from "@/lib/types/revenue";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, format, startOfQuarter, endOfQuarter } from "date-fns";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getRevenueData(workspaceId: string, period: PeriodType, year: number): Promise<RevenueDataPoint[]> {
  const { user } = await requireWorkspacePermission(workspaceId, "read", "revenue");

  // Audit log
  await prisma.auditLog.create({
    data: {
      workspaceId,
      actorId: user.id,
      action: "revenue.view_chart",
      entityType: "Revenue",
      metadata: { period, year }
    }
  });

  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 11, 31));

  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      createdAt: { gte: startDate, lte: endDate },
      status: { not: "CANCELLED" }
    },
    orderBy: { createdAt: "asc" }
  });

  // Aggregation logic
  const data: RevenueDataPoint[] = [];

  if (period === "monthly") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach((m, i) => {
      const monthInvoices = invoices.filter(inv => inv.createdAt.getMonth() === i);
      data.push({
        label: m,
        revenue: monthInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
        count: monthInvoices.length,
        date: new Date(year, i, 1)
      });
    });
  } else if (period === "quarterly") {
    [0, 1, 2, 3].forEach(q => {
      const qInvoices = invoices.filter(inv => {
        const month = inv.createdAt.getMonth();
        return month >= q * 3 && month < (q + 1) * 3;
      });
      data.push({
        label: `Q${q + 1}`,
        revenue: qInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
        count: qInvoices.length,
        date: new Date(year, q * 3, 1)
      });
    });
  } else {
    data.push({
      label: year.toString(),
      revenue: invoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
      count: invoices.length,
      date: new Date(year, 0, 1)
    });
  }

  return data;
}

export async function getRevenueKPIs(workspaceId: string): Promise<RevenueKPIs> {
  await requireWorkspacePermission(workspaceId, "read", "revenue");

  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);
  const startOfPrevMonth = startOfMonth(subMonths(now, 1));
  const endOfPrevMonth = endOfMonth(subMonths(now, 1));
  const startOfThisYear = startOfYear(now);

  const [thisMonthInvoices, prevMonthInvoices, yearPaidInvoices, overdueInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: { workspaceId, createdAt: { gte: startOfThisMonth, lte: endOfThisMonth }, status: { not: "CANCELLED" } }
    }),
    prisma.invoice.findMany({
      where: { workspaceId, createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth }, status: { not: "CANCELLED" } }
    }),
    prisma.invoice.findMany({
      where: { workspaceId, createdAt: { gte: startOfThisYear }, status: "PAID" }
    }),
    prisma.invoice.findMany({
      where: { workspaceId, dueDate: { lt: now }, status: { notIn: ["PAID", "CANCELLED"] } }
    })
  ]);

  const currentMonthRevenue = thisMonthInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const prevMonthRevenue = prevMonthInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const growth = prevMonthRevenue === 0 ? 100 : ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;

  return {
    mrr: currentMonthRevenue,
    currentMonthRevenue,
    overdueInvoicesAmount: overdueInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
    paidYtd: yearPaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
    growth
  };
}

export async function getRevenueComparison(workspaceId: string, period: PeriodType): Promise<RevenueComparison> {
  await requireWorkspacePermission(workspaceId, "read", "revenue");

  const now = new Date();
  let currentStart, currentEnd, prevStart, prevEnd;

  if (period === "monthly") {
    currentStart = startOfMonth(now);
    currentEnd = endOfMonth(now);
    prevStart = startOfMonth(subMonths(now, 1));
    prevEnd = endOfMonth(subMonths(now, 1));
  } else if (period === "quarterly") {
    currentStart = startOfQuarter(now);
    currentEnd = endOfQuarter(now);
    prevStart = startOfQuarter(subMonths(now, 3));
    prevEnd = endOfQuarter(subMonths(now, 3));
  } else {
    currentStart = startOfYear(now);
    currentEnd = endOfYear(now);
    prevStart = startOfYear(subYears(now, 1));
    prevEnd = endOfYear(subYears(now, 1));
  }

  const [currentInvoices, prevInvoices] = await Promise.all([
    prisma.invoice.findMany({ where: { workspaceId, createdAt: { gte: currentStart, lte: currentEnd }, status: { not: "CANCELLED" } } }),
    prisma.invoice.findMany({ where: { workspaceId, createdAt: { gte: prevStart, lte: prevEnd }, status: { not: "CANCELLED" } } })
  ]);

  const currentTotal = currentInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const prevTotal = prevInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

  // For monthly best/worst, we look at the last 12 months
  const yearlyInvoices = await prisma.invoice.findMany({
    where: { 
      workspaceId, 
      createdAt: { gte: startOfYear(now), lte: endOfYear(now) },
      status: { not: "CANCELLED" }
    }
  });

  const monthStats = Array.from({ length: 12 }).map((_, i) => {
    const revenue = yearlyInvoices
      .filter(inv => inv.createdAt.getMonth() === i)
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    return { label: format(new Date(2024, i, 1), "MMMM"), value: revenue };
  });

  const sortedStats = [...monthStats].filter(s => s.value > 0).sort((a, b) => b.value - a.value);

  return {
    currentPeriodTotal: currentTotal,
    previousPeriodTotal: prevTotal,
    difference: currentTotal - prevTotal,
    percentageChange: prevTotal === 0 ? 100 : ((currentTotal - prevTotal) / prevTotal) * 100,
    bestMonth: sortedStats[0] || { label: "N/A", value: 0 },
    worstMonth: sortedStats[sortedStats.length - 1] || { label: "N/A", value: 0 }
  };
}

export async function getInvoiceList(workspaceId: string, filters: InvoiceFilters): Promise<InvoiceWithClient[]> {
  await requireWorkspacePermission(workspaceId, "read", "revenue");

  const { status, clientId, search } = filters;

  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      ...(status && { status }),
      ...(clientId && { clientId }),
      ...(search && {
        OR: [
          { number: { contains: search, mode: "insensitive" } },
          { client: { companyName: { contains: search, mode: "insensitive" } } }
        ]
      })
    },
    include: {
      client: {
        select: { id: true, companyName: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return invoices.map(inv => ({
    ...inv,
    amount: Number(inv.amount)
  })) as InvoiceWithClient[];
}

export async function getInvoiceFormOptions(workspaceId: string) {
  await requireWorkspacePermission(workspaceId, "read", "revenue");

  const clients = await prisma.client.findMany({
    where: { workspaceId },
    select: { id: true, companyName: true }
  });

  return { clients };
}

export async function createInvoice(workspaceId: string, data: any) {
  const { user } = await requireWorkspacePermission(workspaceId, "create", "revenue");
  
  // Basic validation without importing the full schema to avoid circular deps if they occur
  // But here it should be fine.
  const invoice = await prisma.invoice.create({
    data: {
      workspaceId,
      clientId: data.clientId,
      number: data.number,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      status: data.status || "DRAFT",
    }
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      workspaceId,
      actorId: user.id,
      action: "invoice.created",
      entityType: "Invoice",
      entityId: invoice.id,
      metadata: { number: invoice.number, amount: Number(invoice.amount) }
    }
  });

  revalidateTag("revenue");
  revalidateTag("stats");
  revalidateTag(`workspace-${workspaceId}`);
  revalidatePath("/dashboard/revenue");
  revalidatePath("/dashboard/costs");
  return {
    ...invoice,
    amount: Number(invoice.amount)
  };
}
