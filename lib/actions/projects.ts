"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createProjectSchema, updateProjectSchema, addProjectMemberSchema, createMilestoneSchema, updateMilestoneSchema } from "@/lib/schemas/project";
import { z } from "zod";

import { WorkspaceRole } from "@prisma/client";

async function getSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });
  
  if (!member) {
    throw new Error("No active workspace found for user");
  }
  
  return { userId: session.user.id, workspaceId: member.workspaceId, role: member.role };
}

// TODO: Add robust RBAC via a separate helper
async function checkManageProjectsPermission(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } }
  });
  if (!member || !["OWNER", "ADMIN", "PM"].includes(member.role)) {
    throw new Error("Forbidden: Missing permissions");
  }
}

export async function getProjects() {
  try {
    const { workspaceId, userId } = await getSession();
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });
    
    // Developer can only see projects they are assigned to
    const isDeveloper = member?.role === "DEVELOPER";
    
    let whereClause: any = { workspaceId };
    
    if (isDeveloper) {
      whereClause.members = {
        some: { userId: userId }
      };
    }

    const prismaProjects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: { select: { id: true, companyName: true } },
        members: { include: { user: { select: { id: true, name: true, image: true } } } },
        _count: { select: { tasks: true, milestones: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const projects = prismaProjects.map(p => ({
      ...p,
      budget: p.budget ? Number(p.budget) : null
    }));

    return { success: true, projects };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProjectById(id: string) {
  try {
    const { workspaceId } = await getSession();
    const prismaProject = await prisma.project.findFirst({
      where: { id, workspaceId },
      include: {
        client: true,
        creator: true,
        members: { include: { user: true } },
        milestones: { orderBy: { targetDate: 'asc' } },
        tasks: { include: { assignee: true }, orderBy: { position: 'asc' } },
        invoices: { include: { invoice: true } },
      }
    });

    if (!prismaProject) throw new Error("Project not found");

    const project = {
      ...prismaProject,
      budget: prismaProject.budget ? Number(prismaProject.budget) : null,
      invoices: prismaProject.invoices.map(inv => ({
          ...inv,
          amount: Number(inv.amount)
      }))
    };
    return { success: true, project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createProject(data: z.infer<typeof createProjectSchema>) {
  try {
    const { workspaceId, userId } = await getSession();
    await checkManageProjectsPermission(workspaceId, userId);
    
    const validatedData = createProjectSchema.parse(data);
    
    const prismaProject = await prisma.project.create({
      data: {
        ...validatedData,
        workspaceId,
        createdBy: userId,
        members: {
          create: {
            userId: userId,
            role: "OWNER"
          }
        }
      }
    });

    const project = {
        ...prismaProject,
        budget: prismaProject.budget ? Number(prismaProject.budget) : null
    };

    revalidatePath("/projects");
    return { success: true, project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProject(id: string, data: Partial<z.infer<typeof createProjectSchema>>) {
  try {
    const { workspaceId, userId } = await getSession();
    await checkManageProjectsPermission(workspaceId, userId);
    
    const prismaProject = await prisma.project.update({
      where: { id, workspaceId },
      data
    });

    const project = {
        ...prismaProject,
        budget: prismaProject.budget ? Number(prismaProject.budget) : null
    };

    revalidatePath(`/projects/${id}`);
    revalidatePath("/projects");
    return { success: true, project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: string) {
  try {
    const { workspaceId, userId } = await getSession();
    await checkManageProjectsPermission(workspaceId, userId);
    
    await prisma.project.delete({
      where: { id, workspaceId }
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Milestone Management
export async function createMilestone(data: z.infer<typeof createMilestoneSchema>) {
  try {
    const { workspaceId } = await getSession();
    const validatedData = createMilestoneSchema.parse(data);
    
    await prisma.projectMilestone.create({
      data: validatedData
    });
    
    revalidatePath(`/projects/${validatedData.projectId}/timeline`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMilestone(id: string, data: z.infer<typeof updateMilestoneSchema>) {
  try {
    const { workspaceId } = await getSession();
    const validatedData = updateMilestoneSchema.parse(data);
    
    const updateData: any = { ...validatedData };
    if (updateData.completed) {
      updateData.completedAt = new Date();
    } else if (updateData.completed === false) {
      updateData.completedAt = null;
    }
    delete updateData.id;

    const milestone = await prisma.projectMilestone.update({
      where: { id },
      data: updateData
    });

    revalidatePath(`/projects/${milestone.projectId}/timeline`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Team Management
export async function addProjectMember(data: z.infer<typeof addProjectMemberSchema>) {
  try {
    const { workspaceId, userId: currentUser } = await getSession();
    await checkManageProjectsPermission(workspaceId, currentUser);
    const validatedData = addProjectMemberSchema.parse(data);
    
    await prisma.projectMember.create({
      data: validatedData
    });
    
    revalidatePath(`/projects/${validatedData.projectId}/team`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeProjectMember(projectId: string, userId: string) {
  try {
    const { workspaceId, userId: currentUser } = await getSession();
    await checkManageProjectsPermission(workspaceId, currentUser);
    
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } }
    });
    
    revalidatePath(`/projects/${projectId}/team`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
