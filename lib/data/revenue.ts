import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { canViewRevenue } from "@/lib/permissions";
import { startOfYear, endOfYear, startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter } from "date-fns";

/**
 * Shared workspace context fetcher.
 */
async function getAuthContext() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true, role: true }
  });

  if (!member) return null;

  return { workspaceId: member.workspaceId, role: member.role };
}

/**
 * Fetches revenue KPIs with caching.
 */
export async function getCachedRevenueKPIs() {
  const context = await getAuthContext();
  if (!context) return null;

  const { workspaceId, role } = context;
  if (!canViewRevenue(role)) return null;

  return unstable_cache(
    async () => {
      const now = new Date();
      const startOfThisMonth = startOfMonth(now);
      const endOfThisMonth = endOfMonth(now);
      const startOfPrevMonth = startOfMonth(subMonths(now, 1));
      const endOfPrevMonth = endOfMonth(subMonths(now, 1));
      const startOfThisYear = startOfYear(now);

      const [thisMonthInvoices, prevMonthInvoices, yearPaidInvoices, overdueInvoices] = await Promise.all([
        prisma.invoice.findMany({
          where: { workspaceId, createdAt: { gte: startOfThisMonth, lte: endOfThisMonth }, status: { not: "CANCELLED" } },
          select: { amount: true }
        }),
        prisma.invoice.findMany({
          where: { workspaceId, createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth }, status: { not: "CANCELLED" } },
          select: { amount: true }
        }),
        prisma.invoice.findMany({
          where: { workspaceId, createdAt: { gte: startOfThisYear }, status: "PAID" },
          select: { amount: true }
        }),
        prisma.invoice.findMany({
          where: { workspaceId, dueDate: { lt: now }, status: { notIn: ["PAID", "CANCELLED"] } },
          select: { amount: true }
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
    },
    [`revenue-kpis-${workspaceId}`],
    {
      revalidate: 300, // 5 minutes revalidation
      tags: ["revenue", "stats", `workspace-${workspaceId}`]
    }
  )();
}

/**
 * Fetches revenue chart data with caching.
 */
export async function getCachedRevenueData(year: number) {
  const context = await getAuthContext();
  if (!context) return [];

  const { workspaceId, role } = context;
  if (!canViewRevenue(role)) return [];

  return unstable_cache(
    async () => {
      const startDate = startOfYear(new Date(year, 0, 1));
      const endDate = endOfYear(new Date(year, 11, 31));

      const invoices = await prisma.invoice.findMany({
        where: {
          workspaceId,
          createdAt: { gte: startDate, lte: endDate },
          status: { not: "CANCELLED" }
        },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: "asc" },
        cacheStrategy: { ttl: 60 * 60, swr: 60 * 30 } // 1 hour TTL for historical data
      });

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.map((m, i) => {
        const monthInvoices = invoices.filter(inv => inv.createdAt.getMonth() === i);
        return {
          label: m,
          revenue: monthInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
          count: monthInvoices.length,
          date: new Date(year, i, 1)
        };
      });
    },
    [`revenue-chart-${workspaceId}-${year}`],
    {
      revalidate: 3600,
      tags: ["revenue", `workspace-${workspaceId}`]
    }
  )();
}
