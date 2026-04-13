import { LeadStatus } from "@prisma/client";
import { z } from "zod";

export const leadSchema = z.object({
  companyName: z.string().min(1, "Nazwa firmy jest wymagana"),
  contactPerson: z.string().min(1, "Osoba kontaktowa jest wymagana"),
  email: z.string().email("Niepoprawny format email").nullable(),
  phone: z.string().nullable(),
  source: z.string().nullable(),
  status: z.nativeEnum(LeadStatus),
  potentialValue: z.number().nullable(),
  notes: z.string().nullable(),
  assigneeId: z.string().nullable(),
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
