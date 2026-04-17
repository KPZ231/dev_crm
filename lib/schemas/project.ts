import { z } from "zod";
import { ProjectStatus, BudgetType, ProjectRole } from "@prisma/client";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Nazwa projektu jest wymagana"),
  clientId: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
  description: z.string().optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
  status: z.nativeEnum(ProjectStatus),
  budget: z.coerce.number().optional().nullable(),
  budgetType: z.nativeEnum(BudgetType).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.extend({
  id: z.string(),
});

export const addProjectMemberSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  role: z.nativeEnum(ProjectRole),
});

export const createMilestoneSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1, "Nazwa kamienia milowego jest wymagana"),
  description: z.string().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),
});

export const updateMilestoneSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  targetDate: z.coerce.date().nullable(),
  completed: z.boolean().nullable(),
});
