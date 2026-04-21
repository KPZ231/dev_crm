import { z } from "zod";
import { DocumentType, DocumentStatus } from "@prisma/client";

export const documentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.nativeEnum(DocumentType),
  status: z.nativeEnum(DocumentStatus).default(DocumentStatus.DRAFT),
  clientId: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  variables: z.record(z.any()).optional().nullable(),
  metadata: z.object({
    city: z.string().optional(),
    date: z.string().optional(),
    footer: z.string().optional(),
  }).optional().nullable(),
  design: z.object({
    primaryColor: z.string().optional(),
    textColor: z.string().optional(),
    logoUrl: z.string().optional(),
    signatureData: z.string().optional(),
    fontFamily: z.string().optional(),
  }).optional(),
  shareToken: z.string().optional().nullable(),
  shareLevel: z.enum(["VIEW", "EDIT"]).optional().nullable(),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;

export const templateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.nativeEnum(DocumentType),
  content: z.string().min(10, "Template content must be at least 10 characters"),
  design: z.object({
    primaryColor: z.string().optional(),
    textColor: z.string().optional(),
    logoUrl: z.string().regex(/^data:image\/(png|jpeg|x-icon);base64,/, "Invalid image format").optional().or(z.string().url()).optional(),
    signatureData: z.string().optional(),
    fontFamily: z.string().optional(),
  }).optional(),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;
