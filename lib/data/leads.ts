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

  const searchKey = params.search?.trim().toLowerCase() || "all";
  const statusKey = params.status || "all";

  return unstable_cache(
    async () => {
      const where = {
        workspaceId,
        ...(params.search && {
          OR: [
            { companyName: { contains: params.search, mode: "insensitive" as const } },
            { contactPerson: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } }
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
          skip
        }),
        prisma.lead.count({ where })
      ]);

      return { leads, totalCount };
    },
    ["leads-list", workspaceId, role, searchKey, statusKey, page.toString()],
    {
      revalidate: 60,
      tags: ["leads", `workspace-${workspaceId}`]
    }
  )();
}

/**
 * Detailed structure for a lead in detail views.
 */
export interface CachedLead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  potentialValue: number | null;
  notes: string | null;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  activities: {
    id: string;
    action: string;
    content: string | null;
    createdAt: Date;
    actor: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
}

/**
 * Fetches a single lead by ID with caching.
 */
export async function getCachedLeadById(id: string): Promise<CachedLead | null> {
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
          potentialValue: true,
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

      if (!lead) return null;

      return {
        ...lead,
        potentialValue: showFinancials ? (lead.potentialValue ? Number(lead.potentialValue) : null) : null,
      } as unknown as CachedLead;
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
