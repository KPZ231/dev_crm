import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { canViewFinancials } from "@/lib/permissions";
import { LeadStatus } from "@prisma/client";

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
 * Fetches a list of leads with caching and pagination.
 */
export async function getCachedLeads(params: { 
  search?: string, 
  status?: string, 
  page?: number,
  pageSize?: number 
}) {
  const context = await getAuthContext();
  if (!context) return { leads: [], totalCount: 0 };

  const { workspaceId, role } = context;
  const showFinancials = canViewFinancials(role);
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const cacheKey = `leads-list-${workspaceId}-${role}-${params.search || "none"}-${params.status || "all"}-${page}`;

  return unstable_cache(
    async () => {
      const where = {
        workspaceId,
        ...(params.search && {
          OR: [
            { companyName: { contains: params.search, mode: "insensitive" } },
            { contactPerson: { contains: params.search, mode: "insensitive" } },
            { email: { contains: params.search, mode: "insensitive" } }
          ]
        }),
        ...(params.status && { status: params.status as LeadStatus })
      };

      const [leads, totalCount] = await Promise.all([
        prisma.lead.findMany({
          where,
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
            phone: true,
            status: true,
            potentialValue: showFinancials,
            createdAt: true,
            assignee: {
              select: { id: true, name: true, email: true, image: true }
            }
          },
          orderBy: { createdAt: "desc" },
          take: pageSize,
          skip,
          cacheStrategy: { ttl: 60, swr: 60 }
        }),
        prisma.lead.count({ where })
      ]);

      return { leads, totalCount };
    },
    [cacheKey],
    {
      revalidate: 60,
      tags: ["leads", `workspace-${workspaceId}`]
    }
  )();
}

/**
 * Fetches a single lead by ID with caching.
 */
export async function getCachedLeadById(id: string) {
  const context = await getAuthContext();
  if (!context) return null;

  const { workspaceId, role } = context;
  const showFinancials = canViewFinancials(role);

  return unstable_cache(
    async () => {
      const lead = await prisma.lead.findUnique({
        where: { id, workspaceId },
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          email: true,
          phone: true,
          source: true,
          status: true,
          potentialValue: showFinancials,
          notes: true,
          assigneeId: true,
          assignee: {
            select: { id: true, name: true, email: true, image: true }
          },
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
            orderBy: { createdAt: "desc" }
          },
          createdAt: true,
          updatedAt: true
        },
        cacheStrategy: { ttl: 30, swr: 30 }
      });

      return lead;
    },
    [`lead-detail-${id}-${role}`],
    {
      revalidate: 60,
      tags: [`lead-${id}`, "leads"]
    }
  )();
}

/**
 * Fetches users in the current workspace for assignments.
 */
export async function getCachedWorkspaceUsers() {
  const context = await getAuthContext();
  if (!context) return [];

  const { workspaceId } = context;

  return unstable_cache(
    async () => {
      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        select: {
          user: {
            select: { id: true, name: true, email: true, image: true }
          }
        },
        cacheStrategy: { ttl: 300, swr: 600 }
      });

      return members.map(m => m.user);
    },
    [`workspace-users-${workspaceId}`],
    {
      revalidate: 3600,
      tags: [`workspace-${workspaceId}-users`, "users"]
    }
  )();
}
