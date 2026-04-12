import { Lead, LeadActivity, User, LeadStatus } from "@prisma/client";

export type LeadWithAssignee = Lead & {
  assignee: Pick<User, "id" | "name" | "email" | "image"> | null;
};

export type LeadWithDetails = LeadWithAssignee & {
  activities: (LeadActivity & {
    actor: Pick<User, "id" | "name" | "email" | "image">;
  })[];
};

export type LeadFilters = {
  search?: string;
  status?: LeadStatus;
  assigneeId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
