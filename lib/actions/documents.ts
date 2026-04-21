"use server";

import { prisma } from "@/lib/prisma";
import { requireWorkspacePermission } from "@/core/access/workspace";
import { DocumentFilters, DocumentWithRelations, DocumentTemplateWithCount } from "@/lib/types/document";
import { documentSchema, templateSchema } from "@/lib/schemas/document";
import { fillTemplate } from "@/lib/document-generator";
import { DocumentType, DocumentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getDocuments(workspaceId: string, filters?: DocumentFilters, limit: number = 50, skip: number = 0): Promise<DocumentWithRelations[]> {
  await requireWorkspacePermission(workspaceId, "read", "document");

  const { type, status, clientId, leadId, projectId, search } = filters || {};

  return await prisma.document.findMany({
    where: {
      workspaceId,
      ...(type && { type }),
      ...(status && { status }),
      ...(clientId && { clientId }),
      ...(leadId && { leadId }),
      ...(projectId && { projectId }),
      ...(search && {
        name: { contains: search, mode: "insensitive" as const }
      })
    },
    include: {
      client: { select: { id: true, companyName: true, email: true, address: true, nip: true, phone: true } },
      lead: { select: { id: true, companyName: true, contactPerson: true, email: true, phone: true } },
      project: { select: { id: true, name: true } },
      template: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: skip
  });
}

export async function getDocumentById(workspaceId: string, id: string): Promise<DocumentWithRelations | null> {
  await requireWorkspacePermission(workspaceId, "read", "document");

  return await prisma.document.findUnique({
    where: { id, workspaceId },
    include: {
      client: { select: { id: true, companyName: true, email: true, address: true, nip: true, phone: true } },
      lead: { select: { id: true, companyName: true, contactPerson: true, email: true, phone: true } },
      project: { select: { id: true, name: true } },
      template: { select: { id: true, name: true } }
    }
  });
}

export async function createDocument(workspaceId: string, data: any) {
  const { role, user } = await requireWorkspacePermission(workspaceId, "create", "document");
  
  const validated = documentSchema.parse(data);

  // RBAC for Sales
  if (role === "SALES" && validated.type !== "OFFER") {
    throw new Error("Sales can only create Offer documents.");
  }

  const document = await prisma.document.create({
    data: {
      ...validated,
      workspaceId,
      variables: validated.variables || {},
      metadata: validated.metadata || {},
      design: validated.design || {}
    } as any
  });

  revalidatePath("/dashboard/documents");
  return document;
}


export async function generateDocumentFromTemplate(workspaceId: string, templateId: string, entityData: any) {
  await requireWorkspacePermission(workspaceId, "create", "document");

  const template = await prisma.documentTemplate.findUnique({
    where: { id: templateId, workspaceId }
  });

  if (!template) throw new Error("Template not found");

  const filledContent = fillTemplate(template.content, entityData);

  return {
    content: filledContent,
    design: template.design,
    type: template.type,
    name: `${template.name} - ${entityData.companyName || "Draft"}`
  };
}

export async function updateDocumentStatus(workspaceId: string, id: string, status: DocumentStatus) {
  await requireWorkspacePermission(workspaceId, "update", "document");

  const document = await prisma.document.update({
    where: { id, workspaceId },
    data: { status }
  });

  revalidatePath(`/documents/${id}`);
  revalidatePath("/dashboard/documents");
  return document;
}

export async function createShareLink(workspaceId: string, id: string, level: "VIEW" | "EDIT") {
  await requireWorkspacePermission(workspaceId, "update", "document");

  const shareToken = crypto.randomUUID();
  
  const document = await prisma.document.update({
    where: { id, workspaceId },
    data: { 
      shareToken,
      shareLevel: level
    }
  });

  revalidatePath(`/dashboard/documents/${id}`);
  return { shareToken, shareLevel: level };
}

export async function getDocumentByShareToken(token: string) {
  const document = await prisma.document.findUnique({
    where: { shareToken: token },
    include: {
      client: { select: { id: true, companyName: true, email: true, address: true, nip: true, phone: true } },
      lead: { select: { id: true, companyName: true, contactPerson: true, email: true, phone: true } },
      project: { select: { id: true, name: true } },
    }
  });

  return document;
}

export async function updateSharedDocumentByToken(token: string, data: any) {
  const document = await prisma.document.findUnique({
    where: { shareToken: token }
  });

  if (!document) {
      throw new Error("Document not found");
  }

  if (document.shareLevel !== "EDIT") {
      throw new Error("Unauthorized to edit this document.");
  }

  const validated = documentSchema.partial().parse(data);

  const updateData: any = { ...validated };
  if (validated.variables) updateData.variables = validated.variables;
  if (validated.metadata) updateData.metadata = validated.metadata;
  if (validated.design) updateData.design = validated.design;

  const updatedDoc = await prisma.document.update({
    where: { id: document.id },
    data: updateData
  });

  revalidatePath(`/shared/${token}`);
  return updatedDoc;
}


export async function updateDocument(workspaceId: string, id: string, data: any) {
  await requireWorkspacePermission(workspaceId, "update", "document");
  
  const validated = documentSchema.partial().parse(data);

  // Prisma needs JSON fields to be compatible with its types
  const updateData: any = { ...validated };
  if (validated.variables) updateData.variables = validated.variables;
  if (validated.metadata) updateData.metadata = validated.metadata;
  if (validated.design) updateData.design = validated.design;

  const document = await prisma.document.update({
    where: { id, workspaceId },
    data: updateData
  });

  revalidatePath(`/dashboard/documents/${id}`);
  revalidatePath("/dashboard/documents");
  return document;
}


// Templates Actions
export async function getTemplates(workspaceId: string): Promise<DocumentTemplateWithCount[]> {
  await requireWorkspacePermission(workspaceId, "read", "document");

  return await prisma.documentTemplate.findMany({
    where: { workspaceId },
    include: {
      _count: { select: { documents: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getTemplateById(workspaceId: string, id: string) {
  await requireWorkspacePermission(workspaceId, "read", "document");

  return await prisma.documentTemplate.findUnique({
    where: { id, workspaceId }
  });
}

export async function createTemplate(workspaceId: string, data: any) {
  await requireWorkspacePermission(workspaceId, "update", "document");
  
  const validated = templateSchema.parse(data);

  const template = await prisma.documentTemplate.create({
    data: {
      ...validated,
      workspaceId
    }
  });

  revalidatePath("/dashboard/documents/templates");
  return template;
}

export async function updateTemplate(workspaceId: string, id: string, data: any) {
  await requireWorkspacePermission(workspaceId, "update", "document");
  
  const validated = templateSchema.partial().parse(data);

  const template = await prisma.documentTemplate.update({
    where: { id, workspaceId },
    data: validated
  });

  revalidatePath(`/dashboard/documents/templates/${id}`);
  revalidatePath("/dashboard/documents/templates");
  return template;
}

export async function deleteTemplate(workspaceId: string, id: string) {
  await requireWorkspacePermission(workspaceId, "delete", "document");
  
  await prisma.documentTemplate.delete({
    where: { id, workspaceId }
  });

  revalidatePath("/dashboard/documents/templates");
  return { success: true };
}
