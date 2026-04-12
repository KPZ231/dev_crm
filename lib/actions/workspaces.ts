"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createWorkspaceAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Brak autoryzacji." };
  }

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
          userId: session.user.id,
          role: "OWNER",
        },
      });

      // 3. Create Audit Log
      await tx.auditLog.create({
        data: {
          workspaceId: newWs.id,
          actorId: session.user.id,
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
