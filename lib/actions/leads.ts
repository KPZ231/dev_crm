"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { 
  createLeadSchema, 
  updateLeadSchema, 
  addLeadActivitySchema,
  CreateLeadInput,
  UpdateLeadInput,
  AddLeadActivityInput
} from "../schemas/lead";
import { canManageLeads, canDeleteLeads, canViewFinancials } from "../permissions";
import { WorkspaceRole } from "@prisma/client";

// Utility to get current workspace and role context
async function getWorkspaceContext(required: true): Promise<{ userId: string; workspaceId: string; role: WorkspaceRole }>;
async function getWorkspaceContext(required: false): Promise<{ userId: string; workspaceId: string; role: WorkspaceRole } | null>;
async function getWorkspaceContext(required = true) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!member) {
    if (required) throw new Error("No active workspace found for user");
    return null;
  }

  return { userId: session.user.id, workspaceId: member.workspaceId, role: member.role };
}

export async function getLeads(params: { search?: string, status?: string }) {
  const { workspaceId, role } = await getWorkspaceContext(true);
  
  const leads = await prisma.lead.findMany({
    where: {
      workspaceId,
      ...(params.search && {
        OR: [
          { companyName: { contains: params.search, mode: "insensitive" } },
          { contactPerson: { contains: params.search, mode: "insensitive" } },
          { email: { contains: params.search, mode: "insensitive" } }
        ]
      }),
      ...(params.status && { status: params.status as any })
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true, image: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Scrub potentialValue for DEVELOPER
  const showFinancials = canViewFinancials(role);
  if (!showFinancials) {
    return leads.map(lead => ({ ...lead, potentialValue: null }));
  }

  return leads;
}

export async function getLeadById(id: string) {
  const { workspaceId, role } = await getWorkspaceContext(true);

  const lead = await prisma.lead.findUnique({
    where: { id, workspaceId },
    include: {
      assignee: {
        select: { id: true, name: true, email: true, image: true }
      },
      activities: {
        include: {
          actor: { select: { id: true, name: true, email: true, image: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!lead) return null;

  // Scrub potentialValue for DEVELOPER
  if (!canViewFinancials(role)) {
    lead.potentialValue = null;
  }

  return lead;
}

export async function createLead(data: CreateLeadInput) {
  const { userId, workspaceId, role } = await getWorkspaceContext(true);

  if (!canManageLeads(role)) {
    throw new Error("Forbidden: You don't have permission to manage leads.");
  }

  const parsed = createLeadSchema.parse(data);

  const lead = await prisma.lead.create({
    data: {
      companyName: parsed.companyName,
      contactPerson: parsed.contactPerson,
      email: parsed.email,
      phone: parsed.phone,
      source: parsed.source,
      status: parsed.status,
      potentialValue: parsed.potentialValue,
      notes: parsed.notes,
      assigneeId: parsed.assigneeId || null,
      workspaceId
    }
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      actorId: userId,
      action: "CREATED",
      content: "Lead created"
    }
  });

  await prisma.auditLog.create({
    data: {
      workspaceId,
      actorId: userId,
      action: "lead.created",
      entityType: "Lead",
      entityId: lead.id,
      metadata: { source: parsed.source }
    }
  });

  revalidateTag("leads");
  revalidateTag("stats");
  revalidateTag(`workspace-${workspaceId}`);
  revalidatePath("/dashboard/leads");
  return lead;
}

export async function updateLead(id: string, data: UpdateLeadInput) {
  const { userId, workspaceId, role } = await getWorkspaceContext(true);

  if (!canManageLeads(role)) {
    throw new Error("Forbidden: You don't have permission to manage leads.");
  }

  const parsed = updateLeadSchema.parse(data);

  const existing = await prisma.lead.findUnique({ where: { id, workspaceId } });
  if (!existing) throw new Error("Lead not found or unauthorized.");

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...parsed,
      id: undefined // prevent id update
    }
  });

  await prisma.auditLog.create({
    data: {
      workspaceId,
      actorId: userId,
      action: "lead.updated",
      entityType: "Lead",
      entityId: lead.id,
      metadata: { changedFields: Object.keys(parsed) }
    }
  });

  revalidateTag("leads");
  revalidateTag(`lead-${id}`);
  revalidateTag(`workspace-${workspaceId}`);
  revalidatePath(`/dashboard/leads`);
  revalidatePath(`/dashboard/leads/${id}`);
  return lead;
}

export async function deleteLead(id: string) {
  const { userId, workspaceId, role } = await getWorkspaceContext(true);

  if (!canDeleteLeads(role)) {
    throw new Error("Forbidden: Only OWNER or ADMIN can delete leads.");
  }

  const existing = await prisma.lead.findUnique({ where: { id, workspaceId } });
  if (!existing) throw new Error("Lead not found or unauthorized.");

  await prisma.lead.delete({
    where: { id }
  });

  await prisma.auditLog.create({
    data: {
      workspaceId,
      actorId: userId,
      action: "lead.deleted",
      entityType: "Lead",
      entityId: id
    }
  });

  revalidateTag("leads");
  revalidateTag("stats");
  revalidateTag(`workspace-${workspaceId}`);
  revalidateTag(`lead-${id}`);
  revalidatePath("/dashboard/leads");
}

export async function addLeadActivity(leadId: string, data: AddLeadActivityInput) {
  const { userId, workspaceId } = await getWorkspaceContext(true);

  const parsed = addLeadActivitySchema.parse(data);

  const existing = await prisma.lead.findUnique({ where: { id: leadId, workspaceId } });
  if (!existing) throw new Error("Lead not found or unauthorized.");

  const activity = await prisma.leadActivity.create({
    data: {
      leadId,
      actorId: userId,
      action: parsed.action,
      content: parsed.content
    }
  });

  revalidateTag(`lead-${leadId}`);
  revalidatePath(`/dashboard/leads/${leadId}`);
  return activity;
}

export async function getWorkspaceUsers() {
  const { workspaceId } = await getWorkspaceContext(true);

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true }
      }
    }
  });

  return members.map(m => m.user);
}

export async function getDashboardStats() {
  const context = await getWorkspaceContext(false);
  if (!context) return null;

  const { workspaceId, role } = context;
  const showFinancials = canViewFinancials(role);

  const [totalLeads, newLeads, totalPotentialValue, recentLeads] = await Promise.all([
    prisma.lead.count({ where: { workspaceId } }),
    prisma.lead.count({ 
      where: { 
        workspaceId, 
        createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } 
      } 
    }),
    showFinancials 
      ? prisma.lead.aggregate({ 
          where: { workspaceId }, 
          _sum: { potentialValue: true } 
        })
      : Promise.resolve({ _sum: { potentialValue: 0 } }),
    prisma.lead.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        assignee: { select: { id: true, name: true, email: true, image: true } }
      }
    })
  ]);

  return {
    totalLeads,
    newLeads,
    totalPotentialValue: totalPotentialValue._sum instanceof Object ? (totalPotentialValue._sum.potentialValue || 0) : 0,
    recentLeads: showFinancials ? recentLeads : recentLeads.map((l: any) => ({ ...l, potentialValue: null })),
    showFinancials
  };
}
