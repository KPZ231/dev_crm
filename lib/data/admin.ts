import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { WorkspaceRole } from "@prisma/client";

/**
 * Shared Interfaces to ensure UI compatibility and strict typing.
 */
export interface WorkspaceMemberCached {
  id: string;
  role: WorkspaceRole;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface InvitationCached {
  id: string;
  email: string;
  role: WorkspaceRole;
  createdAt: Date;
  invitedBy: {
    name: string | null;
    email: string;
  };
}

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
export async function getCachedWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberCached[]> {
  const context = await getAdminContext();
  if (!context) return [];

  return unstable_cache(
    async () => {
      const members = await prisma.workspaceMember.findMany({
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
      return members as unknown as WorkspaceMemberCached[];
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
export async function getCachedInvitations(workspaceId: string): Promise<InvitationCached[]> {
  const context = await getAdminContext();
  if (!context) return [];

  return unstable_cache(
    async () => {
      const invitations = await prisma.invitation.findMany({
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
      return invitations as unknown as InvitationCached[];
    },
    [`workspace-invitations-${workspaceId}`],
    {
      revalidate: 60,
      tags: ["invitations", `workspace-${workspaceId}`]
    }
  )();
}

