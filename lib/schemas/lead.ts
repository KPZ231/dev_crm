import { LeadStatus } from "@prisma/client";
import { z } from "zod";

export const leadSchema = z.object({
  companyName: z.string().min(1, "Nazwa firmy jest wymagana"),
  contactPerson: z.string().min(1, "Osoba kontaktowa jest wymagana"),
  email: z.string().email("Niepoprawny format email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  potentialValue: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().or(z.literal("")),
  assigneeId: z.string().optional().or(z.literal("")).nullable(),
});

export const createLeadSchema = leadSchema;
export const updateLeadSchema = leadSchema.partial().extend({
  id: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const leadActivitySchema = z.object({
  action: z.string().min(1),
  content: z.string().optional().nullable(),
});

export const addLeadActivitySchema = leadActivitySchema;
export type AddLeadActivityInput = z.infer<typeof addLeadActivitySchema>;
