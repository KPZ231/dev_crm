import { Client, ClientActivity, User, Project, Invoice, Document, ClientStatus, PaymentStatus } from "@prisma/client";

export type ClientWithBasicInfo = Client;

export type ClientWithStats = Client & {
  _count: {
    projects: number;
    invoices: number;
    documents: number;
  };
  totalRevenue?: number;
  activeProjectsCount?: number;
  outstandingInvoicesCount?: number;
};

export type ClientWithDetails = Client & {
  activities: (ClientActivity & {
    actor: Pick<User, "id" | "name" | "email" | "image">;
  })[];
  projects: Project[];
  invoices: Invoice[];
  documents: Document[];
};

export type ClientFilters = {
  search?: string;
  status?: ClientStatus;
  paymentStatus?: PaymentStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type ClientStats = {
  totalRevenue: number;
  activeProjects: number;
  outstandingInvoices: number;
};
