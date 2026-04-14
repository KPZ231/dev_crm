import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unstable_cache } from "next/cache";

/**
 * Fetches workspace context and ensures user has admin/owner role.
 */
async function getAdminContext() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true, role: true }
  });

  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) return null;

  return member;
}

/**
 * Optimized fetcher for workspace members with role-based visibility.
 */
export async function getCachedWorkspaceMembers(workspaceId: string) {
  const context = await getAdminContext();
  if (!context) return [];

  return unstable_cache(
    async () => {
      return prisma.workspaceMember.findMany({
        where: { workspaceId },
        select: {
          id: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    },
    [`workspace-members-${workspaceId}`],
    {
      revalidate: 60,
      tags: ["members", `workspace-${workspaceId}`]
    }
  )();
}

/**
 * Optimized fetcher for workspace invitations.
 */
export async function getCachedInvitations(workspaceId: string) {
  const context = await getAdminContext();
  if (!context) return [];

  return unstable_cache(
    async () => {
      return prisma.invitation.findMany({
        where: { 
          workspaceId,
          acceptedAt: null,
          expiresAt: { gt: new Date() }
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          invitedBy: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: "desc" },
      });
    },
    [`workspace-invitations-${workspaceId}`],
    {
      revalidate: 60,
      tags: ["invitations", `workspace-${workspaceId}`]
    }
  )();
}
