"use server";

import * as z from "zod";
import { CreateWorkspaceSchema } from "../schemas";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/core/access/workspace";
import { createAuditLog } from "@/core/logger/audit";

export const createWorkspaceAction = async (values: z.infer<typeof CreateWorkspaceSchema>) => {
  const validatedFields = CreateWorkspaceSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Nieprawidłowe dane workspace'a." };
  }

  const { name, slug } = validatedFields.data;

  try {
    const user = await requireAuth();

    // Check if slug is taken
    const existing = await prisma.workspace.findUnique({
      where: { slug }
    });

    if (existing) {
      return { error: "Ten slug jest już zajęty." };
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        // The creator automatically becomes the OWNER
        members: {
          create: {
            userId: user.id,
            role: "OWNER", 
          }
        }
      }
    });

    await createAuditLog({
      action: "workspace.created",
      entityType: "Workspace",
      entityId: workspace.id,
      workspaceId: workspace.id,
      actorId: user.id,
      metadata: { name, slug }
    });

    return { success: "Workspace został pomyślnie utworzony!", workspace };
  } catch (error) {
    console.error("[WORKSPACE_CREATE_ERROR]", error);
    return { error: "Wystąpił błąd podczas tworzenia workspace'a." };
  }
}
