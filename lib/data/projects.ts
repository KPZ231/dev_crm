import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unstable_cache } from "next/cache";

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

  return { userId: session.user.id, workspaceId: member.workspaceId, role: member.role };
}

/**
 * Fetches projects with caching, filtered by role permissions.
 */
export async function getCachedProjects() {
  const context = await getAuthContext();
  if (!context) return [];

  const { userId, workspaceId, role } = context;

  return unstable_cache(
    async () => {
      // Developer can only see projects they are assigned to
      const isDeveloper = role === "DEVELOPER";
      
      const where = {
        workspaceId,
        ...(isDeveloper && {
          members: { some: { userId } }
        })
      };

      const projects = await prisma.project.findMany({
        where,
        select: {
          id: true,
          name: true,
          status: true,
          budget: true,
          startDate: true,
          endDate: true,
          client: { select: { id: true, companyName: true } },
          members: {
            select: {
              role: true,
              user: { select: { id: true, name: true, image: true } }
            }
          },
          _count: { select: { tasks: true, milestones: true } },
          updatedAt: true
        },
        orderBy: { updatedAt: "desc" },
        cacheStrategy: { ttl: 60, swr: 60 }
      });

      return projects.map(p => ({
        ...p,
        budget: p.budget ? Number(p.budget) : null
      }));
    },
    [`projects-list-${workspaceId}-${role}-${userId}`],
    {
      revalidate: 60,
      tags: ["projects", `workspace-${workspaceId}`]
    }
  )();
}

/**
 * Fetches project details by ID with caching.
 */
export async function getCachedProjectById(id: string) {
  const context = await getAuthContext();
  if (!context) return null;

  const { workspaceId, userId, role } = context;

  return unstable_cache(
    async () => {
      const isDeveloper = role === "DEVELOPER";

      const project = await prisma.project.findFirst({
        where: { 
          id, 
          workspaceId,
          ...(isDeveloper && { members: { some: { userId } } })
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          budget: true,
          budgetType: true,
          startDate: true,
          endDate: true,
          client: true,
          creator: { select: { id: true, name: true, image: true } },
          members: {
            select: {
              role: true,
              user: { select: { id: true, name: true, image: true } }
            }
          },
          milestones: { 
            select: { id: true, name: true, targetDate: true, completed: true },
            orderBy: { targetDate: 'asc' } 
          },
          tasks: { 
            select: { id: true, title: true, status: true, priority: true, assignee: { select: { name: true, image: true } } },
            orderBy: { position: 'asc' } 
          },
          invoices: { 
            select: { 
              amount: true,
              invoice: { select: { id: true, number: true, status: true, dueDate: true } } 
            } 
          },
          createdAt: true,
          updatedAt: true
        },
        cacheStrategy: { ttl: 30, swr: 30 }
      });

      if (!project) return null;

      const projectData = project as any;

      return {
        ...project,
        budget: project.budget ? Number(project.budget) : null,
        invoices: (projectData.invoices as any[]).map((inv: any) => ({
          ...inv,
          amount: Number(inv.amount)
        }))
      };
    },
    [`project-detail-${id}-${userId}-${role}`],
    {
      revalidate: 60,
      tags: [`project-${id}`, "projects"]
    }
  )();
}
