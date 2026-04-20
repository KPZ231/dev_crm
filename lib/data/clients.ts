import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { canViewClientFinancials } from "@/lib/permissions";
import { ClientStatus, PaymentStatus } from "@prisma/client";

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
 * Fetches clients list with caching.
 */
export async function getCachedClients(params: {
  search?: string;
  status?: string;
  paymentStatus?: string;
}) {
  const context = await getAuthContext();
  if (!context) return [];

  const { workspaceId, role } = context;
  const hasFinancialAccess = canViewClientFinancials(role);

  // Normalize params for cache key stability
  const searchKey = params.search?.trim().toLowerCase() || "all";
  const statusKey = params.status || "all";
  const paymentStatusKey = params.paymentStatus || "all";

  return unstable_cache(
    async () => {
      return prisma.client.findMany({
        where: {
          workspaceId,
          ...(params.search && {
            OR: [
              { companyName: { contains: params.search, mode: "insensitive" } },
              { contactPerson: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
              { nip: { contains: params.search, mode: "insensitive" } },
            ],
          }),
          ...(params.status && { status: params.status as ClientStatus }),
          ...(params.paymentStatus && { paymentStatus: params.paymentStatus as PaymentStatus }),
        },
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          email: true,
          phone: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              invoices: true,
              documents: true,
            },
          },
          invoices: hasFinancialAccess ? {
            select: { amount: true, status: true },
          } : { take: 0 },
          projects: {
            where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
        cacheStrategy: { ttl: 60, swr: 60 }
      });

      return clients.map(client => ({
        ...client,
        totalRevenue: hasFinancialAccess ? (client.invoices as any[]).reduce((acc, inv) => acc + Number(inv.amount), 0) : null,
        activeProjectsCount: client.projects.length,
        outstandingInvoicesCount: hasFinancialAccess ? (client.invoices as any[]).filter(inv => inv.status !== "PAID").length : null,
        invoices: undefined,
        projects: undefined,
      })) as any; // Escape hatch for complex composite types in cached results
    },
    ["clients-list", workspaceId, role, searchKey, statusKey, paymentStatusKey],
    {
      revalidate: 60,
      tags: ["clients", `workspace-${workspaceId}`]
    }
  )();
}

/**
 * Fetches client by ID with caching.
 */
export async function getCachedClientById(id: string) {
  const context = await getAuthContext();
  if (!context) return null;

  const { workspaceId, role } = context;
  const hasFinancialAccess = canViewClientFinancials(role);

  return unstable_cache(
    async () => {
      const client = await prisma.client.findUnique({
        where: { id, workspaceId },
        select: {
          id: true,
          companyName: true,
          nip: true,
          address: true,
          website: true,
          contactPerson: true,
          email: true,
          phone: true,
          industry: true,
          status: true,
          paymentStatus: true,
          contractedSince: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          activities: {
            select: {
              id: true,
              action: true,
              content: true,
              createdAt: true,
              actor: {
                select: { id: true, name: true, email: true, image: true }
              }
            },
            orderBy: { createdAt: "desc" },
            take: 10
          },
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
              budget: hasFinancialAccess,
              startDate: true,
              endDate: true
            },
            orderBy: { createdAt: "desc" }
          },
          invoices: hasFinancialAccess ? {
            select: {
              id: true,
              number: true,
              amount: true,
              status: true,
              dueDate: true
            },
            orderBy: { createdAt: "desc" },
            take: 5
          } : { take: 0 },
        },
        cacheStrategy: { ttl: 30, swr: 30 }
      });

      if (!client) return null;

      const clientData = client as any;

      return {
          ...client,
          // Systematic mapping for complex types
          projects: (client.projects as any[]).map(p => ({
              ...p,
              budget: p.budget ? Number(p.budget) : null
          })),
          invoices: hasFinancialAccess ? (client.invoices as any[]).map(inv => ({
              ...inv,
              amount: Number(inv.amount)
          })) : []
      } as any;

    },
    [`client-detail-${id}-${role}`],
    {
      revalidate: 60,
      tags: [`client-${id}`, "clients"]
    }
  )();
}
