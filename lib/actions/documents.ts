"use server";

import { prisma } from "@/lib/prisma";
import { requireWorkspacePermission } from "@/core/access/workspace";
import { DocumentFilters, DocumentWithRelations, DocumentTemplateWithCount } from "@/lib/types/document";
import { documentSchema, templateSchema } from "@/lib/schemas/document";
import { fillTemplate } from "@/lib/document-generator";
import { DocumentType, DocumentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getDocuments(workspaceId: string, filters?: DocumentFilters): Promise<DocumentWithRelations[]> {
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
      client: { select: { id: true, companyName: true, email: true, address: true, nip: true } },
      lead: { select: { id: true, companyName: true, contactPerson: true, email: true } },
      project: { select: { id: true, name: true } },
      template: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getDocumentById(workspaceId: string, id: string): Promise<DocumentWithRelations | null> {
  await requireWorkspacePermission(workspaceId, "read", "document");

  return await prisma.document.findUnique({
    where: { id, workspaceId },
    include: {
      client: { select: { id: true, companyName: true, email: true, address: true, nip: true } },
      lead: { select: { id: true, companyName: true, contactPerson: true, email: true } },
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
      workspaceId
    }
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

export async function updateDocument(workspaceId: string, id: string, data: any) {
  await requireWorkspacePermission(workspaceId, "update", "document");
  
  const validated = documentSchema.partial().parse(data);

  const document = await prisma.document.update({
    where: { id, workspaceId },
    data: validated
  });

  revalidatePath(`/documents/${id}`);
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

export async function exportDocumentToPdf(workspaceId: string, id: string) {
    // This is a stub for server-side PDF generation
    // In a real app, use puppeteer or a service to generate PDF from HTML/Content
    await requireWorkspacePermission(workspaceId, "read", "document");
    
    // Logic here would generate the PDF and return a URL or signed S3 link
    return { url: `/api/documents/${id}/pdf` }; 
}
