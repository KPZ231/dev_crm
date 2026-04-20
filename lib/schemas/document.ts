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
  content: z.any().optional(),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;

export const templateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.nativeEnum(DocumentType),
  content: z.string().min(10, "Template content must be at least 10 characters"),
  design: z.any().optional(),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;
