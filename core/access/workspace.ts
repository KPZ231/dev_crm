import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission, ActionType, ResourceType } from "./permissions";
import { WorkspaceRole } from "@prisma/client";

/**
 * Checks if the current request has an authenticated session.
 * Throws if unauthorized, protecting business logic from unauthenticated execution.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/**
 * Fetches the user's role in a specific workspace.
 * Uses caching mechanically inside React if requested properly.
 */
export async function getUserWorkspaceRole(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        userId,
        workspaceId,
      },
    },
    select: { role: true },
  });

  return membership?.role || null;
}

/**
 * Core protection method for any API route or Server Action interacting with domain resources.
 * Validates session, extracts workspace role, and enforces permission.
 */
export async function requireWorkspacePermission(
  workspaceId: string,
  action: ActionType,
  resource: ResourceType
) {
  const user = await requireAuth();
  
  const role = await getUserWorkspaceRole(user.id, workspaceId);
  if (!role) {
    throw new Error("Forbidden: You are not a member of this workspace.");
  }

  const isAllowed = hasPermission(role, action, resource);
  if (!isAllowed) {
    throw new Error(`Forbidden: You do not have permission to ${action} ${resource}.`);
  }

  // Returning role and user allows the caller to avoid re-querying
  return { user, role };
}
