import { Document, DocumentTemplate, DocumentType, DocumentStatus, Client, Lead, Project } from "@prisma/client";

export type DocumentWithRelations = Document & {
  client?: Pick<Client, "id" | "companyName" | "email" | "address" | "nip"> | null;
  lead?: Pick<Lead, "id" | "companyName" | "contactPerson" | "email"> | null;
  project?: Pick<Project, "id" | "name"> | null;
  template?: Pick<DocumentTemplate, "id" | "name"> | null;
};

export type DocumentTemplateWithCount = DocumentTemplate & {
  _count?: { documents: number };
};

export type DocumentFilters = {
  type?: DocumentType;
  status?: DocumentStatus;
  clientId?: string;
  leadId?: string;
  projectId?: string;
  search?: string;
};
