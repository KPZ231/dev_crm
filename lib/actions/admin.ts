"use server";

import { prisma } from "@/lib/prisma";
import { requireWorkspacePermission, requireAuth } from "@/core/access/workspace";
import { inviteSchema, memberUpdateSchema } from "@/lib/schemas/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import crypto from "crypto";
import { WorkspaceRole } from "@prisma/client";

export async function getWorkspaceMembers(workspaceId: string) {
  await requireWorkspacePermission(workspaceId, "read", "member");

  return await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
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
}

export async function inviteUser(workspaceId: string, data: { email: string; role: WorkspaceRole }) {
  const { user } = await requireWorkspacePermission(workspaceId, "create", "member");
  
  const validated = inviteSchema.parse(data);

  // Check if user is already a member
  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      user: { email: validated.email },
    },
  });

  if (existingMember) {
    throw new Error("Użytkownik o tym adresie e-mail jest już członkiem tej przestrzeni.");
  }

  // Check if invitation already exists
  const existingInvite = await prisma.invitation.findUnique({
    where: {
      workspaceId_email: {
        workspaceId,
        email: validated.email,
      },
    },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  if (existingInvite) {
    // Update existing invitation
    await prisma.invitation.update({
      where: { id: existingInvite.id },
      data: {
        role: validated.role,
        token,
        expiresAt,
        invitedById: user.id,
        acceptedAt: null,
      },
    });
  } else {
    // Create new invitation
    await prisma.invitation.create({
      data: {
        workspaceId,
        email: validated.email,
        role: validated.role,
        token,
        invitedById: user.id,
        expiresAt,
      },
    });
  }

  // In a real app, send email here.
  // For now, we'll just return success.
  
  revalidateTag("members");
  revalidateTag("invitations");
  revalidateTag(`workspace-${workspaceId}`);
  revalidatePath(`/dashboard/admin`);
  return { success: true, token }; // Returning token for easy testing/manual sharing
}

export async function getInvitations(workspaceId: string) {
  await requireWorkspacePermission(workspaceId, "read", "member");

  return await prisma.invitation.findMany({
    where: { 
      workspaceId,
      acceptedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: {
      invitedBy: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function cancelInvitation(workspaceId: string, invitationId: string) {
  await requireWorkspacePermission(workspaceId, "delete", "member");

  await prisma.invitation.delete({
    where: { id: invitationId, workspaceId },
  });

  revalidateTag("invitations");
  revalidateTag(`workspace-${workspaceId}`);
  revalidatePath(`/dashboard/admin`);
  return { success: true };
}

export async function updateMemberRole(workspaceId: string, memberId: string, data: { role: WorkspaceRole }) {
  const { user: actor, role: actorRole } = await requireWorkspacePermission(workspaceId, "update", "member");
  
  const validated = memberUpdateSchema.parse(data);

  const memberToUpdate = await prisma.workspaceMember.findUnique({
    where: { id: memberId, workspaceId },
  });

  if (!memberToUpdate) {
    throw new Error("Członek nie został znaleziony.");
  }

  // Only OWNER can update roles to/from OWNER or ADMIN
  if (actorRole !== "OWNER" && (validated.role === "OWNER" || validated.role === "ADMIN" || memberToUpdate.role === "OWNER" || memberToUpdate.role === "ADMIN")) {
    throw new Error("Brak uprawnień do zmiany tej roli.");
  }

  // Prevent changing your own role if you are the last owner
  if (memberToUpdate.userId === actor.id && memberToUpdate.role === "OWNER" && validated.role !== "OWNER") {
    const ownerCount = await prisma.workspaceMember.count({
      where: { workspaceId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      throw new Error("Nie można zmienić roli ostatniego właściciela.");
    }
  }

  await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role: validated.role },
  });

  revalidateTag("members");
  revalidateTag(`workspace-${workspaceId}`);
  revalidatePath(`/dashboard/admin`);
  return { success: true };
}

export async function removeMember(workspaceId: string, memberId: string) {
  const { user: actor, role: actorRole } = await requireWorkspacePermission(workspaceId, "delete", "member");

  const memberToRemove = await prisma.workspaceMember.findUnique({
    where: { id: memberId, workspaceId },
  });

  if (!memberToRemove) {
    throw new Error("Członek nie został znaleziony.");
  }

  // Only OWNER can remove other owners or admins
  if (actorRole !== "OWNER" && (memberToRemove.role === "OWNER" || memberToRemove.role === "ADMIN")) {
    throw new Error("Brak uprawnień do usunięcia tego członka.");
  }

  // Prevent removing yourself if you are an OWNER (use a separate "leave workspace" if needed)
  if (memberToRemove.userId === actor.id) {
    throw new Error("Nie możesz usunąć samego siebie z tego panelu.");
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId },
  });

  revalidateTag("members");
  revalidateTag(`workspace-${workspaceId}`);
  revalidatePath(`/dashboard/admin`);
  return { success: true };
}

export async function acceptInvitation(token: string) {
  const user = await requireAuth();
  
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invitation) {
    throw new Error("Nieprawidłowy lub wygasły link do zaproszenia.");
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("Zaproszenie wygasło.");
  }

  if (invitation.acceptedAt) {
    throw new Error("To zaproszenie zostało już wykorzystane.");
  }

  // Check if user is already a member
  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: invitation.workspaceId,
      userId: user.id,
    },
  });

  if (existingMember) {
    // Just mark invite as accepted and move on
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });
    return { success: true, workspaceId: invitation.workspaceId };
  }

  // Transaction to add member and update invitation
  await prisma.$transaction(async (tx) => {
    await tx.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role,
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    // Audit log
    await tx.auditLog.create({
        data: {
          workspaceId: invitation.workspaceId,
          actorId: user.id,
          action: "member.joined",
          entityType: "WorkspaceMember",
          entityId: user.id,
          metadata: { email: user.email, role: invitation.role },
        },
      });
  });

  revalidateTag("members");
  revalidateTag("invitations");
  revalidateTag(`workspace-${invitation.workspaceId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");
  return { success: true, workspaceId: invitation.workspaceId };
}
