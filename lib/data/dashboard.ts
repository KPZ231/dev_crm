import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { canViewFinancials } from "@/lib/permissions";
import { WorkspaceRole } from "@prisma/client";

/**
 * Shared workspace context fetcher.
 * Memoized per request using React cache (implicitly by Next.js in Server Components).
 */
async function getAuthContext() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true, role: true }
  });

  if (!member) return null;

  return {
    userId: session.user.id,
    workspaceId: member.workspaceId,
    role: member.role,
  };
}

/**
 * Fetches dashboard statistics with multi-layer caching.
 * Keyed by workspaceId and user role (for financial visibility).
 */
export async function getCachedDashboardStats() {
  const context = await getAuthContext();
  if (!context) return null;

  const { workspaceId, role } = context;
  const showFinancials = canViewFinancials(role);

  return unstable_cache(
    async () => {
      const [totalLeads, newLeads, totalPotentialValue, recentLeads] = await Promise.all([
        prisma.lead.count({ where: { workspaceId } }),
        prisma.lead.count({ 
          where: { 
            workspaceId, 
            createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } 
          } 
        }),
        showFinancials 
          ? prisma.lead.aggregate({ 
              where: { workspaceId }, 
              _sum: { potentialValue: true },
              cacheStrategy: { ttl: 60, swr: 60 } // Prisma Accelerate SWR
            })
          : Promise.resolve({ _sum: { potentialValue: 0 } }),
        prisma.lead.findMany({
          where: { workspaceId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            status: true,
            potentialValue: showFinancials, // Only fetch if allowed
            createdAt: true,
          },
          cacheStrategy: { ttl: 30, swr: 30 }
        })
      ]);

      return {
        totalLeads,
        newLeads,
        totalPotentialValue: (totalPotentialValue._sum?.potentialValue || 0) as number,
        recentLeads,
        showFinancials
      };
    },
    [`dashboard-stats-${workspaceId}-${role}`],
    {
      revalidate: 60, // 1 minute background revalidation
      tags: ["stats", `workspace-${workspaceId}`, "leads"]
    }
  )();
}

/**
 * Fetches user workspaces with caching.
 */
export async function getCachedWorkspaces() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  return unstable_cache(
    async () => {
      return prisma.workspace.findMany({
        where: {
          members: { some: { userId } }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { members: true } }
        },
        orderBy: { updatedAt: "desc" },
        cacheStrategy: { ttl: 300, swr: 600 }
      });
    },
    [`user-workspaces-${userId}`],
    {
      revalidate: 3600, // Long TTL for workspace list
      tags: [`user-${userId}-workspaces`, "workspaces"]
    }
  )();
}
