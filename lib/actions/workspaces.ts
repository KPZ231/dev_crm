"use server";

import { requireAuth } from "@/core/access/workspace";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createWorkspaceAction(formData: FormData) {
  const user = await requireAuth();

  const name = formData.get("name") as string;
  if (!name || name.trim() === "") {
    return { error: "Nazwa przestrzeni roboczej jest wymagana." };
  }

  // Basic slug generation
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const uniqueSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const slug = `${baseSlug}-${uniqueSuffix}`;

  try {
    const workspace = await prisma.$transaction(async (tx) => {
      // 1. Create Workspace
      const newWs = await tx.workspace.create({
        data: {
          name,
          slug,
        },
      });

      // 2. Add current user as OWNER
      await tx.workspaceMember.create({
        data: {
          workspaceId: newWs.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      // 3. Create Audit Log
      await tx.auditLog.create({
        data: {
          workspaceId: newWs.id,
          actorId: user.id,
          action: "workspace.created",
          entityType: "Workspace",
          entityId: newWs.id,
          metadata: { name: newWs.name, slug: newWs.slug },
        },
      });

      return newWs;
    });

    revalidatePath("/dashboard");
    return { success: true, workspaceId: workspace.id };
  } catch (error) {
    console.error("[CREATE_WORKSPACE_ERROR]", error);
      return { error: "Wystąpił błąd podczas tworzenia przestrzeni roboczej." };
    }
  }

export async function updateWorkspaceAction(workspaceId: string, data: { name: string; logoUrl?: string }) {
  const user = await requireAuth();

  // Check if user is OWNER or ADMIN
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return { error: "Brak wystarczających uprawnień." };
  }

  if (!data.name || data.name.trim() === "") {
    return { error: "Nazwa jest wymagana." };
  }

  try {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: data.name,
        logoUrl: data.logoUrl,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: user.id,
        action: "workspace.updated",
        entityType: "Workspace",
        entityId: workspaceId,
        metadata: { name: data.name },
      },
    });

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_WORKSPACE_ERROR]", error);
    return { error: "Wystąpił błąd podczas aktualizacji danych firmy." };
  }
}
