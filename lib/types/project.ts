import {
  Project,
  ProjectMember,
  ProjectMilestone,
  Task,
  Invoice,
  Document,
  Cost,
  Client,
  User,
  ProjectInvoice,
  ProjectStatus,
  BudgetType,
  ProjectRole
} from "@prisma/client";

export type ProjectWithRelations = Project & {
  client: Client | null;
  creator: User;
  members: (ProjectMember & { user: User })[];
  milestones: ProjectMilestone[];
  tasks?: Task[];
  documents?: Document[];
  costs?: Cost[];
  invoices?: (ProjectInvoice & { invoice: Invoice })[];
  _count?: {
    tasks: number;
    documents: number;
    costs: number;
  };
};

export type ProjectSummary = Project & {
  client: Pick<Client, "id" | "companyName"> | null;
  members: (ProjectMember & { user: Pick<User, "id" | "name" | "image"> })[];
  _count: {
    tasks: number;
    milestones: number;
  };
  progress: number; // calculated progress
};
